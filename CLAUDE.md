# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Python application that generates an RSS feed for League of Legends news. The application is containerized with Docker and designed for deployment on a Windows server.

## Project Requirements

- **Language**: Python
- **Containerization**: Docker
- **Target Deployment**: Windows server
- **Functionality**: Fetch League of Legends news and generate an RSS feed

## Development Commands

### Docker Commands

```bash
# Build the Docker image
docker build -t lolstonksrss .

# Run the container
docker run -p 8000:8000 lolstonksrss

# Run with docker-compose (if available)
docker-compose up

# Stop containers
docker-compose down
```

### Python Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the application locally
python main.py

# Run tests (if test framework is added)
pytest

# Run single test
pytest tests/test_specific.py
```

## Architecture Notes

### RSS Feed Generation
- The application fetches League of Legends news from official sources or APIs
- News items are formatted into RSS 2.0 compatible XML format
- The RSS feed should be served via HTTP endpoint

### Docker Deployment
- Application runs as a containerized service
- Exposes HTTP port for RSS feed access
- Configuration should be handled via environment variables for flexibility on Windows deployment

### Data Flow
1. News fetching component retrieves latest LoL news
2. Parser/formatter converts news to RSS format
3. Web server exposes RSS feed at an endpoint
4. Feed updates periodically to show new content

## Windows Deployment Considerations

- Docker Desktop for Windows should be used on the target server
- Volume mounts may need Windows-style paths
- Port mappings should avoid conflicts with existing services
- Consider using environment variables for configuration rather than hardcoded paths
