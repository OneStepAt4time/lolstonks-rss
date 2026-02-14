"""
Configuration management for the LoL Stonks RSS application.

This module uses pydantic-settings for type-safe configuration management
with support for environment variables and .env files.
"""

from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings

# Complete locale registry - all supported Riot locales
RIOT_LOCALES = [
    "en-us",  # English - United States
    "en-gb",  # English - Great Britain
    "es-es",  # Spanish - Spain
    "es-mx",  # Spanish - Latin America
    "fr-fr",  # French - France
    "de-de",  # German - Germany
    "it-it",  # Italian - Italy
    "pt-br",  # Portuguese - Brazil
    "ru-ru",  # Russian - Russia
    "tr-tr",  # Turkish - Turkey
    "pl-pl",  # Polish - Poland
    "ja-jp",  # Japanese - Japan
    "ko-kr",  # Korean - Korea
    "zh-cn",  # Chinese - Simplified
    "zh-tw",  # Chinese - Traditional
    "ar-ae",  # Arabic - UAE
    "vi-vn",  # Vietnamese - Vietnam
    "th-th",  # Thai - Thailand
    "id-id",  # Indonesian - Indonesia
    "ph-ph",  # Filipino - Philippines
    "cs-cz",  # Czech - Czech Republic
    "el-gr",  # Greek - Greece
    "en-au",  # English - Australia
    "en-sg",  # English - Singapore
    "hu-hu",  # Hungarian - Hungary
]

# Game domains - all use identical Next.js API pattern
GAME_DOMAINS: dict[str, str] = {
    "lol": "https://www.leagueoflegends.com",
    "tft": "https://teamfighttactics.leagueoflegends.com",
    "wildrift": "https://wildrift.leagueoflegends.com",
}

# News categories per game (verified working endpoints)
LOL_NEWS_CATEGORIES = [
    "game-updates",
    "dev",
    "esports",
    "community",
    "media",
    "lore",
    "riot-games",
    "announcements",
    "merch",
]

TFT_NEWS_CATEGORIES = [
    "game-updates",
    "dev",
    "esports",
    "community",
    "media",
]

WILDRIFT_NEWS_CATEGORIES = [
    "game-updates",
    "dev",
    "esports",
    "community",
]

GAME_CATEGORIES: dict[str, list[str]] = {
    "lol": LOL_NEWS_CATEGORIES,
    "tft": TFT_NEWS_CATEGORIES,
    "wildrift": WILDRIFT_NEWS_CATEGORIES,
}

# Mapping from category URL slug to display name (as returned by Riot API)
CATEGORY_SLUG_TO_DISPLAY: dict[str, str] = {
    "game-updates": "Game Updates",
    "dev": "Dev",
    "esports": "Esports",
    "community": "Community",
    "media": "Media",
    "lore": "Lore",
    "riot-games": "Riot Games",
    "announcements": "Announcements",
    "merch": "Merch",
}

# Locale groups for batch operations and regional feeds
LOCALE_GROUPS = {
    "english": ["en-us", "en-gb", "en-au", "en-sg"],
    "spanish": ["es-es", "es-mx"],
    "chinese": ["zh-cn", "zh-tw"],
    "eu": ["en-gb", "fr-fr", "de-de", "it-it", "es-es", "pl-pl", "cs-cz", "el-gr", "hu-hu"],
    "latam": ["es-mx", "pt-br"],
    "asia": ["ja-jp", "ko-kr", "zh-cn", "zh-tw", "vi-vn", "th-th", "id-id", "ph-ph"],
    "sea": ["vi-vn", "th-th", "id-id", "ph-ph"],
    "oceania": ["en-au", "en-sg"],
    "all": RIOT_LOCALES,
}

