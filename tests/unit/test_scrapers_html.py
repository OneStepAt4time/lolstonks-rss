"""
Unit tests for HTML scraper.

Tests the HTML scraper for fetching and parsing structured HTML including:
- HTML fetching with CSS selectors
- Article parsing from HTML elements
- Field extraction methods
- URL normalization
- Error handling
"""

from unittest.mock import MagicMock, patch

import httpx
import pytest
from bs4 import BeautifulSoup, Tag

from src.scrapers.base import ScrapingConfig, ScrapingDifficulty
from src.scrapers.html import HTMLScraper

# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def html_config() -> ScrapingConfig:
    """Create a test HTML scraping config."""
    return ScrapingConfig(
        source_id="dexerto",
        base_url="https://dexerto.com",
        difficulty=ScrapingDifficulty.MEDIUM,
        rate_limit_seconds=1.0,
        timeout_seconds=30,
    )


@pytest.fixture
async def html_scraper(html_config: ScrapingConfig) -> HTMLScraper:
    """Create an HTML scraper instance for testing."""
    scraper = HTMLScraper(html_config, locale="en-us")
    yield scraper
    await scraper.close()


@pytest.fixture
def sample_article_html() -> str:
    """Create sample HTML with article elements."""
    return """
    <html>
        <body>
            <article class="post">
                <h2><a href="https://dexerto.com/article1">Article Title 1</a></h2>
                <p class="excerpt">Description 1</p>
                <img src="https://dexerto.com/image1.jpg" alt="Image">
                <time datetime="2025-01-01T12:00:00Z">2025-01-01</time>
            </article>
            <article class="post">
                <h2><a href="https://dexerto.com/article2">Article Title 2</a></h2>
                <p class="excerpt">Description 2</p>
                <img src="https://dexerto.com/image2.jpg" alt="Image">
                <time datetime="2025-01-01T13:00:00Z">2025-01-01</time>
            </article>
            <article class="post">
                <h2><a href="https://dexerto.com/article3">Article Title 3</a></h2>
                <p class="excerpt">Description 3</p>
            </article>
        </body>
    </html>
    """


@pytest.fixture
def sample_article_element() -> Tag:
    """Create a sample article element."""
    html = """
    <article class="post">
        <h2><a href="https://dexerto.com/test-article">Test Article</a></h2>
        <p class="excerpt">Test description with extra whitespace</p>
        <img src="https://dexerto.com/test-image.jpg" alt="Test">
        <time datetime="2025-01-01T12:00:00Z">Jan 1, 2025</time>
    </article>
    """
    soup = BeautifulSoup(html, "html.parser")
    return soup.find("article")


@pytest.fixture
def article_element_relative_url() -> Tag:
    """Create article element with relative URL."""
    html = """
    <article class="post">
        <h2><a href="/relative-path">Relative URL Article</a></h2>
        <p class="excerpt">Description</p>
        <img src="/relative-image.jpg">
    </article>
    """
    soup = BeautifulSoup(html, "html.parser")
    return soup.find("article")


@pytest.fixture
def article_element_lazy_image() -> Tag:
    """Create article element with lazy-loaded image."""
    html = """
    <article class="post">
        <h2><a href="https://example.com/article">Lazy Image Article</a></h2>
        <p class="excerpt">Description</p>
        <img data-src="https://example.com/lazy.jpg" src="placeholder.jpg">
    </article>
    """
    soup = BeautifulSoup(html, "html.parser")
    return soup.find("article")


@pytest.fixture
def article_element_background_image() -> Tag:
    """Create article element with background image."""
    html = """
    <article class="post">
        <h2><a href="https://example.com/article">Background Image</a></h2>
        <p class="excerpt">Description</p>
        <div style="background-image: url('https://example.com/bg.jpg')">Content</div>
    </article>
    """
    soup = BeautifulSoup(html, "html.parser")
    return soup.find("article")


