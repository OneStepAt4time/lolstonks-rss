---
title: Error Codes
description: API error codes and handling
---

# Error Codes

Reference for API error codes and how to handle them.

## 📋 HTTP Status Codes

### Success Codes (2xx)

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 204 | No Content | Success, no content to return |

### Client Error Codes (4xx)

| Code | Status | Description |
|------|--------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |

### Server Error Codes (5xx)

| Code | Status | Description |
|------|--------|-------------|
| 500 | Internal Server Error | Server error occurred |
| 503 | Service Unavailable | Service temporarily unavailable |

## 🔧 Error Response Format

```json
{
  "status": "error",
  "message": "Resource not found",
  "code": "RESOURCE_NOT_FOUND",
  "details": {
    "guid": "abc123"
  }
}
```

## 🛠️ Error Handling

### Python Example

```python
import requests

try:
    response = requests.get('http://localhost:8000/api/v1/articles/invalid')
    response.raise_for_status()
except requests.HTTPError as e:
    if e.response.status_code == 404:
        print("Article not found")
    elif e.response.status_code == 429:
        print("Rate limit exceeded, retry later")
```

### JavaScript Example

```javascript
try {
  const response = await fetch('http://localhost:8000/api/v1/articles/invalid');
  if (!response.ok) {
    if (response.status === 404) {
      console.error('Article not found');
    } else if (response.status === 429) {
      console.error('Rate limit exceeded');
    }
  }
} catch (error) {
  console.error('Network error:', error);
}
```

## 📚 Related Documentation

- [API Reference](index.md)
- [Endpoints](endpoints.md)
- [Troubleshooting](../guides/troubleshooting.md)
