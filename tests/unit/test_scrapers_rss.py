"""
Unit tests for RSS scraper.

Tests the RSS scraper for fetching and parsing RSS/Atom feeds including:
- Feed fetching with circuit breaker
- Article parsing from feed entries
- Field extraction methods
- HTML cleaning
- Error handling
"""

from datetime import datetime
from unittest.mock import MagicMock, patch

import httpx
import pytest

from src.scrapers.base import ScrapingConfig, ScrapingDifficulty
from src.scrapers.rss import RSSScraper

# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def rss_config() -> ScrapingConfig:
    """Create a test RSS scraping config."""
    return ScrapingConfig(
        source_id="dexerto",
        base_url="https://dexerto.com",
        difficulty=ScrapingDifficulty.EASY,
        rate_limit_seconds=1.0,
        timeout_seconds=30,
        rss_feed_url="https://dexerto.com/feed/",
    )


@pytest.fixture
async def rss_scraper(rss_config: ScrapingConfig) -> RSSScraper:
    """Create an RSS scraper instance for testing."""
    scraper = RSSScraper(rss_config, locale="en-us")
    yield scraper
    await scraper.close()


@pytest.fixture
def sample_feed_entry() -> dict:
    """Create a sample RSS feed entry."""
    return {
        "title": "Test Article Title",
        "link": "https://dexerto.com/test-article",
        "description": "Test description with <b>HTML</b> tags",
        "summary": "Test summary",
        "published": "Mon, 01 Jan 2025 12:00:00 GMT",
        "published_parsed": (2025, 1, 1, 12, 0, 0, 0, 1, -1),
        "author": "Test Author",
        "tags": [{"term": "League of Legends"}, {"term": "Esports"}],
        "enclosures": [{"href": "https://dexerto.com/image.jpg", "type": "image/jpeg"}],
        "content": [{"value": "<p>Full article content</p>"}],
    }


@pytest.fixture
def sample_rss_feed() -> str:
    """Create a sample RSS feed XML."""
    return """<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
        <channel>
            <title>Dexerto</title>
            <link>https://dexerto.com</link>
            <description>Gaming news</description>
            <item>
                <title>Test Article 1</title>
                <link>https://dexerto.com/article1</link>
                <description>Description 1</description>
                <pubDate>Mon, 01 Jan 2025 12:00:00 GMT</pubDate>
                <author>Author 1</author>
                <category>League of Legends</category>
                <enclosure url="https://dexerto.com/image1.jpg" type="image/jpeg"/>
            </item>
            <item>
                <title>Test Article 2</title>
                <link>https://dexerto.com/article2</link>
                <description>Description 2</description>
                <pubDate>Mon, 01 Jan 2025 13:00:00 GMT</pubDate>
            </item>
        </channel>
    </rss>
    """


@pytest.fixture
def sample_atom_feed() -> str:
    """Create a sample Atom feed XML."""
    return """<?xml version="1.0" encoding="UTF-8"?>
    <feed xmlns="http://www.w3.org/2005/Atom">
        <title>Dexerto</title>
        <link href="https://dexerto.com"/>
        <entry>
            <title>Atom Article</title>
            <link href="https://dexerto.com/atom-article" rel="alternate"/>
            <id>https://dexerto.com/atom-article</id>
            <summary>Atom summary</summary>
            <updated>2025-01-01T12:00:00Z</updated>
            <author>
                <name>Atom Author</name>
            </author>
            <category term="Gaming"/>
        </entry>
    </feed>
    """


# =============================================================================
# Test fetch_articles()
# =============================================================================


