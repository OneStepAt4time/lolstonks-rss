"""
Demo script for fetching League of Legends news using the API client.

This script demonstrates how to use the LoLNewsAPIClient to fetch news
from both English and Italian locales.

Usage:
    python examples/fetch_news_demo.py
"""

import asyncio
import sys
from pathlib import Path

# Fix Windows console encoding issues
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.api_client import LoLNewsAPIClient
from src.models import ArticleSource


async def main() -> None:
    """Fetch and display news from LoL API."""
    print("=" * 80)
    print("League of Legends News Fetcher - Demo")
    print("=" * 80)

    # Create API client
    client = LoLNewsAPIClient()

    # Fetch English news
    print("\n[1/2] Fetching English (en-us) news...")
    en_articles = await client.fetch_news('en-us')
    print(f"    Found {len(en_articles)} articles")

    # Display first 5 English articles
    print("\n    Latest English Articles:")
    print("    " + "-" * 76)
    for i, article in enumerate(en_articles[:5], 1):
        print(f"    {i}. {article.title}")
        print(f"       URL: {article.url}")
        print(f"       Published: {article.pub_date.strftime('%Y-%m-%d %H:%M')}")
        print(f"       Category: {', '.join(article.categories)}")
        if article.description:
            desc = article.description[:100] + "..." if len(article.description) > 100 else article.description
            print(f"       Description: {desc}")
        print()

    # Fetch Italian news
    print("\n[2/2] Fetching Italian (it-it) news...")
    it_articles = await client.fetch_news('it-it')
    print(f"    Found {len(it_articles)} articles")

    # Display first 5 Italian articles
    print("\n    Latest Italian Articles:")
    print("    " + "-" * 76)
    for i, article in enumerate(it_articles[:5], 1):
        print(f"    {i}. {article.title}")
        print(f"       URL: {article.url}")
        print(f"       Published: {article.pub_date.strftime('%Y-%m-%d %H:%M')}")
        print(f"       Category: {', '.join(article.categories)}")
        if article.description:
            desc = article.description[:100] + "..." if len(article.description) > 100 else article.description
            print(f"       Description: {desc}")
        print()

    # Summary
    print("=" * 80)
    print("Summary:")
    print(f"  Total English articles: {len(en_articles)}")
    print(f"  Total Italian articles: {len(it_articles)}")
    print(f"  Total articles: {len(en_articles) + len(it_articles)}")
    print("=" * 80)

    # Verify all articles have correct sources
    assert all(a.source == ArticleSource.LOL_EN_US for a in en_articles)
    assert all(a.source == ArticleSource.LOL_IT_IT for a in it_articles)
    print("\n✓ All articles have correct source attribution")

    # Verify all articles have required fields
    all_articles = en_articles + it_articles
    assert all(a.title and a.url and a.pub_date and a.guid for a in all_articles)
    print("✓ All articles have required fields (title, url, pub_date, guid)")

    print("\n✓ Demo completed successfully!")


if __name__ == "__main__":
    asyncio.run(main())
