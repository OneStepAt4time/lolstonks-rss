"""Integration tests for the FastAPI server."""

import asyncio
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

from src.api.app import app, app_state
from src.models import Article, ArticleSource


def _setup_full_mock_state() -> tuple[AsyncMock, AsyncMock, MagicMock]:
    """Helper function to setup fully mocked app_state for health checks."""
    repo = AsyncMock()
    repo.get_latest = AsyncMock(return_value=[])
    repo.count = AsyncMock(return_value=100)
    repo.get_last_write_timestamp = AsyncMock(return_value=datetime(2024, 1, 1, 12, 0, 0))
    repo.get_locales = AsyncMock(return_value=["en-us", "it-it"])
    repo.get_source_categories = AsyncMock(return_value=["official_riot", "analytics"])

    service = AsyncMock()
    service.get_main_feed = AsyncMock(return_value='<?xml version="1.0"?><rss version="2.0"></rss>')
    service.get_feed_by_source = AsyncMock(
        return_value='<?xml version="1.0"?><rss version="2.0"></rss>'
    )
    service.get_feed_by_category = AsyncMock(
        return_value='<?xml version="1.0"?><rss version="2.0"></rss>'
    )

    cache_mock = MagicMock()
    cache_mock.get_stats = MagicMock(
        return_value={"total_entries": 5, "size_bytes_estimate": 1024, "ttl_seconds": 300}
    )
    service.cache = cache_mock

    service_v2 = AsyncMock()
    service_v2.cache = cache_mock

    scheduler = MagicMock()
    scheduler.get_status = MagicMock(
        return_value={
            "running": True,
            "interval_minutes": 30,
            "jobs": [
                {"id": "update_news", "name": "Update LoL News", "next_run": "2024-01-01T12:30:00"}
            ],
            "update_service": {
                "last_update": "2024-01-01T12:00:00",
                "update_count": 10,
                "error_count": 0,
                "configured_sources": 5,
                "configured_locales": 2,
            },
        }
    )

    app_state["repository"] = repo
    app_state["feed_service"] = service
    app_state["feed_service_v2"] = service_v2
    app_state["scheduler"] = scheduler

    return repo, service, scheduler


@pytest.mark.slow
@pytest.mark.asyncio
async def test_full_server_workflow() -> None:
    """Test complete server workflow."""
    _setup_full_mock_state()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        health = response.json()
        assert health["status"] == "healthy"

        response = await client.get("/feed.xml")
        assert response.status_code == 200
        assert "<?xml" in response.text

        response = await client.get("/feed/en-us.xml")
        assert response.status_code == 200


@pytest.mark.slow
@pytest.mark.asyncio
async def test_server_with_real_data() -> None:
    """Test server with mock data and services."""
    repo, service, _scheduler = _setup_full_mock_state()

    test_articles = [
        Article(
            guid="test-integration-1",
            title="Test Article 1",
            url="https://example.com/article1",
            description="First test article",
            pub_date=datetime.now(timezone.utc),
            source=ArticleSource.create("lol", "en-us"),
            categories=["Champions"],
            image_url="https://example.com/image1.jpg",
        ),
        Article(
            guid="test-integration-2",
            title="Test Article 2",
            url="https://example.com/article2",
            description="Second test article",
            pub_date=datetime.now(timezone.utc),
            source=ArticleSource.create("lol", "it-it"),
            categories=["Patches"],
            image_url=None,
        ),
    ]
    repo.get_latest = AsyncMock(return_value=test_articles)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/feed.xml")
        assert response.status_code == 200
        response = await client.get("/feed/en-us.xml")
        assert response.status_code == 200
        response = await client.get("/feed/category/Champions.xml")
        assert response.status_code == 200


@pytest.mark.slow
@pytest.mark.asyncio
async def test_concurrent_requests() -> None:
    """Test server handles concurrent requests correctly."""
    _setup_full_mock_state()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:

        async def fetch_feed(endpoint: str) -> int:
            response = await client.get(endpoint)
            return response.status_code

        tasks = [
            fetch_feed("/feed.xml"),
            fetch_feed("/feed/en-us.xml"),
            fetch_feed("/feed/it-it.xml"),
            fetch_feed("/health"),
        ]
        results = await asyncio.gather(*tasks)
        assert all(status == 200 for status in results)


@pytest.mark.slow
@pytest.mark.asyncio
async def test_cache_invalidation() -> None:
    """Test cache invalidation endpoint works correctly."""
    repo, service, _scheduler = _setup_full_mock_state()
    service.invalidate_cache = AsyncMock()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/feed.xml")
        assert response.status_code == 200
        response = await client.post("/admin/refresh")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        response = await client.get("/feed.xml")
        assert response.status_code == 200


@pytest.mark.slow
@pytest.mark.asyncio
async def test_error_recovery() -> None:
    """Test server recovers from errors gracefully."""
    _setup_full_mock_state()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/feed/invalid.xml")
        assert response.status_code == 404
        response = await client.get("/health")
        assert response.status_code == 200
        response = await client.get("/feed.xml")
        assert response.status_code == 200
