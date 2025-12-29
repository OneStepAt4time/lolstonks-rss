---
title: API Reference
description: Complete API documentation for LoL Stonks RSS
---

# API Reference

Complete REST API documentation for LoL Stonks RSS.

## 📡 Base URL

```
http://localhost:8000
```

Replace `localhost` with your server address.

## 🔗 Quick Links

<div class="feature-grid">
  <div class="feature-card">
    <h3>📋 Endpoints</h3>
    <p>All available API endpoints</p>
    <a href="endpoints/">View Endpoints →</a>
  </div>

  <div class="feature-card">
    <h3>📡 RSS Format</h3>
    <p>RSS feed structure and format</p>
    <a href="rss-format/">RSS Format →</a>
  </div>

  <div class="feature-card">
    <h3>⚙️ Configuration</h3>
    <p>API configuration options</p>
    <a href="configuration/">Configuration →</a>
  </div>

  <div class="feature-card">
    <h3>❌ Error Codes</h3>
    <p>Error handling and codes</p>
    <a href="errors/">Error Codes →</a>
  </div>
</div>

## 🚀 Quick Start

### RSS Feed

Get the RSS feed:
```bash
curl http://localhost:8000/feed
```

### JSON API

Get articles as JSON:
```bash
curl http://localhost:8000/api/v1/articles
```

### Health Check

Check system health:
```bash
curl http://localhost:8000/health
```

## 📚 Core Endpoints

### RSS Feed

```http
GET /feed
```

Returns RSS 2.0 XML feed with latest articles.

**Response**: `application/xml`

### Get Articles (JSON)

```http
GET /api/v1/articles
```

Returns articles in JSON format.

**Query Parameters**:
- `limit` (optional): Max items to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response**: `application/json`

```json
{
  "articles": [
    {
      "guid": "abc123",
      "title": "New Champion Released",
      "url": "https://...",
      "pub_date": "2024-01-15T10:00:00Z",
      "description": "...",
      "categories": ["Champions"]
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

### Get Single Article

```http
GET /api/v1/articles/{guid}
```

Get specific article by GUID.

**Response**: `application/json`

### Health Check

```http
GET /health
```

System health status.

**Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600
}
```

### Statistics

```http
GET /api/v1/stats
```

Feed statistics and metrics.

**Response**:
```json
{
  "total_articles": 150,
  "sources": ["lol-en-us"],
  "last_update": "2024-01-15T10:00:00Z",
  "cache_hit_rate": 0.85
}
```

### Manual Update

```http
POST /api/v1/update
```

Trigger manual feed update.

**Response**:
```json
{
  "status": "success",
  "articles_fetched": 5,
  "articles_new": 2
}
```

## 🔧 Interactive API Docs

### Swagger UI

Access interactive API documentation:
```
http://localhost:8000/docs
```

### ReDoc

Alternative API documentation:
```
http://localhost:8000/redoc
```

### OpenAPI Spec

Get OpenAPI specification:
```
http://localhost:8000/openapi.json
```

## 📖 Detailed Documentation

For detailed information about each endpoint:

- **[All Endpoints](endpoints.md)** - Complete endpoint reference
- **[RSS Format](rss-format.md)** - RSS feed structure
- **[Configuration](configuration.md)** - API configuration
- **[Error Codes](errors.md)** - Error handling

## 🔒 Authentication

Currently, the API is public and doesn't require authentication.

!!! warning "Production Deployment"
    For production, consider implementing:
    - API key authentication
    - Rate limiting (enabled by default)
    - IP whitelisting
    - Reverse proxy authentication

## ⚡ Rate Limiting

Default rate limits:
- **RSS Feed**: 60 requests/minute
- **API Endpoints**: 100 requests/minute

Headers returned:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

## 📊 Response Formats

### Success Response

```json
{
  "status": "success",
  "data": { ... }
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## 🌐 CORS

CORS is enabled for all origins by default.

To restrict origins, set environment variable:
```bash
CORS_ORIGINS=https://example.com,https://app.example.com
```

## 📝 Content Types

Supported content types:

- **RSS Feed**: `application/xml`, `application/rss+xml`
- **JSON API**: `application/json`
- **HTML Docs**: `text/html`

## 🔍 Filtering & Pagination

### Pagination

```bash
# Get first 10 articles
curl 'http://localhost:8000/api/v1/articles?limit=10&offset=0'

# Get next 10
curl 'http://localhost:8000/api/v1/articles?limit=10&offset=10'
```

### Sorting

Articles are sorted by publication date (newest first).

## 🧪 Testing the API

### cURL Examples

```bash
# Get RSS feed
curl http://localhost:8000/feed

# Get JSON articles
curl http://localhost:8000/api/v1/articles | jq

# Get specific article
curl http://localhost:8000/api/v1/articles/{guid} | jq

# Trigger update
curl -X POST http://localhost:8000/api/v1/update

# Health check
curl http://localhost:8000/health | jq
```

### Python Examples

```python
import requests

# Get articles
response = requests.get('http://localhost:8000/api/v1/articles')
articles = response.json()

# Get specific article
article = requests.get(f'http://localhost:8000/api/v1/articles/{guid}')

# Trigger update
update = requests.post('http://localhost:8000/api/v1/update')
```

### JavaScript Examples

```javascript
// Fetch articles
const response = await fetch('http://localhost:8000/api/v1/articles');
const data = await response.json();

// Trigger update
await fetch('http://localhost:8000/api/v1/update', {
  method: 'POST'
});
```

## 🚀 Client Libraries

Currently, no official client libraries are available. The API follows REST conventions and can be used with any HTTP client.

## 📚 Additional Resources

- [Getting Started](../getting-started/)
- [Configuration Guide](../getting-started/configuration.md)
- [Troubleshooting](../guides/troubleshooting.md)
- [FAQ](../faq.md)

## 💡 Tips

!!! tip "Best Practices"
    - Respect rate limits
    - Cache responses when possible
    - Handle errors gracefully
    - Use appropriate timeout values
    - Monitor API performance

!!! info "Need Help?"
    Check the [FAQ](../faq.md) or [Troubleshooting Guide](../guides/troubleshooting.md).
