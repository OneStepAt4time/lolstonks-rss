# Phase 6: Update Scheduler Implementation

## Overview

Phase 6 successfully implements automatic periodic updates using APScheduler. The scheduler fetches news from all configured sources (en-us, it-it) at regular intervals and populates the database automatically.

## Implementation Summary

### Components Implemented

1. **UpdateService** (`src/services/update_service.py`)
   - Fetches articles from multiple LoL API locales
   - Saves articles to database with duplicate detection
   - Tracks update statistics and errors
   - Provides status information

2. **NewsScheduler** (`src/services/scheduler.py`)
   - Manages periodic updates using APScheduler
   - Prevents overlapping update jobs
   - Supports manual trigger capability
   - Provides status and job information

3. **FastAPI Integration** (`src/api/app.py`)
   - Scheduler lifecycle management in app lifespan
   - Initial update on server startup
   - Admin endpoints for scheduler control

### New Endpoints

#### GET /admin/scheduler/status
Returns scheduler status and statistics.

**Response:**
```json
{
  "running": true,
  "interval_minutes": 30,
  "jobs": [
    {
      "id": "update_news",
      "name": "Update LoL News",
      "next_run": "2025-12-28T15:30:00"
    }
  ],
  "update_service": {
    "last_update": "2025-12-28T15:00:00",
    "update_count": 12,
    "error_count": 0,
    "sources": ["en-us", "it-it"]
  }
}
```

#### POST /admin/scheduler/trigger
Manually trigger an immediate news update.

**Response:**
```json
{
  "started_at": "2025-12-28T15:05:00",
  "completed_at": "2025-12-28T15:05:03",
  "elapsed_seconds": 3.2,
  "total_fetched": 24,
  "total_new": 5,
  "total_duplicates": 19,
  "sources": {
    "en-us": {
      "fetched": 12,
      "new": 3,
      "duplicates": 9
    },
    "it-it": {
      "fetched": 12,
      "new": 2,
      "duplicates": 10
    }
  },
  "errors": []
}
```

## Configuration

Add to your `.env` file or environment variables:

```bash
# Update interval in minutes (default: 30)
UPDATE_INTERVAL_MINUTES=30
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FastAPI Application                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Application Lifespan                     │  │
│  │                                                        │  │
│  │  1. Initialize Database                               │  │
│  │  2. Initialize Feed Service                           │  │
│  │  3. Initialize Scheduler (interval: 30 min)          │  │
│  │  4. Start Scheduler                                   │  │
│  │  5. Trigger Initial Update                            │  │
│  │                                                        │  │
│  │  On Shutdown:                                         │  │
│  │  1. Stop Scheduler                                    │  │
│  │  2. Close Database                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              NewsScheduler                            │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  APScheduler (AsyncIOScheduler)                │  │  │
│  │  │  - Job: Update LoL News (every 30 min)        │  │  │
│  │  │  - Max Instances: 1 (prevent overlaps)        │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                       │                               │  │
│  │                       ▼                               │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  UpdateService                                 │  │  │
│  │  │  - Fetch from en-us API                       │  │  │
│  │  │  - Fetch from it-it API                       │  │  │
│  │  │  - Save to database                           │  │  │
│  │  │  - Track statistics                           │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Update Flow

1. **Scheduled Update Trigger**
   - APScheduler triggers job every 30 minutes
   - Max instances = 1 prevents overlapping updates

2. **Update Execution**
   - UpdateService.update_all_sources() called
   - For each locale (en-us, it-it):
     - Fetch articles from LoL API
     - Save each article to database
     - Track new vs duplicate articles
     - Log errors without stopping

3. **Statistics Collection**
   - Total fetched, new, duplicates
   - Per-source breakdown
   - Elapsed time
   - Error list

4. **Status Tracking**
   - Last update timestamp
   - Total update count
   - Error count
   - Available sources

## Testing

### Test Coverage

```bash
# Run scheduler tests
pytest tests/test_scheduler.py -v

# Run update service tests
pytest tests/test_update_service.py -v

# Run integration tests
pytest tests/test_integration_scheduler.py -v

# Check coverage for services module
pytest tests/test_update_service.py tests/test_scheduler.py --cov=src/services --cov-report=term-missing
```

### Coverage Results

- **scheduler.py**: 100% coverage
- **update_service.py**: 96% coverage
- **Overall services module**: 98% coverage

### Test Summary

- 26 total tests (all passing)
- 7 UpdateService tests
- 15 NewsScheduler tests
- 4 Integration tests

## Usage Examples

### Starting the Server

```bash
# Server starts with automatic updates enabled
python -m uvicorn src.api.app:app --host 0.0.0.0 --port 8000

