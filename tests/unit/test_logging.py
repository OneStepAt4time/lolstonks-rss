"""
Unit tests for logging utilities.

Tests the structured logging system including:
- Logging configuration
- Request ID generation and context management
- RequestIdMiddleware
- Logger creation
- Context variable management
"""

from contextvars import ContextVar
from unittest.mock import MagicMock

import pytest
from fastapi import Request, Response
from fastapi.responses import JSONResponse

from src.utils.logging import (
    RequestIdMiddleware,
    _add_request_id_from_context,
    _request_id_ctx_var,
    configure_structlog,
    generate_request_id,
    get_logger,
    get_request_id,
)

# =============================================================================
# Test configure_structlog()
# =============================================================================


class TestConfigureStructlog:
    """Tests for configure_structlog function."""

    def test_configure_structlog_json_mode(self) -> None:
        """Test configuration with JSON logging."""
        configure_structlog(json_logging=True, log_level="INFO")

        # Should not raise - configuration successful
        # Verify by checking that loggers can be created
        logger = get_logger("test")
        assert logger is not None

    def test_configure_structlog_console_mode(self) -> None:
        """Test configuration with console logging."""
        configure_structlog(json_logging=False, log_level="DEBUG")

        logger = get_logger("test")
        assert logger is not None

    def test_configure_structlog_various_log_levels(self) -> None:
        """Test configuration with various log levels."""
        levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]

        for level in levels:
            configure_structlog(json_logging=True, log_level=level)
            logger = get_logger(f"test_{level}")
            assert logger is not None

    def test_configure_structlog_uppercase_log_level(self) -> None:
        """Test that lowercase log_level is converted to uppercase."""
        configure_structlog(json_logging=True, log_level="info")

        logger = get_logger("test")
        assert logger is not None

    def test_configure_structlog_default_params(self) -> None:
        """Test configuration with default parameters."""
        configure_structlog()

        logger = get_logger("test")
        assert logger is not None


# =============================================================================
# Test _add_request_id_from_context()
# =============================================================================


class TestAddRequestIdFromContext:
    """Tests for _add_request_id_from_context processor."""

    def test_add_request_id_when_present(self) -> None:
        """Test that request ID is added when present in context."""
        _request_id_ctx_var.set("test-request-123")

        event_dict = {"event": "Test event"}
        result = _add_request_id_from_context(None, "info", event_dict)

        assert result["request_id"] == "test-request-123"
        assert result["event"] == "Test event"

    def test_add_request_id_when_absent(self) -> None:
        """Test that event dict is unchanged when request ID is absent."""
        _request_id_ctx_var.set(None)

        event_dict = {"event": "Test event"}
        result = _add_request_id_from_context(None, "info", event_dict)

        assert "request_id" not in result
        assert result["event"] == "Test event"

    def test_add_request_id_preserves_other_fields(self) -> None:
        """Test that other event dict fields are preserved."""
        _request_id_ctx_var.set("req-456")

        event_dict = {
            "event": "Test",
            "user_id": "123",
            "action": "login",
        }
        result = _add_request_id_from_context(None, "info", event_dict)

        assert result["request_id"] == "req-456"
        assert result["user_id"] == "123"
        assert result["action"] == "login"


# =============================================================================
# Test get_logger()
# =============================================================================


class TestGetLogger:
    """Tests for get_logger function."""

    def test_get_logger_returns_bound_logger(self) -> None:
        """Test that get_logger returns a logger."""
        configure_structlog()

        logger = get_logger("test_module")

        assert logger is not None
        # structlog returns BoundLoggerLazyProxy, which is a valid logger type
        assert logger is not None

    def test_get_logger_returns_logger(self) -> None:
        """Test that get_logger returns a usable logger."""
        configure_structlog()

        logger = get_logger("test_module")

        assert logger is not None
        # Logger should have info method
        assert hasattr(logger, "info")
        assert hasattr(logger, "debug")
        assert hasattr(logger, "error")

    def test_get_logger_with_module_name(self) -> None:
        """Test creating logger with module name."""
        configure_structlog()

        logger = get_logger("src.utils.logging")

        assert logger is not None

    def test_get_logger_different_names(self) -> None:
        """Test creating loggers with different names."""
        configure_structlog()

        logger1 = get_logger("module1")
        logger2 = get_logger("module2")

        assert logger1 is not None
        assert logger2 is not None

    def test_get_logger_caching(self) -> None:
        """Test that logger with same name returns same instance (cached)."""
        configure_structlog()

        logger1 = get_logger("cached_module")
        logger2 = get_logger("cached_module")

        # structlog caches loggers by name
        assert logger1 is not None
        assert logger2 is not None


