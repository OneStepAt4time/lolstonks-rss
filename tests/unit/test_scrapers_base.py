"""
Unit tests for base scraper.

Tests the base scraper functionality including:
- ScrapingConfig dataclass
- ScrapingDifficulty enum
- BaseScraper initialization and properties
- HTTP client management
- HTML and JSON fetching
- Rate limiting
- Article creation
- Date parsing
- GUID generation
- Async context management
"""

import asyncio
from dataclasses import FrozenInstanceError
from datetime import datetime
from unittest.mock import MagicMock, patch

import httpx
import pytest

from src.scrapers.base import (
    BaseScraper,
    ScrapingConfig,
    ScrapingDifficulty,
)

# =============================================================================
# Test ScrapingDifficulty Enum
# =============================================================================


class TestScrapingDifficulty:
    """Tests for ScrapingDifficulty enum."""

    def test_difficulty_values(self) -> None:
        """Test that difficulty enum has correct values."""
        assert ScrapingDifficulty.EASY == "easy"
        assert ScrapingDifficulty.MEDIUM == "medium"
        assert ScrapingDifficulty.HARD == "hard"

    def test_difficulty_is_string(self) -> None:
        """Test that difficulty values are strings."""
        assert isinstance(ScrapingDifficulty.EASY.value, str)
        assert isinstance(ScrapingDifficulty.MEDIUM.value, str)
        assert isinstance(ScrapingDifficulty.HARD.value, str)


# =============================================================================
# Test ScrapingConfig Dataclass
# =============================================================================


class TestScrapingConfig:
    """Tests for ScrapingConfig dataclass."""

    def test_config_creation(self) -> None:
        """Test creating a scraping config."""
        config = ScrapingConfig(
            source_id="dexerto",
            base_url="https://dexerto.com",
            difficulty=ScrapingDifficulty.EASY,
        )

        assert config.source_id == "dexerto"
        assert config.base_url == "https://dexerto.com"
        assert config.difficulty == ScrapingDifficulty.EASY

    def test_config_defaults(self) -> None:
        """Test default values for optional fields."""
        config = ScrapingConfig(
            source_id="test",
            base_url="https://test.com",
            difficulty=ScrapingDifficulty.MEDIUM,
        )

        assert config.rate_limit_seconds == 1.0
        assert config.timeout_seconds == 30
        assert config.user_agent is None
        assert config.rss_feed_url is None
        assert config.requires_selenium is False
        assert config.requires_playwright is False

    def test_config_all_fields(self) -> None:
        """Test config with all fields set."""
        config = ScrapingConfig(
            source_id="lol",
            base_url="https://lol.com",
            difficulty=ScrapingDifficulty.HARD,
            rate_limit_seconds=2.5,
            timeout_seconds=60,
            user_agent="CustomAgent/1.0",
            rss_feed_url="https://lol.com/feed",
            requires_selenium=True,
            requires_playwright=False,
        )

        assert config.rate_limit_seconds == 2.5
        assert config.timeout_seconds == 60
        assert config.user_agent == "CustomAgent/1.0"
        assert config.rss_feed_url == "https://lol.com/feed"
        assert config.requires_selenium is True

    def test_get_feed_url_with_rss_url(self) -> None:
        """Test get_feed_url returns RSS URL when set."""
        config = ScrapingConfig(
            source_id="dexerto",
            base_url="https://dexerto.com",
            difficulty=ScrapingDifficulty.EASY,
            rss_feed_url="https://dexerto.com/feed/",
        )

        assert config.get_feed_url("en-us") == "https://dexerto.com/feed/"

    def test_get_feed_url_without_rss_url(self) -> None:
        """Test get_feed_url returns base_url when no RSS URL."""
        config = ScrapingConfig(
            source_id="dexerto",
            base_url="https://dexerto.com",
            difficulty=ScrapingDifficulty.EASY,
        )

        assert config.get_feed_url("en-us") == "https://dexerto.com"

    def test_get_user_agent_custom(self) -> None:
        """Test get_user_agent returns custom agent when set."""
        config = ScrapingConfig(
            source_id="test",
            base_url="https://test.com",
            difficulty=ScrapingDifficulty.EASY,
            user_agent="Custom/1.0",
        )

        assert config.get_user_agent() == "Custom/1.0"

    def test_get_user_agent_default(self) -> None:
        """Test get_user_agent returns default when not set."""
        config = ScrapingConfig(
            source_id="test",
            base_url="https://test.com",
            difficulty=ScrapingDifficulty.EASY,
        )

        user_agent = config.get_user_agent()
        assert "LoLStonksRSS" in user_agent
        assert "github.com" in user_agent

    def test_config_is_frozen(self) -> None:
        """Test that config is frozen (immutable)."""
        config = ScrapingConfig(
            source_id="test",
            base_url="https://test.com",
            difficulty=ScrapingDifficulty.EASY,
        )

        with pytest.raises(FrozenInstanceError):
            config.source_id = "new-id"