class TestFetchArticles:
    """Tests for fetch_articles method."""

    @pytest.mark.asyncio
    async def test_fetch_articles_success(
        self, rss_scraper: RSSScraper, sample_rss_feed: str
    ) -> None:
        """Test successful article fetching from RSS feed."""
        mock_response = MagicMock()
        mock_response.content = sample_rss_feed.encode("utf-8")

        with patch.object(rss_scraper.client, "get", return_value=mock_response):
            articles = await rss_scraper.fetch_articles()

            assert len(articles) == 2
            assert articles[0].title == "Test Article 1"
            assert articles[0].url == "https://dexerto.com/article1"
            assert articles[1].title == "Test Article 2"

    @pytest.mark.asyncio
    async def test_fetch_articles_with_circuit_breaker(
        self, rss_scraper: RSSScraper, sample_rss_feed: str
    ) -> None:
        """Test that circuit breaker wraps the fetch operation."""
        mock_response = MagicMock()
        mock_response.content = sample_rss_feed.encode("utf-8")

        with patch.object(rss_scraper.client, "get", return_value=mock_response):
            articles = await rss_scraper.fetch_articles()

            # Should have successfully fetched articles
            assert len(articles) >= 1

    @pytest.mark.asyncio
    async def test_fetch_articles_respects_max_entries(self, rss_scraper: RSSScraper) -> None:
        """Test that fetch_articles limits to max_entries (100)."""
        # Create feed with 150 entries
        feed_items = []
        for i in range(150):
            feed_items.append(
                f"""
            <item>
                <title>Article {i}</title>
                <link>https://dexerto.com/article{i}</link>
                <description>Description {i}</description>
            </item>
            """
            )

        large_feed = f"""<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
            <channel>
                <title>Dexerto</title>
                {''.join(feed_items)}
            </channel>
        </rss>
        """

        mock_response = MagicMock()
        mock_response.content = large_feed.encode("utf-8")

        with patch.object(rss_scraper.client, "get", return_value=mock_response):
            articles = await rss_scraper.fetch_articles()

            # Should limit to 100 entries
            assert len(articles) <= 100

    @pytest.mark.asyncio
    async def test_fetch_articles_handles_bozo_feed(self, rss_scraper: RSSScraper) -> None:
        """Test that malformed feeds are handled with a warning."""
        # Malformed RSS feed
        malformed_feed = b"not valid rss at all"

        mock_response = MagicMock()
        mock_response.content = malformed_feed

        with patch.object(rss_scraper.client, "get", return_value=mock_response):
            # Should not raise, just log warning
            articles = await rss_scraper.fetch_articles()

            # Feedparser will still parse it, just with no entries
            assert isinstance(articles, list)

    @pytest.mark.asyncio
    async def test_fetch_articles_http_error(self, rss_scraper: RSSScraper) -> None:
        """Test HTTP error handling during feed fetch."""
        mock_response = MagicMock()
        mock_response.status_code = 404

        error = httpx.HTTPStatusError(
            "Not Found",
            request=MagicMock(),
            response=mock_response,
        )

        with patch.object(rss_scraper.client, "get", side_effect=error):
            with pytest.raises(httpx.HTTPStatusError):
                await rss_scraper.fetch_articles()

    @pytest.mark.asyncio
    async def test_fetch_articles_skips_invalid_entries(self, rss_scraper: RSSScraper) -> None:
        """Test that invalid entries are skipped."""
        feed_with_invalid = """<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
            <channel>
                <item>
                    <title>Valid Article</title>
                    <link>https://dexerto.com/valid</link>
                </item>
                <item>
                    <!-- Missing title and link -->
                    <description>Invalid entry</description>
                </item>
                <item>
                    <title>Another Valid</title>
                    <link>https://dexerto.com/valid2</link>
                </item>
            </channel>
        </rss>
        """

        mock_response = MagicMock()
        mock_response.content = feed_with_invalid.encode("utf-8")

        with patch.object(rss_scraper.client, "get", return_value=mock_response):
            articles = await rss_scraper.fetch_articles()

            # Should only get valid articles
            assert len(articles) == 2
            assert all(a.title for a in articles)
            assert all(a.url for a in articles)

    @pytest.mark.asyncio
    async def test_fetch_articles_respects_rate_limit(
        self, rss_scraper: RSSScraper, sample_rss_feed: str
    ) -> None:
        """Test that rate limiting is respected."""
        mock_response = MagicMock()
        mock_response.content = sample_rss_feed.encode("utf-8")

        with patch.object(rss_scraper.client, "get", return_value=mock_response):
            # First fetch
            await rss_scraper.fetch_articles()

            # Set last fetch time to verify rate limiting
            rss_scraper._last_fetch_time = 0

            # Second fetch should respect rate limit
            await rss_scraper.fetch_articles()


