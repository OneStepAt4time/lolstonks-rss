---
title: RSS Feed Tester
description: Interactive RSS feed testing tool
---

# RSS Feed Tester

Interactive tool to test and validate RSS feeds.

## 🧪 Feed Tester

<div class="rss-preview">
  <h3>Load and Test RSS Feed</h3>

  <div class="rss-input-group">
    <input type="text" class="rss-input rss-feed-url" value="http://localhost:8000/feed" placeholder="Enter RSS feed URL">
    <button class="rss-button rss-load-button">Load Feed</button>
  </div>

  <div class="rss-output">
    <div class="rss-loading">
      <p><strong>Instructions:</strong></p>
      <ol>
        <li>Enter your RSS feed URL above</li>
        <li>Click "Load Feed" to test</li>
        <li>Review the results below</li>
      </ol>
      <p><em>Default: http://localhost:8000/feed</em></p>
    </div>
  </div>
</div>

## 🎯 Pre-configured Test URLs

Quick test with these URLs:

<div class="quick-start">
  <h3>Local Development Server</h3>
  <div class="rss-input-group">
    <input type="text" class="rss-input" value="http://localhost:8000/feed" readonly>
    <button class="rss-button" onclick="document.querySelector('.rss-feed-url').value='http://localhost:8000/feed'; document.querySelector('.rss-load-button').click();">Test</button>
  </div>
</div>

<div class="quick-start">
  <h3>Alternative Port (9000)</h3>
  <div class="rss-input-group">
    <input type="text" class="rss-input" value="http://localhost:9000/feed" readonly>
    <button class="rss-button" onclick="document.querySelector('.rss-feed-url').value='http://localhost:9000/feed'; document.querySelector('.rss-load-button').click();">Test</button>
  </div>
</div>

## 📋 Validation Checklist

After loading a feed, verify:

### XML Structure
- [ ] Valid XML syntax
- [ ] RSS 2.0 specification
- [ ] No parsing errors
- [ ] Proper encoding (UTF-8)

### Channel Metadata
- [ ] Feed title present
- [ ] Feed description present
- [ ] Valid feed link
- [ ] Language specified
- [ ] Last build date included

### Item Quality
- [ ] Items have unique GUIDs
- [ ] Valid publication dates
- [ ] Titles are descriptive
- [ ] Links are valid URLs
- [ ] Descriptions are present
- [ ] Categories/tags included

### Performance
- [ ] Load time \< 500ms
- [ ] Appropriate feed size
- [ ] Efficient caching
- [ ] Gzip compression (if applicable)

## 🔍 Advanced Testing

### Manual XML Inspection

View raw XML:
```bash
curl http://localhost:8000/feed
```

### Validate with feedparser

Python validation:
```python
import feedparser

feed = feedparser.parse('http://localhost:8000/feed')

# Check for errors
if feed.bozo:
    print(f"Error: {feed.bozo_exception}")
else:
    print(f"Valid feed with {len(feed.entries)} items")
```

### Performance Testing

Measure response time:
```bash
curl -w "\nTime: %{time_total}s\n" \
  -o /dev/null -s \
  http://localhost:8000/feed
```

## 🌐 External Validators

Test with these online tools:

<div class="feature-grid">
  <div class="feature-card">
    <h3>W3C Validator</h3>
    <p>Official W3C feed validation</p>
    <a href="https://validator.w3.org/feed/" target="_blank">Validate →</a>
  </div>

  <div class="feature-card">
    <h3>RSS Board</h3>
    <p>RSS 2.0 compliance check</p>
    <a href="http://www.rssboard.org/rss-validator/" target="_blank">Validate →</a>
  </div>

  <div class="feature-card">
    <h3>FeedValidator</h3>
    <p>Comprehensive testing</p>
    <a href="https://www.feedvalidator.org/" target="_blank">Validate →</a>
  </div>
</div>

## 🛠️ Troubleshooting Test Failures

### Connection Refused

**Problem**: Can't connect to feed URL

**Solutions**:
```bash
# 1. Check if server is running
docker ps

# 2. Verify port
curl http://localhost:8000/health

# 3. Check firewall
netstat -an | grep 8000
```

### Invalid XML

**Problem**: Feed fails XML validation

**Solutions**:
- Check server logs for errors
- Verify data encoding (UTF-8)
- Test with curl to see raw output

### Empty Feed

**Problem**: Feed loads but has no items

**Solutions**:
```bash
# Trigger manual update
curl -X POST http://localhost:8000/api/v1/update

# Check logs
docker logs lolstonks

# Verify database
curl http://localhost:8000/api/v1/stats
```

### Slow Load Times

**Problem**: Feed takes too long to load

**Solutions**:
- Check cache configuration
- Reduce RSS_MAX_ITEMS
- Enable compression
- Monitor server resources

## 📊 Test Report Template

Use this template to document your testing:

```markdown
## RSS Feed Test Report

**Date**: 2024-01-15
**Feed URL**: http://localhost:8000/feed
**Tester**: Your Name

### Results

- [ ] Connection successful
- [ ] Valid XML structure
- [ ] RSS 2.0 compliant
- [ ] All items have GUIDs
- [ ] Publication dates correct
- [ ] Links functional
- [ ] Load time acceptable

### Issues Found

1. Issue description
2. Another issue

### Recommendations

1. Recommendation 1
2. Recommendation 2

### Overall Status

✅ PASS / ❌ FAIL
```

## 🚀 Next Steps

After testing your feed:

<div class="feature-grid">
  <div class="feature-card">
    <h3>🔧 Optimize</h3>
    <p>Improve feed performance</p>
    <a href="../architecture/performance/">Performance →</a>
  </div>

  <div class="feature-card">
    <h3>🚀 Deploy</h3>
    <p>Move to production</p>
    <a href="../guides/deployment/">Deploy →</a>
  </div>

  <div class="feature-card">
    <h3>📊 Monitor</h3>
    <p>Set up monitoring</p>
    <a href="../guides/user-guide/#monitoring">Monitor →</a>
  </div>
</div>

## 💡 Tips

!!! tip "Best Practices"
    - Test regularly during development
    - Validate before deploying
    - Monitor load times
    - Check feed size
    - Verify on multiple RSS readers
    - Test on mobile devices

!!! warning "Common Mistakes"
    - Not validating XML encoding
    - Forgetting unique GUIDs
    - Invalid publication dates
    - Missing descriptions
    - Broken links

For more help, see [Troubleshooting Guide](../guides/troubleshooting.md).
