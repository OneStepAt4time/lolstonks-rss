"""
Tests for UpdateService.

This module tests the update service functionality including
fetching news from multiple sources and saving to database.
"""

from datetime import datetime
from unittest.mock import AsyncMock

import pytest

from src.config import GAME_CATEGORIES, GAME_DOMAINS
from src.models import Article, ArticleSource, SourceCategory
from src.services.update_service import (
    UpdatePriority,
    UpdateService,
    UpdateServiceV2,
    UpdateTask,
)


@pytest.fixture
def mock_repository() -> AsyncMock:
    """Create a mock repository for testing."""
    repo = AsyncMock()
    repo.save = AsyncMock(return_value=True)
    return repo


@pytest.fixture
def update_service(mock_repository: AsyncMock) -> UpdateService:
    """Create an UpdateService instance with mock repository."""
    return UpdateService(mock_repository)


@pytest.mark.asyncio
async def test_update_service_initialization(update_service: UpdateService) -> None:
    """Test that UpdateService initializes correctly."""
    assert update_service.repository is not None
    assert len(update_service.clients) == 2
    assert "en-us" in update_service.clients
    assert "it-it" in update_service.clients
    assert update_service.last_update is None
    assert update_service.update_count == 0
    assert update_service.error_count == 0


@pytest.mark.asyncio
async def test_update_all_sources(
    update_service: UpdateService, mock_repository: AsyncMock
) -> None:
    """Test updating all sources successfully."""
    # Create mock articles
    mock_articles = [
        Article(
            title="Test Article 1",
            url="http://test.com/1",
            pub_date=datetime.utcnow(),
            guid="test-1",
            source=ArticleSource.create("lol", "en-us"),
            description="Test description 1",
            categories=["News"],
        ),
        Article(
            title="Test Article 2",
            url="http://test.com/2",
            pub_date=datetime.utcnow(),
            guid="test-2",
            source=ArticleSource.create("lol", "en-us"),
            description="Test description 2",
            categories=["Patches"],
        ),
    ]

    # Mock API client
    mock_client = AsyncMock()
    mock_client.fetch_news = AsyncMock(return_value=mock_articles)

    # Replace clients with mock
    for locale in update_service.clients:
        update_service.clients[locale] = mock_client

    # Run update
    stats = await update_service.update_all_sources()

    # Verify stats
    assert stats["total_fetched"] == 4  # 2 articles x 2 locales
    assert stats["total_new"] == 4
    assert stats["total_duplicates"] == 0
    assert "en-us" in stats["sources"]
    assert "it-it" in stats["sources"]
    assert "started_at" in stats
    assert "completed_at" in stats
    assert "elapsed_seconds" in stats
    assert len(stats["errors"]) == 0

    # Verify service state updated
    assert update_service.last_update is not None
    assert update_service.update_count == 1
    assert update_service.error_count == 0


@pytest.mark.asyncio
async def test_update_all_sources_with_duplicates(
    update_service: UpdateService, mock_repository: AsyncMock
) -> None:
    """Test updating with duplicate articles."""
    # Create mock articles
    mock_articles = [
        Article(
            title="Test Article",
            url="http://test.com/1",
            pub_date=datetime.utcnow(),
            guid="test-1",
            source=ArticleSource.create("lol", "en-us"),
            description="Test description",
            categories=["News"],
        )
    ]

    # Mock repository to return False (duplicate) for some saves
    mock_repository.save = AsyncMock(side_effect=[True, False])

    # Mock API client
    mock_client = AsyncMock()
    mock_client.fetch_news = AsyncMock(return_value=mock_articles)

    for locale in update_service.clients:
        update_service.clients[locale] = mock_client

    # Run update
    stats = await update_service.update_all_sources()

    # Verify duplicates detected
    assert stats["total_fetched"] == 2
    assert stats["total_new"] == 1
    assert stats["total_duplicates"] == 1