# =============================================================================
# Test fetch_articles()
# =============================================================================


class TestFetchArticles:
    """Tests for fetch_articles method."""

    @pytest.mark.asyncio
    async def test_fetch_articles_success(
        self, html_scraper: HTMLScraper, sample_article_html: str
    ) -> None:
        """Test successful article fetching from HTML."""
        with patch.object(html_scraper, "_fetch_html", return_value=sample_article_html):
            articles = await html_scraper.fetch_articles()

            assert len(articles) == 3
            assert articles[0].title == "Article Title 1"
            assert articles[0].url == "https://dexerto.com/article1"
            assert articles[1].title == "Article Title 2"

    @pytest.mark.asyncio
    async def test_fetch_articles_respects_max_articles(self, html_scraper: HTMLScraper) -> None:
        """Test that fetch_articles limits to max_articles (50)."""
        # Create HTML with 60 articles
        articles_html = []
        for i in range(60):
            articles_html.append(
                f"""
            <article class="post">
                <h2><a href="https://dexerto.com/article{i}">Article {i}</a></h2>
            </article>
            """
            )

        large_html = f"<html><body>{''.join(articles_html)}</body></html>"

        with patch.object(html_scraper, "_fetch_html", return_value=large_html):
            articles = await html_scraper.fetch_articles()

            # Should limit to 50
            assert len(articles) <= 50

    @pytest.mark.asyncio
    async def test_fetch_articles_no_elements_found(self, html_scraper: HTMLScraper) -> None:
        """Test handling when no article elements are found."""
        empty_html = "<html><body><p>No articles here</p></body></html>"

        with patch.object(html_scraper, "_fetch_html", return_value=empty_html):
            articles = await html_scraper.fetch_articles()

            assert articles == []

    @pytest.mark.asyncio
    async def test_fetch_articles_skips_invalid_entries(self, html_scraper: HTMLScraper) -> None:
        """Test that invalid entries are skipped."""
        mixed_html = """
        <html>
            <body>
                <article class="post">
                    <h2><a href="https://dexerto.com/valid">Valid Article</a></h2>
                </article>
                <article class="post">
                    <p>No title or link</p>
                </article>
                <article class="post">
                    <h2><a href="https://dexerto.com/valid2">Another Valid</a></h2>
                </article>
            </body>
        </html>
        """

        with patch.object(html_scraper, "_fetch_html", return_value=mixed_html):
            articles = await html_scraper.fetch_articles()

            assert len(articles) == 2

    @pytest.mark.asyncio
    async def test_fetch_articles_http_error(self, html_scraper: HTMLScraper) -> None:
        """Test HTTP error handling."""
        error = httpx.HTTPStatusError(
            "Not Found",
            request=MagicMock(),
            response=MagicMock(status_code=404),
        )

        with patch.object(html_scraper, "_fetch_html", side_effect=error):
            with pytest.raises(httpx.HTTPStatusError):
                await html_scraper.fetch_articles()

    @pytest.mark.asyncio
    async def test_fetch_articles_uses_source_selectors(self, html_scraper: HTMLScraper) -> None:
        """Test that source-specific selectors are used."""
        dexerto_html = """
        <html>
            <body>
                <article class="post">
                    <h2><a href="https://dexerto.com/article">Dexerto Article</a></h2>
                </article>
            </body>
        </html>
        """

        with patch.object(html_scraper, "_fetch_html", return_value=dexerto_html):
            articles = await html_scraper.fetch_articles()

            assert len(articles) == 1
            assert "Dexerto Article" in articles[0].title


# =============================================================================
# Test parse_article()
# =============================================================================


