---
title: Testing Guide
description: Testing guidelines and procedures
---

# Testing Guide

Comprehensive guide to testing LoL Stonks RSS.

## 🧪 Running Tests

### All Tests

```bash
pytest
```

### With Coverage

```bash
pytest --cov=src --cov-report=html
```

### Specific Tests

```bash
# Unit tests
pytest tests/unit/

# Integration tests
pytest tests/integration/

# E2E tests
pytest tests/e2e/
```

## 📊 Test Coverage

Current coverage: 95%+

View coverage report:
```bash
pytest --cov=src --cov-report=html
open htmlcov/index.html
```

## 📚 Learn More

- [Developer Guide](guide.md)
- [Contributing](contributing.md)
- [Code Quality](code-quality.md)

For detailed testing documentation, see [docs/TESTING_GUIDE.md](../../TESTING_GUIDE.md).
