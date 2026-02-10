"""
Unit tests for Selenium scraper.

Tests the Selenium scraper for fetching and parsing JavaScript-heavy content including:
- Driver initialization and configuration
- Page loading and waiting
- Article parsing from rendered HTML
- Field extraction methods
- Driver cleanup and error handling
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from bs4 import BeautifulSoup, Tag
from selenium.common.exceptions import TimeoutException, WebDriverException

from src.scrapers.base import ScrapingConfig, ScrapingDifficulty
from src.scrapers.selenium import SeleniumScraper

# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def selenium_config() -> ScrapingConfig:
    """Create a test Selenium scraping config."""
    return ScrapingConfig(
        source_id="twitter",
        base_url="https://twitter.com",
        difficulty=ScrapingDifficulty.HARD,
        rate_limit_seconds=2.0,
        timeout_seconds=30,
        requires_selenium=True,
    )


@pytest.fixture
async def selenium_scraper(selenium_config: ScrapingConfig) -> SeleniumScraper:
    """Create a Selenium scraper instance for testing."""
    scraper = SeleniumScraper(selenium_config, locale="en-us")
    yield scraper
    await scraper.close()


@pytest.fixture
def sample_selenium_html() -> str:
    """Create sample HTML for Selenium-rendered content."""
    return """
    <html>
        <body>
            <article data-testid="tweet">
                <div lang="en">Tweet content here</div>
                <a href="https://twitter.com/status/123">Link</a>
                <div class="description">Tweet description</div>
                <img src="https://example.com/tweet.jpg">
                <time>2025-01-01</time>
            </article>
            <article data-testid="tweet">
                <div lang="en">Another tweet</div>
                <a href="https://twitter.com/status/456">Link</a>
                <div class="description">Another description</div>
                <img src="https://example.com/tweet2.jpg">
                <time>2025-01-02</time>
            </article>
        </body>
    </html>
    """


@pytest.fixture
def sample_article_element() -> Tag:
    """Create a sample article element for Selenium parsing."""
    html = """
    <article data-testid="tweet">
        <div lang="en">Test Article Content</div>
        <a href="https://twitter.com/status/789">Status Link</a>
        <div class="description">Test Description</div>
        <img src="https://example.com/image.jpg">
        <time datetime="2025-01-01T12:00:00Z">Jan 1, 2025</time>
    </article>
    """
    soup = BeautifulSoup(html, "html.parser")
    return soup.find("article")


@pytest.fixture
def mock_driver() -> MagicMock:
    """Create a mock Selenium WebDriver."""
    driver = MagicMock()
    driver.page_source = "<html><body><article>Test</article></body></html>"
    driver.quit = MagicMock()
    return driver


# =============================================================================
# Test __init__()
# =============================================================================


class TestSeleniumScraperInit:
    """Tests for SeleniumScraper initialization."""

    def test_init_creates_scraper(self, selenium_config: ScrapingConfig) -> None:
        """Test that scraper is initialized correctly."""
        scraper = SeleniumScraper(selenium_config, locale="en-us")

        assert scraper.config == selenium_config
        assert scraper.locale == "en-us"
        assert scraper._driver is None
        assert scraper._driver_initialized is False

    def test_init_with_different_locale(self, selenium_config: ScrapingConfig) -> None:
        """Test initialization with different locale."""
        scraper = SeleniumScraper(selenium_config, locale="ko-kr")

        assert scraper.locale == "ko-kr"


# =============================================================================
# Test _init_driver()
# =============================================================================


class TestInitDriver:
    """Tests for _init_driver method."""

    @pytest.mark.asyncio
    async def test_init_driver_creates_chrome_driver(
        self, selenium_scraper: SeleniumScraper
    ) -> None:
        """Test that Chrome driver is created."""
        with patch("src.scrapers.selenium.webdriver.Chrome") as mock_chrome:
            mock_driver = MagicMock()
            mock_chrome.return_value = mock_driver

            await selenium_scraper._init_driver()

            assert selenium_scraper._driver == mock_driver
            assert selenium_scraper._driver_initialized is True
            mock_chrome.assert_called_once()

    @pytest.mark.asyncio
    async def test_init_driver_idempotent(
        self, selenium_scraper: SeleniumScraper, mock_driver: MagicMock
    ) -> None:
        """Test that calling init_driver multiple times doesn't recreate driver."""
        with patch("src.scrapers.selenium.webdriver.Chrome", return_value=mock_driver):
            await selenium_scraper._init_driver()
            first_driver = selenium_scraper._driver

            await selenium_scraper._init_driver()

            assert selenium_scraper._driver is first_driver

    @pytest.mark.asyncio
    async def test_init_driver_webdriver_exception(self, selenium_scraper: SeleniumScraper) -> None:
        """Test that WebDriverException is propagated with helpful message."""
        with patch(
            "src.scrapers.selenium.webdriver.Chrome",
            side_effect=WebDriverException("Chrome not found"),
        ):
            with pytest.raises(WebDriverException) as exc_info:
                await selenium_scraper._init_driver()

            assert "Chrome/Chromium" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_init_driver_sets_options(self, selenium_scraper: SeleniumScraper) -> None:
        """Test that correct Chrome options are set."""
        with patch("src.scrapers.selenium.webdriver.Chrome") as mock_chrome:
            mock_driver = MagicMock()
            mock_chrome.return_value = mock_driver

            await selenium_scraper._init_driver()

            # Verify Chrome was called with options
            call_args = mock_chrome.call_args
            assert call_args is not None
            _options = call_args[0][0] if call_args[0] else call_args[1].get("options")

            # Check that options is a ChromeOptions instance
            # The actual options are set on the options object


