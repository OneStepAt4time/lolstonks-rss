# Branch Protection Setup Guide

This guide provides step-by-step instructions for setting up branch protection rules on GitHub.

## Overview

Branch protection rules must be configured manually on GitHub. This document provides the exact settings to use for each protected branch.

## Prerequisites

- Repository owner or admin access
- GitHub repository created and pushed
- At least one commit on each branch to protect

## Main Branch Protection

Navigate to: **Settings** > **Branches** > **Add branch protection rule**

### Branch Name Pattern
```
main
```

### Settings to Enable

#### Protect matching branches
- [x] **Require a pull request before merging**
  - [x] Require approvals: **1**
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require review from Code Owners
  - [ ] Restrict who can dismiss pull request reviews (optional)
  - [x] Allow specified actors to bypass required pull requests (optional, for admins only)

- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Required status checks (add these):
    - `test (3.11)`
    - `test (3.12)`
    - `docker`
    - `build-docs` (if documentation workflow exists)

- [x] **Require conversation resolution before merging**

- [x] **Require signed commits** (optional, recommended for enterprise)

- [x] **Require linear history**

- [x] **Include administrators**
  - This ensures admins also follow the rules
  - Can be temporarily disabled for emergency fixes

- [ ] **Allow force pushes** - DISABLED
  - Never allow force pushes to main

- [ ] **Allow deletions** - DISABLED
  - Never allow branch deletion

#### Rules applied to everyone including administrators
- [x] Block creation (optional)
- [x] Block deletion
- [ ] Require deployments to succeed (if using GitHub Environments)

### Save Protection Rule
Click **Create** or **Save changes**

---

## Develop Branch Protection

Navigate to: **Settings** > **Branches** > **Add branch protection rule**

### Branch Name Pattern
```
develop
```

### Settings to Enable

#### Protect matching branches
- [x] **Require a pull request before merging**
  - [x] Require approvals: **1**
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [ ] Require review from Code Owners (optional)

- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Required status checks:
    - `test (3.11)`
    - `test (3.12)`
    - `docker`

- [x] **Require conversation resolution before merging**

- [ ] **Require signed commits** (optional)

- [ ] **Require linear history** (optional for develop)

- [ ] **Include administrators**
  - Allow admins to merge without PR for develop (optional)

- [ ] **Allow force pushes** - DISABLED
  - Only enable if needed for rebasing

- [ ] **Allow deletions** - DISABLED

### Save Protection Rule
Click **Create** or **Save changes**

---

## Docs Branch Protection

Navigate to: **Settings** > **Branches** > **Add branch protection rule**

### Branch Name Pattern
```
docs
```

### Settings to Enable

#### Protect matching branches
- [x] **Require a pull request before merging**
  - [x] Require approvals: **0** (optional reviews)
  - [ ] Dismiss stale pull request approvals

- [x] **Require status checks to pass before merging**
  - [ ] Require branches to be up to date (optional)
  - Required status checks:
    - `build-docs`

- [ ] **Require conversation resolution before merging** (optional)

- [ ] **Require signed commits** (optional)

- [ ] **Require linear history** (optional)

- [ ] **Include administrators**

- [ ] **Allow force pushes** - DISABLED

- [ ] **Allow deletions** - DISABLED

### Save Protection Rule
Click **Create** or **Save changes**

---

## Release and Hotfix Branches

For `release/*` and `hotfix/*` branches, protection rules can be set using wildcard patterns:

### Release Branches

**Branch Name Pattern**: `release/*`

Settings:
- [x] Require a pull request before merging (1 approval)
- [x] Require status checks to pass
- [x] Require conversation resolution
- [ ] Require linear history
- [x] Include administrators

### Hotfix Branches

**Branch Name Pattern**: `hotfix/*`

Settings:
- [x] Require a pull request before merging (2 approvals recommended)
- [x] Require status checks to pass
- [x] Require conversation resolution
- [x] Include administrators
- [ ] Allow specified actors to bypass for emergencies

---

## Rulesets (New GitHub Feature)

GitHub now offers **Rulesets** as an alternative to branch protection rules. Here's how to set them up:

### Create Ruleset for Main Branch

Navigate to: **Settings** > **Rules** > **Rulesets** > **New ruleset**