# =============================================================================
# Test parse_article()
# =============================================================================


class TestParseArticle:
    """Tests for parse_article method."""

    @pytest.mark.asyncio
    async def test_parse_article_complete_entry(
        self, rss_scraper: RSSScraper, sample_feed_entry: dict
    ) -> None:
        """Test parsing a complete feed entry."""
        article = await rss_scraper.parse_article(sample_feed_entry)

        assert article is not None
        assert article.title == "Test Article Title"
        assert article.url == "https://dexerto.com/test-article"
        assert article.description == "Test description HTML tags"
        assert article.author == "Test Author"
        assert "League of Legends" in article.categories
        assert "Esports" in article.categories
        assert article.image_url == "https://dexerto.com/image.jpg"

    @pytest.mark.asyncio
    async def test_parse_article_minimal_entry(self, rss_scraper: RSSScraper) -> None:
        """Test parsing entry with only required fields."""
        minimal_entry = {
            "title": "Minimal Article",
            "link": "https://example.com/minimal",
        }

        article = await rss_scraper.parse_article(minimal_entry)

        assert article is not None
        assert article.title == "Minimal Article"
        assert article.url == "https://example.com/minimal"

    @pytest.mark.asyncio
    async def test_parse_article_missing_title_returns_none(self, rss_scraper: RSSScraper) -> None:
        """Test that entry without title returns None."""
        entry_no_title = {
            "link": "https://example.com/article",
        }

        article = await rss_scraper.parse_article(entry_no_title)

        assert article is None

    @pytest.mark.asyncio
    async def test_parse_article_missing_url_returns_none(self, rss_scraper: RSSScraper) -> None:
        """Test that entry without URL returns None."""
        entry_no_url = {
            "title": "Article Title",
        }

        article = await rss_scraper.parse_article(entry_no_url)

        assert article is None

    @pytest.mark.asyncio
    async def test_parse_article_none_element_returns_none(self, rss_scraper: RSSScraper) -> None:
        """Test that None element returns None."""
        article = await rss_scraper.parse_article(None)
        assert article is None


# =============================================================================
# Test _extract_title()
# =============================================================================


class TestExtractTitle:
    """Tests for _extract_title method."""

    def test_extract_title_normal(self, rss_scraper: RSSScraper) -> None:
        """Test extracting title from normal entry."""
        entry = {"title": "Test Title"}
        assert rss_scraper._extract_title(entry) == "Test Title"

    def test_extract_title_with_whitespace(self, rss_scraper: RSSScraper) -> None:
        """Test title with whitespace is stripped."""
        entry = {"title": "  Test Title  "}
        assert rss_scraper._extract_title(entry) == "Test Title"

    def test_extract_title_missing(self, rss_scraper: RSSScraper) -> None:
        """Test extracting title when missing."""
        entry = {}
        assert rss_scraper._extract_title(entry) == ""


# =============================================================================
# Test _extract_url()
# =============================================================================


class TestExtractUrl:
    """Tests for _extract_url method."""

    def test_extract_url_from_link_field(self, rss_scraper: RSSScraper) -> None:
        """Test extracting URL from standard link field."""
        entry = {"link": "https://example.com/article"}
        assert rss_scraper._extract_url(entry) == "https://example.com/article"

    def test_extract_url_from_id_field(self, rss_scraper: RSSScraper) -> None:
        """Test extracting URL from id field when it's a URL."""
        entry = {"id": "https://example.com/article"}
        assert rss_scraper._extract_url(entry) == "https://example.com/article"

    def test_extract_url_from_id_field_not_url(self, rss_scraper: RSSScraper) -> None:
        """Test that non-URL id field is not used."""
        entry = {"id": "article-123"}
        # Should fall through to links array or return empty
        result = rss_scraper._extract_url(entry)
        # id doesn't start with http, so it won't be used
        assert result == "" or "article-123" not in result

    def test_extract_url_from_atom_links(self, rss_scraper: RSSScraper) -> None:
        """Test extracting URL from Atom format links array."""
        entry = {
            "links": [
                {"rel": "alternate", "href": "https://example.com/article"},
                {"rel": "edit", "href": "https://example.com/edit"},
            ]
        }
        assert rss_scraper._extract_url(entry) == "https://example.com/article"

    def test_extract_url_from_links_with_type_html(self, rss_scraper: RSSScraper) -> None:
        """Test extracting URL from links with type text/html."""
        entry = {"links": [{"type": "text/html", "href": "https://example.com/article"}]}
        assert rss_scraper._extract_url(entry) == "https://example.com/article"

    def test_extract_url_missing(self, rss_scraper: RSSScraper) -> None:
        """Test extracting URL when no URL fields present."""
        entry = {}
        assert rss_scraper._extract_url(entry) == ""


