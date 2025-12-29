"""
Main entry point for LoL Stonks RSS server.

This module starts the FastAPI server using uvicorn with configuration
from the settings module.
"""

import logging

import uvicorn

from src.config import get_settings

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)


def main() -> None:
    """Run the FastAPI server."""
    settings = get_settings()

    logger.info(f"Starting server on {settings.host}:{settings.port}")

    uvicorn.run(
        "src.api.app:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
        log_level=settings.log_level.lower(),
    )


if __name__ == "__main__":
    main()