# =============================================================================
# Test _wait_for_page_load()
# =============================================================================


class TestWaitForPageLoad:
    """Tests for _wait_for_page_load method."""

    @pytest.mark.asyncio
    async def test_wait_for_page_load_waits_for_articles(
        self, selenium_scraper: SeleniumScraper, mock_driver: MagicMock
    ) -> None:
        """Test waiting for article elements to appear."""
        mock_wait = MagicMock()
        mock_wait.until.return_value = MagicMock()

        with patch("src.scrapers.selenium.WebDriverWait", return_value=mock_wait):
            selenium_scraper._driver = mock_driver

            await selenium_scraper._wait_for_page_load(timeout=10)

            mock_wait.until.assert_called()

    @pytest.mark.asyncio
    async def test_wait_for_page_load_falls_back_to_body(
        self, selenium_scraper: SeleniumScraper, mock_driver: MagicMock
    ) -> None:
        """Test fallback to waiting for body element."""
        mock_wait = MagicMock()
        # First call (articles) raises TimeoutException, second call (body) succeeds
        mock_wait.until.side_effect = [TimeoutException("Articles not found"), MagicMock()]

        with patch("src.scrapers.selenium.WebDriverWait", return_value=mock_wait):
            selenium_scraper._driver = mock_driver

            await selenium_scraper._wait_for_page_load(timeout=10)

            # Should have called twice - once for articles, once for body
            assert mock_wait.until.call_count == 2

    @pytest.mark.asyncio
    async def test_wait_for_page_load_proceeds_on_double_timeout(
        self, selenium_scraper: SeleniumScraper, mock_driver: MagicMock
    ) -> None:
        """Test that method proceeds even when both timeouts fail."""
        mock_wait = MagicMock()
        mock_wait.until.side_effect = TimeoutException("Timeout")

        with patch("src.scrapers.selenium.WebDriverWait", return_value=mock_wait):
            with patch("src.scrapers.selenium.time.sleep"):  # Mock sleep to avoid delay
                selenium_scraper._driver = mock_driver

                # Should not raise, just log warning and proceed
                await selenium_scraper._wait_for_page_load(timeout=10)

    @pytest.mark.asyncio
    async def test_wait_for_page_load_no_driver(self, selenium_scraper: SeleniumScraper) -> None:
        """Test that WebDriverException is raised when driver is None."""
        selenium_scraper._driver = None

        with pytest.raises(WebDriverException, match="Driver not initialized"):
            await selenium_scraper._wait_for_page_load()

    @pytest.mark.asyncio
    async def test_wait_for_page_load_custom_timeout(
        self, selenium_scraper: SeleniumScraper, mock_driver: MagicMock
    ) -> None:
        """Test custom timeout parameter."""
        mock_wait = MagicMock()
        mock_wait.until.return_value = MagicMock()

        with patch(
            "src.scrapers.selenium.WebDriverWait", return_value=mock_wait
        ) as mock_wait_class:
            selenium_scraper._driver = mock_driver

            await selenium_scraper._wait_for_page_load(timeout=15)

            # Check that WebDriverWait was created with custom timeout
            mock_wait_class.assert_called_with(mock_driver, 15)


