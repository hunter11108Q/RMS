# RMS Database & Repository Architecture Blueprint

This document specifies the database schemas mapping rules, repository pattern abstractions, migration strategies, and database-level auditing patterns.

---

## 1. Prisma & Schema Modeling Conventions

- **Model Names**: Always PascalCase (e.g. `MenuItem`, `AuditLog`).
- **Database Table Mapping**: Force pluralized snake_case database tables using `@@map` (e.g. `@@map("menu_items")`).
- **Database Column Mapping**: Fields must be camelCase in the application code, but mapped to snake_case in PostgreSQL database columns using `@map`:
  ```prisma
  model MenuItem {
    id        String   @id @default(uuid())
    name      String
    price     Decimal  @db.Decimal(10, 2)
    createdAt DateTime @default(now()) @map("created_at")

    @@map("menu_items")
  }
  ```
- **Indexes**: Explicitly declare composite indexes for multi-tenant queries (e.g., `@@index([branchId, status])`).

---

## 2. Layered Repository Pattern

To isolate infrastructure concerns (Prisma clients and raw SQL) from the core business services layer, all data access operations must route through a dedicated **Repository** module.

```
┌───────────────────┐      ┌────────────────────────┐      ┌──────────────────┐
│  Business Service │ ───> │  Domain Repository Class│ ───> │   Prisma Client  │
└───────────────────┘      └────────────────────────┘      └──────────────────┘
```

- **Rules**:
  - Services must never call `prisma.model.findMany` directly.
  - Implement a dedicated repository class per core aggregate root (e.g., `OrderRepository`, `UserRepository`, `InventoryRepository`).
  - Repository interfaces must return clean TypeScript entities rather than raw, unchecked database outputs.

---

## 3. Database Auditing Pipeline

Security compliance demands a complete, immutable history of all mutations.

- **Audited Methods**: Any `create`, `update`, or `delete` query.
- **Implementation**:
  - The repository layer intercepts all writes, capturing:
    - Actor ID (Logged-in operator user UUID).
    - Event Action (`ORDER_VOID`, `DISCOUNT_OVERRIDE`, `TABLE_CLOSURE`).
    - Old State JSON vs New State JSON payload.
    - Contextual metadata (IP address, device, timestamp).
  - This payload is committed transactionally alongside the operation to an `audit_logs` table.

---

## 4. Soft-Delete Strategy

Physical records must never be purged from the database during ordinary operations to maintain audit integrity and loyalty statistics.

- **Schema field**: Add `deletedAt DateTime? @map("deleted_at")` to all models.
- **Repository Filter**: All fetch queries (`get`, `find`, `list`) executed inside repository modules must implicitly inject `deletedAt: null` into the Prisma where conditions.
- **Deletion query**: A repository `delete` command translates to `prisma.model.update({ where: { id }, data: { deletedAt: new Date() } })`.