@pytest.mark.asyncio
async def test_update_all_sources_with_errors(
    update_service: UpdateService, mock_repository: AsyncMock
) -> None:
    """Test updating with errors from one source."""
    # Mock one client to succeed and one to fail
    mock_success_client = AsyncMock()
    mock_success_client.fetch_news = AsyncMock(
        return_value=[
            Article(
                title="Test",
                url="http://test.com",
                pub_date=datetime.utcnow(),
                guid="test-1",
                source=ArticleSource.create("lol", "en-us"),
                description="Test",
                categories=["News"],
            )
        ]
    )

    mock_error_client = AsyncMock()
    mock_error_client.fetch_news = AsyncMock(side_effect=Exception("API Error"))

    update_service.clients["en-us"] = mock_success_client
    update_service.clients["it-it"] = mock_error_client

    # Run update
    stats = await update_service.update_all_sources()

    # Verify one source succeeded, one failed
    assert stats["total_fetched"] == 1  # Only en-us succeeded
    assert stats["total_new"] == 1
    assert len(stats["errors"]) == 1
    assert "it-it" in stats["errors"][0]
    assert update_service.error_count == 1


@pytest.mark.asyncio
async def test_get_status(update_service: UpdateService) -> None:
    """Test getting service status."""
    status = update_service.get_status()

    assert "last_update" in status
    assert "update_count" in status
    assert "error_count" in status
    assert "sources" in status
    assert status["sources"] == ["en-us", "it-it"]
    assert status["update_count"] == 0
    assert status["error_count"] == 0
    assert status["last_update"] is None


@pytest.mark.asyncio
async def test_get_status_after_update(
    update_service: UpdateService, mock_repository: AsyncMock
) -> None:
    """Test getting status after performing an update."""
    # Mock API client
    mock_client = AsyncMock()
    mock_client.fetch_news = AsyncMock(return_value=[])

    for locale in update_service.clients:
        update_service.clients[locale] = mock_client

    # Run update
    await update_service.update_all_sources()

    # Check status
    status = update_service.get_status()
    assert status["update_count"] == 1
    assert status["last_update"] is not None


@pytest.mark.asyncio
async def test_update_source_logging(
    update_service: UpdateService, mock_repository: AsyncMock, caplog: pytest.LogCaptureFixture
) -> None:
    """Test that update logging works correctly."""
    import logging

    caplog.set_level(logging.INFO)

    # Mock API client
    mock_client = AsyncMock()
    mock_client.fetch_news = AsyncMock(return_value=[])

    # Run update for one source
    stats = await update_service._update_source("en-us", mock_client)

    # Verify logging
    assert "Fetching articles for en-us" in caplog.text
    assert stats["fetched"] == 0
    assert stats["new"] == 0
    assert stats["duplicates"] == 0


# =============================================================================
# UpdateServiceV2 Tests (multi-game, per-category)
# =============================================================================


@pytest.fixture
def mock_repository_v2() -> AsyncMock:
    """Create a mock repository for UpdateServiceV2 testing."""
    repo = AsyncMock()
    repo.save = AsyncMock(return_value=True)
    repo.initialize = AsyncMock()
    repo.close = AsyncMock()
    return repo


@pytest.fixture
def update_service_v2(mock_repository_v2: AsyncMock) -> UpdateServiceV2:
    """Create an UpdateServiceV2 instance with mock repository."""
    return UpdateServiceV2(mock_repository_v2)


class TestUpdateServiceV2Init:
    """Tests for UpdateServiceV2 initialization."""

    def test_game_clients_created(self, update_service_v2: UpdateServiceV2) -> None:
        """Test that game clients are created for all game domains."""
        for game_id in GAME_DOMAINS:
            assert game_id in update_service_v2.game_clients
            assert update_service_v2.game_clients[game_id].source_id == game_id

    def test_lol_client_alias(self, update_service_v2: UpdateServiceV2) -> None:
        """Test lol_client is an alias to game_clients['lol']."""
        assert update_service_v2.lol_client is update_service_v2.game_clients["lol"]

    def test_tft_client_base_url(self, update_service_v2: UpdateServiceV2) -> None:
        """Test TFT client has correct base URL."""
        tft_client = update_service_v2.game_clients["tft"]
        assert tft_client.base_url == GAME_DOMAINS["tft"]

    def test_wildrift_client_base_url(self, update_service_v2: UpdateServiceV2) -> None:
        """Test Wild Rift client has correct base URL."""
        wr_client = update_service_v2.game_clients["wildrift"]
        assert wr_client.base_url == GAME_DOMAINS["wildrift"]

    def test_rate_limits_include_game_domains(self, update_service_v2: UpdateServiceV2) -> None:
        """Test rate limits exist for all game domains."""
        assert "teamfighttactics.leagueoflegends.com" in update_service_v2.DEFAULT_RATE_LIMITS
        assert "wildrift.leagueoflegends.com" in update_service_v2.DEFAULT_RATE_LIMITS