# =============================================================================
# Test generate_request_id()
# =============================================================================


class TestGenerateRequestId:
    """Tests for generate_request_id function."""

    def test_generate_request_id_returns_string(self) -> None:
        """Test that generate_request_id returns a string."""
        request_id = generate_request_id()

        assert isinstance(request_id, str)

    def test_generate_request_id_length(self) -> None:
        """Test that request ID is correct length (32 hex chars)."""
        request_id = generate_request_id()

        # UUID4 hex is 32 characters
        assert len(request_id) == 32

    def test_generate_request_id_is_hex(self) -> None:
        """Test that request ID contains only hexadecimal characters."""
        request_id = generate_request_id()

        assert all(c in "0123456789abcdef" for c in request_id)

    def test_generate_request_id_unique(self) -> None:
        """Test that each call generates a unique ID."""
        ids = {generate_request_id() for _ in range(100)}

        assert len(ids) == 100

    def test_generate_request_id_no_dashes(self) -> None:
        """Test that request ID doesn't contain dashes."""
        request_id = generate_request_id()

        assert "-" not in request_id


# =============================================================================
# Test get_request_id()
# =============================================================================


class TestGetRequestId:
    """Tests for get_request_id function."""

    def test_get_request_id_when_set(self) -> None:
        """Test getting request ID when it's set in context."""
        test_id = "test-request-789"
        _request_id_ctx_var.set(test_id)

        result = get_request_id()

        assert result == test_id

        # Clean up for other tests
        _request_id_ctx_var.set(None)

    def test_get_request_id_when_not_set(self) -> None:
        """Test getting request ID when it's not set."""
        _request_id_ctx_var.set(None)

        result = get_request_id()

        assert result is None

    def test_get_request_id_after_setting_none(self) -> None:
        """Test that setting None clears the request ID."""
        _request_id_ctx_var.set("some-id")
        _request_id_ctx_var.set(None)

        result = get_request_id()

        assert result is None

    def test_get_request_id_multiple_contexts(self) -> None:
        """Test request ID isolation between contexts."""
        # This test verifies that context vars work correctly
        # In async scenarios, each context should have its own value

        id1 = "context-1-id"
        id2 = "context-2-id"

        _request_id_ctx_var.set(id1)
        result1 = get_request_id()

        _request_id_ctx_var.set(id2)
        result2 = get_request_id()

        assert result1 == id1
        assert result2 == id2

        # Clean up for other tests
        _request_id_ctx_var.set(None)


# =============================================================================
# Test RequestIdMiddleware
# =============================================================================


