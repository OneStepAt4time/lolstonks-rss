"""Integration tests for Redis cache backend."""

import os
import time
from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest
import redis
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
            redis_url="redis://localhost:9999/0",
            key_prefix=REDIS_TEST_KEY_PREFIX
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
        assert stats["hit_rate"] == 2/3
        assert stats["redis_connected"] is True
        
        # Cleanup
        cache.clear()
