"""Integration tests for Redis cache backend."""

import os
import time
from unittest.mock import patch

import pytest
from redis.exceptions import ConnectionError, TimeoutError

from src.utils.cache import RedisCacheBackend, create_cache_backend

# Test configuration
REDIS_URL = os.getenv("TEST_REDIS_URL", "redis://localhost:6379/1")
REDIS_TEST_KEY_PREFIX = "test_lolstonks:"


@pytest.mark.redis
class TestRedisConnection:
    """Test real Redis connection functionality."""

    def test_redis_connection_successful(self):
        """Test that we can successfully connect to Redis."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        # Verify connection is established
        assert cache.is_healthy() is True
        assert cache._connected is True
        assert cache._client is not None

        # Cleanup
        cache.clear()

    def test_redis_connection_ping(self):
        """Test Redis PING command works."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        # The ping should work if connection is healthy
        assert cache.is_healthy() is True

        cache.clear()

    def test_redis_connection_with_auth(self, monkeypatch):
        """Test Redis connection with authentication."""
        # This test would need a Redis instance with auth configured
        # For now, we skip if auth URL is not provided
        auth_url = os.getenv("TEST_REDIS_AUTH_URL")
        if not auth_url:
            pytest.skip("TEST_REDIS_AUTH_URL not set")

        cache = RedisCacheBackend(redis_url=auth_url, key_prefix=REDIS_TEST_KEY_PREFIX)
        assert cache.is_healthy() is True
        cache.clear()

    def test_redis_connection_failure(self):
        """Test connection failure handling."""
        # Use a non-existent Redis server
        cache = RedisCacheBackend(
            redis_url="redis://localhost:9999/0", key_prefix=REDIS_TEST_KEY_PREFIX
        )

        # Connection should fail gracefully
        assert cache._connected is False
        assert cache.is_healthy() is False


@pytest.mark.redis
class TestRedisCachePersistence:
    """Test that Redis cache persists data correctly."""

    def test_cache_set_and_persist(self):
        """Test that set operations persist to Redis."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        # Clear first to ensure clean state
        cache.clear()

        # Set a value
        cache.set("test_key", "test_value")

        # Verify it was persisted by creating a new connection
        cache2 = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)
        assert cache2.get("test_key") == "test_value"

        # Cleanup
        cache.clear()

    def test_cache_multiple_keys_persist(self):
        """Test that multiple keys persist correctly."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        cache.clear()

        # Set multiple values
        test_data = {
            "key1": "value1",
            "key2": "value2",
            "key3": "value3",
            "key4": 12345,
            "key5": {"nested": "dict"},
        }

        for key, value in test_data.items():
            cache.set(key, value)

        # Verify all values persist
        for key, expected_value in test_data.items():
            assert cache.get(key) == expected_value

        # Verify with new connection
        cache2 = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)
        for key, expected_value in test_data.items():
            assert cache2.get(key) == expected_value

        # Cleanup
        cache.clear()

    def test_cache_expiration_persisted(self):
        """Test that TTL expiration works correctly in Redis."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        cache.clear()

        # Set a key with short TTL (2 seconds)
        cache.set("expire_key", "expire_value", ttl_seconds=2)

        # Should be available immediately
        assert cache.get("expire_key") == "expire_value"

        # Wait for expiration
        time.sleep(2.5)

        # Should be expired
        assert cache.get("expire_key") is None

        # Cleanup
        cache.clear()

    def test_cache_delete_persisted(self):
        """Test that delete operations persist."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        cache.clear()

        # Set a value
        cache.set("delete_key", "delete_value")
        assert cache.get("delete_key") == "delete_value"

        # Delete it
        result = cache.delete("delete_key")
        assert result is True
        assert cache.get("delete_key") is None

        # Verify deletion persists with new connection
        cache2 = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)
        assert cache2.get("delete_key") is None

        # Cleanup
        cache.clear()

    def test_cache_clear_persisted(self):
        """Test that clear operations persist."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        # Set multiple values
        for i in range(10):
            cache.set(f"key{i}", f"value{i}")

        # Clear all
        cache.clear()

        # Verify all are gone
        for i in range(10):
            assert cache.get(f"key{i}") is None

        # Verify with new connection
        cache2 = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)
        for i in range(10):
            assert cache2.get(f"key{i}") is None

        cache2.clear()

    def test_cache_stats_persisted(self):
        """Test that cache stats reflect Redis state."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        cache.clear()

        # Set some values and do some gets
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        cache.set("key3", "value3")

        cache.get("key1")  # hit
        cache.get("key2")  # hit
        cache.get("key4")  # miss

        stats = cache.get_stats()

        assert stats["total_entries"] == 3
        assert stats["hits"] == 2
        assert stats["misses"] == 1
        assert stats["hit_rate"] == 2 / 3
        assert stats["redis_connected"] is True

        # Cleanup
        cache.clear()


