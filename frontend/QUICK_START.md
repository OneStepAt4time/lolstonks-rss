# Quick Start Guide - Frontend Deployment

## Prerequisites

1. Node.js 20+ installed
2. GitHub repository with GitHub Pages enabled
3. Backend API running (for local development)

## Local Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev
```

The dev server proxies API requests to `http://localhost:8000`.

## Build for Production

```bash
# Build the application
npm run build

# This will:
# 1. Compile TypeScript (Vite handles this)
# 2. Build React app
# 3. Generate sitemap.xml (202 URLs)
# 4. Generate robots.txt
# 5. Output to dist/ directory
```

## Test Production Build Locally

```bash
# Preview the production build
npm run preview

# Serves the dist/ directory at http://localhost:4173
```

## Deployment

### Automatic Deployment (Recommended)

1. Push changes to `main` or `master` branch
2. GitHub Actions automatically:
   - Runs ESLint checks
   - Builds the application
   - Generates sitemap and robots.txt
   - Deploys to GitHub Pages

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy the contents of dist/ to GitHub Pages
# (Use GitHub web interface or gh-pages CLI)
```

## Environment Variables

### Production (.env.production)

```env
VITE_API_BASE_URL=https://onestepat4time.github.io/lolstonksrss
VITE_SITE_NAME=LoL Stonks RSS
VITE_SITE_URL=https://onestepat4time.github.io/lolstonksrss
```

### Development

Uses proxy configuration in `vite.config.ts` to forward API requests to `http://localhost:8000`.

## SEO Features

### Automatic Generation

- **Sitemap**: 202 URLs (main pages, locale feeds, category feeds, source feeds)
- **Robots.txt**: Allows all crawlers
- **Meta Tags**: Dynamic for each page
- **Structured Data**: JSON-LD format

### Verification

After deployment, verify at:
- Sitemap: `https://onestepat4time.github.io/lolstonksrss/sitemap.xml`
- Robots: `https://onestepat4time.github.io/lolstonksrss/robots.txt`
- Structured Data: Use Google's Rich Results Test

## Troubleshooting

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf dist
```

### TypeScript Errors

Vite builds successfully even with TypeScript errors. For strict checking:

```bash
# Run TypeScript compiler
npx tsc --noEmit
```

### Deployment Issues

1. Check GitHub Actions logs
2. Verify GitHub Pages is enabled
3. Check repository settings for Pages source
4. Ensure `base` path in vite.config.ts matches GitHub Pages URL

## File Structure

```
frontend/
├── dist/                  # Build output (deploy this)
├── src/                   # Source code
├── public/                # Static assets
├── scripts/               # Build scripts
├── .env.production        # Production environment
├── vite.config.ts         # Vite configuration
├── package.json           # Dependencies and scripts
└── DEPLOYMENT.md          # Comprehensive deployment guide
```

## Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run generate-sitemap # Generate sitemap only
npm run generate-robots  # Generate robots.txt only
```

## Performance Targets

- **Build Time**: < 30 seconds
- **Bundle Size**: < 1.5 MB (total), < 200 KB (initial)
- **Lighthouse Score**: > 90 (all categories)
- **Sitemap URLs**: 202

## Next Steps

1. Enable GitHub Pages in repository settings
2. Set source to `gh-pages` branch (or `/root` depending on workflow)
3. Push to main/master to trigger deployment
4. Verify deployment at GitHub Pages URL
5. Submit sitemap to Google Search Console

## Support

For detailed information, see `DEPLOYMENT.md`.
