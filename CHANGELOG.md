# Changelog

All notable changes to the LoL Stonks RSS project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-29

### Added
- Initial release of LoL Stonks RSS feed generator
- Docker containerization support for Windows server deployment
- RSS 2.0 feed generation for League of Legends news
- Support for multiple LoL news sources (official blog, esports, PBE updates)
- Configurable feed refresh intervals
- HTTP server exposing RSS feed at /feed endpoint
- Health check endpoint for container monitoring
- Environment-based configuration for flexible deployment
- Comprehensive test suite with unit, integration, and E2E tests
- Docker Compose configuration for easy deployment
- Complete documentation (README, QUICKSTART, DEPLOYMENT guides)
- Example configurations and scripts
- UV package manager support for faster dependency management
- Scheduler system for automatic feed updates
- Caching layer for improved performance
- Logging configuration for production monitoring

### Security
- Non-root user execution in Docker containers
- Environment variable-based secret management
- Input validation and sanitization for all news sources

### Documentation
- Installation and setup guides
- Docker deployment instructions for Windows
- API endpoint documentation
- Contributing guidelines
- Project structure overview
- Deployment quickstart guide

[1.0.0]: https://github.com/yourusername/lolstonksrss/releases/tag/v1.0.0