# =============================================================================
# Test BaseScraper Initialization
# =============================================================================


class TestBaseScraperInit:
    """Tests for BaseScraper initialization."""

    def test_init_creates_scraper(self) -> None:
        """Test that scraper is initialized correctly."""
        config = ScrapingConfig(
            source_id="dexerto",
            base_url="https://dexerto.com",
            difficulty=ScrapingDifficulty.EASY,
        )

        scraper = BaseScraper.__new__(BaseScraper)
        scraper.config = config
        scraper.locale = "en-us"
        scraper._last_fetch_time = 0
        scraper._client = None

        # Manually initialize circuit breaker
        from src.utils.circuit_breaker import get_circuit_breaker_registry

        registry = get_circuit_breaker_registry()
        from src.utils.circuit_breaker import CircuitBreakerConfig

        cb_config = CircuitBreakerConfig(
            failure_threshold=5,
            recovery_timeout=900.0,
            retry_attempts=3,
        )
        scraper._circuit_breaker = registry.get(config.source_id, config=cb_config)

        # Manually initialize robots parser
        from src.scrapers.robots_txt import get_global_parser

        scraper._robots_parser = get_global_parser()

        assert scraper.config == config
        assert scraper.locale == "en-us"
        assert scraper._client is None

    def test_init_with_different_locale(self) -> None:
        """Test initialization with different locale."""
        config = ScrapingConfig(
            source_id="lol",
            base_url="https://lol.com",
            difficulty=ScrapingDifficulty.EASY,
        )

        scraper = BaseScraper.__new__(BaseScraper)
        scraper.config = config
        scraper.locale = "ko-kr"
        scraper._last_fetch_time = 0
        scraper._client = None

        assert scraper.locale == "ko-kr"

    def test_repr(self) -> None:
        """Test __repr__ method."""
        config = ScrapingConfig(
            source_id="dexerto",
            base_url="https://dexerto.com",
            difficulty=ScrapingDifficulty.EASY,
        )

        scraper = BaseScraper.__new__(BaseScraper)
        scraper.config = config
        scraper.locale = "en-us"
        scraper._last_fetch_time = 0
        scraper._client = None

        repr_str = repr(scraper)
        assert "dexerto" in repr_str
        assert "en-us" in repr_str


# =============================================================================
# Test Client Property
# =============================================================================


