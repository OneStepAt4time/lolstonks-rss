# End-to-End (E2E) Test Plan
## LoL Stonks RSS Project

---

## Document Information

| Field | Value |
|-------|-------|
| Project | LoL Stonks RSS |
| Document Version | 1.0.0 |
| Date Created | 2025-12-29 |
| Author | QA Team |
| Status | Active |

---

## Table of Contents

1. [Test Scope](#test-scope)
2. [Test Categories](#test-categories)
3. [Test Scenarios](#test-scenarios)
4. [Test Data Requirements](#test-data-requirements)
5. [Success Criteria](#success-criteria)
6. [Test Execution Order](#test-execution-order)
7. [Test Coverage Matrix](#test-coverage-matrix)
8. [Environment Setup](#environment-setup)
9. [Test Execution Guide](#test-execution-guide)

---

## 1. Test Scope

### In Scope
- Complete application lifecycle from startup to shutdown
- News fetching from LoL API (en-us, it-it locales)
- Database CRUD operations
- RSS feed generation (main, by source, by category)
- HTTP API endpoints (all routes)
- Scheduler automatic updates
- Cache behavior and invalidation
- Error scenarios and recovery
- Multi-locale support
- Docker deployment

### Out of Scope
- Frontend UI testing (beyond API integration)
- Load testing beyond basic performance thresholds
- Security penetration testing
- Third-party RSS reader compatibility testing

---

## 2. Test Categories

### 2.1 Smoke Tests
Critical path tests that verify the application works at a basic level.

| Test ID | Test Name | Description | Duration |
|---------|-----------|-------------|----------|
| SMOKE-001 | Server Startup | Verify server starts without errors | < 5s |
| SMOKE-002 | Health Check | Verify health endpoint returns 200 | < 2s |
| SMOKE-003 | Main Feed Access | Verify main RSS feed is accessible | < 3s |
| SMOKE-004 | Database Initialization | Verify database schema is created | < 2s |
| SMOKE-005 | Scheduler Start | Verify scheduler starts successfully | < 3s |

### 2.2 Functional Tests
Tests for each individual feature and component.

| Test ID | Test Name | Description | Duration |
|---------|-----------|-------------|----------|
| FUNC-001 | API Fetch (en-us) | Fetch articles from en-us locale | < 30s |
| FUNC-002 | API Fetch (it-it) | Fetch articles from it-it locale | < 30s |
| FUNC-003 | Database Save | Save single article to database | < 1s |
| FUNC-004 | Database Save Many | Save multiple articles to database | < 2s |
| FUNC-005 | Database Retrieve | Retrieve articles by source | < 1s |
| FUNC-006 | Database GUID Lookup | Find article by GUID | < 1s |
| FUNC-007 | RSS Main Feed | Generate main RSS feed | < 2s |
| FUNC-008 | RSS Source Feed | Generate source-specific RSS feed | < 2s |
| FUNC-009 | RSS Category Feed | Generate category-specific RSS feed | < 2s |
| FUNC-010 | Cache Hit | Verify cache returns data | < 1s |
| FUNC-011 | Cache Invalidation | Verify cache invalidation works | < 1s |
| FUNC-012 | Manual Update Trigger | Manually trigger scheduler update | < 30s |

### 2.3 Integration Tests
Tests for component interactions and data flow.

| Test ID | Test Name | Description | Duration |
|---------|-----------|-------------|----------|
| INT-001 | Fetch to Database | API fetch -> Database save workflow | < 35s |
| INT-002 | Database to RSS | Database retrieve -> RSS generate workflow | < 3s |
| INT-003 | Full Update Cycle | Complete fetch -> save -> generate cycle | < 40s |
| INT-004 | Multi-Source Update | Update both en-us and it-it sources | < 60s |
| INT-005 | Cache with Database | Cache respects database changes | < 5s |

### 2.4 Performance Tests
Tests for response time and resource usage.

| Test ID | Test Name | Description | Threshold |
|---------|-----------|-------------|-----------|
| PERF-001 | Feed Generation Time | Main feed generation time | < 200ms (cached) |
| PERF-002 | Database Query Time | Article retrieval query | < 50ms average |
| PERF-003 | API Response Time | HTTP endpoint response | < 500ms |
| PERF-004 | Memory Usage | Memory consumption under load | < 500MB |
| PERF-005 | Concurrent Requests | Handle 10 concurrent requests | All succeed |

### 2.5 Reliability Tests
Tests for system stability and error recovery.

| Test ID | Test Name | Description | Duration |
|---------|-----------|-------------|----------|
| REL-001 | Scheduler Continuity | Scheduler runs for multiple cycles | 5 min |
| REL-002 | API Failure Recovery | Recover from API timeout/error | < 1 min |
| REL-003 | Database Recovery | Handle database connection loss | < 30s |
| REL-004 | Duplicate Handling | Handle duplicate GUID gracefully | < 1s |
| REL-005 | Empty Feed Handling | Handle empty article list | < 1s |

---

## 7. Test Coverage Matrix

| Feature Area | Smoke | Functional | Integration | E2E | Performance | Reliability |
|--------------|-------|------------|-------------|-----|-------------|-------------|
| Server Startup | X | X | | X | | |
| API Fetch | | X | X | X | | X |
| Database | X | X | X | X | X | X |
| RSS Generation | X | X | X | X | X | |
| HTTP Endpoints | X | X | X | X | X | |
| Scheduler | X | X | X | X | | X |
| Cache | | X | X | X | X | |
| Multi-Locale | | X | X | X | | |
| Docker | X | X | | X | | |
| Error Handling | | | X | X | | X |

---

## 9. Test Execution Guide

### 9.1 Quick Smoke Test
```bash
pytest -m smoke -v
```

### 9.2 Full E2E Test Suite
```bash
pytest -m e2e -v
```

### 9.3 Run with Coverage
```bash
pytest --cov=src --cov-report=html -m e2e
```

### 9.4 Run Test Execution Script
```bash
python scripts/run_e2e_tests.py
```

---

**Document End**
