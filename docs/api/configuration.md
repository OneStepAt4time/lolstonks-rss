---
title: API Configuration
description: Configuration options for the LoL Stonks RSS API
---

# API Configuration

This page provides details on API-specific configuration options. For general configuration, see the [Configuration Guide](../getting-started/configuration.md).

## 🔧 API Settings

### Server Configuration

```bash
# Server settings
HOST=0.0.0.0
PORT=8000
WORKERS=1
RELOAD=false
```

### CORS Configuration

```bash
# Allow all origins (default)
CORS_ORIGINS=*

# Restrict to specific origins
CORS_ORIGINS=https://example.com,https://app.example.com

# Disable CORS
CORS_ENABLED=false
```

### Rate Limiting

```bash
# Rate limit settings
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=60
RATE_LIMIT_PERIOD=60  # seconds
```

## 📚 See Also

- [Main Configuration Guide](../getting-started/configuration.md)
- [API Endpoints](endpoints.md)
- [Performance Configuration](../architecture/performance.md)