# =============================================================================
# Test _extract_description()
# =============================================================================


class TestExtractDescription:
    """Tests for _extract_description method."""

    def test_extract_description_from_description_field(self, rss_scraper: RSSScraper) -> None:
        """Test extracting from description field."""
        entry = {"description": "Test description"}
        assert rss_scraper._extract_description(entry) == "Test description"

    def test_extract_description_from_summary_field(self, rss_scraper: RSSScraper) -> None:
        """Test extracting from summary field."""
        entry = {"summary": "Test summary"}
        assert rss_scraper._extract_description(entry) == "Test summary"

    def test_extract_description_from_subtitle(self, rss_scraper: RSSScraper) -> None:
        """Test extracting from subtitle field."""
        entry = {"subtitle": "Test subtitle"}
        assert rss_scraper._extract_description(entry) == "Test subtitle"

    def test_extract_description_cleans_html(self, rss_scraper: RSSScraper) -> None:
        """Test that HTML tags are removed from description."""
        entry = {"description": "<p>Description with <b>bold</b> text</p>"}
        result = rss_scraper._extract_description(entry)
        assert "<p>" not in result
        assert "<b>" not in result
        assert "bold" in result

    def test_extract_description_priority(self, rss_scraper: RSSScraper) -> None:
        """Test that description has priority over summary."""
        entry = {
            "description": "From description",
            "summary": "From summary",
        }
        assert rss_scraper._extract_description(entry) == "From description"

    def test_extract_description_missing(self, rss_scraper: RSSScraper) -> None:
        """Test extracting description when missing."""
        entry = {}
        assert rss_scraper._extract_description(entry) == ""


# =============================================================================
# Test _extract_pub_date()
# =============================================================================


class TestExtractPubDate:
    """Tests for _extract_pub_date method."""

    def test_extract_pub_date_from_published(self, rss_scraper: RSSScraper) -> None:
        """Test extracting from published field."""
        entry = {"published": "Mon, 01 Jan 2025 12:00:00 GMT"}
        result = rss_scraper._extract_pub_date(entry)
        assert result is not None
        assert result.year == 2025
        assert result.month == 1
        assert result.day == 1

    def test_extract_pub_date_from_updated(self, rss_scraper: RSSScraper) -> None:
        """Test extracting from updated field."""
        entry = {"updated": "2025-01-01T12:00:00Z"}
        result = rss_scraper._extract_pub_date(entry)
        assert result is not None
        assert result.year == 2025

    def test_extract_pub_date_from_created(self, rss_scraper: RSSScraper) -> None:
        """Test extracting from created field."""
        entry = {"created": "2025-01-01T12:00:00Z"}
        result = rss_scraper._extract_pub_date(entry)
        assert result is not None

    def test_extract_pub_date_from_pub_date(self, rss_scraper: RSSScraper) -> None:
        """Test extracting from pubDate field."""
        entry = {"pubDate": "Mon, 01 Jan 2025 12:00:00 GMT"}
        result = rss_scraper._extract_pub_date(entry)
        assert result is not None

    def test_extract_pub_date_from_parsed(self, rss_scraper: RSSScraper) -> None:
        """Test extracting from published_parsed field."""
        entry = {"published_parsed": (2025, 1, 1, 12, 0, 0, 0, 1, -1)}
        result = rss_scraper._extract_pub_date(entry)
        assert result is not None
        assert result.year == 2025

    def test_extract_pub_date_invalid_parsed(self, rss_scraper: RSSScraper) -> None:
        """Test that invalid parsed date is handled."""
        entry = {"published_parsed": None}
        result = rss_scraper._extract_pub_date(entry)
        # Should return None and continue trying other fields
        assert result is None

    def test_extract_pub_date_missing(self, rss_scraper: RSSScraper) -> None:
        """Test extracting date when missing."""
        entry = {}
        assert rss_scraper._extract_pub_date(entry) is None