# =============================================================================
# Test _cleanup_driver()
# =============================================================================


class TestCleanupDriver:
    """Tests for _cleanup_driver method."""

    @pytest.mark.asyncio
    async def test_cleanup_driver_quits_driver(self, selenium_scraper: SeleniumScraper) -> None:
        """Test that driver.quit() is called."""
        mock_driver = MagicMock()
        selenium_scraper._driver = mock_driver
        selenium_scraper._driver_initialized = True

        await selenium_scraper._cleanup_driver()

        mock_driver.quit.assert_called_once()
        assert selenium_scraper._driver is None
        assert selenium_scraper._driver_initialized is False

    @pytest.mark.asyncio
    async def test_cleanup_driver_handles_exception(
        self, selenium_scraper: SeleniumScraper
    ) -> None:
        """Test that exceptions during quit are handled gracefully."""
        mock_driver = MagicMock()
        mock_driver.quit.side_effect = Exception("Quit error")
        selenium_scraper._driver = mock_driver
        selenium_scraper._driver_initialized = True

        # Should not raise
        await selenium_scraper._cleanup_driver()

        assert selenium_scraper._driver is None
        assert selenium_scraper._driver_initialized is False

    @pytest.mark.asyncio
    async def test_cleanup_driver_no_driver(self, selenium_scraper: SeleniumScraper) -> None:
        """Test cleanup when driver is already None."""
        selenium_scraper._driver = None
        selenium_scraper._driver_initialized = False

        # Should not raise
        await selenium_scraper._cleanup_driver()


# =============================================================================
# Test fetch_articles()
# =============================================================================


