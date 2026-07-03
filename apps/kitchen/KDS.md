# Kitchen Display System (KDS) Module

A tablet-optimized kitchen display console running under `apps/kitchen/`. It eliminates paper KOT tickets, routing orders automatically to different prep stations in real time.

---

## 🍳 KOT Status Workflow

Each order flows through the standard KOT status lifecycle:
```
[ NEW ] ──► [ ACCEPTED ] ──► [ PREPARING ] ──► [ READY ] ──► [ SERVED ]
```
- **NEW**: Order dispatched by waiter. Display card sounds alert.
- **ACCEPTED**: Checked-in by kitchen supervisor.
- **PREPARING**: Chef starts cooking.
- **READY**: Kitchen marks order complete. Waiter console receives a "Ready to Serve" visual badge.
- **SERVED**: Dish served. KOT card clears from the screen layout.

---

## 🥘 Kitchen Station Routing

Station filtering is processed dynamically based on KOT item names matching category tags:
- **BAR**: Soft beverages, juices, teas, coffees, cocktails.
- **DESSERT**: Ice cream, puddings, kulfi, custom sweet bakery.
- **TANDOOR**: Clay oven flatbreads, tikka skewers, kebabs.
- **CHINESE**: Noodles, fried rice, soup starters.
- **BAKERY**: Breads, buns, croissants, custom pastries.
- **MAIN KITCHEN**: Curry gravies, dal, rice, standard mains.

---

## 📡 WebSocket Event Synchronization

- The client establishes a WebSocket connection using the session bearer token.
- Listening events like `kot.new`, `kot.update`, and `order.cancelled` trigger a background refresh of the KOT active queue.

---

## 🔌 API Integrations

| Handler | Method | Endpoint | Description |
|---|---|---|---|
| kdsApi.listKOTs | `GET` | `/orders/kots/list` | Fetch active KOT list |
| kdsApi.updateKOTStatus | `PATCH` | `/orders/kots/:id/status` | Update KOT cooking status |
| kdsApi.getBranchDetails | `GET` | `/branches/:id` | Get branch setup and layouts |
| kdsApi.listTables | `GET` | `/tables` | Match table IDs to names |

---

## 🛠️ Developer Notes & Commands

- Run type checking:
  ```bash
  cd apps/kitchen
  npm run type-check
  ```
- Run tests:
  ```bash
  npm test
  ```