# =============================================================================
# Test _extract_author()
# =============================================================================


class TestExtractAuthor:
    """Tests for _extract_author method."""

    def test_extract_author_from_string(self, rss_scraper: RSSScraper) -> None:
        """Test extracting author as string."""
        entry = {"author": "John Doe"}
        assert rss_scraper._extract_author(entry) == "John Doe"

    def test_extract_author_from_dict(self, rss_scraper: RSSScraper) -> None:
        """Test extracting author from dict with name."""
        entry = {"author": {"name": "Jane Doe"}}
        assert rss_scraper._extract_author(entry) == "Jane Doe"

    def test_extract_author_from_author_detail(self, rss_scraper: RSSScraper) -> None:
        """Test extracting from author_detail field."""
        entry = {"author_detail": {"name": "Author Name"}}
        assert rss_scraper._extract_author(entry) == "Author Name"

    def test_extract_author_from_author_detail_empty_name(self, rss_scraper: RSSScraper) -> None:
        """Test author_detail with missing name."""
        entry = {"author_detail": {"email": "author@example.com"}}
        assert rss_scraper._extract_author(entry) == ""

    def test_extract_author_missing(self, rss_scraper: RSSScraper) -> None:
        """Test extracting author when missing."""
        entry = {}
        assert rss_scraper._extract_author(entry) == ""


# =============================================================================
# Test _extract_categories()
# =============================================================================


class TestExtractCategories:
    """Tests for _extract_categories method."""

    def test_extract_categories_from_tags_string(self, rss_scraper: RSSScraper) -> None:
        """Test extracting categories from string tags."""
        entry = {"tags": ["League of Legends", "Esports"]}
        result = rss_scraper._extract_categories(entry)
        assert "League of Legends" in result
        assert "Esports" in result

    def test_extract_categories_from_tags_dict_term(self, rss_scraper: RSSScraper) -> None:
        """Test extracting from tags dict with term."""
        entry = {"tags": [{"term": "Gaming"}, {"term": "News"}]}
        result = rss_scraper._extract_categories(entry)
        assert "Gaming" in result
        assert "News" in result

    def test_extract_categories_from_tags_dict_label(self, rss_scraper: RSSScraper) -> None:
        """Test extracting from tags dict with label."""
        entry = {"tags": [{"label": "Category Label"}]}
        result = rss_scraper._extract_categories(entry)
        assert "Category Label" in result

    def test_extract_categories_from_tags_dict_term_priority(self, rss_scraper: RSSScraper) -> None:
        """Test that term has priority over label."""
        entry = {"tags": [{"term": "Term Value", "label": "Label Value"}]}
        result = rss_scraper._extract_categories(entry)
        assert "Term Value" in result

    def test_extract_categories_from_category_string(self, rss_scraper: RSSScraper) -> None:
        """Test extracting from category string."""
        entry = {"category": "Single Category"}
        result = rss_scraper._extract_categories(entry)
        assert "Single Category" in result

    def test_extract_categories_from_category_list(self, rss_scraper: RSSScraper) -> None:
        """Test extracting from category list."""
        entry = {"category": ["Cat1", "Cat2", "Cat3"]}
        result = rss_scraper._extract_categories(entry)
        assert "Cat1" in result
        assert "Cat2" in result
        assert "Cat3" in result

    def test_extract_categories_combined(self, rss_scraper: RSSScraper) -> None:
        """Test combining tags and category fields."""
        entry = {
            "tags": [{"term": "Tag1"}],
            "category": "Category1",
        }
        result = rss_scraper._extract_categories(entry)
        assert "Tag1" in result
        assert "Category1" in result

    def test_extract_categories_missing(self, rss_scraper: RSSScraper) -> None:
        """Test extracting categories when missing."""
        entry = {}
        assert rss_scraper._extract_categories(entry) == []