@pytest.mark.redis
class TestRedisConnectionFailureHandling:
    """Test graceful handling of Redis connection failures."""

    def test_connection_failure_during_get(self):
        """Test that get handles connection failures gracefully."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        # Simulate connection failure during get
        with patch.object(cache._client, "get", side_effect=ConnectionError("Connection lost")):
            result = cache.get("test_key")
            assert result is None
            # Connection should be marked as unhealthy
            assert cache._connected is False

    def test_connection_failure_during_set(self):
        """Test that set handles connection failures gracefully."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        # Simulate connection failure during set
        with patch.object(cache._client, "setex", side_effect=TimeoutError("Timeout")):
            # Should not raise exception
            cache.set("test_key", "test_value")
            # Connection should be marked as unhealthy
            assert cache._connected is False

    def test_connection_failure_during_delete(self):
        """Test that delete handles connection failures gracefully."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        # Simulate connection failure during delete
        with patch.object(cache._client, "delete", side_effect=ConnectionError("Connection lost")):
            result = cache.delete("test_key")
            assert result is False
            assert cache._connected is False

    def test_connection_failure_during_clear(self):
        """Test that clear handles connection failures gracefully."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        # Simulate connection failure during keys and delete
        with patch.object(cache._client, "keys", side_effect=ConnectionError("Connection lost")):
            # Should not raise exception
            cache.clear()
            assert cache._connected is False

    def test_reconnection_after_failure(self):
        """Test that cache can recover after connection failure."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        # Set a value
        cache.set("test_key", "test_value")

        # Simulate connection failure
        with patch.object(cache._client, "get", side_effect=ConnectionError("Connection lost")):
            cache.get("test_key")

        assert cache._connected is False

        # Create new cache instance - should reconnect
        cache2 = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        # Should be able to connect and get the value
        assert cache2.is_healthy() is True

        # Cleanup
        cache2.clear()


@pytest.mark.redis
class TestRedisPerformance:
    """Test performance characteristics of Redis cache."""

    def test_bulk_operations_performance(self):
        """Test performance of bulk operations."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        cache.clear()

        # Benchmark bulk set
        import time

        start_time = time.time()
        num_keys = 1000
        for i in range(num_keys):
            cache.set("bulk_key_" + str(i), "bulk_value_" + str(i))
        set_time = time.time() - start_time

        # Benchmark bulk get
        start_time = time.time()
        for i in range(num_keys):
            cache.get("bulk_key_" + str(i))
        get_time = time.time() - start_time

        # Performance expectations (very generous thresholds)
        assert set_time < 10.0  # Should set 1000 keys in less than 10 seconds
        assert get_time < 5.0  # Should get 1000 keys in less than 5 seconds

        # Cleanup
        cache.clear()

    def test_concurrent_operations(self):
        """Test thread safety of Redis operations."""
        import threading

        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)
        cache.clear()

        results = []
        errors = []

        def worker(worker_id):
            try:
                for i in range(100):
                    key = "worker_" + str(worker_id) + "_key_" + str(i)
                    value = "worker_" + str(worker_id) + "_value_" + str(i)
                    cache.set(key, value)
                    retrieved = cache.get(key)
                    if retrieved != value:
                        errors.append("Value mismatch for " + key)
                results.append(worker_id)
            except Exception as e:
                errors.append("Worker error: " + str(e))

        # Start 10 concurrent workers
        threads = []
        for i in range(10):
            t = threading.Thread(target=worker, args=(i,))
            threads.append(t)
            t.start()

        # Wait for all threads to complete
        for t in threads:
            t.join()

        # Check results
        assert len(errors) == 0
        assert len(results) == 10

        # Cleanup
        cache.clear()


@pytest.mark.redis
class TestRedisDockerComposeIntegration:
    """Test integration with Docker Compose setup."""

    def test_docker_compose_redis_url(self):
        """Test using Docker Compose Redis URL."""
        # This test is designed to work with docker-compose setup
        docker_redis_url = os.getenv("TEST_DOCKER_REDIS_URL", REDIS_URL)

        cache = RedisCacheBackend(redis_url=docker_redis_url, key_prefix=REDIS_TEST_KEY_PREFIX)

        # Should connect successfully
        assert cache.is_healthy() is True

        # Basic operations should work
        cache.set("docker_test", "docker_value")
        assert cache.get("docker_test") == "docker_value"

        # Cleanup
        cache.clear()

    def test_cache_backend_factory_with_docker_redis(self):
        """Test create_cache_backend with Docker Redis."""
        docker_redis_url = os.getenv("TEST_DOCKER_REDIS_URL", REDIS_URL)

        backend = create_cache_backend(
            backend_type="redis",
            redis_url=docker_redis_url,
            default_ttl_seconds=3600,
        )

        assert isinstance(backend, RedisCacheBackend)
        assert backend.is_healthy() is True

        # Cleanup
        backend.clear()


@pytest.mark.redis
class TestRedisDataTypes:
    """Test handling of different data types in Redis."""

    def test_string_type(self):
        """Test storing string values."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        cache.clear()
        cache.set("string_key", "string_value")
        assert cache.get("string_key") == "string_value"
        cache.clear()

    def test_integer_type(self):
        """Test storing integer values."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        cache.clear()
        cache.set("int_key", 12345)
        assert cache.get("int_key") == 12345
        cache.clear()

    def test_float_type(self):
        """Test storing float values."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        cache.clear()
        cache.set("float_key", 3.14159)
        assert cache.get("float_key") == 3.14159
        cache.clear()

    def test_list_type(self):
        """Test storing list values."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        cache.clear()
        test_list = [1, 2, 3, "four", {"five": 5}]
        cache.set("list_key", test_list)
        assert cache.get("list_key") == test_list
        cache.clear()

    def test_dict_type(self):
        """Test storing dict values."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        cache.clear()
        test_dict = {"name": "Test", "value": 123, "nested": {"key": "value"}}
        cache.set("dict_key", test_dict)
        assert cache.get("dict_key") == test_dict
        cache.clear()

    def test_none_type(self):
        """Test storing None values."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        cache.clear()
        cache.set("none_key", None)
        assert cache.get("none_key") is None
        cache.clear()

    def test_bool_type(self):
        """Test storing boolean values."""
        cache = RedisCacheBackend(redis_url=REDIS_URL, key_prefix=REDIS_TEST_KEY_PREFIX)

        cache.clear()
        cache.set("bool_true", True)
        cache.set("bool_false", False)
        assert cache.get("bool_true") is True
        assert cache.get("bool_false") is False
        cache.clear()
