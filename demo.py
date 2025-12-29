"""
Demo script showing the foundation components in action.

This script demonstrates the core functionality:
- Creating articles
- Saving to database
- Querying articles
- Using cache
"""

import asyncio
from datetime import datetime, timedelta
from src.models import Article, ArticleSource
from src.database import ArticleRepository
from src.config import get_settings
from src.utils.cache import TTLCache


async def demo_database():
    """Demonstrate database operations."""
    print("=" * 60)
    print("DATABASE DEMO")
    print("=" * 60)

    # Initialize repository
    repo = ArticleRepository("data/demo.db")
    await repo.initialize()
    print("[OK] Database initialized")

    # Create sample articles
    articles = [
        Article(
            title="New Champion: Vex Released",
            url="https://leagueoflegends.com/news/vex-released",
            pub_date=datetime(2025, 12, 28, 10, 0, 0),
            guid="vex-release-2025",
            source=ArticleSource.LOL_EN_US,
            description="The Gloomist joins the League!",
            categories=["Champions", "Game Updates"],
            image_url="https://example.com/vex.jpg"
        ),
        Article(
            title="Patch 14.1 Notes",
            url="https://leagueoflegends.com/news/patch-14-1",
            pub_date=datetime(2025, 12, 27, 15, 0, 0),
            guid="patch-14-1-2025",
            source=ArticleSource.LOL_EN_US,
            description="Latest balance changes and updates",
            categories=["Patch Notes", "Game Updates"]
        ),
        Article(
            title="Nuovo Campione: Vex",
            url="https://leagueoflegends.com/it-it/news/vex-released",
            pub_date=datetime(2025, 12, 28, 10, 0, 0),
            guid="vex-release-2025-it",
            source=ArticleSource.LOL_IT_IT,
            description="La Tristezza si unisce alla League!",
            categories=["Campioni", "Aggiornamenti"]
        ),
    ]

    # Save articles
    count = await repo.save_many(articles)
    print(f"[OK] Saved {count} new articles")

    # Try to save duplicates
    count = await repo.save_many(articles)
    print(f"[OK] Duplicate check: {count} new articles (should be 0)")

    # Get total count
    total = await repo.count()
    print(f"[OK] Total articles in database: {total}")

    # Get latest articles
    latest = await repo.get_latest(limit=5)
    print(f"\n[NEWS] Latest {len(latest)} articles:")
    for i, article in enumerate(latest, 1):
        print(f"  {i}. {article.title}")
        print(f"     Source: {article.source.value}")
        print(f"     Date: {article.pub_date.strftime('%Y-%m-%d %H:%M')}")

    # Get by source
    en_articles = await repo.get_latest(limit=10, source="lol-en-us")
    print(f"\n[EN-US] Articles: {len(en_articles)}")

    it_articles = await repo.get_latest(limit=10, source="lol-it-it")
    print(f"[IT-IT] Articles: {len(it_articles)}")

    # Get by GUID
    article = await repo.get_by_guid("vex-release-2025")
    if article:
        print(f"\n[FIND] Found by GUID: {article.title}")
        print(f"       Categories: {', '.join(article.categories)}")


def demo_cache():
    """Demonstrate cache operations."""
    print("\n" + "=" * 60)
    print("CACHE DEMO")
    print("=" * 60)

    # Create cache
    cache = TTLCache(default_ttl_seconds=60)
    print("[OK] Cache initialized with 60s default TTL")

    # Set values
    cache.set("build_id", "ABC123", ttl_seconds=3600)
    cache.set("api_response", {"articles": [1, 2, 3]}, ttl_seconds=1800)
    cache.set("temp_value", "expires soon", ttl_seconds=2)
    print("[OK] Cached 3 items")

    # Get values
    build_id = cache.get("build_id")
    print(f"\n[GET] Retrieved build_id: {build_id}")

    api_response = cache.get("api_response")
    print(f"[GET] Retrieved api_response: {api_response}")

    # Test expiration
    import time
    print("\n[WAIT] Waiting 2.5 seconds for temp_value to expire...")
    time.sleep(2.5)

    expired = cache.get("temp_value")
    print(f"[GET] Expired value: {expired} (should be None)")

    still_valid = cache.get("build_id")
    print(f"[GET] Still valid: {still_valid}")

    # Cleanup
    removed = cache.cleanup_expired()
    print(f"\n[CLEAN] Cleaned up {removed} expired items")


def demo_models():
    """Demonstrate model operations."""
    print("\n" + "=" * 60)
    print("MODEL DEMO")
    print("=" * 60)

    # Create article
    article = Article(
        title="Season 2025 Kickoff",
        url="https://leagueoflegends.com/news/season-2025",
        pub_date=datetime.now(),
        guid="season-2025-kickoff",
        source=ArticleSource.LOL_EN_US,
        description="New season brings exciting changes",
        categories=["Esports", "Competitive"],
        author="Riot Games Esports Team"
    )
    print("[OK] Created article")
    print(f"     Title: {article.title}")
    print(f"     Source: {article.source.value}")
    print(f"     Author: {article.author}")

    # Serialize to dict
    data = article.to_dict()
    print(f"\n[DICT] Serialized to dict:")
    print(f"       Keys: {', '.join(data.keys())}")
    print(f"       Categories (CSV): {data['categories']}")

    # Deserialize from dict
    restored = Article.from_dict(data)
    print(f"\n[LOAD] Deserialized from dict:")
    print(f"       Title: {restored.title}")
    print(f"       Categories (list): {restored.categories}")

    # Test validation
    print(f"\n[TEST] Validation test:")
    try:
        invalid = Article(
            title="",  # Empty title should fail
            url="https://example.com",
            pub_date=datetime.now(),
            guid="test",
            source=ArticleSource.LOL_EN_US
        )
    except ValueError as e:
        print(f"       Caught expected error: {e}")


def demo_config():
    """Demonstrate configuration."""
    print("\n" + "=" * 60)
    print("CONFIG DEMO")
    print("=" * 60)

    settings = get_settings()
    print("[OK] Configuration loaded")
    print(f"\n[CONFIG] Settings:")
    print(f"         Database: {settings.database_path}")
    print(f"         RSS Max Items: {settings.rss_max_items}")
    print(f"         Cache TTL: {settings.cache_ttl_seconds}s ({settings.cache_ttl_seconds // 3600}h)")
    print(f"         Server: {settings.host}:{settings.port}")
    print(f"         Update Interval: {settings.update_interval_minutes} minutes")
    print(f"         Supported Locales: {', '.join(settings.supported_locales)}")


async def main():
    """Run all demos."""
    print("\n")
    print("=" * 60)
    print("  LoL Stonks RSS - Foundation Demo".center(60))
    print("  Phase 2 Complete".center(60))
    print("=" * 60)

    # Run demos
    demo_config()
    demo_models()
    demo_cache()
    await demo_database()

    print("\n" + "=" * 60)
    print("DEMO COMPLETE")
    print("=" * 60)
    print("\n[SUCCESS] Foundation is ready for Phase 3 implementation!")
    print("\nNext steps:")
    print("  1. Implement LoL News API client")
    print("  2. Add RSS feed generator")
    print("  3. Create FastAPI web server")
    print("  4. Add Docker containerization")
    print()


if __name__ == "__main__":
    asyncio.run(main())
