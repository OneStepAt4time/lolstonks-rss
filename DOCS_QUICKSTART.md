# Documentation Website Quick Start

## 🚀 Viewing the Documentation

### Local Development Server

Start the live-reloading development server:

```bash
mkdocs serve
```

Then open your browser to: **http://127.0.0.1:8000**

The server will automatically reload when you make changes to documentation files.

### Build Static Site

Build the static HTML site:

```bash
mkdocs build
```

Output will be in the `site/` directory. You can open `site/index.html` in your browser.

## 📝 Making Changes

### Edit Documentation

1. **Edit Files**: Modify markdown files in `docs/` directory
2. **Preview**: Run `mkdocs serve` to see changes live
3. **Build**: Run `mkdocs build` to generate static site
4. **Deploy**: Push to GitHub to trigger automatic deployment

### Add New Pages

1. Create new `.md` file in appropriate `docs/` subdirectory
2. Add entry to navigation in `mkdocs.yml`
3. Preview with `mkdocs serve`
4. Commit and push

### Customize Styling

- **CSS**: Edit `overrides/assets/stylesheets/extra.css`
- **JavaScript**: Edit `overrides/assets/javascripts/extra.js`
- **Logo**: Replace `docs/assets/images/logo.svg`

## 🎨 Documentation Structure

```
docs/
├── index.md                    # Landing page
├── getting-started/            # Installation & setup
├── guides/                     # User guides
│   └── deployment/            # Deployment guides
├── api/                       # API reference
├── architecture/              # System architecture
├── development/               # Developer docs
└── demo/                      # Live demos
```

## 🔧 Common Commands

```bash
# Install documentation dependencies
uv pip install -e ".[docs]"

# Serve locally with live reload
mkdocs serve

# Build static site
mkdocs build

# Build with validation
mkdocs build --strict

# Deploy to GitHub Pages (manual)
mkdocs gh-deploy

# Clean build directory
rm -rf site/
```

## 🌐 Deployment

### Automatic (GitHub Actions)

Documentation automatically deploys to GitHub Pages when you push to `main` branch.

**GitHub Pages URL**: `https://yourusername.github.io/lolstonksrss`

### Manual Deployment

```bash
# Build and deploy to gh-pages branch
mkdocs gh-deploy
```

## 📦 Files Overview

| File | Purpose |
|------|---------|
| `mkdocs.yml` | Main configuration |
| `docs/` | Documentation content |
| `overrides/` | Custom theme files |
| `site/` | Built site (generated) |
| `.github/workflows/deploy-docs.yml` | CI/CD pipeline |

## 🎯 Key Features

- **Live Reload**: Changes appear instantly during development
- **Search**: Full-text search built-in
- **Mobile Responsive**: Works on all devices
- **Dark Mode**: Light/dark theme toggle
- **Code Highlighting**: Syntax highlighting for all languages
- **Interactive**: RSS feed preview widget
- **Fast**: Instant navigation, optimized assets

## 🐛 Troubleshooting

### Site Won't Build

```bash
# Check for errors
mkdocs build --strict

# Verify dependencies installed
uv pip list | grep mkdocs
```

### Port Already in Use

```bash
# Use different port
mkdocs serve -a localhost:8001
```

### Changes Not Showing

```bash
# Clear browser cache
# Or use hard refresh (Ctrl+F5)

# Rebuild site
rm -rf site/
mkdocs build
```

## 📚 Resources

- **MkDocs**: https://www.mkdocs.org/
- **Material Theme**: https://squidfunk.github.io/mkdocs-material/
- **Markdown Guide**: https://www.markdownguide.org/

## ✨ Tips

- Use `mkdocs serve` during development for instant feedback
- Check `mkdocs build --strict` before committing
- Preview on mobile using `mkdocs serve -a 0.0.0.0:8000`
- Keep navigation structure logical and shallow
- Use admonitions for tips, warnings, notes
- Add code examples liberally
- Include diagrams for complex concepts

## 🎓 Next Steps

1. Start development server: `mkdocs serve`
2. Open http://127.0.0.1:8000 in browser
3. Explore the documentation
4. Make changes and see them live
5. Push to GitHub to deploy

---

**Happy Documenting!** 📖
