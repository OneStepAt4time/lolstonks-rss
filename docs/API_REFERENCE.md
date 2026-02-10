# API Reference Documentation

## LoL Stonks RSS - HTTP API

Version: 1.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Base Configuration](#base-configuration)
3. [Public Endpoints](#public-endpoints)
4. [Admin Endpoints](#admin-endpoints)
5. [Response Formats](#response-formats)
6. [Error Handling](#error-handling)
7. [RSS Feed Structure](#rss-feed-structure)
8. [Code Examples](#code-examples)
9. [Rate Limits & Caching](#rate-limits--caching)

---

## Overview

The LoL Stonks RSS API provides HTTP endpoints for accessing League of Legends news as RSS 2.0 feeds. The API supports multiple languages, category filtering, and administrative operations.

### Key Features

- **RSS 2.0 compliant** XML feeds
- **Multi-language support** (20 locales: English, Spanish, French, German, Italian, Portuguese, Russian, Turkish, Polish, Japanese, Korean, Chinese, Arabic, Vietnamese, Thai, Indonesian, Filipino)
- **Category filtering** for topic-specific feeds
- **Source filtering** for language-specific feeds
- **Intelligent caching** for optimal performance
- **Health monitoring** endpoint
- **Administrative controls** for cache and scheduler management

### Base URL

**Default (Local Development):**
```
http://localhost:8000
```

**Production:**
```
http://your-server:8000
```

Configure via environment variable:
```bash
BASE_URL=http://your-domain.com
```

### Authentication

No authentication is required for public endpoints. Admin endpoints may be protected in production deployments (add authentication middleware as needed).

---

## Base Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:8000` | Public base URL for feed links |
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `8000` | Server port |
| `FEED_CACHE_TTL` | `300` | Feed cache TTL (seconds) |
| `UPDATE_INTERVAL_MINUTES` | `30` | News update interval |
| `RSS_MAX_ITEMS` | `50` | Default max items per feed |
| `LOG_LEVEL` | `INFO` | Logging level |

### Supported Sources

| Source ID | Language | Description |
|-----------|----------|-------------|
| `en-us` | English (US) | English League of Legends news |
| `en-gb` | English (GB) | English League of Legends news (UK) |
| `es-es` | Spanish (ES) | Spanish League of Legends news (Spain) |
| `es-mx` | Spanish (MX) | Spanish League of Legends news (Latin America) |
| `fr-fr` | French (FR) | French League of Legends news |
| `de-de` | German (DE) | German League of Legends news |
| `it-it` | Italian (IT) | Italian League of Legends news |
| `pt-br` | Portuguese (BR) | Portuguese League of Legends news (Brazil) |
| `ru-ru` | Russian (RU) | Russian League of Legends news |
| `tr-tr` | Turkish (TR) | Turkish League of Legends news |
| `pl-pl` | Polish (PL) | Polish League of Legends news |
| `ja-jp` | Japanese (JP) | Japanese League of Legends news |
| `ko-kr` | Korean (KR) | Korean League of Legends news |
| `zh-cn` | Chinese (CN) | Chinese League of Legends news (Simplified) |
| `zh-tw` | Chinese (TW) | Chinese League of Legends news (Traditional) |
| `ar-ae` | Arabic (AE) | Arabic League of Legends news |
| `vi-vn` | Vietnamese (VN) | Vietnamese League of Legends news |
| `th-th` | Thai (TH) | Thai League of Legends news |
| `id-id` | Indonesian (ID) | Indonesian League of Legends news |
| `ph-ph` | Filipino (PH) | Filipino League of Legends news |

---

## Public Endpoints

### GET /

Root endpoint with API documentation.

**Response Type:** `text/plain`

**Description:**
Returns plain text documentation with available endpoints and usage examples.

**Example Request:**
```bash
curl http://localhost:8000/
```

**Example Response:**
```text
LoL Stonks RSS Feed

Available endpoints:
- GET /feed.xml - Main RSS feed (all sources)
- GET /feed/{source}.xml - Source-specific feed (20 locales available)
- GET /feed/category/{category}.xml - Category-specific feed
- GET /health - Health check
- GET /docs - API documentation

Admin endpoints:
- POST /admin/refresh - Clear feed cache
- GET /admin/scheduler/status - Get scheduler status
- POST /admin/scheduler/trigger - Trigger manual update

Example:
- http://localhost:8000/feed.xml
- http://localhost:8000/feed/en-us.xml
- http://localhost:8000/feed/category/Champions.xml
```

---

### GET /feed.xml

Get main RSS feed with all articles from all sources.

**Response Type:** `application/rss+xml; charset=utf-8`

**Query Parameters:**

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `limit` | integer | 50 | 200 | Maximum number of articles |

**Response Headers:**

| Header | Value |
|--------|-------|
| `Content-Type` | `application/rss+xml; charset=utf-8` |
| `Cache-Control` | `public, max-age=300` |

**Example Request:**
```bash
curl http://localhost:8000/feed.xml
```

**Example Request with Limit:**
```bash
curl http://localhost:8000/feed.xml?limit=10
```

**PowerShell Request:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/feed.xml" -OutFile "feed.xml"
```

**Example Response:**
```xml
<?xml version='1.0' encoding='UTF-8'?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>League of Legends News</title>
    <link>https://www.leagueoflegends.com/news</link>
    <description>Latest League of Legends news and updates</description>
    <language>en</language>
    <lastBuildDate>Sun, 29 Jan 2025 10:30:00 +0000</lastBuildDate>
    <generator>LoL Stonks RSS Generator</generator>
    <item>
      <title>Patch 15.1 Notes</title>
      <link>https://www.leagueoflegends.com/en-us/news/game-updates/patch-15-1-notes</link>
      <guid isPermaLink="true">patch-15-1-notes</guid>
      <pubDate>Fri, 27 Jan 2025 16:00:00 +0000</pubDate>
      <description>The final patch of 2025 is here!</description>
      <category>Game Updates</category>
      <category>lol-en-us</category>
      <enclosure url="https://images.contentstack.io/..." type="image/jpeg" length="0"/>
    </item>
    <!-- More items... -->
  </channel>
</rss>
```

**Status Codes:**

| Code | Description |
|------|-------------|
| `200` | Success - RSS feed returned |
| `500` | Internal server error - feed generation failed |

---

### GET /feed/{source}.xml

Get RSS feed filtered by source (language-specific).

**Response Type:** `application/rss+xml; charset=utf-8`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source` | string | Yes | Source identifier: One of 20 supported locales (en-us, en-gb, es-es, es-mx, fr-fr, de-de, it-it, pt-br, ru-ru, tr-tr, pl-pl, ja-jp, ko-kr, zh-cn, zh-tw, ar-ae, vi-vn, th-th, id-id, ph-ph) |

**Query Parameters:**

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `limit` | integer | 50 | 200 | Maximum number of articles |

**Response Headers:**

| Header | Value |
|--------|-------|
| `Content-Type` | `application/rss+xml; charset=utf-8` |
| `Cache-Control` | `public, max-age=300` |

**Example Requests:**

English feed:
```bash
curl http://localhost:8000/feed/en-us.xml
```

Italian feed:
```bash
curl http://localhost:8000/feed/it-it.xml
```

With limit:
```bash
curl http://localhost:8000/feed/en-us.xml?limit=20
```

**PowerShell Example:**
```powershell
# Download English feed
Invoke-WebRequest -Uri "http://localhost:8000/feed/en-us.xml" -OutFile "feed-en.xml"

# Download Italian feed
Invoke-WebRequest -Uri "http://localhost:8000/feed/it-it.xml" -OutFile "feed-it.xml"
```

**Example Response (Italian):**
```xml
<?xml version='1.0' encoding='UTF-8'?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Notizie League of Legends - lol-it-it</title>
    <link>https://www.leagueoflegends.com/news</link>
    <description>Ultime notizie e aggiornamenti di League of Legends</description>
    <language>it</language>
    <lastBuildDate>Sun, 29 Jan 2025 10:30:00 +0000</lastBuildDate>
    <generator>LoL Stonks RSS Generator</generator>
    <item>
      <title>Note sulla patch 14.25</title>
      <link>https://www.leagueoflegends.com/it-it/news/game-updates/patch-15-1-notes</link>
      <guid isPermaLink="true">patch-15-1-notes-it</guid>
      <pubDate>Fri, 27 Jan 2025 16:00:00 +0000</pubDate>
      <description>L'ultima patch del 2025 è qui!</description>
      <category>Aggiornamenti di gioco</category>
      <category>lol-it-it</category>
    </item>
    <!-- More items... -->
  </channel>
</rss>
```

**Error Response (Invalid Source):**
```json
{
  "detail": "Source 'xx-xx' not found. Available: ['en-us', 'en-gb', 'es-es', 'es-mx', 'fr-fr', 'de-de', 'it-it', 'pt-br', 'ru-ru', 'tr-tr', 'pl-pl', 'ja-jp', 'ko-kr', 'zh-cn', 'zh-tw', 'ar-ae', 'vi-vn', 'th-th', 'id-id', 'ph-ph']"
}
```

**Status Codes:**

| Code | Description |
|------|-------------|
| `200` | Success - RSS feed returned |
| `404` | Source not found |
| `500` | Internal server error |

---

### GET /feed/category/{category}.xml

Get RSS feed filtered by category.

**Response Type:** `application/rss+xml; charset=utf-8`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | Yes | Category name (case-sensitive) |

**Query Parameters:**

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `limit` | integer | 50 | 200 | Maximum number of articles |

**Response Headers:**

| Header | Value |
|--------|-------|
| `Content-Type` | `application/rss+xml; charset=utf-8` |
| `Cache-Control` | `public, max-age=300` |

**Common Categories:**

Categories are extracted from League of Legends news articles. Common categories include:

- `Champions` - Champion releases and updates
- `Game Updates` - Patch notes and game changes
- `Esports` - Professional play news
- `Dev` - Developer insights
- `Lore` - Story and universe content
- `Media` - Videos, art, and multimedia
- `Community` - Community highlights
- `Announcements` - Official announcements
- `Merch` - Merchandise and products

**Example Requests:**

```bash
# Champions news only
curl http://localhost:8000/feed/category/Champions.xml

# Esports news
curl http://localhost:8000/feed/category/Esports.xml

# Game Updates with limit
curl http://localhost:8000/feed/category/Game%20Updates.xml?limit=15
```

**PowerShell Example:**
```powershell
# Get patch notes and game updates
Invoke-WebRequest -Uri "http://localhost:8000/feed/category/Game Updates.xml" `
  -OutFile "game-updates.xml"
```

**Python Example:**
```python
import requests

# Get Champions news
response = requests.get('http://localhost:8000/feed/category/Champions.xml')
with open('champions.xml', 'wb') as f:
    f.write(response.content)
```

**Example Response:**
```xml
<?xml version='1.0' encoding='UTF-8'?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>League of Legends News - Champions</title>
    <link>https://www.leagueoflegends.com/news</link>
    <description>Latest League of Legends news and updates</description>
    <language>en</language>
    <lastBuildDate>Sun, 29 Jan 2025 10:30:00 +0000</lastBuildDate>
    <generator>LoL Stonks RSS Generator</generator>
    <item>
      <title>Champion Roadmap: January 2025</title>
      <link>https://www.leagueoflegends.com/en-us/news/dev/champion-roadmap-jan-2025</link>
      <guid isPermaLink="true">champion-roadmap-jan-2025</guid>
      <pubDate>Wed, 25 Jan 2025 14:00:00 +0000</pubDate>
      <description>Sneak peek at upcoming champions</description>
      <category>Champions</category>
      <category>Dev</category>
      <category>lol-en-us</category>
    </item>
    <!-- More items... -->
  </channel>
</rss>
```

**Status Codes:**

| Code | Description |
|------|-------------|
| `200` | Success - RSS feed returned (may be empty if no articles match) |
| `500` | Internal server error |

---

### GET /health

Health check endpoint for monitoring service status.

**Response Type:** `application/json`

**Description:**
Returns the current health status of the service including database connectivity, cache status, and article availability.

**Example Request:**
```bash
curl http://localhost:8000/health
```

**PowerShell Request:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/health"
```

**Example Response (Healthy):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "service": "LoL Stonks RSS",
  "database": "connected",
  "cache": "active",
  "has_articles": true
}
```

**Example Response (Unhealthy):**
```json
{
  "status": "unhealthy",
  "message": "Services not initialized"
}
```

**Example Response (Error):**
```json
{
  "status": "unhealthy",
  "error": "Database connection failed"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Health status: `healthy` or `unhealthy` |
| `version` | string | Application version |
| `service` | string | Service name |
| `database` | string | Database connection status |
| `cache` | string | Cache system status |
| `has_articles` | boolean | Whether articles are available |
| `message` | string | Error message (if unhealthy) |
| `error` | string | Detailed error (if exception occurred) |

**Use Cases:**

- Docker health checks
- Load balancer health probes
- Monitoring systems (Prometheus, Datadog, etc.)
- Uptime monitoring services
- CI/CD deployment validation

**Status Codes:**

| Code | Description |
|------|-------------|
| `200` | Request successful (check `status` field for health) |

---

### GET /docs

FastAPI automatic interactive API documentation.

**Response Type:** `text/html`

**Description:**
Returns Swagger UI interface with interactive API documentation. Allows testing endpoints directly from the browser.

**Example Request:**
```
http://localhost:8000/docs
```

**Features:**
- Interactive endpoint testing
- Request/response schemas
- Parameter documentation
- Authentication testing (if enabled)

**Alternative Documentation:**
- ReDoc format: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

---

## Admin Endpoints

### POST /admin/refresh

Clear feed cache manually.

**Response Type:** `application/json`

**Description:**
Invalidates all cached RSS feeds. Useful after manually updating the database or when fresh data is needed immediately.

**Example Request:**
```bash
curl -X POST http://localhost:8000/admin/refresh
```

**PowerShell Request:**
```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:8000/admin/refresh"
```

**Example Response:**
```json
{
  "status": "success",
  "message": "Feed cache invalidated"
}
```

**Use Cases:**
- After manual database updates
- When stale data is detected
- During testing and development
- As part of deployment scripts

**Status Codes:**

| Code | Description |
|------|-------------|
| `200` | Success - cache cleared |
| `500` | Error clearing cache |

---

### GET /admin/scheduler/status

Get scheduler status and statistics.

**Response Type:** `application/json`

**Description:**
Returns detailed information about the news update scheduler including job status, next run time, and update statistics.

**Example Request:**
```bash
curl http://localhost:8000/admin/scheduler/status
```

**PowerShell Request:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/admin/scheduler/status"
```

**Example Response:**
```json
{
  "scheduler_running": true,
  "interval_minutes": 30,
  "next_run": "2025-01-15T11:00:00.000000",
  "jobs": [
    {
      "id": "news_update_job",
      "name": "news_update_job",
      "next_run_time": "2025-01-15T11:00:00.000000",
      "trigger": "interval[0:30:00]"
    }
  ],
  "update_service_stats": {
    "total_updates": 48,
    "last_update": "2025-01-15T10:30:15.123456",
    "last_update_duration": 12.5,
    "articles_fetched": 156,
    "articles_new": 8,
    "articles_updated": 2,
    "sources_updated": ["lol-en-us", "lol-it-it"]
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `scheduler_running` | boolean | Whether scheduler is active |
| `interval_minutes` | integer | Update interval in minutes |
| `next_run` | string | ISO timestamp of next scheduled update |
| `jobs` | array | List of scheduled jobs |
| `update_service_stats` | object | Statistics from update service |

**Update Service Stats Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `total_updates` | integer | Total updates performed since start |
| `last_update` | string | ISO timestamp of last update |
| `last_update_duration` | float | Duration of last update (seconds) |
| `articles_fetched` | integer | Articles fetched in last update |
| `articles_new` | integer | New articles added |
| `articles_updated` | integer | Existing articles updated |
| `sources_updated` | array | List of sources updated |

**Use Cases:**
- Monitoring scheduler health
- Debugging update issues
- Performance analysis
- Alerting on update failures

**Status Codes:**

| Code | Description |
|------|-------------|
| `200` | Success - status returned |
| `500` | Scheduler not initialized |

---

### POST /admin/scheduler/trigger

Manually trigger news update.

**Response Type:** `application/json`

**Description:**
Forces an immediate update of all news sources, bypassing the scheduled interval. Returns statistics about the update operation.

**Example Request:**
```bash
curl -X POST http://localhost:8000/admin/scheduler/trigger
```

**PowerShell Request:**
```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:8000/admin/scheduler/trigger"
```

**Example Response:**
```json
{
  "status": "success",
  "duration_seconds": 15.3,
  "articles_fetched": 178,
  "articles_new": 12,
  "articles_updated": 3,
  "sources_updated": ["lol-en-us", "lol-it-it"],
  "timestamp": "2025-01-15T10:45:30.123456"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Update status: `success` or `error` |
| `duration_seconds` | float | Update duration in seconds |
| `articles_fetched` | integer | Total articles fetched |
| `articles_new` | integer | New articles added to database |
| `articles_updated` | integer | Existing articles updated |
| `sources_updated` | array | List of sources successfully updated |
| `timestamp` | string | ISO timestamp of update completion |
| `error` | string | Error message (if status is error) |

**Use Cases:**
- Immediate content refresh after upstream updates
- Manual sync during deployment
- Testing update functionality
- Recovery from failed automatic updates

**Status Codes:**

| Code | Description |
|------|-------------|
| `200` | Success - update completed |
| `500` | Scheduler not initialized or update failed |

---

## Response Formats

### RSS 2.0 XML

All feed endpoints return RSS 2.0 compliant XML with the following structure:

**Channel Elements:**

| Element | Required | Description |
|---------|----------|-------------|
| `title` | Yes | Feed title |
| `link` | Yes | Website URL |
| `description` | Yes | Feed description |
| `language` | Yes | Language code (en, it) |
| `lastBuildDate` | No | Last feed generation time (RFC 822) |
| `generator` | No | Generator software name |

**Item Elements:**

| Element | Required | Description |
|---------|----------|-------------|
| `title` | Yes | Article title |
| `link` | Yes | Article URL |
| `guid` | Yes | Unique identifier (permalink) |
| `pubDate` | Yes | Publication date (RFC 822) |
| `description` | No | Article summary |
| `content:encoded` | No | Full HTML content |
| `author` | No | Author in format: email (name) |
| `category` | No | Multiple categories allowed |
| `enclosure` | No | Featured image (image/jpeg) |

**Example Complete Item:**
```xml
<item>
  <title>Patch 15.1 Notes</title>
  <link>https://www.leagueoflegends.com/en-us/news/game-updates/patch-15-1-notes</link>
  <guid isPermaLink="true">patch-15-1-notes</guid>
  <pubDate>Fri, 27 Jan 2025 16:00:00 +0000</pubDate>
  <description>The final patch of 2025 brings balance changes...</description>
  <content:encoded><![CDATA[
    <p>The final patch of 2025 brings balance changes...</p>
    <h2>Champion Updates</h2>
    <ul><li>Ahri: Base stats adjusted</li></ul>
  ]]></content:encoded>
  <author>noreply@riotgames.com (Riot Games)</author>
  <category>Game Updates</category>
  <category>Patches</category>
  <category>lol-en-us</category>
  <enclosure
    url="https://images.contentstack.io/v3/assets/patch-15-1.jpg"
    type="image/jpeg"
    length="0"/>
</item>
```

### JSON Responses

All admin endpoints and the health check return JSON:

**Success Response:**
```json
{
  "status": "success",
  "message": "Operation completed",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "detail": "Error description"
}
```

---

## Error Handling

### Error Response Format

FastAPI returns errors in the following JSON format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

| Code | Name | When It Occurs |
|------|------|----------------|
| `200` | OK | Successful request |
| `404` | Not Found | Invalid source or endpoint |
| `500` | Internal Server Error | Server-side error (generation, database, etc.) |

### Error Examples

**404 - Invalid Source:**
```bash
curl http://localhost:8000/feed/xx-xx.xml
```
```json
{
  "detail": "Source 'xx-xx' not found. Available: ['en-us', 'en-gb', 'es-es', 'es-mx', 'fr-fr', 'de-de', 'it-it', 'pt-br', 'ru-ru', 'tr-tr', 'pl-pl', 'ja-jp', 'ko-kr', 'zh-cn', 'zh-tw', 'ar-ae', 'vi-vn', 'th-th', 'id-id', 'ph-ph']"
}
```

**500 - Feed Generation Error:**
```json
{
  "detail": "Error generating feed"
}
```

**500 - Service Not Initialized:**
```json
{
  "detail": "Service not initialized"
}
```

### Error Logging

All errors are logged server-side with full stack traces. Check application logs for detailed error information:

```bash
# View logs in Docker
docker logs lolstonksrss

# View logs with follow
docker logs -f lolstonksrss
```

---

## RSS Feed Structure

### Complete Feed Example

```xml
<?xml version='1.0' encoding='UTF-8'?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <!-- Channel Metadata -->
    <title>League of Legends News</title>
    <link>https://www.leagueoflegends.com/news</link>
    <atom:link href="http://localhost:8000/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Latest League of Legends news and updates</description>
    <language>en</language>
    <lastBuildDate>Sun, 29 Jan 2025 10:30:00 +0000</lastBuildDate>
    <generator>LoL Stonks RSS Generator</generator>

    <!-- Article Items -->
    <item>
      <title>Patch 15.1 Notes</title>
      <link>https://www.leagueoflegends.com/en-us/news/game-updates/patch-15-1-notes</link>
      <guid isPermaLink="true">patch-15-1-notes</guid>
      <pubDate>Fri, 27 Jan 2025 16:00:00 +0000</pubDate>
      <description>The final patch of 2025 is here with balance changes and bug fixes!</description>

      <content:encoded><![CDATA[
        <h1>Patch 15.1 Notes</h1>
        <p>Welcome to the final patch of 2025!</p>
        <h2>Champion Updates</h2>
        <ul>
          <li><strong>Ahri:</strong> Base armor increased</li>
          <li><strong>Zed:</strong> Ultimate cooldown adjusted</li>
        </ul>
      ]]></content:encoded>

      <author>noreply@riotgames.com (Riot Games)</author>

      <category>Game Updates</category>
      <category>Patches</category>
      <category>lol-en-us</category>

      <enclosure
        url="https://images.contentstack.io/v3/assets/blt731...../patch-15-1-banner.jpg"
        type="image/jpeg"
        length="0"/>
    </item>

    <item>
      <!-- More items... -->
    </item>
  </channel>
</rss>
```

### RSS 2.0 Specification Compliance

The feed adheres to [RSS 2.0 specification](https://www.rssboard.org/rss-specification):

- **XML Declaration:** UTF-8 encoding
- **RSS Version:** 2.0
- **Namespaces:**
  - `content` for content:encoded
  - `atom` for self-referencing links
- **Required Elements:** All required channel and item elements present
- **Date Format:** RFC 822 format (e.g., "Fri, 27 Jan 2025 16:00:00 +0000")
- **GUID:** Permanent link with `isPermaLink="true"`
- **Categories:** Multiple categories supported per item
- **Enclosures:** Media files (images) as enclosures

### Content Encoding

**Description vs Content:**

- **description:** Plain text or simple HTML summary (shown in previews)
- **content:encoded:** Full HTML content with formatting (shown in full view)

Both elements may be present. RSS readers typically show `description` in the list view and `content:encoded` in the detail view.

### Category System

Each article has multiple categories:

1. **Content Categories:** Extracted from article metadata
   - Examples: "Champions", "Patches", "Esports", "Dev"
2. **Source Category:** Automatically added
   - Examples: "lol-en-us", "lol-it-it"

Categories are searchable via the category filter endpoint.

### Image Handling

Images are included as **enclosures**:

```xml
<enclosure
  url="https://images.contentstack.io/v3/assets/blt.../image.jpg"
  type="image/jpeg"
  length="0"/>
```

**Notes:**
- Type is assumed as `image/jpeg` (enhancement opportunity)
- Length is set to `0` (valid per RSS spec, actual size not determined)
- RSS readers display enclosure images prominently

---

## Code Examples

### curl Examples

**Get main feed:**
```bash
curl http://localhost:8000/feed.xml
```

**Get feed with limit:**
```bash
curl "http://localhost:8000/feed.xml?limit=10"
```

**Get English feed:**
```bash
curl http://localhost:8000/feed/en-us.xml
```

**Get category feed:**
```bash
curl http://localhost:8000/feed/category/Champions.xml
```

**Health check:**
```bash
curl http://localhost:8000/health
```

**Refresh cache:**
```bash
curl -X POST http://localhost:8000/admin/refresh
```

**Trigger update:**
```bash
curl -X POST http://localhost:8000/admin/scheduler/trigger
```

**Save to file:**
```bash
curl http://localhost:8000/feed.xml -o feed.xml
```

---

### PowerShell Examples

**Download feed:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/feed.xml" -OutFile "feed.xml"
```

**Get feed as object:**
```powershell
[xml]$feed = (Invoke-WebRequest -Uri "http://localhost:8000/feed.xml").Content
$feed.rss.channel.item | Select-Object title, link, pubDate
```

**Health check:**
```powershell
$health = Invoke-RestMethod -Uri "http://localhost:8000/health"
Write-Host "Status: $($health.status)"
```

**Trigger update and display stats:**
```powershell
$result = Invoke-RestMethod -Method Post -Uri "http://localhost:8000/admin/scheduler/trigger"
Write-Host "Fetched: $($result.articles_fetched)"
Write-Host "New: $($result.articles_new)"
Write-Host "Duration: $($result.duration_seconds)s"
```

**Monitor health with loop:**
```powershell
while ($true) {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/health"
    Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] Status: $($health.status)"
    Start-Sleep -Seconds 60
}
```

**Download all source feeds:**
```powershell
$sources = @('en-us', 'en-gb', 'es-es', 'es-mx', 'fr-fr', 'de-de', 'it-it', 'pt-br', 'ru-ru', 'tr-tr', 'pl-pl', 'ja-jp', 'ko-kr', 'zh-cn', 'zh-tw', 'ar-ae', 'vi-vn', 'th-th', 'id-id', 'ph-ph')
$sources | ForEach-Object {
    $url = "http://localhost:8000/feed/$_.xml"
    $file = "feed-$_.xml"
    Invoke-WebRequest -Uri $url -OutFile $file
    Write-Host "Downloaded $file"
}
```

---

### Python Examples

**Basic request:**
```python
import requests

response = requests.get('http://localhost:8000/feed.xml')
with open('feed.xml', 'wb') as f:
    f.write(response.content)
```

**Parse RSS feed:**
```python
import requests
import xml.etree.ElementTree as ET

response = requests.get('http://localhost:8000/feed.xml')
root = ET.fromstring(response.content)

for item in root.findall('.//item'):
    title = item.find('title').text
    link = item.find('link').text
    pub_date = item.find('pubDate').text
    print(f"{title} - {pub_date}")
    print(f"  {link}\n")
```

**Using feedparser library:**
```python
import feedparser

feed = feedparser.parse('http://localhost:8000/feed.xml')

print(f"Feed: {feed.feed.title}")
print(f"Articles: {len(feed.entries)}\n")

for entry in feed.entries:
    print(f"Title: {entry.title}")
    print(f"Published: {entry.published}")
    print(f"Link: {entry.link}")
    print(f"Categories: {[cat.term for cat in entry.tags]}")
    print()
```

**Health check monitoring:**
```python
import requests
import time

def check_health():
    try:
        response = requests.get('http://localhost:8000/health')
        health = response.json()

        if health['status'] == 'healthy':
            print(f"✓ Service healthy - Articles: {health['has_articles']}")
        else:
            print(f"✗ Service unhealthy: {health.get('message', 'Unknown error')}")
    except Exception as e:
        print(f"✗ Health check failed: {e}")

while True:
    check_health()
    time.sleep(60)
```

**Trigger update:**
```python
import requests

response = requests.post('http://localhost:8000/admin/scheduler/trigger')
stats = response.json()

print(f"Update completed in {stats['duration_seconds']}s")
print(f"Fetched: {stats['articles_fetched']}")
print(f"New: {stats['articles_new']}")
print(f"Updated: {stats['articles_updated']}")
```

**Get category-specific articles:**
```python
import feedparser

feed = feedparser.parse('http://localhost:8000/feed/category/Champions.xml')

print(f"Champions News ({len(feed.entries)} articles):\n")

for entry in feed.entries:
    print(f"• {entry.title}")
    print(f"  {entry.published}")

    # Get image if available
    if hasattr(entry, 'enclosures') and entry.enclosures:
        print(f"  Image: {entry.enclosures[0]['href']}")
    print()
```

---

### RSS Reader Integration

**Feedly:**
```
http://localhost:8000/feed.xml
```

**Inoreader:**
```
http://localhost:8000/feed.xml
```

**Apple Podcasts (for production URL):**
```
http://your-server:8000/feed.xml
```

**Outlook RSS Reader:**
1. File → Account Settings → RSS Feeds
2. Click "New"
3. Enter: `http://localhost:8000/feed.xml`

**Windows RSS Platform:**
```powershell
# Add feed to Windows Common Feed List
$url = "http://localhost:8000/feed.xml"
$feed = New-Object -ComObject Microsoft.FeedsManager
$feed.RootFolder.CreateFeed("LoL Stonks", $url)
```

---

### JavaScript/Node.js Examples

**Fetch feed with axios:**
```javascript
const axios = require('axios');

async function getFeed() {
  const response = await axios.get('http://localhost:8000/feed.xml');
  console.log(response.data);
}

getFeed();
```

**Parse with rss-parser:**
```javascript
const Parser = require('rss-parser');
const parser = new Parser();

async function parseFeed() {
  const feed = await parser.parseURL('http://localhost:8000/feed.xml');

  console.log(`Feed: ${feed.title}`);

  feed.items.forEach(item => {
    console.log(`\n${item.title}`);
    console.log(`Published: ${item.pubDate}`);
    console.log(`Link: ${item.link}`);
    console.log(`Categories: ${item.categories.join(', ')}`);
  });
}

parseFeed();
```

**Health check endpoint:**
```javascript
const axios = require('axios');

async function checkHealth() {
  try {
    const response = await axios.get('http://localhost:8000/health');
    const health = response.data;

    console.log(`Status: ${health.status}`);
    console.log(`Database: ${health.database}`);
    console.log(`Has articles: ${health.has_articles}`);
  } catch (error) {
    console.error('Health check failed:', error.message);
  }
}

checkHealth();
```

---

## Rate Limits & Caching

### Client-Side Caching

**Cache-Control Headers:**

All feed endpoints return caching headers:
```
Cache-Control: public, max-age=300
```

This means:
- Responses are cacheable by browsers and CDNs
- Cache valid for 300 seconds (5 minutes)
- Clients should not request more frequently than every 5 minutes

**Respecting Cache Headers:**

Most HTTP clients respect these headers automatically:

```python
import requests
from requests_cache import CachedSession

# Enable automatic caching
session = CachedSession('rss_cache', expire_after=300)
response = session.get('http://localhost:8000/feed.xml')
```

### Server-Side Caching

**Feed Cache TTL:**

Configure via environment variable:
```bash
FEED_CACHE_TTL=300  # 5 minutes (default)
```

**Cache Behavior:**

1. First request generates feed from database
2. Subsequent requests (within TTL) return cached feed
3. Cache expires after TTL seconds
4. Next request regenerates feed

**Cache Keys:**

Different endpoints have different cache keys:
- Main feed: `feed_main_{limit}`
- Source feed: `feed_source_{source}_{limit}`
- Category feed: `feed_category_{category}_{limit}`

**Manual Cache Invalidation:**

```bash
curl -X POST http://localhost:8000/admin/refresh
```

### Rate Limiting

**Current Implementation:**

No rate limiting is implemented by default.

**Production Recommendations:**

Add rate limiting middleware for production:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# Apply to endpoints
@app.get("/feed.xml")
@limiter.limit("30/minute")
async def get_main_feed():
    ...
```

**Recommended Limits:**

| Endpoint | Limit | Rationale |
|----------|-------|-----------|
| `/feed.*` | 30/minute | RSS readers poll infrequently |
| `/health` | 100/minute | Monitoring systems need frequent checks |
| `/admin/*` | 10/minute | Admin operations are infrequent |

### Performance Characteristics

**Response Times (typical):**

| Scenario | Response Time |
|----------|---------------|
| Cached feed | < 10ms |
| Fresh feed generation | 50-200ms |
| First request (cold start) | 500-1000ms |

**Database Query Optimization:**

- Indexes on `pub_date` for sorting
- Indexes on `source` for filtering
- Indexes on `categories` for category filtering
- Limit queries to prevent full table scans

---

## Deployment Considerations

### Production URL Configuration

**Set base URL:**
```bash
export BASE_URL=https://your-domain.com
```

This ensures feed links are absolute and point to your production domain.

### CORS Configuration

Current CORS settings allow all origins:
```python
allow_origins=["*"]
```

**For production**, restrict to specific domains:
```python
allow_origins=[
    "https://your-domain.com",
    "https://feedly.com",
    "https://www.inoreader.com"
]
```

### HTTPS Enforcement

For production deployments:

1. Use reverse proxy (nginx, Caddy) for HTTPS
2. Update `BASE_URL` to use `https://`
3. Enforce HTTPS redirects

**Nginx example:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Monitoring Integration

**Prometheus metrics:**

Add prometheus_client to expose metrics:

```python
from prometheus_client import Counter, Histogram

feed_requests = Counter('feed_requests_total', 'Total feed requests', ['endpoint'])
feed_duration = Histogram('feed_generation_seconds', 'Feed generation duration')
```

**Health check integration:**

Configure monitoring tools to poll `/health`:

```yaml
# Prometheus config
scrape_configs:
  - job_name: 'lolstonksrss'
    metrics_path: '/health'
    static_configs:
      - targets: ['localhost:8000']
```

---

## Troubleshooting

### Empty Feed

**Symptoms:** Feed returns but has no items

**Causes:**
- No articles in database yet
- Update scheduler hasn't run
- Scraping failed

**Solutions:**
```bash
# Check health
curl http://localhost:8000/health

# Trigger manual update
curl -X POST http://localhost:8000/admin/scheduler/trigger

# Check scheduler status
curl http://localhost:8000/admin/scheduler/status
```

### Stale Content

**Symptoms:** Feed doesn't show recent articles

**Causes:**
- Cache not invalidated
- Update scheduler not running
- Source website changes

**Solutions:**
```bash
# Clear cache
curl -X POST http://localhost:8000/admin/refresh

# Trigger update
curl -X POST http://localhost:8000/admin/scheduler/trigger
```

### 500 Internal Server Error

**Symptoms:** HTTP 500 on feed endpoints

**Causes:**
- Database connection issues
- Feed generation exception
- Service not initialized

**Solutions:**
```bash
# Check logs
docker logs lolstonksrss

# Check health
curl http://localhost:8000/health

# Restart service
docker restart lolstonksrss
```

### Slow Response Times

**Symptoms:** Feed takes > 1 second to load

**Causes:**
- Cache expired, regenerating
- Large number of articles
- Database query slow

**Solutions:**
- Reduce `limit` parameter
- Increase `FEED_CACHE_TTL`
- Check database indexes
- Monitor with `/admin/scheduler/status`

---

## API Changelog

### Version 1.0.0 (2025-01-15)

**Initial Release:**

- RSS 2.0 feed generation
- Multi-language support (20 locales: en-us, en-gb, es-es, es-mx, fr-fr, de-de, it-it, pt-br, ru-ru, tr-tr, pl-pl, ja-jp, ko-kr, zh-cn, zh-tw, ar-ae, vi-vn, th-th, id-id, ph-ph)
- Category filtering
- Source filtering
- Health check endpoint
- Admin cache control
- Scheduler management
- Automatic feed caching

---

## Support & Contact

**Project Repository:**
- GitHub: (Configure your repository URL)

**Documentation:**
- API Reference: `/docs/API_REFERENCE.md` (this file)
- Testing Guide: `/docs/TESTING_GUIDE.md`
- Deployment Guide: `/docs/WINDOWS_DEPLOYMENT.md`

**Issues & Bugs:**
- Report via GitHub Issues

**Feature Requests:**
- Submit via GitHub Discussions

---

## License

(Add your license information here)

---

## Appendix: Complete API Summary

### Public Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/` | API documentation | text/plain |
| GET | `/feed.xml` | Main RSS feed | RSS XML |
| GET | `/feed/{source}.xml` | Source-specific feed | RSS XML |
| GET | `/feed/category/{category}.xml` | Category-specific feed | RSS XML |
| GET | `/health` | Health check | JSON |
| GET | `/docs` | Swagger UI | HTML |

### Admin Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| POST | `/admin/refresh` | Clear cache | JSON |
| GET | `/admin/scheduler/status` | Get scheduler status | JSON |
| POST | `/admin/scheduler/trigger` | Trigger update | JSON |

### Query Parameters

| Parameter | Endpoints | Type | Default | Max | Description |
|-----------|-----------|------|---------|-----|-------------|
| `limit` | All feed endpoints | integer | 50 | 200 | Max articles |

### Response Content Types

| Content Type | Endpoints |
|--------------|-----------|
| `application/rss+xml; charset=utf-8` | All feed endpoints |
| `application/json` | Admin endpoints, `/health` |
| `text/plain` | `/` |
| `text/html` | `/docs` |

---

**End of API Reference Documentation**

*Generated for LoL Stonks RSS v1.0.0*