# Localized feed titles
FEED_TITLES = {
    "en-us": "League of Legends News",
    "en-gb": "League of Legends News",
    "it-it": "Notizie League of Legends",
    "es-es": "Noticias de League of Legends",
    "es-mx": "Noticias de League of Legends",
    "fr-fr": "Actualites League of Legends",
    "de-de": "League of Legends Neuigkeiten",
    "pt-br": "Noticias de League of Legends",
    "ru-ru": "News League of Legends",
    "tr-tr": "League of Legends Haberleri",
    "pl-pl": "Wiadomosci League of Legends",
    "ja-jp": "リーグ・オブ・レジェンド ニュース",
    "ko-kr": "리그 오브 레전드 뉴스",
    "zh-cn": "英雄联盟新闻",
    "zh-tw": "英雄聯盟新聞",
    "ar-ae": "أخبار ليج أوف ليجندز",
    "vi-vn": "Tin tuc League of Legends",
    "th-th": "ข่าว League of Legends",
    "id-id": "Berita League of Legends",
    "ph-ph": "Balita ng League of Legends",
    "cs-cz": "League of Legends Novinky",
    "el-gr": "\u039d\u03ad\u03b1 League of Legends",
    "en-au": "League of Legends News",
    "en-sg": "League of Legends News",
    "hu-hu": "League of Legends H\u00edrek",
}

# Localized feed descriptions
FEED_DESCRIPTIONS = {
    "en-us": "Latest League of Legends news and updates",
    "en-gb": "Latest League of Legends news and updates",
    "it-it": "Ultime notizie e aggiornamenti di League of Legends",
    "es-es": "Las ultimas noticias y actualizaciones de League of Legends",
    "es-mx": "Las ultimas noticias y actualizaciones de League of Legends",
    "fr-fr": "Dernieres actualites de League of Legends",
    "de-de": "Die neuesten League of Legends Neuigkeiten und Updates",
    "pt-br": "Ultimas noticias e atualizacoes de League of Legends",
    "ru-ru": "News League of Legends",
    "tr-tr": "League of Legends haberleri ve guncellemeleri",
    "pl-pl": "Najnowsze wiadomosci i aktualizacje League of Legends",
    "ja-jp": "リーグ・オブ・レジェンドの最新ニュースとアップデート",
    "ko-kr": "리그 오브 레전드 최신 뉴스 및 업데이트",
    "zh-cn": "英雄联盟最新新闻和更新",
    "zh-tw": "英雄聯盟最新消息與更新",
    "ar-ae": "أحدث أخبار وتحديثات ليج أوف ليجندز",
    "vi-vn": "Tin tuc League of Legends moi nhat",
    "th-th": "ข่าวและอัปเดตล่าสุดของ League of Legends",
    "id-id": "Berita dan pembaruan League of Legends terbaru",
    "ph-ph": "Mga pinakabagong balita at update ng League of Legends",
    "cs-cz": "Nejnov\u011bj\u0161\u00ed zpr\u00e1vy a aktualizace League of Legends",
    "el-gr": "\u03a4\u03b5\u03bb\u03b5\u03c5\u03c4\u03b1\u03af\u03b1 \u03bd\u03ad\u03b1 \u03ba\u03b1\u03b9 \u03b5\u03bd\u03b7\u03bc\u03b5\u03c1\u03ce\u03c3\u03b5\u03b9\u03c2 League of Legends",
    "en-au": "Latest League of Legends news and updates",
    "en-sg": "Latest League of Legends news and updates",
    "hu-hu": "League of Legends legfrissebb h\u00edrei \u00e9s friss\u00edt\u00e9sei",
}

# Feed titles for TFT and Wild Rift
TFT_FEED_TITLES: dict[str, str] = {
    "en-us": "Teamfight Tactics News",
    "en-gb": "Teamfight Tactics News",
    "it-it": "Notizie Teamfight Tactics",
    "es-es": "Noticias de Teamfight Tactics",
    "fr-fr": "Actualit\u00e9s Teamfight Tactics",
    "de-de": "Teamfight Tactics Neuigkeiten",
    "pt-br": "Not\u00edcias de Teamfight Tactics",
    "ja-jp": "\u30c1\u30fc\u30e0\u30d5\u30a1\u30a4\u30c8\u30bf\u30af\u30c6\u30a3\u30af\u30b9 \u30cb\u30e5\u30fc\u30b9",
    "ko-kr": "\ud300\ud30c\uc774\ud2b8 \ud0dd\ud2f1\uc2a4 \ub274\uc2a4",
}

