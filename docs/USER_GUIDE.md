# LoL Stonks RSS - User Guide

Welcome to LoL Stonks RSS! This guide will help you get started with staying up-to-date with League of Legends news through your favorite RSS reader.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Available Feeds](#available-feeds)
4. [Setting Up Your RSS Reader](#setting-up-your-rss-reader)
5. [Understanding Feed Content](#understanding-feed-content)
6. [Filtering and Organization](#filtering-and-organization)
7. [Troubleshooting](#troubleshooting)
8. [Frequently Asked Questions](#frequently-asked-questions)

---

## Introduction

### What is LoL Stonks RSS?

LoL Stonks RSS is a news aggregation service that collects League of Legends news from official sources and delivers it to you in a standard RSS feed format. Instead of checking multiple websites for LoL news, you can subscribe to our feeds and get all updates in one place.

### What Does It Do?

- **Aggregates News**: Automatically collects news from League of Legends official websites
- **Updates Regularly**: Checks for new articles every 30 minutes
- **Multiple Languages**: Supports English (en-us) and Italian (it-it) news sources
- **Category Filtering**: Allows you to subscribe to specific news categories
- **Standard Format**: Delivers content in RSS 2.0 format compatible with all RSS readers

### Who Is It For?

- League of Legends players who want to stay informed about game updates
- Content creators who need to track LoL news
- Esports enthusiasts following competitive League of Legends
- Anyone who prefers RSS readers over checking websites manually

---

## Getting Started

### Prerequisites

To use LoL Stonks RSS, you need:

1. **An RSS reader application** (see recommendations below)
2. **The feed URL** from your LoL Stonks RSS server
3. **Internet connection** to receive updates

### Quick Start (3 Steps)

**Step 1: Choose Your RSS Reader**

Popular RSS reader options:
- **Feedly** - Web-based, mobile apps (free tier available)
- **Inoreader** - Feature-rich, web and mobile (free tier available)
- **Outlook** - Built into Microsoft Outlook
- **Thunderbird** - Free desktop email/RSS client
- **NetNewsWire** - Free, Mac/iOS only
- **The Old Reader** - Simple, web-based

**Step 2: Get Your Feed URL**

Your feed URL depends on your server location. The format is:

```
http://YOUR-SERVER-ADDRESS:8000/feed.xml
```

Example: `http://localhost:8000/feed.xml` (if running locally)

**Step 3: Add Feed to Your Reader**

Copy the feed URL and paste it into your RSS reader's "Add Feed" or "Subscribe" function. Most readers will automatically detect the feed and start pulling articles.

---

## Available Feeds

### Main Feed (All Sources)

**URL Pattern**: `http://YOUR-SERVER:8000/feed.xml`

This feed contains all news articles from all supported language sources, sorted by publication date (newest first).

**Best For**:
- Users who want comprehensive coverage
- Bilingual users who read both English and Italian news
- Getting a complete picture of all LoL announcements

**Example**:
```
http://localhost:8000/feed.xml
```

### Language-Specific Feeds

#### English Feed

**URL Pattern**: `http://YOUR-SERVER:8000/feed/en-us.xml`

Contains only English-language articles from the League of Legends EN-US news site.

**Best For**:
- English-speaking players
- International audience
- Primary source for global announcements

**Example**:
```
http://localhost:8000/feed/en-us.xml
```

#### Italian Feed

**URL Pattern**: `http://YOUR-SERVER:8000/feed/it-it.xml`

Contains only Italian-language articles from the League of Legends IT-IT news site.

**Best For**:
- Italian-speaking players
- European players preferring Italian content
- Region-specific news

**Example**:
```
http://localhost:8000/feed/it-it.xml
```

### Category Feeds

**URL Pattern**: `http://YOUR-SERVER:8000/feed/category/{CATEGORY-NAME}.xml`

Subscribe to specific news categories to filter content based on your interests.

**Common Categories**:
- `Champions` - New champion releases and reworks
- `Patch` - Patch notes and balance changes
- `Esports` - Competitive League of Legends news
- `Media` - Videos, artwork, and multimedia content
- `Game Updates` - General game updates and features
- `Event` - Special events and seasonal content
- `Dev` - Developer updates and behind-the-scenes

**Examples**:
```
http://localhost:8000/feed/category/Champions.xml
http://localhost:8000/feed/category/Esports.xml
http://localhost:8000/feed/category/Patch.xml
```

**Note**: Category names are case-sensitive and should match exactly as they appear in the articles.

### Discovering Available Categories

To find all available categories:

1. Subscribe to the main feed (`/feed.xml`)
2. Look at the "Categories" field in articles
3. Create category-specific feed URLs using those names

Categories are dynamically derived from article metadata, so new categories may appear as Riot publishes new content types.

### Feed URL Parameters

All feeds support the `limit` parameter to control the number of articles returned:

**URL Pattern**: `http://YOUR-SERVER:8000/feed.xml?limit=25`

**Parameter Details**:
- **Default**: 50 articles
- **Maximum**: 200 articles
- **Minimum**: 1 article

**Examples**:
```
http://localhost:8000/feed.xml?limit=25          (Last 25 articles, all sources)
http://localhost:8000/feed/en-us.xml?limit=100   (Last 100 English articles)
http://localhost:8000/feed/category/Patch.xml?limit=10  (Last 10 patch news)
```

---

## Setting Up Your RSS Reader

### Feedly Setup

**Step-by-Step Instructions**:

1. **Sign Up or Log In**
   - Go to [feedly.com](https://feedly.com)
   - Create a free account or log in

2. **Add Feed**
   - Click the "+" button or search bar at top
   - Paste your feed URL: `http://YOUR-SERVER:8000/feed.xml`
   - Press Enter

3. **Organize Feed**
   - Feedly will detect the feed titled "League of Legends News"
   - Click "Follow" to subscribe
   - Choose a category folder (e.g., "Gaming" or create "LoL News")
   - Click "Add"

4. **Configure Preferences**
   - Click the feed settings (gear icon)
   - Set update frequency (recommended: every 30 minutes)
   - Choose display layout (magazine, cards, or titles)

**Tips for Feedly**:
- Use the "Mark as Read" feature to keep track of what you've seen
- Create multiple category folders for different feed types
- Use the mobile app to read on the go

### Inoreader Setup

**Step-by-Step Instructions**:

1. **Create Account**
   - Visit [inoreader.com](https://www.inoreader.com)
   - Sign up for free account

2. **Add Subscription**
   - Click "+ Add" in the left sidebar
   - Select "Feed" option
   - Paste feed URL: `http://YOUR-SERVER:8000/feed.xml`
   - Click "Subscribe"

3. **Create Folders**
   - Right-click on the feed
   - Select "Add to folder"
   - Create folder: "League of Legends"
   - Move feed to folder

4. **Set Up Rules** (Optional)
   - Click feed settings
   - Create rules to auto-tag articles by keyword
   - Example: Tag articles containing "patch" with "Patch Notes"

**Tips for Inoreader**:
- Use keyboard shortcuts for faster reading (j/k to navigate)
- Enable desktop notifications for important feeds
- Use the search function to find specific articles

### Outlook Setup

**Step-by-Step Instructions** (Outlook 2016/2019/365):

1. **Open RSS Feeds Section**
   - Open Outlook
   - Go to "File" > "Account Settings" > "RSS Feeds"

2. **Add New Feed**
   - Click "New..."
   - Paste feed URL: `http://YOUR-SERVER:8000/feed.xml`
   - Click "Add"

3. **Configure Feed Options**
   - Set feed name: "LoL Stonks - Main Feed"
   - Choose delivery location (create "LoL News" folder)
   - Set update limit: 50 items (or preferred amount)
   - Click "OK"

4. **View Articles**
   - RSS feeds appear in left sidebar under "RSS Subscriptions"
   - Click feed name to view articles
   - Double-click article to read full content

**Tips for Outlook**:
- Create rules to move LoL news to specific folders
- Use categories to color-code different feed types
- Set up Quick Steps for common actions

### Thunderbird Setup

**Step-by-Step Instructions**:

1. **Install Thunderbird**
   - Download from [thunderbird.net](https://www.thunderbird.net)
   - Install and set up (email optional)

2. **Add RSS Account** (First Time)
   - Go to "File" > "New" > "Other Accounts"
   - Select "RSS News & Blogs"
   - Enter account name: "LoL News"
   - Click "Next" and "Finish"

3. **Subscribe to Feed**
   - Right-click "LoL News" in folder pane
   - Select "Subscribe..."
   - Paste feed URL: `http://YOUR-SERVER:8000/feed.xml`
   - Click "Add"

4. **Configure Settings**
   - Right-click feed > "Properties"
   - Set "Check for new articles every": 30 minutes
   - Set "Show article summary": Enabled
   - Click "OK"

**Tips for Thunderbird**:
- Use the article search to find specific news
- Create smart folders to combine multiple feeds
- Export feed list (OPML) to backup your subscriptions

### Mobile RSS Readers

#### iOS (iPhone/iPad)

**Recommended Apps**:

1. **NetNewsWire** (Free)
   - Open App Store and download NetNewsWire
   - Tap "+" > "Add Feed"
   - Enter feed URL
   - Choose folder and tap "Add"

2. **Reeder** (Paid, Premium)
   - Works with Feedly, Inoreader accounts
   - Beautiful interface
   - Excellent gesture controls

#### Android

**Recommended Apps**:

1. **Feedly** (Free)
   - Download from Google Play
   - Sign in to Feedly account
   - Feeds sync automatically from web

2. **Inoreader** (Free)
   - Download from Google Play
   - Sign in to account
   - All feeds sync from web version

3. **FeedMe** (Free)
   - Download from Google Play
   - Tap "+" > "Add feed"
   - Enter URL directly

---

## Understanding Feed Content

### Article Structure

Each article in the RSS feed contains:

**1. Title**
- Full article headline
- Example: "New Champion Spotlight: Briar the Restrained Hunger"

**2. Publication Date**
- When article was published by Riot Games
- Format: RFC 2822 (e.g., "Mon, 28 Dec 2025 14:30:00 GMT")
- Always in GMT/UTC timezone

**3. Link**
- Direct URL to full article on leagueoflegends.com
- Click to read complete article on official site

**4. Description/Summary**
- Brief excerpt or summary of article
- Usually first 1-3 paragraphs
- May include HTML formatting (headings, links, lists)

**5. Categories**
- One or more category tags
- Examples: "Champions", "Patch", "Esports"
- Use these to understand article topic at a glance

**6. Author**
- Usually "League of Legends" or specific author name
- Sourced from official LoL news metadata

**7. Image/Enclosure** (When Available)
- Featured article image
- Displayed in most RSS readers
- Banner or hero image from original article

**8. Unique ID (GUID)**
- Internal identifier ensuring no duplicate articles
- Hidden in most RSS readers

### Update Frequency

**Automatic Updates**:
- Server checks for new articles every **30 minutes**
- Articles published by Riot appear in feed within 30 minutes
- Update interval can be configured by server administrator

**Manual Refresh**:
- Most RSS readers allow manual refresh (pull-to-refresh on mobile)
- Use this if you suspect new content is available

### Article Sorting

Articles are sorted by **publication date** (newest first):
- Latest news always appears at the top
- Older articles scroll down
- RSS readers typically keep unread items highlighted

---

## Filtering and Organization

### Organizing Multiple Feeds

**Strategy 1: Folder/Category Structure**

Create folders in your RSS reader:

```
League of Legends/
  ├── Main Feed (all sources)
  ├── English News
  ├── Italian News
  └── Categories/
      ├── Champions
      ├── Patches
      └── Esports
```

**Strategy 2: Separate by Priority**

Organize by reading priority:

```
High Priority/
  ├── LoL Patches
  └── LoL Esports

Medium Priority/
  ├── LoL Champions
  └── LoL Events

Low Priority/
  └── LoL Media
```

### Using RSS Reader Filters

Most advanced RSS readers (like Inoreader) support filtering:

**Example Filter Rules**:

1. **Auto-Tag Patches**
   - If title contains "Patch" or "Update"
   - Then add tag "Patch Notes"

2. **Highlight Esports**
   - If category contains "Esports"
   - Then mark as important/starred

3. **Filter Language**
   - If source is "it-it"
   - Then move to "Italian" folder

4. **Mark Champions as Read**
   - If category is "Media" AND category is NOT "Champions"
   - Then mark as read (auto-skip)

### Search and Discovery

**Finding Specific Articles**:

Most RSS readers include search features:

1. **Search by Keyword**
   - Search for "Viego", "Worlds", "Patch 13.5"
   - Searches across all feed articles

2. **Search by Date Range**
   - Find all articles from last week
   - Useful for catching up after vacation

3. **Search by Category**
   - Filter to show only "Champions" articles
   - Available in advanced readers

### Reading Workflows

**Workflow 1: Daily Scanner**
1. Open RSS reader once per day
2. Scan titles for interesting news
3. Mark uninteresting as read
4. Read interesting articles immediately
5. Star critical articles for later reference

**Workflow 2: Priority-Based**
1. Check "Patches" feed first (high priority)
2. Read "Esports" feed second
3. Skim "Media" feed if time permits
4. Mark all as read before bed

**Workflow 3: Batch Reader**
1. Let articles accumulate during week
2. Set aside 30 minutes on weekend
3. Batch-read all unread articles
4. Archive or delete after reading

---

## Troubleshooting

### Feed Not Updating

**Symptoms**: No new articles appear, even though Riot published news.

**Solutions**:

1. **Check Server Status**
   - Visit: `http://YOUR-SERVER:8000/health`
   - Should return: `{"status": "healthy"}`
   - If unhealthy, contact server administrator

2. **Manual Refresh in RSS Reader**
   - Most readers: Pull-to-refresh or "Refresh" button
   - Feedly: Click refresh icon next to feed name
   - Inoreader: Right-click feed > "Update feed"

3. **Verify Feed URL**
   - Ensure URL is correct: `http://YOUR-SERVER:8000/feed.xml`
   - Check for typos in server address or port
   - Try accessing URL in web browser to see XML

4. **Check Update Schedule**
   - Server updates every 30 minutes
   - Wait at least 30-45 minutes before troubleshooting
   - Some RSS readers cache feeds (1-6 hours)

5. **RSS Reader Settings**
   - Check feed update frequency in reader settings
   - Ensure feed is not paused or disabled
   - Look for error messages in feed properties

**Still Not Working?**
- Clear RSS reader cache
- Remove and re-add the feed
- Try different RSS reader to isolate issue

### Missing Images

**Symptoms**: Articles appear without featured images or banners.

**Solutions**:

1. **Enable Images in RSS Reader**
   - Feedly: Settings > Advanced > "Show images"
   - Inoreader: Settings > Display > "Show images in articles"
   - Outlook: Trust images from leagueoflegends.com

2. **Check Image Loading Settings**
   - Some readers block images by default (privacy)
   - Whitelist leagueoflegends.com domain
   - Enable "Load remote content"

3. **Network/Firewall Issues**
   - Ensure firewall allows image downloads
   - Check if VPN is blocking Riot CDN
   - Try disabling ad blocker temporarily

4. **Image Not in Source**
   - Some articles legitimately have no featured image
   - Check original article on leagueoflegends.com
   - If original has image, report issue to server admin

### Character Encoding Issues

**Symptoms**: Strange characters (�, â€™, etc.) instead of proper text.

**Solutions**:

1. **Check RSS Reader Encoding**
   - Settings > Encoding > Select "UTF-8"
   - Most modern readers auto-detect correctly

2. **Browser/App Language Settings**
   - Ensure system supports UTF-8
   - Update RSS reader app to latest version

3. **Feed Encoding Declaration**
   - Feed should declare: `<?xml version="1.0" encoding="UTF-8"?>`
   - If missing, contact server administrator

4. **Special Characters**
   - Most common with non-English content (Italian feed)
   - Verify Italian feed displays correctly in browser

### Duplicate Articles

**Symptoms**: Same article appears multiple times in feed.

**Solutions**:

1. **Multiple Feed Subscriptions**
   - Check if you subscribed to same feed twice
   - Remove duplicate subscriptions
   - Example: Both `/feed.xml` and `/feed/en-us.xml` contain English articles

2. **RSS Reader Duplicate Detection**
   - Enable "Remove duplicates" in reader settings
   - Inoreader: Settings > General > "Merge duplicates"
   - Feedly: Automatically merges identical articles

3. **Category Overlap**
   - Category feeds share articles with main feed
   - Expected behavior if subscribed to both
   - Solution: Subscribe to either main OR category feeds, not both

4. **Feed Refresh Issues**
   - Sometimes caused by reader re-importing old articles
   - Solution: Mark all as read, refresh feed

### Feed Not Found (404 Error)

**Symptoms**: RSS reader shows "Feed not found" or "404 error".

**Solutions**:

1. **Verify URL**
   - Check server address is correct
   - Ensure port number is included (`:8000`)
   - Example: `http://192.168.1.100:8000/feed.xml`

2. **Server Running**
   - Ping server to check if online
   - Visit `http://YOUR-SERVER:8000/` in browser
   - Should show API documentation

3. **Network/Firewall**
   - Ensure port 8000 is accessible
   - Check firewall rules allow connections
   - Try from different network (mobile data)

4. **Category Name Typo**
   - Category feeds are case-sensitive
   - Correct: `/feed/category/Champions.xml`
   - Incorrect: `/feed/category/champions.xml`

### Slow Feed Loading

**Symptoms**: Feed takes long time to load or times out.

**Solutions**:

1. **Reduce Article Limit**
   - Add limit parameter: `?limit=25`
   - Example: `http://YOUR-SERVER:8000/feed.xml?limit=25`
   - Default is 50, max is 200

2. **Server Performance**
   - Check server resource usage
   - Contact administrator if consistently slow
   - May need to increase server resources

3. **Network Speed**
   - Test your internet connection
   - Try from different network
   - Use wired connection instead of Wi-Fi

4. **RSS Reader Timeout**
   - Increase timeout in reader settings
   - Some readers default to 30 seconds
   - Set to 60-90 seconds for large feeds

---

## Frequently Asked Questions

### General Questions

**Q: Is LoL Stonks RSS free to use?**

A: This depends on your server administrator. The software itself is open-source, but hosting costs may apply. Check with your server provider.

**Q: Do I need to create an account?**

A: No! RSS feeds are open and don't require authentication. Just add the feed URL to your reader.

**Q: Can I use this on mobile?**

A: Yes! Use any mobile RSS reader app (see recommendations in [Setting Up Your RSS Reader](#setting-up-your-rss-reader) section).

**Q: Is my reading activity tracked?**

A: No. RSS feeds are privacy-friendly. The server doesn't know who reads what or when. Your RSS reader may have its own analytics (check their privacy policy).

### Feed Content

**Q: How often is the feed updated?**

A: The server checks for new articles every 30 minutes. Your RSS reader may have its own update schedule.

**Q: Why don't I see articles from [other LoL site]?**

A: Currently, LoL Stonks RSS only aggregates from official League of Legends news pages (EN-US and IT-IT). Community sites are not included.

**Q: Can I get news in other languages?**

A: Currently only English (en-us) and Italian (it-it) are supported. More languages may be added in the future.

**Q: How far back do articles go?**

A: The feed includes the most recent articles up to the configured limit (default: 50). Older articles are archived but not included in the feed.

**Q: Why are some articles missing descriptions?**

A: Some articles from Riot Games don't include summaries in their metadata. In these cases, only the title and link are available.

### Technical Questions

**Q: What RSS version is used?**

A: RSS 2.0, the most widely supported format compatible with all RSS readers.

**Q: Can I access the feed programmatically?**

A: Yes! The feed is a standard RSS XML file. You can parse it with any RSS library or HTTP client. See technical documentation for details.

**Q: What happens if the server goes down?**

A: Your RSS reader will show the last cached articles. New articles won't appear until the server is back online. No data is lost.

**Q: Can I self-host this?**

A: Yes! The project is open-source. See `DOCKER.md` and `WINDOWS_DEPLOYMENT.md` for deployment instructions.

**Q: Does this violate Riot Games' terms of service?**

A: The service uses publicly available news data from official League of Legends websites. It does not scrape game data, player information, or use unofficial APIs. Always review Riot's current policies.

### Customization

**Q: Can I change the update frequency?**

A: Server administrators can configure the update interval via environment variables. See technical documentation.

**Q: Can I add my own news sources?**

A: Currently, the system is designed for official LoL news only. Extending to other sources requires code modifications.

**Q: Can I filter by multiple categories at once?**

A: RSS feeds support single category filtering only. Subscribe to multiple category feeds in your RSS reader to achieve this.

**Q: Can I get notifications for specific keywords?**

A: Yes! Many RSS readers support keyword alerts. Set up a filter in your reader to get notified when articles contain specific terms (e.g., "Worlds", "Patch 14").

### Troubleshooting

**Q: My RSS reader says "Invalid feed"**

A: This usually means:
1. The feed URL is incorrect (check for typos)
2. The server is not responding (check server status)
3. Your RSS reader doesn't support RSS 2.0 (try a different reader)

**Q: Articles are showing up hours late**

A: This could be due to:
1. Your RSS reader's update schedule (check settings)
2. Time zone differences (feeds use GMT/UTC)
3. Server update interval (default: 30 minutes)

**Q: Can I import my subscriptions to another reader?**

A: Yes! Export your feeds as OPML (most readers support this), then import into the new reader.

### Privacy & Security

**Q: Is HTTPS supported?**

A: This depends on your server configuration. Contact your administrator to enable HTTPS/SSL.

**Q: What data does the server collect?**

A: The basic RSS server doesn't log individual requests. However, web server logs may record IP addresses and access times. Check with your administrator.

**Q: Can I use this feed in a commercial project?**

A: The feed aggregates Riot Games content. Check Riot's legal policies regarding commercial use of their content. The RSS software itself is open-source.

---

## Getting Help

### Support Resources

1. **Server Status Page**
   - Check: `http://YOUR-SERVER:8000/health`
   - Shows if service is healthy and operational

2. **API Documentation**
   - Visit: `http://YOUR-SERVER:8000/docs`
   - Interactive API documentation with all endpoints

3. **Community Support**
   - Check the project's GitHub repository for issues and discussions
   - Search existing issues before posting new ones

4. **Server Administrator**
   - Contact your server administrator for server-specific issues
   - Provide details: feed URL, error messages, screenshots

### Reporting Issues

When reporting problems, include:

1. **Feed URL** you're trying to access
2. **RSS Reader** name and version
3. **Error Message** (exact text or screenshot)
4. **Steps to Reproduce** the problem
5. **Expected Behavior** vs actual behavior

---

## Appendix: RSS Reader Comparison

| Reader | Platform | Price | Best For | Sync | Filters |
|--------|----------|-------|----------|------|---------|
| **Feedly** | Web, iOS, Android | Free/Paid | Beginners, mobile users | Yes | Basic |
| **Inoreader** | Web, iOS, Android | Free/Paid | Power users, automation | Yes | Advanced |
| **NetNewsWire** | Mac, iOS | Free | Apple ecosystem | iCloud | Basic |
| **Outlook** | Windows, Mac | Included | Office users | Exchange | Basic |
| **Thunderbird** | Windows, Mac, Linux | Free | Desktop users | No | Basic |
| **The Old Reader** | Web | Free | Simple interface | Yes | None |
| **FeedMe** | Android | Free | Android power users | Multiple | Advanced |
| **Reeder** | iOS, Mac | Paid | Premium iOS experience | Multiple | Basic |

---

## Appendix: Quick Reference

### Feed URL Templates

```
Main Feed:       http://YOUR-SERVER:8000/feed.xml
English Feed:    http://YOUR-SERVER:8000/feed/en-us.xml
Italian Feed:    http://YOUR-SERVER:8000/feed/it-it.xml
Category Feed:   http://YOUR-SERVER:8000/feed/category/CATEGORY.xml
With Limit:      http://YOUR-SERVER:8000/feed.xml?limit=25
```

### Common Categories

- Champions
- Patch
- Esports
- Media
- Game Updates
- Event
- Dev
- Community

### Update Schedule

- **Server Check**: Every 30 minutes
- **Feed Cache**: 5 minutes
- **Recommended Reader Update**: 30-60 minutes

### Useful Endpoints

```
Health Check:    http://YOUR-SERVER:8000/health
API Docs:        http://YOUR-SERVER:8000/docs
Root Info:       http://YOUR-SERVER:8000/
```

---

**Document Version**: 1.0
**Last Updated**: December 29, 2025
**Compatible With**: LoL Stonks RSS v1.0.0

For technical documentation, see `DOCKER.md`, `WINDOWS_DEPLOYMENT.md`, and `PRODUCTION_CHECKLIST.md`.