class TestCreateTasks:
    """Tests for task creation with category support."""

    @pytest.mark.asyncio
    async def test_create_tasks_includes_categories_for_games(
        self, update_service_v2: UpdateServiceV2
    ) -> None:
        """Test that game sources get tasks for main + each category."""
        tasks = await update_service_v2._create_tasks(locales=["en-us"], source_ids=["lol"])

        # Should have: 1 main + len(LOL_NEWS_CATEGORIES) category tasks
        expected_count = 1 + len(GAME_CATEGORIES["lol"])
        assert len(tasks) == expected_count

        # First task should be main (news_category=None)
        main_tasks = [t for t in tasks if t.news_category is None]
        assert len(main_tasks) == 1

        # Category tasks should match config
        cat_tasks = [t for t in tasks if t.news_category is not None]
        assert len(cat_tasks) == len(GAME_CATEGORIES["lol"])
        cat_slugs = {t.news_category for t in cat_tasks}
        assert cat_slugs == set(GAME_CATEGORIES["lol"])

    @pytest.mark.asyncio
    async def test_create_tasks_includes_all_games(
        self, update_service_v2: UpdateServiceV2
    ) -> None:
        """Test that tasks are created for lol, tft, and wildrift."""
        tasks = await update_service_v2._create_tasks(
            locales=["en-us"], source_ids=["lol", "tft", "wildrift"]
        )

        source_ids = {t.source_id for t in tasks}
        assert "lol" in source_ids
        assert "tft" in source_ids
        assert "wildrift" in source_ids

    @pytest.mark.asyncio
    async def test_create_tasks_tft_categories(self, update_service_v2: UpdateServiceV2) -> None:
        """Test TFT gets its own category set."""
        tasks = await update_service_v2._create_tasks(locales=["en-us"], source_ids=["tft"])
        expected_count = 1 + len(GAME_CATEGORIES["tft"])
        assert len(tasks) == expected_count

    @pytest.mark.asyncio
    async def test_create_tasks_multiple_locales(self, update_service_v2: UpdateServiceV2) -> None:
        """Test that tasks are created for each locale."""
        locales = ["en-us", "it-it"]
        tasks = await update_service_v2._create_tasks(locales=locales, source_ids=["lol"])

        # Each locale gets main + categories
        expected_per_locale = 1 + len(GAME_CATEGORIES["lol"])
        assert len(tasks) == expected_per_locale * len(locales)

    @pytest.mark.asyncio
    async def test_create_tasks_non_game_source_no_categories(
        self, update_service_v2: UpdateServiceV2
    ) -> None:
        """Test non-game sources get one task per locale (no categories)."""
        tasks = await update_service_v2._create_tasks(locales=["en-us"], source_ids=["dexerto"])

        # Should be exactly 1 task (one locale, no categories)
        assert len(tasks) == 1
        assert tasks[0].news_category is None