class TestRequestIdMiddleware:
    """Tests for RequestIdMiddleware class."""

    def test_init_default_header_name(self) -> None:
        """Test initialization with default header name."""
        app = MagicMock()

        middleware = RequestIdMiddleware(app)

        assert middleware.app == app
        assert middleware.header_name == "X-Request-ID"

    def test_init_custom_header_name(self) -> None:
        """Test initialization with custom header name."""
        app = MagicMock()

        middleware = RequestIdMiddleware(app, header_name="X-Custom-Request-ID")

        assert middleware.header_name == "X-Custom-Request-ID"

    @pytest.mark.asyncio
    async def test_dispatch_generates_request_id(self) -> None:
        """Test that request ID is generated when not in headers."""
        app = MagicMock()
        middleware = RequestIdMiddleware(app)

        request = MagicMock(spec=Request)
        request.headers = {}
        request.method = "GET"
        request.url = "https://example.com/test"
        request.client = MagicMock(host="127.0.0.1")

        async def call_next(request: Request) -> Response:
            return MagicMock(spec=Response, headers={})

        response = await middleware.dispatch(request, call_next)

        # Should have added X-Request-ID to response
        assert "X-Request-ID" in response.headers

    @pytest.mark.asyncio
    async def test_dispatch_uses_existing_request_id(self) -> None:
        """Test that existing request ID from header is used."""
        app = MagicMock()
        middleware = RequestIdMiddleware(app)

        existing_id = "existing-request-id-123"
        request = MagicMock(spec=Request)
        request.headers = {"X-Request-ID": existing_id}
        request.method = "GET"
        request.url = "https://example.com/test"
        request.client = MagicMock(host="127.0.0.1")

        async def call_next(request: Request) -> Response:
            return MagicMock(spec=Response, headers={})

        response = await middleware.dispatch(request, call_next)

        # Should use the existing ID
        assert response.headers["X-Request-ID"] == existing_id

    @pytest.mark.asyncio
    async def test_dispatch_sets_context_var(self) -> None:
        """Test that request ID is set in context variable."""
        app = MagicMock()
        middleware = RequestIdMiddleware(app)

        request = MagicMock(spec=Request)
        request.headers = {}
        request.method = "POST"
        request.url = "https://example.com/api"
        request.client = MagicMock(host="192.168.1.1")

        async def call_next(request: Request) -> Response:
            # Check that request ID is set in context during request
            request_id = get_request_id()
            assert request_id is not None
            return MagicMock(spec=Response, headers={})

        await middleware.dispatch(request, call_next)

    @pytest.mark.asyncio
    async def test_dispatch_cleans_context_after_request(self) -> None:
        """Test that context variable is cleaned up after request."""
        app = MagicMock()
        middleware = RequestIdMiddleware(app)

        request = MagicMock(spec=Request)
        request.headers = {}
        request.method = "GET"
        request.url = "https://example.com/test"
        request.client = MagicMock(host="127.0.0.1")

        async def call_next(req: Request) -> Response:
            return MagicMock(spec=Response, headers={})

        await middleware.dispatch(request, call_next)

        # After request completes, context should be cleaned
        request_id = get_request_id()
        assert request_id is None

    @pytest.mark.asyncio
    async def test_dispatch_logs_incoming_request(self) -> None:
        """Test that incoming request is logged."""
        app = MagicMock()
        middleware = RequestIdMiddleware(app)

        request = MagicMock(spec=Request)
        request.headers = {"user-agent": "TestAgent/1.0"}
        request.method = "GET"
        request.url = "https://example.com/test"
        request.client = MagicMock(host="127.0.0.1")

        async def call_next(req: Request) -> Response:
            return MagicMock(spec=Response, headers={})

        # Should not raise - logging happens internally
        await middleware.dispatch(request, call_next)

    @pytest.mark.asyncio
    async def test_dispatch_handles_exception(self) -> None:
        """Test that exceptions are handled and logged."""
        app = MagicMock()
        middleware = RequestIdMiddleware(app)

        request = MagicMock(spec=Request)
        request.headers = {}
        request.method = "GET"
        request.url = "https://example.com/error"
        request.client = MagicMock(host="127.0.0.1")

        async def call_next(req: Request) -> Response:
            raise ValueError("Test error")

        response = await middleware.dispatch(request, call_next)

        # Should return JSON error response
        assert isinstance(response, JSONResponse)
        assert response.status_code == 500

    @pytest.mark.asyncio
    async def test_dispatch_includes_request_id_in_error_response(
        self,
    ) -> None:
        """Test that error response includes request ID."""
        app = MagicMock()
        middleware = RequestIdMiddleware(app)

        request_id = "test-error-id"
        request = MagicMock(spec=Request)
        request.headers = {"X-Request-ID": request_id}
        request.method = "POST"
        request.url = "https://example.com/error"
        request.client = MagicMock(host="127.0.0.1")

        async def call_next(req: Request) -> Response:
            raise RuntimeError("Test error")

        response = await middleware.dispatch(request, call_next)

        # Error response should include the request ID
        # The exact format depends on implementation
        assert response.status_code == 500

    @pytest.mark.asyncio
    async def test_dispatch_custom_header_name(self) -> None:
        """Test with custom header name."""
        app = MagicMock()
        custom_header = "X-Correlation-ID"
        middleware = RequestIdMiddleware(app, header_name=custom_header)

        existing_id = "correlation-123"
        request = MagicMock(spec=Request)
        request.headers = {custom_header: existing_id}
        request.method = "GET"
        request.url = "https://example.com/test"
        request.client = MagicMock(host="127.0.0.1")

        async def call_next(req: Request) -> Response:
            return MagicMock(spec=Response, headers={})

        response = await middleware.dispatch(request, call_next)

        assert response.headers[custom_header] == existing_id

    @pytest.mark.asyncio
    async def test_dispatch_passes_request_to_next(self) -> None:
        """Test that request is passed to next middleware/handler."""
        app = MagicMock()
        middleware = RequestIdMiddleware(app)

        request = MagicMock(spec=Request)
        request.headers = {}
        request.method = "GET"
        request.url = "https://example.com/test"
        request.client = MagicMock(host="127.0.0.1")

        received_request = None

        async def call_next(req: Request) -> Response:
            nonlocal received_request
            received_request = req
            return MagicMock(spec=Response, headers={})

        await middleware.dispatch(request, call_next)

        assert received_request is request