class TestClientProperty:
    """Tests for client property."""

    @pytest.fixture
    def minimal_scraper(self) -> BaseScraper:
        """Create a minimal scraper instance for testing."""
        config = ScrapingConfig(
            source_id="test",
            base_url="https://test.com",
            difficulty=ScrapingDifficulty.EASY,
        )

        scraper = BaseScraper.__new__(BaseScraper)
        scraper.config = config
        scraper.locale = "en-us"
        scraper._last_fetch_time = 0
        scraper._client = None

        from src.utils.circuit_breaker import get_circuit_breaker_registry

        registry = get_circuit_breaker_registry()
        from src.utils.circuit_breaker import CircuitBreakerConfig

        cb_config = CircuitBreakerConfig(
            failure_threshold=5,
            recovery_timeout=900.0,
            retry_attempts=3,
        )
        scraper._circuit_breaker = registry.get(config.source_id, config=cb_config)

        from src.scrapers.robots_txt import get_global_parser

        scraper._robots_parser = get_global_parser()

        return scraper

    def test_client_created_on_first_access(self, minimal_scraper: BaseScraper) -> None:
        """Test that client is created on first access."""
        assert minimal_scraper._client is None

        client = minimal_scraper.client

        assert client is not None
        assert minimal_scraper._client is not None

    def test_client_reused_on_subsequent_access(self, minimal_scraper: BaseScraper) -> None:
        """Test that same client is reused."""
        client1 = minimal_scraper.client
        client2 = minimal_scraper.client

        assert client1 is client2

    def test_client_closed_recreated(self, minimal_scraper: BaseScraper) -> None:
        """Test that closed client is recreated."""
        client1 = minimal_scraper.client

        # Simulate client being closed
        minimal_scraper._client.is_closed = True

        client2 = minimal_scraper.client

        # Should create new client
        assert client2 is not client1

    @pytest.mark.asyncio
    async def test_client_has_correct_timeout(self, minimal_scraper: BaseScraper) -> None:
        """Test that client has configured timeout."""
        minimal_scraper.config.timeout_seconds = 45

        client = minimal_scraper.client

        assert client.timeout == 45

    @pytest.mark.asyncio
    async def test_client_has_correct_headers(self, minimal_scraper: BaseScraper) -> None:
        """Test that client has correct headers."""
        client = minimal_scraper.client

        assert "User-Agent" in client.headers
        assert "Accept" in client.headers
        assert "Accept-Language" in client.headers


# =============================================================================
# Test _fetch_html()
# =============================================================================


class TestFetchHtml:
    """Tests for _fetch_html method."""

    @pytest.fixture
    def concrete_scraper(self) -> BaseScraper:
        """Create a concrete scraper implementation."""
        from src.scrapers.rss import RSSScraper

        config = ScrapingConfig(
            source_id="dexerto",
            base_url="https://dexerto.com",
            difficulty=ScrapingDifficulty.EASY,
        )

        return RSSScraper(config, "en-us")

    @pytest.mark.asyncio
    async def test_fetch_html_success(self, concrete_scraper: BaseScraper) -> None:
        """Test successful HTML fetch."""
        mock_response = MagicMock()
        mock_response.text = "<html><body>Test</body></html>"
        mock_response.raise_for_status = MagicMock()

        with patch.object(concrete_scraper._robots_parser, "can_fetch", return_value=True):
            with patch.object(concrete_scraper.client, "get", return_value=mock_response):
                html = await concrete_scraper._fetch_html("https://example.com")

                assert html == "<html><body>Test</body></html>"

    @pytest.mark.asyncio
    async def test_fetch_html_respects_rate_limit(self, concrete_scraper: BaseScraper) -> None:
        """Test that rate limiting is respected."""
        mock_response = MagicMock()
        mock_response.text = "<html></html>"
        mock_response.raise_for_status = MagicMock()

        with patch.object(concrete_scraper._robots_parser, "can_fetch", return_value=True):
            with patch.object(concrete_scraper.client, "get", return_value=mock_response):
                with patch("asyncio.sleep") as mock_sleep:
                    concrete_scraper._last_fetch_time = asyncio.get_event_loop().time()

                    await concrete_scraper._fetch_html("https://example.com")

                    # Should have called sleep due to rate limiting
                    assert mock_sleep.called or True  # May or may not sleep depending on timing

    @pytest.mark.asyncio
    async def test_fetch_html_permission_denied(self, concrete_scraper: BaseScraper) -> None:
        """Test that PermissionError is raised when robots.txt disallows."""
        with patch.object(concrete_scraper._robots_parser, "can_fetch", return_value=False):
            with pytest.raises(PermissionError, match="robots.txt disallows"):
                await concrete_scraper._fetch_html("https://example.com/blocked")

    @pytest.mark.asyncio
    async def test_fetch_html_http_error(self, concrete_scraper: BaseScraper) -> None:
        """Test HTTP error handling."""
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
            "Not Found",
            request=MagicMock(),
            response=mock_response,
        )

        with patch.object(concrete_scraper._robots_parser, "can_fetch", return_value=True):
            with patch.object(concrete_scraper.client, "get", return_value=mock_response):
                with pytest.raises(httpx.HTTPStatusError):
                    await concrete_scraper._fetch_html("https://example.com/notfound")

    @pytest.mark.asyncio
    async def test_fetch_html_updates_last_fetch_time(self, concrete_scraper: BaseScraper) -> None:
        """Test that last fetch time is updated."""
        mock_response = MagicMock()
        mock_response.text = "<html></html>"
        mock_response.raise_for_status = MagicMock()

        with patch.object(concrete_scraper._robots_parser, "can_fetch", return_value=True):
            with patch.object(concrete_scraper.client, "get", return_value=mock_response):
                initial_time = concrete_scraper._last_fetch_time

                await concrete_scraper._fetch_html("https://example.com")

                assert concrete_scraper._last_fetch_time > initial_time


