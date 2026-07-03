# Commercial SaaS, AI Platform & Licensing Library

The `@rms/platform` package coordinates the SaaS commercialization layer: AI analytics adapters, dynamic plugin registrations, signed webhooks, multi-tenant configs, and licensing validation signatures.

---

## 🧠 AI Business Intelligence Adapters

The AI adapter manages dynamic analysis feeds:
- Supports toggling between `Gemini`, `OpenAI`, or rule-based fallback analytics.
- Evaluates peak hours traffic, sales trend analysis, and staff allocation suggestion indexes.
- Recommendations engine evaluates low-margin recipes or price changes.

---

## 🔌 Extensible Plugin Lifecycle

Plugins register custom integrations into core hooks without changing basic business code:
- Trigger Hooks: e.g. `OrderCreated`, `BillGenerated`.
- Hooks subscribe to plugins for Accounting syncing, loyalty programs, or WhatsApp delivery alerts.

---

## 🔒 signed Webhooks

Integrators hook into the platform via:
- Public API keys hashed with SHA-256 in the database.
- Webhook notifications signed using **HMAC-SHA256** secrets.

---

## 🔑 Cryptographic Offline Licensing

- Generates cryptographic signatures of license manifests.
- Offline check compares active signatures and flags grace periods if expired.

---

## 🔌 API Export Classes

- `AiBIAdapter`: Integrates Gemini/OpenAI endpoints.
- `SmartRecommendationsEngine`: Restock warnings.
- `PluginManager`: Hooks lifecycles manager.
- `ApiKeyManager`: SHA-256 key validator.
- `WebhookManager`: Signed event publisher.
- `TenantManager`: Check branch limits.
- `FeatureFlagsManager`: Module feature toggles.
- `CommercialLicenseValidator`: Crypto sign validators.
- `WhiteLabelManager`: Overlay style controls.
- `SecurityHardener`: XSS and account masks.
