---
title: Data Flow
description: How data flows through the LoL Stonks RSS system
---

# Data Flow

Documentation of how data flows through the LoL Stonks RSS system.

## 🔄 Update Flow

```mermaid
sequenceDiagram
    participant Scheduler
    participant Fetcher
    participant Database
    participant Cache

    Scheduler->>Fetcher: Trigger update
    Fetcher->>Fetcher: Fetch news
    Fetcher->>Database: Save articles
    Database->>Cache: Invalidate cache
    Fetcher->>Scheduler: Complete
```

## 📡 Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Cache
    participant Generator
    participant Database

    Client->>API: GET /feed
    API->>Cache: Check cache
    alt Cache hit
        Cache->>API: Return cached
    else Cache miss
        API->>Database: Get articles
        Database->>API: Return data
        API->>Generator: Generate RSS
        Generator->>API: RSS XML
        API->>Cache: Store
    end
    API->>Client: Return feed
```

## 📚 Learn More

- [Architecture Overview](overview.md)
- [Components](components.md)
- [Performance](performance.md)
