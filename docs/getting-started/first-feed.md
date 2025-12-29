---
title: Creating Your First Feed
description: Step-by-step guide to creating your first RSS feed
---

# Creating Your First Feed

Learn how to create and customize your first LoL Stonks RSS feed.

## Step 1: Start the Server

Choose your method:

=== "Docker"
    ```bash
    docker run -d -p 8000:8000 --name lolstonks lolstonksrss
    ```

=== "Python"
    ```bash
    python main.py
    ```

Verify the server is running:
```bash
curl http://localhost:8000/health
```

## Step 2: Access the RSS Feed

Your RSS feed is immediately available at:
```
http://localhost:8000/feed
```

**View in browser:**
Open `http://localhost:8000/feed` to see the XML

**Subscribe in RSS reader:**
Add `http://localhost:8000/feed` to your favorite RSS reader

## Step 3: Customize Your Feed

Edit environment variables to customize:

=== "Docker"
    ```bash
    docker run -d -p 8000:8000 \
      -e FEED_TITLE="My LoL News Feed" \
      -e FEED_DESCRIPTION="Latest League news for summoners" \
      -e RSS_MAX_ITEMS=100 \
      lolstonksrss
    ```

=== ".env File"
    ```bash
    # Create .env file
    FEED_TITLE=My LoL News Feed
    FEED_DESCRIPTION=Latest League news for summoners
    RSS_MAX_ITEMS=100
    UPDATE_INTERVAL=1800
    ```

## Step 4: Trigger First Update

Wait for automatic update or trigger manually:

```bash
curl -X POST http://localhost:8000/api/v1/update
```

## Step 5: Verify Feed Content

Check that articles are loading:

```bash
# Get feed
curl http://localhost:8000/feed

# Or get as JSON
curl http://localhost:8000/api/v1/articles
```

## Feed Structure

Your RSS feed includes:

- **Channel metadata**: Title, description, link
- **Articles**: Title, link, description, publication date
- **Categories**: Article tags and categories
- **GUIDs**: Unique identifiers for each article
- **Images**: Featured images when available

## Customization Options

### Feed Metadata

```bash
FEED_TITLE=My Custom Feed
FEED_DESCRIPTION=Custom description
FEED_LINK=https://example.com
FEED_LANGUAGE=en-US
```

### Content Settings

```bash
RSS_MAX_ITEMS=50          # Max items in feed
UPDATE_INTERVAL=3600      # Update every hour
CACHE_TTL_SECONDS=1800    # Cache for 30 minutes
```

### Filtering

```bash
# Coming soon: Source filtering
SOURCES=lol-en-us,lol-en-gb
```

## Testing Your Feed

### Validate RSS

Use online validators:
- [W3C Feed Validator](https://validator.w3.org/feed/)
- [RSS Board Validator](http://www.rssboard.org/rss-validator/)

### Test with curl

```bash
# Get feed
curl http://localhost:8000/feed

# Check specific article
curl http://localhost:8000/api/v1/articles/{guid}
```

### Test in RSS Readers

Popular readers to test with:
- **Feedly** - feedly.com
- **Inoreader** - inoreader.com
- **NetNewsWire** - netnewswireapp.com

## Monitoring Your Feed

### View Logs

=== "Docker"
    ```bash
    docker logs -f lolstonks
    ```

=== "Python"
    Check console output

### Check Stats

```bash
curl http://localhost:8000/api/v1/stats
```

Returns:
```json
{
  "total_articles": 150,
  "sources": ["lol-en-us"],
  "last_update": "2024-01-15T10:30:00Z"
}
```

## Next Steps

<div class="feature-grid">
  <div class="feature-card">
    <h3>🚀 Deploy</h3>
    <p>Deploy to production</p>
    <a href="../guides/deployment/">Deploy Guide →</a>
  </div>

  <div class="feature-card">
    <h3>⚙️ Advanced Config</h3>
    <p>Advanced configuration</p>
    <a href="../guides/advanced/">Advanced Guide →</a>
  </div>

  <div class="feature-card">
    <h3>📊 Monitoring</h3>
    <p>Monitor your feed</p>
    <a href="../architecture/performance/">Performance →</a>
  </div>
</div>

## Common Issues

### No Articles Showing

**Solution 1**: Wait for first update
```bash
# Check update interval
curl http://localhost:8000/health
```

**Solution 2**: Trigger manual update
```bash
curl -X POST http://localhost:8000/api/v1/update
```

### Feed Not Updating

Check scheduler logs:
```bash
docker logs lolstonks | grep scheduler
```

### RSS Reader Can't Find Feed

Ensure:
1. Server is running: `curl http://localhost:8000/health`
2. URL is correct: `http://localhost:8000/feed`
3. Firewall allows access
4. Use public IP if accessing remotely

For more help, see [Troubleshooting Guide](../guides/troubleshooting.md).