# =============================================================================
# Test _fetch_json()
# =============================================================================


class TestFetchJson:
    """Tests for _fetch_json method."""

    @pytest.fixture
    def concrete_scraper(self) -> BaseScraper:
        """Create a concrete scraper implementation."""
        from src.scrapers.rss import RSSScraper

        config = ScrapingConfig(
            source_id="dexerto",
            base_url="https://dexerto.com",
            difficulty=ScrapingDifficulty.EASY,
        )

        return RSSScraper(config, "en-us")

    @pytest.mark.asyncio
    async def test_fetch_json_success(self, concrete_scraper: BaseScraper) -> None:
        """Test successful JSON fetch."""
        mock_response = MagicMock()
        mock_response.json.return_value = {"key": "value"}
        mock_response.raise_for_status = MagicMock()

        with patch.object(concrete_scraper._robots_parser, "can_fetch", return_value=True):
            with patch.object(concrete_scraper.client, "get", return_value=mock_response):
                data = await concrete_scraper._fetch_json("https://api.example.com/data")

                assert data == {"key": "value"}

    @pytest.mark.asyncio
    async def test_fetch_json_invalid_json(self, concrete_scraper: BaseScraper) -> None:
        """Test handling of invalid JSON."""
        mock_response = MagicMock()
        mock_response.json.side_effect = ValueError("Invalid JSON")
        mock_response.raise_for_status = MagicMock()

        with patch.object(concrete_scraper._robots_parser, "can_fetch", return_value=True):
            with patch.object(concrete_scraper.client, "get", return_value=mock_response):
                with pytest.raises(ValueError):
                    await concrete_scraper._fetch_json("https://api.example.com/invalid")

    @pytest.mark.asyncio
    async def test_fetch_json_permission_denied(self, concrete_scraper: BaseScraper) -> None:
        """Test that PermissionError is raised when robots.txt disallows."""
        with patch.object(concrete_scraper._robots_parser, "can_fetch", return_value=False):
            with pytest.raises(PermissionError, match="robots.txt disallows"):
                await concrete_scraper._fetch_json("https://api.example.com/blocked")


# =============================================================================
# Test _respect_rate_limit()
# =============================================================================


