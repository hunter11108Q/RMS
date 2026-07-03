# RMS REST API Specification & Guidelines

This document outlines the standard routing layout, naming conventions, error payload contracts, and HTTP status codes for the RMS REST APIs.

---

## 1. Routing Conventions & Naming

- **Base Endpoint Routing**: All endpoints must be versioned under `/api/v1/`.
- **Resource Naming**: Use plural nouns and kebab-case for resource directories (e.g. `/menu-items`, `/order-refunds`).
- **REST Method Mappings**:
  - `GET`: Retrieve resources (must support cursor pagination on listing resources).
  - `POST`: Create a new resource or initiate a transition. Must include an `Idempotency-Key` header for mutations.
  - `PUT`: Complete idempotent resource updates.
  - `PATCH`: Partial state modification (e.g. updating table status).
  - `DELETE`: Safe soft-delete of resources.

---

## 2. Standard API Envelopes

All JSON API endpoints must return a consistent, uniform response body.

### Successful Response Envelope (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "data": {
    "id": "e44d3202-ea63-4554-b52b-4e12e10410ff",
    "name": "Paneer Butter Masala",
    "price": 280
  },
  "timestamp": "2026-06-29T18:00:00.000Z"
}
```

### Error Response Envelope (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `422 Unprocessable Entity`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The payload contains invalid field configurations",
    "details": [
      {
        "field": "price",
        "message": "Price must be a positive integer"
      }
    ]
  },
  "timestamp": "2026-06-29T18:00:00.000Z"
}
```

---

## 3. Standard Routes Layout

| Route Directory | Method | Access Roles | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/login` | `POST` | Public | Authenticate operator, sets httpOnly Refresh cookie. |
| `/api/v1/auth/refresh` | `POST` | Public | Reissue access token using active refresh cookie. |
| `/api/v1/branches` | `GET` | Owner | List all business branches under tenant scope. |
| `/api/v1/branches/:id/tables` | `GET` | Waiter, Cashier | Get current dining table layout and occupied status. |
| `/api/v1/orders` | `POST` | Waiter, Cashier | Create a new invoice or KOT ticket. |
| `/api/v1/orders/:id/items` | `PATCH` | Waiter, Manager | Add, remove, or modify items inside an active ticket. |
| `/api/v1/kots/:id/status` | `PATCH` | Kitchen Staff | Toggle KOT preparation status (PREPARING -> READY). |
| `/api/v1/sync/batch` | `POST` | Cashier, Waiter | Bulk push offline mutation transactions. |
