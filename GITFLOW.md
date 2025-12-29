# GitFlow Workflow Guide

This document describes the GitFlow branching strategy used in the LoL Stonks RSS project.

## Table of Contents

- [Overview](#overview)
- [Branch Structure](#branch-structure)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Workflow Examples](#workflow-examples)
- [Release Process](#release-process)
- [Hotfix Process](#hotfix-process)
- [Quality Gates](#quality-gates)
- [Best Practices](#best-practices)

## Overview

GitFlow is a branching model that defines a strict branching structure designed around project releases. It provides a robust framework for managing larger projects and enables parallel development.

### Why GitFlow?

- **Organized development**: Clear separation between development and production code
- **Parallel development**: Multiple features can be developed simultaneously
- **Release management**: Structured release preparation and deployment
- **Hotfix support**: Quick fixes to production without disrupting development
- **Quality assurance**: Quality gates ensure only tested code reaches production

## Branch Structure

### Main Branches

These branches exist throughout the project lifecycle:

#### `main` (or `master`)
- **Purpose**: Production-ready code
- **Protection**: Fully protected
- **Deployment**: Automatically deploys to production
- **Source**: Merges from `release/*` and `hotfix/*` branches only
- **Never commit directly**: Always use pull requests

#### `develop`
- **Purpose**: Integration branch for features
- **Protection**: Protected with required reviews
- **Deployment**: Automatically deploys to staging/development environment
- **Source**: Merges from `feature/*` branches
- **Base for**: New feature branches

### Supporting Branches

These branches are temporary and deleted after merging:

#### `feature/*`
- **Purpose**: Develop new features
- **Lifetime**: Until feature is complete and merged
- **Base**: Created from `develop`
- **Merge to**: `develop` via pull request
- **Examples**:
  - `feature/rss-item-limit`
  - `feature/article-caching`
  - `feature/api-rate-limiting`

#### `release/*`
- **Purpose**: Prepare for production release
- **Lifetime**: Until release is deployed and merged
- **Base**: Created from `develop`
- **Merge to**: `main` and back to `develop`
- **Examples**:
  - `release/1.2.0`
  - `release/2.0.0-beta`

#### `hotfix/*`
- **Purpose**: Quick fixes to production
- **Lifetime**: Until fix is deployed and merged
- **Base**: Created from `main`
- **Merge to**: `main` and `develop`
- **Examples**:
  - `hotfix/1.1.1-critical-bug`
  - `hotfix/1.2.1-security-fix`

#### `docs`
- **Purpose**: Documentation-only changes
- **Lifetime**: Permanent branch
- **Base**: Created from `main`
- **Merge to**: `main` or `develop` depending on documentation type
- **Use**: For documentation that doesn't require full release cycle

## Branch Naming Conventions

### Format

```
<type>/<description>
```

### Types

- `feature/` - New features or enhancements
- `release/` - Release preparation
- `hotfix/` - Production bug fixes
- `bugfix/` - Non-critical bug fixes (use `feature/` prefix)
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements
- `perf/` - Performance improvements

### Description Guidelines

- Use lowercase with hyphens
- Be descriptive but concise
- Include issue number if applicable
- Maximum 50 characters

### Examples

Good:
```
feature/add-rss-pagination
feature/123-api-authentication
release/2.1.0
hotfix/1.0.1-database-leak
docs/update-deployment-guide
```

Bad:
```
my-feature
feature/NewFeature
fix-bug
temp
```

## Workflow Examples

### Feature Development Workflow

Complete workflow for developing a new feature:

#### 1. Create Feature Branch

```bash
# Ensure develop is up to date
git checkout develop
git pull origin develop

# Create and checkout feature branch
git checkout -b feature/rss-item-limit

# Push branch to remote
git push -u origin feature/rss-item-limit
```

#### 2. Develop Feature

```bash
# Make changes
# Edit files...

# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat(rss): add configurable RSS item limit

- Add max_items parameter to RSSGenerator
- Update configuration to support item limit
- Add validation for limit range (1-100)

Closes #123"

# Push changes
git push origin feature/rss-item-limit
```

#### 3. Keep Branch Updated

```bash
# Regularly sync with develop
git checkout develop
git pull origin develop
git checkout feature/rss-item-limit
git merge develop

# Or use rebase (if no conflicts expected)
git checkout feature/rss-item-limit
git rebase develop
```

#### 4. Create Pull Request

```bash
# Push final changes
git push origin feature/rss-item-limit

# Create PR via GitHub CLI (optional)
gh pr create --base develop --head feature/rss-item-limit \
  --title "feat(rss): add configurable RSS item limit" \
  --body "Closes #123

## Summary
- Adds configurable item limit to RSS feed
- Validates limit range (1-100)
- Updates documentation

## Testing
- All unit tests pass
- Added integration tests
- Manual testing completed"
```

#### 5. After PR Merge

```bash
# Delete local branch
git checkout develop
git branch -d feature/rss-item-limit

# Delete remote branch (if not auto-deleted)
git push origin --delete feature/rss-item-limit
```

### Starting a New Feature

```bash
# Update develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Make initial commit
git commit --allow-empty -m "feat: initialize feature branch"

# Push to remote
git push -u origin feature/your-feature-name
```

### Working on Existing Feature

```bash
# Checkout feature branch
git checkout feature/existing-feature

# Update from remote
git pull origin feature/existing-feature

# Update from develop
git fetch origin develop
git merge origin/develop

# Or rebase onto develop
git rebase origin/develop
```

## Release Process

### Creating a Release

#### 1. Create Release Branch

```bash
# Ensure develop is ready for release
git checkout develop
git pull origin develop

# Create release branch
git checkout -b release/1.2.0

# Push to remote
git push -u origin release/1.2.0
```

#### 2. Prepare Release

```bash
# Update version in pyproject.toml
# Update CHANGELOG.md
# Update documentation

# Commit release preparation
git add .
git commit -m "chore(release): prepare version 1.2.0

- Update version to 1.2.0
- Update CHANGELOG.md
- Update documentation"

# Push changes
git push origin release/1.2.0
```

#### 3. Release Testing

- Run full test suite
- Perform integration testing
- Test in staging environment
- Verify documentation
- Security scan
- Performance testing

#### 4. Merge to Main

```bash
# Create PR to main
gh pr create --base main --head release/1.2.0 \
  --title "Release v1.2.0" \
  --body "Release notes...

## Changes
- Feature 1
- Feature 2
- Bug fix 1

## Testing
- All tests pass
- Staging deployment successful
- Documentation updated"

# After PR approval and merge, tag the release
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0
```

#### 5. Merge Back to Develop

```bash
# Merge release changes back to develop
git checkout develop
git pull origin develop
git merge release/1.2.0
git push origin develop

# Delete release branch
git branch -d release/1.2.0
git push origin --delete release/1.2.0
```

### Release Checklist

Before creating a release:

- [ ] All planned features merged to develop
- [ ] All tests passing (100%)
- [ ] Code coverage >= 90%
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version numbers updated
- [ ] No known critical bugs
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Staging deployment successful

## Hotfix Process

For critical production bugs that need immediate attention:

### 1. Create Hotfix Branch

```bash
# Create from main
git checkout main
git pull origin main

# Create hotfix branch with version number
git checkout -b hotfix/1.1.1-critical-bug

# Push to remote
git push -u origin hotfix/1.1.1-critical-bug
```

### 2. Fix the Issue

```bash
# Make the fix
# Edit files...

# Commit the fix
git add .
git commit -m "fix(api): resolve critical database connection leak

- Fix connection pool not being released
- Add proper connection cleanup
- Add regression test

Fixes #456"

# Push changes
git push origin hotfix/1.1.1-critical-bug
```

### 3. Test Hotfix

- Run full test suite
- Test the specific fix
- Verify no side effects
- Test in staging environment

### 4. Merge to Main

```bash
# Create PR to main
gh pr create --base main --head hotfix/1.1.1-critical-bug \
  --title "Hotfix v1.1.1: Fix critical database leak" \
  --body "Critical hotfix for production issue

## Issue
Database connections not being released

## Fix
- Proper connection cleanup
- Added regression test

## Testing
- All tests pass
- Tested in staging
- Verified fix"

# After merge, tag the hotfix
git checkout main
git pull origin main
git tag -a v1.1.1 -m "Hotfix version 1.1.1"
git push origin v1.1.1
```

### 5. Merge to Develop

```bash
# Merge hotfix to develop
git checkout develop
git pull origin develop
git merge hotfix/1.1.1-critical-bug
git push origin develop

# Delete hotfix branch
git branch -d hotfix/1.1.1-critical-bug
git push origin --delete hotfix/1.1.1-critical-bug
```

### Hotfix Checklist

- [ ] Issue identified and verified
- [ ] Hotfix branch created from main
- [ ] Fix implemented and tested
- [ ] Regression test added
- [ ] All tests pass
- [ ] PR reviewed and approved
- [ ] Merged to main
- [ ] Tagged with new version
- [ ] Deployed to production
- [ ] Merged back to develop
- [ ] Issue closed

## Quality Gates

All code must pass these quality gates before merging:

### Pre-commit Checks

Automatically run before each commit:

- Code formatting (Black)
- Linting (Ruff)
- Type checking (mypy)
- Unit tests
- No debugging code
- No secrets in code

### Pull Request Checks

Required for PR approval:

- [ ] All tests pass (100%)
- [ ] Code coverage >= 90%
- [ ] No linting errors
- [ ] No type errors
- [ ] Security scan passed
- [ ] Docker build successful
- [ ] Documentation updated
- [ ] At least 1 approving review
- [ ] No unresolved comments
- [ ] Branch up to date with base

### Pre-push Checks

Run before pushing to remote:

- Full test suite passes
- Test coverage >= 90%
- All linting checks pass
- Type checking passes
- No uncommitted changes

### Release Checks

Required before production release:

- [ ] All quality gates passed
- [ ] Staging deployment successful
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] CHANGELOG updated
- [ ] Version tagged
- [ ] Release notes created

## Best Practices

### Do's

- **Always branch from the correct base**:
  - Features from `develop`
  - Releases from `develop`
  - Hotfixes from `main`

- **Keep branches up to date**:
  - Regularly merge/rebase from base branch
  - Resolve conflicts early

- **Write descriptive commit messages**:
  - Follow conventional commits
  - Explain why, not just what

- **Small, focused PRs**:
  - One feature per PR
  - Easier to review
  - Faster to merge

- **Test thoroughly**:
  - Write tests for new code
  - Run full test suite
  - Test in staging

- **Review carefully**:
  - Review your own code first
  - Address all PR comments
  - Be respectful and constructive

- **Clean up after merge**:
  - Delete merged branches
  - Update local repository

### Don'ts

- **Never commit directly to main or develop**
  - Always use pull requests
  - Ensure code review

- **Don't merge without passing checks**
  - Wait for CI/CD to pass
  - Fix failing tests

- **Don't create long-lived feature branches**
  - Merge frequently
  - Break large features into smaller PRs

- **Don't bypass quality gates**
  - No `--no-verify` pushes
  - No skipping tests

- **Don't mix concerns**
  - One feature per branch
  - Separate refactoring from features

- **Don't leave branches unmerged**
  - Finish what you start
  - Keep PRs moving

## Branch Protection Rules

### Main Branch

- Require pull request reviews (1+ approvals)
- Require status checks to pass:
  - CI tests
  - Linting
  - Type checking
  - Security scan
  - Docker build
- Require branches to be up to date
- No force pushes
- No deletions
- Require linear history
- Require signed commits (optional)

### Develop Branch

- Require pull request reviews (1+ approval)
- Require status checks to pass:
  - CI tests
  - Linting
  - Type checking
- Allow force pushes for maintainers only
- No deletions

### Docs Branch

- Require pull request reviews (optional)
- Require doc build to pass
- Allow fast-forward merges only

## Semantic Versioning

We follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

### Version Format

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
```

### Version Increments

- **MAJOR** (1.0.0 -> 2.0.0): Breaking changes
  - API changes
  - Removed features
  - Incompatible changes

- **MINOR** (1.0.0 -> 1.1.0): New features
  - New functionality
  - Backwards compatible
  - Deprecations

- **PATCH** (1.0.0 -> 1.0.1): Bug fixes
  - Bug fixes
  - Security patches
  - Backwards compatible

### Pre-release Versions

- `1.2.0-alpha.1` - Alpha release
- `1.2.0-beta.1` - Beta release
- `1.2.0-rc.1` - Release candidate

### Examples

- `1.0.0` - Initial release
- `1.0.1` - Bug fix
- `1.1.0` - New feature
- `2.0.0` - Breaking change
- `2.1.0-beta.1` - Beta release

## GitFlow Diagram

```
main        ─────●─────────────●─────────────●──────── (v1.0.0, v1.1.0, v2.0.0)
             │     │             │             │
             │     │             │             └─ merge release/2.0.0
             │     │             └─────────────── merge hotfix/1.0.1
             │     └───────────────────────────── merge release/1.0.0
             │
develop     ─●─────●─────●─────●─────●─────●─────●──── (staging)
             │      │     │     │     │     │     │
             │      │     │     │     │     │     └─ merge feature/c
             │      │     │     │     │     └─────── merge feature/b
             │      │     │     │     └─────────────── merge feature/a
             │      │     │     └─────────────────────── create release/1.1.0
             │      │     └───────────────────────────── merge hotfix/1.0.1
             │      └─────────────────────────────────── create release/1.0.0
             │
feature/a   ─────●─────●─────●────────────────────────
                      commits
feature/b   ───────────────────●─────●───────────────
                                  commits
release/1.0.0 ─●─────●─────●────────────────────────
                  testing & fixes
hotfix/1.0.1  ───────────●─────●──────────────────────
                        fix commits
```

## Summary

GitFlow provides structure and organization for the development process:

1. **Develop features** in `feature/*` branches from `develop`
2. **Create releases** in `release/*` branches from `develop`
3. **Deploy to production** by merging to `main`
4. **Fix production issues** in `hotfix/*` branches from `main`
5. **Maintain quality** with automated checks and reviews
6. **Track versions** with semantic versioning and tags

Follow this workflow consistently to maintain a clean, organized, and professional codebase.

---

For questions or suggestions about the GitFlow process, please open an issue or discussion.