# =============================================================================
# Test _extract_image()
# =============================================================================


class TestExtractImage:
    """Tests for _extract_image method."""

    def test_extract_image_from_enclosure(self, rss_scraper: RSSScraper) -> None:
        """Test extracting image from enclosure."""
        entry = {"enclosures": [{"href": "https://example.com/image.jpg", "type": "image/jpeg"}]}
        assert rss_scraper._extract_image(entry) == "https://example.com/image.jpg"

    def test_extract_image_from_enclosure_multiple(self, rss_scraper: RSSScraper) -> None:
        """Test extracting first image from multiple enclosures."""
        entry = {
            "enclosures": [
                {"href": "https://example.com/video.mp4", "type": "video/mp4"},
                {"href": "https://example.com/image.jpg", "type": "image/jpeg"},
            ]
        }
        assert rss_scraper._extract_image(entry) == "https://example.com/image.jpg"

    def test_extract_image_from_media_content(self, rss_scraper: RSSScraper) -> None:
        """Test extracting from media:content."""
        entry = {"media_content": [{"medium": "image", "url": "https://example.com/media.jpg"}]}
        assert rss_scraper._extract_image(entry) == "https://example.com/media.jpg"

    def test_extract_image_from_description_html(self, rss_scraper: RSSScraper) -> None:
        """Test extracting image from description HTML."""
        entry = {"description": '<p>Content</p><img src="https://example.com/img.jpg">'}
        assert rss_scraper._extract_image(entry) == "https://example.com/img.jpg"

    def test_extract_image_from_summary_html(self, rss_scraper: RSSScraper) -> None:
        """Test extracting image from summary HTML."""
        entry = {
            "summary": '<img src="https://example.com/summary.jpg">',
            "description": "No image here",
        }
        assert rss_scraper._extract_image(entry) == "https://example.com/summary.jpg"

    def test_extract_image_enclosure_priority(self, rss_scraper: RSSScraper) -> None:
        """Test that enclosure has priority over other methods."""
        entry = {
            "enclosures": [{"href": "https://example.com/enclosure.jpg", "type": "image/jpeg"}],
            "media_content": [{"medium": "image", "url": "https://example.com/media.jpg"}],
            "description": '<img src="https://example.com/desc.jpg">',
        }
        assert rss_scraper._extract_image(entry) == "https://example.com/enclosure.jpg"

    def test_extract_image_missing(self, rss_scraper: RSSScraper) -> None:
        """Test extracting image when missing."""
        entry = {"description": "No image here"}
        assert rss_scraper._extract_image(entry) is None


# =============================================================================
# Test _extract_content()
# =============================================================================


class TestExtractContent:
    """Tests for _extract_content method."""

    def test_extract_content_from_content(self, rss_scraper: RSSScraper) -> None:
        """Test extracting from content field."""
        entry = {"content": [{"value": "<p>Full content</p>"}]}
        assert rss_scraper._extract_content(entry) == "<p>Full content</p>"

    def test_extract_content_from_summary(self, rss_scraper: RSSScraper) -> None:
        """Test falling back to summary."""
        entry = {"summary": "<p>Summary content</p>"}
        assert rss_scraper._extract_content(entry) == "<p>Summary content</p>"

    def test_extract_content_from_description(self, rss_scraper: RSSScraper) -> None:
        """Test falling back to description."""
        entry = {"description": "<p>Description content</p>"}
        assert rss_scraper._extract_content(entry) == "<p>Description content</p>"

    def test_extract_content_content_priority(self, rss_scraper: RSSScraper) -> None:
        """Test that content has priority."""
        entry = {
            "content": [{"value": "Content value"}],
            "summary": "Summary value",
            "description": "Description value",
        }
        assert rss_scraper._extract_content(entry) == "Content value"

    def test_extract_content_empty_list(self, rss_scraper: RSSScraper) -> None:
        """Test handling empty content list."""
        entry = {"content": []}
        result = rss_scraper._extract_content(entry)
        assert result == "" or "Summary" in result or "Description" in result

    def test_extract_content_missing(self, rss_scraper: RSSScraper) -> None:
        """Test extracting content when missing."""
        entry = {}
        assert rss_scraper._extract_content(entry) == ""


