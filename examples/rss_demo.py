"""
RSS Feed Generator Demo

This script demonstrates how to use the RSS feed generator to create
RSS 2.0 feeds from League of Legends news articles.

Usage:
    python examples/rss_demo.py
"""

import asyncio
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.api_client import LoLNewsAPIClient
from src.rss.generator import RSSFeedGenerator
from src.models import ArticleSource


async def main() -> None:
    """Main demo function."""
    print("=" * 70)
    print("RSS Feed Generator Demo")
    print("=" * 70)
    print()

    # Initialize API client
    print("1. Fetching news from League of Legends API...")
    client = LoLNewsAPIClient()

    try:
        # Fetch English news
        print("   - Fetching English (en-us) news...")
        articles_en = await client.fetch_news('en-us')
        print(f"   [OK] Fetched {len(articles_en)} English articles")

        # Fetch Italian news
        print("   - Fetching Italian (it-it) news...")
        articles_it = await client.fetch_news('it-it')
        print(f"   [OK] Fetched {len(articles_it)} Italian articles")

        # Combine articles
        all_articles = articles_en + articles_it
        print(f"   [OK] Total articles: {len(all_articles)}")
        print()

    except Exception as e:
        print(f"   [ERROR] Error fetching news: {e}")
        return

    # Generate main feed
    print("2. Generating RSS feeds...")
    generator_en = RSSFeedGenerator(
        feed_title="League of Legends News",
        feed_description="Latest League of Legends news and updates",
        language="en"
    )

    generator_it = RSSFeedGenerator(
        feed_title="Notizie League of Legends",
        feed_description="Ultime notizie e aggiornamenti di League of Legends",
        language="it"
    )

    # Generate main feed (first 10 articles)
    print("   - Generating main feed (all sources)...")
    main_feed = generator_en.generate_feed(
        all_articles[:10],
        feed_url="http://localhost:8000/feed.xml"
    )

    output_dir = project_root / "data" / "feeds"
    output_dir.mkdir(parents=True, exist_ok=True)

    main_feed_path = output_dir / "main_feed.xml"
    with open(main_feed_path, 'w', encoding='utf-8') as f:
        f.write(main_feed)
    print(f"   [OK] Main feed saved: {main_feed_path}")

    # Generate English-only feed
    print("   - Generating English-only feed...")
    en_feed = generator_en.generate_feed_by_source(
        all_articles,
        ArticleSource.LOL_EN_US,
        feed_url="http://localhost:8000/feed/en-us.xml"
    )

    en_feed_path = output_dir / "en_us_feed.xml"
    with open(en_feed_path, 'w', encoding='utf-8') as f:
        f.write(en_feed)
    print(f"   [OK] English feed saved: {en_feed_path}")

    # Generate Italian-only feed
    print("   - Generating Italian-only feed...")
    it_feed = generator_it.generate_feed_by_source(
        all_articles,
        ArticleSource.LOL_IT_IT,
        feed_url="http://localhost:8000/feed/it-it.xml"
    )

    it_feed_path = output_dir / "it_it_feed.xml"
    with open(it_feed_path, 'w', encoding='utf-8') as f:
        f.write(it_feed)
    print(f"   [OK] Italian feed saved: {it_feed_path}")

    # Generate category-specific feed (if we have categories)
    if articles_en and articles_en[0].categories:
        category = articles_en[0].categories[0]
        print(f"   - Generating feed for category '{category}'...")
        category_feed = generator_en.generate_feed_by_category(
            all_articles,
            category,
            feed_url=f"http://localhost:8000/feed/{category.lower()}.xml"
        )

        category_feed_path = output_dir / f"{category.lower()}_feed.xml"
        with open(category_feed_path, 'w', encoding='utf-8') as f:
            f.write(category_feed)
        print(f"   [OK] Category feed saved: {category_feed_path}")

    print()

    # Display sample article information
    print("3. Sample Article Information:")
    print("-" * 70)
    if articles_en:
        article = articles_en[0]
        print(f"   Title:       {article.title}")
        print(f"   URL:         {article.url}")
        print(f"   Published:   {article.pub_date}")
        print(f"   Source:      {article.source.value}")
        print(f"   Categories:  {', '.join(article.categories) if article.categories else 'None'}")
        print(f"   Author:      {article.author}")
        if article.image_url:
            print(f"   Image:       {article.image_url[:60]}...")
        if article.description:
            print(f"   Description: {article.description[:80]}...")
    print()

    # Display feed statistics
    print("4. Feed Statistics:")
    print("-" * 70)
    print(f"   Total articles fetched:    {len(all_articles)}")
    print(f"   English articles:          {len(articles_en)}")
    print(f"   Italian articles:          {len(articles_it)}")
    print(f"   Feeds generated:           4")
    print()

    # Display validation info
    print("5. RSS 2.0 Validation:")
    print("-" * 70)
    try:
        import feedparser
        feed = feedparser.parse(main_feed)
        print(f"   [OK] Feed is valid RSS 2.0")
        print(f"   [OK] Feed title: {feed.feed.title}")
        print(f"   [OK] Feed language: {feed.feed.language}")
        print(f"   [OK] Number of entries: {len(feed.entries)}")
        print(f"   [OK] Feed has 'self' link: {any(link.get('rel') == 'self' for link in feed.feed.links)}")
    except ImportError:
        print("   [WARN] feedparser not installed (install for validation)")
    print()

    print("=" * 70)
    print("Demo completed successfully!")
    print(f"Generated feeds are available in: {output_dir}")
    print("=" * 70)


if __name__ == '__main__':
    asyncio.run(main())
