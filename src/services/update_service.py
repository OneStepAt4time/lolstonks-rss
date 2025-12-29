"""
Service for updating news articles from LoL API.

This module provides the UpdateService class which handles fetching news
from multiple LoL API locales and saving to the database.
"""

import logging
from datetime import datetime
from typing import Dict, List, Any

from src.api_client import LoLNewsAPIClient
from src.database import ArticleRepository
from src.models import Article
from src.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class UpdateService:
    """
    Service for updating news articles from LoL API.

    Fetches articles from all supported locales and saves to database.
    Tracks update statistics and handles errors gracefully.
    """

    def __init__(self, repository: ArticleRepository) -> None:
        """
        Initialize update service.

        Args:
            repository: Article repository for database operations
        """
        self.repository = repository
        self.clients = {
            "en-us": LoLNewsAPIClient(),
            "it-it": LoLNewsAPIClient(),
        }
        self.last_update: datetime | None = None
        self.update_count: int = 0
        self.error_count: int = 0

    async def update_all_sources(self) -> Dict[str, Any]:
        """
        Fetch and save articles from all sources.

        Returns:
            Dictionary with update statistics including fetched, new,
            duplicate counts, and any errors encountered
        """
        logger.info("Starting update for all sources...")
        start_time = datetime.utcnow()

        stats: Dict[str, Any] = {
            "started_at": start_time.isoformat(),
            "sources": {},
            "total_fetched": 0,
            "total_new": 0,
            "total_duplicates": 0,
            "errors": [],
        }

        # Update each source
        for locale, client in self.clients.items():
            try:
                source_stats = await self._update_source(locale, client)
                stats["sources"][locale] = source_stats
                stats["total_fetched"] += source_stats["fetched"]
                stats["total_new"] += source_stats["new"]
                stats["total_duplicates"] += source_stats["duplicates"]

            except Exception as e:
                error_msg = f"Error updating {locale}: {e}"
                logger.error(error_msg)
                stats["errors"].append(error_msg)
                self.error_count += 1

        # Update stats
        self.last_update = datetime.utcnow()
        self.update_count += 1

        elapsed = (datetime.utcnow() - start_time).total_seconds()
        stats["completed_at"] = self.last_update.isoformat()
        stats["elapsed_seconds"] = round(elapsed, 2)

        logger.info(
            f"Update complete: {stats['total_new']} new articles, "
            f"{stats['total_duplicates']} duplicates, "
            f"{len(stats['errors'])} errors in {elapsed:.2f}s"
        )

        return stats

    async def _update_source(self, locale: str, client: LoLNewsAPIClient) -> Dict[str, int]:
        """
        Update articles for a single source.

        Args:
            locale: Locale identifier (e.g., "en-us", "it-it")
            client: API client for this locale

        Returns:
            Statistics dictionary with counts
        """
        logger.info(f"Fetching articles for {locale}...")

        # Fetch articles
        articles: List[Article] = await client.fetch_news(locale)

        stats = {"fetched": len(articles), "new": 0, "duplicates": 0}

        # Save to database
        for article in articles:
            try:
                saved = await self.repository.save(article)
                if saved:
                    stats["new"] += 1
                else:
                    stats["duplicates"] += 1
            except Exception as e:
                logger.error(f"Error saving article {article.guid}: {e}")

        logger.info(
            f"{locale}: {stats['fetched']} fetched, "
            f"{stats['new']} new, {stats['duplicates']} duplicates"
        )

        return stats

    def get_status(self) -> Dict[str, Any]:
        """
        Get current service status.

        Returns:
            Status dictionary with update history and configuration
        """
        return {
            "last_update": self.last_update.isoformat() if self.last_update else None,
            "update_count": self.update_count,
            "error_count": self.error_count,
            "sources": list(self.clients.keys()),
        }
