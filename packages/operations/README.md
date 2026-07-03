# Production Operations & Deployment Utilities Library

The `@rms/operations` package handles database backup/restoration compression, central logging formats, CPU/Memory health monitors, and NSIS Electron installer configurations.

---

## 💾 AES-256 DB Backups & Restores

To safeguard data against hardware crashes:
- Databases are compressed using `zlib.gzipSync` and encrypted with **AES-256-CBC**.
- Restore manager decodes, verifies hashes, and mounts the SQLite/PostgreSQL backups securely.

---

## 📈 System Health & Diagnostics

The monitor evaluates platform health:
- **Health Indicators**: Extracts os totals, CPU cores, load averages, and RAM usage percents.
- **Diagnostics**: Checks internet pings, network latency in milliseconds, and databases connectivity.

---

## ⚙️ Electron Spooler Installer Config

Includes standard config matrices to bundle POS installers:
- NSIS Installer setups with custom shortcuts and path selection inputs.

---

## 🔑 Trial Activation Keys

- Key format validation checks (`RMS-XXXXX-XXXXX-XXXXX`).
- Trial expiry time clocks (30-day default).

---

## 🔌 API Export Classes

- `DatabaseBackupManager` / `DatabaseRestoreManager`
- `CentralLogger`: Context-based file logs writer.
- `HealthMonitor`: CPU load stats.
- `DiagnosticsCenter`: Pings DNS testers.
- `AutoUpdateManager`: OTA versions check.
