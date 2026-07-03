# RMS Master Platform Architecture & Operations Manual

This guide outlines the system configurations, database deployments, licensing setups, white-label configs, and plugin lifecycles of the Restaurant Management System.

---

## 1. Platform Architecture Guide

The RMS platform is built as a modular monorepo using npm workspaces:
- **Backend API & WebSocket server** (`apps/backend`): Node.js + Express + Prisma + WebSocket Manager. Serves POS clients and syncs mobile states.
- **Desktop POS cashier client** (`apps/desktop`): Electron + React + Vite. Integrates print queues and local offline SQLite states.
- **Mobile terminals** (`apps/waiter`, `apps/kitchen`, `apps/owner`): React Native + Expo. Enables touch mapping, KOT orders, and real-time dashboard analytics.
- **Shared packages** (`packages/`): Types, API contracts, validations, offline sync queue trackers, hardware builders, and SaaS settings.

---

## 2. Plugin Development Guide

Plugins allow third-party integrations (accounting, CRM, WhatsApp notifications) to hook into active event streams without modifying core code.

### Writing a Plugin:
1. Implement the `RmsPlugin` interface:
   ```typescript
   export interface RmsPlugin {
     name: string;
     version: string;
     onLoad: (context: any) => Promise<void>;
     onUnload: () => Promise<void>;
   }
   ```
2. Subscribe to event hooks using the `PluginManager`:
   ```typescript
   pluginManager.registerHook('OrderCreated', (order) => {
     // Run custom WhatsApp alert or CRM log sync
   });
   ```

---

## 3. Public API & Webhooks Guide

### API Authentication:
- Public clients authenticate using API keys. Key hashes are checked in the database using timing-safe SHA-256 comparisons (`ApiKeyManager.verifyKey`).

### Webhook Signatures:
- Webhook payloads are dispatched as `POST` requests signed with `HMAC-SHA256` keys:
  ```
  X-RMS-Signature: <computed-hmac-hash>
  X-RMS-Event: OrderCreated
  ```
- Subscribed clients check the signature header against their webhook secret.

---

## 4. SaaS Migration & Tenant Isolation Guide

The database schema includes a `tenantId` field on every resource to isolate client data.

### Upgrading a Single-Tenant to Multi-Tenant SaaS:
1. Map subdomains dynamically to verify tenant routes: `tenant-a.rms.digital` maps to `tenantId = "tenant-a"`.
2. Configure tenant plans (BASIC, PRO, ENTERPRISE) inside `TenantManager`.
3. Check branch limits and storage quotas when registering new locations.

---

## 5. Licensing & Device Grace Periods Guide

The platform uses cryptographically signed license files to allow offline validations:
1. Manifest details (expiry date, device count limits) are hashed with an HMAC-SHA256 signature key.
2. POS client verifies this signature locally.
3. If expired, client permits a 7-day grace period before locking cashier checkouts.

---

## 6. AI BI Integration Guide

The AI Business Intelligence module extracts insights using provider adapters:
- **`FallbackRuleAiProvider`**: Rule-based fallback engine (calculates stats offline).
- **Gemini / OpenAI Adapters**: Queries API models to predict peak hour staffing or inventory reorders.

---

## 7. White-Label Configuration Guide

Branding details are loaded dynamically from configurations:
- **Style Overlays**: Replace color themes (primary, accent, background) and logos without compiling the source code.
- **Branded Receipts**: Set custom header and footer captions dynamically.

---

## 8. Backup, Restoration & Crash Recovery Guide

### Database Backup:
- Backups compress database files (`zlib`) and encrypt them (`AES-256-CBC`) using static keys.
- Run `DatabaseBackupManager.backup(sourceDb, targetBak, true)`.

### Database Restore:
- Validate file signature, decrypt, decompress, and replace the database file.
- Run `DatabaseRestoreManager.restore(targetBak, restoredDb, true)`.
