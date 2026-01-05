# Docker Guide for LoL Stonks RSS

This guide covers Docker-specific operations and best practices for the LoL Stonks RSS application.

## Quick Start

### Using Docker Compose (Recommended)

```powershell
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Using Docker Run

```powershell
# Build image
docker build -t lolstonksrss:latest .

# Run container
docker run -d `
  --name lolstonksrss `
  -p 8000:8000 `
  -v ${PWD}\data:/app/data `
  lolstonksrss:latest
```

## Docker Image Details

### Base Image
- **python:3.11-slim** - Minimal Debian-based Python image
- Optimized for size and security
- Regular security updates from Python official images

### Multi-Stage Build
The Dockerfile uses multi-stage builds to minimize image size:
- **Stage 1 (builder)**: Installs build dependencies and Python packages
- **Stage 2 (runtime)**: Copies only necessary files and runtime dependencies

### Security Features
- Runs as non-root user (`lolrss`, UID 1000)
- Minimal attack surface (slim base image)
- No unnecessary packages installed
- Health check configured

## Configuration

### Environment Variables

All configuration can be set via environment variables:

```yaml
environment:
  # Database
  - DATABASE_PATH=/app/data/articles.db

  # Server
  - HOST=0.0.0.0
  - PORT=8000
  - BASE_URL=http://localhost:8000

  # Logging
  - LOG_LEVEL=INFO

  # Updates
  - UPDATE_INTERVAL_MINUTES=30

  # RSS Configuration
  - RSS_FEED_TITLE=League of Legends News
  - RSS_FEED_DESCRIPTION=Latest LoL news and updates
  - RSS_MAX_ITEMS=50

  # Caching
  - CACHE_TTL_SECONDS=21600
  - BUILD_ID_CACHE_SECONDS=86400

  # Locales
  - SUPPORTED_LOCALES=en-us,en-gb,es-es,es-mx,fr-fr,de-de,it-it,pt-br,ru-ru,tr-tr,pl-pl,ja-jp,ko-kr,zh-cn,zh-tw,ar-ae,vi-vn,th-th,id-id,ph-ph
```

### Volume Mounts

```yaml
volumes:
  # Database persistence
  - ./data:/app/data

  # Custom configuration (optional)
  - ./.env:/app/.env:ro
```

## Docker Commands

### Building

```powershell
# Build with default tag
docker build -t lolstonksrss:latest .

# Build with custom tag
docker build -t lolstonksrss:v1.0.0 .

# Build with no cache
docker build --no-cache -t lolstonksrss:latest .

# Build for specific platform
docker build --platform linux/amd64 -t lolstonksrss:latest .
```

### Running

```powershell
# Run in foreground
docker run -p 8000:8000 lolstonksrss:latest

# Run in background (detached)
docker run -d -p 8000:8000 lolstonksrss:latest

# Run with custom name
docker run -d --name my-rss -p 8000:8000 lolstonksrss:latest

# Run with environment variables
docker run -d `
  -p 8000:8000 `
  -e LOG_LEVEL=DEBUG `
  -e UPDATE_INTERVAL_MINUTES=15 `
  lolstonksrss:latest

# Run with volume mount
docker run -d `
  -p 8000:8000 `
  -v ${PWD}\data:/app/data `
  lolstonksrss:latest

# Run with restart policy
docker run -d `
  --restart unless-stopped `
  -p 8000:8000 `
  lolstonksrss:latest
```

### Managing Containers

```powershell
# List running containers
docker ps

# List all containers
docker ps -a

# View logs
docker logs lolstonksrss
docker logs -f lolstonksrss  # Follow logs
docker logs --tail 100 lolstonksrss  # Last 100 lines

# Stop container
docker stop lolstonksrss

# Start container
docker start lolstonksrss

# Restart container
docker restart lolstonksrss

# Remove container
docker rm lolstonksrss
docker rm -f lolstonksrss  # Force remove running container
```

### Inspecting

```powershell
# Container details
docker inspect lolstonksrss

# Container stats
docker stats lolstonksrss

# Container processes
docker top lolstonksrss

# Container health
docker inspect --format='{{.State.Health.Status}}' lolstonksrss
```

### Executing Commands

```powershell
# Access shell
docker exec -it lolstonksrss /bin/bash

# Run Python command
docker exec lolstonksrss python -c "print('Hello')"

# Check Python version
docker exec lolstonksrss python --version

# Test health endpoint
docker exec lolstonksrss curl http://localhost:8000/health
```

## Docker Compose Commands

```powershell
# Start services
docker-compose up
docker-compose up -d  # Detached mode

# Build and start
docker-compose up --build

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs
docker-compose logs -f  # Follow logs
docker-compose logs -f lolstonksrss  # Specific service

# Restart services
docker-compose restart

# View running services
docker-compose ps