# Logs will show:
# INFO: Starting LoL Stonks RSS server...
# INFO: Database initialized at data/articles.db
# INFO: Starting scheduler with 30 minute interval
# INFO: Scheduler started successfully
# INFO: Triggering initial update...
# INFO: Starting update for all sources...
# INFO: Update complete: 5 new articles, 0 duplicates, 0 errors in 2.5s
# INFO: Server initialized successfully
```

### Manual Trigger

```bash
# Trigger update via API
curl -X POST http://localhost:8000/admin/scheduler/trigger

# Check scheduler status
curl http://localhost:8000/admin/scheduler/status
```

### Docker Deployment

The scheduler is fully integrated with Docker. When running in a container:

```bash
# Build image
docker build -t lolstonksrss .

# Run with custom interval (60 minutes)
docker run -p 8000:8000 -e UPDATE_INTERVAL_MINUTES=60 lolstonksrss

# Run with volume for persistent database
docker run -p 8000:8000 -v D:\lolstonksrss\data:/app/data lolstonksrss
```

## Features

### Automatic Updates
- Periodic fetching from all configured sources
- Configurable interval (default: 30 minutes)
- Initial update on server startup
- Graceful error handling

### Duplicate Prevention
- Database GUID uniqueness constraint
- Duplicate detection and counting
- Continues processing on duplicates

### Overlap Prevention
- APScheduler max_instances=1
- Only one update job runs at a time
- Subsequent updates wait if previous still running

### Manual Control
- Trigger immediate updates via API
- Check scheduler status and next run time
- View update history and statistics

### Error Handling
- Per-source error isolation
- Continues with remaining sources on error
- Error tracking and reporting
- Detailed logging

### Statistics Tracking
- Total articles fetched
- New vs duplicate counts
- Per-source breakdown
- Update timing
- Error history

## Database Schema

No changes to database schema. Uses existing articles table with GUID uniqueness.

## Logging

Comprehensive logging at all levels:

```
INFO: Fetching articles for en-us...
INFO: en-us: 12 fetched, 3 new, 9 duplicates
INFO: Fetching articles for it-it...
INFO: it-it: 12 fetched, 2 new, 10 duplicates
INFO: Update complete: 5 new articles, 19 duplicates, 0 errors in 2.5s
```

## Success Criteria

All success criteria met:

- ✅ APScheduler dependency added (already in requirements.txt)
- ✅ UpdateService fetches and saves articles
- ✅ NewsScheduler manages periodic updates
- ✅ Integrated into FastAPI lifespan
- ✅ Manual trigger endpoint
- ✅ Status endpoint
- ✅ Initial update on startup
- ✅ Error handling and logging
- ✅ Tests with 98% coverage (exceeds 90% requirement)
- ✅ Prevents overlapping updates
- ✅ Configurable interval

## Files Modified/Created

### Created
- `src/services/__init__.py`
- `src/services/update_service.py`
- `src/services/scheduler.py`
- `tests/test_update_service.py`
- `tests/test_scheduler.py`
- `tests/test_integration_scheduler.py`
- `docs/PHASE6_SCHEDULER.md`

### Modified
- `src/api/app.py` - Added scheduler integration
- `src/database.py` - Added close() method
- `src/config.py` - Already had update_interval_minutes

## Next Steps

Phase 6 is complete. Possible future enhancements:

1. Add scheduler metrics endpoint
2. Implement update history persistence
3. Add configurable retry logic for failed updates
4. Support for additional locales
5. Webhook notifications on update completion
6. Admin dashboard for scheduler management

## Troubleshooting

### Scheduler Not Running
- Check logs for "Scheduler started successfully"
- Verify UPDATE_INTERVAL_MINUTES is valid (> 0)
- Check /admin/scheduler/status endpoint

### No Articles Being Fetched
- Check /admin/scheduler/trigger response for errors
- Verify LoL API is accessible
- Check database write permissions
- Review logs for error messages

### Overlapping Updates
- Should not happen (max_instances=1)
- If occurs, check APScheduler version
- Verify only one app instance running

### High Error Count
- Check /admin/scheduler/status for error_count
- Review logs for specific error messages
- Verify network connectivity to LoL API
- Check database integrity

## Performance

### Resource Usage
- Minimal CPU when idle
- Network I/O during updates
- Database I/O for article saving
- Memory stable over time

### Typical Update Times
- Single locale: 1-2 seconds
- Both locales: 2-4 seconds
- Depends on network latency and article count

### Scaling Considerations
- Add more locales by updating UpdateService.clients
- Adjust interval based on update frequency needs
- Consider caching for high-traffic deployments
- Database indexing already optimized

## References

- [APScheduler Documentation](https://apscheduler.readthedocs.io/)
- [FastAPI Lifespan Events](https://fastapi.tiangolo.com/advanced/events/)
- [AsyncIO Scheduler](https://apscheduler.readthedocs.io/en/stable/modules/schedulers/asyncio.html)