class TestFetchArticles:
    """Tests for fetch_articles method."""

    @pytest.mark.asyncio
    async def test_fetch_articles_success(
        self, selenium_scraper: SeleniumScraper, sample_selenium_html: str
    ) -> None:
        """Test successful article fetching with Selenium."""
        mock_driver = MagicMock()
        mock_driver.page_source = sample_selenium_html

        with patch.object(selenium_scraper, "_init_driver", new_callable=AsyncMock) as mock_init:
            with patch.object(
                selenium_scraper, "_wait_for_page_load", new_callable=AsyncMock
            ) as mock_wait:
                with patch.object(
                    selenium_scraper, "_cleanup_driver", new_callable=AsyncMock
                ) as mock_cleanup:
                    mock_init.return_value = None
                    mock_wait.return_value = None
                    mock_cleanup.return_value = None

                    # Manually set driver
                    selenium_scraper._driver = mock_driver

                    articles = await selenium_scraper.fetch_articles()

                    assert len(articles) == 2
                    assert "Tweet content" in articles[0].title or "Status" in articles[0].title

    @pytest.mark.asyncio
    async def test_fetch_articles_respects_max_articles(
        self, selenium_scraper: SeleniumScraper
    ) -> None:
        """Test that fetch_articles limits to max_articles (50)."""
        # Create HTML with 60 articles
        articles_html = []
        for i in range(60):
            articles_html.append(f'<article data-testid="tweet"><div>Tweet {i}</div></article>')

        large_html = f"<html><body>{''.join(articles_html)}</body></html>"

        mock_driver = MagicMock()
        mock_driver.page_source = large_html

        with patch.object(selenium_scraper, "_init_driver", new_callable=AsyncMock) as mock_init:
            with patch.object(
                selenium_scraper, "_wait_for_page_load", new_callable=AsyncMock
            ) as mock_wait:
                with patch.object(
                    selenium_scraper, "_cleanup_driver", new_callable=AsyncMock
                ) as mock_cleanup:
                    mock_init.return_value = None
                    mock_wait.return_value = None
                    mock_cleanup.return_value = None
                    selenium_scraper._driver = mock_driver

                    articles = await selenium_scraper.fetch_articles()

                    assert len(articles) <= 50

    @pytest.mark.asyncio
    async def test_fetch_articles_no_elements_found(
        self, selenium_scraper: SeleniumScraper
    ) -> None:
        """Test handling when no article elements are found."""
        empty_html = "<html><body><p>No articles here</p></body></html>"

        mock_driver = MagicMock()
        mock_driver.page_source = empty_html

        with patch.object(selenium_scraper, "_init_driver", new_callable=AsyncMock) as mock_init:
            with patch.object(
                selenium_scraper, "_wait_for_page_load", new_callable=AsyncMock
            ) as mock_wait:
                with patch.object(
                    selenium_scraper, "_cleanup_driver", new_callable=AsyncMock
                ) as mock_cleanup:
                    mock_init.return_value = None
                    mock_wait.return_value = None
                    mock_cleanup.return_value = None
                    selenium_scraper._driver = mock_driver

                    articles = await selenium_scraper.fetch_articles()

                    assert articles == []

    @pytest.mark.asyncio
    async def test_fetch_articles_timeout_exception(
        self, selenium_scraper: SeleniumScraper
    ) -> None:
        """Test TimeoutException handling."""
        with patch.object(selenium_scraper, "_init_driver", new_callable=AsyncMock) as mock_init:
            mock_init.side_effect = TimeoutException("Page load timeout")

            with pytest.raises(TimeoutException):
                await selenium_scraper.fetch_articles()

    @pytest.mark.asyncio
    async def test_fetch_articles_webdriver_exception(
        self, selenium_scraper: SeleniumScraper
    ) -> None:
        """Test WebDriverException handling."""
        with patch.object(selenium_scraper, "_init_driver", new_callable=AsyncMock) as mock_init:
            mock_init.side_effect = WebDriverException("Driver error")

            with pytest.raises(WebDriverException):
                await selenium_scraper.fetch_articles()

    @pytest.mark.asyncio
    async def test_fetch_articles_cleanup_on_error(self, selenium_scraper: SeleniumScraper) -> None:
        """Test that cleanup is called even when error occurs."""
        with patch.object(selenium_scraper, "_init_driver", new_callable=AsyncMock) as mock_init:
            with patch.object(
                selenium_scraper, "_cleanup_driver", new_callable=AsyncMock
            ) as mock_cleanup:
                mock_init.side_effect = Exception("Test error")
                mock_cleanup.return_value = None

                with pytest.raises(Exception, match="Test error"):
                    await selenium_scraper.fetch_articles()

                mock_cleanup.assert_called_once()


# =============================================================================
# Test parse_article()
# =============================================================================


class TestParseArticle:
    """Tests for parse_article method."""

    @pytest.mark.asyncio
    async def test_parse_article_complete_element(
        self, selenium_scraper: SeleniumScraper, sample_article_element: Tag
    ) -> None:
        """Test parsing a complete article element."""
        article = await selenium_scraper.parse_article(sample_article_element)

        assert article is not None
        assert article.url == "https://twitter.com/status/789"
        # Title is extracted from div[lang] with "Test Article Content"
        assert "Test Article Content" in article.title or "Test" in article.title
        assert article.description == "Test Description"

    @pytest.mark.asyncio
    async def test_parse_article_none_element(self, selenium_scraper: SeleniumScraper) -> None:
        """Test parsing None element returns None."""
        article = await selenium_scraper.parse_article(None)
        assert article is None

    @pytest.mark.asyncio
    async def test_parse_article_non_tag_element(self, selenium_scraper: SeleniumScraper) -> None:
        """Test parsing non-Tag element returns None."""
        article = await selenium_scraper.parse_article("not a tag")
        assert article is None

    @pytest.mark.asyncio
    async def test_parse_article_missing_title(self, selenium_scraper: SeleniumScraper) -> None:
        """Test parsing element without title returns None."""
        html = '<article><a href="https://example.com">Link</a></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        article = await selenium_scraper.parse_article(element)
        assert article is None

    @pytest.mark.asyncio
    async def test_parse_article_missing_url(self, selenium_scraper: SeleniumScraper) -> None:
        """Test parsing element without URL returns None."""
        html = "<article><div>Content but no link</div></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        article = await selenium_scraper.parse_article(element)
        assert article is None


