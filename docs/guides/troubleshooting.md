# Troubleshooting Guide

Complete problem-solving guide for LoL Stonks RSS deployment and operation.

## Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [Application Issues](#application-issues)
3. [Feed Update Issues](#feed-update-issues)
4. [RSS Feed Problems](#rss-feed-problems)
5. [Docker Issues](#docker-issues)
6. [Windows-Specific Issues](#windows-specific-issues)
7. [Database Problems](#database-problems)
8. [Performance Issues](#performance-issues)
9. [Network & Connectivity](#network--connectivity)
10. [Error Messages Reference](#error-messages-reference)
11. [Recovery Procedures](#recovery-procedures)
12. [Getting Help](#getting-help)

---

## Quick Diagnostics

### Essential Health Checks

Run these commands first to identify the problem area:

```powershell
# 1. Check if container is running
docker ps | Select-String "lolstonksrss"

# 2. Check application health
Invoke-WebRequest -Uri http://localhost:8000/health

# 3. View recent logs
docker logs --tail 50 lolstonksrss

# 4. Check scheduler status
Invoke-WebRequest -Uri http://localhost:8000/admin/scheduler/status

# 5. Test RSS feed
Invoke-WebRequest -Uri http://localhost:8000/feed.xml
```

### Diagnostic Output Interpretation

**Container Status:**
- Running = Container is up
- Exited = Container crashed (check logs)
- Not found = Container not created

**Health Endpoint:**
- Status 200 + "healthy" = All systems operational
- Status 500 = Internal error (check logs)
- Connection refused = Service not started

**Logs:**
- "Server initialized successfully" = Startup complete
- "Error" or "Exception" = Problem occurred
- No output = Container may not be starting

---

## Application Issues

### Issue: Application Won't Start

**Symptoms:**
- Container starts then immediately exits
- Health check never passes
- No response on port 8000

**Solution Steps:**

1. **Check container logs:**
```powershell
docker logs lolstonksrss
```

2. **Look for specific errors:**
   - "Port already in use" - See [Port Conflicts](#port-already-in-use)
   - "Permission denied" - See [Permission Issues](#permission-denied)
   - "ModuleNotFoundError" - Dependencies missing, rebuild image
   - "Database locked" - See [Database Locked](#database-locked)

3. **Verify environment configuration:**
```powershell
docker inspect lolstonksrss | Select-String "Env"
```

4. **Try running interactively to see startup errors:**
```powershell
docker run -it --rm -p 8000:8000 lolstonksrss:latest
```

5. **Rebuild image if dependencies corrupted:**
```powershell
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Issue: Port Already in Use

**Symptoms:**
- Error: "Address already in use"
- Container fails to start
- Port 8000 conflict

**Solution:**

1. **Find process using port 8000:**
```powershell
netstat -ano | Select-String ":8000"
```

2. **Kill the conflicting process:**
```powershell
# Replace <PID> with actual process ID from netstat
Stop-Process -Id <PID> -Force
```

3. **Or change the port mapping:**

Edit `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # Use port 8001 on host instead
```

Then restart:
```powershell
docker-compose up -d
```

Access on new port: `http://localhost:8001`

### Issue: Permission Denied

**Symptoms:**
- Cannot write to database
- "Permission denied" in logs
- Database operations fail

**Solution:**

1. **Fix data directory permissions (Windows):**
```powershell
icacls ".\data" /grant Everyone:(OI)(CI)F /T
```

2. **Ensure data directory exists:**
```powershell
New-Item -Path ".\data" -ItemType Directory -Force
```

3. **Check container user permissions:**
```powershell
docker exec lolstonksrss ls -la /app/data
```

4. **If running Docker on WSL, fix WSL permissions:**
```powershell
wsl --shutdown
# Restart Docker Desktop
```

### Issue: Missing Dependencies

**Symptoms:**
- "ModuleNotFoundError" in logs
- Import errors
- Container crashes on startup

**Solution:**

1. **Verify requirements.txt is complete:**
```powershell
cat requirements.txt
```

2. **Rebuild image with no cache:**
```powershell
docker-compose build --no-cache
docker-compose up -d
```

3. **Check Python version in container:**
```powershell
docker exec lolstonksrss python --version
```

Should be Python 3.11.x

### Issue: Configuration Errors

**Symptoms:**
- "Configuration error" in logs
- Invalid settings
- Environment variables not loading

**Solution:**

1. **Check .env file exists:**
```powershell
Test-Path .env
```

2. **Verify .env file format:**
```powershell
cat .env
```

Ensure no quotes around values, no spaces around `=`

3. **Check environment variables in container:**
```powershell
docker exec lolstonksrss env | Select-String "DATABASE_PATH"
```

4. **Override via docker-compose:**

Edit `docker-compose.yml` environment section:
```yaml
environment:
  - DATABASE_PATH=/app/data/articles.db
  - LOG_LEVEL=DEBUG  # For more detailed logs
```

---

## Feed Update Issues

### Issue: Feeds Not Updating

**Symptoms:**
- No new articles appearing
- Old articles only
- Stale feed content

**Diagnosis:**

1. **Check scheduler status:**
```powershell
$status = Invoke-WebRequest -Uri http://localhost:8000/admin/scheduler/status | ConvertFrom-Json
$status
```

Look for:
- `running: true` - Scheduler is active
- `next_run` - When next update scheduled
- `last_update` - When last update occurred

2. **Check update service statistics:**
```powershell
$status = Invoke-WebRequest -Uri http://localhost:8000/admin/scheduler/status | ConvertFrom-Json
$status.update_service
```

**Solutions:**

1. **Manually trigger update:**
```powershell
Invoke-WebRequest -Uri http://localhost:8000/admin/scheduler/trigger -Method POST
```

2. **Check for API errors in logs:**
```powershell
docker logs lolstonksrss | Select-String "Error"
```

3. **Verify network connectivity:**
```powershell
docker exec lolstonksrss curl https://www.leagueoflegends.com
```

4. **Increase update frequency (if too long):**

Edit `.env`:
```env
UPDATE_INTERVAL_MINUTES=15  # Update every 15 minutes
```

Restart container:
```powershell
docker-compose restart
```

### Issue: Scheduler Not Running

**Symptoms:**
- Scheduler status shows `running: false`
- No scheduled jobs
- Updates never trigger

**Solution:**

1. **Check application startup logs:**
```powershell
docker logs lolstonksrss | Select-String "Scheduler"
```

Should see: "Scheduler started successfully"

2. **Restart container:**
```powershell
docker-compose restart
```

3. **Check for scheduler errors:**
```powershell
docker logs lolstonksrss | Select-String "scheduler"
```

4. **Verify APScheduler is installed:**
```powershell
docker exec lolstonksrss pip show apscheduler
```

### Issue: API Errors

**Symptoms:**
- "Error updating en-us" in logs
- HTTP 4xx or 5xx errors
- Network timeouts

**Diagnosis:**

```powershell
docker logs lolstonksrss | Select-String "Error updating"
```

**Solutions:**

1. **Check LoL API status:**

Test manually:
```powershell
Invoke-WebRequest -Uri "https://www.leagueoflegends.com/en-us/news/"
```

2. **Check BuildID cache issues:**

BuildID cache may be stale. Clear and retry:
```powershell
Invoke-WebRequest -Uri http://localhost:8000/admin/refresh -Method POST
Invoke-WebRequest -Uri http://localhost:8000/admin/scheduler/trigger -Method POST
```

3. **Network connectivity from container:**
```powershell
docker exec lolstonksrss curl -I https://www.leagueoflegends.com
```

4. **Check DNS resolution:**
```powershell
docker exec lolstonksrss nslookup www.leagueoflegends.com
```

5. **Increase timeout settings:**

Edit `src/api_client.py` (requires rebuild):
- Increase request timeout values
- Rebuild: `docker-compose build --no-cache`

### Issue: BuildID Cache Problems

**Symptoms:**
- "Failed to get BuildID" errors
- Stale BuildID used
- API requests failing

**Solution:**

1. **Clear cache and force update:**
```powershell
# Clear feed cache
Invoke-WebRequest -Uri http://localhost:8000/admin/refresh -Method POST

# Trigger immediate update
Invoke-WebRequest -Uri http://localhost:8000/admin/scheduler/trigger -Method POST
```

2. **Check cache TTL settings:**

Verify in `.env`:
```env
BUILD_ID_CACHE_SECONDS=86400  # 24 hours
CACHE_TTL_SECONDS=21600       # 6 hours
```

3. **Restart container to reset all caches:**
```powershell
docker-compose restart
```

---

## RSS Feed Problems

### Issue: Invalid XML

**Symptoms:**
- RSS readers show "Invalid feed"
- XML parsing errors
- Malformed feed

**Diagnosis:**

1. **Download and validate feed:**
```powershell
$xml = Invoke-WebRequest -Uri http://localhost:8000/feed.xml
$xml.Content | Out-File -FilePath feed.xml
```

2. **Check for XML errors:**
- Open in browser (will show XML parsing errors)
- Use online validator: https://validator.w3.org/feed/

**Solutions:**

1. **Check for encoding issues:**
```powershell
docker logs lolstonksrss | Select-String "encoding"
```

2. **Test specific feeds:**
```powershell
# Test English feed
Invoke-WebRequest -Uri http://localhost:8000/feed/en-us.xml

# Test Italian feed
Invoke-WebRequest -Uri http://localhost:8000/feed/it-it.xml

# Test category feed
Invoke-WebRequest -Uri http://localhost:8000/feed/category/Champions.xml
```

3. **Regenerate feeds:**
```powershell
Invoke-WebRequest -Uri http://localhost:8000/admin/refresh -Method POST
```

### Issue: Missing Articles

**Symptoms:**
- Feed has fewer articles than expected
- Some news items not appearing
- Empty feeds

**Diagnosis:**

1. **Check article count in database:**
```powershell
docker exec lolstonksrss sqlite3 /app/data/articles.db "SELECT COUNT(*) FROM articles;"
```

2. **Check by source:**
```powershell
docker exec lolstonksrss sqlite3 /app/data/articles.db "SELECT source, COUNT(*) FROM articles GROUP BY source;"
```

3. **Check feed limit:**
```powershell
$feed = Invoke-WebRequest -Uri "http://localhost:8000/feed.xml?limit=100"
```

**Solutions:**

1. **Increase RSS feed limit:**

In `.env`:
```env
RSS_MAX_ITEMS=100  # Show up to 100 articles
```

2. **Force full update:**
```powershell
Invoke-WebRequest -Uri http://localhost:8000/admin/scheduler/trigger -Method POST
```

3. **Check for filtering issues:**

Try different endpoints:
```powershell
# Main feed (all sources)
Invoke-WebRequest -Uri http://localhost:8000/feed.xml

# Source-specific
Invoke-WebRequest -Uri http://localhost:8000/feed/en-us.xml
```

### Issue: Duplicate Articles

**Symptoms:**
- Same article appears multiple times
- Duplicate GUIDs
- Feed shows repeats

**Diagnosis:**

```powershell
# Check for duplicates in database
docker exec lolstonksrss sqlite3 /app/data/articles.db "SELECT guid, COUNT(*) FROM articles GROUP BY guid HAVING COUNT(*) > 1;"
```

**Solutions:**

1. **Database has uniqueness constraint**, duplicates shouldn't exist
2. **If found, rebuild database:**
```powershell
# Backup current database
Copy-Item .\data\articles.db .\data\articles.db.backup

# Stop container
docker-compose down

# Delete database
Remove-Item .\data\articles.db

# Restart (will recreate database)
docker-compose up -d
```

3. **Force update to repopulate:**
```powershell
Invoke-WebRequest -Uri http://localhost:8000/admin/scheduler/trigger -Method POST
```

### Issue: Character Encoding Problems

**Symptoms:**
- Special characters showing as `?` or boxes
- Accented characters broken
- Non-ASCII text corrupted

**Solution:**

1. **Check feed content-type header:**
```powershell
$response = Invoke-WebRequest -Uri http://localhost:8000/feed.xml
$response.Headers["Content-Type"]
```

Should be: `application/rss+xml; charset=utf-8`

2. **Feed uses UTF-8 by default** - if issues persist, check logs:
```powershell
docker logs lolstonksrss | Select-String "encoding"
```

3. **Test with curl:**
```powershell
curl -i http://localhost:8000/feed.xml
```

---

## Docker Issues

### Issue: Container Won't Start

**Symptoms:**
- `docker ps` shows no lolstonksrss container
- Container exits immediately
- Status shows "Exited (1)"

**Diagnosis:**

1. **Check all containers:**
```powershell
docker ps -a | Select-String "lolstonksrss"
```

2. **Check exit code:**
```powershell
docker inspect --format='{{.State.ExitCode}}' lolstonksrss
```

Exit codes:
- `0` = Clean exit (unexpected for server)
- `1` = General error
- `137` = Out of memory (killed)
- `139` = Segmentation fault

3. **View logs:**
```powershell
docker logs lolstonksrss
```

**Solutions:**

1. **Try interactive mode:**
```powershell
docker run -it --rm -p 8000:8000 lolstonksrss:latest
```

2. **Rebuild image:**
```powershell
docker-compose build --no-cache
docker-compose up
```

3. **Check Docker daemon:**
```powershell
docker info
```

### Issue: Volume Permission Errors

**Symptoms:**
- Cannot access `/app/data` in container
- "Permission denied" writing to database
- Volume mount fails

**Solution:**

1. **Windows: Fix host directory permissions:**
```powershell
icacls ".\data" /grant Everyone:(OI)(CI)F /T
```

2. **Check volume mount:**
```powershell
docker inspect lolstonksrss | Select-String "Mounts" -Context 0,10
```

3. **Recreate volume:**
```powershell
docker-compose down -v
docker-compose up -d
```

4. **Verify mount inside container:**
```powershell
docker exec lolstonksrss ls -la /app/data
```

### Issue: Network Issues

**Symptoms:**
- Cannot access application on localhost:8000
- Health check timeout
- Connection refused

**Diagnosis:**

1. **Check port mapping:**
```powershell
docker port lolstonksrss
```

Should show: `8000/tcp -> 0.0.0.0:8000`

2. **Check network:**
```powershell
docker network inspect lolrss_network
```

3. **Test from inside container:**
```powershell
docker exec lolstonksrss curl http://localhost:8000/health
```

**Solutions:**

1. **Verify container is on correct network:**
```powershell
docker inspect lolstonksrss | Select-String "Networks" -Context 0,5
```

2. **Recreate network:**
```powershell
docker-compose down
docker network rm lolrss_network
docker-compose up -d
```

3. **Check Windows Firewall:**
```powershell
Get-NetFirewallRule -DisplayName "LoL Stonks RSS"
```

Add rule if missing:
```powershell
New-NetFirewallRule `
  -DisplayName "LoL Stonks RSS" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 8000 `
  -Action Allow
```

### Issue: Health Check Failing

**Symptoms:**
- Container status shows "unhealthy"
- Health check never passes
- Container restarts repeatedly

**Diagnosis:**

```powershell
# Check health status
docker inspect --format='{{.State.Health.Status}}' lolstonksrss

# View health check history
docker inspect --format='{{json .State.Health}}' lolstonksrss | ConvertFrom-Json
```

**Solutions:**

1. **Test health endpoint manually:**
```powershell
docker exec lolstonksrss python -c "import urllib.request; print(urllib.request.urlopen('http://localhost:8000/health').read())"
```

2. **Check application is listening:**
```powershell
docker exec lolstonksrss netstat -tlnp
```

Should show port 8000 listening

3. **Increase health check timeout:**

Edit `docker-compose.yml`:
```yaml
healthcheck:
  interval: 30s
  timeout: 20s  # Increase from 10s
  start_period: 60s  # Increase from 40s
  retries: 3
```

4. **Check logs during health check:**
```powershell
docker logs -f lolstonksrss
# In another terminal:
docker exec lolstonksrss curl http://localhost:8000/health
```

---

## Windows-Specific Issues

### Issue: Firewall Blocking

**Symptoms:**
- Can access from localhost but not from other machines
- External access denied
- Timeout from network

**Solution:**

1. **Check existing firewall rules:**
```powershell
Get-NetFirewallRule -DisplayName "LoL Stonks RSS"
```

2. **Add firewall rule:**
```powershell
New-NetFirewallRule `
  -DisplayName "LoL Stonks RSS" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 8000 `
  -Action Allow `
  -Profile Domain,Private,Public
```

3. **Verify rule is active:**
```powershell
Get-NetFirewallRule -DisplayName "LoL Stonks RSS" | Get-NetFirewallPortFilter
```

4. **Test from another machine:**
```powershell
# From another computer on network
curl http://<SERVER-IP>:8000/health
```

### Issue: WSL 2 Problems

**Symptoms:**
- Docker Desktop not starting
- "WSL 2 installation is incomplete"
- Performance issues

**Solution:**

1. **Update WSL:**
```powershell
wsl --update
```

2. **Set WSL 2 as default:**
```powershell
wsl --set-default-version 2
```

3. **Restart WSL:**
```powershell
wsl --shutdown
# Restart Docker Desktop
```

4. **Check WSL status:**
```powershell
wsl --list --verbose
```

5. **Install WSL if missing:**
```powershell
wsl --install
```

### Issue: Path Issues (Windows Paths)

**Symptoms:**
- Volume mount fails
- Cannot find files
- Path format errors

**Solution:**

1. **Use PowerShell (not cmd):**
```powershell
# Good (PowerShell)
docker run -v ${PWD}\data:/app/data

# Also good (explicit path)
docker run -v C:\lolstonksrss\data:/app/data
```

2. **In docker-compose, use relative paths:**
```yaml
volumes:
  - ./data:/app/data  # Works on Windows & Linux
```

3. **Avoid mixing path styles:**
```powershell
# Don't mix / and \
# Use consistent separators
```

### Issue: Service Installation

**Symptoms:**
- Container doesn't auto-start on reboot
- Manual start required
- Service not running

**Solution using Docker restart policy:**

1. **Already configured in docker-compose.yml:**
```yaml
restart: unless-stopped
```

2. **Verify restart policy:**
```powershell
docker inspect lolstonksrss | Select-String "RestartPolicy" -Context 0,3
```

3. **Update restart policy if needed:**
```powershell
docker update --restart unless-stopped lolstonksrss
```

**Solution using NSSM (Windows Service):**

1. **Download NSSM:** https://nssm.cc/download

2. **Install service:**
```powershell
nssm install LolStonksRSS "C:\Program Files\Docker\Docker\resources\bin\docker-compose.exe"
nssm set LolStonksRSS AppDirectory "C:\lolstonksrss"
nssm set LolStonksRSS AppParameters "up"
nssm start LolStonksRSS
```

3. **Check service status:**
```powershell
Get-Service LolStonksRSS
```

---

## Database Problems

### Issue: Database Locked

**Symptoms:**
- "database is locked" error
- Write operations fail
- SQLite timeout errors

**Diagnosis:**

```powershell
# Check if multiple containers accessing database
docker ps -a | Select-String "lolstonksrss"
```

**Solutions:**

1. **Ensure only one container running:**
```powershell
# Stop all instances
docker stop $(docker ps -a -q --filter name=lolstonksrss)

# Remove old containers
docker rm $(docker ps -a -q --filter name=lolstonksrss)

# Start fresh
docker-compose up -d
```

2. **Check for zombie processes:**
```powershell
# On host
Get-Process | Select-String "sqlite"

# In container
docker exec lolstonksrss ps aux | grep sqlite
```

3. **Reset database (last resort):**
```powershell
# Backup first
Copy-Item .\data\articles.db .\data\articles.db.backup

# Stop container
docker-compose down

# Remove database
Remove-Item .\data\articles.db

# Restart
docker-compose up -d
```

### Issue: Database Corruption

**Symptoms:**
- "malformed database" error
- Integrity check fails
- Unexpected data

**Diagnosis:**

```powershell
docker exec lolstonksrss sqlite3 /app/data/articles.db "PRAGMA integrity_check;"
```

**Solutions:**

1. **Try recovery:**
```powershell
docker exec lolstonksrss sqlite3 /app/data/articles.db "PRAGMA integrity_check; PRAGMA quick_check;"
```

2. **Dump and restore:**
```powershell
# Backup
docker exec lolstonksrss sqlite3 /app/data/articles.db .dump > backup.sql

# Recreate
docker-compose down
Remove-Item .\data\articles.db
docker-compose up -d

# Wait for initialization
Start-Sleep -Seconds 10

# Restore data (if dump worked)
Get-Content backup.sql | docker exec -i lolstonksrss sqlite3 /app/data/articles.db
```

3. **Start fresh (lose data):**
```powershell
docker-compose down
Remove-Item .\data\articles.db
docker-compose up -d
```

### Issue: Database Growing Too Large

**Symptoms:**
- Database file size increasing rapidly
- Slow queries
- Disk space issues

**Diagnosis:**

```powershell
# Check database size
Get-ChildItem .\data\articles.db

# Check row count
docker exec lolstonksrss sqlite3 /app/data/articles.db "SELECT COUNT(*) FROM articles;"
```

**Solutions:**

1. **Vacuum database to reclaim space:**
```powershell
docker exec lolstonksrss sqlite3 /app/data/articles.db "VACUUM;"
```

2. **Delete old articles:**
```powershell
# Keep only last 1000 articles
docker exec lolstonksrss sqlite3 /app/data/articles.db "DELETE FROM articles WHERE id NOT IN (SELECT id FROM articles ORDER BY pub_date DESC LIMIT 1000);"

# Vacuum after delete
docker exec lolstonksrss sqlite3 /app/data/articles.db "VACUUM;"
```

3. **Check for duplicate data:**
```powershell
docker exec lolstonksrss sqlite3 /app/data/articles.db "SELECT guid, COUNT(*) FROM articles GROUP BY guid HAVING COUNT(*) > 1;"
```

---

## Performance Issues

### Issue: Slow Feed Generation

**Symptoms:**
- RSS feed takes long to load
- Timeout errors
- Slow response times

**Diagnosis:**

```powershell
# Time the request
Measure-Command { Invoke-WebRequest -Uri http://localhost:8000/feed.xml }
```

**Solutions:**

1. **Check cache is working:**
```powershell
# First request (slow - generates feed)
Measure-Command { Invoke-WebRequest -Uri http://localhost:8000/feed.xml }

# Second request (fast - cached)
Measure-Command { Invoke-WebRequest -Uri http://localhost:8000/feed.xml }
```

Should be much faster on second request (< 100ms)

2. **Reduce RSS feed size:**

In `.env`:
```env
RSS_MAX_ITEMS=20  # Reduce from 50
FEED_CACHE_TTL=600  # Cache for 10 minutes
```

3. **Check database performance:**
```powershell
docker exec lolstonksrss sqlite3 /app/data/articles.db "ANALYZE;"
```

4. **Monitor container resources:**
```powershell
docker stats lolstonksrss
```

### Issue: High Memory Usage

**Symptoms:**
- Container using excessive RAM
- Memory warnings in logs
- Container killed by system

**Diagnosis:**

```powershell
docker stats lolstonksrss --no-stream
```

**Solutions:**

1. **Set memory limits:**

Edit `docker-compose.yml`:
```yaml
services:
  lolstonksrss:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

2. **Check for memory leaks:**
```powershell
# Monitor over time
docker stats lolstonksrss
```

3. **Restart periodically if needed:**
```powershell
# Create scheduled task to restart daily
$action = New-ScheduledTaskAction -Execute "docker" -Argument "restart lolstonksrss"
$trigger = New-ScheduledTaskTrigger -Daily -At 3am
Register-ScheduledTask -TaskName "Restart LoL RSS" -Action $action -Trigger $trigger
```

### Issue: High CPU Usage

**Symptoms:**
- CPU consistently high
- Container using excessive CPU
- System slowdown

**Diagnosis:**

```powershell
docker stats lolstonksrss --no-stream
```

**Solutions:**

1. **Check update interval:**

Reduce update frequency in `.env`:
```env
UPDATE_INTERVAL_MINUTES=60  # Update less frequently
```

2. **Set CPU limits:**

Edit `docker-compose.yml`:
```yaml
services:
  lolstonksrss:
    deploy:
      resources:
        limits:
          cpus: '1.0'  # Limit to 1 CPU core
```

3. **Check for runaway processes:**
```powershell
docker exec lolstonksrss ps aux
```

---

## Network & Connectivity

### Issue: Cannot Reach LoL API

**Symptoms:**
- "Connection refused" to leagueoflegends.com
- Network timeout errors
- Failed to fetch articles

**Diagnosis:**

```powershell
# Test from container
docker exec lolstonksrss curl -I https://www.leagueoflegends.com

# Test DNS
docker exec lolstonksrss nslookup www.leagueoflegends.com

# Test from host
Invoke-WebRequest -Uri https://www.leagueoflegends.com
```

**Solutions:**

1. **Check proxy settings (if behind proxy):**

Edit `docker-compose.yml`:
```yaml
environment:
  - HTTP_PROXY=http://proxy.company.com:8080
  - HTTPS_PROXY=http://proxy.company.com:8080
```

2. **Check DNS configuration:**

Edit `docker-compose.yml`:
```yaml
services:
  lolstonksrss:
    dns:
      - 8.8.8.8
      - 8.8.4.4
```

3. **Test alternate DNS:**
```powershell
docker run --rm --dns 8.8.8.8 lolstonksrss:latest curl https://www.leagueoflegends.com
```

### Issue: SSL/TLS Errors

**Symptoms:**
- "SSL certificate verify failed"
- HTTPS connection errors
- Certificate validation issues

**Solutions:**

1. **Update CA certificates in container:**
```powershell
docker exec lolstonksrss apt-get update && apt-get install -y ca-certificates
```

2. **Check system time (affects certificates):**
```powershell
docker exec lolstonksrss date
```

If wrong, fix host system time

3. **If behind corporate proxy with SSL inspection:**

This is complex - may need to add corporate CA certificate to container

---

## Error Messages Reference

### Common HTTP Status Codes

**200 OK**
- Success
- No action needed

**404 Not Found**
- Invalid endpoint
- Check URL spelling
- See available endpoints: `http://localhost:8000/`

**500 Internal Server Error**
- Application error
- Check logs: `docker logs lolstonksrss`
- Usually indicates bug or misconfiguration

**503 Service Unavailable**
- Service not initialized
- Wait for startup to complete
- Check health: `http://localhost:8000/health`

### Common Application Errors

**"Service not initialized"**
- Application starting up
- Wait 30-60 seconds
- Check logs for startup errors

**"Error generating feed"**
- Database connection issue
- No articles in database
- Trigger update: `POST /admin/scheduler/trigger`

**"Source not found"**
- Invalid source specified
- Valid sources: `en-us`, `it-it`
- Check endpoint URL

**"Database is locked"**
- Multiple containers accessing database
- See [Database Locked](#database-locked)

**"Failed to get BuildID"**
- LoL API connection issue
- Cache problem
- See [BuildID Cache Problems](#buildid-cache-problems)

**"Error updating [locale]"**
- API fetch failed
- Network connectivity issue
- LoL website may be down

### Log Error Patterns

**"Permission denied: '/app/data/articles.db'"**
- Volume permission issue
- See [Permission Denied](#permission-denied)

**"Address already in use"**
- Port 8000 conflict
- See [Port Already in Use](#port-already-in-use)

**"ModuleNotFoundError: No module named 'X'"**
- Missing Python dependency
- Rebuild image: `docker-compose build --no-cache`

**"asyncio.exceptions.TimeoutError"**
- Network timeout
- API slow or unavailable
- Check internet connection

**"sqlite3.OperationalError"**
- Database error
- Check database file exists and is writable
- See [Database Problems](#database-problems)

---

## Recovery Procedures

### Procedure: Restart Container

**When to use:** Application errors, stuck processes, configuration changes

```powershell
# Soft restart
docker-compose restart

# Or stop and start
docker-compose stop
docker-compose start

# Verify
docker ps | Select-String "lolstonksrss"
Invoke-WebRequest -Uri http://localhost:8000/health
```

### Procedure: Clear All Caches

**When to use:** Stale data, cache corruption, need fresh data

```powershell
# Clear feed cache
Invoke-WebRequest -Uri http://localhost:8000/admin/refresh -Method POST

# Restart to clear BuildID cache
docker-compose restart

# Trigger fresh update
Invoke-WebRequest -Uri http://localhost:8000/admin/scheduler/trigger -Method POST

# Verify
Invoke-WebRequest -Uri http://localhost:8000/feed.xml
```

### Procedure: Rebuild Database

**When to use:** Database corruption, need to start fresh, testing

```powershell
# Step 1: Backup current database
Copy-Item .\data\articles.db .\data\articles.db.backup

# Step 2: Stop container
docker-compose down

# Step 3: Remove database
Remove-Item .\data\articles.db

# Step 4: Restart container
docker-compose up -d

# Step 5: Wait for initialization
Start-Sleep -Seconds 15

# Step 6: Trigger update to populate
Invoke-WebRequest -Uri http://localhost:8000/admin/scheduler/trigger -Method POST

# Step 7: Verify
$status = Invoke-WebRequest -Uri http://localhost:8000/admin/scheduler/status | ConvertFrom-Json
$status

# Step 8: Check articles
Invoke-WebRequest -Uri http://localhost:8000/feed.xml
```

### Procedure: Complete Reset

**When to use:** Major issues, fresh start needed, before reporting bug

```powershell
# Step 1: Stop and remove everything
docker-compose down -v

# Step 2: Backup data (optional)
Copy-Item .\data .\data.backup -Recurse

# Step 3: Clean data directory
Remove-Item .\data\* -Recurse -Force

# Step 4: Rebuild image
docker-compose build --no-cache

# Step 5: Start fresh
docker-compose up -d

# Step 6: Monitor startup
docker-compose logs -f

# Step 7: Wait for "Server initialized successfully"
# Press Ctrl+C to stop log tail

# Step 8: Verify health
Invoke-WebRequest -Uri http://localhost:8000/health

# Step 9: Check feed
Invoke-WebRequest -Uri http://localhost:8000/feed.xml
```

### Procedure: Restore from Backup

**When to use:** After failed update, data corruption, accidental deletion

```powershell
# Step 1: Stop container
docker-compose down

# Step 2: Restore database backup
Copy-Item .\data\articles.db.backup .\data\articles.db -Force

# Step 3: Start container
docker-compose up -d

# Step 4: Verify
Invoke-WebRequest -Uri http://localhost:8000/health
docker exec lolstonksrss sqlite3 /app/data/articles.db "SELECT COUNT(*) FROM articles;"
```

### Procedure: Force Update

**When to use:** Feeds not updating, need immediate refresh, testing

```powershell
# Step 1: Clear cache
Invoke-WebRequest -Uri http://localhost:8000/admin/refresh -Method POST

# Step 2: Trigger update
$result = Invoke-WebRequest -Uri http://localhost:8000/admin/scheduler/trigger -Method POST
$result.Content | ConvertFrom-Json

# Step 3: Monitor logs
docker logs -f lolstonksrss

# Look for:
# - "Starting update for all sources"
# - "Fetched X articles"
# - "Saved X new articles"

# Step 4: Verify feed
Invoke-WebRequest -Uri http://localhost:8000/feed.xml
```

---

## Getting Help

### Before Asking for Help

Collect this diagnostic information:

```powershell
# System info
docker --version
docker-compose --version

# Container status
docker ps -a | Select-String "lolstonksrss"

# Recent logs
docker logs --tail 100 lolstonksrss > logs.txt

# Health status
Invoke-WebRequest -Uri http://localhost:8000/health > health.txt

# Scheduler status
Invoke-WebRequest -Uri http://localhost:8000/admin/scheduler/status > scheduler.txt

# Environment
docker inspect lolstonksrss > inspect.txt
```

### Create a GitHub Issue

1. Go to: https://github.com/YOUR-REPO/issues
2. Click "New Issue"
3. Provide:
   - Clear title describing the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Log files (from above commands)
   - Environment details (Windows version, Docker version)
   - What you've already tried

### Community Discussion

For questions and discussions:
- Check existing GitHub Discussions
- Search closed issues for similar problems
- Ask in community forums

### Provide Diagnostic Info

When reporting issues, include:

```powershell
# Create diagnostic bundle
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$bundle = "diagnostic-$timestamp"
New-Item -Path $bundle -ItemType Directory

# Collect information
docker logs lolstonksrss > "$bundle\logs.txt"
docker inspect lolstonksrss > "$bundle\inspect.json"
docker ps -a > "$bundle\containers.txt"
docker stats lolstonksrss --no-stream > "$bundle\stats.txt"
Copy-Item .env.example "$bundle\env-template.txt"
Get-Content docker-compose.yml > "$bundle\docker-compose.txt"

# Create archive
Compress-Archive -Path $bundle -DestinationPath "$bundle.zip"

Write-Host "Diagnostic bundle created: $bundle.zip"
```

---

## Known Issues and Limitations

### Known Issues

1. **Windows Path Length Limits**
   - Very long paths may cause issues
   - Workaround: Install in short path like `C:\lolrss\`

2. **WSL 2 Memory Usage**
   - Docker on WSL 2 can use excessive memory
   - Workaround: Configure `.wslconfig` with memory limits

3. **Slow First Request**
   - First RSS request after startup is slow (no cache)
   - Expected behavior - subsequent requests are fast

### Current Limitations

1. **Supported Locales**
   - Only `en-us` and `it-it` currently supported
   - More can be added via configuration

2. **Single Container Setup**
   - No built-in high availability
   - For production, consider load balancer + multiple instances

3. **SQLite Database**
   - Not suitable for very high concurrency
   - For high-traffic, consider PostgreSQL migration

4. **No Authentication**
   - RSS feeds are publicly accessible
   - Add reverse proxy with auth if needed

### Planned Fixes

Check the project roadmap and GitHub issues for planned improvements.

---

## Quick Reference Commands

```powershell
# Status checks
docker ps | Select-String "lolstonksrss"
Invoke-WebRequest -Uri http://localhost:8000/health
docker logs --tail 50 lolstonksrss

# Common fixes
docker-compose restart
Invoke-WebRequest -Uri http://localhost:8000/admin/refresh -Method POST
Invoke-WebRequest -Uri http://localhost:8000/admin/scheduler/trigger -Method POST

# Complete reset
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# View logs
docker-compose logs -f

# Access container
docker exec -it lolstonksrss /bin/bash

# Database check
docker exec lolstonksrss sqlite3 /app/data/articles.db "SELECT COUNT(*) FROM articles;"

# Performance monitoring
docker stats lolstonksrss
```

---

## Additional Resources

- [README.md](../README.md) - Project overview
- [QUICKSTART.md](../QUICKSTART.md) - Getting started guide
- [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md) - Windows deployment guide
- [DOCKER.md](DOCKER.md) - Docker reference
- [PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md) - Architecture overview

For issues not covered here, check the GitHub repository or create a new issue.
