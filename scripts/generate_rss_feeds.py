"""
Generate RSS 2.0 feeds for GitHub Pages deployment (multi-game edition).

This script fetches articles from the database and generates RSS feeds for all
supported Riot games (LoL, TFT, Wild Rift) across all supported locales, with
per-category sub-feeds. It generates:

Global feed:
- feed.xml (all articles, all games, all locales)

LoL feeds (backwards-compatible):
- feed/{locale}.xml (all LoL articles per locale)
- feed/lol/{locale}/{category}.xml (LoL per category per locale)

TFT feeds:
- feed/tft/{locale}.xml (all TFT articles per locale)
- feed/tft/{locale}/{category}.xml (TFT per category per locale)

Wild Rift feeds:
- feed/wildrift/{locale}.xml (all Wild Rift articles per locale)
- feed/wildrift/{locale}/{category}.xml (Wild Rift per category per locale)

Empty feeds (0 articles) are skipped and not written to disk.

Supported locales (25):
en-us, en-gb, es-es, es-mx, fr-fr, de-de, it-it, pt-br, ru-ru, tr-tr,
pl-pl, ja-jp, ko-kr, zh-cn, zh-tw, ar-ae, vi-vn, th-th, id-id, ph-ph,
cs-cz, el-gr, en-au, en-sg, hu-hu

Usage:
    python scripts/generate_rss_feeds.py
    python scripts/generate_rss_feeds.py --output _site
    python scripts/generate_rss_feeds.py --limit 100
    python scripts/generate_rss_feeds.py --base-url https://example.com
"""

import argparse
import asyncio
import logging
import sys
from pathlib import Path
from typing import Final

# Add project root to path for imports
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.config import (  # noqa: E402
    CATEGORY_SLUG_TO_DISPLAY,
    FEED_DESCRIPTIONS,
    FEED_TITLES,
    GAME_CATEGORIES,
    GAME_DOMAINS,
    RIOT_LOCALES,
    TFT_FEED_DESCRIPTIONS,
    TFT_FEED_TITLES,
    WILDRIFT_FEED_DESCRIPTIONS,
    WILDRIFT_FEED_TITLES,
    get_settings,
)
from src.database import ArticleRepository  # noqa: E402
from src.models import Article, ArticleSource  # noqa: E402
from src.rss.generator import RSSFeedGenerator  # noqa: E402

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger: Final[logging.Logger] = logging.getLogger(__name__)

# GitHub Pages base URL
GITHUB_PAGES_URL: Final[str] = "https://onestepat4time.github.io/lolstonks-rss"

# Locale to RSS language code mapping
LOCALE_TO_LANG_CODE: Final[dict[str, str]] = {
    "en-us": "en",
    "en-gb": "en",
    "es-es": "es",
    "es-mx": "es",
    "fr-fr": "fr",
    "de-de": "de",
    "it-it": "it",
    "pt-br": "pt-BR",
    "ru-ru": "ru",
    "tr-tr": "tr",
    "pl-pl": "pl",
    "ja-jp": "ja",
    "ko-kr": "ko",
    "zh-cn": "zh-CN",
    "zh-tw": "zh-TW",
    "ar-ae": "ar",
    "vi-vn": "vi",
    "th-th": "th",
    "id-id": "id",
    "ph-ph": "tl",  # Filipino language code
    "cs-cz": "cs",
    "el-gr": "el",
    "en-au": "en",
    "en-sg": "en",
    "hu-hu": "hu",
}

# Game-specific feed title/description accessors keyed by source_id
_GAME_FEED_TITLES: Final[dict[str, dict[str, str]]] = {
    "lol": FEED_TITLES,
    "tft": TFT_FEED_TITLES,
    "wildrift": WILDRIFT_FEED_TITLES,
}

_GAME_FEED_DESCRIPTIONS: Final[dict[str, dict[str, str]]] = {
    "lol": FEED_DESCRIPTIONS,
    "tft": TFT_FEED_DESCRIPTIONS,
    "wildrift": WILDRIFT_FEED_DESCRIPTIONS,
}

