---
title: Development
description: Development guide for contributing to LoL Stonks RSS
---

# Development

Resources for developers who want to contribute to or extend LoL Stonks RSS.

## 👨‍💻 Developer Resources

<div class="feature-grid">
  <div class="feature-card">
    <h3>📚 Developer Guide</h3>
    <p>Complete development setup and workflow</p>
    <a href="guide/">Developer Guide →</a>
  </div>

  <div class="feature-card">
    <h3>🤝 Contributing</h3>
    <p>How to contribute to the project</p>
    <a href="contributing/">Contributing →</a>
  </div>

  <div class="feature-card">
    <h3>🧪 Testing</h3>
    <p>Testing guidelines and procedures</p>
    <a href="testing/">Testing →</a>
  </div>

  <div class="feature-card">
    <h3>✨ Code Quality</h3>
    <p>Code standards and quality tools</p>
    <a href="code-quality/">Code Quality →</a>
  </div>
</div>

## 🚀 Quick Start for Developers

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/lolstonksrss.git
cd lolstonksrss
```

### 2. Install Dependencies

```bash
# Using UV (recommended)
uv sync --dev

# Or using pip
pip install -e ".[dev]"
```

### 3. Run Tests

```bash
pytest
```

### 4. Start Development Server

```bash
python main.py
```

## 🛠️ Development Environment

### Required Tools

- **Python 3.11+**
- **Git**
- **UV** or **pip**
- **Docker** (optional, for testing)
- **VS Code** or your preferred IDE

### Recommended VS Code Extensions

- Python
- Pylance
- Black Formatter
- Ruff
- Docker
- GitLens

### IDE Configuration

**VS Code settings.json:**
```json
{
  "python.linting.enabled": true,
  "python.linting.mypyEnabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "python.testing.pytestEnabled": true
}
```

## 📝 Development Workflow

### 1. Create Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Edit code, add tests, update documentation.

### 3. Run Tests

```bash
# Run all tests
pytest

# With coverage
pytest --cov=src --cov-report=html

# Specific tests
pytest tests/test_specific.py -v
```

### 4. Code Quality Checks

```bash
# Format code
black src/ tests/

# Type checking
mypy src/

# Linting
ruff check src/ tests/

# All checks
./scripts/quality.sh  # if available
```

### 5. Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/).

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 🧪 Testing

### Run Tests

```bash
# All tests
pytest

# With coverage
pytest --cov=src

# Verbose output
pytest -v

# Stop on first failure
pytest -x

# Run specific test
pytest tests/test_models.py::test_article_creation -v
```

### Test Structure

```
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── e2e/              # End-to-end tests
├── fixtures/         # Test fixtures
└── conftest.py       # Pytest configuration
```

See [Testing Guide](testing.md) for details.

## 📦 Project Structure

```
lolstonksrss/
├── src/                    # Source code
│   ├── api/               # API endpoints
│   │   ├── __init__.py
│   │   └── routes.py
│   ├── rss/               # RSS generation
│   │   ├── __init__.py
│   │   └── generator.py
│   ├── fetchers/          # News fetchers
│   ├── models.py          # Data models
│   ├── database.py        # Repository
│   ├── config.py          # Configuration
│   └── utils/             # Utilities
├── tests/                 # Test suite
├── docs/                  # Documentation
├── scripts/               # Utility scripts
├── data/                  # Database storage
├── main.py               # Entry point
├── pyproject.toml        # Project config
├── Dockerfile            # Container config
└── README.md             # Project readme
```

## 🎨 Code Standards

### Python Style Guide

- **PEP 8** compliance
- **Black** formatting (line length: 100)
- **Type hints** for all functions
- **Docstrings** (Google style)

### Example Code

```python
"""Module for RSS feed generation."""

from typing import List
from datetime import datetime

def generate_feed(
    articles: List[Article],
    title: str = "Default Title"
) -> str:
    """
    Generate RSS 2.0 feed from articles.

    Args:
        articles: List of Article objects to include
        title: Feed title (default: "Default Title")

    Returns:
        RSS feed as XML string

    Raises:
        ValueError: If articles list is empty
    """
    if not articles:
        raise ValueError("Articles list cannot be empty")

    # Implementation here
    return rss_xml
```

## 🔧 Tools & Commands

### Code Formatting

```bash
# Format all code
black src/ tests/

# Check formatting
black --check src/ tests/
```

### Type Checking

```bash
# Check types
mypy src/

# Strict mode
mypy --strict src/
```

### Linting

```bash
# Lint code
ruff check src/ tests/

# Fix auto-fixable issues
ruff check --fix src/ tests/
```

### Build Docker Image

```bash
# Build
docker build -t lolstonksrss .

# Test
docker run -p 8000:8000 lolstonksrss
```

## 📚 Documentation

### Write Documentation

```bash
# Install docs dependencies
uv pip install -e ".[docs]"

# Serve documentation locally
mkdocs serve

# Build documentation
mkdocs build
```

### Documentation Structure

- **Getting Started**: User-facing guides
- **API Reference**: API documentation
- **Architecture**: System design
- **Development**: Developer guides

## 🐛 Debugging

### Debug Locally

```bash
# Run with debug logging
LOG_LEVEL=DEBUG python main.py

# Use debugger
python -m pdb main.py
```

### Debug in Docker

```bash
# View logs
docker logs -f lolstonks

# Execute commands in container
docker exec -it lolstonks bash

# Inspect container
docker inspect lolstonks
```

## 🚀 Release Process

1. Update version in `pyproject.toml`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. GitHub Actions builds and publishes

## 📖 Additional Resources

- [Developer Guide](guide.md)
- [Contributing Guidelines](contributing.md)
- [Testing Guide](testing.md)
- [Code Quality Standards](code-quality.md)
- [Architecture Documentation](../architecture/)

## 💡 Tips for Contributors

### First-Time Contributors

1. Start with issues labeled `good-first-issue`
2. Read the [Contributing Guide](contributing.md)
3. Ask questions in discussions
4. Don't be afraid to make mistakes

### Best Practices

- Write tests for all new code
- Update documentation
- Follow code style guidelines
- Keep commits atomic
- Write clear commit messages

### Getting Help

- Check [Developer Guide](guide.md)
- Ask in GitHub Discussions
- Review existing code
- Read tests for examples

## 🤝 Community

- **GitHub**: [Issues](https://github.com/yourusername/lolstonksrss/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/lolstonksrss/discussions)
- **Contributing**: [Guidelines](contributing.md)

## 📝 Code of Conduct

Please read and follow our [Code of Conduct](https://github.com/yourusername/lolstonksrss/blob/main/CODE_OF_CONDUCT.md).

---

Ready to contribute? Check out the [Contributing Guide](contributing.md) to get started!