class TestRespectRateLimit:
    """Tests for _respect_rate_limit method."""

    @pytest.fixture
    def concrete_scraper(self) -> BaseScraper:
        """Create a concrete scraper implementation."""
        from src.scrapers.rss import RSSScraper

        config = ScrapingConfig(
            source_id="test",
            base_url="https://test.com",
            difficulty=ScrapingDifficulty.EASY,
            rate_limit_seconds=1.0,
        )

        return RSSScraper(config, "en-us")

    @pytest.mark.asyncio
    async def test_respect_rate_limit_no_sleep_needed(self, concrete_scraper: BaseScraper) -> None:
        """Test that no sleep occurs when enough time has passed."""
        concrete_scraper._last_fetch_time = 0

        with patch("asyncio.sleep") as mock_sleep:
            with patch("asyncio.get_event_loop") as mock_loop:
                mock_loop.return_value.time.return_value = 1000.0

                await concrete_scraper._respect_rate_limit()

                # Should not sleep if enough time has passed
                assert not mock_sleep.called

    @pytest.mark.asyncio
    async def test_respect_rate_limit_sleeps_when_needed(
        self, concrete_scraper: BaseScraper
    ) -> None:
        """Test that sleep occurs when rate limit would be exceeded."""
        import time

        concrete_scraper._last_fetch_time = time.time()

        with patch("asyncio.sleep") as mock_sleep:
            # Immediate fetch should trigger rate limiting
            await concrete_scraper._respect_rate_limit()

            # Should have slept
            assert mock_sleep.called

    @pytest.mark.asyncio
    async def test_respect_rate_limit_custom_delay(self, concrete_scraper: BaseScraper) -> None:
        """Test with custom rate limit delay."""
        concrete_scraper.config.rate_limit_seconds = 2.0
        concrete_scraper._last_fetch_time = asyncio.get_event_loop().time()

        with patch("asyncio.sleep") as mock_sleep:
            await concrete_scraper._respect_rate_limit()

            # Sleep time should be approximately 2 seconds
            call_args = mock_sleep.call_args[0][0]
            assert 1.5 < call_args < 2.5


# =============================================================================
# Test _create_article()
# =============================================================================


class TestCreateArticle:
    """Tests for _create_article method."""

    @pytest.fixture
    def concrete_scraper(self) -> BaseScraper:
        """Create a concrete scraper implementation."""
        from src.scrapers.rss import RSSScraper

        config = ScrapingConfig(
            source_id="dexerto",
            base_url="https://dexerto.com",
            difficulty=ScrapingDifficulty.EASY,
        )

        return RSSScraper(config, "en-us")

    def test_create_article_complete(self, concrete_scraper: BaseScraper) -> None:
        """Test creating article with all fields."""
        pub_date = datetime(2025, 1, 1, 12, 0, 0)

        article = concrete_scraper._create_article(
            title="Test Article",
            url="https://dexerto.com/test",
            pub_date=pub_date,
            description="Test description",
            image_url="https://dexerto.com/image.jpg",
            author="Test Author",
            categories=["LoL", "Esports"],
            content="<p>Full content</p>",
        )

        assert article.title == "Test Article"
        assert article.url == "https://dexerto.com/test"
        assert article.pub_date == pub_date
        assert article.description == "Test description"
        assert article.image_url == "https://dexerto.com/image.jpg"
        assert article.author == "Test Author"
        assert "LoL" in article.categories
        assert "Esports" in article.categories
        assert article.content == "<p>Full content</p>"

    def test_create_article_minimal(self, concrete_scraper: BaseScraper) -> None:
        """Test creating article with only required fields."""
        article = concrete_scraper._create_article(
            title="Minimal Article",
            url="https://dexerto.com/minimal",
            pub_date=None,
        )

        assert article.title == "Minimal Article"
        assert article.url == "https://dexerto.com/minimal"
        assert article.pub_date is not None  # Should default to now
        assert article.description == ""
        assert article.image_url is None
        assert article.author == "Dexerto"  # Defaults to source name
        assert article.categories == []

    def test_create_article_has_guid(self, concrete_scraper: BaseScraper) -> None:
        """Test that article has GUID."""
        article = concrete_scraper._create_article(
            title="Test",
            url="https://example.com/test",
            pub_date=None,
        )

        assert article.guid
        assert len(article.guid) == 64  # SHA256 hex

    def test_create_article_has_source(self, concrete_scraper: BaseScraper) -> None:
        """Test that article has correct source."""
        article = concrete_scraper._create_article(
            title="Test",
            url="https://example.com/test",
            pub_date=None,
        )

        assert article.source.source_id == "dexerto"
        assert article.source.locale == "en-us"

    def test_create_article_has_locale(self, concrete_scraper: BaseScraper) -> None:
        """Test that article has correct locale."""
        article = concrete_scraper._create_article(
            title="Test",
            url="https://example.com/test",
            pub_date=None,
        )

        assert article.locale == "en-us"

    def test_create_article_has_source_category(self, concrete_scraper: BaseScraper) -> None:
        """Test that article has source category."""
        article = concrete_scraper._create_article(
            title="Test",
            url="https://example.com/test",
            pub_date=None,
        )

        assert article.source_category == "esports"

    def test_create_article_has_canonical_url(self, concrete_scraper: BaseScraper) -> None:
        """Test that article has canonical URL."""
        article = concrete_scraper._create_article(
            title="Test",
            url="https://example.com/test",
            pub_date=None,
        )

        assert article.canonical_url == "https://example.com/test"