TFT_FEED_DESCRIPTIONS: dict[str, str] = {
    "en-us": "Latest Teamfight Tactics news and updates",
    "en-gb": "Latest Teamfight Tactics news and updates",
    "it-it": "Ultime notizie e aggiornamenti di Teamfight Tactics",
    "es-es": "Las \u00faltimas noticias de Teamfight Tactics",
    "fr-fr": "Derni\u00e8res actualit\u00e9s Teamfight Tactics",
    "de-de": "Die neuesten Teamfight Tactics Neuigkeiten",
    "pt-br": "\u00daltimas not\u00edcias de Teamfight Tactics",
    "ja-jp": "TFT\u306e\u6700\u65b0\u30cb\u30e5\u30fc\u30b9",
    "ko-kr": "TFT \ucd5c\uc2e0 \ub274\uc2a4",
}

WILDRIFT_FEED_TITLES: dict[str, str] = {
    "en-us": "Wild Rift News",
    "en-gb": "Wild Rift News",
    "it-it": "Notizie Wild Rift",
    "es-es": "Noticias de Wild Rift",
    "fr-fr": "Actualit\u00e9s Wild Rift",
    "de-de": "Wild Rift Neuigkeiten",
    "pt-br": "Not\u00edcias de Wild Rift",
    "ja-jp": "\u30ef\u30a4\u30eb\u30c9\u30ea\u30d5\u30c8 \u30cb\u30e5\u30fc\u30b9",
    "ko-kr": "\uc640\uc77c\ub4dc \ub9ac\ud504\ud2b8 \ub274\uc2a4",
}

WILDRIFT_FEED_DESCRIPTIONS: dict[str, str] = {
    "en-us": "Latest Wild Rift news and updates",
    "en-gb": "Latest Wild Rift news and updates",
    "it-it": "Ultime notizie e aggiornamenti di Wild Rift",
    "es-es": "Las \u00faltimas noticias de Wild Rift",
    "fr-fr": "Derni\u00e8res actualit\u00e9s Wild Rift",
    "de-de": "Die neuesten Wild Rift Neuigkeiten",
    "pt-br": "\u00daltimas not\u00edcias de Wild Rift",
    "ja-jp": "\u30ef\u30a4\u30eb\u30c9\u30ea\u30d5\u30c8\u306e\u6700\u65b0\u30cb\u30e5\u30fc\u30b9",
    "ko-kr": "\uc640\uc77c\ub4dc \ub9ac\ud504\ud2b8 \ucd5c\uc2e0 \ub274\uc2a4",
}


