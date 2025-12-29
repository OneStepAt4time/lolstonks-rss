---
title: Code Quality Standards
description: Code quality standards and tools
---

# Code Quality Standards

Code quality standards and tools for LoL Stonks RSS.

## 🎨 Code Formatting

### Black

```bash
# Format code
black src/ tests/

# Check formatting
black --check src/ tests/
```

Configuration: line length = 100

## 🔍 Type Checking

### mypy

```bash
# Check types
mypy src/

# Strict mode
mypy --strict src/
```

All functions must have type hints.

## 🔧 Linting

### Ruff

```bash
# Lint code
ruff check src/ tests/

# Auto-fix
ruff check --fix src/ tests/
```

## ✅ Quality Checklist

Before submitting code:

- [ ] Code formatted with Black
- [ ] Type hints present
- [ ] Types check with mypy
- [ ] Linting passes
- [ ] Tests pass
- [ ] Coverage > 90%
- [ ] Documentation updated

## 📚 Learn More

- [Developer Guide](guide.md)
- [Contributing](contributing.md)
- [Testing](testing.md)

For detailed code standards, see [CONTRIBUTING.md](contributing.md).
