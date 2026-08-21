import logging
from typing import Optional
import redis

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class RedisClient:
    """Production-minded Redis client abstraction with resilient error handling and graceful degradation."""

    _client: Optional[redis.Redis] = None

    @classmethod
    def get_client(cls) -> Optional[redis.Redis]:
        """Lazy initialization of the Redis client instance."""
        if cls._client is None and settings.REDIS_URL:
            try:
                cls._client = redis.from_url(
                    settings.REDIS_URL,
                    decode_responses=True,
                    socket_connect_timeout=1.5,
                    socket_timeout=1.5,
                )
            except Exception as exc:
                logger.warning(f"Failed to initialize Redis client: {exc}")
                cls._client = None
        return cls._client

    @classmethod
    def get(cls, key: str) -> Optional[str]:
        """Fetch string value from Redis cache by key. Returns None on cache miss or connection error."""
        client = cls.get_client()
        if client is None:
            return None
        try:
            return client.get(key)
        except Exception as exc:
            logger.warning(f"Redis GET failed for key '{key}': {exc}")
            return None

    @classmethod
    def set(
        cls, key: str, value: str, ttl_seconds: Optional[int] = None
    ) -> bool:
        """Store string value in Redis with optional TTL. Returns True on success, False on failure."""
        client = cls.get_client()
        if client is None:
            return False
        try:
            ttl = ttl_seconds if ttl_seconds is not None else settings.REDIS_CACHE_TTL_SECONDS
            client.set(key, value, ex=ttl)
            return True
        except Exception as exc:
            logger.warning(f"Redis SET failed for key '{key}': {exc}")
            return False

    @classmethod
    def delete(cls, key: str) -> bool:
        """Invalidate key in Redis. Returns True on success, False on failure."""
        client = cls.get_client()
        if client is None:
            return False
        try:
            client.delete(key)
            return True
        except Exception as exc:
            logger.warning(f"Redis DELETE failed for key '{key}': {exc}")
            return False