class TestParseArticle:
    """Tests for parse_article method."""

    @pytest.mark.asyncio
    async def test_parse_article_complete_element(
        self, html_scraper: HTMLScraper, sample_article_element: Tag
    ) -> None:
        """Test parsing a complete article element."""
        article = await html_scraper.parse_article(sample_article_element)

        assert article is not None
        assert article.title == "Test Article"
        assert article.url == "https://dexerto.com/test-article"
        assert article.description == "Test description with extra whitespace"
        assert article.image_url == "https://dexerto.com/test-image.jpg"

    @pytest.mark.asyncio
    async def test_parse_article_relative_url(
        self, html_scraper: HTMLScraper, article_element_relative_url: Tag
    ) -> None:
        """Test parsing element with relative URL."""
        article = await html_scraper.parse_article(article_element_relative_url)

        assert article is not None
        assert article.url == "https://dexerto.com/relative-path"

    @pytest.mark.asyncio
    async def test_parse_article_relative_image(
        self, html_scraper: HTMLScraper, article_element_relative_url: Tag
    ) -> None:
        """Test parsing element with relative image URL."""
        article = await html_scraper.parse_article(article_element_relative_url)

        assert article is not None
        assert article.image_url == "https://dexerto.com/relative-image.jpg"

    @pytest.mark.asyncio
    async def test_parse_article_missing_title(self, html_scraper: HTMLScraper) -> None:
        """Test parsing element without title returns None."""
        html = "<article><p>No title</p></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        article = await html_scraper.parse_article(element)

        assert article is None

    @pytest.mark.asyncio
    async def test_parse_article_missing_url(self, html_scraper: HTMLScraper) -> None:
        """Test parsing element without URL returns None."""
        html = "<article><h2>Title but no link</h2></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        article = await html_scraper.parse_article(element)

        assert article is None

    @pytest.mark.asyncio
    async def test_parse_article_none_element(self, html_scraper: HTMLScraper) -> None:
        """Test parsing None element returns None."""
        article = await html_scraper.parse_article(None)
        assert article is None

    @pytest.mark.asyncio
    async def test_parse_article_non_tag_element(self, html_scraper: HTMLScraper) -> None:
        """Test parsing non-Tag element returns None."""
        article = await html_scraper.parse_article("not a tag")
        assert article is None


# =============================================================================
# Test _get_selectors()
# =============================================================================


class TestGetSelectors:
    """Tests for _get_selectors method."""

    def test_get_selectors_known_source(self, html_scraper: HTMLScraper) -> None:
        """Test getting selectors for known source."""
        selectors = html_scraper._get_selectors()

        assert "article" in selectors
        assert "title" in selectors
        assert "url" in selectors
        assert "description" in selectors
        assert "image" in selectors
        assert "date" in selectors

    def test_get_selectors_dexerto_specific(self, html_scraper: HTMLScraper) -> None:
        """Test Dexerto-specific selectors."""
        selectors = html_scraper._get_selectors()

        assert selectors["article"] == "article.post"

    def test_get_selectors_unknown_source(self) -> None:
        """Test getting default selectors for unknown source."""
        config = ScrapingConfig(
            source_id="unknown-source",
            base_url="https://example.com",
            difficulty=ScrapingDifficulty.MEDIUM,
        )
        scraper = HTMLScraper(config)

        selectors = scraper._get_selectors()

        # Should get default selectors
        assert "article" in selectors
        assert "title" in selectors
        assert "url" in selectors

    def test_get_selectors_all_sources_covered(self) -> None:
        """Test that all defined sources have selectors."""
        defined_sources = [
            "dexerto",
            "dotesports",
            "esportsgg",
            "ggrecon",
            "nme",
            "pcgamesn",
            "thegamer",
            "upcomer",
            "inven",
            "opgg",
            "3djuegos",
            "earlygame",
            "mobalytics",
            "ugg",
            "blitz-gg",
            "porofessor",
            "bunnymuffins",
            "tftactics",
        ]

        for source_id in defined_sources:
            config = ScrapingConfig(
                source_id=source_id,
                base_url=f"https://{source_id}.com",
                difficulty=ScrapingDifficulty.MEDIUM,
            )
            scraper = HTMLScraper(config)
            selectors = scraper._get_selectors()

            assert "article" in selectors
            assert "title" in selectors
            assert "url" in selectors