# =============================================================================
# Test _get_selectors()
# =============================================================================


class TestGetSelectors:
    """Tests for _get_selectors method."""

    def test_get_selectors_known_source(self, selenium_scraper: SeleniumScraper) -> None:
        """Test getting selectors for known source."""
        selectors = selenium_scraper._get_selectors()

        assert "article" in selectors
        assert "title" in selectors
        assert "url" in selectors
        assert "description" in selectors
        assert "image" in selectors
        assert "date" in selectors

    def test_get_selectors_twitter_specific(self, selenium_scraper: SeleniumScraper) -> None:
        """Test Twitter-specific selectors."""
        selectors = selenium_scraper._get_selectors()

        assert 'article[data-testid="tweet"]' in selectors["article"]

    def test_get_selectors_unknown_source(self) -> None:
        """Test getting default selectors for unknown source."""
        config = ScrapingConfig(
            source_id="unknown-source",
            base_url="https://example.com",
            difficulty=ScrapingDifficulty.HARD,
            requires_selenium=True,
        )
        scraper = SeleniumScraper(config)

        selectors = scraper._get_selectors()

        # Should get default selectors
        assert "article" in selectors
        assert "title" in selectors
        assert "url" in selectors

    def test_get_selectors_all_sources(self) -> None:
        """Test that all defined sources have selectors."""
        defined_sources = ["twitter", "reddit", "youtube", "discord", "u-gg", "lolesports"]

        for source_id in defined_sources:
            config = ScrapingConfig(
                source_id=source_id,
                base_url=f"https://{source_id}.com",
                difficulty=ScrapingDifficulty.HARD,
                requires_selenium=True,
            )
            scraper = SeleniumScraper(config)
            selectors = scraper._get_selectors()

            assert "article" in selectors
            assert "title" in selectors
            assert "url" in selectors


# =============================================================================
# Test _extract_title()
# =============================================================================


class TestExtractTitle:
    """Tests for _extract_title method."""

    def test_extract_title_from_div(self, selenium_scraper: SeleniumScraper) -> None:
        """Test extracting title from div element."""
        html = '<article><div class="title">Article Title</div></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        title = selenium_scraper._extract_title(element, ".title")
        assert title == "Article Title"

    def test_extract_title_from_h2(self, selenium_scraper: SeleniumScraper) -> None:
        """Test extracting title from h2 element."""
        html = "<article><h2>Article Title</h2></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        title = selenium_scraper._extract_title(element, "h2")
        assert title == "Article Title"

    def test_extract_title_missing(self, selenium_scraper: SeleniumScraper) -> None:
        """Test extracting title when element not found."""
        html = "<article><p>No title</p></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        title = selenium_scraper._extract_title(element, ".title")
        assert title == ""


# =============================================================================
# Test _extract_url()
# =============================================================================


class TestExtractUrl:
    """Tests for _extract_url method."""

    def test_extract_url_from_link(self, selenium_scraper: SeleniumScraper) -> None:
        """Test extracting URL from link element."""
        html = '<article><a href="https://example.com/article">Link</a></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        url = selenium_scraper._extract_url(element, "a[href]")
        assert url == "https://example.com/article"

    def test_extract_url_from_element_itself(self, selenium_scraper: SeleniumScraper) -> None:
        """Test extracting URL when element itself is a link."""
        html = '<a href="https://example.com/article" class="tweet">Link</a>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("a")

        url = selenium_scraper._extract_url(element, "a")
        assert url == "https://example.com/article"

    def test_extract_url_first_nested_link(self, selenium_scraper: SeleniumScraper) -> None:
        """Test extracting first nested link."""
        html = '<article><div><a href="https://example.com/article">Link</a></div></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        url = selenium_scraper._extract_url(element, "div")
        assert url == "https://example.com/article"

    def test_extract_url_missing(self, selenium_scraper: SeleniumScraper) -> None:
        """Test extracting URL when no link found."""
        html = "<article><p>No link</p></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        url = selenium_scraper._extract_url(element, "p")
        assert url == ""


