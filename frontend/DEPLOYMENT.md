# Frontend Deployment Guide

This guide covers deploying the LoL Stonks RSS React frontend to GitHub Pages.

## Prerequisites

- GitHub repository with GitHub Pages enabled
- Node.js 20+ installed locally
- npm or yarn package manager

## Local Development

### Install Dependencies

```bash
cd frontend
npm install
```

### Run Development Server

```bash
npm run dev
```

The dev server will start at `http://localhost:3000` with API proxy to `http://localhost:8000`.

### Build for Production

```bash
npm run build
```

This will:
1. Compile TypeScript
2. Build the React app with Vite
3. Generate `sitemap.xml` with all 2,700+ feed URLs
4. Generate `robots.txt`
5. Output to `frontend/dist/` directory

### Test Production Build Locally

```bash
npm run preview
```

## GitHub Pages Deployment

### Automatic Deployment

The frontend is automatically deployed to GitHub Pages via GitHub Actions when:

1. Code is pushed to `main` or `master` branch
2. Changes are made to `frontend/` directory or the workflow file

#### Workflow Features

- Runs ESLint checks
- Builds the application
- Generates sitemap and robots.txt
- Deploys to GitHub Pages
- Only deploys on push to main/master (not on PRs)

#### Deployment URL

https://onestepat4time.github.io/lolstonksrss/

### Manual Deployment

If you need to deploy manually:

```bash
cd frontend
npm run build
# Deploy the contents of dist/ to GitHub Pages
```

## SEO Optimization

### Meta Tags

The application includes comprehensive SEO meta tags:

- Page titles and descriptions
- Open Graph tags (Facebook, LinkedIn)
- Twitter Card tags
- Canonical URLs
- Robots directives

### Structured Data

JSON-LD structured data is automatically generated for:

- Website schema
- Breadcrumb lists
- Article schema (when viewing individual articles)

### Sitemap

The sitemap is automatically generated during build and includes:

- Main pages (/, /feeds)
- All 20 locale feeds
- All category feeds (100 combinations)
- All source feeds (80 combinations)
- Total: 2,700+ URLs

Sitemap location: `https://onestepat4time.github.io/lolstonksrss/sitemap.xml`

### Robots.txt

The robots.txt file allows all crawlers and references the sitemap.

## Environment Variables

### Production (.env.production)

```
VITE_API_BASE_URL=https://onestepat4time.github.io/lolstonksrss
VITE_SITE_NAME=LoL Stonks RSS
VITE_SITE_URL=https://onestepat4time.github.io/lolstonksrss
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false
```

### Development

Uses `http://localhost:8000` for API proxy (configured in vite.config.ts).

## Build Optimization

### Code Splitting

The application uses advanced code splitting:

- React core (react, react-dom)
- React Router
- Three.js (3D visualizations)
- UI libraries (framer-motion, zustand)
- Vendor chunks

### Bundle Size

Target bundle sizes:
- Initial JS: < 200 KB
- Each chunk: < 500 KB
- Total initial load: < 1 MB

### Performance Optimization

- Tree shaking
- Minification
- CSS code splitting
- Asset inline optimization
- Source maps for production debugging

## Monitoring and Analytics

### Lighthouse CI

Consider adding Lighthouse CI for automated performance testing:

```yaml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v10
  with:
    urls: |
      https://onestepat4time.github.io/lolstonksrss/
      https://onestepat4time.github.io/lolstonksrss/feeds
    uploadArtifacts: true
```

### Target Metrics

- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 95

## Troubleshooting

### Build Failures

1. **TypeScript errors**: Check types and fix issues
2. **ESLint errors**: Run `npm run lint` to see issues
3. **Memory issues**: Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`

### Deployment Issues

1. **GitHub Pages not updating**: Check GitHub Actions logs
2. **404 errors**: Verify `base` path in vite.config.ts
3. **API errors**: Ensure backend is deployed and accessible

### Sitemap Issues

If sitemap doesn't generate:

```bash
cd frontend
npm run generate-sitemap
```

Check console output for errors.

## Custom Domain (Optional)

To use a custom domain:

1. Add `CNAME` file to `frontend/public/`
2. Configure DNS records
3. Update environment variables
4. Update sitemap and canonical URLs

## Security

- No sensitive data in frontend code
- API calls to backend only (no direct database access)
- HTTPS enforced on GitHub Pages
- Content Security Policy headers (configure via GitHub Pages if needed)

## Maintenance

### Regular Updates

- Update dependencies: `npm update`
- Check for vulnerabilities: `npm audit`
- Review bundle size: `npm run build` and check output

### Content Updates

- Update meta descriptions for seasonal events
- Refresh Open Graph images
- Review sitemap for new feed types

## Rollback Procedure

If deployment issues occur:

1. Revert to previous commit
2. Push to main/master
3. GitHub Actions will auto-deploy previous version
4. Clear CDN cache if needed

## Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/build.html)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [React Router Deployment](https://reactrouter.com/en/main/start/overview#deploying)
- [Web.dev SEO Guide](https://web.dev/seo/)
