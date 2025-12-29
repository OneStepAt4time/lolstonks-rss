---
title: Live Demo
description: Try LoL Stonks RSS live
---

# Live Demo

Experience LoL Stonks RSS in action with our interactive demo and RSS feed tester.

## 📡 RSS Feed Tester

<div class="rss-preview">
  <h3>Test Any RSS Feed</h3>
  <p>Enter a feed URL to preview its contents:</p>

  <div class="rss-input-group">
    <input type="text" class="rss-input rss-feed-url" value="http://localhost:8000/feed" placeholder="Enter RSS feed URL">
    <button class="rss-button rss-load-button">Load Feed</button>
  </div>

  <div class="rss-output">
    <div class="rss-loading">Enter a feed URL and click "Load Feed" to test</div>
  </div>
</div>

## 🎯 Quick Test URLs

Try these example feeds:

<div class="feature-grid">
  <div class="feature-card">
    <h4>Local Development</h4>
    <code>http://localhost:8000/feed</code>
    <br><br>
    <button class="rss-button" onclick="document.querySelector('.rss-feed-url').value='http://localhost:8000/feed'; document.querySelector('.rss-load-button').click();">Test</button>
  </div>

  <div class="feature-card">
    <h4>JSON API</h4>
    <code>http://localhost:8000/api/v1/articles</code>
    <br><br>
    <button class="rss-button" onclick="window.open('http://localhost:8000/api/v1/articles', '_blank')">Open</button>
  </div>

  <div class="feature-card">
    <h4>Health Check</h4>
    <code>http://localhost:8000/health</code>
    <br><br>
    <button class="rss-button" onclick="window.open('http://localhost:8000/health', '_blank')">Check</button>
  </div>
</div>

## 🔍 What to Look For

When testing your RSS feed, verify:

### ✅ Valid XML Structure
- RSS 2.0 compliant
- Well-formed XML
- No parsing errors

### ✅ Channel Information
- Title and description
- Link to website
- Language setting
- Last build date

### ✅ Item Quality
- Unique GUIDs for each item
- Valid publication dates
- Descriptions present
- Working links

### ✅ Performance
- Fast load times (\<500ms)
- Reasonable feed size
- Efficient caching

## 🧪 Testing Checklist

Use this checklist to verify your feed:

- [ ] Feed loads successfully
- [ ] Valid RSS 2.0 XML format
- [ ] Contains expected number of items
- [ ] All items have titles
- [ ] All items have unique GUIDs
- [ ] Publication dates are correct
- [ ] Links work and point to correct articles
- [ ] Descriptions are present and formatted
- [ ] Categories/tags are included
- [ ] Feed metadata is correct

## 🛠️ Developer Tools

### cURL Examples

```bash
# Get RSS feed
curl http://localhost:8000/feed

# Get JSON response
curl http://localhost:8000/api/v1/articles

# Get specific article
curl http://localhost:8000/api/v1/articles/{guid}

# Trigger update
curl -X POST http://localhost:8000/api/v1/update

# Health check
curl http://localhost:8000/health
```

### Python Example

```python
import feedparser
import requests

# Parse RSS feed
feed = feedparser.parse('http://localhost:8000/feed')

print(f"Feed Title: {feed.feed.title}")
print(f"Items: {len(feed.entries)}")

for entry in feed.entries[:5]:
    print(f"- {entry.title}")
    print(f"  {entry.link}")
    print(f"  {entry.published}")
```

### JavaScript Example

```javascript
// Fetch and display RSS feed
async function loadRSSFeed(url) {
  const response = await fetch(url);
  const text = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, 'text/xml');

  const items = xml.querySelectorAll('item');
  items.forEach(item => {
    console.log(item.querySelector('title').textContent);
    console.log(item.querySelector('link').textContent);
  });
}

loadRSSFeed('http://localhost:8000/feed');
```

## 🌐 Online Validators

Validate your feed with these tools:

- **W3C Feed Validator**
  - URL: https://validator.w3.org/feed/
  - Checks RSS/Atom compliance

- **RSS Board Validator**
  - URL: http://www.rssboard.org/rss-validator/
  - RSS 2.0 specification validation

- **FeedValidator.org**
  - URL: https://www.feedvalidator.org/
  - Comprehensive feed testing

## 📊 Performance Testing

### Load Testing

```bash
# Apache Bench
ab -n 1000 -c 10 http://localhost:8000/feed

# Or with curl
for i in {1..100}; do
  curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8000/feed
done
```

### Response Time Monitoring

```bash
# Check response time
curl -w "Time: %{time_total}s\n" -o /dev/null -s http://localhost:8000/feed
```

## 🔗 Integration Examples

### Feedly

```
https://feedly.com/i/subscription/feed/http://localhost:8000/feed
```

### RSS Reader Integration

Most RSS readers accept the feed URL directly:
```
http://localhost:8000/feed
```

## 📱 Mobile Testing

Test on mobile devices:

1. Ensure server is accessible on network
2. Use device's RSS reader app
3. Add feed: `http://YOUR_IP:8000/feed`

## 🚀 Next Steps

<div class="feature-grid">
  <div class="feature-card">
    <h3>📖 Documentation</h3>
    <p>Read full documentation</p>
    <a href="../getting-started/">Get Started →</a>
  </div>

  <div class="feature-card">
    <h3>🔧 API Reference</h3>
    <p>Explore all endpoints</p>
    <a href="../api/">API Docs →</a>
  </div>

  <div class="feature-card">
    <h3>🚀 Deploy</h3>
    <p>Deploy to production</p>
    <a href="../guides/deployment/">Deploy →</a>
  </div>
</div>

!!! info "Need Help?"
    Check the [FAQ](../faq.md) or [Troubleshooting Guide](../guides/troubleshooting.md) for common issues.
