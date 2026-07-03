# Owner Dashboard Mobile Application

A premium executive dashboard mobile console running under `apps/owner/`. It provides restaurant owners and managers with a real-time summary of sales, staff attendances, low stock alerts, table occupancies, and profit margins.

---

## 📈 Dashboard Widgets

The executive console features key operational metrics:
- **Sales KPIs**: Daily Sales, Weekly totals, Net Revenue counters, and Average Order Value (AOV).
- **Table Occupancy**: A visual progress bar detailing occupied vs. available tables across selected branches.
- **Alert Banner**: Highlights real-time incidents (voided checks, delayed tickets, low stock triggers).

---

## 📊 Analytics Charts

Custom lightweight bar charts are rendered for:
- **Daily / Weekly / Monthly Sales Trends**
- **Average Bill Size Trends**
- **Profit & Loss summaries**

---

## 📡 WebSocket Push Alerts

The dashboard subscribes to real-time events broadcasted by the backend:
- `bill.cancelled`: Logs a critical void transaction warning.
- `low_stock`: Lists low inventory reorder warnings.
- `large_order`: Logs high-value transaction notifications.
- `refund`: Logs refund processed alerts.

---

## 🔌 API Integrations

| Service | Method | Endpoint | Description |
|---|---|---|---|
| ownerApi.getDashboardKpis | `GET` | `/reports/dashboard/kpis` | Fetch executive performance statistics |
| ownerApi.getSalesTrend | `GET` | `/reports/sales/trend` | Query sales graphs data |
| ownerApi.getInventorySummary | `GET` | `/reports/inventory/summary` | Query ingredient stock alerts |
| ownerApi.getCustomerAnalytics | `GET` | `/reports/customers/analytics` | Fetch retention and credit ledgers |
| ownerApi.listBranches | `GET` | `/branches` | Get authorized branches list |

---

## 🛠️ Developer Notes & Commands

- Run type checking:
  ```bash
  cd apps/owner
  npm run type-check
  ```
- Run tests:
  ```bash
  npm test
  ```
