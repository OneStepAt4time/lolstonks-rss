# API Discovery Report - League of Legends News

**Date**: 2025-12-28
**Status**: ✅ Completed
**Investigator**: chrome-automation-expert (via general-purpose agent)

## Executive Summary

**Finding**: **Official API Found** for LoL Global/Regional news.

**Recommendation**: **API-first approach** - Use Next.js JSON API as primary data source. Web scraping NOT needed for main LoL news.

---

## API Details: LoL News (leagueoflegends.com)

### Endpoint Information

**API Type**: Next.js Static JSON Endpoint

**URL Pattern**:
```
https://www.leagueoflegends.com/_next/data/{BUILD_ID}/{locale}/news.json
```

**Example**:
```
https://www.leagueoflegends.com/_next/data/gmAJ02gzol_UNhWWKBLiL/en-us/news.json
```

**Supported Locales**:
- `en-us` - English (US)
- `it-it` - Italian
- (Same buildID works for all locales)

### Authentication & Access

- **Authentication**: None required
- **CORS**: Same-origin (accessible server-side)
- **Rate Limiting**: None observed (static CDN files)
- **Caching**: Recommended 1-6 hours

### Getting BuildID Dynamically

The `BUILD_ID` changes with each Next.js deployment. Fetch it from the HTML:

```python
import re
import requests

def get_build_id():
    response = requests.get('https://www.leagueoflegends.com/en-us/news/')
    html = response.text
    match = re.search(r'"buildId":"([^"]+)"', html)
    return match.group(1) if match else None

# Example: "gmAJ02gzol_UNhWWKBLiL"
```

**Caching Strategy**: Cache buildID for 24 hours, re-fetch on API 404

### Response Structure

```json
{
  "pageProps": {
    "page": {
      "blades": [
        {
          "type": "articleCardGrid",
          "items": [
            {
              "title": "Summoner's Snowdrift | Winter Map Music",
              "publishedAt": "2025-12-17T16:00:00.000Z",
              "description": {
                "type": "html",
                "body": "Spend the holidays on Summoner's Rift..."
              },
              "category": {
                "title": "Media",
                "machineName": "media"
              },
              "action": {
                "type": "youtube_video",
                "payload": {
                  "youtubeId": "ETbZsW21qaE",
                  "url": "https://www.youtube.com/watch?v=..."
                }
              },
              "media": {
                "url": "https://cmsassets.rgpub.io/sanity/images/..."
              },
              "analytics": {
                "contentId": "unique-content-id-123"
              }
            }
          ]
        }
      ]
    }
  }
}
```

### Article Data Available

| Field | Description | Type | RSS Mapping |
|-------|-------------|------|-------------|
| `title` | Article title | string | `<title>` |
| `publishedAt` | Publication date | ISO 8601 | `<pubDate>` |
| `description.body` | Article description | HTML string | `<description>` |
| `category.title` | Category name | string | `<category>` |
| `action.url` or `payload.url` | Article URL | string | `<link>` |
| `media.url` | Thumbnail image | string | `<enclosure>` |
| `analytics.contentId` | Unique ID | string | `<guid>` |

**Articles Per Request**: ~75 articles (initial load)

---

## Implementation Guide

### Python API Client

