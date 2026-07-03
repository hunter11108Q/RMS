# Waiter Mobile Application Console

A modern, offline-first React Native / Expo application optimized for restaurant handheld devices and tablets.

---

## 📱 Navigation Diagram & Screen Flow

```
                     [ LoginScreen / PinLoginScreen ]
                                   │ (Authenticated)
                                   ▼
                       [ AppNavigator (Tabs) ]
  ┌───────────────┬────────────────┼───────────────┬────────────────┐
  ▼               ▼                ▼               ▼                ▼
[Dashboard]    [Tables]         [Orders]        [Menu]        [Reservations]
  │              │                 │               │                │
  │              ├─►TableDetail    ├─►OrderDetail  │                └─►Check-in/Seat
  │              │   │             │               │
  └─►QuickActions◄───┼─────────────┼───────────────┘
                     ▼             ▼
             [ NewOrderScreen (Menu Search + CartSheet) ]
```

---

## ⚡ Offline & Sync Workflows

The application implements a resilient, fault-tolerant offline-first synchronization engine using an queue-based system.

### 1. Offline Mode Detection
- The app pings `/live` in the background every 15 seconds.
- On request failures or connection loss, NetInfo/ping state shifts to `isOnline = false`.

### 2. Transaction Queuing
- Order creations, KOT dispatches, and table status modifications are converted to `OfflineMutation` records.
- Mutations are stored in Zustand state and serialized to device storage using `AsyncStorage`.
- The UI registers a notice indicating successful local queue status.

### 3. Sync Sequence (Conflict Resolution)
- Upon reconnecting, the sync engine fires.
- Pending mutations are sorted chronologically and sent sequentially via the API client.
- Successful updates are cleared from the queue.
- Network connection drops halt the queue sync immediately to protect chronological ordering.

---

## 🔌 API Integration Guide

| Handler | Method | Endpoint | Description |
|---|---|---|---|
| authApi.login | `POST` | `/auth/login` | Session registration |
| authApi.getCurrentUser | `GET` | `/auth/me` | Retrieve profile context |
| menuApi.listCategories | `GET` | `/menu/categories` | Retrieve all menu categories |
| menuApi.listItems | `GET` | `/menu/items` | Retrieve branch menu items |
| tableApi.listTables | `GET` | `/tables` | Live table status list |
| tableApi.updateStatus | `PATCH` | `/tables/:id/status` | Modify status (occupied, billing) |
| orderApi.createOrder | `POST` | `/orders` | Create draft order |
| orderApi.addOrderItem | `POST` | `/orders/:id/items` | Append items to order |
| orderApi.generateKOT | `POST` | `/orders/:id/kots` | Dispatch KOT ticket |
| orderApi.listOrders | `GET` | `/orders` | Retrieve active orders list |
| reservationApi.listReservations | `GET` | `/tables/reservations` | Retrieve bookings list |

---

## 🛠️ Developer Notes & Commands

- To check TypeScript compilation:
  ```bash
  cd apps/waiter
  npm run type-check
  ```
- To start the Expo server for Android development:
  ```bash
  npm run android
  ```
- Zustand is configured to automatically export `usePosStore` as a backward-compatible alias to keep existing code functional.
