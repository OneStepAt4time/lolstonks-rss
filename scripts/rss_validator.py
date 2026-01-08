import asyncio
import logging

# Add src to path
import os
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

sys.path.append(os.getcwd())

from src.models import Article, ArticleSource
from src.rss.generator import RSSFeedGenerator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rss_validator")


def validate_rss_xml(xml_content: str):
    """Validate that the string is valid RSS 2.0 XML."""
    try:
        root = ET.fromstring(xml_content)

        # Check root element
        if root.tag != "rss":
            logger.error("Root element is not 'rss'")
            return False

        if root.get("version") != "2.0":
            logger.error("RSS version is not '2.0'")
            return False

        channel = root.find("channel")
        if channel is None:
            logger.error("Missing 'channel' element")
            return False

        # Check required channel elements
        required_elements = ["title", "link", "description"]
        for elem in required_elements:
            if channel.find(elem) is None:
                logger.error(f"Missing required channel element: {elem}")
                return False

        # Check items
        items = channel.findall("item")
        logger.info(f"Found {len(items)} items in feed")

        if not items:
            logger.warning("No items found in feed")

        for i, item in enumerate(items):
            # Check required item elements
            # title OR description is required (usually both)
            title = item.find("title")
            description = item.find("description")

            if title is None and description is None:
                logger.error(f"Item {i} has neither title nor description")
                return False

            # Check GUID
            guid = item.find("guid")
            if guid is None:
                logger.error(f"Item {i} missing guid")
                return False

            # Check pubDate
            pub_date = item.find("pubDate")
            if pub_date is None:
                logger.error(f"Item {i} missing pubDate")
                return False

        logger.info("RSS Feed Validation Passed!")
        return True

    except ET.ParseError as e:
        logger.error(f"XML Parse Error: {e}")
        return False
    except Exception as e:
        logger.error(f"Validation Error: {e}")
        return False


async def main():
    import argparse

    parser = argparse.ArgumentParser(description="Validate RSS Feed")
    parser.add_argument("file", nargs="?", help="Path to RSS XML file to validate")
    args = parser.parse_args()

    if args.file:
        logger.info(f"Validating file: {args.file}")
        try:
            with open(args.file, encoding="utf-8") as f:
                feed_xml = f.read()

            if validate_rss_xml(feed_xml):
                logger.info("Verification Successful")
                sys.exit(0)
            else:
                logger.error("Verification Failed")
                sys.exit(1)
        except Exception as e:
            logger.error(f"Failed to read file: {e}")
            sys.exit(1)

    logger.info("Starting RSS Feed Verification (Mock Generation)")

    # 1. Create Mock Data with DISTINCT DATES to test ordering
    # We want Newest First in the feed.
    now = datetime.now(timezone.utc)
    from datetime import timedelta

    article_new = Article(
        title="Newest Article",
        url="https://example.com/newest",
        pub_date=now,
        guid="newest",
        source=ArticleSource.create("lol", "en-us"),
        description="Newest",
        categories=["News"],
        locale="en-us",
        source_category="official",
    )

    article_old = Article(
        title="Oldest Article",
        url="https://example.com/oldest",
        pub_date=now - timedelta(days=1),
        guid="oldest",
        source=ArticleSource.create("lol", "en-us"),
        description="Oldest",
        categories=["News"],
        locale="en-us",
        source_category="official",
    )

    # Simulate DB returning DESC order (Newest first)
    articles = [article_new, article_old]

    # 2. Generate Feed
    generator = RSSFeedGenerator(
        feed_title="Test Feed",
        feed_link="https://example.com/feed",
        feed_description="Test Description",
        language="en",
    )

    feed_xml = generator.generate_feed(articles, "https://example.com/feed.xml")

    # 3. Validate
    # logger.info("Generated XML:")
    # print(feed_xml[:500] + "..." if len(feed_xml) > 500 else feed_xml)

    if validate_rss_xml(feed_xml):
        # Additional check for order
        try:
            root = ET.fromstring(feed_xml)
            items = root.find("channel").findall("item")
            first_title = items[0].find("title").text
            second_title = items[1].find("title").text

            logger.info(f"First item title: {first_title}")
            logger.info(f"Second item title: {second_title}")

            if first_title == "Newest Article":
                logger.info("✅ Order preserved: Newest First")
            else:
                logger.error("❌ Order Incorrect: Oldest First")
                sys.exit(1)

        except Exception as e:
            logger.error(f"Order check failed: {e}")
            sys.exit(1)

        logger.info("Verification Successful")
        sys.exit(0)
    else:
        logger.error("Verification Failed")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