class TestUpdateTaskHash:
    """Tests for UpdateTask hash and equality."""

    def test_task_hash_includes_news_category(self) -> None:
        """Test that tasks with different categories have different hashes."""
        task_main = UpdateTask(
            priority=UpdatePriority.CRITICAL,
            source_id="lol",
            locale="en-us",
            category=SourceCategory.OFFICIAL_RIOT,
            news_category=None,
        )
        task_cat = UpdateTask(
            priority=UpdatePriority.CRITICAL,
            source_id="lol",
            locale="en-us",
            category=SourceCategory.OFFICIAL_RIOT,
            news_category="game-updates",
        )
        assert hash(task_main) != hash(task_cat)

    def test_same_task_same_hash(self) -> None:
        """Test that identical tasks have the same hash."""
        task1 = UpdateTask(
            priority=UpdatePriority.MEDIUM,
            source_id="tft",
            locale="ko-kr",
            category=SourceCategory.TFT,
            news_category="dev",
        )
        task2 = UpdateTask(
            priority=UpdatePriority.MEDIUM,
            source_id="tft",
            locale="ko-kr",
            category=SourceCategory.TFT,
            news_category="dev",
        )
        assert hash(task1) == hash(task2)


class TestUpdateSourceRouting:
    """Tests for _update_source routing to correct client."""

    @pytest.mark.asyncio
    async def test_routes_lol_to_lol_client(
        self, update_service_v2: UpdateServiceV2, mock_repository_v2: AsyncMock
    ) -> None:
        """Test that lol tasks route to lol game client."""
        mock_client = AsyncMock()
        mock_client.fetch_news = AsyncMock(return_value=[])
        update_service_v2.game_clients["lol"] = mock_client

        task = UpdateTask(
            priority=UpdatePriority.CRITICAL,
            source_id="lol",
            locale="en-us",
            category=SourceCategory.OFFICIAL_RIOT,
        )

        await update_service_v2._update_source(task)
        mock_client.fetch_news.assert_called_once_with("en-us", category=None)

    @pytest.mark.asyncio
    async def test_routes_tft_to_tft_client(
        self, update_service_v2: UpdateServiceV2, mock_repository_v2: AsyncMock
    ) -> None:
        """Test that tft tasks route to tft game client."""
        mock_client = AsyncMock()
        mock_client.fetch_news = AsyncMock(return_value=[])
        update_service_v2.game_clients["tft"] = mock_client

        task = UpdateTask(
            priority=UpdatePriority.MEDIUM,
            source_id="tft",
            locale="en-us",
            category=SourceCategory.TFT,
            news_category="game-updates",
        )

        await update_service_v2._update_source(task)
        mock_client.fetch_news.assert_called_once_with("en-us", category="game-updates")

    @pytest.mark.asyncio
    async def test_routes_wildrift_to_wildrift_client(
        self, update_service_v2: UpdateServiceV2, mock_repository_v2: AsyncMock
    ) -> None:
        """Test that wildrift tasks route to wildrift game client."""
        mock_client = AsyncMock()
        mock_client.fetch_news = AsyncMock(return_value=[])
        update_service_v2.game_clients["wildrift"] = mock_client

        task = UpdateTask(
            priority=UpdatePriority.CRITICAL,
            source_id="wildrift",
            locale="ko-kr",
            category=SourceCategory.OFFICIAL_RIOT,
            news_category="dev",
        )

        await update_service_v2._update_source(task)
        mock_client.fetch_news.assert_called_once_with("ko-kr", category="dev")

    @pytest.mark.asyncio
    async def test_saves_fetched_articles(
        self, update_service_v2: UpdateServiceV2, mock_repository_v2: AsyncMock
    ) -> None:
        """Test that fetched articles are saved to the repository."""
        mock_articles = [
            Article(
                title="TFT Patch",
                url="http://test.com/tft",
                pub_date=datetime.utcnow(),
                guid="tft-1",
                source=ArticleSource.create("tft", "en-us"),
                categories=["Game Updates"],
            )
        ]

        mock_client = AsyncMock()
        mock_client.fetch_news = AsyncMock(return_value=mock_articles)
        update_service_v2.game_clients["tft"] = mock_client

        task = UpdateTask(
            priority=UpdatePriority.MEDIUM,
            source_id="tft",
            locale="en-us",
            category=SourceCategory.TFT,
        )

        new_count = await update_service_v2._update_source(task)

        assert new_count == 1
        mock_repository_v2.save.assert_called_once()
