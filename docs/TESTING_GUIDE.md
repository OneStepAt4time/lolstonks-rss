# Testing Guide

## Test Organization

tests/
- unit/ - Fast isolated tests
- integration/ - Component integration tests  
- e2e/ - End-to-end workflow tests
- performance/ - Performance benchmarks
- validation/ - RSS compliance tests

## Running Tests

All tests:
pytest

Skip slow tests:
pytest -m "not slow"

With coverage:
pytest --cov=src --cov-report=html

## Coverage Status

Overall: 92% (Goal: 90%+)
All 151 tests passing

## Test Markers

- unit - Fast isolated tests
- integration - Integration tests
- slow - Real API calls
- e2e - End-to-end tests
- performance - Performance tests
- validation - RSS validation

## Key Tests

- test_api.py - API endpoints
- test_rss_generator.py - RSS generation
- test_database.py - Database operations
- test_full_workflow.py - E2E workflows
- test_performance.py - Performance benchmarks
- test_rss_compliance.py - RSS 2.0 validation
