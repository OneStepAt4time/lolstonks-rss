"""
FastAPI application for serving LoL Stonks RSS feeds.

This module provides HTTP endpoints for accessing RSS feeds with various filters
including source and category-based filtering.
"""

import logging
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, FileResponse

from src.config import get_settings
from src.database import ArticleRepository
from src.models import ArticleSource, Article
from src.rss.feed_service import FeedService
from src.services.scheduler import NewsScheduler

logger = logging.getLogger(__name__)
settings = get_settings()

# Global state for services
app_state: Dict[str, Any] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):  # type: ignore[no-untyped-def]
    """
    Application lifespan manager.

    Initializes repository and services on startup, cleans up on shutdown.

    Args:
        app: FastAPI application instance

    Yields:
        Control to the application
    """
    logger.info("Starting LoL Stonks RSS server...")

    # Initialize database repository
    repository = ArticleRepository(settings.database_path)
    await repository.initialize()

    # Initialize feed service
    feed_service = FeedService(repository=repository, cache_ttl=settings.feed_cache_ttl)

    # Initialize and start scheduler
    scheduler = NewsScheduler(repository, interval_minutes=settings.update_interval_minutes)
    scheduler.start()

    # Trigger initial update
    logger.info("Triggering initial update...")
    await scheduler.trigger_update_now()

    # Store in app state
    app_state["repository"] = repository
    app_state["feed_service"] = feed_service
    app_state["scheduler"] = scheduler

    logger.info("Server initialized successfully")

    yield

    # Cleanup
    scheduler.stop()
    await repository.close()
    logger.info("Server shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="LoL Stonks RSS",
    description="RSS feed aggregator for League of Legends news",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def get_feed_service() -> FeedService:
    """
    Get feed service from app state.

    Returns:
        FeedService instance

    Raises:
        HTTPException: If service is not initialized
    """
    service = app_state.get("feed_service")
    if not service:
        raise HTTPException(status_code=500, detail="Service not initialized")
    return service


@app.get("/api/articles", response_model=List[Dict[str, Any]])
async def get_articles(limit: int = 50, source: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Get latest articles as JSON for the frontend.
    
    Args:
        limit: Maximum number of articles
        source: Optional source filter
        
    Returns:
        List of articles as dictionaries
    """
    repo = app_state.get("repository")
    if not repo:
        raise HTTPException(status_code=500, detail="Repository not initialized")
    
    articles = await repo.get_latest(limit=limit, source=source)
    return [a.to_dict() for a in articles]


@app.get("/", response_class=FileResponse)
async def root() -> FileResponse:
    """
    Serve the frontend application.

    Returns:
        HTML file response
    """
    return FileResponse("src/api/static/index.html")


@app.get("/feed.xml", response_class=Response)
async def get_main_feed(limit: int = 50) -> Response:
    """
    Get main RSS feed with all articles from all sources.

    Args:
        limit: Maximum number of articles (default: 50, max: 200)

    Returns:
        RSS 2.0 XML feed

    Raises:
        HTTPException: If feed generation fails
    """
    try:
        # Validate limit
        limit = min(limit, 200)

        service = get_feed_service()

        # Generate feed URL (use request URL)
        feed_url = f"{settings.base_url}/feed.xml"

        # Get feed
        feed_xml = await service.get_main_feed(feed_url, limit=limit)

        return Response(
            content=feed_xml,
            media_type="application/rss+xml; charset=utf-8",
            headers={
                "Cache-Control": f"public, max-age={settings.feed_cache_ttl}",
                "Content-Type": "application/rss+xml; charset=utf-8",
            },
        )

    except Exception as e:
        logger.error(f"Error generating main feed: {e}")
        raise HTTPException(status_code=500, detail="Error generating feed")


@app.get("/feed/{source}.xml", response_class=Response)
async def get_source_feed(source: str, limit: int = 50) -> Response:
    """
    Get RSS feed filtered by source.

    Args:
        source: Source identifier (en-us, it-it)
        limit: Maximum number of articles (default: 50, max: 200)

    Returns:
        RSS 2.0 XML feed

    Raises:
        HTTPException: If source is invalid or feed generation fails
    """
    try:
        # Validate source
        source_map = {
            "en-us": ArticleSource.LOL_EN_US,
            "it-it": ArticleSource.LOL_IT_IT,
        }

        if source not in source_map:
            raise HTTPException(
                status_code=404,
                detail=f"Source '{source}' not found. Available: {list(source_map.keys())}",
            )

        # Validate limit
        limit = min(limit, 200)

        service = get_feed_service()

        # Generate feed
        feed_url = f"{settings.base_url}/feed/{source}.xml"
        feed_xml = await service.get_feed_by_source(source_map[source], feed_url, limit=limit)

        return Response(
            content=feed_xml,
            media_type="application/rss+xml; charset=utf-8",
            headers={
                "Cache-Control": f"public, max-age={settings.feed_cache_ttl}",
                "Content-Type": "application/rss+xml; charset=utf-8",
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating source feed for {source}: {e}")
        raise HTTPException(status_code=500, detail="Error generating feed")


@app.get("/feed/category/{category}.xml", response_class=Response)
async def get_category_feed(category: str, limit: int = 50) -> Response:
    """
    Get RSS feed filtered by category.

    Args:
        category: Category name (e.g., Champions, Patches, Media)
        limit: Maximum number of articles (default: 50, max: 200)

    Returns:
        RSS 2.0 XML feed

    Raises:
        HTTPException: If feed generation fails
    """
    try:
        # Validate limit
        limit = min(limit, 200)

        service = get_feed_service()

        # Generate feed
        feed_url = f"{settings.base_url}/feed/category/{category}.xml"
        feed_xml = await service.get_feed_by_category(category, feed_url, limit=limit)

        return Response(
            content=feed_xml,
            media_type="application/rss+xml; charset=utf-8",
            headers={
                "Cache-Control": f"public, max-age={settings.feed_cache_ttl}",
                "Content-Type": "application/rss+xml; charset=utf-8",
            },
        )

    except Exception as e:
        logger.error(f"Error generating category feed for {category}: {e}")
        raise HTTPException(status_code=500, detail="Error generating feed")


@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint.

    Returns service status and statistics.

    Returns:
        Dictionary with health status information
    """
    try:
        service = app_state.get("feed_service")
        repository = app_state.get("repository")

        if not service or not repository:
            return {"status": "unhealthy", "message": "Services not initialized"}

        # Get article count
        articles = await repository.get_latest(limit=1)

        return {
            "status": "healthy",
            "version": "1.0.0",
            "service": "LoL Stonks RSS",
            "database": "connected",
            "cache": "active",
            "has_articles": len(articles) > 0,
        }

    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "error": str(e)}


@app.post("/admin/refresh")
async def refresh_feeds() -> Dict[str, str]:
    """
    Manual feed cache refresh endpoint.

    Invalidates all feed caches.

    Returns:
        Dictionary with refresh status

    Raises:
        HTTPException: If refresh fails
    """
    try:
        service = get_feed_service()
        service.invalidate_cache()

        return {"status": "success", "message": "Feed cache invalidated"}

    except Exception as e:
        logger.error(f"Error refreshing feeds: {e}")
        raise HTTPException(status_code=500, detail="Error refreshing feeds")


@app.get("/admin/scheduler/status")
async def get_scheduler_status() -> Dict[str, Any]:
    """
    Get scheduler status and statistics.

    Returns:
        Dictionary with scheduler status, job information,
        and update service statistics

    Raises:
        HTTPException: If scheduler is not initialized
    """
    scheduler = app_state.get("scheduler")
    if not scheduler:
        raise HTTPException(status_code=500, detail="Scheduler not initialized")

    return scheduler.get_status()


@app.post("/admin/scheduler/trigger")
async def trigger_update() -> Dict[str, Any]:
    """
    Manually trigger news update.

    Forces an immediate update of all news sources,
    bypassing the scheduled interval.

    Returns:
        Update statistics dictionary with counts and timing

    Raises:
        HTTPException: If scheduler is not initialized
    """
    scheduler = app_state.get("scheduler")
    if not scheduler:
        raise HTTPException(status_code=500, detail="Scheduler not initialized")

    stats = await scheduler.trigger_update_now()
    return stats