# =============================================================================
# Test _extract_title()
# =============================================================================


class TestExtractTitle:
    """Tests for _extract_title method."""

    def test_extract_title_from_h2_link(self, html_scraper: HTMLScraper) -> None:
        """Test extracting title from h2 a selector."""
        html = '<article><h2><a href="#">Article Title</a></h2></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        title = html_scraper._extract_title(element, "h2 a")
        assert title == "Article Title"

    def test_extract_title_from_h3_link(self, html_scraper: HTMLScraper) -> None:
        """Test extracting title from h3 a selector."""
        html = '<article><h3><a href="#">Article Title</a></h3></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        title = html_scraper._extract_title(element, "h3 a")
        assert title == "Article Title"

    def test_extract_title_direct_text(self, html_scraper: HTMLScraper) -> None:
        """Test extracting title from element text."""
        html = "<article><h2>Article Title</h2></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        title = html_scraper._extract_title(element, "h2")
        assert title == "Article Title"

    def test_extract_title_strips_whitespace(self, html_scraper: HTMLScraper) -> None:
        """Test that whitespace is stripped."""
        html = "<article><h2>  Article Title  </h2></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        title = html_scraper._extract_title(element, "h2")
        assert title == "Article Title"

    def test_extract_title_missing(self, html_scraper: HTMLScraper) -> None:
        """Test extracting title when element not found."""
        html = "<article><p>No title here</p></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        title = html_scraper._extract_title(element, "h2")
        assert title == ""


# =============================================================================
# Test _extract_url()
# =============================================================================


class TestExtractUrl:
    """Tests for _extract_url method."""

    def test_extract_url_from_link(self, html_scraper: HTMLScraper) -> None:
        """Test extracting URL from link element."""
        html = '<article><a href="https://example.com/article">Link</a></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        url = html_scraper._extract_url(element, "a[href]")
        assert url == "https://example.com/article"

    def test_extract_url_from_element_itself(self, html_scraper: HTMLScraper) -> None:
        """Test extracting URL when element itself is a link."""
        html = '<a href="https://example.com/article" class="post">Link</a>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("a")

        url = html_scraper._extract_url(element, "a[href]")
        assert url == "https://example.com/article"

    def test_extract_url_first_nested_link(self, html_scraper: HTMLScraper) -> None:
        """Test extracting first nested link."""
        html = '<article><div><a href="https://example.com/article">Link</a></div></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        url = html_scraper._extract_url(element, "div")
        assert url == "https://example.com/article"

    def test_extract_url_missing(self, html_scraper: HTMLScraper) -> None:
        """Test extracting URL when no link found."""
        html = "<article><p>No link here</p></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        url = html_scraper._extract_url(element, "p")
        assert url == ""

    def test_extract_url_no_href(self, html_scraper: HTMLScraper) -> None:
        """Test extracting URL when element has no href."""
        html = '<article><a name="anchor">No href</a></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        url = html_scraper._extract_url(element, "a")
        assert url == ""


# =============================================================================
# Test _extract_description()
# =============================================================================