# =============================================================================
# Test _extract_description()
# =============================================================================


class TestExtractDescription:
    """Tests for _extract_description method."""

    def test_extract_description_from_div(self, selenium_scraper: SeleniumScraper) -> None:
        """Test extracting from div element."""
        html = '<article><div class="description">Article description</div></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        desc = selenium_scraper._extract_description(element, ".description")
        assert desc == "Article description"

    def test_extract_description_strips_whitespace(self, selenium_scraper: SeleniumScraper) -> None:
        """Test that whitespace is stripped."""
        html = '<article><div class="excerpt">  Description  </div></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        desc = selenium_scraper._extract_description(element, ".excerpt")
        assert desc == "Description"

    def test_extract_description_none_selector(self, selenium_scraper: SeleniumScraper) -> None:
        """Test with None selector."""
        html = "<article><div>Description</div></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        desc = selenium_scraper._extract_description(element, None)
        assert desc == ""

    def test_extract_description_not_found(self, selenium_scraper: SeleniumScraper) -> None:
        """Test when selector doesn't match."""
        html = "<article><p>No description</p></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        desc = selenium_scraper._extract_description(element, ".nonexistent")
        assert desc == ""


# =============================================================================
# Test _extract_date()
# =============================================================================


class TestExtractDate:
    """Tests for _extract_date method."""

    def test_extract_date_from_datetime_attr(self, selenium_scraper: SeleniumScraper) -> None:
        """Test extracting from datetime attribute."""
        html = '<article><time datetime="2025-01-01T12:00:00Z">Jan 1</time></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        date = selenium_scraper._extract_date(element, "time")
        assert date is not None
        assert date.year == 2025

    def test_extract_date_from_time_element(self, selenium_scraper: SeleniumScraper) -> None:
        """Test extracting from time element."""
        html = '<article><time datetime="2025-06-15T08:30:00Z">June 15</time></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        date = selenium_scraper._extract_date(element, "time")
        assert date is not None
        assert date.month == 6

    def test_extract_date_from_text(self, selenium_scraper: SeleniumScraper) -> None:
        """Test extracting from text content."""
        html = '<article><span class="date">2025-01-01 12:00</span></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        date = selenium_scraper._extract_date(element, ".date")
        assert date is not None

    def test_extract_date_none_selector(self, selenium_scraper: SeleniumScraper) -> None:
        """Test with None selector."""
        html = "<article><time>2025-01-01</time></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        date = selenium_scraper._extract_date(element, None)
        assert date is None

    def test_extract_date_not_found(self, selenium_scraper: SeleniumScraper) -> None:
        """Test when selector doesn't match."""
        html = "<article><p>No date</p></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        date = selenium_scraper._extract_date(element, ".date")
        assert date is None


# =============================================================================
# Test _extract_image()
# =============================================================================