#### Ruleset Configuration

**Name**: `main-branch-protection`

**Enforcement status**: Active

**Target branches**: `main`

**Rules**:
- [x] Require a pull request before merging
  - Required approvals: 1
  - Dismiss stale reviews: Yes
  - Require review from code owners: Yes

- [x] Require status checks to pass
  - Require branches to be up to date: Yes
  - Status checks:
    - `test (3.11)`
    - `test (3.12)`
    - `docker`

- [x] Block force pushes
- [x] Require linear history
- [x] Require deployments to succeed before merging (optional)

#### Bypass list
- Repository admins (only for emergencies)

---

## Code Owners Setup

Create or verify the `.github/CODEOWNERS` file:

```
# Global owners
* @yourusername

# Source code
/src/ @yourusername

# Tests
/tests/ @yourusername

# Docker
/Dockerfile @yourusername
/docker-compose.yml @yourusername

# CI/CD
/.github/ @yourusername

# Documentation
/docs/ @yourusername
/*.md @yourusername
```

**Note**: Replace `@yourusername` with actual GitHub usernames or team names.

---

## Required Status Checks Setup

Status checks come from GitHub Actions workflows. Ensure these jobs exist:

### In `.github/workflows/ci.yml`:
- Job name: `test` with matrix for Python 3.11 and 3.12
- Job name: `docker`

### In `.github/workflows/deploy-docs.yml`:
- Job name: `build-docs`

**Finding Status Check Names**:
1. Run workflows at least once
2. Go to a pull request
3. Scroll to "Merge" section
4. Click "Edit" on branch protection
5. See available status checks in the dropdown

---

## Verification Checklist

After setting up branch protection, verify:

- [ ] Cannot push directly to `main` without PR
- [ ] Cannot push directly to `develop` without PR
- [ ] Cannot merge PR without required approvals
- [ ] Cannot merge PR with failing status checks
- [ ] Cannot merge PR without being up to date
- [ ] Cannot force push to protected branches
- [ ] Cannot delete protected branches
- [ ] Code owners are automatically requested for review
- [ ] Status checks run on all PRs

### Test Protection Rules

1. **Create a test branch**:
```bash
git checkout -b test/branch-protection
git commit --allow-empty -m "test: verify branch protection"
git push origin test/branch-protection
```

2. **Create a PR** to `main` or `develop`

3. **Verify**:
   - PR requires approval
   - Status checks are required
   - Cannot bypass checks

4. **Clean up**:
```bash
git branch -d test/branch-protection
git push origin --delete test/branch-protection
```

---

## Troubleshooting

### Status checks not showing up
- **Solution**: Run the workflow at least once
- Check workflow file syntax
- Ensure workflows run on pull requests

### Cannot merge even with approvals
- **Solution**: Check if all required status checks are passing
- Ensure branch is up to date with base branch
- Check for unresolved conversations

### Admins bypassing rules unintentionally
- **Solution**: Enable "Include administrators" in branch protection
- Use rulesets with admin bypass tracking

### Force push needed (rare cases)
- **Solution**: Temporarily disable protection
- Make the necessary change
- Re-enable protection immediately
- Document the reason

---

## Automation with GitHub CLI

You can also set up branch protection using GitHub CLI:

```bash
# Install GitHub CLI
# https://cli.github.com/

# Authenticate
gh auth login

# Enable branch protection for main
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --field required_status_checks[strict]=true \
  --field required_status_checks[contexts][]=test \
  --field required_pull_request_reviews[required_approving_review_count]=1 \
  --field required_pull_request_reviews[dismiss_stale_reviews]=true \
  --field enforce_admins=true \
  --field required_linear_history=true \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

---

## Settings as Code (Probot Settings)

For automated management, use the `.github/settings.yml` file with the Probot Settings app:

1. Install Probot Settings: https://github.com/apps/settings
2. Configuration in `.github/settings.yml` (already created)
3. App automatically applies settings on push

---

## Summary

Branch protection is critical for:
- Code quality enforcement
- Review process
- Preventing accidental changes
- Maintaining project history
- Security compliance

**All protection rules should be set up before inviting collaborators.**

---

## References

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Rulesets Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [Code Owners Documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

---

**Last Updated**: 2025-12-29
