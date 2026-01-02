"""
Scrapers for fetching news from various LoL/TFT sources.

This package provides a modular scraping architecture that supports:
- RSS feed scraping for sites with structured feeds
- HTML scraping for sites with structured HTML content
- Selenium-based scraping for JavaScript-heavy sites
- robots.txt compliance for legal web scraping

All scrapers implement the BaseScraper interface and return standardized
Article objects with locale and source category metadata.
"""

from src.scrapers.base import (
    BaseScraper,
    ScrapingConfig,
    ScrapingDifficulty,
)
from src.scrapers.registry import (
    ALL_SCRAPER_SOURCES,
    SCRAPER_CONFIGS,
    get_scraper,
)
from src.scrapers.robots_txt import (
    RobotsParser,
    get_default_user_agent,
    get_global_parser,
    get_random_user_agent,
)

__all__ = [
    "BaseScraper",
    "ScrapingConfig",
    "ScrapingDifficulty",
    "get_scraper",
    "SCRAPER_CONFIGS",
    "ALL_SCRAPER_SOURCES",
    "RobotsParser",
    "get_global_parser",
    "get_random_user_agent",
    "get_default_user_agent",
]
