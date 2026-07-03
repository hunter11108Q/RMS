# RMS Monorepo Core Architecture Blueprint

This document defines the architectural patterns, sync protocols, real-time message structures, and layers that govern the Restaurant Management System.

---

## 1. System Topology & Layers

The RMS uses a **multi-tenant monorepo layout**. Code is strictly modularized into **Applications** (representing execution targets) and **Packages** (representing shared libraries).

```
                 ┌────────────────────────────────────────────────┐
                 │                shared/packages                 │
                 │   - Types      - Constants   - API Contracts   │
                 │   - Validation - Theme       - Utils & Hooks   │
                 └──────┬──────────────────────────────────┬──────┘
                        │                                  │
                        ▼                                  ▼
      ┌───────────────────────────────────┐      ┌───────────────────┐
      │             apps/clients          │      │    apps/backend   │
      │  - desktop  - waiter   - kitchen  │      │  - REST API       │
      │  - owner                          │      │  - WebSockets     │
      └───────────────────────────────────┘      └───────────────────┘
```

---

## 2. Real-Time Communication System (WebSocket Channels)

Real-time notification and order tracking use WebSockets under a structured publish-subscribe (Pub/Sub) pattern.

### Handshake & Authentication
1. Clients establish socket connections by requesting: `ws://<server-domain>/ws?token=<jwt-access-token>`.
2. The server interceptor extracts and verifies the token. If valid, it attaches the `UserContext` directly to the socket connection object and registers it under the client's assigned `branchId`.

### Connection Health (Heartbeat Protocol)
- **Ping/Pong Duty**: The server issues a ping frame to all connected clients every 30 seconds.
- **Client Response**: Clients must immediately reply with a pong frame. If a client fails to pong within 10 seconds of a ping, the server terminates the socket.
- **Auto-Reconnection**: The client library handles lost connections with an exponential backoff retry loop (starting at 1 second, doubling to a max of 60 seconds).

### Topic Pub/Sub Routing Table
Subscriptions are mapped implicitly in the socket manager by user role and branch identity:

| Subscribed Topic / Channel | Target Role | Payload Description |
| :--- | :--- | :--- |
| `branches/{branchId}/pos` | Owner, Manager, Cashier | Broadcasts ticket closures, drawer triggers, cash reconciliation. |
| `branches/{branchId}/kot` | Kitchen Staff, Waiter | Real-time KOT tickets creation, preparation status, and item voids. |
| `branches/{branchId}/waiters` | Waiter | Occupancy indicators, table bookings status, and served KOT alerts. |

---

## 3. Offline-First Sync Engine (Local Replication Outbox)

Desktop POS terminals and Waiter apps must remain functional even during complete network drops. They run a local embed database (RxDB for Web, SQLite for Mobile) and queue mutation actions.

```
[Local Mutation: add item] ──> [Apply Local DB State] ──> [Enqueue Outbox Log (UUID, payload)]
                                                                   │
                                                           (Reconnected online)
                                                                   ▼
[Send batch payload] ◄──────── [Lock Outbox Process] ◄────── [Trigger Flush]
```

### Outbox Transaction Schema
Mutations are logged in an append-only local database store (outbox) with a uniform layout:
```typescript
interface LocalMutationLog {
  uuid: string;         // Unique client-generated transaction UUID
  branchId: string;     // Branch context
  action: string;       // e.g., "CREATE_ORDER", "VOID_ITEM"
  payload: any;         // Encapsulated data payload
  timestamp: number;    // UNIX microsecond timestamp
  status: 'PENDING' | 'SYNCING' | 'FAILED' | 'SYNCED';
  retryCount: number;
}
```

### Batch Upload & Idempotency
- When the network status switches to online, the client locks the outbox and submits a `SyncBatchRequest` to the backend: `POST /api/v1/sync/batch`.
- The request body contains an array of `LocalMutationLog` payloads.
- The server processes mutations in microsecond-order inside a database transaction.
- **Idempotency Check**: The server references the mutation `uuid` in the processed log repository. If a UUID is already flagged as processed, the server skips the database write and returns the cached success response.

### Conflict Resolution Protocols
1. **Last-Write-Wins (LWW)**: For items added to a cart, order details, or customer notes, the payload with the latest microsecond-level local timestamp is committed.
2. **Server-Controlled Lock**: For table seating occupancy, the server acts as the single source of truth. If two waiter devices attempt to occupy the same table while offline, the server accepts the first synced transaction and rejects the second with a table status conflict error code (`409 Conflict`), prompting the waiter to choose an alternative table.