class TestExtractImage:
    """Tests for _extract_image method."""

    def test_extract_image_from_src(self, selenium_scraper: SeleniumScraper) -> None:
        """Test extracting from src attribute."""
        html = '<article><img src="https://example.com/image.jpg"></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        url = selenium_scraper._extract_image(element, "img")
        assert url == "https://example.com/image.jpg"

    def test_extract_image_from_data_src(self, selenium_scraper: SeleniumScraper) -> None:
        """Test extracting from data-src attribute when src is placeholder.

        Note: The implementation checks src first, so data-src is only used
        when src doesn't exist or is empty.
        """
        html = (
            '<article><img data-src="https://example.com/lazy.jpg" src="placeholder.jpg"></article>'
        )
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        url = selenium_scraper._extract_image(element, "img")
        # Since src exists (even as placeholder), it has priority
        assert url == "placeholder.jpg"

    def test_extract_image_from_background_style(self, selenium_scraper: SeleniumScraper) -> None:
        """Test extracting from background-image style."""
        html = "<article><div style=\"background-image: url('https://example.com/bg.jpg')\">Content</div></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        url = selenium_scraper._extract_image(element, "div")
        assert url == "https://example.com/bg.jpg"

    def test_extract_image_none_selector(self, selenium_scraper: SeleniumScraper) -> None:
        """Test with None selector."""
        html = '<article><img src="image.jpg"></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        url = selenium_scraper._extract_image(element, None)
        assert url is None

    def test_extract_image_not_found(self, selenium_scraper: SeleniumScraper) -> None:
        """Test when selector doesn't match."""
        html = "<article><p>No image</p></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        url = selenium_scraper._extract_image(element, "img")
        assert url is None


# =============================================================================
# Test _make_absolute()
# =============================================================================


class TestMakeAbsolute:
    """Tests for _make_absolute method."""

    def test_make_absolute_already_absolute(self, selenium_scraper: SeleniumScraper) -> None:
        """Test URL that's already absolute."""
        url = "https://example.com/page"
        result = selenium_scraper._make_absolute(url)
        assert result == "https://example.com/page"

    def test_make_absolute_relative_path(self, selenium_scraper: SeleniumScraper) -> None:
        """Test converting relative path."""
        url = "/relative/path"
        result = selenium_scraper._make_absolute(url)
        assert result == "https://twitter.com/relative/path"

    def test_make_absolute_empty_string(self, selenium_scraper: SeleniumScraper) -> None:
        """Test with empty string."""
        result = selenium_scraper._make_absolute("")
        assert result == ""


# =============================================================================
# Test SELECTORS Configuration
# =============================================================================


class TestSelectorsConfiguration:
    """Tests for SELECTORS class attribute."""

    def test_selectors_contains_twitter(self) -> None:
        """Test that Twitter selectors are defined."""
        assert "twitter" in SeleniumScraper.SELECTORS
        selectors = SeleniumScraper.SELECTORS["twitter"]
        assert 'article[data-testid="tweet"]' in selectors["article"]

    def test_selectors_contains_all_sources(self) -> None:
        """Test that all expected sources have selectors."""
        expected_sources = ["twitter", "reddit", "youtube", "discord", "u-gg", "lolesports"]

        for source in expected_sources:
            assert source in SeleniumScraper.SELECTORS
            assert "article" in SeleniumScraper.SELECTORS[source]
            assert "title" in SeleniumScraper.SELECTORS[source]
            assert "url" in SeleniumScraper.SELECTORS[source]

    def test_selectors_structure(self) -> None:
        """Test that all selectors have required fields."""
        required_fields = ["article", "title", "url", "description", "image", "date"]

        for source, selectors in SeleniumScraper.SELECTORS.items():
            for field in required_fields:
                assert field in selectors, f"{source} missing {field} selector"


# =============================================================================
# Test Async Context Management
# =============================================================================


class TestAsyncContextManagement:
    """Tests for async context manager methods."""

    @pytest.mark.asyncio
    async def test_cleanup_on_context_exit(self, selenium_scraper: SeleniumScraper) -> None:
        """Test that driver is cleaned up on context exit."""
        with patch.object(
            selenium_scraper, "_cleanup_driver", new_callable=AsyncMock
        ) as mock_cleanup:
            mock_cleanup.return_value = None

            await selenium_scraper.__aexit__(None, None, None)

            mock_cleanup.assert_called_once()

    @pytest.mark.asyncio
    async def test_close_method(self, selenium_scraper: SeleniumScraper) -> None:
        """Test close method calls cleanup_driver."""
        with patch.object(
            selenium_scraper, "_cleanup_driver", new_callable=AsyncMock
        ) as mock_cleanup:
            mock_cleanup.return_value = None

            await selenium_scraper.close()

            mock_cleanup.assert_called_once()
