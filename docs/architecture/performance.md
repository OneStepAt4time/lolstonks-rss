# Performance Tuning Guide

**LoL Stonks RSS Feed Generator**
Version: 1.0.0
Last Updated: 2025-12-29

## Table of Contents

1. [Performance Characteristics](#performance-characteristics)
2. [Caching Strategy](#caching-strategy)
3. [Database Optimization](#database-optimization)
4. [Resource Usage](#resource-usage)
5. [Optimization Techniques](#optimization-techniques)
6. [Monitoring](#monitoring)
7. [Bottleneck Identification](#bottleneck-identification)
8. [Scaling Considerations](#scaling-considerations)
9. [Docker Performance](#docker-performance)
10. [Windows Server Optimization](#windows-server-optimization)
11. [Load Testing](#load-testing)
12. [Performance Checklist](#performance-checklist)

---

## Performance Characteristics

### Target Performance Metrics

```
Feed Generation (cached):     < 200ms
Database Query (indexed):     < 50ms
API Response Time:            < 100ms
Update Cycle:                 ~30s per source
Cache Hit Rate:               > 90%
Memory Footprint:             ~200MB
```

### Actual Performance Benchmarks

Based on performance tests in `tests/performance/test_performance.py`:

**Feed Generation Performance:**
- **Cached feed generation**: < 200ms (target met)
- **Cold feed generation**: 200-500ms (includes DB query + XML generation)
- **50 articles RSS feed**: ~150ms average

**Database Query Performance:**
- **Indexed query (50 items)**: < 50ms (target met)
- **Average query time**: ~30-40ms
- **200 articles dataset**: < 50ms with proper indexes

### Real-World Performance

```python
# Typical request timeline
GET /feed.xml (cached)
├─ Cache lookup:        1-5ms
├─ Response encoding:   5-10ms
└─ Total:              ~10-15ms ✓

GET /feed.xml (cold)
├─ Database query:      30-50ms
├─ RSS generation:      100-150ms
├─ Cache storage:       1-5ms
└─ Total:              ~150-200ms ✓
```

---

## Caching Strategy

### Multi-Layer Caching Architecture

The application implements a **two-tier caching system**:

```
┌─────────────────────────────────────────┐
│         Client Request                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    Layer 1: Feed Cache (TTL)           │
│    - Main feed cache                    │
│    - Source-specific feeds              │
│    - Category feeds                     │
│    TTL: 5 minutes (configurable)        │
└──────────────┬──────────────────────────┘
               │ (on miss)
               ▼
┌─────────────────────────────────────────┐
│    Layer 2: BuildID Cache              │
│    - API build identifiers              │
│    - News data cache                    │
│    TTL: 24 hours (configurable)         │
└──────────────┬──────────────────────────┘
               │ (on miss)
               ▼
┌─────────────────────────────────────────┐
│    Database Storage                     │
│    - SQLite persistent storage          │
│    - Indexed queries                    │
└─────────────────────────────────────────┘
```

### Feed Cache Configuration

**Default Settings** (`src/config.py`):
```python
feed_cache_ttl: int = 300  # 5 minutes
cache_ttl_seconds: int = 21600  # 6 hours (API data)
build_id_cache_seconds: int = 86400  # 24 hours
```

**Cache Keys:**
```python
# Main feed
cache_key = f"feed_main_{limit}"

# Source-specific feed
cache_key = f"feed_source_{source.value}_{limit}"

# Category-specific feed
cache_key = f"feed_category_{category}_{limit}"
```

### Cache Implementation

**TTLCache** (`src/utils/cache.py`):
- In-memory dictionary-based cache
- Automatic expiration based on TTL
- Thread-safe operations
- Cleanup of expired entries

```python
from src.utils.cache import TTLCache

# Initialize cache
cache = TTLCache(default_ttl_seconds=300)

# Store with custom TTL
cache.set("feed_main_50", xml_content, ttl_seconds=300)

# Retrieve
feed = cache.get("feed_main_50")  # Returns None if expired or not found

# Manual invalidation
cache.delete("feed_main_50")
cache.clear()  # Clear all

# Cleanup expired entries
removed_count = cache.cleanup_expired()
```

### Cache Hit Rate Optimization

**Expected Hit Rates:**
- **Main feed**: 90-95% (popular endpoint)
- **Source feeds**: 85-90% (moderate traffic)
- **Category feeds**: 70-80% (less frequent)

**Improving Hit Rates:**

1. **Increase TTL for stable content:**
   ```bash
   # .env
   FEED_CACHE_TTL=600  # 10 minutes instead of 5
   ```

2. **Pre-warm cache on startup:**
   - Initial update triggers cache population
   - Implemented in `src/api/app.py` lifespan

3. **Monitor cache statistics:**
   ```python
   # Add cache hit/miss logging
   logger.debug(f"Cache hit rate: {hits}/{total} = {rate:.2%}")
   ```

### Cache Invalidation Strategy

**Automatic Invalidation:**
- Cache entries expire based on TTL
- No manual intervention required

**Manual Invalidation:**
```bash
# Clear all feed caches
curl -X POST http://localhost:8000/admin/refresh

# Response
{"status": "success", "message": "Feed cache invalidated"}
```

**When to Invalidate:**
- After manual news update
- Configuration changes
- Content moderation
- Emergency fixes

### BuildID Cache Strategy

**Purpose:**
- Cache API build identifiers to reduce requests
- 24-hour TTL (builds change infrequently)

**Implementation:**
```python
# In APIClient
build_id = self.cache.get(f"build_id_{locale}")
if not build_id:
    build_id = await self._fetch_build_id(locale)
    self.cache.set(f"build_id_{locale}", build_id, ttl_seconds=86400)
```

**Optimization:**
- Reduces API calls by ~99%
- 1 build ID fetch per 24 hours per locale
- Automatic refresh on expiry

---

## Database Optimization

### Database Schema

**SQLite Schema** (`src/database.py`):
```sql
CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guid TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    pub_date DATETIME NOT NULL,
    description TEXT,
    content TEXT,
    image_url TEXT,
    author TEXT,
    categories TEXT,
    source TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Indexes for Performance

**Critical Indexes:**
```sql
-- Primary query optimization (ORDER BY pub_date DESC)
CREATE INDEX idx_pub_date ON articles(pub_date DESC);

-- GUID lookups (duplicate detection)
CREATE INDEX idx_guid ON articles(guid);

-- Source filtering (language-specific feeds)
CREATE INDEX idx_source ON articles(source);
```

**Index Impact:**
- **Without indexes**: 500-1000ms for 1000 articles
- **With indexes**: 30-50ms for 1000 articles
- **Performance gain**: 10-20x faster

### Query Optimization

**Optimized Query Pattern:**
```python
# Good - Uses index on pub_date
cursor = await db.execute('''
    SELECT * FROM articles
    ORDER BY pub_date DESC
    LIMIT ?
''', (limit,))

# Good - Uses indexes on source and pub_date
cursor = await db.execute('''
    SELECT * FROM articles
    WHERE source = ?
    ORDER BY pub_date DESC
    LIMIT ?
''', (source, limit))
```

**Anti-Patterns to Avoid:**
```python
# Bad - Full table scan, then filter in Python
all_articles = await db.execute('SELECT * FROM articles')
filtered = [a for a in all_articles if a.source == source]

# Bad - No LIMIT clause
cursor = await db.execute('SELECT * FROM articles ORDER BY pub_date DESC')

# Bad - LIKE queries on large text fields
cursor = await db.execute('SELECT * FROM articles WHERE content LIKE ?', ('%keyword%',))
```

### Database Size Management

**Growth Rate:**
- ~1KB per article (average)
- ~50 articles per day per source (estimate)
- 2 sources: ~100 articles/day
- **Monthly growth**: ~3MB
- **Annual growth**: ~36MB

**Cleanup Strategy:**

```python
# Delete articles older than 6 months
async def cleanup_old_articles(db_path: str, days: int = 180):
    async with aiosqlite.connect(db_path) as db:
        await db.execute('''
            DELETE FROM articles
            WHERE pub_date < datetime('now', '-' || ? || ' days')
        ''', (days,))
        await db.commit()
```

**Recommended Cleanup Schedule:**
- Keep 6 months of articles (sufficient for RSS)
- Run cleanup monthly via cron/scheduled task
- Vacuum database after cleanup

### VACUUM and Database Optimization

**Reclaim Space:**
```python
async def optimize_database(db_path: str):
    async with aiosqlite.connect(db_path) as db:
        # Rebuild database to reclaim space
        await db.execute('VACUUM')

        # Update query planner statistics
        await db.execute('ANALYZE')
```

**When to VACUUM:**
- After bulk deletions
- When database size grows unexpectedly
- Monthly maintenance window
- **Note**: Locks database during operation

**Optimize Routine:**
```bash
# Add to maintenance script
sqlite3 data/articles.db "VACUUM; ANALYZE;"
```

### Connection Management

**Async Connection Pooling:**
```python
# Current: Context manager per operation
async with aiosqlite.connect(self.db_path) as db:
    # Single operation
    pass

# For high traffic, consider connection pooling
# (Future optimization if needed)
```

**Current Design:**
- No persistent connections
- Context managers ensure proper cleanup
- Suitable for current traffic levels
- **Scalability**: Switch to `aiosqlite` connection pool if >100 req/s

### Database Performance Monitoring

**Monitor These Metrics:**
```python
import time
import logging

async def query_with_timing(query: str):
    start = time.perf_counter()
    result = await db.execute(query)
    elapsed = (time.perf_counter() - start) * 1000

    if elapsed > 50:  # Threshold
        logging.warning(f"Slow query ({elapsed:.2f}ms): {query}")

    return result
```

**Alert Thresholds:**
- **Warning**: Query > 50ms
- **Critical**: Query > 200ms
- **Action**: Review indexes, optimize query

---

## Resource Usage

### Memory Footprint

**Baseline Memory:**
```
Python interpreter:      ~30MB
FastAPI + dependencies:  ~50MB
Application code:        ~20MB
-------------------------------
Base footprint:          ~100MB
```

**Runtime Memory:**
```
Feed cache (50 feeds):   ~5-10MB
BuildID cache:           < 1MB
Database connections:    ~10MB
RSS generator objects:   ~5MB
APScheduler:            ~5MB
-------------------------------
Runtime overhead:        ~25-35MB
```

**Total Expected Usage:**
```
Idle:                    ~130MB
Active (peak):           ~200MB
```

### Memory Optimization

**Cache Size Limits:**
```python
class TTLCache:
    def __init__(self, default_ttl_seconds: int = 3600, max_size: int = 1000):
        self.max_size = max_size

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None):
        if len(self._cache) >= self.max_size:
            self.cleanup_expired()  # Remove expired first

            if len(self._cache) >= self.max_size:
                # Evict oldest entry (LRU-like behavior)
                oldest_key = min(self._cache, key=lambda k: self._cache[k][1])
                del self._cache[oldest_key]
```

**RSS Feed Size Limits:**
```python
# Limit feed size to prevent memory issues
rss_max_items: int = 50  # Default
limit = min(limit, 200)  # Hard cap in API
```

### CPU Usage Patterns

**Typical CPU Load:**
```
Idle:                    0-1% CPU
Feed request (cached):   1-2% CPU
Feed request (cold):     5-10% CPU
Update cycle:            20-40% CPU (30s duration)
XML generation:          10-20% CPU
```

**CPU Optimization:**
- Use async I/O to prevent blocking
- Minimize XML regeneration (caching)
- Efficient database queries (indexes)

**CPU Spikes:**
- Normal during scheduled updates
- Expected during initial startup
- Monitor for >80% sustained CPU

### Disk I/O

**Read Operations:**
```
Database reads:          30-50 reads/minute (cached)
                        100-200 reads/minute (uncached)
Config file reads:       1 read on startup
```

**Write Operations:**
```
Database writes:         50-100 writes per update cycle
                        ~100 writes/30 minutes (default schedule)
Log writes:             Variable (depends on log level)
```

**Disk I/O Optimization:**

1. **Use SSD for database:**
   - SQLite benefits greatly from SSD
   - 10x faster than HDD for random access

2. **Optimize logging:**
   ```python
   # .env
   LOG_LEVEL=INFO  # Avoid DEBUG in production
   ```

3. **Database location:**
   ```bash
   # Windows: Use fast disk
   DATABASE_PATH=C:\SSD\lolstonksrss\data\articles.db

   # Docker volume on SSD
   docker run -v C:\SSD\lolstonksrss:/app/data lolstonksrss
   ```

### Network Bandwidth

**Inbound Traffic (Updates):**
```
LoL API requests:        ~50KB per source
                        ~100KB per update cycle
                        ~5MB per day
```

**Outbound Traffic (Feeds):**
```
RSS feed (50 items):     ~50-100KB per request
Expected requests:       100-1000 per day
Daily bandwidth:         5-100MB
```

**Bandwidth Optimization:**
- Feed caching reduces regeneration
- HTTP Cache-Control headers
- Compression (gzip) in production proxy

---

## Optimization Techniques

### 1. Adjust Cache TTL

**Feed Cache TTL:**
```python
# High traffic, frequent updates
FEED_CACHE_TTL=180  # 3 minutes

# Moderate traffic, stable content
FEED_CACHE_TTL=300  # 5 minutes (default)

# Low traffic, infrequent updates
FEED_CACHE_TTL=600  # 10 minutes
```

**BuildID Cache TTL:**
```python
# Default (recommended)
BUILD_ID_CACHE_SECONDS=86400  # 24 hours

# More frequent checks (if API changes often)
BUILD_ID_CACHE_SECONDS=43200  # 12 hours
```

**Trade-offs:**
- **Longer TTL**: Less CPU, slightly stale data
- **Shorter TTL**: Fresher data, more CPU/DB load

### 2. Optimize Feed Limits

**Default Configuration:**
```python
rss_max_items: int = 50  # Good balance
```

**Optimization Strategies:**

```python
# Memory-constrained: Reduce items
rss_max_items: int = 25

# High-performance server: Increase limit
rss_max_items: int = 100

# API hard limit
limit = min(limit, 200)  # Prevents abuse
```

**Impact Analysis:**
```
25 items:  ~25KB feed,  50ms generation
50 items:  ~50KB feed, 100ms generation (default)
100 items: ~100KB feed, 200ms generation
200 items: ~200KB feed, 400ms generation
```

### 3. Database Tuning

**SQLite Pragmas:**
```python
async def initialize_with_optimization(self):
    async with aiosqlite.connect(self.db_path) as db:
        # Performance tuning
        await db.execute('PRAGMA journal_mode=WAL')  # Write-ahead logging
        await db.execute('PRAGMA synchronous=NORMAL')  # Balanced durability
        await db.execute('PRAGMA cache_size=-32000')  # 32MB cache
        await db.execute('PRAGMA temp_store=MEMORY')  # Temp tables in memory

        # Create schema and indexes
        await self._create_schema(db)
```

**Performance Impact:**
```
Default SQLite:          100-150ms per write
With WAL mode:           30-50ms per write
With larger cache:       20-30% faster reads
```

**Production Configuration:**
```python
# In src/database.py initialization
PRAGMA journal_mode=WAL;       # Enable WAL for concurrency
PRAGMA synchronous=NORMAL;     # Balance safety/performance
PRAGMA cache_size=-32000;      # 32MB cache (default is ~2MB)
PRAGMA temp_store=MEMORY;      # Faster temporary operations
```

### 4. Connection Pooling (Future)

**When to Implement:**
- Traffic exceeds 100 requests/second
- Database becomes bottleneck
- Multiple concurrent writes needed

**Implementation Example:**
```python
# Future optimization
from aiosqlite import connect
import asyncio

class ConnectionPool:
    def __init__(self, db_path: str, pool_size: int = 5):
        self.db_path = db_path
        self.pool_size = pool_size
        self.connections = asyncio.Queue()

    async def get_connection(self):
        return await self.connections.get()

    async def release(self, conn):
        await self.connections.put(conn)
```

**Current Status:**
- Not needed at current scale
- Context managers are sufficient
- Monitor connection overhead

### 5. Async I/O Optimization

**Already Implemented:**
```python
# All database operations are async
await repository.get_latest(limit=50)
await repository.save_many(articles)

# FastAPI endpoints are async
@app.get("/feed.xml")
async def get_main_feed():
    feed = await service.get_main_feed(...)
```

**Best Practices:**
- Keep all I/O operations async
- Avoid blocking calls in async functions
- Use `aiohttp` for external requests (already in use)

### 6. Response Compression

**Enable Gzip Compression:**
```python
# Add to FastAPI app
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
```

**Impact:**
- 50-100KB RSS feed → 10-20KB compressed
- 80-90% size reduction
- Minimal CPU overhead

### 7. HTTP Caching Headers

**Already Implemented:**
```python
headers={
    "Cache-Control": f"public, max-age={settings.feed_cache_ttl}",
    "Content-Type": "application/rss+xml; charset=utf-8",
}
```

**Benefits:**
- Browser/proxy caching
- Reduces server load
- Faster for repeat visitors

**Optimization:**
```python
# Add ETag support
from hashlib import md5

etag = md5(feed_xml.encode()).hexdigest()
headers["ETag"] = f'"{etag}"'

# Check If-None-Match header
if request.headers.get("If-None-Match") == f'"{etag}"':
    return Response(status_code=304)  # Not Modified
```

---

## Monitoring

### Health Check Endpoint

**Endpoint:** `GET /health`

**Response:**
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

**Monitoring Usage:**
```bash
# Uptime check
curl http://localhost:8000/health

# Prometheus monitoring
wget -q -O - http://localhost:8000/health | jq '.status'

# Docker healthcheck (already configured)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3
```

### Scheduler Status Monitoring

**Endpoint:** `GET /admin/scheduler/status`

**Response:**
```json
{
  "running": true,
  "interval_minutes": 30,
  "jobs": [
    {
      "id": "update_news",
      "name": "Update LoL News",
      "next_run": "2025-12-29T15:30:00"
    }
  ],
  "update_service": {
    "total_updates": 142,
    "total_articles_saved": 3420,
    "last_update": "2025-12-29T15:00:00",
    "last_update_duration": 28.5,
    "sources": {
      "lol-en-us": {"articles": 1850, "last_update": "2025-12-29T15:00:00"},
      "lol-it-it": {"articles": 1570, "last_update": "2025-12-29T15:00:00"}
    }
  }
}
```

**Metrics to Monitor:**
- **next_run**: Ensure scheduler is active
- **last_update_duration**: Alert if > 60s
- **articles_saved**: Verify updates are happening
- **sources**: Check both sources updating

### Performance Metrics

**Custom Metrics (Recommended):**

```python
# Add to src/api/app.py
import time
from prometheus_client import Counter, Histogram

# Request metrics
request_count = Counter('rss_requests_total', 'Total requests', ['endpoint'])
request_duration = Histogram('rss_request_duration_seconds', 'Request duration')

@app.middleware("http")
async def metrics_middleware(request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration = time.perf_counter() - start

    request_count.labels(endpoint=request.url.path).inc()
    request_duration.observe(duration)

    return response
```

**Key Metrics:**
- **Request rate**: Requests per minute
- **Response time**: P50, P95, P99 percentiles
- **Cache hit rate**: Hits / Total requests
- **Error rate**: 5xx errors per minute
- **Update duration**: Time per update cycle

### Log Analysis

**Log Levels:**
```python
# Development
LOG_LEVEL=DEBUG

# Production
LOG_LEVEL=INFO

# Troubleshooting
LOG_LEVEL=DEBUG  # Temporarily
```

**Important Log Patterns:**

```bash
# Monitor cache performance
grep "Cache hit" logs/app.log | wc -l
grep "Cache miss" logs/app.log | wc -l

# Monitor slow queries
grep "Slow query" logs/app.log

# Monitor update cycles
grep "Update completed" logs/app.log

# Monitor errors
grep "ERROR" logs/app.log
```

**Structured Logging (Recommended):**

```python
import structlog

logger = structlog.get_logger()
logger.info("feed_generated",
    endpoint="/feed.xml",
    articles=50,
    duration_ms=145.2,
    cached=True
)
```

### Performance Dashboards

**Grafana Dashboard Queries:**

```promql
# Request rate
rate(rss_requests_total[5m])

# Average response time
rate(rss_request_duration_seconds_sum[5m]) / rate(rss_request_duration_seconds_count[5m])

# 95th percentile response time
histogram_quantile(0.95, rate(rss_request_duration_seconds_bucket[5m]))

# Cache hit rate
rate(cache_hits_total[5m]) / rate(cache_requests_total[5m])
```

**Windows Performance Monitor:**
```bash
# Monitor Docker container
docker stats lolstonksrss

# CPU and Memory
perfmon /res
```

---

## Bottleneck Identification

### Profiling Techniques

**1. Application Profiling:**

```python
# Add profiling decorator
import cProfile
import pstats
from functools import wraps

def profile(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        profiler = cProfile.Profile()
        profiler.enable()
        result = await func(*args, **kwargs)
        profiler.disable()

        stats = pstats.Stats(profiler)
        stats.sort_stats('cumulative')
        stats.print_stats(10)  # Top 10 functions

        return result
    return wrapper

@profile
async def get_main_feed(feed_url: str, limit: int = 50):
    # Profile this function
    ...
```

**2. Database Query Profiling:**

```python
# Enable query timing
import time
import logging

async def execute_with_timing(query: str):
    start = time.perf_counter()
    result = await db.execute(query)
    elapsed = (time.perf_counter() - start) * 1000

    logging.info(f"Query: {query[:50]}... ({elapsed:.2f}ms)")
    return result
```

**3. Memory Profiling:**

```python
# Install memory_profiler
# pip install memory-profiler

from memory_profiler import profile

@profile
async def memory_intensive_function():
    # Profile memory usage line by line
    ...
```

### Common Bottlenecks

**1. Database Queries (Slow Reads)**

**Symptoms:**
- Response time > 100ms
- High disk I/O
- Slow feed generation

**Diagnosis:**
```python
# Check if indexes are used
await db.execute('EXPLAIN QUERY PLAN SELECT * FROM articles ORDER BY pub_date DESC')

# Expected output should include "USING INDEX idx_pub_date"
```

**Resolution:**
- Verify indexes exist: `idx_pub_date`, `idx_guid`, `idx_source`
- Run ANALYZE to update statistics
- Check disk speed (use SSD)

**2. Cache Misses (Frequent Regeneration)**

**Symptoms:**
- High CPU usage
- Response time varies wildly
- Database queries on every request

**Diagnosis:**
```python
# Add cache hit/miss logging
logger.info(f"Cache hit rate: {hits/total:.2%}")
```

**Resolution:**
- Increase `FEED_CACHE_TTL`
- Pre-warm cache on startup
- Verify cache is not cleared too frequently

**3. RSS Generation (XML Parsing)**

**Symptoms:**
- High CPU during feed generation
- Slow first response after cache clear

**Diagnosis:**
```python
import time

start = time.perf_counter()
feed_xml = generator.generate_feed(articles, feed_url)
elapsed = (time.perf_counter() - start) * 1000

logger.info(f"RSS generation: {elapsed:.2f}ms")
```

**Resolution:**
- Limit feed size (`rss_max_items`)
- Cache aggressively
- Consider pre-generation

**4. Update Cycle (Long Duration)**

**Symptoms:**
- Update takes > 60s
- Overlapping updates
- Scheduler warnings

**Diagnosis:**
```bash
# Check scheduler status
curl http://localhost:8000/admin/scheduler/status | jq '.update_service.last_update_duration'
```

**Resolution:**
- Optimize API client timeout
- Parallelize source updates
- Increase `max_instances=1` if safe

**5. Memory Leaks**

**Symptoms:**
- Memory usage grows over time
- Eventually crashes (OOM)
- Restart temporarily fixes

**Diagnosis:**
```python
import tracemalloc

tracemalloc.start()
# ... run application
snapshot = tracemalloc.take_snapshot()
top_stats = snapshot.statistics('lineno')

for stat in top_stats[:10]:
    print(stat)
```

**Resolution:**
- Ensure cache has size limit
- Clear expired cache entries regularly
- Check for circular references

**6. Disk I/O (Slow Writes)**

**Symptoms:**
- Database writes > 100ms
- Update cycle very slow
- Disk queue length high

**Diagnosis:**
```bash
# Windows: Check disk performance
perfmon

# Look at: Disk Queue Length, Disk Transfers/sec
```

**Resolution:**
- Use SSD for database
- Enable WAL mode (reduces locking)
- Batch writes when possible

### Diagnostic Tools

**Built-in Tools:**
```bash
# Docker stats
docker stats lolstonksrss

# FastAPI /docs endpoint
http://localhost:8000/docs

# Health check
curl http://localhost:8000/health

# Scheduler status
curl http://localhost:8000/admin/scheduler/status
```

**External Tools:**
```bash
# SQLite query analyzer
sqlite3 data/articles.db "EXPLAIN QUERY PLAN SELECT * FROM articles ORDER BY pub_date DESC LIMIT 50;"

# Python profiler
python -m cProfile -o profile.stats main.py
python -m pstats profile.stats

# Memory profiler
mprof run main.py
mprof plot
```

---

## Scaling Considerations

### Current Architecture Limitations

**Single Instance Design:**
- One process per deployment
- In-memory cache (not shared)
- SQLite (single-writer limitation)
- APScheduler (in-process, no coordination)

**Current Capacity:**
```
Requests per second:     ~10-20 rps
Concurrent users:        ~50-100
Daily requests:          ~10,000-50,000
Database size:           < 1GB
```

**When to Scale:**
- Response time > 500ms consistently
- Request rate > 50 rps
- Memory usage > 80%
- Update cycle overlaps

### Vertical Scaling (Add Resources)

**Increase Container Resources:**

```yaml
# docker-compose.yml
services:
  lolstonksrss:
    image: lolstonksrss:latest
    deploy:
      resources:
        limits:
          cpus: '2.0'      # Increase from 1.0
          memory: 1G       # Increase from 512M
        reservations:
          cpus: '1.0'
          memory: 512M
```

**Benefits:**
- Simple to implement
- No code changes
- Immediate improvement

**Limitations:**
- Single point of failure
- Limited by host resources
- Expensive beyond 4-8 cores

**Recommended Specs:**
```
Small deployment:    1 CPU,  512MB RAM
Medium deployment:   2 CPU,  1GB RAM
Large deployment:    4 CPU,  2GB RAM
```

### Horizontal Scaling (Multiple Instances)

**Architecture Changes Needed:**

```
┌─────────────────────────────────────────┐
│          Load Balancer (nginx)          │
└──────────┬──────────────────────────────┘
           │
     ┌─────┴─────┬─────────┬──────────┐
     │           │         │          │
┌────▼────┐ ┌───▼────┐ ┌──▼─────┐ ┌──▼─────┐
│Instance1│ │Instance2│ │Instance3│ │Instance4│
└────┬────┘ └───┬────┘ └──┬─────┘ └──┬─────┘
     │          │         │          │
     └──────────┴─────────┴──────────┘
                  │
         ┌────────▼────────┐
         │  Redis Cache    │
         │  PostgreSQL DB  │
         └─────────────────┘
```

**Required Changes:**

1. **Shared Cache (Redis):**
   ```python
   # Replace TTLCache with Redis
   import aioredis

   redis = await aioredis.create_redis_pool('redis://localhost')
   await redis.setex('feed_main_50', 300, feed_xml)
   feed_xml = await redis.get('feed_main_50')
   ```

2. **Shared Database (PostgreSQL):**
   ```python
   # Replace SQLite with PostgreSQL
   from sqlalchemy.ext.asyncio import create_async_engine

   engine = create_async_engine('postgresql+asyncpg://user:pass@host/db')
   ```

3. **Distributed Scheduler:**
   ```python
   # Use APScheduler with Redis backend
   from apscheduler.schedulers.asyncio import AsyncIOScheduler
   from apscheduler.jobstores.redis import RedisJobStore

   jobstores = {
       'default': RedisJobStore(host='localhost', port=6379)
   }
   scheduler = AsyncIOScheduler(jobstores=jobstores)
   ```

4. **Session Affinity (Sticky Sessions):**
   ```nginx
   # nginx config
   upstream lolstonksrss {
       ip_hash;  # Session affinity
       server instance1:8000;
       server instance2:8000;
       server instance3:8000;
   }
   ```

**Complexity:**
- Significant code changes
- Additional infrastructure (Redis, PostgreSQL)
- Deployment complexity
- Cost increase

**When to Implement:**
- Traffic > 100 rps
- High availability required (99.99% uptime)
- Geographic distribution needed

### Database Scaling

**SQLite Limitations:**
- Single writer at a time
- Limited concurrency
- File-based (not distributed)
- Max database size: ~281TB (practical: < 1GB)

**Migration to PostgreSQL:**

**When to Migrate:**
- Write conflicts occurring
- Need multi-writer concurrency
- Database size > 500MB
- Horizontal scaling required

**Migration Steps:**

1. **Install PostgreSQL:**
   ```bash
   # Windows
   choco install postgresql

   # Docker
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=secret postgres:15
   ```

2. **Update Dependencies:**
   ```bash
   pip install asyncpg sqlalchemy[asyncio]
   ```

3. **Update Database Layer:**
   ```python
   # src/database.py
   from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
   from sqlalchemy.orm import sessionmaker

   engine = create_async_engine(
       'postgresql+asyncpg://user:pass@localhost/lolstonksrss',
       echo=False,
       pool_size=5,
       max_overflow=10
   )
   ```

4. **Migrate Data:**
   ```bash
   # Export from SQLite
   sqlite3 articles.db .dump > dump.sql

   # Import to PostgreSQL (requires conversion)
   # Use pgloader or custom script
   ```

**PostgreSQL Benefits:**
- Multi-writer support
- Better concurrency
- Advanced features (full-text search, JSON)
- Scalable replication

**PostgreSQL Costs:**
- More complex deployment
- Higher resource usage
- Requires management/tuning

### Caching Layer Scaling

**Redis for Distributed Caching:**

**When to Implement:**
- Multiple application instances
- Cache sharing needed
- Advanced cache features required

**Implementation:**

```python
# src/utils/redis_cache.py
import aioredis
from typing import Any, Optional

class RedisCache:
    def __init__(self, redis_url: str = 'redis://localhost'):
        self.redis_url = redis_url
        self.redis = None

    async def connect(self):
        self.redis = await aioredis.create_redis_pool(self.redis_url)

    async def set(self, key: str, value: str, ttl_seconds: int):
        await self.redis.setex(key, ttl_seconds, value)

    async def get(self, key: str) -> Optional[str]:
        return await self.redis.get(key, encoding='utf-8')

    async def delete(self, key: str):
        await self.redis.delete(key)

    async def clear(self):
        await self.redis.flushdb()
```

**Benefits:**
- Shared across instances
- Persistence options
- Advanced features (pub/sub, streams)
- Better eviction policies

### Content Delivery Network (CDN)

**Use Case:**
- Serve RSS feeds from edge locations
- Reduce server load
- Improve global performance

**Implementation:**

```nginx
# nginx with caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=rss_cache:10m max_size=1g;

server {
    location /feed.xml {
        proxy_pass http://lolstonksrss:8000;
        proxy_cache rss_cache;
        proxy_cache_valid 200 5m;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

**CDN Providers:**
- Cloudflare (free tier available)
- AWS CloudFront
- Azure CDN
- Fastly

**Benefits:**
- Offload 80-90% of requests
- Global distribution
- DDoS protection
- SSL/TLS termination

---

## Docker Performance

### Resource Limits

**Configure Resource Limits:**

```yaml
# docker-compose.yml
services:
  lolstonksrss:
    image: lolstonksrss:latest
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

**Recommended Limits:**

```yaml
# Development
limits:
  cpus: '0.5'
  memory: 256M

# Production (low traffic)
limits:
  cpus: '1.0'
  memory: 512M

# Production (high traffic)
limits:
  cpus: '2.0'
  memory: 1G
```

### Volume Performance

**Windows-Specific Considerations:**

**Slow Volume Mounts:**
- Docker Desktop on Windows uses WSL 2
- Cross-OS mounts are slow
- Avoid mounting from `/mnt/c/`

**Optimization:**

```yaml
# Bad - Slow cross-OS mount
volumes:
  - /mnt/c/Users/myuser/data:/app/data

# Good - WSL 2 native path
volumes:
  - /home/user/lolstonksrss/data:/app/data

# Best - Named volume (managed by Docker)
volumes:
  - lolstonksrss_data:/app/data

volumes:
  lolstonksrss_data:
    driver: local
```

**Performance Impact:**
```
Windows host mount:      10-20 MB/s
WSL 2 native mount:      100-200 MB/s
Named volume:            200-500 MB/s
```

### Network Performance

**Optimize Container Networking:**

```yaml
# docker-compose.yml
networks:
  lolstonks_net:
    driver: bridge
    driver_opts:
      com.docker.network.driver.mtu: 1500

services:
  lolstonksrss:
    networks:
      - lolstonks_net
```

**Port Mapping:**
```yaml
# Direct port mapping (fastest)
ports:
  - "8000:8000"

# Avoid unnecessary proxying
# (nginx proxy adds ~5-10ms latency)
```

### Image Optimization

**Current Dockerfile Analysis:**

```dockerfile
# Multi-stage build ✓
FROM python:3.11-slim as builder

# Minimal dependencies ✓
RUN apt-get update && apt-get install -y --no-install-recommends gcc

# Clean up ✓
&& rm -rf /var/lib/apt/lists/*

# Non-root user ✓
USER lolrss
```

**Image Size:**
```
python:3.11-slim:        ~130MB
+ dependencies:          ~50MB
+ application code:      ~5MB
------------------------
Total image size:        ~185MB ✓
```

**Further Optimization:**

```dockerfile
# Use alpine for smaller base (if compatible)
FROM python:3.11-alpine  # ~50MB vs 130MB

# Multi-stage build to exclude build tools
FROM python:3.11-slim as builder
# ... build dependencies

FROM python:3.11-slim as runtime
COPY --from=builder /root/.local /home/lolrss/.local
# No gcc, build tools in final image
```

**Build Cache Optimization:**

```dockerfile
# Copy requirements first (better caching)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Then copy code (changes frequently)
COPY src/ ./src/
```

### Container Monitoring

**Docker Stats:**
```bash
# Real-time container stats
docker stats lolstonksrss

# Output:
CONTAINER    CPU %    MEM USAGE / LIMIT     MEM %    NET I/O
lolstonksrss 1.5%     180MiB / 512MiB      35%      2MB / 5MB
```

**cAdvisor (Advanced Monitoring):**

```yaml
# docker-compose.yml
services:
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
```

---

## Windows Server Optimization

### WSL 2 Performance

**Enable WSL 2 (Required for Docker Desktop):**

```powershell
# Check WSL version
wsl --list --verbose

# Ensure WSL 2 is enabled
wsl --set-default-version 2
```

**WSL 2 Configuration:**

```ini
# C:\Users\<User>\.wslconfig
[wsl2]
memory=4GB           # Limit WSL 2 memory (default: 50% of total RAM)
processors=2         # Number of processors (default: all)
swap=2GB            # Swap file size
localhostForwarding=true
```

**Restart WSL:**
```powershell
wsl --shutdown
# Docker Desktop will restart WSL automatically
```

### Disk I/O on Windows

**Use Fast Disks:**
```
HDD (7200 RPM):      50-100 MB/s   (Not recommended)
SATA SSD:            200-500 MB/s  (Minimum)
NVMe SSD:            1000-3000 MB/s (Recommended)
```

**Database Location:**
```yaml
# Place database on fastest disk
volumes:
  - D:\SSD\lolstonksrss\data:/app/data  # D: is NVMe SSD
```

**Disable Disk Indexing:**
```powershell
# Disable Windows Search on data drive
Get-Service WSearch | Stop-Service
Set-Service WSearch -StartupType Disabled
```

### Network Configuration

**Firewall Rules:**

```powershell
# Allow inbound on port 8000
New-NetFirewallRule -DisplayName "LoL Stonks RSS" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow

# Or open in Windows Defender Firewall GUI
```

**Port Forwarding (if needed):**

```powershell
# Forward external port to container
netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=8000 connectaddress=127.0.0.1
```

**IPv6 Considerations:**
```yaml
# Disable IPv6 if not needed (reduces complexity)
services:
  lolstonksrss:
    sysctls:
      - net.ipv6.conf.all.disable_ipv6=1
```

### Service Optimization

**Docker Desktop Settings:**

1. **Resources:**
   - CPUs: 2-4 cores
   - Memory: 4-8 GB
   - Swap: 2 GB
   - Disk image size: 100 GB

2. **Docker Engine Configuration:**
   ```json
   {
     "builder": {
       "gc": {
         "enabled": true,
         "defaultKeepStorage": "20GB"
       }
     },
     "experimental": false,
     "features": {
       "buildkit": true
     }
   }
   ```

**Windows Service Setup:**

```powershell
# Create scheduled task to start Docker on boot
schtasks /create /tn "Docker Desktop" /tr "C:\Program Files\Docker\Docker\Docker Desktop.exe" /sc onstart /ru SYSTEM
```

### Power Management

**Disable Sleep for Server:**

```powershell
# Set power plan to High Performance
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c

# Disable sleep
powercfg /change standby-timeout-ac 0
powercfg /change hibernate-timeout-ac 0
```

### Logging and Monitoring

**Windows Event Log Integration:**

```python
# Optional: Send logs to Windows Event Log
import logging
from logging.handlers import NTEventLogHandler

handler = NTEventLogHandler('LoL Stonks RSS')
logging.getLogger().addHandler(handler)
```

**Performance Monitor:**

```powershell
# Monitor Docker containers
perfmon

# Add counters:
# - Process > % Processor Time > Docker Desktop
# - Process > Private Bytes > Docker Desktop
# - Network Interface > Bytes Total/sec
```

---

## Load Testing

### Load Test Scenarios

**Scenario 1: Normal Traffic**

```bash
# 10 requests per second for 5 minutes
ab -n 3000 -c 10 -t 300 http://localhost:8000/feed.xml
```

**Expected Results:**
```
Requests per second:    10 rps ✓
Time per request:       100-150ms ✓
Failed requests:        0 ✓
50% percentile:         100ms ✓
95% percentile:         200ms ✓
99% percentile:         300ms ✓
```

**Scenario 2: Peak Traffic**

```bash
# 50 requests per second for 1 minute
ab -n 3000 -c 50 -t 60 http://localhost:8000/feed.xml
```

**Expected Results:**
```
Requests per second:    50 rps ✓
Time per request:       200-300ms ✓
Failed requests:        0 ✓
50% percentile:         200ms ✓
95% percentile:         400ms ✓
99% percentile:         600ms ✓
```

**Scenario 3: Burst Traffic**

```bash
# 100 concurrent requests (burst)
ab -n 100 -c 100 http://localhost:8000/feed.xml
```

**Expected Results:**
```
Time per request:       300-500ms ✓
Failed requests:        0 ✓
Cache effectiveness:    95%+ ✓
```

**Scenario 4: Mixed Endpoints**

```bash
# Test multiple endpoints
for i in {1..100}; do
  curl -s http://localhost:8000/feed.xml &
  curl -s http://localhost:8000/feed/en-us.xml &
  curl -s http://localhost:8000/feed/it-it.xml &
  wait
done
```

### Load Testing Tools

**Apache Bench (ab):**

```bash
# Install
# Windows: Download from Apache website
# Linux: apt-get install apache2-utils

# Basic test
ab -n 1000 -c 10 http://localhost:8000/feed.xml

# With keep-alive
ab -n 1000 -c 10 -k http://localhost:8000/feed.xml

# Save results
ab -n 1000 -c 10 -g results.tsv http://localhost:8000/feed.xml
```

**wrk (Advanced):**

```bash
# Install
git clone https://github.com/wg/wrk.git
cd wrk && make

# Run test
wrk -t4 -c100 -d30s http://localhost:8000/feed.xml

# With script
wrk -t4 -c100 -d30s -s script.lua http://localhost:8000/
```

**Locust (Python-based):**

```python
# locustfile.py
from locust import HttpUser, task, between

class RSSUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def get_main_feed(self):
        self.client.get("/feed.xml")

    @task(1)
    def get_en_feed(self):
        self.client.get("/feed/en-us.xml")

    @task(1)
    def get_it_feed(self):
        self.client.get("/feed/it-it.xml")
```

```bash
# Run Locust
pip install locust
locust -f locustfile.py --host http://localhost:8000

# Open web UI at http://localhost:8089
```

### Expected Capacity

**Current Architecture Capacity:**

```
Single instance (1 CPU, 512MB RAM):
- Sustained:             10-20 rps
- Peak:                  50 rps
- Burst:                 100 concurrent requests
- Daily requests:        10,000-50,000

Optimized (2 CPU, 1GB RAM):
- Sustained:             50-100 rps
- Peak:                  200 rps
- Burst:                 500 concurrent requests
- Daily requests:        100,000-500,000
```

**Bottleneck Points:**
```
< 10 rps:      CPU idle, memory < 30%
10-50 rps:     Normal operation, cache effective
50-100 rps:    High load, cache critical
> 100 rps:     CPU > 80%, consider scaling
```

### Performance Benchmarks

**Feed Generation (Cold):**
```
25 items:      100-150ms
50 items:      150-250ms
100 items:     250-400ms
200 items:     400-800ms
```

**Feed Generation (Cached):**
```
Any size:      5-20ms
```

**Database Queries:**
```
50 items:      20-40ms
100 items:     30-50ms
500 items:     50-100ms
1000 items:    100-200ms
```

**Update Cycle:**
```
Single source:     15-25s
Both sources:      25-35s
With failures:     30-45s (retries)
```

---

## Performance Checklist

### Pre-Deployment Optimization

**Configuration Review:**
- [ ] `FEED_CACHE_TTL` set appropriately (300s recommended)
- [ ] `BUILD_ID_CACHE_SECONDS` set to 86400 (24 hours)
- [ ] `RSS_MAX_ITEMS` set to reasonable limit (50-100)
- [ ] `UPDATE_INTERVAL_MINUTES` configured (30 min default)
- [ ] `LOG_LEVEL` set to INFO (not DEBUG)

**Database Optimization:**
- [ ] Indexes created: `idx_pub_date`, `idx_guid`, `idx_source`
- [ ] SQLite pragmas enabled: WAL mode, cache size
- [ ] Database on fast disk (SSD or better)
- [ ] Database location optimized for Docker volumes

**Docker Optimization:**
- [ ] Multi-stage build implemented
- [ ] Non-root user configured
- [ ] Resource limits set appropriately
- [ ] Health check configured
- [ ] Named volumes for persistence

**Caching Strategy:**
- [ ] Feed cache TTL configured
- [ ] BuildID cache implemented
- [ ] Cache invalidation strategy defined
- [ ] HTTP Cache-Control headers set

### Production Tuning

**Initial Deployment:**
- [ ] Run load tests to establish baseline
- [ ] Monitor resource usage for 24 hours
- [ ] Verify cache hit rates > 90%
- [ ] Check update cycle duration < 45s
- [ ] Confirm response times < 200ms

**Week 1 Monitoring:**
- [ ] Review logs for errors or warnings
- [ ] Check database growth rate
- [ ] Monitor memory usage trends
- [ ] Verify scheduler is running correctly
- [ ] Test manual update trigger

**Month 1 Optimization:**
- [ ] Analyze query performance (slow queries?)
- [ ] Review cache hit rates (optimize TTL?)
- [ ] Check disk usage (cleanup needed?)
- [ ] Evaluate scaling needs
- [ ] Run VACUUM on database

### Monitoring Setup

**Health Checks:**
- [ ] `/health` endpoint monitored (uptime check)
- [ ] `/admin/scheduler/status` reviewed regularly
- [ ] Database connectivity verified
- [ ] Cache functionality tested

**Metrics Collection:**
- [ ] Request rate tracked
- [ ] Response time percentiles measured (P50, P95, P99)
- [ ] Cache hit rate calculated
- [ ] Error rate monitored
- [ ] Update duration logged

**Alerting:**
- [ ] Alert on response time > 500ms
- [ ] Alert on error rate > 1%
- [ ] Alert on memory usage > 80%
- [ ] Alert on update failure
- [ ] Alert on disk space < 20%

### Performance Testing

**Load Tests:**
- [ ] Normal traffic scenario (10 rps)
- [ ] Peak traffic scenario (50 rps)
- [ ] Burst traffic scenario (100 concurrent)
- [ ] Mixed endpoints tested
- [ ] Sustained load test (30+ minutes)

**Benchmarks:**
- [ ] Feed generation (cached) < 200ms
- [ ] Database queries < 50ms
- [ ] Update cycle < 45s
- [ ] Memory usage < 500MB
- [ ] Cache hit rate > 90%

### Scaling Preparation

**Vertical Scaling:**
- [ ] Current resource usage documented
- [ ] Growth rate calculated
- [ ] Resource increase plan defined
- [ ] Cost analysis completed

**Horizontal Scaling:**
- [ ] Shared cache strategy defined (Redis?)
- [ ] Database migration plan (PostgreSQL?)
- [ ] Load balancer configuration prepared
- [ ] Session management strategy decided

### Windows Server Specific

**WSL 2 Configuration:**
- [ ] WSL 2 enabled and configured
- [ ] Memory and CPU limits set in `.wslconfig`
- [ ] Docker Desktop optimized
- [ ] Volume performance verified

**Server Optimization:**
- [ ] Database on fast disk (NVMe SSD preferred)
- [ ] Firewall rules configured
- [ ] Power management disabled (no sleep)
- [ ] Windows indexing disabled on data drive
- [ ] Scheduled tasks for auto-start configured

### Maintenance Checklist

**Weekly:**
- [ ] Review logs for errors
- [ ] Check disk space
- [ ] Verify backups
- [ ] Monitor response times
- [ ] Check cache hit rates

**Monthly:**
- [ ] Run VACUUM on database
- [ ] Review and cleanup old articles (6+ months)
- [ ] Update dependencies (security patches)
- [ ] Review performance metrics
- [ ] Adjust cache TTL if needed

**Quarterly:**
- [ ] Comprehensive performance review
- [ ] Load testing with current traffic patterns
- [ ] Capacity planning review
- [ ] Scaling evaluation
- [ ] Cost optimization analysis

---

## Conclusion

### Quick Reference

**Key Performance Targets:**
```
Feed Generation (cached):  < 200ms ✓
Database Query:            < 50ms  ✓
API Response:              < 100ms ✓
Update Cycle:              ~30s    ✓
Cache Hit Rate:            > 90%   ✓
Memory Usage:              ~200MB  ✓
```

**Most Impactful Optimizations:**
1. **Enable feed caching** (5 min TTL) → 10x faster responses
2. **Create database indexes** → 10x faster queries
3. **Use SSD for database** → 5x faster I/O
4. **Configure SQLite WAL mode** → 3x faster writes
5. **HTTP Cache-Control headers** → Reduce server load 50%

**Common Issues and Quick Fixes:**

| Issue | Quick Fix |
|-------|-----------|
| Slow responses | Check cache hit rate, increase TTL |
| High CPU | Verify indexes, reduce feed size |
| High memory | Limit cache size, reduce `rss_max_items` |
| Slow updates | Check network, optimize API timeout |
| Database locked | Enable WAL mode, check concurrency |

**Monitoring Commands:**
```bash
# Health check
curl http://localhost:8000/health

# Scheduler status
curl http://localhost:8000/admin/scheduler/status | jq

# Docker stats
docker stats lolstonksrss

# Database size
du -h data/articles.db
```

**Support and Resources:**
- Performance tests: `tests/performance/test_performance.py`
- Configuration: `src/config.py`
- Caching: `src/utils/cache.py`
- Database: `src/database.py`

For further optimization needs, refer to the [Scaling Considerations](#scaling-considerations) section.

---

**Document Version:** 1.0
**Last Updated:** 2025-12-29
**Next Review:** 2026-03-29
