# Developer Guide

Welcome to the LoL Stonks RSS developer guide! This comprehensive guide will help you understand the project architecture, set up your development environment, and contribute effectively to the codebase.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Key Concepts](#key-concepts)
5. [Adding New Features](#adding-new-features)
6. [Testing Guidelines](#testing-guidelines)
7. [Debugging](#debugging)
8. [Code Examples](#code-examples)
9. [Contributing](#contributing)
10. [Tools and Commands](#tools-and-commands)

---

## 1. Development Setup

### Prerequisites

- **Python 3.11+** - Required for modern type hints and async features
- **UV** - Fast Python package installer (optional but recommended)
- **Docker Desktop** - For containerization and deployment testing
- **Git** - Version control
- **VS Code** - Recommended IDE (with Python extension)

### Installation Steps

#### 1.1 Clone the Repository

```bash
git clone <repository-url>
cd lolstonksrss
```

#### 1.2 Install Dependencies

**Option A: Using UV (Recommended)**
```bash
# Install UV if not already installed
pip install uv

# Create virtual environment and install dependencies
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -r requirements.txt
```

**Option B: Using pip**
```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### 1.3 Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Most defaults work fine for development
```

**Key environment variables:**
```env
DATABASE_PATH=data/articles.db
PORT=8000
LOG_LEVEL=DEBUG
UPDATE_INTERVAL_MINUTES=30
CACHE_TTL_SECONDS=21600
```

#### 1.4 Initialize Database

```bash
# Run the application once to initialize the database
python main.py
# Press Ctrl+C after database initialization message
```

#### 1.5 Verify Installation

```bash
# Run tests to verify everything is working
pytest -v

# Test imports
python -c "from src.models import Article; print('OK')"
python -c "from src.database import ArticleRepository; print('OK')"
python -c "from src.api_client import LoLNewsAPIClient; print('OK')"
```

---

## 2. Project Structure

### Directory Layout

```
D:\lolstonksrss\
├── src/                        # Source code
│   ├── __init__.py
│   ├── models.py              # Core data models (Article, ArticleSource)
│   ├── database.py            # SQLite repository (async)
│   ├── config.py              # Configuration management
│   ├── api_client.py          # LoL News API client
│   │
│   ├── api/                   # FastAPI application
│   │   ├── __init__.py
│   │   └── app.py            # HTTP endpoints
│   │
│   ├── rss/                   # RSS generation
│   │   ├── __init__.py
│   │   ├── generator.py      # RSS feed generator
│   │   └── feed_service.py   # Feed service with caching
│   │
│   ├── services/              # Business logic
│   │   ├── __init__.py
│   │   ├── update_service.py # News update service
│   │   └── scheduler.py      # Background scheduler
│   │
│   └── utils/                 # Utility modules
│       ├── __init__.py
│       └── cache.py          # TTL cache implementation
│
├── tests/                      # Test suite
│   ├── __init__.py
│   ├── test_models.py         # Model tests
│   ├── test_database.py       # Database tests
│   ├── test_cache.py          # Cache tests
│   ├── test_api_client.py     # API client tests
│   ├── test_rss_generator.py  # RSS generator tests
│   ├── test_feed_service.py   # Feed service tests
│   ├── test_update_service.py # Update service tests
│   ├── test_scheduler.py      # Scheduler tests
│   │
│   ├── integration/           # Integration tests
│   │   ├── __init__.py
│   │   ├── test_api_integration.py
│   │   ├── test_server_integration.py
│   │   └── test_integration_scheduler.py
│   │
│   ├── e2e/                   # End-to-end tests
│   │   ├── __init__.py
│   │   └── test_full_workflow.py
│   │
│   ├── performance/           # Performance tests
│   │   ├── __init__.py
│   │   └── test_performance.py
│   │
│   └── validation/            # RSS validation tests
│       ├── __init__.py
│       └── test_rss_compliance.py
│
├── examples/                   # Example scripts
│   ├── fetch_news_demo.py     # Demo: Fetch news
│   └── rss_demo.py            # Demo: Generate RSS
│
├── data/                       # Runtime data
│   └── articles.db            # SQLite database (auto-created)
│
├── docs/                       # Documentation
│   ├── DEVELOPER_GUIDE.md     # This file
│   ├── ARCHITECTURE.md        # Architecture decisions
│   └── API.md                 # API documentation
│
├── main.py                     # Application entry point
├── Dockerfile                  # Docker configuration
├── docker-compose.yml          # Docker Compose setup
├── requirements.txt            # Python dependencies
├── pyproject.toml             # Python tooling config
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── CLAUDE.md                  # Claude Code instructions
└── README.md                  # Project overview
```

### Module Organization

#### Core Modules (`src/`)

- **`models.py`** - Data models with validation and serialization
- **`database.py`** - Async SQLite repository pattern
- **`config.py`** - Type-safe configuration using pydantic-settings
- **`api_client.py`** - HTTP client for LoL News API

#### API Layer (`src/api/`)

- **`app.py`** - FastAPI application with all HTTP endpoints

#### RSS Layer (`src/rss/`)

- **`generator.py`** - RSS 2.0 feed generation using feedgen
- **`feed_service.py`** - High-level feed service with caching

#### Services Layer (`src/services/`)

- **`update_service.py`** - News fetching and storage orchestration
- **`scheduler.py`** - Background job scheduling using APScheduler

#### Utilities (`src/utils/`)

- **`cache.py`** - TTL-based in-memory cache

---

## 3. Development Workflow

### Branching Strategy

```bash
main          # Production-ready code
  ├── develop # Integration branch
      ├── feature/new-source     # Feature branches
      ├── bugfix/cache-issue     # Bug fixes
      └── refactor/database-layer # Refactoring
```

**Branch naming convention:**
- `feature/short-description` - New features
- `bugfix/issue-description` - Bug fixes
- `refactor/component-name` - Code refactoring
- `docs/what-changed` - Documentation updates

### Code Style

We follow **PEP 8** with the following tools:

- **Black** - Code formatter (line length: 100)
- **Ruff** - Fast linter
- **mypy** - Static type checker

**Pre-commit checklist:**
```bash
# 1. Format code
black src/ tests/

# 2. Lint code
ruff check src/ tests/

# 3. Type check
mypy src/

# 4. Run tests
pytest --cov=src

# 5. Check coverage (aim for >80%)
pytest --cov=src --cov-report=term-missing
```

### Type Hints

All code MUST include type hints:

```python
# Good - Full type hints
async def fetch_news(locale: str = "en-us") -> List[Article]:
    """Fetch news articles."""
    articles: List[Article] = []
    return articles

# Bad - No type hints
async def fetch_news(locale="en-us"):
    articles = []
    return articles
```

### Running Tests

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_models.py

# Run specific test
pytest tests/test_models.py::test_article_creation

# Run with coverage
pytest --cov=src --cov-report=html

# Run only unit tests (fast)
pytest tests/ -k "not integration and not e2e and not performance"

# Run only integration tests
pytest tests/integration/

# Run end-to-end tests
pytest tests/e2e/

# Run performance tests
pytest tests/performance/
```

### Code Coverage

Current coverage target: **80%+**

```bash
# Generate HTML coverage report
pytest --cov=src --cov-report=html

# Open report in browser
# Windows
start htmlcov\index.html

# Linux/Mac
open htmlcov/index.html
```

### Pre-commit Hooks (Optional)

Install pre-commit hooks for automatic checks:

```bash
# Install pre-commit
pip install pre-commit

# Set up git hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

---

## 4. Key Concepts

### 4.1 Async/Await Usage

The project uses **async/await** extensively for I/O operations:

```python
# Database operations are async
repo = ArticleRepository("data/articles.db")
await repo.initialize()
articles = await repo.get_latest(limit=50)

# HTTP requests are async
client = LoLNewsAPIClient()
news = await client.fetch_news(locale="en-us")

# FastAPI endpoints are async
@app.get("/feed.xml")
async def get_feed():
    articles = await repository.get_latest()
    return generate_rss(articles)
```

**Why async?**
- Non-blocking I/O for better performance
- Handle multiple HTTP requests concurrently
- Efficient database operations
- Better resource utilization

**When to use sync vs async:**
- **Async**: Database operations, HTTP requests, file I/O
- **Sync**: Data transformations, calculations, serialization

### 4.2 Repository Pattern

Database access is abstracted through the repository pattern:

```python
class ArticleRepository:
    """Repository for article storage."""

    async def save(self, article: Article) -> bool:
        """Save single article."""
        pass

    async def save_many(self, articles: List[Article]) -> int:
        """Save multiple articles."""
        pass

    async def get_latest(self, limit: int = 50) -> List[Article]:
        """Get latest articles."""
        pass
```

**Benefits:**
- Decouples business logic from database details
- Easy to test with mock repositories
- Can swap database implementations
- Centralized data access logic

### 4.3 Service Layer

Business logic is organized in service classes:

```python
class FeedService:
    """High-level RSS feed service."""

    def __init__(self, repository: ArticleRepository, cache_ttl: int = 300):
        self.repository = repository
        self.cache = TTLCache(default_ttl_seconds=cache_ttl)

    async def get_main_feed(self, feed_url: str, limit: int = 50) -> str:
        """Get cached or generate main RSS feed."""
        # Check cache first
        cached = self.cache.get("main_feed")
        if cached:
            return cached

        # Generate fresh feed
        articles = await self.repository.get_latest(limit=limit)
        generator = RSSFeedGenerator()
        feed_xml = generator.generate_feed(articles, feed_url)

        # Cache it
        self.cache.set("main_feed", feed_xml)
        return feed_xml
```

### 4.4 Caching Strategy

Two-tier caching:

**1. API Client Cache (Build ID)**
```python
# Cache build IDs for 24 hours
self.cache.set("buildid_en-us", build_id, ttl_seconds=86400)
```

**2. Feed Service Cache (RSS XML)**
```python
# Cache generated RSS for 5 minutes
self.cache.set("main_feed", feed_xml, ttl_seconds=300)
```

**Cache invalidation:**
```python
# Clear all caches
feed_service.invalidate_cache()

# Clear specific cache
cache.delete("buildid_en-us")
```

### 4.5 RSS Generation

RSS 2.0 generation using feedgen:

```python
from src.rss.generator import RSSFeedGenerator

generator = RSSFeedGenerator(
    feed_title="LoL News",
    feed_link="https://www.leagueoflegends.com/news",
    feed_description="Latest news",
    language="en"
)

# Generate main feed
feed_xml = generator.generate_feed(articles, feed_url)

# Generate filtered feeds
feed_xml = generator.generate_feed_by_source(articles, ArticleSource.LOL_EN_US, feed_url)
feed_xml = generator.generate_feed_by_category(articles, "Champions", feed_url)
```

---

## 5. Adding New Features

### 5.1 Adding a New News Source

**Step 1: Update ArticleSource enum**

```python
# src/models.py
class ArticleSource(str, Enum):
    LOL_EN_US = "lol-en-us"
    LOL_IT_IT = "lol-it-it"
    LOL_FR_FR = "lol-fr-fr"  # NEW SOURCE
```

**Step 2: Update API client**

```python
# src/api_client.py
async def fetch_news(self, locale: str = "en-us") -> List[Article]:
    # Already supports any locale!
    # Just call with new locale: fetch_news("fr-fr")
    pass
```

**Step 3: Add configuration**

```python
# src/config.py
class Settings(BaseSettings):
    supported_locales: List[str] = ["en-us", "it-it", "fr-fr"]  # Add new locale
    feed_title_fr: str = "Actualités League of Legends"  # Optional
    feed_description_fr: str = "Dernières nouvelles de League of Legends"
```

**Step 4: Update API endpoint mapping**

```python
# src/api/app.py
source_map = {
    "en-us": ArticleSource.LOL_EN_US,
    "it-it": ArticleSource.LOL_IT_IT,
    "fr-fr": ArticleSource.LOL_FR_FR,  # Add mapping
}
```

**Step 5: Add tests**

```python
# tests/test_api_client.py
@pytest.mark.asyncio
async def test_fetch_news_french():
    client = LoLNewsAPIClient()
    articles = await client.fetch_news(locale="fr-fr")
    assert len(articles) > 0
    assert articles[0].source == ArticleSource.LOL_FR_FR
```

### 5.2 Adding a New API Endpoint

**Step 1: Define endpoint in app.py**

```python
# src/api/app.py
@app.get("/feed/recent.xml")
async def get_recent_feed(hours: int = 24) -> Response:
    """Get articles from last N hours."""
    try:
        service = get_feed_service()

        # Get recent articles
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)
        all_articles = await service.repository.get_latest(limit=200)
        recent = [a for a in all_articles if a.pub_date >= cutoff_time]

        # Generate feed
        generator = RSSFeedGenerator()
        feed_url = f"{settings.base_url}/feed/recent.xml"
        feed_xml = generator.generate_feed(recent, feed_url)

        return Response(
            content=feed_xml,
            media_type="application/rss+xml; charset=utf-8"
        )
    except Exception as e:
        logger.error(f"Error generating recent feed: {e}")
        raise HTTPException(status_code=500, detail="Error generating feed")
```

**Step 2: Add to root endpoint documentation**

```python
@app.get("/", response_class=PlainTextResponse)
async def root() -> str:
    return """LoL Stonks RSS Feed

Available endpoints:
...
- GET /feed/recent.xml?hours=24 - Recent articles (last N hours)
"""
```

**Step 3: Add tests**

```python
# tests/test_api.py
@pytest.mark.asyncio
async def test_recent_feed_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/feed/recent.xml?hours=48")
        assert response.status_code == 200
        assert "application/rss+xml" in response.headers["content-type"]
```

### 5.3 Extending the Database Schema

**Step 1: Update Article model**

```python
# src/models.py
@dataclass
class Article:
    # Existing fields...
    view_count: int = 0  # NEW FIELD

    def to_dict(self) -> Dict[str, Any]:
        data = {
            # Existing fields...
            'view_count': self.view_count,  # Add to serialization
        }
        return data
```

**Step 2: Update database schema**

```python
# src/database.py
async def initialize(self) -> None:
    async with aiosqlite.connect(self.db_path) as db:
        await db.execute('''
            CREATE TABLE IF NOT EXISTS articles (
                ...
                view_count INTEGER DEFAULT 0  -- NEW COLUMN
            )
        ''')
```

**Step 3: Migration for existing databases**

```python
# Create migration script: scripts/migrate_add_view_count.py
import asyncio
import aiosqlite

async def migrate():
    async with aiosqlite.connect("data/articles.db") as db:
        # Check if column exists
        cursor = await db.execute("PRAGMA table_info(articles)")
        columns = await cursor.fetchall()
        column_names = [col[1] for col in columns]

        if 'view_count' not in column_names:
            print("Adding view_count column...")
            await db.execute("ALTER TABLE articles ADD COLUMN view_count INTEGER DEFAULT 0")
            await db.commit()
            print("Migration complete!")
        else:
            print("Column already exists.")

if __name__ == "__main__":
    asyncio.run(migrate())
```

### 5.4 Adding Custom RSS Elements

```python
# src/rss/generator.py
def _add_article_entry(self, fg: FeedGenerator, article: Article) -> None:
    fe = fg.add_entry()

    # Existing elements...

    # Add custom namespace element
    fe.extend_ns({
        'custom': 'http://your-namespace.com/custom'
    })

    fe.custom.rating(article.rating)  # Custom element
    fe.custom.views(str(article.view_count))
```

---

## 6. Testing Guidelines

### Test Organization

- **Unit tests** (`tests/test_*.py`) - Fast, isolated, no external dependencies
- **Integration tests** (`tests/integration/`) - Test component interactions
- **E2E tests** (`tests/e2e/`) - Full workflow tests
- **Performance tests** (`tests/performance/`) - Load and speed tests
- **Validation tests** (`tests/validation/`) - RSS compliance tests

### Writing Unit Tests

```python
# tests/test_cache.py
import pytest
from src.utils.cache import TTLCache

def test_cache_basic_operations():
    """Test basic cache set/get operations."""
    cache = TTLCache(default_ttl_seconds=60)

    # Test set and get
    cache.set("key1", "value1")
    assert cache.get("key1") == "value1"

    # Test cache miss
    assert cache.get("nonexistent") is None

def test_cache_expiration():
    """Test that cache entries expire after TTL."""
    cache = TTLCache(default_ttl_seconds=1)

    cache.set("key", "value", ttl_seconds=1)
    assert cache.get("key") == "value"

    # Wait for expiration
    import time
    time.sleep(1.1)

    assert cache.get("key") is None
```

### Writing Integration Tests

```python
# tests/integration/test_api_integration.py
import pytest
from src.api_client import LoLNewsAPIClient
from src.database import ArticleRepository
from src.services.update_service import UpdateService

@pytest.mark.asyncio
async def test_fetch_and_store_workflow():
    """Test complete fetch and store workflow."""
    # Setup
    repo = ArticleRepository(":memory:")
    await repo.initialize()

    service = UpdateService(repo)

    # Fetch and store news
    stats = await service.update_all_sources()

    # Verify
    assert stats['total_fetched'] > 0
    assert stats['total_saved'] > 0

    # Check database
    articles = await repo.get_latest(limit=10)
    assert len(articles) > 0
```

### Mocking Patterns

```python
# tests/test_api_client.py
import pytest
from unittest.mock import AsyncMock, patch
from src.api_client import LoLNewsAPIClient

@pytest.mark.asyncio
async def test_fetch_news_mocked():
    """Test API client with mocked HTTP responses."""

    # Mock response data
    mock_response_data = {
        'pageProps': {
            'page': {
                'blades': [
                    {
                        'type': 'articleCardGrid',
                        'items': [
                            {
                                'title': 'Test Article',
                                'action': {'url': 'https://test.com'},
                                'publishedAt': '2025-12-28T10:00:00Z',
                                'description': {'body': 'Test'},
                                'category': {'title': 'News'}
                            }
                        ]
                    }
                ]
            }
        }
    }

    # Mock httpx client
    with patch('httpx.AsyncClient') as mock_client:
        mock_instance = mock_client.return_value.__aenter__.return_value
        mock_response = AsyncMock()
        mock_response.json.return_value = mock_response_data
        mock_response.status_code = 200
        mock_instance.get.return_value = mock_response

        # Test
        client = LoLNewsAPIClient()
        # Override get_build_id to avoid HTML parsing
        client.get_build_id = AsyncMock(return_value="test-build-id")

        articles = await client.fetch_news("en-us")

        assert len(articles) == 1
        assert articles[0].title == "Test Article"
```

### Performance Testing

```python
# tests/performance/test_performance.py
import pytest
import time
from src.rss.generator import RSSFeedGenerator
from src.models import Article, ArticleSource
from datetime import datetime

def test_rss_generation_performance():
    """RSS generation should complete in under 200ms for 100 articles."""
    # Create test articles
    articles = [
        Article(
            title=f"Article {i}",
            url=f"https://test.com/{i}",
            pub_date=datetime.now(),
            guid=f"test-{i}",
            source=ArticleSource.LOL_EN_US
        )
        for i in range(100)
    ]

    generator = RSSFeedGenerator()

    # Measure performance
    start = time.time()
    feed_xml = generator.generate_feed(articles, "http://test.com/feed.xml")
    elapsed = time.time() - start

    assert elapsed < 0.2, f"RSS generation took {elapsed:.3f}s (expected < 0.2s)"
    assert len(feed_xml) > 0
```

### RSS Validation Tests

```python
# tests/validation/test_rss_compliance.py
import pytest
import xml.etree.ElementTree as ET
from src.rss.generator import RSSFeedGenerator

def test_rss_valid_xml():
    """Generated RSS should be valid XML."""
    generator = RSSFeedGenerator()
    feed_xml = generator.generate_feed([], "http://test.com/feed.xml")

    # Should parse without errors
    root = ET.fromstring(feed_xml)
    assert root.tag == "rss"
    assert root.get("version") == "2.0"

def test_rss_required_channel_elements():
    """RSS channel should have all required elements."""
    generator = RSSFeedGenerator()
    feed_xml = generator.generate_feed([], "http://test.com/feed.xml")

    root = ET.fromstring(feed_xml)
    channel = root.find("channel")

    # Required elements
    assert channel.find("title") is not None
    assert channel.find("link") is not None
    assert channel.find("description") is not None
```

---

## 7. Debugging

### Logging Configuration

The project uses Python's logging module:

```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Set to DEBUG for development
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
```

**Log levels:**
- `DEBUG` - Detailed diagnostic information
- `INFO` - General informational messages
- `WARNING` - Warning messages
- `ERROR` - Error messages
- `CRITICAL` - Critical errors

**In .env:**
```env
LOG_LEVEL=DEBUG  # Development
LOG_LEVEL=INFO   # Production
```

### Common Issues

#### Issue: Database locked error

**Symptom:**
```
sqlite3.OperationalError: database is locked
```

**Solution:**
- Ensure you're using `async with` for all database operations
- Don't share connections across threads
- Use `aiosqlite` for async operations

```python
# Good
async with aiosqlite.connect(self.db_path) as db:
    await db.execute(...)

# Bad - Don't reuse connections
self.db = await aiosqlite.connect(self.db_path)  # Don't do this
```

#### Issue: 404 when fetching news

**Symptom:**
```
httpx.HTTPStatusError: 404 Not Found
```

**Solution:**
- Build ID might be stale (cached for 24 hours)
- Manually clear cache or wait for auto-retry
- Check if LoL website structure changed

```python
# Clear build ID cache
client.cache.delete("buildid_en-us")

# Fetch fresh build ID
build_id = await client.get_build_id("en-us")
```

#### Issue: Type checking errors

**Symptom:**
```
error: Incompatible return value type
```

**Solution:**
- Ensure all functions have proper return type hints
- Use `Optional[T]` for values that can be None
- Use `List[T]` instead of `list`

```python
# Good
def get_article() -> Optional[Article]:
    return None

async def get_articles() -> List[Article]:
    return []

# Bad
def get_article():
    return None
```

### Debug Tools

**1. Interactive Python Shell**
```bash
python -i
>>> from src.models import Article
>>> from src.database import ArticleRepository
>>> import asyncio
>>>
>>> async def test():
...     repo = ArticleRepository(":memory:")
...     await repo.initialize()
...     return await repo.count()
>>>
>>> asyncio.run(test())
```

**2. IPython (Enhanced Shell)**
```bash
pip install ipython
ipython
```

**3. Pytest Debugging**
```bash
# Run with print statements visible
pytest -s

# Drop into debugger on failure
pytest --pdb

# Drop into debugger on error
pytest --pdb --pdbcls=IPython.terminal.debugger:TerminalPdb
```

### VS Code Configuration

**`.vscode/launch.json`** - Debug configuration:
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: FastAPI",
            "type": "python",
            "request": "launch",
            "module": "uvicorn",
            "args": [
                "src.api.app:app",
                "--reload",
                "--port",
                "8000"
            ],
            "jinja": true,
            "justMyCode": false
        },
        {
            "name": "Python: Current File",
            "type": "python",
            "request": "launch",
            "program": "${file}",
            "console": "integratedTerminal",
            "justMyCode": false
        },
        {
            "name": "Python: Pytest",
            "type": "python",
            "request": "launch",
            "module": "pytest",
            "args": [
                "-v",
                "${file}"
            ],
            "console": "integratedTerminal",
            "justMyCode": false
        }
    ]
}
```

**`.vscode/settings.json`** - Python settings:
```json
{
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": false,
    "python.linting.flake8Enabled": false,
    "python.formatting.provider": "black",
    "python.formatting.blackArgs": ["--line-length", "100"],
    "editor.formatOnSave": true,
    "python.testing.pytestEnabled": true,
    "python.testing.unittestEnabled": false,
    "python.testing.pytestArgs": [
        "tests"
    ],
    "[python]": {
        "editor.codeActionsOnSave": {
            "source.organizeImports": true
        }
    }
}
```

---

## 8. Code Examples

### 8.1 Adding a New API Client

Create a client for a different news source:

```python
# src/valorant_client.py
import httpx
from typing import List
from src.models import Article, ArticleSource
import logging

logger = logging.getLogger(__name__)

class ValorantNewsClient:
    """Client for Valorant news API."""

    def __init__(self, base_url: str = "https://playvalorant.com"):
        self.base_url = base_url

    async def fetch_news(self, locale: str = "en-us") -> List[Article]:
        """
        Fetch Valorant news articles.

        Args:
            locale: Locale code (e.g., "en-us")

        Returns:
            List of Article instances
        """
        try:
            async with httpx.AsyncClient() as client:
                url = f"{self.base_url}/{locale}/news/"
                response = await client.get(url)
                response.raise_for_status()

                data = response.json()
                articles = self._parse_articles(data, locale)

                logger.info(f"Fetched {len(articles)} Valorant articles")
                return articles

        except httpx.HTTPError as e:
            logger.error(f"Error fetching Valorant news: {e}")
            return []

    def _parse_articles(self, data: dict, locale: str) -> List[Article]:
        """Parse API response into Article objects."""
        # Implementation depends on API structure
        pass
```

### 8.2 Creating a New Endpoint

Add a trending articles endpoint:

```python
# src/api/app.py

@app.get("/feed/trending.xml")
async def get_trending_feed(days: int = 7, limit: int = 20) -> Response:
    """
    Get trending articles feed.

    Trending = Most recent articles from the last N days.

    Args:
        days: Look back period (default: 7)
        limit: Maximum articles (default: 20)

    Returns:
        RSS feed with trending articles
    """
    try:
        service = get_feed_service()

        # Calculate cutoff date
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)

        # Get recent articles
        all_articles = await service.repository.get_latest(limit=200)
        trending = [a for a in all_articles if a.pub_date >= cutoff][:limit]

        # Generate feed
        generator = RSSFeedGenerator(
            feed_title=f"LoL Trending News (Last {days} Days)",
            feed_link=settings.rss_feed_link,
            feed_description=f"Trending League of Legends news from the last {days} days",
            language="en"
        )

        feed_url = f"{settings.base_url}/feed/trending.xml"
        feed_xml = generator.generate_feed(trending, feed_url)

        return Response(
            content=feed_xml,
            media_type="application/rss+xml; charset=utf-8",
            headers={
                "Cache-Control": f"public, max-age={settings.feed_cache_ttl}",
            }
        )

    except Exception as e:
        logger.error(f"Error generating trending feed: {e}")
        raise HTTPException(status_code=500, detail="Error generating trending feed")
```

### 8.3 Extending the Database

Add article view tracking:

```python
# src/database.py

class ArticleRepository:
    # Existing methods...

    async def increment_views(self, guid: str) -> None:
        """
        Increment view count for an article.

        Args:
            guid: Article GUID
        """
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                'UPDATE articles SET view_count = view_count + 1 WHERE guid = ?',
                (guid,)
            )
            await db.commit()
            logger.debug(f"Incremented views for article: {guid}")

    async def get_most_viewed(self, limit: int = 10) -> List[Article]:
        """
        Get most viewed articles.

        Args:
            limit: Maximum number of articles

        Returns:
            List of articles ordered by view count
        """
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute('''
                SELECT * FROM articles
                ORDER BY view_count DESC
                LIMIT ?
            ''', (limit,))

            rows = await cursor.fetchall()
            return [Article.from_dict(dict(row)) for row in rows]
```

### 8.4 Custom RSS Elements

Add custom metadata to RSS items:

```python
# src/rss/generator.py

from lxml import etree

class RSSFeedGenerator:
    # Existing methods...

    def _add_article_entry(self, fg: FeedGenerator, article: Article) -> None:
        """Add article with custom elements."""
        fe = fg.add_entry()

        # Standard RSS elements
        fe.id(article.guid)
        fe.title(article.title)
        fe.link(href=article.url)
        fe.pubDate(article.pub_date)

        # Custom namespace for LoL-specific data
        fe.register_namespace('lol', 'http://www.leagueoflegends.com/rss/1.0')

        # Add custom elements
        if hasattr(article, 'view_count'):
            fe.load_extension('lol')
            fe.lol.views(str(article.view_count))

        if hasattr(article, 'rating'):
            fe.lol.rating(str(article.rating))
```

---

## 9. Contributing

### Code Review Process

1. **Create feature branch** from `develop`
2. **Implement feature** with tests
3. **Run full test suite** and ensure passing
4. **Format and lint** code
5. **Create pull request** with description
6. **Address review comments**
7. **Merge** after approval

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation
- [ ] Performance improvement

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist
- [ ] Code follows PEP 8 style
- [ ] Type hints added
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Backward compatible

## Related Issues
Fixes #123
```

### Documentation Requirements

- **Docstrings** for all public functions/classes
- **Type hints** for all parameters and returns
- **Examples** in docstrings for complex functions
- **README updates** for new features
- **CHANGELOG updates** for all changes

### Testing Requirements

- **Unit tests** for all new functions
- **Integration tests** for new features
- **Coverage** must not decrease
- **All tests** must pass before merge

---

## 10. Tools and Commands

### UV Commands

```bash
# Create virtual environment
uv venv

# Install dependencies
uv pip install -r requirements.txt

# Install single package
uv pip install httpx

# Update package
uv pip install --upgrade feedgen

# List installed packages
uv pip list

# Show package info
uv pip show fastapi
```

### Pytest Commands

```bash
# Run all tests
pytest

# Verbose output
pytest -v

# Very verbose (show test names)
pytest -vv

# Run specific test file
pytest tests/test_models.py

# Run specific test
pytest tests/test_models.py::test_article_creation

# Run tests matching pattern
pytest -k "test_cache"

# Run with coverage
pytest --cov=src

# Coverage with missing lines
pytest --cov=src --cov-report=term-missing

# HTML coverage report
pytest --cov=src --cov-report=html

# Run tests in parallel (requires pytest-xdist)
pytest -n auto

# Stop on first failure
pytest -x

# Show local variables on failure
pytest -l

# Run last failed tests
pytest --lf

# Run tests with print output
pytest -s
```

### Docker Commands

```bash
# Build image
docker build -t lolstonksrss .

# Run container
docker run -p 8000:8000 lolstonksrss

# Run with environment file
docker run --env-file .env -p 8000:8000 lolstonksrss

# Run in background
docker run -d -p 8000:8000 lolstonksrss

# View logs
docker logs <container-id>

# Stop container
docker stop <container-id>

# Remove container
docker rm <container-id>

# Docker Compose
docker-compose up
docker-compose up -d  # Background
docker-compose down
docker-compose logs -f
```

### Code Quality Commands

```bash
# Format code
black src/ tests/

# Check formatting (no changes)
black --check src/ tests/

# Lint code
ruff check src/ tests/

# Fix auto-fixable issues
ruff check --fix src/ tests/

# Type check
mypy src/

# Type check specific file
mypy src/models.py

# Check all at once
black src/ tests/ && ruff check src/ tests/ && mypy src/ && pytest
```

### Development Server

```bash
# Run development server
python main.py

# Run with Uvicorn directly
uvicorn src.api.app:app --reload

# Run with custom port
uvicorn src.api.app:app --reload --port 8080

# Run with custom host
uvicorn src.api.app:app --reload --host 0.0.0.0
```

### Useful Scripts

**Database inspection:**
```bash
# Open SQLite shell
sqlite3 data/articles.db

# Count articles
sqlite3 data/articles.db "SELECT COUNT(*) FROM articles;"

# Show recent articles
sqlite3 data/articles.db "SELECT title, pub_date FROM articles ORDER BY pub_date DESC LIMIT 5;"

# Delete all articles
sqlite3 data/articles.db "DELETE FROM articles;"
```

**Quick tests:**
```bash
# Test database
python -c "import asyncio; from src.database import ArticleRepository; asyncio.run(ArticleRepository(':memory:').initialize())"

# Test API client
python examples/fetch_news_demo.py

# Test RSS generation
python examples/rss_demo.py
```

---

## Additional Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **feedgen Docs**: https://feedgen.kiesow.be/
- **aiosqlite Docs**: https://aiosqlite.omnilib.dev/
- **pytest Docs**: https://docs.pytest.org/
- **Black**: https://black.readthedocs.io/
- **mypy**: https://mypy.readthedocs.io/

---

## Getting Help

- Check the **README.md** for project overview
- Review **ARCHITECTURE.md** for design decisions
- Search existing **GitHub issues**
- Ask in team chat/Slack
- Create new issue with **bug** or **question** label

---

**Happy coding!**