class TestExtractDescription:
    """Tests for _extract_description method."""

    def test_extract_description_from_excerpt(self, html_scraper: HTMLScraper) -> None:
        """Test extracting from excerpt class."""
        html = '<article><p class="excerpt">Article description</p></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        desc = html_scraper._extract_description(element, ".excerpt")
        assert desc == "Article description"

    def test_extract_description_from_summary(self, html_scraper: HTMLScraper) -> None:
        """Test extracting from summary class."""
        html = '<article><p class="summary">Summary text</p></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        desc = html_scraper._extract_description(element, ".summary")
        assert desc == "Summary text"

    def test_extract_description_from_p_tag(self, html_scraper: HTMLScraper) -> None:
        """Test extracting from p tag."""
        html = "<article><p>Paragraph description</p></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        desc = html_scraper._extract_description(element, "p")
        assert desc == "Paragraph description"

    def test_extract_description_strips_whitespace(self, html_scraper: HTMLScraper) -> None:
        """Test that whitespace is stripped."""
        html = '<article><p class="excerpt">  Description  with  spaces  </p></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        desc = html_scraper._extract_description(element, ".excerpt")
        assert desc == "Description with spaces"

    def test_extract_description_missing_selector(self, html_scraper: HTMLScraper) -> None:
        """Test with None selector."""
        html = "<article><p>Description</p></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        desc = html_scraper._extract_description(element, None)
        assert desc == ""

    def test_extract_description_element_not_found(self, html_scraper: HTMLScraper) -> None:
        """Test when selector doesn't match."""
        html = "<article><p>Description</p></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        desc = html_scraper._extract_description(element, ".nonexistent")
        assert desc == ""


# =============================================================================
# Test _extract_date()
# =============================================================================


class TestExtractDate:
    """Tests for _extract_date method."""

    def test_extract_date_from_datetime_attr(self, html_scraper: HTMLScraper) -> None:
        """Test extracting from datetime attribute."""
        html = '<article><time datetime="2025-01-01T12:00:00Z">Jan 1</time></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        date = html_scraper._extract_date(element, "time")
        assert date is not None
        assert date.year == 2025
        assert date.month == 1
        assert date.day == 1

    def test_extract_date_from_time_element(self, html_scraper: HTMLScraper) -> None:
        """Test extracting from time element."""
        html = '<article><time datetime="2025-06-15T08:30:00Z">June 15</time></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        date = html_scraper._extract_date(element, "time")
        assert date is not None
        assert date.year == 2025
        assert date.month == 6
        assert date.day == 15

    def test_extract_date_from_text(self, html_scraper: HTMLScraper) -> None:
        """Test extracting date from text content."""
        html = '<article><span class="date">2025-01-01 12:00:00</span></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        date = html_scraper._extract_date(element, ".date")
        assert date is not None
        assert date.year == 2025

    def test_extract_date_missing_selector(self, html_scraper: HTMLScraper) -> None:
        """Test with None selector."""
        html = "<article><time>2025-01-01</time></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        date = html_scraper._extract_date(element, None)
        assert date is None

    def test_extract_date_element_not_found(self, html_scraper: HTMLScraper) -> None:
        """Test when selector doesn't match."""
        html = "<article><p>No date</p></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        date = html_scraper._extract_date(element, ".date")
        assert date is None

    def test_extract_date_invalid_format(self, html_scraper: HTMLScraper) -> None:
        """Test with invalid date format."""
        html = '<article><time class="date">Not a date</time></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        date = html_scraper._extract_date(element, ".date")
        assert date is None


# =============================================================================
# Test _extract_image()
# =============================================================================


