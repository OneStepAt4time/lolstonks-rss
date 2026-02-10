# GitHub Pages Quick Start

Get your live LoL news page on GitHub Pages in 5 minutes.

## What This Does

Sets up automatic publishing of League of Legends news to a GitHub Pages site that updates every 5 minutes.

## Prerequisites

- GitHub account with push access to `OneStepAt4time/lolstonks-rss`
- Repository must be public (or GitHub Pro/Enterprise for private repos)

## Step 1: Enable GitHub Pages (2 minutes)

1. Go to your repository on GitHub
2. Click **Settings** (top navigation)
3. In the left sidebar, click **Pages**
4. Under **Source**, select **GitHub Actions**
5. Click **Save**

## Step 2: Configure Workflow Permissions (1 minute)

1. Still in **Settings**, click **Actions** in the left sidebar
2. Click **General**
3. Scroll to **Workflow permissions**
4. Select **Read and write permissions**
5. Check **Allow GitHub Actions to create and approve pull requests**
6. Click **Save**

## Step 3: Trigger First Deployment (1 minute)

1. Go to **Actions** tab
2. Click **Publish News to GitHub Pages** in the left sidebar
3. Click **Run workflow** button (right side)
4. Select branch (`main` or `master`)
5. Click **Run workflow**

## Step 4: Verify Your News Page (1 minute)

Once the workflow completes successfully (2-3 minutes):

1. Visit `https://OneStepAt4time.github.io/lolstonksrss/`
2. You should see the news page with latest LoL articles
3. The page will auto-update every 5 minutes

## Customize Your Feed

### Change Update Frequency

Edit `.github/workflows/publish-news.yml`:

```yaml
# Every 5 minutes (default)
- cron: '*/5 * * * *'

# Every 10 minutes
- cron: '*/10 * * * *'

# Every 30 minutes
- cron: '*/30 * * * *'
```

### Change Article Limit

Edit the workflow inputs or `.env` file:
```env
ARTICLE_LIMIT=100
```

## Automatic Updates from Windows App (Optional)

For real-time updates when new articles are detected:

1. Edit `.env` file:
```env
ENABLE_GITHUB_PAGES_SYNC=true
GITHUB_TOKEN=ghp_yourTokenHere
GITHUB_REPOSITORY=OneStepAt4time/lolstonks-rss
```

2. Generate GitHub Token:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Scopes: `repo` and `workflow`
   - Copy token

3. Restart container:
```powershell
docker-compose restart
```

## Troubleshooting

### Workflow Fails
- Check Actions tab for error logs
- Verify GitHub Pages is enabled
- Check workflow permissions (Read and write)

### Page Not Updating
- Check Actions tab - workflow should run every 5 minutes
- Hard refresh browser (Ctrl+F5)
- Check for workflow errors in Actions tab

### Token Issues
- Verify token has `repo` and `workflow` scopes
- Check token hasn't expired
- Regenerate token if needed

## Next Steps

- **[GitHub Pages Integration Guide](docs/GITHUB_PAGES_INTEGRATION.md)** - Complete setup documentation
- **[GitHub Pages Setup](docs/SETUP_GITHUB_PAGES.md)** - Step-by-step configuration
- **[GitHub Pages News Automation](docs/GITHUB_PAGES_NEWS.md)** - Full automation docs

## Your Live URL

Once setup, your news page will be available at:
```
https://YOUR-USERNAME.github.io/lolstonksrss/
```

Replace `YOUR-USERNAME` with your actual GitHub username.
