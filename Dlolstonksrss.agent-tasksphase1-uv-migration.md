# Phase 1: UV Migration Task

## Agent: python-pro

## Context
- Project: LoL Stonks RSS (League of Legends news RSS feed generator)
- Current state: Using requirements.txt for dependencies
- Has pyproject.toml with ONLY tool configs (black, mypy, ruff, pytest)
- Need to migrate to UV-based package management workflow

## Requirements
1. Convert requirements.txt to pyproject.toml [project] section
2. Setup UV-compatible project metadata
3. Preserve all existing dependencies with exact versions
4. Separate dev dependencies (pytest, black, mypy, ruff) from runtime dependencies
5. Add proper project metadata (name, version, description, authors, license)
6. Preserve existing tool configurations in pyproject.toml
7. Test that UV can install and run the project
8. Update Dockerfile to use UV instead of pip
9. Document UV commands for developers

## Current Dependencies (requirements.txt)
- Runtime: fastapi, uvicorn, feedgen, feedparser, httpx, aiosqlite, pydantic, pydantic-settings, python-dotenv, apscheduler, cachetools, python-dateutil
- Dev: pytest, pytest-asyncio, pytest-cov, black, mypy, ruff

## Expected Deliverables
1. Updated pyproject.toml with [project] dependencies
2. Updated Dockerfile using UV
3. Documentation of UV workflow in README or separate guide
4. Verification that project runs with UV

## Files to Modify
- D:\lolstonksrss\pyproject.toml (add [project] section)
- D:\lolstonksrss\Dockerfile (migrate to UV)
- D:\lolstonksrss\README.md (update installation instructions)

## Priority: CRITICAL (First task in production readiness)