class TestExtractImage:
    """Tests for _extract_image method."""

    def test_extract_image_from_src(self, html_scraper: HTMLScraper) -> None:
        """Test extracting from src attribute."""
        html = '<article><img src="https://example.com/image.jpg" alt="Image"></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        url = html_scraper._extract_image(element, "img")
        assert url == "https://example.com/image.jpg"

    def test_extract_image_from_data_src(
        self, html_scraper: HTMLScraper, article_element_lazy_image: Tag
    ) -> None:
        """Test extracting from data-src attribute."""
        url = html_scraper._extract_image(article_element_lazy_image, "img")
        assert url == "https://example.com/lazy.jpg"

    def test_extract_image_from_background_style(
        self, html_scraper: HTMLScraper, article_element_background_image: Tag
    ) -> None:
        """Test extracting from background-image style."""
        url = html_scraper._extract_image(article_element_background_image, "div")
        assert url == "https://example.com/bg.jpg"

    def test_extract_image_src_priority_over_data_src(self, html_scraper: HTMLScraper) -> None:
        """Test that src has priority over data-src."""
        html = '<article><img src="https://example.com/src.jpg" data-src="https://example.com/data.jpg"></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        url = html_scraper._extract_image(element, "img")
        assert url == "https://example.com/src.jpg"

    def test_extract_image_missing_selector(self, html_scraper: HTMLScraper) -> None:
        """Test with None selector."""
        html = '<article><img src="image.jpg"></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        url = html_scraper._extract_image(element, None)
        assert url is None

    def test_extract_image_element_not_found(self, html_scraper: HTMLScraper) -> None:
        """Test when selector doesn't match."""
        html = "<article><p>No image</p></article>"
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        url = html_scraper._extract_image(element, "img")
        assert url is None

    def test_extract_image_no_src_attributes(self, html_scraper: HTMLScraper) -> None:
        """Test img element without src or data-src."""
        html = '<article><img alt="No source"></article>'
        soup = BeautifulSoup(html, "html.parser")
        element = soup.find("article")

        url = html_scraper._extract_image(element, "img")
        assert url is None


# =============================================================================
# Test _make_absolute()
# =============================================================================


class TestMakeAbsolute:
    """Tests for _make_absolute method."""

    def test_make_absolute_already_absolute(self, html_scraper: HTMLScraper) -> None:
        """Test URL that's already absolute."""
        url = "https://example.com/page"
        result = html_scraper._make_absolute(url)
        assert result == "https://example.com/page"

    def test_make_absolute_already_absolute_http(self, html_scraper: HTMLScraper) -> None:
        """Test HTTP URL that's already absolute."""
        url = "http://example.com/page"
        result = html_scraper._make_absolute(url)
        assert result == "http://example.com/page"

    def test_make_absolute_relative_path(self, html_scraper: HTMLScraper) -> None:
        """Test converting relative path to absolute."""
        url = "/relative/path"
        result = html_scraper._make_absolute(url)
        assert result == "https://dexerto.com/relative/path"

    def test_make_absolute_relative_no_leading_slash(self, html_scraper: HTMLScraper) -> None:
        """Test converting relative path without leading slash."""
        url = "relative/path"
        result = html_scraper._make_absolute(url)
        assert result == "https://dexerto.com/relative/path"

    def test_make_absolute_empty_string(self, html_scraper: HTMLScraper) -> None:
        """Test with empty string."""
        result = html_scraper._make_absolute("")
        assert result == ""

    def test_make_absolute_with_query_params(self, html_scraper: HTMLScraper) -> None:
        """Test URL with query parameters."""
        url = "/page?param=value"
        result = html_scraper._make_absolute(url)
        assert result == "https://dexerto.com/page?param=value"

    def test_make_absolute_with_fragment(self, html_scraper: HTMLScraper) -> None:
        """Test URL with fragment."""
        url = "/page#section"
        result = html_scraper._make_absolute(url)
        assert result == "https://dexerto.com/page#section"


# =============================================================================
# Test _clean_text()
# =============================================================================


class TestCleanText:
    """Tests for _clean_text static method."""

    def test_clean_text_normalizes_spaces(self) -> None:
        """Test that multiple spaces are normalized."""
        text = "Multiple    spaces   between    words"
        result = HTMLScraper._clean_text(text)
        assert result == "Multiple spaces between words"

    def test_clean_text_normalizes_tabs(self) -> None:
        """Test that tabs are normalized."""
        text = "Text\twith\ttabs"
        result = HTMLScraper._clean_text(text)
        assert result == "Text with tabs"

    def test_clean_text_normalizes_newlines(self) -> None:
        """Test that newlines are normalized."""
        text = "Text\nwith\nnewlines"
        result = HTMLScraper._clean_text(text)
        assert result == "Text with newlines"

    def test_clean_text_mixed_whitespace(self) -> None:
        """Test mixed whitespace characters."""
        text = "Text \t with \n mixed \r whitespace"
        result = HTMLScraper._clean_text(text)
        assert result == "Text with mixed whitespace"

    def test_clean_text_leading_trailing(self) -> None:
        """Test leading and trailing whitespace is removed."""
        text = "   text with spaces   "
        result = HTMLScraper._clean_text(text)
        assert result == "text with spaces"

    def test_clean_text_empty_string(self) -> None:
        """Test empty string."""
        result = HTMLScraper._clean_text("")
        assert result == ""

    def test_clean_text_none_input(self) -> None:
        """Test None input."""
        result = HTMLScraper._clean_text(None)
        assert result == ""

    def test_clean_text_preserves_single_spaces(self) -> None:
        """Test that single spaces are preserved."""
        text = "Text with normal spacing"
        result = HTMLScraper._clean_text(text)
        assert result == "Text with normal spacing"


