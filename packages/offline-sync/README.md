# Offline Synchronization & Real-time WebSockets Library

The `@rms/offline-sync` package encapsulates conflict-free background jobs, heartbeats checking, network pings, and notification routers.

---

## ⚡ Sync Engine Conflict Resolutions

When records change in multiple places, developers can configure one of three strategies:
- **Last Updated Wins** (`LAST_UPDATED_WINS`): Compares record timestamp variables (`updatedAt`), preserving the latest payload.
- **Server Wins** (`SERVER_WINS`): Discards client modifications, pulling the canonical database record.
- **Client Wins** (`CLIENT_WINS`): Forces the server to match the client's local record.

Every conflict is logged to `conflictsAudit` for bookkeeping review.

---

## 📡 WebSocket Optimized Connections

The client wraps standard connection frames implementing:
- Auto Reconnection intervals (with exponential backoff).
- Heartbeat checks every 30s to detect ghost socket connections.
- Message retry arrays: Holds outgoing frames during disconnects, flushing them on reconnect.
- Event Acknowledgments: Blocks mutation queue items until an `ack` message is returned by the server.

---

## ⏰ Background Jobs

A registry scheduler (`BackgroundWorkerPool`) maintains:
- Interval job fires for syncing, cache cleanups, and session token rotation.
- Safe crash handling: Failures do not crash the scheduler and are logged correctly.

---

## 🔌 API Classes

- `OptimizedWebSocketClient`: Websocket manager.
- `SyncEngine`: Conflict updates queue manager.
- `CacheManager`: Evictions and resets manager.
- `ConnectivityMonitor`: Pings check latency intervals.
- `AppNotificationSystem`: In-App audio chimes alerts.