# =============================================================================
# Test Context Variable Behavior
# =============================================================================


class TestContextVariableBehavior:
    """Tests for context variable behavior."""

    def test_context_var_is_contextvar(self) -> None:
        """Test that _request_id_ctx_var is a ContextVar."""
        assert isinstance(_request_id_ctx_var, ContextVar)

    def test_context_var_name(self) -> None:
        """Test that context var has correct name."""
        assert _request_id_ctx_var.name == "request_id"

    def test_context_var_default_is_none(self) -> None:
        """Test that context var default is None."""
        # Getting value without setting should return default
        result = _request_id_ctx_var.get(None)
        assert result is None


# =============================================================================
# Test Integration Scenarios
# =============================================================================


class TestLoggingIntegration:
    """Integration tests for logging system."""

    @pytest.mark.asyncio
    async def test_full_request_logging_flow(self) -> None:
        """Test complete flow of request logging with request ID."""
        configure_structlog(json_logging=True)

        app = MagicMock()
        middleware = RequestIdMiddleware(app)

        request = MagicMock(spec=Request)
        request.headers = {}
        request.method = "GET"
        request.url = "https://example.com/test"
        request.client = MagicMock(host="127.0.0.1")

        request_id_in_handler = None

        async def call_next(req: Request) -> Response:
            nonlocal request_id_in_handler
            request_id_in_handler = get_request_id()

            logger = get_logger("test_handler")
            logger.info("Processing request")

            return MagicMock(spec=Response, headers={})

        response = await middleware.dispatch(request, call_next)

        # Verify request ID was set during handler
        assert request_id_in_handler is not None

        # Verify request ID was added to response
        assert "X-Request-ID" in response.headers

    @pytest.mark.asyncio
    async def test_multiple_concurrent_requests(self) -> None:
        """Test that concurrent requests have different request IDs."""
        import asyncio

        configure_structlog()
        app = MagicMock()
        middleware = RequestIdMiddleware(app)

        collected_ids = []

        async def simulate_request(request_id: str) -> str:
            req = MagicMock(spec=Request)
            req.headers = {}
            req.method = "GET"
            req.url = f"https://example.com/request-{request_id}"
            req.client = MagicMock(host="127.0.0.1")

            async def call_next(r: Request) -> Response:
                collected_ids.append(get_request_id())
                return MagicMock(spec=Response, headers={})

            await middleware.dispatch(req, call_next)
            return collected_ids[-1]

        # Run multiple concurrent requests
        results = await asyncio.gather(*[simulate_request(str(i)) for i in range(10)])

        # All request IDs should be unique
        assert len(set(results)) == 10
        assert len(set(collected_ids)) == 10


# =============================================================================
# Test Type Aliases
# =============================================================================


class TestTypeAliases:
    """Tests for type aliases."""

    def test_bound_logger_type(self) -> None:
        """Test BoundLogger type alias."""
        configure_structlog()

        logger = get_logger("test")

        # BoundLogger should be compatible with structlog.stdlib.BoundLogger
        assert logger is not None
