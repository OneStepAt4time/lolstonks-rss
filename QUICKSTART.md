# Quick Start Guide

This guide gets you up and running with the LoL Stonks RSS foundation in under 5 minutes.

## Prerequisites

- Python 3.11 or higher
- UV package manager (recommended) or pip

## Installation

1. Install dependencies:

```bash
# Using UV (recommended)
uv sync

# Or using pip (legacy)
pip install -r requirements.txt
```

2. Verify installation:

```bash
python -c "from src.models import Article; print('OK')"
```

## Running Tests

Run all tests with coverage:

```bash
# Using UV
uv run pytest -v --cov=src

# Or directly
pytest -v --cov=src
```

Run specific test modules:

```bash
uv run pytest tests/test_models.py -v      # Model tests
uv run pytest tests/test_database.py -v    # Database tests
uv run pytest tests/test_cache.py -v       # Cache tests
```

## Running the Demo

See all components in action:

```bash
python demo.py
```

This demonstrates:
- Configuration loading
- Article creation and validation
- Database operations
- Cache functionality

## Basic Usage Examples

### Creating Articles

```python
from datetime import datetime
from src.models import Article, ArticleSource

article = Article(
    title="New Champion Released",
    url="https://leagueoflegends.com/news/champion",
    pub_date=datetime.now(),
    guid="unique-article-id",
    source=ArticleSource.LOL_EN_US,
    description="Exciting new champion joins the rift!",
    categories=["Champions", "Game Updates"]
)
```

### Database Operations

```python
import asyncio
from src.database import ArticleRepository

async def main():
    # Initialize database
    repo = ArticleRepository("data/articles.db")
    await repo.initialize()

    # Save article
    await repo.save(article)

    # Get latest 10 articles
    latest = await repo.get_latest(limit=10)

    # Get English articles only
    en_articles = await repo.get_latest(limit=50, source="lol-en-us")

    # Find by GUID
    article = await repo.get_by_guid("unique-article-id")

asyncio.run(main())
```

### Configuration

```python
from src.config import get_settings

settings = get_settings()
print(f"Database: {settings.database_path}")
print(f"Port: {settings.port}")
print(f"RSS Max Items: {settings.rss_max_items}")
```

### Caching

```python
from src.utils.cache import TTLCache

# Create cache with 1 hour default TTL
cache = TTLCache(default_ttl_seconds=3600)

# Store value (custom 2 hour TTL)
cache.set("build_id", "ABC123", ttl_seconds=7200)

# Retrieve value
build_id = cache.get("build_id")

# Clear all cache
cache.clear()
```

## Project Structure

```
src/
├── models.py      - Data models (Article, ArticleSource)
├── database.py    - SQLite async repository
├── config.py      - Configuration management
└── utils/
    └── cache.py   - TTL cache

tests/
├── test_models.py     - Model tests
├── test_database.py   - Database tests
└── test_cache.py      - Cache tests
```

## Configuration Files

### .env (Environment Variables)

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Key settings:
- `DATABASE_PATH` - Database location
- `PORT` - HTTP server port
- `RSS_MAX_ITEMS` - Max items in feed
- `CACHE_TTL_SECONDS` - Cache expiration

## Development Workflow

1. Make changes to source code
2. Run tests: `pytest`
3. Check coverage: `pytest --cov=src --cov-report=html`
4. View coverage report: `open htmlcov/index.html`

## Code Quality Tools

Format code:
```bash
black src/ tests/
```

Type checking:
```bash
mypy src/
```

Linting:
```bash
ruff check src/ tests/
```

## Common Tasks

### Clear Database

```bash
rm data/articles.db
```

### Reset Test Database

Test databases are created in temporary directories automatically.

### Update Dependencies

```bash
# With UV
uv sync --upgrade

# Or with pip
pip install --upgrade -r requirements.txt
```

## Troubleshooting

### Import Errors

Make sure you're in the project root directory:
```bash
cd D:\lolstonksrss
```

### Database Locked

Close any open database connections. SQLite only allows one writer at a time.

### Test Failures

Run tests with verbose output:
```bash
pytest -vv --tb=short
```

## Next Steps

- Read `README.md` for detailed documentation
- Check `docs/phase-2-foundation-complete.md` for implementation details
- Review `docs/api-discovery-report.md` for API information

## Getting Help

1. Check test files for usage examples
2. Review docstrings in source code
3. Run the demo script for live examples

## Status

Current Phase: **Phase 2 Complete** (Foundation Setup)

- ✅ Data models
- ✅ Database repository
- ✅ Configuration
- ✅ Caching
- ✅ Tests (26 passing, 74% coverage)

Next Phase: **Phase 3** (API Client & RSS Generation)
