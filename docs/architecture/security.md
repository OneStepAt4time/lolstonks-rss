# Security Documentation

## Table of Contents

1. [Security Overview](#security-overview)
2. [Threat Model](#threat-model)
3. [Docker Security](#docker-security)
4. [Application Security](#application-security)
5. [Network Security](#network-security)
6. [Data Security](#data-security)
7. [Deployment Security](#deployment-security)
8. [Security Best Practices](#security-best-practices)
9. [Security Checklist](#security-checklist)
10. [Vulnerability Reporting](#vulnerability-reporting)
11. [Compliance](#compliance)
12. [Security Hardening](#security-hardening)

---

## Security Overview

### Security Posture

LoL Stonks RSS is a **public RSS feed aggregator** with the following security characteristics:

- **No authentication required**: RSS feeds are public by design
- **Read-only public endpoints**: Main feed endpoints are GET-only
- **Admin endpoints**: Unprotected by default (should be secured in production)
- **No sensitive data storage**: Only public news articles
- **Minimal attack surface**: Simple application with limited functionality

### Security Principles

1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Run with minimal permissions required
3. **Fail Securely**: Graceful degradation on errors
4. **Secure by Default**: Safe default configurations
5. **Separation of Concerns**: Isolated components and services
6. **Minimal Exposure**: Only expose necessary ports and endpoints

### Security Responsibility Model

| Layer | Security Owner | Key Controls |
|-------|---------------|--------------|
| Application Code | Development Team | Input validation, error handling |
| Container | Docker/DevOps | Non-root user, minimal image |
| Host OS | System Admin | Firewall, updates, hardening |
| Network | Network Admin | Firewall rules, segmentation |
| Reverse Proxy | DevOps | TLS, headers, rate limiting |

---

## Threat Model

### Assets

1. **RSS Feed Service**: Availability and integrity
2. **Article Database**: Integrity of stored articles
3. **Server Resources**: CPU, memory, disk, bandwidth
4. **Application Logs**: Potential information disclosure

### Threats

#### High Priority

1. **Denial of Service (DoS)**
   - **Risk**: Excessive requests exhausting resources
   - **Impact**: Service unavailability
   - **Mitigation**: Rate limiting, resource limits, caching

2. **XML/RSS Injection**
   - **Risk**: Malicious content in RSS feed
   - **Impact**: XSS attacks on feed readers
   - **Mitigation**: Content sanitization, XML escaping

3. **Admin Endpoint Abuse**
   - **Risk**: Unauthorized access to admin endpoints
   - **Impact**: Cache manipulation, forced updates
   - **Mitigation**: Authentication, network restrictions

#### Medium Priority

4. **Information Disclosure**
   - **Risk**: Verbose error messages, debug info
   - **Impact**: System information leakage
   - **Mitigation**: Production error handling, log sanitization

5. **Container Escape**
   - **Risk**: Exploiting container vulnerabilities
   - **Impact**: Host system compromise
   - **Mitigation**: Non-root user, security updates, hardening

6. **Dependency Vulnerabilities**
   - **Risk**: Vulnerable Python packages
   - **Impact**: Various exploits
   - **Mitigation**: Regular updates, vulnerability scanning

#### Low Priority

7. **Database File Access**
   - **Risk**: Direct access to SQLite file
   - **Impact**: Data tampering
   - **Mitigation**: File permissions, volume security

8. **Log File Exhaustion**
   - **Risk**: Excessive logging filling disk
   - **Impact**: Service failure
   - **Mitigation**: Log rotation, size limits

### Trust Boundaries

```
┌─────────────────────────────────────────────────┐
│              Internet (Untrusted)               │
└────────────────────┬────────────────────────────┘
                     │
           ┌─────────▼──────────┐
           │  Reverse Proxy     │ <- TLS Termination
           │  (nginx/IIS)       │ <- Rate Limiting
           └─────────┬──────────┘
                     │
           ┌─────────▼──────────┐
           │  Docker Container  │ <- Isolation Boundary
           │  (Non-root user)   │
           │  ┌──────────────┐  │
           │  │  FastAPI App │  │
           │  └──────┬───────┘  │
           │         │          │
           │  ┌──────▼───────┐  │
           │  │  SQLite DB   │  │
           │  └──────────────┘  │
           └────────────────────┘
```

---

## Docker Security

### Non-Root User Execution

**Implementation** (from `Dockerfile`):
```dockerfile
# Create non-root user
RUN useradd -m -u 1000 lolrss && \
    mkdir -p /app/data && \
    chown -R lolrss:lolrss /app

# Switch to non-root user
USER lolrss
```

**Security Benefits**:
- Prevents privilege escalation inside container
- Limits impact of container compromise
- Follows principle of least privilege

### Minimal Base Image

**Current**: `python:3.11-slim`

**Security Benefits**:
- Smaller attack surface
- Fewer vulnerabilities
- Reduced image size

**Recommendations**:
- Consider `python:3.11-alpine` for even smaller size
- Regularly update base image
- Use specific version tags (not `latest`)

### Multi-Stage Build

**Security Benefits**:
- Build tools not present in runtime image
- Smaller final image
- Reduced attack surface

**Example**:
```dockerfile
# Stage 1: Builder (build dependencies)
FROM python:3.11-slim as builder
# ... build steps ...

# Stage 2: Runtime (minimal runtime)
FROM python:3.11-slim
# ... copy only runtime artifacts ...
```

### Image Scanning Recommendations

**Tools**:
```bash
# Trivy (recommended)
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image lolstonksrss:latest

# Docker Scout
docker scout cves lolstonksrss:latest

# Snyk
snyk container test lolstonksrss:latest
```

**Schedule**: Scan before deployment and weekly

### Volume Security

**Current Configuration**:
```yaml
volumes:
  - type: bind
    source: ./data
    target: /app/data
```

**Security Recommendations**:

1. **Set Proper Permissions**:
   ```bash
   # Windows (PowerShell as Admin)
   icacls .\data /grant "Users:(OI)(CI)M"

   # Linux/WSL
   chmod 750 ./data
   chown 1000:1000 ./data
   ```

2. **Use Named Volumes** (alternative):
   ```yaml
   volumes:
     - lolrss_data:/app/data

   volumes:
     lolrss_data:
       driver: local
   ```

3. **Read-Only Mounts** (where applicable):
   ```yaml
   volumes:
     - type: bind
       source: ./.env
       target: /app/.env
       read_only: true  # Config should be read-only
   ```

### Network Isolation

**Current**: Bridge network `lolrss_network`

**Security Benefits**:
- Isolated from other Docker networks
- Controlled external access

**Production Recommendations**:

1. **Internal Network** (if using reverse proxy):
   ```yaml
   networks:
     lolrss_internal:
       driver: bridge
       internal: true  # No external access
   ```

2. **Expose Only Necessary Ports**:
   ```yaml
   ports:
     - "127.0.0.1:8000:8000"  # Bind to localhost only
   ```

### Container Security Options

**Recommended Docker Run Options**:

```bash
docker run \
  --read-only \                    # Read-only root filesystem
  --tmpfs /tmp:rw,noexec,nosuid \  # Writable tmp, no execution
  --cap-drop=ALL \                 # Drop all capabilities
  --security-opt=no-new-privileges \ # Prevent privilege escalation
  --pids-limit=100 \               # Limit processes
  --memory=512m \                  # Memory limit
  --cpus=1.0 \                     # CPU limit
  lolstonksrss:latest
```

**Docker Compose Equivalent**:

```yaml
services:
  lolstonksrss:
    # ... other config ...
    read_only: true
    tmpfs:
      - /tmp:rw,noexec,nosuid
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true
    pids_limit: 100
    mem_limit: 512m
    cpus: 1.0
```

**Note**: `--read-only` requires tmpfs mounts for writable directories:
```yaml
tmpfs:
  - /tmp
  - /app/data  # If database needs write access
```

### Container Health and Monitoring

**Current Healthcheck**:
```yaml
healthcheck:
  test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**Security Benefit**: Automatic detection of compromised/crashed containers

---

## Application Security

### Public Feed Endpoints (No Authentication)

**Design Decision**: RSS feeds are public by nature

**Endpoints**:
- `GET /feed.xml` - Main feed
- `GET /feed/{source}.xml` - Source-specific feed
- `GET /feed/category/{category}.xml` - Category feed
- `GET /health` - Health check

**Security Controls**:
- **Caching**: Reduces backend load
- **Rate limiting**: Should be implemented at reverse proxy
- **Input validation**: Source and category parameters validated

### Admin Endpoints (Requires Protection)

**Current State**: **UNPROTECTED** - Must secure in production

**Endpoints**:
- `POST /admin/refresh` - Clear feed cache
- `GET /admin/scheduler/status` - Scheduler status
- `POST /admin/scheduler/trigger` - Force update

**Production Security Requirements**:

#### Option 1: Network Restriction (Recommended)

Restrict access to localhost/internal network only:

```yaml
# docker-compose.yml
services:
  lolstonksrss:
    ports:
      - "127.0.0.1:8000:8000"  # Localhost only
```

Access via SSH tunnel or VPN:
```bash
ssh -L 8000:localhost:8000 user@server
```

#### Option 2: Basic Authentication

Add authentication middleware:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets

security = HTTPBasic()

def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, "admin")
    correct_password = secrets.compare_digest(
        credentials.password,
        os.getenv("ADMIN_PASSWORD", "changeme")
    )
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

@app.post("/admin/refresh")
async def refresh_feeds(admin: str = Depends(verify_admin)):
    # ... existing code ...
```

#### Option 3: API Key Authentication

Add API key header validation:

```python
from fastapi import Header, HTTPException
import secrets
import os

async def verify_api_key(x_api_key: str = Header(...)):
    correct_key = os.getenv("ADMIN_API_KEY")
    if not correct_key or not secrets.compare_digest(x_api_key, correct_key):
        raise HTTPException(status_code=401, detail="Invalid API key")

@app.post("/admin/refresh")
async def refresh_feeds(api_key: str = Depends(verify_api_key)):
    # ... existing code ...
```

**Environment Variable**:
```bash
ADMIN_API_KEY=$(openssl rand -hex 32)
```

#### Option 4: Separate Admin Port

Run admin endpoints on different port (internal only):

```python
# Create separate FastAPI app for admin
admin_app = FastAPI()

@admin_app.post("/refresh")
async def refresh_feeds():
    # ... admin logic ...

# Run on different port (internal network only)
# uvicorn src.admin_app:admin_app --host 127.0.0.1 --port 8001
```

### Input Validation

**Current Implementation**:

1. **Source Parameter**:
   ```python
   source_map = {
       "en-us": ArticleSource.LOL_EN_US,
       "it-it": ArticleSource.LOL_IT_IT,
   }

   if source not in source_map:
       raise HTTPException(status_code=404, detail=f"Source '{source}' not found")
   ```

2. **Limit Parameter**:
   ```python
   limit = min(limit, 200)  # Cap at maximum
   ```

3. **Category Parameter**:
   - Currently accepts any string
   - **Recommendation**: Validate against known categories

**Improvement**:
```python
from pydantic import BaseModel, Field, validator

class FeedRequest(BaseModel):
    limit: int = Field(default=50, ge=1, le=200)

    @validator('limit')
    def validate_limit(cls, v):
        return min(v, 200)

VALID_CATEGORIES = {"Champions", "Patches", "Media", "Esports", "Dev"}

@app.get("/feed/category/{category}.xml")
async def get_category_feed(category: str, limit: int = 50):
    if category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=404,
            detail=f"Category must be one of: {', '.join(VALID_CATEGORIES)}"
        )
    # ... rest of code ...
```

### SQL Injection Prevention

**Protection Mechanism**: Parameterized queries with aiosqlite

**Secure Example** (from `src/database.py`):
```python
# SECURE: Uses parameterized query
cursor = await db.execute(
    'SELECT * FROM articles WHERE guid = ?',
    (guid,)  # Parameter tuple
)
```

**Vulnerable Example** (NOT in codebase):
```python
# VULNERABLE: String concatenation (DO NOT USE)
cursor = await db.execute(
    f'SELECT * FROM articles WHERE guid = "{guid}"'
)
```

**Current Status**: All database queries use parameterized statements

### XSS Prevention in RSS Content

**Risk**: Malicious content in RSS feed executing in feed readers

**Current Implementation** (feedgen library):
- Automatic XML escaping
- Proper CDATA wrapping

**Verification**:
```python
# In src/rss/generator.py
fe.description(article.description or "")  # feedgen escapes HTML entities
```

**Additional Recommendations**:

1. **Sanitize HTML Content**:
   ```python
   import html

   # Escape HTML entities
   safe_description = html.escape(article.description)
   ```

2. **Content Security Policy** (if serving HTML):
   ```python
   headers = {
       "Content-Security-Policy": "default-src 'none'"
   }
   ```

3. **Validate Image URLs**:
   ```python
   from urllib.parse import urlparse

   def is_safe_url(url: str) -> bool:
       parsed = urlparse(url)
       return parsed.scheme in ('http', 'https') and parsed.netloc
   ```

### CORS Configuration

**Current** (from `src/api/app.py`):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # PERMISSIVE - allows all origins
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

**Security Assessment**:
- **Current**: Permissive (allows all origins)
- **Risk**: Minimal for public RSS feeds
- **Benefit**: Maximum compatibility with feed readers

**Production Recommendations**:

1. **For Public RSS Feeds** (keep permissive):
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],
       allow_credentials=False,  # No credentials needed
       allow_methods=["GET"],    # Read-only
       allow_headers=["Accept", "Accept-Language"],
   )
   ```

2. **For Admin Endpoints** (restrict):
   ```python
   from fastapi.middleware.cors import CORSMiddleware

   # Apply different CORS policy to admin routes
   admin_app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://admin.yourdomain.com"],
       allow_credentials=True,
       allow_methods=["GET", "POST"],
       allow_headers=["Content-Type", "X-API-Key"],
   )
   ```

### Rate Limiting

**Current Status**: NOT IMPLEMENTED

**Recommendation**: Implement at reverse proxy level (nginx/IIS)

**nginx Example**:
```nginx
http {
    # Define rate limit zone
    limit_req_zone $binary_remote_addr zone=rss_limit:10m rate=10r/s;

    server {
        location /feed {
            limit_req zone=rss_limit burst=20 nodelay;
            proxy_pass http://localhost:8000;
        }

        location /admin {
            limit_req zone=rss_limit burst=5 nodelay;
            # ... additional restrictions ...
        }
    }
}
```

**Application-Level Alternative** (SlowAPI):

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/feed.xml")
@limiter.limit("60/minute")
async def get_main_feed(request: Request, limit: int = 50):
    # ... existing code ...
```

**Add to requirements.txt**:
```
slowapi==0.1.9
```

### Error Handling Security

**Current Implementation**:
```python
except Exception as e:
    logger.error(f"Error generating main feed: {e}")
    raise HTTPException(status_code=500, detail="Error generating feed")
```

**Security Assessment**:
- **Good**: Generic error message (no sensitive info)
- **Good**: Detailed errors only in logs
- **Improvement**: Consider error codes instead of messages

**Production Recommendations**:

1. **Disable Debug Mode**:
   ```python
   # Ensure FastAPI runs in production mode
   app = FastAPI(debug=False)  # Default is False
   ```

2. **Custom Exception Handler**:
   ```python
   from fastapi import Request
   from fastapi.responses import JSONResponse

   @app.exception_handler(Exception)
   async def generic_exception_handler(request: Request, exc: Exception):
       # Log detailed error
       logger.error(f"Unhandled exception: {exc}", exc_info=True)

       # Return generic message
       return JSONResponse(
           status_code=500,
           content={"detail": "Internal server error", "error_id": "ERR_500"}
       )
   ```

3. **Sanitize Log Output**:
   ```python
   # Avoid logging sensitive data
   logger.info(f"User accessed feed: {sanitize_user_input(source)}")
   ```

### Security Headers

**Current Status**: NOT IMPLEMENTED

**Recommendation**: Add security headers via middleware

**Implementation**:

```python
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

        # Only add HSTS if using HTTPS
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response

app.add_middleware(SecurityHeadersMiddleware)
```

---

## Network Security

### Firewall Configuration

#### Windows Firewall (PowerShell as Administrator)

**Allow Docker Port**:
```powershell
# Allow inbound on port 8000
New-NetFirewallRule -DisplayName "LoL RSS Feed" `
  -Direction Inbound `
  -Action Allow `
  -Protocol TCP `
  -LocalPort 8000

# Restrict to specific IP range (optional)
New-NetFirewallRule -DisplayName "LoL RSS Feed - Internal Only" `
  -Direction Inbound `
  -Action Allow `
  -Protocol TCP `
  -LocalPort 8000 `
  -RemoteAddress 192.168.1.0/24
```

**Block Admin Endpoints from External**:
```powershell
# Block external access to admin endpoints
# (Requires reverse proxy to filter by path)
```

#### Linux Firewall (UFW)

```bash
# Allow port 8000
sudo ufw allow 8000/tcp

# Or restrict to specific subnet
sudo ufw allow from 192.168.1.0/24 to any port 8000 proto tcp

# Enable firewall
sudo ufw enable
```

#### Docker Network Isolation

**Bind to Localhost Only**:
```yaml
ports:
  - "127.0.0.1:8000:8000"  # Only accessible from host
```

**Use Reverse Proxy** (recommended):
```yaml
services:
  lolstonksrss:
    # No ports exposed externally
    networks:
      - internal

  nginx:
    ports:
      - "80:80"
      - "443:443"
    networks:
      - internal
      - external

networks:
  internal:
    internal: true  # No internet access
  external:
```

### HTTPS Recommendations

**Current**: HTTP only (port 8000)

**Production**: Use reverse proxy for TLS termination

#### Option 1: nginx Reverse Proxy

**nginx Configuration** (`/etc/nginx/sites-available/lolrss`):

```nginx
server {
    listen 80;
    server_name rss.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name rss.yourdomain.com;

    # TLS Configuration
    ssl_certificate /etc/letsencrypt/live/rss.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rss.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=rss_limit:10m rate=10r/s;
    limit_req zone=rss_limit burst=20 nodelay;

    # Public RSS Endpoints
    location /feed {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Caching
        proxy_cache_valid 200 5m;
        proxy_cache_bypass $http_pragma;
    }

    # Health Check
    location /health {
        proxy_pass http://127.0.0.1:8000;
        access_log off;
    }

    # Admin Endpoints - Restrict Access
    location /admin {
        # Allow only from specific IPs
        allow 192.168.1.0/24;
        allow 10.0.0.0/8;
        deny all;

        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Get Free TLS Certificate** (Let's Encrypt):
```bash
sudo certbot --nginx -d rss.yourdomain.com
```

#### Option 2: IIS Reverse Proxy (Windows)

**Prerequisites**:
```powershell
# Install URL Rewrite and ARR modules
# Download from: https://www.iis.net/downloads/microsoft/url-rewrite
# Download ARR: https://www.iis.net/downloads/microsoft/application-request-routing
```

**IIS Configuration** (web.config):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!-- Redirect HTTP to HTTPS -->
        <rule name="HTTP to HTTPS" stopProcessing="true">
          <match url="(.*)" />
          <conditions>
            <add input="{HTTPS}" pattern="off" />
          </conditions>
          <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent" />
        </rule>

        <!-- Reverse Proxy to Docker -->
        <rule name="ReverseProxyInboundRule" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://localhost:8000/{R:1}" />
        </rule>
      </rules>
    </rewrite>

    <!-- Security Headers -->
    <httpProtocol>
      <customHeaders>
        <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains" />
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-Frame-Options" value="DENY" />
        <add name="X-XSS-Protection" value="1; mode=block" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
```

**SSL Certificate** (Windows):
- Use IIS Certificate Request
- Or import Let's Encrypt certificate using `win-acme`

### Network Segmentation

**Recommended Architecture**:

```
Internet
    │
    ├─> [Firewall/Load Balancer]
    │        │
    │        ├─> [Reverse Proxy] (DMZ)
    │        │        │
    │        │        └─> [LoL RSS Container] (Internal Network)
    │        │                    │
    │        │                    └─> [Database Volume] (Internal)
    │        │
    │        └─> [Admin Access] (VPN/Bastion)
```

---

## Data Security

### Data Classification

| Data Type | Classification | Sensitivity | Protection |
|-----------|---------------|-------------|------------|
| RSS Articles | Public | None | Integrity checks |
| Database File | Public | Low | Backup encryption |
| Application Logs | Internal | Low | Access control |
| Configuration | Internal | Medium | Restricted access |
| Admin Credentials | Confidential | High | Encryption, secrets manager |

### No Sensitive Data Storage

**Current State**: Application stores only public news articles

**Data Stored**:
- Article titles
- Article URLs
- Publication dates
- Article content (public)
- Categories
- Source identifiers

**Data NOT Stored**:
- User credentials
- Personal information
- API keys (except in environment variables)
- Session data
- Financial information

### Database Security

#### SQLite File Permissions

**Recommended Permissions**:

**Linux/WSL**:
```bash
# Database file should be readable/writable only by application user
chmod 600 data/articles.db
chown lolrss:lolrss data/articles.db

# Directory permissions
chmod 700 data
chown lolrss:lolrss data
```

**Windows**:
```powershell
# Remove inherited permissions
icacls .\data\articles.db /inheritance:r

# Grant access only to current user and SYSTEM
icacls .\data\articles.db /grant:r "${env:USERNAME}:F"
icacls .\data\articles.db /grant:r "SYSTEM:F"
```

**Docker Volume**:
```yaml
volumes:
  - type: bind
    source: ./data
    target: /app/data
    # File ownership handled by non-root user (lolrss:1000)
```

#### Database Access Control

**Current**: Direct file access (SQLite)

**Security Controls**:
1. **File-based** (no network access)
2. **Single-process** (no concurrent external access)
3. **Parameterized queries** (SQL injection prevention)
4. **Minimal permissions** (non-root user)

**Production Recommendations**:

1. **Read-Only Access** (if applicable):
   ```python
   # Open database in read-only mode
   async with aiosqlite.connect(f"file:{self.db_path}?mode=ro", uri=True) as db:
       # ... read operations ...
   ```

2. **Database Encryption** (for compliance):
   ```bash
   # Use SQLCipher for encryption at rest
   # Requires recompiling aiosqlite with SQLCipher
   ```

3. **Backup Encryption**:
   ```bash
   # Encrypt database backups
   gpg --symmetric --cipher-algo AES256 data/articles.db
   ```

### Log Sanitization

**Current Logging**:
```python
logger.info(f"Saved article: {article.title}")
logger.error(f"Error generating main feed: {e}")
```

**Security Concerns**:
- Log injection
- Sensitive data leakage
- Excessive logging

**Secure Logging Practices**:

```python
import re

def sanitize_log_message(msg: str) -> str:
    """Remove potentially sensitive data from log messages."""
    # Remove email addresses
    msg = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]', msg)

    # Remove URLs with credentials
    msg = re.sub(r'https?://[^:]+:[^@]+@', 'https://[CREDENTIALS]@', msg)

    # Remove tokens/keys
    msg = re.sub(r'\b[A-Za-z0-9]{32,}\b', '[TOKEN]', msg)

    # Limit length
    if len(msg) > 1000:
        msg = msg[:1000] + '...[TRUNCATED]'

    return msg

# Usage
logger.info(sanitize_log_message(f"Processing: {user_input}"))
```

**Structured Logging** (recommended):

```python
import structlog

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

log = structlog.get_logger()

# Structured logging
log.info("article_saved",
         article_id=article.guid,
         source=article.source,
         title=article.title[:100])  # Truncate long titles
```

### Backup Security

**Backup Strategy**:

1. **Regular Backups**:
   ```bash
   # Daily backup script
   #!/bin/bash
   BACKUP_DIR="/backups/lolrss"
   DATE=$(date +%Y%m%d_%H%M%S)

   # Create backup
   cp data/articles.db "$BACKUP_DIR/articles_$DATE.db"

   # Encrypt backup
   gpg --symmetric --cipher-algo AES256 \
       --output "$BACKUP_DIR/articles_$DATE.db.gpg" \
       "$BACKUP_DIR/articles_$DATE.db"

   # Remove unencrypted backup
   rm "$BACKUP_DIR/articles_$DATE.db"

   # Keep only last 30 days
   find "$BACKUP_DIR" -name "articles_*.db.gpg" -mtime +30 -delete
   ```

2. **Backup Verification**:
   ```bash
   # Verify backup integrity
   gpg --decrypt "$BACKUP_DIR/articles_$DATE.db.gpg" | \
       sqlite3 - "PRAGMA integrity_check;"
   ```

3. **Off-site Backups**:
   ```bash
   # Upload to cloud storage (encrypted)
   rclone copy "$BACKUP_DIR/articles_$DATE.db.gpg" remote:lolrss-backups/
   ```

---

## Deployment Security

### Windows Server Hardening

**Pre-Deployment Checklist**:

1. **Windows Updates**:
   ```powershell
   # Install all updates
   Install-Module PSWindowsUpdate
   Get-WindowsUpdate -Install -AcceptAll -AutoReboot
   ```

2. **Disable Unnecessary Services**:
   ```powershell
   # Disable services not needed
   Get-Service | Where-Object {$_.Status -eq "Running"} |
       Select-Object Name, DisplayName
   ```

3. **Enable Windows Defender**:
   ```powershell
   # Ensure Defender is active
   Set-MpPreference -DisableRealtimeMonitoring $false
   Update-MpSignature
   ```

4. **Configure Firewall**:
   ```powershell
   # Enable firewall on all profiles
   Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True

   # Default deny inbound
   Set-NetFirewallProfile -DefaultInboundAction Block -DefaultOutboundAction Allow
   ```

### Docker Desktop for Windows Security

**Installation**:
```powershell
# Run Docker Desktop as Administrator
# Enable WSL 2 backend (recommended for security)
```

**Security Settings**:

1. **Use WSL 2 Backend**:
   - Better isolation
   - Linux-native container security
   - Improved performance

2. **Resource Limits**:
   ```json
   // %USERPROFILE%\.docker\daemon.json
   {
     "log-level": "info",
     "max-concurrent-downloads": 3,
     "max-concurrent-uploads": 5,
     "storage-driver": "overlay2"
   }
   ```

3. **Content Trust** (image verification):
   ```powershell
   $env:DOCKER_CONTENT_TRUST=1
   ```

### Environment Variable Security

**Current** (.env.example):
```bash
DATABASE_PATH=data/articles.db
HOST=0.0.0.0
PORT=8000
# ... other config ...
```

**Security Risks**:
- Plain text secrets
- Accidentally committed to git
- Readable by all container processes

**Best Practices**:

1. **.gitignore Protection**:
   ```gitignore
   # .gitignore
   .env
   .env.local
   .env.production
   *.key
   *.pem
   ```

2. **File Permissions**:
   ```bash
   # Linux/WSL
   chmod 600 .env

   # Windows
   icacls .env /inheritance:r /grant:r "${env:USERNAME}:R"
   ```

3. **Docker Secrets** (Docker Swarm):
   ```bash
   # Create secret
   echo "my_admin_password" | docker secret create admin_password -

   # Use in compose
   services:
     lolstonksrss:
       secrets:
         - admin_password

   secrets:
     admin_password:
       external: true
   ```

4. **Environment Variable Validation**:
   ```python
   # In src/config.py
   from pydantic import validator

   class Settings(BaseSettings):
       admin_password: str

       @validator('admin_password')
       def validate_password(cls, v):
           if len(v) < 12:
               raise ValueError('Password must be at least 12 characters')
           return v
   ```

### Secret Management

**Options for Production**:

#### Option 1: Windows Credential Manager

```powershell
# Store secret
cmdkey /add:LOLRSS_ADMIN_PASSWORD /user:admin /pass:SuperSecure123!

# Retrieve in application
# Use Python keyring library
```

**Python Implementation**:
```python
import keyring

# Get password from Windows Credential Manager
password = keyring.get_password("lolrss", "admin_password")
```

#### Option 2: Azure Key Vault (Cloud)

```python
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient

credential = DefaultAzureCredential()
client = SecretClient(vault_url="https://lolrss-vault.vault.azure.net/",
                      credential=credential)

admin_password = client.get_secret("admin-password").value
```

#### Option 3: HashiCorp Vault (Self-hosted)

```python
import hvac

client = hvac.Client(url='http://localhost:8200', token='vault-token')
secret = client.secrets.kv.v2.read_secret_version(path='lolrss/admin')
admin_password = secret['data']['data']['password']
```

### Automated Updates

**Docker Image Updates**:

```powershell
# Windows scheduled task (PowerShell script)
# update_lolrss.ps1

$ErrorActionPreference = "Stop"

# Pull latest image
docker-compose pull

# Backup database
Copy-Item .\data\articles.db .\backups\articles_$(Get-Date -Format 'yyyyMMdd_HHmmss').db

# Update and restart
docker-compose up -d --force-recreate

# Verify health
Start-Sleep -Seconds 10
$health = Invoke-WebRequest -Uri http://localhost:8000/health | ConvertFrom-Json
if ($health.status -ne "healthy") {
    # Rollback
    docker-compose down
    docker-compose up -d
    Send-MailMessage -To admin@example.com -Subject "LoL RSS Update Failed" -Body "Rollback performed"
}
```

**Schedule Task**:
```powershell
# Run weekly on Sunday at 3 AM
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-File C:\lolrss\update_lolrss.ps1"

$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 3am

Register-ScheduledTask -Action $action -Trigger $trigger `
    -TaskName "Update LoL RSS" -Description "Weekly update and restart"
```

---

## Security Best Practices

### Development Security

1. **Dependency Scanning**:
   ```bash
   # Check for known vulnerabilities
   pip install safety
   safety check --json

   # Or use pip-audit
   pip install pip-audit
   pip-audit
   ```

2. **Code Security Analysis**:
   ```bash
   # Bandit (Python security linter)
   pip install bandit
   bandit -r src/

   # Semgrep (static analysis)
   pip install semgrep
   semgrep --config=auto src/
   ```

3. **Pre-commit Hooks**:
   ```yaml
   # .pre-commit-config.yaml
   repos:
     - repo: https://github.com/PyCQA/bandit
       rev: 1.7.5
       hooks:
         - id: bandit
           args: ['-r', 'src/']

     - repo: https://github.com/pre-commit/pre-commit-hooks
       rev: v4.5.0
       hooks:
         - id: check-yaml
         - id: check-json
         - id: detect-private-key
         - id: check-added-large-files
   ```

### Production Security

1. **Regular Updates**:
   - **Weekly**: Check for dependency updates
   - **Monthly**: Update base Docker image
   - **Quarterly**: Review security configuration

2. **Monitoring and Logging**:
   ```python
   # Centralized logging
   import logging.handlers

   # Syslog handler
   syslog_handler = logging.handlers.SysLogHandler(address=('logserver', 514))

   # Or JSON logging to file
   json_handler = logging.FileHandler('/var/log/lolrss/app.json')
   json_handler.setFormatter(structlog.processors.JSONRenderer())
   ```

3. **Security Scanning**:
   ```bash
   # Docker image scanning
   trivy image lolstonksrss:latest

   # Container runtime scanning
   docker scan lolstonksrss:latest
   ```

4. **Access Logging**:
   ```python
   # Log all requests
   @app.middleware("http")
   async def log_requests(request: Request, call_next):
       start_time = time.time()
       response = await call_next(request)
       process_time = time.time() - start_time

       log.info("request_processed",
                method=request.method,
                path=request.url.path,
                status=response.status_code,
                duration=f"{process_time:.4f}s",
                client_ip=request.client.host)

       return response
   ```

### Incident Response

**Preparation**:

1. **Define Incident Types**:
   - Service outage
   - Data breach (unlikely - public data)
   - DoS attack
   - Unauthorized admin access
   - Container compromise

2. **Response Procedure**:
   ```
   1. Detect: Monitoring alerts
   2. Contain: Isolate affected systems
   3. Investigate: Review logs, determine scope
   4. Remediate: Patch vulnerability, restore service
   5. Document: Incident report, lessons learned
   6. Improve: Update security controls
   ```

3. **Emergency Contacts**:
   ```yaml
   # contacts.yml (keep secure)
   security_team:
     - name: "Security Lead"
       email: security@example.com
       phone: "+1-555-0123"

   system_admin:
     - name: "SysAdmin"
       email: admin@example.com
       phone: "+1-555-0456"
   ```

### Security Training

**Required Knowledge**:
- OWASP Top 10
- Container security best practices
- Windows Server hardening
- Incident response basics
- Secure coding principles

**Resources**:
- [OWASP RSS Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/RSS_Security_Cheat_Sheet.html)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Python Security Best Practices](https://python.readthedocs.io/en/stable/library/security_warnings.html)

---

## Security Checklist

### Pre-Deployment Security Checklist

#### Application Security
- [ ] All admin endpoints protected (auth or network restriction)
- [ ] CORS configured appropriately
- [ ] Rate limiting implemented (reverse proxy or app-level)
- [ ] Input validation on all user inputs
- [ ] Error messages don't leak sensitive information
- [ ] Security headers configured
- [ ] Logging configured and sanitized
- [ ] Debug mode disabled (`app = FastAPI(debug=False)`)

#### Docker Security
- [ ] Running as non-root user (`USER lolrss`)
- [ ] Using minimal base image (`python:3.11-slim`)
- [ ] Multi-stage build implemented
- [ ] Image scanned for vulnerabilities (`trivy image`)
- [ ] Health check configured
- [ ] Resource limits set (memory, CPU)
- [ ] Unnecessary capabilities dropped
- [ ] Read-only root filesystem (if applicable)

#### Network Security
- [ ] Firewall configured (Windows Firewall or UFW)
- [ ] Only necessary ports open (8000 or reverse proxy ports)
- [ ] HTTPS configured (via reverse proxy)
- [ ] TLS 1.2+ only
- [ ] Strong cipher suites configured
- [ ] Admin endpoints restricted to internal network

#### Data Security
- [ ] Database file has correct permissions (600)
- [ ] Backup strategy implemented
- [ ] Backups encrypted
- [ ] Backup restoration tested
- [ ] Log rotation configured
- [ ] Sensitive data not logged

#### Environment Security
- [ ] .env file not committed to git
- [ ] .env file has restricted permissions (600)
- [ ] Default passwords changed
- [ ] Secrets stored securely (not in plain text)
- [ ] Environment variables validated

#### Host Security
- [ ] Operating system fully patched
- [ ] Unnecessary services disabled
- [ ] Antivirus/anti-malware active
- [ ] Automated updates configured
- [ ] SSH/RDP secured (if applicable)
- [ ] Monitoring configured

### Post-Deployment Verification

- [ ] Health check returns 200 OK
- [ ] RSS feed accessible via HTTPS
- [ ] Admin endpoints protected
- [ ] Logs being written correctly
- [ ] No errors in logs
- [ ] Database being updated
- [ ] Scheduled updates running
- [ ] Backup job running
- [ ] Monitoring alerts configured
- [ ] SSL certificate valid and auto-renewing

### Ongoing Security Maintenance

#### Daily
- [ ] Check application logs for errors
- [ ] Verify service is running (`docker ps`)
- [ ] Check health endpoint

#### Weekly
- [ ] Review access logs for anomalies
- [ ] Check disk space usage
- [ ] Verify backup completion
- [ ] Check for dependency updates (`pip list --outdated`)

#### Monthly
- [ ] Update Docker base image
- [ ] Update Python dependencies
- [ ] Review security advisories (CVEs)
- [ ] Test backup restoration
- [ ] Review and rotate logs
- [ ] Scan for vulnerabilities (`trivy`, `safety`)

#### Quarterly
- [ ] Review security configuration
- [ ] Update documentation
- [ ] Conduct security review
- [ ] Review access controls
- [ ] Update incident response plan
- [ ] Security training refresh

---

## Vulnerability Reporting

### How to Report Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities.

**Contact**:
- **Email**: security@yourdomain.com (preferred)
- **Encrypted**: Use PGP key (provide key fingerprint)
- **Alternative**: Private GitHub security advisory

### What to Include

1. **Description**: Clear description of the vulnerability
2. **Impact**: Potential security impact (severity)
3. **Steps to Reproduce**: Detailed reproduction steps
4. **Affected Versions**: Which versions are affected
5. **Suggested Fix**: Proposed solution (if known)
6. **Proof of Concept**: Exploit code (if applicable)

### Example Report

```
Subject: [SECURITY] SQL Injection in feed endpoint

Description:
Discovered potential SQL injection in /feed/category/{category}.xml endpoint.

Impact:
CVSS Score: 7.5 (High)
- Potential database access
- Unauthorized data retrieval

Steps to Reproduce:
1. Send GET request to /feed/category/'; DROP TABLE articles--.xml
2. Observe application behavior
3. Check database integrity

Affected Versions:
v1.0.0 - v1.2.0

Suggested Fix:
Validate category parameter against whitelist before database query.

Proof of Concept:
curl "http://localhost:8000/feed/category/'; DROP TABLE articles--.xml"
```

### Response Timeline

- **Acknowledgment**: Within 24 hours
- **Initial Assessment**: Within 3 business days
- **Status Update**: Weekly until resolved
- **Fix Development**: Based on severity
  - Critical: 48 hours
  - High: 7 days
  - Medium: 30 days
  - Low: 90 days
- **Public Disclosure**: 90 days after fix or coordinated disclosure

### Disclosure Policy

**Coordinated Disclosure**:
1. Report received and confirmed
2. Fix developed and tested
3. Security advisory drafted
4. Fix released
5. Public disclosure (after fix deployed)

**Credit**:
- Reporters will be credited (unless anonymous)
- Hall of fame for responsible disclosures

---

## Compliance

### GDPR Considerations

**Assessment**: Minimal GDPR impact

**Personal Data**: NONE
- No user accounts
- No user tracking
- No cookies (except session)
- No personal information collected

**Data Processing**:
- Public RSS feeds only
- No user data stored
- Anonymous access logs (IP addresses - see below)

**IP Address Logging**:
- **Purpose**: Security monitoring, abuse prevention
- **Legal Basis**: Legitimate interest
- **Retention**: 30 days (then deleted)
- **Access**: System administrators only

**Privacy Policy** (minimal):
```
We collect no personal data.
Server access logs (IP addresses) are kept for 30 days for security purposes.
RSS feeds contain only public League of Legends news.
No cookies are used.
```

**Right to Erasure**:
- Not applicable (no personal data stored)
- Log rotation handles automatic deletion

### Riot Games Terms of Service Compliance

**Requirements**:
1. **Attribution**: Credit Riot Games for content
2. **No API Abuse**: Respect rate limits
3. **Accurate Representation**: Don't misrepresent content
4. **Terms Link**: Provide link to official ToS

**Implementation**:

```python
# In RSS feed
rss_feed_description = (
    "Unofficial RSS feed aggregator for League of Legends news. "
    "All content © Riot Games. "
    "This is a fan-made project not affiliated with Riot Games. "
    "See https://www.riotgames.com/en/legal for official ToS."
)
```

**Footer in Feed**:
```xml
<channel>
  <description>
    Unofficial LoL News RSS Feed.
    League of Legends and Riot Games are trademarks or registered trademarks
    of Riot Games, Inc. All rights reserved.
  </description>
  <copyright>© Riot Games, Inc.</copyright>
</channel>
```

### Rate Limiting Respect

**Responsible Scraping**:

```python
# In scraper configuration
SCRAPER_CONFIG = {
    "delay_between_requests": 2,  # 2 seconds between requests
    "max_concurrent_requests": 1,  # Sequential requests only
    "respect_robots_txt": True,
    "user_agent": "LoLStonksRSS/1.0 (unofficial fan project; +http://yoursite.com/about)"
}
```

**robots.txt Compliance**:
```python
import urllib.robotparser

rp = urllib.robotparser.RobotFileParser()
rp.set_url("https://www.leagueoflegends.com/robots.txt")
rp.read()

if rp.can_fetch("LoLStonksRSS", url):
    # Proceed with request
else:
    # Skip this URL
```

### Data Retention Policy

**Articles Database**:
- **Retention**: Indefinite (public data)
- **Purpose**: Historical news archive
- **Cleanup**: Optional manual cleanup of old articles

**Access Logs**:
- **Retention**: 30 days
- **Purpose**: Security and debugging
- **Cleanup**: Automatic log rotation

**Backups**:
- **Retention**: 30 days
- **Purpose**: Disaster recovery
- **Cleanup**: Automatic (oldest deleted first)

---

## Security Hardening

### Production Configuration

**Minimal Production docker-compose.yml**:

```yaml
version: '3.8'

services:
  lolstonksrss:
    build:
      context: .
      dockerfile: Dockerfile
    image: lolstonksrss:latest
    container_name: lolstonksrss
    restart: unless-stopped

    # Security: Bind to localhost only (use reverse proxy)
    ports:
      - "127.0.0.1:8000:8000"

    # Security: Resource limits
    mem_limit: 512m
    cpus: 1.0
    pids_limit: 100

    # Security: Drop all capabilities
    cap_drop:
      - ALL

    # Security: No new privileges
    security_opt:
      - no-new-privileges:true

    # Security: Read-only root (requires tmpfs for writable dirs)
    # read_only: true
    # tmpfs:
    #   - /tmp:rw,noexec,nosuid,size=50m

    volumes:
      - type: bind
        source: ./data
        target: /app/data
        # Note: SQLite needs write access

    environment:
      - DATABASE_PATH=/app/data/articles.db
      - HOST=0.0.0.0
      - PORT=8000
      - LOG_LEVEL=WARNING  # Reduce log verbosity
      - UPDATE_INTERVAL_MINUTES=30
      - BASE_URL=https://rss.yourdomain.com  # HTTPS URL
      - FEED_CACHE_TTL=300

    # Security: Secrets via environment (better: use Docker secrets)
    env_file:
      - .env.production  # Not committed to git

    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

    networks:
      - internal

    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  internal:
    driver: bridge
    # For reverse proxy setup, use internal network
    # internal: true
```

### Reverse Proxy Setup (nginx) - Complete Example

**Directory Structure**:
```
/etc/nginx/
  ├── nginx.conf
  ├── sites-available/
  │   └── lolrss.conf
  └── sites-enabled/
      └── lolrss.conf -> ../sites-available/lolrss.conf
```

**nginx Configuration** (`/etc/nginx/sites-available/lolrss.conf`):

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=rss_general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=rss_admin:10m rate=1r/s;

# Cache configuration
proxy_cache_path /var/cache/nginx/lolrss
                 levels=1:2
                 keys_zone=lolrss_cache:10m
                 max_size=100m
                 inactive=60m;

# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name rss.yourdomain.com;

    # ACME challenge for Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name rss.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/rss.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rss.yourdomain.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/rss.yourdomain.com/chain.pem;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Remove server version
    server_tokens off;

    # Logging
    access_log /var/log/nginx/lolrss_access.log combined;
    error_log /var/log/nginx/lolrss_error.log warn;

    # Root endpoint
    location / {
        limit_req zone=rss_general burst=20 nodelay;

        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
    }

    # RSS Feed endpoints (cacheable)
    location /feed {
        limit_req zone=rss_general burst=20 nodelay;

        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Caching
        proxy_cache lolrss_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        proxy_cache_background_update on;
        proxy_cache_lock on;
        add_header X-Cache-Status $upstream_cache_status;

        # Cache bypass for debugging
        proxy_cache_bypass $http_pragma $http_authorization;
        proxy_no_cache $http_pragma $http_authorization;
    }

    # Health check (no rate limit, no logging)
    location /health {
        proxy_pass http://127.0.0.1:8000;
        access_log off;
    }

    # Admin endpoints (restricted)
    location /admin {
        limit_req zone=rss_admin burst=5 nodelay;

        # IP whitelist (adjust for your network)
        allow 192.168.1.0/24;  # Local network
        allow 10.0.0.0/8;      # VPN
        deny all;

        # Basic auth (additional layer)
        auth_basic "Admin Area";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # No caching for admin
        proxy_no_cache 1;
        proxy_cache_bypass 1;
    }

    # API docs (restrict or disable in production)
    location /docs {
        # Option 1: Disable completely
        return 404;

        # Option 2: Restrict to admins
        # allow 192.168.1.0/24;
        # deny all;
        # proxy_pass http://127.0.0.1:8000;
    }

    location /redoc {
        return 404;
    }

    location /openapi.json {
        return 404;
    }
}
```

**Create htpasswd file** (for admin basic auth):
```bash
sudo apt-get install apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd admin
```

**Enable site**:
```bash
sudo ln -s /etc/nginx/sites-available/lolrss.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### TLS/SSL Certificate Setup

**Let's Encrypt (Recommended)**:

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d rss.yourdomain.com

# Auto-renewal (already configured by certbot)
sudo certbot renew --dry-run
```

**Manual Certificate Renewal Check**:
```bash
# Add to crontab
0 0,12 * * * /usr/bin/certbot renew --quiet --deploy-hook "systemctl reload nginx"
```

### Security Monitoring

**Log Monitoring with fail2ban**:

```bash
# Install fail2ban
sudo apt-get install fail2ban

# Create custom filter
sudo nano /etc/fail2ban/filter.d/nginx-lolrss.conf
```

**Filter Configuration**:
```ini
[Definition]
failregex = ^<HOST> .* "(GET|POST) /admin.*" 401
            ^<HOST> .* "(GET|POST) /admin.*" 403
ignoreregex =
```

**Jail Configuration** (`/etc/fail2ban/jail.local`):
```ini
[nginx-lolrss]
enabled = true
port = http,https
filter = nginx-lolrss
logpath = /var/log/nginx/lolrss_access.log
maxretry = 5
bantime = 3600
findtime = 600
```

**Enable and start**:
```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo fail2ban-client status nginx-lolrss
```

### Monitoring and Alerting

**Health Check Monitoring** (simple script):

```bash
#!/bin/bash
# /usr/local/bin/check_lolrss.sh

HEALTH_URL="http://localhost:8000/health"
ALERT_EMAIL="admin@yourdomain.com"

response=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")

if [ "$response" != "200" ]; then
    echo "LoL RSS Health Check FAILED: HTTP $response" | \
        mail -s "LoL RSS Alert: Service Down" "$ALERT_EMAIL"
    exit 1
fi

exit 0
```

**Cron job** (every 5 minutes):
```cron
*/5 * * * * /usr/local/bin/check_lolrss.sh
```

**Advanced: Prometheus + Grafana** (optional):

```python
# Add prometheus metrics to app
from prometheus_client import Counter, Histogram, make_asgi_app
from starlette.middleware import Middleware
from prometheus_fastapi_instrumentator import Instrumentator

# Metrics
feed_requests = Counter('feed_requests_total', 'Total feed requests')
feed_latency = Histogram('feed_latency_seconds', 'Feed generation latency')

# Add to FastAPI
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Instrument
Instrumentator().instrument(app).expose(app)
```

---

## Security Testing

### Automated Security Tests

**Add to requirements-dev.txt**:
```
safety==3.0.0
bandit==1.7.5
semgrep==1.45.0
```

**Security test script** (`scripts/security_test.sh`):

```bash
#!/bin/bash
set -e

echo "=== Running Security Tests ==="

echo "1. Dependency vulnerability scan..."
safety check --json || echo "WARNING: Vulnerabilities found"

echo "2. Static code analysis..."
bandit -r src/ -f json -o bandit-report.json || echo "WARNING: Security issues found"

echo "3. Docker image scan..."
trivy image --severity HIGH,CRITICAL lolstonksrss:latest

echo "4. Secret detection..."
gitleaks detect --source . --verbose

echo "=== Security Tests Complete ==="
```

### Penetration Testing Checklist

- [ ] SQL injection testing (all endpoints)
- [ ] XSS testing (RSS content)
- [ ] CSRF testing (admin endpoints)
- [ ] Authentication bypass (admin endpoints)
- [ ] Directory traversal (file paths)
- [ ] XML entity injection
- [ ] DoS testing (resource exhaustion)
- [ ] Container escape attempts
- [ ] Network segmentation validation
- [ ] TLS configuration testing (ssllabs.com)

---

## Conclusion

This security documentation provides comprehensive guidance for securing the LoL Stonks RSS application. Remember:

1. **Security is ongoing**: Regular updates and monitoring are essential
2. **Defense in depth**: Multiple layers of security controls
3. **Least privilege**: Minimal permissions and exposure
4. **Secure by default**: Safe configurations out of the box
5. **Incident response**: Be prepared for security events

For questions or security concerns, contact security@yourdomain.com.

**Last Updated**: 2025-12-29
**Version**: 1.0.0
**Review Schedule**: Quarterly