# =============================================================================
# Test SELECTORS Configuration
# =============================================================================


class TestSelectorsConfiguration:
    """Tests for SELECTORS class attribute."""

    def test_selectors_contains_dexerto(self) -> None:
        """Test that Dexerto selectors are defined."""
        assert "dexerto" in HTMLScraper.SELECTORS
        selectors = HTMLScraper.SELECTORS["dexerto"]
        assert "article" in selectors
        assert "title" in selectors
        assert "url" in selectors

    def test_selectors_contains_all_sources(self) -> None:
        """Test that all expected sources have selectors."""
        expected_sources = [
            "dexerto",
            "dotesports",
            "esportsgg",
            "ggrecon",
            "nme",
            "pcgamesn",
            "thegamer",
            "upcomer",
            "inven",
            "opgg",
            "3djuegos",
            "earlygame",
            "mobalytics",
            "ugg",
            "blitz-gg",
            "porofessor",
            "bunnymuffins",
            "tftactics",
        ]

        for source in expected_sources:
            assert source in HTMLScraper.SELECTORS
            assert "article" in HTMLScraper.SELECTORS[source]
            assert "title" in HTMLScraper.SELECTORS[source]
            assert "url" in HTMLScraper.SELECTORS[source]

    def test_selectors_structure(self) -> None:
        """Test that all selectors have required fields."""
        required_fields = ["article", "title", "url", "description", "image", "date"]

        for source, selectors in HTMLScraper.SELECTORS.items():
            for field in required_fields:
                assert field in selectors, f"{source} missing {field} selector"


# =============================================================================
# Test Article Creation
# =============================================================================


class TestArticleCreation:
    """Tests for article creation from HTML."""

    @pytest.mark.asyncio
    async def test_article_has_correct_source(
        self, html_scraper: HTMLScraper, sample_article_element: Tag
    ) -> None:
        """Test that article has correct source metadata."""
        article = await html_scraper.parse_article(sample_article_element)

        assert article is not None
        assert article.source.source_id == "dexerto"
        assert article.locale == "en-us"

    @pytest.mark.asyncio
    async def test_article_has_guid(
        self, html_scraper: HTMLScraper, sample_article_element: Tag
    ) -> None:
        """Test that article has GUID."""
        article = await html_scraper.parse_article(sample_article_element)

        assert article is not None
        assert article.guid
        assert len(article.guid) == 64  # SHA256 hex

    @pytest.mark.asyncio
    async def test_article_source_category(
        self, html_scraper: HTMLScraper, sample_article_element: Tag
    ) -> None:
        """Test that article has correct source category."""
        article = await html_scraper.parse_article(sample_article_element)

        assert article is not None
        assert article.source_category == "esports"

    @pytest.mark.asyncio
    async def test_article_default_author(
        self, html_scraper: HTMLScraper, sample_article_element: Tag
    ) -> None:
        """Test that article uses source name as default author."""
        article = await html_scraper.parse_article(sample_article_element)

        assert article is not None
        # HTML scraper doesn't extract author, so defaults to source name
        assert article.author == "Dexerto"
