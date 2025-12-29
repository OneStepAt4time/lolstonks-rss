# GitFlow Quick Start Guide

**5-Minute Setup Guide for LoL Stonks RSS GitFlow**

## What Was Implemented

A complete GitFlow branching strategy with:
- Branch structure (main, develop, docs, feature/*, release/*, hotfix/*)
- Conventional Commits enforcement
- Pre-commit hooks for code quality
- GitHub Actions for CI/CD
- Quality gates and documentation

## Quick Setup (Developers)

### 1. Clone and Configure (2 minutes)

```bash
# Clone repository
git clone https://github.com/yourusername/lolstonksrss.git
cd lolstonksrss

# Git configurations are already set by repository
# .gitmessage and .githooks are pre-configured

# Install pre-commit framework
pip install pre-commit
pre-commit install

# Test installation
pre-commit run --all-files
```

### 2. Create Your First Feature (3 minutes)

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# ... edit files ...

# Stage and commit with conventional format
git add .
git commit
# Editor opens with template - fill it out:
# feat(scope): add amazing feature
#
# - Detail 1
# - Detail 2
#
# Closes #123

# Or commit inline
git commit -m "feat(rss): add item limit configuration"

# Push and create PR
git push -u origin feature/your-feature-name
gh pr create --base develop
```

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Quick Reference

**Types**: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
**Scopes**: api, rss, database, config, docker, ci, docs, tests, deployment

**Examples**:
```bash
git commit -m "feat(rss): add RSS pagination support"
git commit -m "fix(api): resolve memory leak in cache"
git commit -m "docs: update deployment guide"
git commit -m "test(rss): add validation tests"
```

## Branch Workflow

### Feature Development
```bash
develop → feature/name → develop (via PR)
```

### Release
```bash
develop → release/1.2.0 → main → develop
```

### Hotfix
```bash
main → hotfix/1.1.1 → main → develop
```

## Quality Checks

Every commit is automatically checked for:
- Code formatting (Black)
- Linting (Ruff)
- Type checking (mypy)
- Unit tests
- Commit message format

**Skip checks** (emergencies only):
```bash
git commit --no-verify
```

## Common Commands

```bash
# Start new feature
git checkout develop && git pull
git checkout -b feature/my-feature

# Update feature from develop
git checkout feature/my-feature
git merge develop

# Commit with template
git commit

# Commit inline
git commit -m "type(scope): subject"

# Push and create PR
git push -u origin feature/my-feature
gh pr create --base develop

# After PR merged, cleanup
git checkout develop
git pull
git branch -d feature/my-feature
```

## What Runs Automatically

### On Commit (pre-commit hook)
- Black formatting
- Ruff linting
- mypy type checking
- Unit tests
- Commit message validation

### On Push (pre-push hook)
- Full test suite
- Coverage check (>=90%)
- All linting checks

### On Pull Request (GitHub Actions)
- CI tests (Python 3.11, 3.12)
- Docker build
- Code coverage report
- Documentation build

## Troubleshooting

### Commit Message Rejected
**Error**: "Invalid commit message format"
**Fix**: Use conventional commits format
```bash
git commit -m "feat(rss): your message"
```

### Pre-commit Hook Fails
**Error**: "Black formatting check failed"
**Fix**: Run formatter
```bash
black src/ tests/
git add .
git commit
```

### Cannot Push to Main
**Error**: "pre-push hook failed"
**Fix**: Never push directly to main, use PRs
```bash
# Create feature branch instead
git checkout -b feature/your-fix
git push -u origin feature/your-fix
```

### Tests Failing
**Error**: "Unit tests failed"
**Fix**: Fix tests or skip temporarily
```bash
# Fix and re-commit
pytest tests/unit/
git commit

# Skip (NOT RECOMMENDED)
git commit --no-verify
```

## Branch Protection (Repository Admins)

After pushing initial setup:

1. Go to GitHub: Settings → Branches
2. Add protection for `main`:
   - Require PR reviews (1 approval)
   - Require status checks
   - Require branches up to date
   - No force pushes
   - No deletions

3. Add protection for `develop`:
   - Require PR reviews (1 approval)
   - Require status checks

See `.github/BRANCH_PROTECTION_SETUP.md` for detailed instructions.

## Key Files

- `.gitmessage` - Commit message template
- `.pre-commit-config.yaml` - Pre-commit hook configuration
- `commitlint.config.js` - Commit message linting rules
- `.githooks/` - Custom git hooks
- `GITFLOW.md` - Complete GitFlow guide
- `QUALITY_GATES.md` - Quality requirements
- `CONTRIBUTING.md` - Contribution guidelines

## Get Help

- **GitFlow Questions**: Read `GITFLOW.md`
- **Quality Gates**: Read `QUALITY_GATES.md`
- **Contributing**: Read `CONTRIBUTING.md`
- **Issues**: Open GitHub issue with `question` label

## Summary

1. Install pre-commit: `pip install pre-commit && pre-commit install`
2. Create feature: `git checkout -b feature/name`
3. Commit: `git commit -m "feat(scope): message"`
4. Push and PR: `git push -u origin feature/name && gh pr create`
5. After merge: Clean up local branch

**That's it! You're ready to use GitFlow.**

---

**Need more details?** Read `GITFLOW.md` for the complete guide.
