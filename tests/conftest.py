"""
Pytest configuration and shared fixtures for the test suite.
"""

import asyncio
import os
import sys
from collections.abc import AsyncGenerator
from unittest.mock import MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

# Add src directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Configure pytest-asyncio
pytest_plugins = ("pytest_asyncio",)


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def base_url():
    """Base URL for E2E tests (configurable via environment)."""
    return os.getenv("TEST_BASE_URL", "http://localhost:8000")


@pytest.fixture
def api_timeout():
    """Timeout for API requests in seconds."""
    return int(os.getenv("TEST_API_TIMEOUT", "30"))


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """
    Create test client for FastAPI app.

    Yields:
        AsyncClient instance for testing
    """
    from src.api.app import app

    transport = ASGITransport(app=app)  # type: ignore[arg-type]
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


def pytest_configure(config):
    """Configure custom pytest markers."""
    config.addinivalue_line("markers", "e2e: marks tests as end-to-end tests")
    config.addinivalue_line("markers", "smoke: marks smoke tests (critical functionality)")
    config.addinivalue_line("markers", "slow: marks slow-running tests")
    config.addinivalue_line("markers", "unit: marks unit tests")
    config.addinivalue_line("markers", "integration: marks integration tests")
    config.addinivalue_line("markers", "api: marks API endpoint tests")
    config.addinivalue_line("markers", "rss: marks RSS validation tests")
    config.addinivalue_line("markers", "scraper: marks scraper tests")
    config.addinivalue_line("markers", "redis: marks Redis integration tests")


# Scraper test fixtures


@pytest.fixture
def mock_html_response():
    """Mock HTTP response with HTML content for scraper testing."""

    class MockResponse:
        def __init__(self, status_code: int = 200, text: str = ""):
            self.status_code = status_code
            self.text = text
            self.content = text.encode("utf-8") if text else b""

        def raise_for_status(self):
            if self.status_code >= 400:
                raise HTTPError(f"HTTP {self.status_code}")

    sample_html = """
    <html>
        <body>
            <article class="news-item">
                <h2 class="title">Test Article Title</h2>
                <a class="link" href="https://example.com/article/1">Read More</a>
                <time class="date">2025-01-15T10:30:00Z</time>
                <div class="content">This is a test article content.</div>
            </article>
            <article class="news-item">
                <h2 class="title">Another Test Article</h2>
                <a class="link" href="https://example.com/article/2">Read More</a>
                <time class="date">2025-01-15T11:00:00Z</time>
                <div class="content">More test content here.</div>
            </article>
        </body>
    </html>
    """

    return MockResponse(status_code=200, text=sample_html)


@pytest.fixture
def mock_rss_feed():
    """Mock RSS feed data for RSS scraper testing."""
    return """<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
        <channel>
            <title>Test RSS Feed</title>
            <link>https://example.com</link>
            <description>Test RSS feed description</description>
            <item>
                <title>Test Article 1</title>
                <link>https://example.com/article/1</link>
                <description>Test description 1</description>
                <pubDate>Tue, 15 Jan 2025 10:30:00 GMT</pubDate>
            </item>
            <item>
                <title>Test Article 2</title>
                <link>https://example.com/article/2</link>
                <description>Test description 2</description>
                <pubDate>Tue, 15 Jan 2025 11:00:00 GMT</pubDate>
            </item>
        </channel>
    </rss>
    """


@pytest.fixture
def sample_article_elements():
    """Sample article HTML elements for extraction testing."""
    return [
        {
            "title": "Patch 15.1 Notes",
            "url": "https://example.com/patch-15-1",
            "published_date": "2025-01-15T10:00:00Z",
            "description": "Balance changes and new features",
        },
        {
            "title": "Champion Spotlight: Ambitious Hero",
            "url": "https://example.com/champion-spotlight",
            "published_date": "2025-01-14T15:30:00Z",
            "description": "Learn about the new champion",
        },
        {
            "title": "Esports News: Spring Split Begins",
            "url": "https://example.com/esports-spring",
            "published_date": "2025-01-13T09:00:00Z",
            "description": "The 2025 Spring Split is here",
        },
    ]


class HTTPError(Exception):
    """Mock HTTP error."""

    pass


@pytest.fixture
def sample_rss_entries(mock_rss_feed: str) -> list:
    """
    Sample RSS feed entries for testing.

    Args:
        mock_rss_feed: RSS feed string from mock_rss_feed fixture

    Returns:
        List of feedparser entry objects
    """
    import feedparser

    feed = feedparser.parse(mock_rss_feed)
    return feed.entries


@pytest.fixture
def sample_scraping_config():
    """
    Sample ScrapingConfig for testing scrapers.

    Returns:
        ScrapingConfig object with typical values
    """
    from src.scrapers.base import ScrapingConfig, ScrapingDifficulty

    return ScrapingConfig(
        source_id="lol",
        base_url="https://www.leagueoflegends.com/en-us/news/",
        difficulty=ScrapingDifficulty.EASY,
        rate_limit_seconds=1.0,
        timeout_seconds=30,
    )


@pytest.fixture
def mock_robots_parser() -> MagicMock:
    """
    Mock robots.txt parser for scraper testing.

    Returns:
        MagicMock that allows all requests
    """
    mock_parser = MagicMock()
    mock_parser.can_fetch.return_value = True
    return mock_parser


@pytest.fixture
def mock_httpx_client() -> MagicMock:
    """
    Mock httpx.AsyncClient for HTTP requests in scrapers.

    Returns:
        MagicMock configured as an httpx.AsyncClient
    """
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.text = "<html><body><article>Test</article></body></html>"
    mock_response.content = b"<html><body><article>Test</article></body></html>"
    mock_response.raise_for_status = MagicMock()
    mock_client.get.return_value = mock_response
    mock_client.is_closed = False
    return mock_client
