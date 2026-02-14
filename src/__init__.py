"""
LoL Stonks RSS Feed Generator

A Python application that generates RSS feeds for League of Legends news.
"""

import os
from importlib.metadata import PackageNotFoundError, version

__version__ = os.environ.get("APP_VERSION")
if not __version__:
    try:
        __version__ = version("lolstonksrss")
    except PackageNotFoundError:
        __version__ = "0.0.0.dev0"
