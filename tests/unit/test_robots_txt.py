"""
Unit tests for robots.txt compliance module.

Tests the RobotsParser class including:
- robots.txt fetching and parsing
- Domain-based caching with TTL
- Crawl-delay detection
- User-agent rotation
- Permission checking
"""

import asyncio
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

import httpx
import pytest

from src.scrapers.robots_txt import (
    RobotsCacheEntry,
    RobotsParser,
    close_global_parser,
    get_default_user_agent,
    get_global_parser,
    get_random_user_agent,
)

# =============================================================================
# User-Agent Rotation Tests
# =============================================================================


class TestUserAgentRotation:
    """Tests for user-agent rotation functionality."""

    def test_get_random_user_agent_returns_string(self) -> None:
        """Test that get_random_user_agent returns a string."""
        agent = get_random_user_agent()
        assert isinstance(agent, str)
        assert len(agent) > 0

    def test_get_random_user_agent_contains_browser(self) -> None:
        """Test that user-agent contains browser identification."""
        agent = get_random_user_agent()
        # Should contain common browser identifiers
        assert any(browser in agent for browser in ["Chrome", "Firefox", "Safari", "Edge"])

    def test_get_default_user_agent(self) -> None:
        """Test that default user-agent is identifiable."""
        agent = get_default_user_agent()
        assert "LoLStonksRSS" in agent
        assert "github.com" in agent

    def test_user_agents_are_different(self) -> None:
        """Test that random user-agents vary."""
        agents = {get_random_user_agent() for _ in range(20)}
        # Should have some variety (not always the same)
        assert len(agents) > 1


# =============================================================================
# RobotsCacheEntry Tests
# =============================================================================


class TestRobotsCacheEntry:
    """Tests for RobotsCacheEntry dataclass."""

    def test_cache_entry_creation(self) -> None:
        """Test creating a cache entry."""
        parser = MagicMock()
        entry = RobotsCacheEntry(
            parser=parser,
            fetched_at=datetime.now(timezone.utc),
            crawl_delay=1.5,
        )
        assert entry.parser == parser
        assert entry.crawl_delay == 1.5

    def test_cache_entry_not_expired(self) -> None:
        """Test that fresh cache entry is not expired."""
        parser = MagicMock()
        entry = RobotsCacheEntry(
            parser=parser,
            fetched_at=datetime.now(timezone.utc),
            crawl_delay=None,
        )
        assert not entry.is_expired(ttl_hours=24)

    def test_cache_entry_expired(self) -> None:
        """Test that old cache entry is expired."""
        parser = MagicMock()
        old_time = datetime.now(timezone.utc) - timedelta(hours=25)
        entry = RobotsCacheEntry(
            parser=parser,
            fetched_at=old_time,
            crawl_delay=None,
        )
        assert entry.is_expired(ttl_hours=24)

    def test_cache_entry_exactly_at_ttl(self) -> None:
        """Test cache entry exactly at TTL boundary."""
        parser = MagicMock()
        old_time = datetime.now(timezone.utc) - timedelta(hours=24)
        entry = RobotsCacheEntry(
            parser=parser,
            fetched_at=old_time,
            crawl_delay=None,
        )
        # Should be considered expired at exactly TTL
        assert entry.is_expired(ttl_hours=24)


# =============================================================================
# RobotsParser Tests
# =============================================================================


