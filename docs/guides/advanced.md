---
title: Advanced Usage
description: Advanced configuration and usage patterns
---

# Advanced Usage

Advanced configuration options and usage patterns for power users.

## 🔧 Advanced Configuration

### Multiple Feed Sources

Configure multiple news sources (coming soon):

```bash
# .env
SOURCES=lol-en-us,lol-en-gb,lol-es-es
FEED_TITLE=Multi-Language LoL News
```

### Custom Update Schedule

Use cron expressions for complex schedules:

```bash
# Every 30 minutes during business hours (9 AM - 5 PM)
UPDATE_SCHEDULE="0,30 9-17 * * *"

# Every hour on weekdays
UPDATE_SCHEDULE="0 * * * 1-5"
```

### Database Tuning

Optimize database performance:

```bash
# Database settings
DATABASE_PATH=/fast-ssd/articles.db
DATABASE_TIMEOUT=30
DATABASE_MAX_CONNECTIONS=10
```

### Cache Configuration

Advanced cache settings:

```bash
# Cache settings
CACHE_TTL_SECONDS=1800        # 30 minutes
CACHE_MAX_SIZE=1000           # Max items
CACHE_EVICTION_POLICY=LRU     # Least recently used
```

## 🚀 Performance Optimization

### Enable Compression

Use gzip compression for responses:

```python
# In your reverse proxy (nginx)
gzip on;
gzip_types application/xml application/rss+xml application/json;
gzip_min_length 1000;
```

### Connection Pooling

Configure connection pooling:

```bash
# Connection pool settings
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_TIMEOUT=30
```

### Async Workers

Increase worker processes:

```bash
# docker-compose.yml
environment:
  - WORKERS=4
  - WORKER_CLASS=uvicorn.workers.UvicornWorker
```

## 🔒 Security Hardening

### API Key Authentication (Custom)

Add API key authentication:

```python
# Custom middleware
from fastapi import Security, HTTPException
from fastapi.security.api_key import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key")

async def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != os.getenv("API_KEY"):
        raise HTTPException(status_code=403, detail="Invalid API key")
    return api_key
```

### IP Whitelisting

Restrict access to specific IPs:

```nginx
# nginx configuration
location / {
    allow 192.168.1.0/24;
    allow 10.0.0.0/8;
    deny all;

    proxy_pass http://localhost:8000;
}
```

### Rate Limiting Per User

Custom rate limiting:

```python
# Per-IP rate limiting
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/feed")
@limiter.limit("10/minute")
async def get_feed():
    # ...
```

## 📊 Monitoring & Observability

### Structured Logging

Enable JSON logging:

```bash
LOG_FORMAT=json
LOG_LEVEL=INFO
```

```python
# logs/app.log
{
  "timestamp": "2024-01-15T10:00:00Z",
  "level": "INFO",
  "message": "Feed generated",
  "duration_ms": 45,
  "article_count": 50
}
```

### Metrics Collection

Export Prometheus metrics:

```python
from prometheus_client import Counter, Histogram

feed_requests = Counter('feed_requests_total', 'Total feed requests')
feed_duration = Histogram('feed_generation_seconds', 'Feed generation time')

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
```

### Health Check Customization

Advanced health checks:

```python
@app.get("/health")
async def health_check():
    checks = {
        "database": await check_database(),
        "cache": await check_cache(),
        "scheduler": check_scheduler_status(),
        "disk_space": check_disk_space()
    }

    all_healthy = all(checks.values())
    status_code = 200 if all_healthy else 503

    return JSONResponse(
        status_code=status_code,
        content={
            "status": "healthy" if all_healthy else "unhealthy",
            "checks": checks
        }
    )
```

## 🔄 Advanced Update Strategies

### Incremental Updates

Fetch only new articles:

```bash
INCREMENTAL_UPDATES=true
LOOKBACK_HOURS=24
```

### Parallel Fetching

Fetch from multiple sources in parallel:

```bash
PARALLEL_FETCHERS=5
FETCH_TIMEOUT=30
```

### Retry Logic

Configure retry behavior:

```bash
MAX_RETRIES=3
RETRY_DELAY=5
RETRY_BACKOFF=exponential
```

## 🐳 Advanced Docker Usage

### Multi-Container Setup

```yaml
version: '3.8'

services:
  lolstonks:
    image: lolstonksrss:latest
    depends_on:
      - redis
      - postgres
    environment:
      - CACHE_BACKEND=redis
      - CACHE_URL=redis://redis:6379
      - DATABASE_URL=postgresql://postgres/lolstonks

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=lolstonks
    volumes:
      - pg-data:/var/lib/postgresql/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl

volumes:
  redis-data:
  pg-data:
```