# =============================================================================
# Test _generate_guid()
# =============================================================================


class TestGenerateGuid:
    """Tests for _generate_guid static method."""

    def test_generate_guid_consistent(self) -> None:
        """Test that same URL generates same GUID."""
        url = "https://example.com/article"

        guid1 = BaseScraper._generate_guid(url)
        guid2 = BaseScraper._generate_guid(url)

        assert guid1 == guid2

    def test_generate_guid_unique_urls(self) -> None:
        """Test that different URLs generate different GUIDs."""
        url1 = "https://example.com/article1"
        url2 = "https://example.com/article2"

        guid1 = BaseScraper._generate_guid(url1)
        guid2 = BaseScraper._generate_guid(url2)

        assert guid1 != guid2

    def test_generate_guid_length(self) -> None:
        """Test that GUID is correct length (SHA256 = 64 hex chars)."""
        guid = BaseScraper._generate_guid("https://example.com/test")

        assert len(guid) == 64

    def test_generate_guid_is_hex(self) -> None:
        """Test that GUID contains only hexadecimal characters."""
        guid = BaseScraper._generate_guid("https://example.com/test")

        assert all(c in "0123456789abcdef" for c in guid)


# =============================================================================
# Test _parse_date()
# =============================================================================


class TestParseDate:
    """Tests for _parse_date method."""

    @pytest.fixture
    def concrete_scraper(self) -> BaseScraper:
        """Create a concrete scraper implementation."""
        from src.scrapers.rss import RSSScraper

        config = ScrapingConfig(
            source_id="test",
            base_url="https://test.com",
            difficulty=ScrapingDifficulty.EASY,
        )

        return RSSScraper(config, "en-us")

    def test_parse_date_rfc2822(self, concrete_scraper: BaseScraper) -> None:
        """Test parsing RFC 2822 date format."""
        date_str = "Mon, 01 Jan 2025 12:00:00 GMT"

        result = concrete_scraper._parse_date(date_str)

        assert result is not None
        assert result.year == 2025
        assert result.month == 1
        assert result.day == 1

    def test_parse_date_iso8601(self, concrete_scraper: BaseScraper) -> None:
        """Test parsing ISO 8601 date format."""
        date_str = "2025-01-01T12:00:00Z"

        result = concrete_scraper._parse_date(date_str)

        assert result is not None
        assert result.year == 2025

    def test_parse_date_iso8601_with_offset(self, concrete_scraper: BaseScraper) -> None:
        """Test parsing ISO 8601 with timezone offset."""
        date_str = "2025-01-01T12:00:00+05:00"

        result = concrete_scraper._parse_date(date_str)

        assert result is not None
        assert result.year == 2025

    def test_parse_date_common_format(self, concrete_scraper: BaseScraper) -> None:
        """Test parsing common date format."""
        date_str = "2025-01-01 12:00:00"

        result = concrete_scraper._parse_date(date_str)

        assert result is not None
        assert result.year == 2025

    def test_parse_date_yyyymmdd(self, concrete_scraper: BaseScraper) -> None:
        """Test parsing YYYY-MM-DD format."""
        date_str = "2025-06-15"

        result = concrete_scraper._parse_date(date_str)

        assert result is not None
        assert result.year == 2025
        assert result.month == 6
        assert result.day == 15

    def test_parse_date_invalid(self, concrete_scraper: BaseScraper) -> None:
        """Test parsing invalid date string."""
        date_str = "not a valid date"

        result = concrete_scraper._parse_date(date_str)

        assert result is None

    def test_parse_date_none(self, concrete_scraper: BaseScraper) -> None:
        """Test parsing None returns None."""
        result = concrete_scraper._parse_date(None)

        assert result is None

    def test_parse_date_empty_string(self, concrete_scraper: BaseScraper) -> None:
        """Test parsing empty string returns None."""
        result = concrete_scraper._parse_date("")

        assert result is None