# Default titles/descriptions when locale is not found in the mapping
_GAME_DEFAULT_TITLES: Final[dict[str, str]] = {
    "lol": "League of Legends News",
    "tft": "Teamfight Tactics News",
    "wildrift": "Wild Rift News",
}

_GAME_DEFAULT_DESCRIPTIONS: Final[dict[str, str]] = {
    "lol": "Latest League of Legends news and updates",
    "tft": "Latest Teamfight Tactics news and updates",
    "wildrift": "Latest Wild Rift news and updates",
}

# Human-readable game names for category feed titles
_GAME_DISPLAY_NAMES: Final[dict[str, str]] = {
    "lol": "League of Legends",
    "tft": "Teamfight Tactics",
    "wildrift": "Wild Rift",
}

# Locale-specific feed links for LoL (existing news page links)
_LOL_FEED_LINKS: Final[dict[str, str]] = {
    "en-us": "https://www.leagueoflegends.com/news",
    "en-gb": "https://www.leagueoflegends.com/en-gb/news/",
    "es-es": "https://www.leagueoflegends.com/es-es/news/",
    "es-mx": "https://www.leagueoflegends.com/es-mx/news/",
    "fr-fr": "https://www.leagueoflegends.com/fr-fr/news/",
    "de-de": "https://www.leagueoflegends.com/de-de/news/",
    "it-it": "https://www.leagueoflegends.com/it-it/news/",
    "pt-br": "https://www.leagueoflegends.com/pt-br/news/",
    "ru-ru": "https://www.leagueoflegends.com/ru-ru/news/",
    "tr-tr": "https://www.leagueoflegends.com/tr-tr/news/",
    "pl-pl": "https://www.leagueoflegends.com/pl-pl/news/",
    "ja-jp": "https://www.leagueoflegends.com/ja-jp/news/",
    "ko-kr": "https://www.leagueoflegends.com/ko-kr/news/",
    "zh-cn": "https://www.leagueoflegends.com/zh-cn/news/",
    "zh-tw": "https://www.leagueoflegends.com/zh-tw/news/",
    "ar-ae": "https://www.leagueoflegends.com/ar-ae/news/",
    "vi-vn": "https://www.leagueoflegends.com/vi-vn/news/",
    "th-th": "https://www.leagueoflegends.com/th-th/news/",
    "id-id": "https://www.leagueoflegends.com/id-id/news/",
    "ph-ph": "https://www.leagueoflegends.com/ph-ph/news/",
    "cs-cz": "https://www.leagueoflegends.com/cs-cz/news/",
    "el-gr": "https://www.leagueoflegends.com/el-gr/news/",
    "en-au": "https://www.leagueoflegends.com/en-au/news/",
    "en-sg": "https://www.leagueoflegends.com/en-sg/news/",
    "hu-hu": "https://www.leagueoflegends.com/hu-hu/news/",
}


def _get_feed_link(game_id: str, locale: str) -> str:
    """
    Build the website news link for a given game and locale.

    For LoL, uses the curated _LOL_FEED_LINKS mapping. For TFT and Wild Rift,
    constructs the link from GAME_DOMAINS.

    Args:
        game_id: Game identifier ("lol", "tft", or "wildrift").
        locale: Riot locale code (e.g., "en-us").

    Returns:
        URL to the news page for the game and locale.
    """
    if game_id == "lol":
        return _LOL_FEED_LINKS.get(locale, f"{GAME_DOMAINS['lol']}/{locale}/news/")
    domain = GAME_DOMAINS.get(game_id, GAME_DOMAINS["lol"])
    return f"{domain}/{locale}/news/"


def _get_feed_title(game_id: str, locale: str) -> str:
    """
    Get the localized feed title for a game and locale.

    Args:
        game_id: Game identifier ("lol", "tft", or "wildrift").
        locale: Riot locale code.

    Returns:
        Localized feed title string.
    """
    titles = _GAME_FEED_TITLES.get(game_id, {})
    return titles.get(locale, _GAME_DEFAULT_TITLES.get(game_id, "News"))