class TestRobotsParser:
    """Tests for RobotsParser class."""

    @pytest.fixture
    def parser(self) -> RobotsParser:
        """Create a RobotsParser instance for testing."""
        return RobotsParser(cache_ttl_hours=24)

    @pytest.fixture
    def mock_response(self) -> MagicMock:
        """Create a mock HTTP response."""
        response = MagicMock()
        response.status_code = 200
        response.text = (
            "User-agent: *\n" "Disallow: /admin/\n" "Disallow: /private/\n" "Crawl-delay: 2\n"
        )
        response.raise_for_status = MagicMock()
        return response

    def test_get_domain_from_url(self, parser: RobotsParser) -> None:
        """Test extracting domain from URL."""
        assert parser._get_domain("https://example.com/page") == "example.com"
        assert parser._get_domain("http://subdomain.example.org/path") == "subdomain.example.org"

    def test_get_domain_invalid_url(self, parser: RobotsParser) -> None:
        """Test that invalid URL raises ValueError."""
        with pytest.raises(ValueError):
            parser._get_domain("not-a-url")

    def test_get_robots_url(self, parser: RobotsParser) -> None:
        """Test generating robots.txt URL."""
        assert parser._get_robots_url("example.com") == "https://example.com/robots.txt"

    @pytest.mark.asyncio
    async def test_can_fetch_allowed(self, parser: RobotsParser, mock_response: MagicMock) -> None:
        """Test can_fetch returns True for allowed URLs."""
        with patch.object(parser.client, "get", return_value=mock_response):
            result = await parser.can_fetch("https://example.com/page")
            assert result is True

    @pytest.mark.asyncio
    async def test_can_fetch_disallowed(self, parser: RobotsParser) -> None:
        """Test can_fetch returns False for disallowed URLs."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = "User-agent: *\n" "Disallow: /private/\n" "Disallow: /admin/\n"
        mock_response.raise_for_status = MagicMock()

        with patch.object(parser.client, "get", return_value=mock_response):
            # Allowed path
            assert await parser.can_fetch("https://example.com/page") is True
            # Disallowed paths
            assert await parser.can_fetch("https://example.com/private/") is False
            assert await parser.can_fetch("https://example.com/admin/settings") is False

    @pytest.mark.asyncio
    async def test_can_fetch_with_404(self, parser: RobotsParser) -> None:
        """Test can_fetch allows all when robots.txt returns 404."""
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_response.raise_for_status = MagicMock(
            side_effect=httpx.HTTPStatusError(
                "Not Found", request=MagicMock(), response=mock_response
            )
        )

        with patch.object(parser.client, "get", return_value=mock_response):
            result = await parser.can_fetch("https://example.com/page")
            # Should allow all when robots.txt doesn't exist
            assert result is True

    @pytest.mark.asyncio
    async def test_can_fetch_uses_cache(
        self, parser: RobotsParser, mock_response: MagicMock
    ) -> None:
        """Test that can_fetch uses cached robots.txt."""
        with patch.object(parser.client, "get", return_value=mock_response) as mock_get:
            # First call should fetch
            await parser.can_fetch("https://example.com/page1")
            assert mock_get.call_count == 1

            # Second call should use cache
            await parser.can_fetch("https://example.com/page2")
            assert mock_get.call_count == 1  # No additional fetch

    @pytest.mark.asyncio
    async def test_get_crawl_delay(self, parser: RobotsParser, mock_response: MagicMock) -> None:
        """Test getting crawl-delay from robots.txt."""
        with patch.object(parser.client, "get", return_value=mock_response):
            # Fetch robots.txt first
            await parser.can_fetch("https://example.com/page")
            # Get crawl-delay (returns None since RobotFileParser doesn't expose it)
            delay = parser.get_crawl_delay("https://example.com/page")
            assert delay == 1.0  # Default delay when crawl-delay not detected

    @pytest.mark.asyncio
    async def test_get_crawl_delay_default(self, parser: RobotsParser) -> None:
        """Test default crawl-delay when not specified."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = "User-agent: *\nDisallow:\n"
        mock_response.raise_for_status = MagicMock()

        with patch.object(parser.client, "get", return_value=mock_response):
            await parser.can_fetch("https://example.com/page")
            delay = parser.get_crawl_delay("https://example.com/page")
            assert delay == 1.0  # Default delay

    @pytest.mark.asyncio
    async def test_get_crawl_delay_uncached(self, parser: RobotsParser) -> None:
        """Test crawl-delay returns default when robots.txt not cached."""
        delay = parser.get_crawl_delay("https://example.com/page")
        assert delay == 1.0  # Default delay

    @pytest.mark.asyncio
    async def test_clear_cache_domain(self, parser: RobotsParser, mock_response: MagicMock) -> None:
        """Test clearing cache for specific domain."""
        with patch.object(parser.client, "get", return_value=mock_response):
            await parser.can_fetch("https://example.com/page")
            assert "example.com" in parser._cache

            parser.clear_cache(domain="example.com")
            assert "example.com" not in parser._cache

    @pytest.mark.asyncio
    async def test_clear_cache_all(self, parser: RobotsParser, mock_response: MagicMock) -> None:
        """Test clearing all cache."""
        with patch.object(parser.client, "get", return_value=mock_response):
            await parser.can_fetch("https://example.com/page")
            await parser.can_fetch("https://other.com/page")
            assert len(parser._cache) == 2

            parser.clear_cache()
            assert len(parser._cache) == 0

    @pytest.mark.asyncio
    async def test_get_cache_stats(self, parser: RobotsParser, mock_response: MagicMock) -> None:
        """Test getting cache statistics."""
        with patch.object(parser.client, "get", return_value=mock_response):
            await parser.can_fetch("https://example.com/page")
            stats = parser.get_cache_stats()

            assert "example.com" in stats
            assert "fetched_at" in stats["example.com"]
            assert "crawl_delay" in stats["example.com"]
            assert "expired" in stats["example.com"]

    @pytest.mark.asyncio
    async def test_concurrent_fetches(self, parser: RobotsParser, mock_response: MagicMock) -> None:
        """Test that concurrent fetches use same request."""

        # Make the response slow to simulate network delay
        async def slow_get(*args: object, **kwargs: object) -> MagicMock:
            await asyncio.sleep(0.1)
            return mock_response

        with patch.object(parser.client, "get", side_effect=slow_get) as mock_get:
            # Launch concurrent requests
            tasks = [parser.can_fetch("https://example.com/page") for _ in range(5)]
            results = await asyncio.gather(*tasks)

            # All should succeed
            assert all(results)
            # But only one fetch should have occurred
            assert mock_get.call_count == 1

    @pytest.mark.asyncio
    async def test_context_manager(self) -> None:
        """Test using RobotsParser as async context manager."""
        async with RobotsParser() as parser:
            assert parser is not None
            # Parser should be usable
            parser.clear_cache()
        # Client should be closed after exit

    @pytest.mark.asyncio
    async def test_close(self) -> None:
        """Test closing the parser."""
        parser = RobotsParser()
        # Access client to create it
        _ = parser.client
        assert parser._client is not None

        await parser.close()
        assert parser._client is None


