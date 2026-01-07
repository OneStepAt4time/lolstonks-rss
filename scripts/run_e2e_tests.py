#!/usr/bin/env python
"""
Run all E2E tests with proper setup and reporting.

This script executes the E2E test suite in phases:
1. Smoke tests first (quick validation)
2. Functional tests
3. Full E2E tests (including slow tests)
4. Performance tests

Usage:
    python scripts/run_e2e_tests.py
    python scripts/run_e2e_tests.py --skip-slow
    python scripts/run_e2e_tests.py --coverage
"""

import subprocess
import sys
import argparse


def run_command(cmd, description):
    """Run a command and return success status."""
    print(f"\n{'=' * 60}")
    print(f"{description}")
    print(f"{'=' * 60}")
    result = subprocess.run(cmd, shell=True)
    return result.returncode == 0


def main():
    parser = argparse.ArgumentParser(description="Run E2E test suite")
    parser.add_argument("--skip-slow", action="store_true", help="Skip slow tests (real API calls)")
    parser.add_argument("--coverage", action="store_true", help="Generate coverage report")
    parser.add_argument("--smoke-only", action="store_true", help="Run only smoke tests")
    args = parser.parse_args()

    print("\n" + "=" * 60)
    print("LoL Stonks RSS - E2E Test Suite")
    print("=" * 60)

    # Phase 1: Smoke tests (always run)
    if not run_command(
        "pytest -m smoke -v",
        "Phase 1: Running Smoke Tests..."
    ):
        print("\n[FAILED] SMOKE TESTS FAILED - Stopping execution")
        return 1

    print("\n[PASS] Smoke tests passed!")

    if args.smoke_only:
        print("\n[DONE] Smoke-only run complete!")
        return 0

    # Phase 2: Functional tests (excluding slow)
    if not run_command(
        'pytest -m "e2e and not slow" -v',
        "Phase 2: Running Functional Tests..."
    ):
        print("\n[FAILED] Functional tests failed!")
        return 1

    print("\n[PASS] Functional tests passed!")

    # Phase 3: Full E2E (with slow tests)
    if not args.skip_slow:
        if not run_command(
            "pytest -m e2e -v --tb=short",
            "Phase 3: Running Complete E2E Tests (including slow)..."
        ):
            print("\n[FAILED] E2E tests failed!")
            return 1
        print("\n[PASS] E2E tests passed!")
    else:
        print("\n[SKIP] Skipping slow tests (--skip-slow specified)")

    # Phase 4: Performance tests
    if not run_command(
        "pytest -m performance -v",
        "Phase 4: Running Performance Tests..."
    ):
        print("\n[FAILED] Performance tests failed!")
        return 1

    print("\n[PASS] Performance tests passed!")

    # Coverage report (if requested)
    if args.coverage:
        if not run_command(
            "pytest --cov=src --cov-report=html -m e2e",
            "Generating Coverage Report..."
        ):
            print("\n[WARN] Coverage generation had issues")

    print("\n" + "=" * 60)
    print("[SUCCESS] ALL E2E TESTS PASSED!")
    print("=" * 60)
    return 0


if __name__ == "__main__":
    sys.exit(main())
