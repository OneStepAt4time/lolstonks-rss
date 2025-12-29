# Quality Gates

This document defines the quality gates that all code must pass before being merged and deployed to production.

## Table of Contents

- [Overview](#overview)
- [Pre-commit Checks](#pre-commit-checks)
- [Pull Request Checks](#pull-request-checks)
- [Pre-push Checks](#pre-push-checks)
- [Release Checks](#release-checks)
- [Quality Metrics](#quality-metrics)
- [Automated Enforcement](#automated-enforcement)
- [Bypassing Quality Gates](#bypassing-quality-gates)

## Overview

Quality gates ensure that code meets our standards for:
- **Correctness**: Code works as intended
- **Quality**: Code is clean, maintainable, and well-tested
- **Security**: Code has no known vulnerabilities
- **Performance**: Code meets performance requirements
- **Documentation**: Code is properly documented

All quality gates are automatically enforced through:
- Git hooks (pre-commit, commit-msg, pre-push)
- Pre-commit framework
- GitHub Actions CI/CD
- Branch protection rules

## Pre-commit Checks

These checks run automatically before each commit (via git hooks):

### Code Formatting

**Black** - Python code formatter
```bash
black --check --line-length 100 src/ tests/
```

- **Requirement**: All Python files must be formatted with Black
- **Configuration**: `pyproject.toml` - line length 100, target Python 3.11
- **Auto-fix**: `black --line-length 100 src/ tests/`

**Ruff Format** - Fast Python formatter
```bash
ruff format --check src/ tests/
```

- **Requirement**: Code must pass Ruff formatting
- **Auto-fix**: `ruff format src/ tests/`

### Linting

**Ruff** - Fast Python linter
```bash
ruff check src/ tests/
```

- **Requirement**: No linting errors allowed
- **Selected rules**:
  - E - pycodestyle errors
  - W - pycodestyle warnings
  - F - pyflakes
  - I - isort (import sorting)
  - B - flake8-bugbear
  - C4 - flake8-comprehensions
  - UP - pyupgrade
- **Auto-fix**: `ruff check --fix src/ tests/`

**isort** - Import sorting
```bash
isort --check-only --profile black src/ tests/
```

- **Requirement**: Imports must be sorted correctly
- **Auto-fix**: `isort --profile black src/ tests/`

### Type Checking

**mypy** - Static type checking
```bash
mypy src/
```

- **Requirement**: No type errors in src/ directory
- **Configuration**: `pyproject.toml`
- **Strict mode enabled**:
  - `disallow_untyped_defs = true`
  - `disallow_incomplete_defs = true`
  - `check_untyped_defs = true`
  - `no_implicit_optional = true`

### Security Checks

**Bandit** - Security vulnerability scanner
```bash
bandit -r src/ -c pyproject.toml
```

- **Requirement**: No high or medium severity security issues
- **Checks for**:
  - SQL injection
  - Command injection
  - Hardcoded passwords
  - Insecure crypto
  - And more...

**detect-private-key** - Private key detection
- **Requirement**: No private keys in code

### File Checks

**Trailing whitespace** - Remove trailing spaces
**End-of-file fixer** - Ensure files end with newline
**Mixed line endings** - Ensure consistent line endings
**Check YAML** - Validate YAML syntax
**Check JSON** - Validate JSON syntax
**Check TOML** - Validate TOML syntax
**Large files** - Prevent files > 500KB
**Merge conflicts** - Detect merge conflict markers

### Code Quality Checks

**No debugging code**:
```bash
# Fails if found:
import pdb
import ipdb
breakpoint()
```

**No print statements** (warning only):
```bash
# Should use logging instead
print("debug message")
```

**TODO/FIXME with issue numbers**:
```bash
# Good:
# TODO #123: Implement feature X

# Bad (warning):
# TODO: Implement feature X
```

**Branch protection**:
- Cannot commit directly to `main` or `master`
- Must use pull requests

## Pull Request Checks

All pull requests must pass these checks before merging:

### Automated CI Checks

**Tests (Required)**
```bash
pytest --cov=src --cov-report=xml --cov-report=term
```

- [ ] All unit tests pass (100%)
- [ ] All integration tests pass (100%)
- [ ] All E2E tests pass (100%)
- [ ] Test suite completes without errors
- [ ] Matrix testing: Python 3.11 and 3.12

**Code Coverage (Required)**
```bash
pytest --cov=src --cov-report=term --cov-fail-under=90
```

- [ ] Code coverage >= 90%
- [ ] No coverage regressions
- [ ] New code is covered by tests
- [ ] Coverage report uploaded to Codecov

**Linting (Required)**
```bash
black --check src/ tests/
ruff check src/ tests/
mypy src/
```

- [ ] Black formatting check passes
- [ ] Ruff linting passes
- [ ] MyPy type checking passes
- [ ] No linting errors or warnings

**Docker Build (Required)**
```bash
docker build -t lolstonksrss:test .
docker run --rm -d -p 8000:8000 lolstonksrss:test
curl -f http://localhost:8000/health
```

- [ ] Docker image builds successfully
- [ ] Docker image size is reasonable
- [ ] Container starts without errors
- [ ] Health check endpoint responds

**Documentation Build (Required)**
```bash
mkdocs build --strict
```

- [ ] Documentation builds without errors
- [ ] No broken links in docs
- [ ] All doc pages accessible

### Manual Review Checks

**Code Review (Required)**
- [ ] At least 1 approving review from code owner
- [ ] All review comments addressed
- [ ] No unresolved conversations
- [ ] Code owner approval (if CODEOWNERS file)

**Code Quality (Required)**
- [ ] Code follows project style guidelines
- [ ] Functions are small and focused
- [ ] Complex logic is commented
- [ ] Error handling is appropriate
- [ ] Logging is used (not print)
- [ ] No code duplication

**Testing (Required)**
- [ ] New functionality has unit tests
- [ ] Edge cases are tested
- [ ] Error cases are tested
- [ ] Integration tests added if needed
- [ ] Performance tests added if needed

**Documentation (Required)**
- [ ] All new functions have docstrings
- [ ] README.md updated if needed
- [ ] API documentation updated if needed
- [ ] CHANGELOG.md updated (if applicable)
- [ ] Migration guide (if breaking change)

**Security (Required)**
- [ ] No sensitive data in code
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Input validation implemented
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies security scanned

**Git (Required)**
- [ ] Commit messages follow conventional commits
- [ ] Branch is up to date with base branch
- [ ] No merge conflicts
- [ ] Commits are clean and atomic
- [ ] No temporary/debug commits

### Branch-specific Checks

**Feature branches (`feature/*` -> `develop`)**
- [ ] All standard checks pass
- [ ] Feature is complete
- [ ] Documentation updated

**Release branches (`release/*` -> `main`)**
- [ ] Version number updated
- [ ] CHANGELOG.md updated
- [ ] Release notes prepared
- [ ] Staging deployment successful
- [ ] All features tested
- [ ] No known critical bugs

**Hotfix branches (`hotfix/*` -> `main`)**
- [ ] Fix is tested
- [ ] Regression test added
- [ ] Version number updated
- [ ] Security issues addressed (if security fix)
- [ ] Minimal scope (only the fix)

## Pre-push Checks

These checks run automatically before pushing to remote:

### Full Test Suite
```bash
pytest -v --cov=src --cov-report=term --cov-report=html
```

- [ ] All tests pass (100%)
- [ ] Test coverage >= 90%
- [ ] No test failures
- [ ] No test warnings

### All Linting Checks
```bash
black --check --line-length 100 src/ tests/
ruff check src/ tests/
mypy src/
```

- [ ] Black formatting passes
- [ ] Ruff linting passes
- [ ] MyPy type checking passes
- [ ] No errors in any linting tool

### Branch Protection
- [ ] Not pushing directly to `main` or `master`
- [ ] Using pull requests for protected branches

### Clean Working Tree
- [ ] No uncommitted changes
- [ ] All changes committed
- [ ] Working directory clean

## Release Checks

Before creating a production release:

### Code Quality (Required)
- [ ] All quality gates passed
- [ ] Code coverage >= 90%
- [ ] No linting errors
- [ ] No type errors
- [ ] No security vulnerabilities

### Testing (Required)
- [ ] All tests pass (100%)
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Performance tests pass
- [ ] Load testing completed (if applicable)
- [ ] Manual testing completed

### Deployment (Required)
- [ ] Staging deployment successful
- [ ] Staging tests passed
- [ ] Health checks passing
- [ ] No errors in staging logs
- [ ] Performance metrics acceptable

### Documentation (Required)
- [ ] README.md up to date
- [ ] CHANGELOG.md updated
- [ ] API documentation current
- [ ] Deployment guide updated
- [ ] Release notes prepared

### Security (Required)
- [ ] Security audit passed
- [ ] Dependencies scanned
- [ ] No known vulnerabilities
- [ ] Secrets properly managed
- [ ] Access controls configured

### Version Management (Required)
- [ ] Version number updated (semantic versioning)
- [ ] Git tag created
- [ ] Release notes complete
- [ ] Breaking changes documented
- [ ] Migration guide (if needed)

### Rollback Preparation (Required)
- [ ] Rollback plan documented
- [ ] Database backup created (if applicable)
- [ ] Previous version tagged
- [ ] Rollback tested (if critical)

## Quality Metrics

### Code Coverage

**Target**: >= 90%

**Calculation**:
```bash
pytest --cov=src --cov-report=term
```

**Tracked metrics**:
- Line coverage
- Branch coverage
- Function coverage

**Enforcement**:
- CI fails if coverage < 90%
- Coverage reports uploaded to Codecov
- Coverage trends monitored

### Code Complexity

**Tools**:
- Ruff (flake8-complexity)
- McCabe complexity

**Limits**:
- Max cyclomatic complexity: 10
- Max function length: 50 lines
- Max class length: 300 lines

### Type Coverage

**Target**: 100% type hints

**Requirements**:
- All functions have type hints
- Return types specified
- Parameter types specified
- No `Any` types (unless justified)

**Enforcement**:
- MyPy strict mode
- `disallow_untyped_defs = true`

### Documentation Coverage

**Target**: 100% public API documented

**Requirements**:
- All public functions have docstrings
- All classes have docstrings
- All modules have docstrings
- Docstrings follow Google style

### Security

**Tools**:
- Bandit (security scanner)
- Safety (dependency checker)
- GitHub Dependabot

**Requirements**:
- No high severity issues
- No medium severity issues (exceptions documented)
- Dependencies regularly updated
- Security advisories monitored

### Performance

**Benchmarks**:
- RSS generation: < 200ms
- API response time: < 100ms
- Database queries: < 50ms
- Memory usage: < 500MB

**Monitoring**:
- Performance tests in CI
- Benchmarks tracked over time
- Regressions caught automatically

## Automated Enforcement

### Git Hooks

**Installation**:
```bash
# Set git hooks directory
git config core.hooksPath .githooks

# Make hooks executable (Linux/Mac)
chmod +x .githooks/*
```

**Hooks**:
- `.githooks/pre-commit` - Run before commit
- `.githooks/commit-msg` - Validate commit message
- `.githooks/pre-push` - Run before push

### Pre-commit Framework

**Installation**:
```bash
pip install pre-commit
pre-commit install
```

**Configuration**: `.pre-commit-config.yaml`

**Manual run**:
```bash
pre-commit run --all-files
```

### GitHub Actions

**Workflows**:
- `.github/workflows/ci.yml` - CI pipeline
- `.github/workflows/docker-publish.yml` - Docker build
- `.github/workflows/deploy-docs.yml` - Docs deployment

**Triggers**:
- Push to `main`, `develop`
- Pull requests to `main`, `develop`
- Manual workflow dispatch

### Branch Protection

**Configuration**: `.github/settings.yml`

**Rules**:
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- No force pushes
- No deletions
- Linear history (main branch)

## Bypassing Quality Gates

### When Allowed

Quality gates should **rarely** be bypassed. Only in these cases:

1. **Emergency Hotfix**:
   - Critical production issue
   - Security vulnerability
   - Data loss prevention
   - Must be approved by 2+ maintainers
   - Full testing done manually
   - Documented in commit message

2. **Documentation-only Changes**:
   - Typo fixes
   - Formatting improvements
   - Non-code documentation
   - Still requires review

3. **CI/CD Fixes**:
   - CI pipeline broken
   - Cannot run checks
   - Fix is to repair checks
   - Reviewed by maintainer

### How to Bypass

**Git hooks**:
```bash
# Skip pre-commit hook (NOT RECOMMENDED)
git commit --no-verify

# Skip pre-push hook (NOT RECOMMENDED)
git push --no-verify
```

**GitHub branch protection**:
- Only repository admins can bypass
- Requires "enforce for administrators" to be disabled
- Must be re-enabled after fix

### Documentation

When bypassing quality gates:
1. Document reason in commit message
2. Create issue to fix properly
3. Add to CHANGELOG.md
4. Notify team
5. Plan to fix in next release

**Example**:
```
fix(ci): emergency fix for broken pipeline

EMERGENCY FIX - Bypassing quality gates

Reason: CI pipeline completely broken, cannot run checks
Approved by: @maintainer1, @maintainer2
Follow-up: #789 to add proper tests

This commit bypasses pre-commit checks because the CI
system is non-functional and blocking all development.
```

## Quality Gate Checklist

### Every Commit
- [ ] Code formatted with Black
- [ ] Linting passes (Ruff)
- [ ] Type checking passes (mypy)
- [ ] No debugging code
- [ ] Conventional commit message
- [ ] No commits to main/master

### Every Pull Request
- [ ] All CI checks pass
- [ ] Test coverage >= 90%
- [ ] 1+ approving review
- [ ] All comments addressed
- [ ] Branch up to date
- [ ] Documentation updated
- [ ] No security issues

### Every Push
- [ ] Full test suite passes
- [ ] All linting passes
- [ ] Coverage >= 90%
- [ ] Working tree clean

### Every Release
- [ ] All quality gates passed
- [ ] Staging deployment successful
- [ ] Documentation complete
- [ ] Version tagged
- [ ] Release notes ready
- [ ] Security audit passed
- [ ] Rollback plan documented

---

## Summary

Quality gates ensure that:
- Code is correct and tested
- Code is clean and maintainable
- Code is secure
- Code is documented
- Code meets performance requirements

**All gates are automatically enforced** through git hooks, pre-commit, and CI/CD.

**Bypassing gates is rare** and requires strong justification and approval.

**Quality is not negotiable** - it's how we maintain a professional, production-ready codebase.

---

For questions about quality gates, see:
- `CONTRIBUTING.md` - Contributing guidelines
- `GITFLOW.md` - Git workflow
- `.pre-commit-config.yaml` - Pre-commit configuration
- `.github/workflows/` - CI/CD workflows