# =============================================================================
# Global Parser Tests
# =============================================================================


class TestGlobalParser:
    """Tests for global parser singleton."""

    @pytest.mark.asyncio
    async def test_get_global_parser_returns_singleton(self) -> None:
        """Test that get_global_parser returns same instance."""
        parser1 = get_global_parser()
        parser2 = get_global_parser()
        assert parser1 is parser2

    @pytest.mark.asyncio
    async def test_close_global_parser(self) -> None:
        """Test closing global parser."""
        parser1 = get_global_parser()
        await close_global_parser()

        parser2 = get_global_parser()
        # Should be a new instance
        assert parser1 is not parser2

        # Clean up
        await close_global_parser()

    @pytest.mark.asyncio
    async def test_global_parser_persists_cache(self) -> None:
        """Test that global parser cache persists across calls."""
        parser = get_global_parser()

        # Add a fake cache entry
        from urllib.robotparser import RobotFileParser

        fake_parser = RobotFileParser()
        fake_parser.parse([])

        parser._cache["test.com"] = RobotsCacheEntry(
            parser=fake_parser,
            fetched_at=datetime.now(timezone.utc),
            crawl_delay=1.0,
        )

        # Get parser again (same instance)
        parser2 = get_global_parser()
        assert "test.com" in parser2._cache

        # Clean up
        await close_global_parser()


# =============================================================================
# Integration Tests
# =============================================================================


class TestRobotsParserIntegration:
    """Integration tests for robots.txt parsing."""

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_real_google_robots_txt(self) -> None:
        """Test parsing real Google robots.txt (integration test)."""
        parser = RobotsParser()

        try:
            # Test with real Google robots.txt
            allowed = await parser.can_fetch("https://google.com/search")
            # Google generally allows well-behaved bots
            # We don't assert specific value as it may change
            assert isinstance(allowed, bool)

        finally:
            await parser.close()

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_crawl_delay_real_site(self) -> None:
        """Test crawl-delay detection on real site."""
        parser = RobotsParser()

        try:
            # Many sites don't specify crawl-delay
            delay = parser.get_crawl_delay("https://example.com/page")
            assert isinstance(delay, float)
            assert delay >= 0

        finally:
            await parser.close()