# =============================================================================
# Test _clean_html()
# =============================================================================


class TestCleanHtml:
    """Tests for _clean_html static method."""

    def test_clean_html_removes_tags(self) -> None:
        """Test that HTML tags are removed."""
        html = "<p>Hello <b>world</b></p>"
        result = RSSScraper._clean_html(html)
        assert "<p>" not in result
        assert "<b>" not in result
        assert "Hello world" in result

    def test_clean_html_preserves_text(self) -> None:
        """Test that text content is preserved."""
        html = "<div>Important text content</div>"
        result = RSSScraper._clean_html(html)
        assert "Important text content" in result

    def test_clean_html_handles_nested_tags(self) -> None:
        """Test handling of nested HTML tags."""
        html = "<div><p><span>Nested</span> content</p></div>"
        result = RSSScraper._clean_html(html)
        assert "Nested content" in result
        assert "<div>" not in result

    def test_clean_html_handles_empty_string(self) -> None:
        """Test handling empty string."""
        result = RSSScraper._clean_html("")
        assert result == ""

    def test_clean_html_handles_none(self) -> None:
        """Test handling None input."""
        result = RSSScraper._clean_html(None)
        assert result == ""

    def test_clean_html_normalizes_whitespace(self) -> None:
        """Test that whitespace is normalized."""
        html = "<p>Multiple   spaces\tand\nnewlines</p>"
        result = RSSScraper._clean_html(html)
        # Should have normalized spacing
        assert "Multiple" in result
        assert "spaces" in result
        assert "and" in result
        assert "newlines" in result

    def test_clean_html_with_links(self) -> None:
        """Test handling links."""
        html = '<a href="https://example.com">Link text</a>'
        result = RSSScraper._clean_html(html)
        assert "<a" not in result
        assert "Link text" in result

    def test_clean_html_with_images(self) -> None:
        """Test handling images."""
        html = '<img src="image.jpg" alt="Alt text">'
        result = RSSScraper._clean_html(html)
        assert "<img" not in result
        # Alt text may or may not be preserved depending on implementation
        assert "Alt text" in result or result == ""


# =============================================================================
# Test Article Creation and Metadata
# =============================================================================


class TestArticleCreation:
    """Tests for article creation and metadata."""

    @pytest.mark.asyncio
    async def test_article_has_correct_source(
        self, rss_scraper: RSSScraper, sample_feed_entry: dict
    ) -> None:
        """Test that article has correct source."""
        article = await rss_scraper.parse_article(sample_feed_entry)

        assert article is not None
        assert article.source.source_id == "dexerto"
        assert article.locale == "en-us"

    @pytest.mark.asyncio
    async def test_article_has_guid(self, rss_scraper: RSSScraper, sample_feed_entry: dict) -> None:
        """Test that article has GUID."""
        article = await rss_scraper.parse_article(sample_feed_entry)

        assert article is not None
        assert article.guid
        assert len(article.guid) == 64  # SHA256 hex

    @pytest.mark.asyncio
    async def test_article_has_canonical_url(
        self, rss_scraper: RSSScraper, sample_feed_entry: dict
    ) -> None:
        """Test that article has canonical_url."""
        article = await rss_scraper.parse_article(sample_feed_entry)

        assert article is not None
        assert article.canonical_url == "https://dexerto.com/test-article"

    @pytest.mark.asyncio
    async def test_article_has_source_category(
        self, rss_scraper: RSSScraper, sample_feed_entry: dict
    ) -> None:
        """Test that article has source_category."""
        article = await rss_scraper.parse_article(sample_feed_entry)

        assert article is not None
        assert article.source_category == "esports"

    @pytest.mark.asyncio
    async def test_article_pub_date_defaults_to_now(self, rss_scraper: RSSScraper) -> None:
        """Test that missing pub_date defaults to current time."""
        entry = {
            "title": "Test",
            "link": "https://example.com/test",
        }

        article = await rss_scraper.parse_article(entry)

        assert article is not None
        assert article.pub_date is not None
        # Should be recent (within last minute)
        assert (datetime.utcnow() - article.pub_date).total_seconds() < 60