### Docker Secrets

Use Docker secrets for sensitive data:

```bash
# Create secret
echo "supersecret" | docker secret create api_key -

# Use in compose
services:
  lolstonks:
    secrets:
      - api_key
```

## 📡 Custom RSS Features

### Add Custom Feed Elements

Extend RSS with custom namespaces:

```python
from feedgen.feed import FeedGenerator

fg = FeedGenerator()
fg.register_namespace('custom', 'http://example.com/custom')

# Add custom element
fg.custom.custom_element('value')
```

### Multiple Feeds

Serve different feeds for different sources:

```python
@app.get("/feed/en-us")
async def feed_en_us():
    return generate_feed(source="lol-en-us")

@app.get("/feed/en-gb")
async def feed_en_gb():
    return generate_feed(source="lol-en-gb")
```

### Feed Filtering

Filter feed by categories:

```bash
# GET /feed?category=champions
curl "http://localhost:8000/feed?category=champions"
```

## 🔌 Integration Examples

### Webhook Notifications

Send webhooks on new articles:

```python
async def send_webhook(article: Article):
    webhook_url = os.getenv("WEBHOOK_URL")
    if webhook_url:
        async with httpx.AsyncClient() as client:
            await client.post(webhook_url, json=article.dict())
```

### Discord Integration

Send updates to Discord:

```python
async def send_to_discord(article: Article):
    webhook_url = os.getenv("DISCORD_WEBHOOK")
    embed = {
        "title": article.title,
        "url": article.url,
        "description": article.description
    }
    async with httpx.AsyncClient() as client:
        await client.post(webhook_url, json={"embeds": [embed]})
```

### Slack Integration

Post to Slack channel:

```python
async def send_to_slack(article: Article):
    webhook_url = os.getenv("SLACK_WEBHOOK")
    message = {
        "text": f"New Article: {article.title}",
        "attachments": [{
            "title": article.title,
            "title_link": article.url,
            "text": article.description
        }]
    }
    async with httpx.AsyncClient() as client:
        await client.post(webhook_url, json=message)
```

## 🧪 Advanced Testing

### Load Testing

Using Apache Bench:

```bash
ab -n 10000 -c 100 http://localhost:8000/feed
```

Using wrk:

```bash
wrk -t4 -c100 -d30s http://localhost:8000/feed
```

### Performance Profiling

Profile application:

```bash
# Using py-spy
py-spy record -o profile.svg -- python main.py

# Using cProfile
python -m cProfile -o profile.stats main.py
```

## 🔐 Advanced Security

### Content Security Policy

Add CSP headers:

```python
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response
```

### Request Signing

Verify request signatures:

```python
import hmac
import hashlib

def verify_signature(payload: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
```

## 📊 Analytics

### Track Feed Usage

Custom analytics:

```python
from datetime import datetime

async def track_feed_access(request: Request):
    await analytics_db.insert({
        "timestamp": datetime.utcnow(),
        "ip": request.client.host,
        "user_agent": request.headers.get("user-agent"),
        "endpoint": request.url.path
    })
```

## 🚀 Scaling Strategies

### Horizontal Scaling

Deploy multiple instances:

```yaml
services:
  lolstonks:
    image: lolstonksrss:latest
    deploy:
      replicas: 3
    environment:
      - INSTANCE_ID=${HOSTNAME}
```

### Read Replicas

Use database read replicas:

```bash
DATABASE_READ_URL=postgresql://replica/lolstonks
DATABASE_WRITE_URL=postgresql://primary/lolstonks
```

## 💡 Tips & Tricks

### Debugging Performance

Enable debug mode:

```bash
DEBUG=true
PROFILE=true
LOG_LEVEL=DEBUG
```

### Custom Data Retention

Automatic cleanup of old articles:

```bash
MAX_ARTICLE_AGE_DAYS=90
CLEANUP_SCHEDULE="0 3 * * *"  # Daily at 3 AM
```

### Backup Automation

Automated backups:

```bash
#!/bin/bash
# backup.sh
docker cp lolstonks:/app/data/articles.db \
  "/backups/articles_$(date +%Y%m%d_%H%M%S).db"
```

## 📚 Further Reading

- [Architecture Guide](../architecture/)
- [Performance Optimization](../architecture/performance.md)
- [Security Best Practices](../architecture/security.md)
- [API Reference](../api/)

## 🆘 Need Help?

For advanced support:
- [GitHub Discussions](https://github.com/yourusername/lolstonksrss/discussions)
- [Troubleshooting Guide](troubleshooting.md)
- [Developer Guide](../development/guide.md)
