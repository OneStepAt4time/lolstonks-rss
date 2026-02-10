---
title: RSS Feed Format
description: RSS 2.0 feed structure and format specification
---

# RSS Feed Format

Documentation of the RSS 2.0 feed structure used by LoL Stonks RSS.

## 📡 RSS 2.0 Structure

### Channel Element

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LoL Stonks RSS</title>
    <link>http://localhost:8000</link>
    <description>Latest League of Legends News</description>
    <language>en-US</language>
    <lastBuildDate>Mon, 15 Jan 2025 10:00:00 GMT</lastBuildDate>
    <atom:link href="http://localhost:8000/feed" rel="self" type="application/rss+xml"/>

    <!-- Items follow -->
  </channel>
</rss>
```

### Item Element

```xml
<item>
  <title>New Champion Released: Vex, the Gloomist</title>
  <link>https://www.leagueoflegends.com/news/champion/vex</link>
  <description>Meet Vex, League's newest mid-lane mage...</description>
  <guid isPermaLink="true">https://www.leagueoflegends.com/news/champion/vex</guid>
  <pubDate>Mon, 15 Jan 2025 09:00:00 GMT</pubDate>
  <category>Champions</category>
  <category>Game Updates</category>
</item>
```

## 🔧 Required Elements

### Channel Required Elements

| Element | Description | Example |
|---------|-------------|---------|
| `title` | Feed title | LoL Stonks RSS |
| `link` | Feed home page URL | http://localhost:8000 |
| `description` | Feed description | Latest LoL News |

### Item Required Elements

| Element | Description | Example |
|---------|-------------|---------|
| `title` | Article title | New Champion Released |
| `link` | Article URL | https://... |
| `description` | Article summary | Meet Vex... |

## ✨ Optional Elements

### Channel Optional Elements

| Element | Description | Example |
|---------|-------------|---------|
| `language` | Feed language | en-US |
| `copyright` | Copyright notice | © 2025 Riot Games |
| `lastBuildDate` | Last build date | Mon, 15 Jan 2025... |
| `category` | Feed category | Gaming |
| `ttl` | Cache TTL in minutes | 60 |

### Item Optional Elements

| Element | Description | Example |
|---------|-------------|---------|
| `guid` | Unique identifier | Article URL or GUID |
| `pubDate` | Publication date | Mon, 15 Jan 2025... |
| `category` | Article categories | Champions, Updates |
| `author` | Article author | author@example.com |
| `enclosure` | Media attachment | Image, audio, video |

## 🎯 LoL Stonks RSS Implementation

### Channel Configuration

Customizable via environment variables:

```bash
FEED_TITLE="My LoL News Feed"
FEED_DESCRIPTION="Latest League news"
FEED_LINK="https://example.com"
FEED_LANGUAGE="en-US"
```

### Item Structure

Each article includes:

- **Title**: Article headline
- **Link**: Full article URL
- **Description**: Article summary (first 200 chars)
- **GUID**: Article URL (permanent link)
- **PubDate**: Publication timestamp
- **Categories**: Article tags/categories

## 📋 Example Feed

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LoL Stonks RSS</title>
    <link>http://localhost:8000</link>
    <description>Latest League of Legends News</description>
    <language>en-US</language>
    <lastBuildDate>Mon, 15 Jan 2025 10:00:00 GMT</lastBuildDate>
    <atom:link href="http://localhost:8000/feed" rel="self" type="application/rss+xml"/>

    <item>
      <title>Patch 14.1 Notes</title>
      <link>https://www.leagueoflegends.com/news/patch-14-1</link>
      <description>Discover all the changes coming in Patch 14.1...</description>
      <guid isPermaLink="true">https://www.leagueoflegends.com/news/patch-14-1</guid>
      <pubDate>Mon, 15 Jan 2025 09:00:00 GMT</pubDate>
      <category>Patch Notes</category>
      <category>Game Updates</category>
    </item>

    <item>
      <title>New Skin Line: Cosmic Fury</title>
      <link>https://www.leagueoflegends.com/news/skins/cosmic-fury</link>
      <description>Explore the new Cosmic Fury skin line...</description>
      <guid isPermaLink="true">https://www.leagueoflegends.com/news/skins/cosmic-fury</guid>
      <pubDate>Sun, 14 Jan 2025 15:00:00 GMT</pubDate>
      <category>Skins</category>
      <category>Cosmetics</category>
    </item>
  </channel>
</rss>
```

## ✅ Validation

### W3C Validator

Validate your feed at:
```
https://validator.w3.org/feed/
```

### RSS 2.0 Specification

Full specification available at:
```
https://www.rssboard.org/rss-specification
```

## 🔍 Feed Testing

### Test with feedparser

```python
import feedparser

feed = feedparser.parse('http://localhost:8000/feed')

print(f"Title: {feed.feed.title}")
print(f"Items: {len(feed.entries)}")

for entry in feed.entries:
    print(f"- {entry.title}")
    print(f"  {entry.link}")
    print(f"  {entry.published}")
```

### Test with curl

```bash
# Get feed
curl http://localhost:8000/feed

# Validate structure
curl http://localhost:8000/feed | xmllint --format -
```

## 📊 Feed Metadata

### Supported Namespaces

- **RSS 2.0**: Default namespace
- **Atom**: For self-referential links
- **Dublin Core**: Extended metadata (optional)
- **Content**: Full content (optional)

### Date Format

RFC 822 format:
```
Mon, 15 Jan 2025 10:00:00 GMT
```

### Character Encoding

UTF-8 encoding for all content:
```xml
<?xml version="1.0" encoding="UTF-8"?>
```

## 🎨 Customization

### Add Custom Categories

Categories are automatically extracted from article metadata.

### Modify Description Length

```bash
RSS_DESCRIPTION_LENGTH=300
```

### Include Full Content

```bash
RSS_INCLUDE_FULL_CONTENT=true
```

## 📚 Related Documentation

- [API Reference](index.md)
- [Endpoints](endpoints.md)
- [Configuration](configuration.md)
- [RSS Feed Tester](../demo/tester.md)

## 💡 Best Practices

1. **Unique GUIDs**: Always use permanent, unique identifiers
2. **Valid Dates**: Use RFC 822 date format
3. **Escape HTML**: Properly escape HTML in descriptions
4. **Include Links**: Always provide working article links
5. **Add Categories**: Help readers filter content

## 🐛 Common Issues

### Invalid XML

Ensure proper XML escaping:
```python
import html
description = html.escape(raw_description)
```

### Wrong Date Format

Use correct RFC 822 format:
```python
from email.utils import formatdate
pub_date = formatdate(timeval=timestamp, localtime=False, usegmt=True)
```

### Missing GUIDs

Always include unique GUIDs:
```xml
<guid isPermaLink="true">https://example.com/article</guid>
```

For more help, see [Troubleshooting Guide](../guides/troubleshooting.md).