```python
import requests
import re
from datetime import datetime
from typing import List, Dict

class LoLNewsAPI:
    """Client for League of Legends News Next.js API"""

    BASE_URL = "https://www.leagueoflegends.com"

    def __init__(self, locale: str = 'en-us'):
        self.locale = locale
        self._build_id_cache = None

    def get_build_id(self) -> str:
        """Fetch current Next.js buildId from HTML"""
        if self._build_id_cache:
            return self._build_id_cache

        response = requests.get(f'{self.BASE_URL}/{self.locale}/news/')
        response.raise_for_status()

        match = re.search(r'"buildId":"([^"]+)"', response.text)
        if not match:
            raise Exception("BuildID not found in HTML")

        self._build_id_cache = match.group(1)
        return self._build_id_cache

    def fetch_news(self) -> List[Dict]:
        """Fetch latest news articles"""
        build_id = self.get_build_id()
        url = f'{self.BASE_URL}/_next/data/{build_id}/{self.locale}/news.json'

        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        # Extract articles from response
        blades = data['pageProps']['page']['blades']
        article_blade = next(
            (b for b in blades if b.get('type') == 'articleCardGrid'),
            None
        )

        if not article_blade:
            return []

        return article_blade.get('items', [])

    def transform_to_rss_item(self, article: Dict) -> Dict:
        """Transform API article to RSS-friendly format"""
        action = article.get('action', {})
        url = action.get('url') or action.get('payload', {}).get('url', '')

        return {
            'title': article.get('title', 'No Title'),
            'link': url,
            'description': article.get('description', {}).get('body', ''),
            'pub_date': datetime.fromisoformat(
                article['publishedAt'].replace('Z', '+00:00')
            ),
            'category': article.get('category', {}).get('title', 'News'),
            'thumbnail': article.get('media', {}).get('url'),
            'guid': article.get('analytics', {}).get('contentId', url),
            'source': f'lol-{self.locale}'
        }
```

### Usage Example

```python
# Fetch English news
api_en = LoLNewsAPI(locale='en-us')
articles_en = api_en.fetch_news()
print(f"Found {len(articles_en)} articles")

# Fetch Italian news
api_it = LoLNewsAPI(locale='it-it')
articles_it = api_it.fetch_news()

# Transform for RSS
rss_items = [api_en.transform_to_rss_item(a) for a in articles_en[:20]]
```

---

## Riot Games Blog Status

**Site**: https://www.riotgames.com/en/news

**Status**: ❌ No public API found

**Architecture**: Traditional server-rendered HTML (not SPA)

**Scraping Required**: Yes, if this source is needed

**Recommendation**: **Skip for MVP** - Focus on LoL news API first. Add Riot Blog later if required.

---

## Universe Status

**Site**: https://universe.leagueoflegends.com/

**Status**: ⚠️ Not a news source

**Content Type**: Champion lore and stories

**Recommendation**: **Exclude from RSS** - Not relevant for news feed

---

## Risks & Mitigation

### Risk 1: BuildID Changes
**Impact**: API 404 errors when buildID becomes stale
**Mitigation**:
- Cache buildID for 24 hours max
- Implement automatic re-fetch on 404
- Fallback to HTML parsing if API consistently fails

### Risk 2: API Structure Changes
**Impact**: Parsing breaks if JSON schema changes
**Mitigation**:
- Implement schema validation
- Version detection
- Comprehensive error handling
- Monitoring/alerting

### Risk 3: Rate Limiting
**Impact**: Service blocked from accessing API
**Likelihood**: Low (static CDN files)
**Mitigation**:
- Cache responses (6-hour TTL recommended)
- Implement exponential backoff
- Monitor response headers

---

## Alternative: Sanity CMS (Not Recommended)

The content backend uses Sanity CMS:
- Project: `dsfx7636`
- Dataset: `news_live`
- API: `https://dsfx7636.api.sanity.io/v1/data/query/news_live`

**Status**: CORS-blocked, not publicly accessible

**Recommendation**: Use Next.js JSON API instead

---

## Final Recommendations

### For Implementation (Phase 2+)

1. **Primary Source**: LoL News Next.js JSON API
   - Locales: EN-US, IT-IT
   - ~75 articles per locale
   - All metadata included

2. **Cache Strategy**:
   - BuildID: 24 hours
   - Articles: 1-6 hours
   - Use in-memory cache (cachetools)

3. **Error Handling**:
   - Retry on 404 (rebuild buildID)
   - Exponential backoff on errors
   - Fallback to previous cached data

4. **Testing**:
   - Mock API responses
   - Test buildID extraction
   - Validate article transformation
   - RSS compliance testing

5. **Monitoring**:
   - Track buildID changes
   - Monitor API availability
   - Alert on parsing failures

---

## Success Criteria Met

- ✅ All priority sites investigated
- ✅ Official API discovered and documented
- ✅ Sample data extracted (75 articles)
- ✅ Implementation guide provided
- ✅ Clear recommendations given

**Result**: **API-first approach validated**. Web scraping NOT needed for MVP.