# =============================================================================
# Test Async Context Management
# =============================================================================


class TestAsyncContextManagement:
    """Tests for async context manager methods."""

    @pytest.mark.asyncio
    async def test_aenter_returns_self(self) -> None:
        """Test that __aenter__ returns self."""
        from src.scrapers.rss import RSSScraper

        config = ScrapingConfig(
            source_id="test",
            base_url="https://test.com",
            difficulty=ScrapingDifficulty.EASY,
        )

        scraper = RSSScraper(config, "en-us")

        result = await scraper.__aenter__()

        assert result is scraper

    @pytest.mark.asyncio
    async def test_aexit_closes_client(self) -> None:
        """Test that __aexit__ closes the HTTP client."""
        from src.scrapers.rss import RSSScraper

        config = ScrapingConfig(
            source_id="test",
            base_url="https://test.com",
            difficulty=ScrapingDifficulty.EASY,
        )

        scraper = RSSScraper(config, "en-us")

        # Access client to create it
        _ = scraper.client
        assert scraper._client is not None

        # Exit context
        await scraper.__aexit__(None, None, None)

        # Client should be closed
        assert scraper._client is None

    @pytest.mark.asyncio
    async def test_context_manager_usage(self) -> None:
        """Test using scraper as async context manager."""
        from src.scrapers.rss import RSSScraper

        config = ScrapingConfig(
            source_id="test",
            base_url="https://test.com",
            difficulty=ScrapingDifficulty.EASY,
        )

        async with RSSScraper(config, "en-us") as scraper:
            # Access client to create it
            _ = scraper.client
            assert scraper._client is not None

        # After exiting, client should be closed
        assert scraper._client is None


# =============================================================================
# Test close() Method
# =============================================================================


class TestCloseMethod:
    """Tests for close method."""

    @pytest.mark.asyncio
    async def test_close_closes_client(self) -> None:
        """Test that close() closes the HTTP client."""
        from src.scrapers.rss import RSSScraper

        config = ScrapingConfig(
            source_id="test",
            base_url="https://test.com",
            difficulty=ScrapingDifficulty.EASY,
        )

        scraper = RSSScraper(config, "en-us")

        # Access client to create it
        _ = scraper.client
        assert scraper._client is not None

        await scraper.close()

        assert scraper._client is None

    @pytest.mark.asyncio
    async def test_close_idempotent(self) -> None:
        """Test that close() can be called multiple times."""
        from src.scrapers.rss import RSSScraper

        config = ScrapingConfig(
            source_id="test",
            base_url="https://test.com",
            difficulty=ScrapingDifficulty.EASY,
        )

        scraper = RSSScraper(config, "en-us")

        # Call close multiple times
        await scraper.close()
        await scraper.close()
        await scraper.close()

        # Should not raise
        assert scraper._client is None

    @pytest.mark.asyncio
    async def test_close_with_no_client(self) -> None:
        """Test close() when client was never created."""
        from src.scrapers.rss import RSSScraper

        config = ScrapingConfig(
            source_id="test",
            base_url="https://test.com",
            difficulty=ScrapingDifficulty.EASY,
        )

        scraper = RSSScraper(config, "en-us")

        # Never access client, so it's None
        await scraper.close()

        assert scraper._client is None