class Settings(BaseSettings):
    """
    Application configuration with environment variable support.

    All settings can be overridden via environment variables or .env file.
    Environment variables should be uppercase (e.g., DATABASE_PATH).
    """

    # Worktree mode for parallel development
    worktree_mode: bool = Field(
        default=False,
        description="Enable worktree mode for parallel agent development",
    )
    worktree_branch: str = Field(
        default="main",
        description="Current branch name in worktree mode",
    )
    worktree_db_suffix: str = Field(
        default="",
        description="Suffix for isolated database in worktree mode",
    )
    worktree_port: int = Field(
        default=8000,
        description="Port allocated for this worktree",
    )

    # Database configuration
    database_path: str = "data/articles.db"

    @property
    def effective_database_path(self) -> str:
        """
        Get the actual database path considering worktree mode.

        In worktree mode, uses an isolated database per branch.
        Otherwise uses the standard database path.
        """
        if self.worktree_mode and self.worktree_db_suffix:
            return f"data/articles-{self.worktree_db_suffix}.db"
        return self.database_path

    @property
    def effective_port(self) -> int:
        """
        Get the actual port considering worktree mode.

        In worktree mode, uses the allocated port.
        Otherwise uses the standard port.
        """
        return self.worktree_port if self.worktree_mode else self.port

    # API configuration
    lol_news_base_url: str = "https://www.leagueoflegends.com"

    # Multi-language support
    supported_locales: list[str] | str = Field(
        default=RIOT_LOCALES,
        description="Supported locales for news fetching",
    )

    locale_groups: dict[str, list[str]] = Field(
        default=LOCALE_GROUPS,
        description="Locale groups for batch operations",
    )

    feed_titles: dict[str, str] = Field(
        default=FEED_TITLES,
        description="Feed titles per locale",
    )

    feed_descriptions: dict[str, str] = Field(
        default=FEED_DESCRIPTIONS,
        description="Feed descriptions per locale",
    )

    @field_validator("supported_locales", mode="before")
    @classmethod
    def parse_supported_locales(cls, v: list[str] | str) -> list[str]:
        """Parse supported_locales from env string or list."""
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            # Split by comma and strip whitespace
            return [loc.strip() for loc in v.split(",") if loc.strip()]
        return RIOT_LOCALES

    # Caching configuration (in seconds)
    cache_ttl_seconds: int = 21600  # 6 hours
    build_id_cache_seconds: int = 86400  # 24 hours

    # Redis caching configuration
    redis_url: str = Field(
        default="redis://localhost:6379/0",
        description="Redis connection URL for distributed caching",
    )
    cache_backend: str = Field(
        default="auto",
        description="Cache backend to use: 'redis', 'memory', or 'auto' (tries Redis, falls back to memory)",
    )

    @field_validator("cache_backend")
    @classmethod
    def validate_cache_backend(cls, v: str) -> str:
        """Validate cache_backend value."""
        valid_backends = {"redis", "memory", "auto"}
        if v not in valid_backends:
            raise ValueError(f"cache_backend must be one of {valid_backends}, got '{v}'")
        return v

    # RSS feed configuration
    rss_feed_title: str = "League of Legends News"
    rss_feed_description: str = "Latest League of Legends news and updates"
    rss_feed_link: str = "https://www.leagueoflegends.com/news"
    rss_max_items: int = 50
    feed_cache_ttl: int = 300  # 5 minutes

    # Server configuration
    base_url: str = "http://localhost:8000"
    # Bind to all interfaces - acceptable for containerized deployment behind reverse proxy
    host: str = "0.0.0.0"  # nosec: B104 - intentional for Docker deployment
    port: int = 8000
    reload: bool = False  # Set True for development

    # Update scheduling
    update_interval_minutes: int = 5

    # Logging
    log_level: str = "INFO"
    json_logging: bool = Field(
        default=True,
        description="Enable JSON structured logging (vs plain text)",
    )

    # CORS Configuration
    allowed_origins: list[str] | str = ["http://localhost:8000"]

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v: list[str] | str) -> list[str]:
        """Parse allowed_origins from env string or list."""
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            # Split by comma and strip whitespace
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return ["http://localhost:8000"]

    # HTTP Client Configuration
    http_timeout_seconds: int = 30

    # GitHub Pages Integration (Optional)
    github_token: str | None = Field(
        default=None, description="GitHub Personal Access Token for triggering workflows"
    )
    github_repository: str = Field(
        default="OneStepAt4time/lolstonks-rss",
        description="GitHub repository in format 'owner/repo'",
    )
    enable_github_pages_sync: bool = Field(
        default=False,
        description="Enable automatic GitHub Pages update when new articles found",
    )

    def get_feed_title(self, locale: str = "en-us") -> str:
        """
        Get localized feed title for a given locale.

        Args:
            locale: Locale code (e.g., "en-us", "it-it")

        Returns:
            Localized feed title, falling back to English if not found
        """
        return self.feed_titles.get(locale, self.feed_titles.get("en-us", "League of Legends News"))

    def get_feed_description(self, locale: str = "en-us") -> str:
        """
        Get localized feed description for a given locale.

        Args:
            locale: Locale code (e.g., "en-us", "it-it")

        Returns:
            Localized feed description, falling back to English if not found
        """
        return self.feed_descriptions.get(
            locale,
            self.feed_descriptions.get("en-us", "Latest League of Legends news and updates"),
        )

    class Config:
        """Pydantic configuration."""

        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    """
    Get cached settings instance.

    Uses LRU cache to ensure only one Settings instance is created
    during the application lifetime.

    Returns:
        Cached Settings instance
    """
    return Settings()