def _get_feed_description(game_id: str, locale: str) -> str:
    """
    Get the localized feed description for a game and locale.

    Args:
        game_id: Game identifier ("lol", "tft", or "wildrift").
        locale: Riot locale code.

    Returns:
        Localized feed description string.
    """
    descriptions = _GAME_FEED_DESCRIPTIONS.get(game_id, {})
    return descriptions.get(
        locale, _GAME_DEFAULT_DESCRIPTIONS.get(game_id, "Latest news and updates")
    )


def _build_category_feed_title(game_id: str, category_display: str, locale: str) -> str:
    """
    Build a category-specific feed title.

    Format: "{Game Display Name} {Category} - {Locale Title}"
    Example: "League of Legends Game Updates - English (US)"

    Args:
        game_id: Game identifier ("lol", "tft", or "wildrift").
        category_display: Human-readable category name (e.g., "Game Updates").
        locale: Riot locale code for the locale title suffix.

    Returns:
        Formatted category feed title.
    """
    game_name = _GAME_DISPLAY_NAMES.get(game_id, game_id)
    locale_title = _get_feed_title(game_id, locale)
    return f"{game_name} {category_display} - {locale_title}"


def _filter_by_category(articles: list[Article], category_display: str) -> list[Article]:
    """
    Filter articles whose categories list contains the given display name.

    Args:
        articles: List of articles to filter.
        category_display: Display name to match (e.g., "Game Updates", "Dev").

    Returns:
        Filtered list of articles matching the category.
    """
    return [a for a in articles if category_display in a.categories]


def _write_feed(
    feed_path: Path,
    generator: RSSFeedGenerator,
    articles: list[Article],
    feed_url: str,
) -> int | None:
    """
    Generate and write an RSS feed to disk if articles are non-empty.

    Args:
        feed_path: Filesystem path for the output XML file.
        generator: Configured RSSFeedGenerator instance.
        articles: Articles to include in the feed.
        feed_url: Self-referencing URL for the feed.

    Returns:
        File size in bytes if written, None if skipped (empty feed).
    """
    if not articles:
        return None

    feed_path.parent.mkdir(parents=True, exist_ok=True)
    feed_xml = generator.generate_feed(articles, feed_url)
    feed_path.write_text(feed_xml, encoding="utf-8")
    return feed_path.stat().st_size