# Execute command in service
docker-compose exec lolstonksrss /bin/bash

# Build services
docker-compose build
docker-compose build --no-cache
```

## Health Checks

### Built-in Health Check

The container includes a health check that runs every 30 seconds:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()" || exit 1
```

### Manual Health Check

```powershell
# Check container health status
docker inspect --format='{{.State.Health.Status}}' lolstonksrss

# View health check history
docker inspect --format='{{json .State.Health}}' lolstonksrss | ConvertFrom-Json

# Test health endpoint
Invoke-WebRequest -Uri http://localhost:8000/health
```

## Troubleshooting

### Container Exits Immediately

```powershell
# View container logs
docker logs lolstonksrss

# Check exit code
docker inspect --format='{{.State.ExitCode}}' lolstonksrss

# Run with interactive terminal to see errors
docker run -it lolstonksrss:latest
```

### Permission Issues

```powershell
# Check container user
docker exec lolstonksrss whoami

# Check file permissions
docker exec lolstonksrss ls -la /app/data

# Fix host directory permissions
icacls ".\data" /grant Everyone:(OI)(CI)F /T
```

### Network Issues

```powershell
# Check if container is on correct network
docker network inspect lolrss_network

# Test connectivity from container
docker exec lolstonksrss curl https://www.leagueoflegends.com

# Check port mapping
docker port lolstonksrss
```

### Database Issues

```powershell
# Check if database file exists
docker exec lolstonksrss ls -la /app/data/articles.db

# Check database permissions
docker exec lolstonksrss stat /app/data/articles.db

# Access database
docker exec -it lolstonksrss sqlite3 /app/data/articles.db
```

## Performance Optimization

### Image Size Optimization

Current optimizations:
- Multi-stage build
- Slim base image
- .dockerignore file
- No unnecessary packages
- Cleaned apt cache

### Runtime Optimization

```yaml
# Add resource limits in docker-compose.yml
services:
  lolstonksrss:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Build Cache

```powershell
# Use build cache (faster builds)
docker build -t lolstonksrss:latest .

# Ignore cache (clean build)
docker build --no-cache -t lolstonksrss:latest .

# Use BuildKit for faster builds
$env:DOCKER_BUILDKIT=1
docker build -t lolstonksrss:latest .
```

## Security Best Practices

### 1. Non-Root User
Container runs as user `lolrss` (UID 1000), not root.

### 2. Read-Only Filesystem (Optional)
```yaml
services:
  lolstonksrss:
    read_only: true
    tmpfs:
      - /tmp
    volumes:
      - ./data:/app/data  # Writable volume
```

### 3. No New Privileges
```yaml
services:
  lolstonksrss:
    security_opt:
      - no-new-privileges:true
```

### 4. Limit Capabilities
```yaml
services:
  lolstonksrss:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE  # Only if needed
```

### 5. Network Isolation
```yaml
networks:
  lolrss_network:
    driver: bridge
    internal: true  # No external access
```

## Maintenance

### Updates

```powershell
# Pull new base image
docker pull python:3.11-slim

# Rebuild with new base
docker-compose build --no-cache

# Restart with new image
docker-compose up -d
```

### Cleanup

```powershell
# Remove unused images
docker image prune

# Remove unused containers
docker container prune

# Remove unused volumes
docker volume prune

# Full cleanup (careful!)
docker system prune -a
```

### Backup

```powershell
# Export container
docker export lolstonksrss > lolstonksrss-backup.tar

# Save image
docker save lolstonksrss:latest > lolstonksrss-image.tar

# Backup data volume
docker run --rm `
  -v lolstonksrss_data:/data `
  -v ${PWD}:/backup `
  alpine tar czf /backup/data-backup.tar.gz /data
```

## Advanced Usage

### Multi-Container Setup

```yaml
version: '3.8'
services:
  app:
    build: .
    depends_on:
      - redis
    environment:
      - REDIS_URL=redis://redis:6379

  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

### Development vs Production

```yaml
# docker-compose.dev.yml
services:
  lolstonksrss:
    build:
      target: development
    environment:
      - LOG_LEVEL=DEBUG
      - RELOAD=true
    volumes:
      - ./src:/app/src  # Live code reload

# docker-compose.prod.yml
services:
  lolstonksrss:
    image: lolstonksrss:latest
    restart: always
    environment:
      - LOG_LEVEL=WARNING
```

### Custom Networks

```powershell
# Create network
docker network create lolrss_custom

# Run with custom network
docker run -d `
  --network lolrss_custom `
  --name lolstonksrss `
  lolstonksrss:latest
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build image
        run: docker build -t lolstonksrss:latest .
      - name: Run tests
        run: docker run lolstonksrss:latest pytest
```

## Useful Links

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Python Docker Images](https://hub.docker.com/_/python)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
