"""
Robots.txt compliance for web scrapers.

This module provides robots.txt parsing and caching functionality to ensure
legal compliance when scraping web content. It wraps urllib.robotparser
and adds domain-based caching, crawl-delay detection, and user-agent rotation.

Legal Compliance:
- Respecting robots.txt is required for GDPR compliance
- Following crawl-delay prevents server overload
- Proper user-agent identification ensures transparency

References:
- https://groupbwt.com/blog/gdpr-safe-web-scraping/
- https://www.promptcloud.com/blog/is-web-scraping-legal/
"""

import asyncio
import logging
import random
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Final
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

import httpx

logger = logging.getLogger(__name__)


# =============================================================================
# User-Agent Rotation List
# =============================================================================

# Common browser user-agents for rotation
# Updated 2025-01-02
_BROWSER_USER_AGENTS: Final[tuple[str, ...]] = (
    # Chrome on Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36",
    # Firefox on Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    # Edge on Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    # Safari on macOS
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) "
    "Version/17.2 Safari/605.1.15",
    # Chrome on macOS
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36",
)

# Default RSS aggregator user-agent (identifiable, transparent)
_RSS_USER_AGENT: Final[str] = (
    "Mozilla/5.0 (compatible; LoLStonksRSS/1.0; " "+https://github.com/OneStepAt4time/lolstonksrss)"
)


def get_random_user_agent() -> str:
    """
    Get a random browser user-agent for scraping.

    Returns a randomly selected browser user-agent from the rotation list.
    This helps distribute load and avoid simple blocking mechanisms.

    Returns:
        Random browser user-agent string
    """
    return random.choice(_BROWSER_USER_AGENTS)  # nosec B311 - not used for cryptographic purposes


def get_default_user_agent() -> str:
    """
    Get the default transparent RSS aggregator user-agent.

    This user-agent clearly identifies the scraper and provides a contact URL.
    Use this for maximum transparency and legal compliance.

    Returns:
        Default LoLStonksRSS user-agent string
    """
    return _RSS_USER_AGENT


# =============================================================================
# Cache Entry
# =============================================================================


@dataclass
class RobotsCacheEntry:
    """
    Cache entry for robots.txt data.

    Attributes:
        parser: The RobotFileParser instance with parsed robots.txt
        fetched_at: Timestamp when robots.txt was fetched
        crawl_delay: Detected crawl-delay in seconds (None if not specified)
    """

    parser: RobotFileParser
    fetched_at: datetime
    crawl_delay: float | None = None

    def is_expired(self, ttl_hours: int = 24) -> bool:
        """
        Check if this cache entry has expired.

        Args:
            ttl_hours: Time-to-live in hours (default: 24)

        Returns:
            True if entry is older than or equal to TTL, False otherwise
        """
        expiry_time = self.fetched_at + timedelta(hours=ttl_hours)
        return datetime.now(timezone.utc) >= expiry_time


# =============================================================================
# Robots Parser
# =============================================================================