async def generate_feeds(
    output_dir: str | Path = "_site",
    limit: int = 100,
    base_url: str | None = None,
) -> dict[str, int]:
    """
    Generate all RSS feeds from database articles (multi-game, per-category).

    Produces the following feed hierarchy:
    - feed.xml                                  (global: all games, all locales)
    - feed/{locale}.xml                         (LoL per locale, backwards-compatible)
    - feed/lol/{locale}/{category}.xml          (LoL per category per locale)
    - feed/tft/{locale}.xml                     (TFT all categories per locale)
    - feed/tft/{locale}/{category}.xml          (TFT per category per locale)
    - feed/wildrift/{locale}.xml                (Wild Rift all categories per locale)
    - feed/wildrift/{locale}/{category}.xml     (Wild Rift per category per locale)

    Empty feeds (0 articles) are skipped entirely.

    Args:
        output_dir: Directory where feed files will be saved.
        limit: Maximum number of articles per feed.
        base_url: Base URL for feed links (default: GITHUB_PAGES_URL).

    Returns:
        Dictionary mapping feed file paths to their sizes in bytes.

    Raises:
        OSError: If directory creation or file write fails.
        Exception: If database query fails or feed generation fails.
    """
    logger.info("=" * 60)
    logger.info("RSS Feed Generator for GitHub Pages (Multi-Game)")
    logger.info("=" * 60)
    logger.info(f"Generating RSS feeds with up to {limit} articles per feed...")

    # Determine base URL
    feed_base_url = base_url or GITHUB_PAGES_URL
    logger.info(f"Using base URL: {feed_base_url}")

    # Get settings and initialize repository
    settings = get_settings()
    logger.info(f"Database path: {settings.database_path}")

    repository = ArticleRepository(settings.database_path)
    await repository.initialize()

    # Create output directory
    output_path = Path(output_dir)
    try:
        output_path.mkdir(parents=True, exist_ok=True)
        logger.info(f"Output directory: {output_path.absolute()}")
    except OSError as e:
        logger.error(f"Failed to create output directory: {e}")
        raise

    # Track generated feeds
    generated: dict[str, int] = {}
    skipped_count = 0

    # ------------------------------------------------------------------ #
    # 1. Global feed: feed.xml (all articles, all games)
    # ------------------------------------------------------------------ #
    logger.info("Generating global feed (all games, all locales)...")
    try:
        all_articles = await repository.get_latest(limit=limit)
        logger.info(f"Fetched {len(all_articles)} total articles for global feed")

        global_generator = RSSFeedGenerator(
            feed_title="League of Legends News",
            feed_link="https://www.leagueoflegends.com/news",
            feed_description="Latest League of Legends news and updates",
            language="en",
        )

        feed_filename = "feed.xml"
        feed_path = output_path / feed_filename
        feed_url = f"{feed_base_url}/{feed_filename}"
        size = _write_feed(feed_path, global_generator, all_articles, feed_url)

        if size is not None:
            generated[str(feed_path)] = size
            logger.info(f"Global feed saved: {feed_path.absolute()} ({size / 1024:.2f} KB)")
        else:
            skipped_count += 1
            logger.info("Global feed skipped (0 articles)")
    except Exception as e:
        logger.error(f"Failed to generate global feed: {e}")
        raise

    # ------------------------------------------------------------------ #
    # 2. Per-game, per-locale, per-category feeds
    # ------------------------------------------------------------------ #
    games = ["lol", "tft", "wildrift"]

    for game_id in games:
        categories = GAME_CATEGORIES.get(game_id, [])
        logger.info(
            f"Generating feeds for {_GAME_DISPLAY_NAMES.get(game_id, game_id)} "
            f"({len(RIOT_LOCALES)} locales, {len(categories)} categories)..."
        )

        for locale in RIOT_LOCALES:
            # -- Fetch all articles for this (game, locale) combination -- #
            source = ArticleSource.create(game_id, locale)
            try:
                locale_articles = await repository.get_latest(limit=limit, source=str(source))
            except Exception as e:
                logger.error(f"Failed to fetch articles for {game_id}:{locale}: {e}")
                raise

            lang_code = LOCALE_TO_LANG_CODE.get(locale, "en")
            feed_link = _get_feed_link(game_id, locale)
            base_title = _get_feed_title(game_id, locale)
            base_description = _get_feed_description(game_id, locale)

            # ---------------------------------------------------------- #
            # 2a. Combined locale feed (all categories for this game+locale)
            # ---------------------------------------------------------- #
            if game_id == "lol":
                # Backwards-compatible path: feed/{locale}.xml
                feed_filename = f"feed/{locale}.xml"
            else:
                # New path: feed/{game}/{locale}.xml
                feed_filename = f"feed/{game_id}/{locale}.xml"

            locale_generator = RSSFeedGenerator(
                feed_title=base_title,
                feed_link=feed_link,
                feed_description=base_description,
                language=lang_code,
            )

            feed_path = output_path / feed_filename
            feed_url = f"{feed_base_url}/{feed_filename}"

            try:
                size = _write_feed(feed_path, locale_generator, locale_articles, feed_url)
                if size is not None:
                    generated[str(feed_path)] = size
                    logger.debug(
                        f"Feed saved: {feed_filename} ({size / 1024:.2f} KB, "
                        f"{len(locale_articles)} articles)"
                    )
                else:
                    skipped_count += 1
                    logger.debug(f"Feed skipped (empty): {feed_filename}")
            except Exception as e:
                logger.error(f"Failed to generate {feed_filename}: {e}")
                raise

            # ---------------------------------------------------------- #
            # 2b. Per-category feeds for this game+locale
            # ---------------------------------------------------------- #
            for category_slug in categories:
                category_display = CATEGORY_SLUG_TO_DISPLAY.get(category_slug, category_slug)
                category_articles = _filter_by_category(locale_articles, category_display)

                # Build path: feed/{game}/{locale}/{category}.xml
                # For LoL: feed/lol/{locale}/{category}.xml
                cat_feed_filename = f"feed/{game_id}/{locale}/{category_slug}.xml"

                cat_title = _build_category_feed_title(game_id, category_display, locale)
                cat_generator = RSSFeedGenerator(
                    feed_title=cat_title,
                    feed_link=feed_link,
                    feed_description=(f"{category_display} - {base_description}"),
                    language=lang_code,
                )

                cat_feed_path = output_path / cat_feed_filename
                cat_feed_url = f"{feed_base_url}/{cat_feed_filename}"

                try:
                    size = _write_feed(
                        cat_feed_path,
                        cat_generator,
                        category_articles,
                        cat_feed_url,
                    )
                    if size is not None:
                        generated[str(cat_feed_path)] = size
                        logger.debug(
                            f"Category feed saved: {cat_feed_filename} "
                            f"({size / 1024:.2f} KB, "
                            f"{len(category_articles)} articles)"
                        )
                    else:
                        skipped_count += 1
                except Exception as e:
                    logger.error(f"Failed to generate {cat_feed_filename}: {e}")
                    raise

        logger.info(f"Finished {_GAME_DISPLAY_NAMES.get(game_id, game_id)} feeds")

    # Close repository
    await repository.close()

    logger.info(
        f"Feed generation complete: {len(generated)} written, " f"{skipped_count} skipped (empty)"
    )

    return generated


def validate_feeds(feeds: dict[str, int]) -> bool:
    """
    Validate generated RSS feeds.

    Args:
        feeds: Dictionary of feed file paths to sizes.

    Returns:
        True if all feeds are valid, False otherwise.
    """
    all_valid = True

    for feed_path, size in feeds.items():
        path = Path(feed_path)

        # Check file exists
        if not path.exists():
            print(f"ERROR: Feed file not found: {feed_path}")
            all_valid = False
            continue

        # Check file size
        if size == 0:
            print(f"WARNING: Feed file is empty: {feed_path}")
            all_valid = False
            continue

        # Check XML structure
        content = path.read_text(encoding="utf-8")

        # Basic RSS validation
        if not content.strip().startswith("<?xml"):
            print(f"WARNING: Feed doesn't start with XML declaration: {feed_path}")
        if "<rss" not in content:
            print(f"ERROR: Feed missing <rss> tag: {feed_path}")
            all_valid = False
        if "<channel>" not in content:
            print(f"ERROR: Feed missing <channel> tag: {feed_path}")
            all_valid = False

        if all_valid:
            print(f"Feed validated: {feed_path}")

    return all_valid


def parse_arguments() -> argparse.Namespace:
    """
    Parse command line arguments.

    Returns:
        Parsed arguments namespace.
    """
    parser = argparse.ArgumentParser(
        description="Generate RSS 2.0 feeds for GitHub Pages deployment (multi-game)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  Generate feeds with default settings:
    python scripts/generate_rss_feeds.py

  Generate feeds to custom output directory:
    python scripts/generate_rss_feeds.py --output _site

  Generate feeds with more articles:
    python scripts/generate_rss_feeds.py --limit 100

  Generate feeds with custom base URL:
    python scripts/generate_rss_feeds.py --base-url https://example.com

  Combine options:
    python scripts/generate_rss_feeds.py --output public --limit 200 --base-url https://example.com

Generated feed hierarchy:
  - feed.xml                                (all articles, all games)
  - feed/{locale}.xml                       (LoL per locale, backwards-compatible)
  - feed/lol/{locale}/{category}.xml        (LoL per category per locale)
  - feed/tft/{locale}.xml                   (TFT all categories per locale)
  - feed/tft/{locale}/{category}.xml        (TFT per category per locale)
  - feed/wildrift/{locale}.xml              (Wild Rift all categories per locale)
  - feed/wildrift/{locale}/{category}.xml   (Wild Rift per category per locale)

Supported locales (25):
  en-us, en-gb, es-es, es-mx, fr-fr, de-de, it-it, pt-br, ru-ru, tr-tr,
  pl-pl, ja-jp, ko-kr, zh-cn, zh-tw, ar-ae, vi-vn, th-th, id-id, ph-ph,
  cs-cz, el-gr, en-au, en-sg, hu-hu

Games: League of Legends (lol), Teamfight Tactics (tft), Wild Rift (wildrift)
        """,
    )

    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default="_site",
        help="Output directory for RSS feeds (default: _site)",
    )

    parser.add_argument(
        "--limit",
        "-l",
        type=int,
        default=50,
        help="Maximum number of articles per feed (default: 50, max: 500)",
    )

    parser.add_argument(
        "--base-url",
        "-b",
        type=str,
        default=None,
        help="Base URL for feed links (default: from GITHUB_PAGES_URL)",
    )

    parser.add_argument(
        "--no-validate",
        action="store_true",
        help="Skip feed validation after generation",
    )

    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable verbose logging",
    )

    return parser.parse_args()


def main() -> None:
    """
    Main entry point for the script.

    Parses arguments, configures logging, and runs the async generator.
    """
    args = parse_arguments()

    # Configure logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Validate limit
    if args.limit < 1:
        logger.error("Limit must be at least 1")
        sys.exit(1)

    if args.limit > 500:
        logger.warning("Limit capped at 500 articles for performance")
        args.limit = 500

    # Validate output path
    try:
        output_path = Path(args.output)
        # Test if we can create the directory
        output_path.mkdir(parents=True, exist_ok=True)
    except OSError as e:
        logger.error(f"Cannot create output directory '{args.output}': {e}")
        sys.exit(1)

    # Run async function
    try:
        feeds = asyncio.run(
            generate_feeds(
                output_dir=args.output,
                limit=args.limit,
                base_url=args.base_url,
            )
        )

        # Validate feeds
        if not args.no_validate:
            logger.info("Validating feeds...")
            valid = validate_feeds(feeds)

            if not valid:
                logger.warning("Some feeds failed validation")
                sys.exit(1)

        # Print summary
        logger.info("=" * 60)
        logger.info("RSS Feed Generation Complete")
        logger.info("=" * 60)
        logger.info(f"Total feeds generated: {len(feeds)}")
        logger.info(f"Output directory: {Path(args.output).absolute()}")

        # Use base URL for public URLs
        feed_base_url = args.base_url or GITHUB_PAGES_URL

        logger.info("Generated feeds:")
        for feed_path, size in feeds.items():
            logger.info(f"  - {feed_path} ({size / 1024:.2f} KB)")

        logger.info("Public URL patterns:")
        logger.info(f"  - {feed_base_url}/feed.xml")
        logger.info(f"  - {feed_base_url}/feed/{{locale}}.xml  (LoL)")
        logger.info(f"  - {feed_base_url}/feed/lol/{{locale}}/{{category}}.xml")
        logger.info(f"  - {feed_base_url}/feed/tft/{{locale}}.xml")
        logger.info(f"  - {feed_base_url}/feed/tft/{{locale}}/{{category}}.xml")
        logger.info(f"  - {feed_base_url}/feed/wildrift/{{locale}}.xml")
        logger.info(f"  - {feed_base_url}/feed/wildrift/{{locale}}/{{category}}.xml")
        logger.info("")
        logger.info("  Supported locales (25): en-us, en-gb, es-es, es-mx, fr-fr, de-de,")
        logger.info("    it-it, pt-br, ru-ru, tr-tr, pl-pl, ja-jp, ko-kr, zh-cn, zh-tw,")
        logger.info("    ar-ae, vi-vn, th-th, id-id, ph-ph, cs-cz, el-gr, en-au, en-sg,")
        logger.info("    hu-hu")
        logger.info("  Games: League of Legends, Teamfight Tactics, Wild Rift")

    except KeyboardInterrupt:
        logger.info("Operation cancelled by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Error generating RSS feeds: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