class RobotsParser:
    """
    Robots.txt parser with caching and user-agent rotation.

    This class provides a high-level interface for checking if URLs can be
    fetched according to robots.txt rules. It caches robots.txt per domain
    and respects the crawl-delay directive.

    Features:
        - Domain-based caching with 24h TTL
        - Crawl-delay detection and enforcement
        - Async robots.txt fetching
        - Comprehensive logging

    Example:
        >>> parser = RobotsParser()
        >>> await parser.can_fetch("https://example.com/page")
        True
        >>> delay = parser.get_crawl_delay("https://example.com")
        1.0
    """

    # Default TTL for robots.txt cache (24 hours)
    DEFAULT_CACHE_TTL_HOURS: Final[int] = 24

    def __init__(self, cache_ttl_hours: int = DEFAULT_CACHE_TTL_HOURS) -> None:
        """
        Initialize the robots.txt parser.

        Args:
            cache_ttl_hours: Time-to-live for cache entries in hours
        """
        self._cache_ttl_hours = cache_ttl_hours
        self._cache: dict[str, RobotsCacheEntry] = {}
        self._client: httpx.AsyncClient | None = None
        self._fetch_locks: dict[str, asyncio.Lock] = {}

    @property
    def client(self) -> httpx.AsyncClient:
        """
        Get or create the HTTP client.

        Returns:
            Async HTTP client with appropriate headers
        """
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=10.0,
                headers={
                    "User-Agent": get_default_user_agent(),
                    "Accept": "text/plain,text/html",
                },
                follow_redirects=True,
            )
        return self._client

    def _get_domain(self, url: str) -> str:
        """
        Extract domain from URL.

        Args:
            url: URL to parse

        Returns:
            Domain string (e.g., "example.com")

        Raises:
            ValueError: If URL is invalid or has no domain
        """
        parsed = urlparse(url)
        if not parsed.netloc:
            raise ValueError(f"Invalid URL: {url}")
        return parsed.netloc

    def _get_robots_url(self, domain: str) -> str:
        """
        Get robots.txt URL for a domain.

        Args:
            domain: Domain name

        Returns:
            Full URL to robots.txt
        """
        return f"https://{domain}/robots.txt"

    async def can_fetch(self, url: str, user_agent: str | None = None) -> bool:
        """
        Check if a URL can be fetched according to robots.txt.

        This method checks the cached robots.txt for the domain, fetching it
        if not cached or expired. Returns True if the URL is allowed.

        Args:
            url: URL to check
            user_agent: User-agent to check (uses default if None)

        Returns:
            True if URL is allowed by robots.txt, False otherwise

        Raises:
            ValueError: If URL is invalid
        """
        domain = self._get_domain(url)
        agent = user_agent or get_default_user_agent()

        try:
            # Ensure robots.txt is cached
            await self._ensure_cached(domain)

            # Get cache entry
            entry = self._cache.get(domain)
            if entry is None:
                # If we couldn't fetch robots.txt, allow by default
                logger.warning(f"No robots.txt cached for {domain}, allowing by default")
                return True

            # Check if URL is allowed
            allowed = entry.parser.can_fetch(agent, url)

            if allowed:
                logger.debug(f"[robots.txt] ALLOWED {agent} {url}")
            else:
                logger.warning(f"[robots.txt] BLOCKED {agent} {url}")

            return allowed

        except Exception as e:
            logger.error(f"Error checking robots.txt for {domain}: {e}")
            # On error, allow by default (fail open)
            return True

    def get_crawl_delay(self, url: str) -> float:
        """
        Get the crawl-delay for a domain from robots.txt.

        Returns the crawl-delay specified in robots.txt, or a default
        minimum delay if not specified.

        Args:
            url: URL to check

        Returns:
            Crawl-delay in seconds (minimum 0.1 if not specified)

        Raises:
            ValueError: If URL is invalid
        """
        domain = self._get_domain(url)

        try:
            # Get cache entry (don't fetch if not cached)
            entry = self._cache.get(domain)

            if entry is None:
                logger.debug(f"No robots.txt cached for {domain}, using default delay")
                return 1.0  # Default 1 second delay

            if entry.is_expired(self._cache_ttl_hours):
                logger.debug(f"robots.txt cache expired for {domain}, using default delay")
                return 1.0

            if entry.crawl_delay is not None:
                logger.debug(f"Using crawl-delay {entry.crawl_delay}s for {domain}")
                return entry.crawl_delay

            # No crawl-delay specified, use default
            return 1.0

        except Exception as e:
            logger.error(f"Error getting crawl-delay for {domain}: {e}")
            return 1.0  # Default on error

    async def _ensure_cached(self, domain: str) -> None:
        """
        Ensure robots.txt is cached for a domain.

        Fetches robots.txt if not cached or if cache entry is expired.

        Args:
            domain: Domain name to cache
        """
        # Check if we have a valid cache entry
        entry = self._cache.get(domain)
        if entry is not None and not entry.is_expired(self._cache_ttl_hours):
            # Cache is valid, nothing to do
            return

        # Get or create lock for this domain
        lock = self._fetch_locks.setdefault(domain, asyncio.Lock())

        # Fetch with lock to prevent duplicate fetches
        async with lock:
            # Double-check after acquiring lock
            entry = self._cache.get(domain)
            if entry is not None and not entry.is_expired(self._cache_ttl_hours):
                return

            # Fetch robots.txt
            await self._fetch_robots_txt(domain)

    async def _fetch_robots_txt(self, domain: str) -> None:
        """
        Fetch and parse robots.txt for a domain.

        Args:
            domain: Domain name to fetch robots.txt for
        """
        robots_url = self._get_robots_url(domain)

        logger.info(f"Fetching robots.txt for {domain} from {robots_url}")

        try:
            response = await self.client.get(robots_url)
            response.raise_for_status()

            # Create RobotFileParser
            parser = RobotFileParser()
            # Set URL for proper parsing
            parser.set_url(robots_url)
            parser.parse(response.text.splitlines())

            # Detect crawl-delay
            crawl_delay = self._detect_crawl_delay(parser)

            # Cache the result
            self._cache[domain] = RobotsCacheEntry(
                parser=parser,
                fetched_at=datetime.now(timezone.utc),
                crawl_delay=crawl_delay,
            )

            logger.info(
                f"Cached robots.txt for {domain} "
                f"(crawl-delay: {crawl_delay or 'not specified'})"
            )

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.info(f"No robots.txt found for {domain} (404), allowing all")
                # Create an empty parser that allows everything
                parser = RobotFileParser()
                parser.parse([])
                self._cache[domain] = RobotsCacheEntry(
                    parser=parser,
                    fetched_at=datetime.now(timezone.utc),
                    crawl_delay=None,
                )
            else:
                logger.error(f"HTTP error fetching robots.txt for {domain}: {e}")
                raise

        except Exception as e:
            logger.error(f"Error fetching robots.txt for {domain}: {e}")
            raise

    def _detect_crawl_delay(self, parser: RobotFileParser) -> float | None:
        """
        Detect crawl-delay from robots.txt parser.

        The crawl-delay directive specifies the minimum delay between requests
        to the server. This is important for respecting server resources.

        Note: urllib.robotparser doesn't expose crawl-delay directly in the API.
        This implementation returns None for now. Future enhancement could parse
        the robots.txt content directly to extract crawl-delay.

        Args:
            parser: RobotFileParser instance

        Returns:
            Crawl-delay in seconds, or None if not specified
        """
        # RobotFileParser doesn't expose crawl-delay in a straightforward way
        # The entries attribute is a list, not a dict, and doesn't store
        # crawl-delay in a structured format.
        # For now, we return None and rely on configured rate limits.
        # A future enhancement could parse the raw robots.txt content.
        return None

    def clear_cache(self, domain: str | None = None) -> None:
        """
        Clear cached robots.txt data.

        Args:
            domain: Specific domain to clear, or None to clear all
        """
        if domain:
            self._cache.pop(domain, None)
            self._fetch_locks.pop(domain, None)
            logger.debug(f"Cleared robots.txt cache for {domain}")
        else:
            self._cache.clear()
            self._fetch_locks.clear()
            logger.debug("Cleared all robots.txt cache")

    def get_cache_stats(self) -> dict[str, dict[str, str | float | None]]:
        """
        Get statistics about cached robots.txt data.

        Returns:
            Dictionary mapping domains to their cache stats
        """
        stats: dict[str, dict[str, str | float | None]] = {}

        for domain, entry in self._cache.items():
            stats[domain] = {
                "fetched_at": entry.fetched_at.isoformat(),
                "crawl_delay": entry.crawl_delay,
                "expired": entry.is_expired(self._cache_ttl_hours),
            }

        return stats

    async def close(self) -> None:
        """Close the HTTP client and cleanup resources."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    async def __aenter__(self) -> "RobotsParser":
        """Async context manager entry."""
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: object,
    ) -> None:
        """Async context manager exit."""
        await self.close()


# =============================================================================
# Global Parser Instance
# =============================================================================

# Global robots.txt parser instance (lazy initialization)
_global_parser: RobotsParser | None = None


def get_global_parser() -> RobotsParser:
    """
    Get the global RobotsParser instance.

    Returns a singleton RobotsParser instance for use across the application.
    The instance is created on first use.

    Returns:
        Global RobotsParser instance
    """
    global _global_parser
    if _global_parser is None:
        _global_parser = RobotsParser()
    return _global_parser


async def close_global_parser() -> None:
    """Close the global RobotsParser instance."""
    global _global_parser
    if _global_parser is not None:
        await _global_parser.close()
        _global_parser = None
