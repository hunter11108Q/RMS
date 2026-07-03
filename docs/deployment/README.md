# RMS Build, Release & Deployment Blueprint

This document specifies environmental configurations, build setups, Electron bundling rules, Android APK/AAB compilation pipelines, and Docker container strategies.

---

## 1. Environment Configurations Strategy

We enforce four standard environments, managed via environment variables and dotenv configurations:

| Environment | Purpose | Database target | Secrets Management |
| :--- | :--- | :--- | :--- |
| `development` | Local developer workstation | Local PostgreSQL container | Local `.env` file |
| `testing` | Jest / Unit testing suite | Ephemeral testing DB | Decoded in CI workflow runner |
| `staging` | QA, release verification | Replica database server | AWS Secret Manager / Vault |
| `production` | Commercial SaaS deployment | Scaled, replicated RDS Postgres | Sealed runtime config |

- **Security Rule**: Never check `.env` files into Git. All secrets (JWT tokens, database passwords) must be injected as environment variables at the server runtime platform.

---

## 2. Desktop Installer Packaging (`apps/desktop/`)

We package the POS Desktop application using `electron-builder`.

- **Output formats**: `.exe` installer for Windows, `.dmg` for macOS (if needed).
- **Auto-Update**: We integrate the `electron-updater` module. When the application launches, it queries a secure release server (e.g. GitHub Releases or S3 bucket) using a `latest.yml` file. If a newer semver is found, it downloads the installer in the background and prompts the operator for a one-click restart.
- **Vite compilation**: Assets are built into static files inside the `dist/` directory, which Electron loads locally (`mainWindow.loadFile(...)`) to prevent network dependecy in the renderer interface.

---

## 3. Mobile App Compilation (EAS / React Native)

Mobile applications (Waiter, Kitchen, Owner) compile binaries using **Expo Application Services (EAS)**:

- **EAS Build profiles** (`eas.json`):
  - `development`: Debug version linked to local React Native packager.
  - `preview`: Internal testing APKs distributed via links or Firebase App Distribution.
  - `release`: Production AAB files for Google Play Store, and IPA files for Apple TestFlight / App Store.
- **Sync versioning**: Mobile versions must follow SemVer, matching the package bundle identifier configurations.

---

## 4. Production Docker Containerization

The backend API is containerized using multi-stage Docker builds.

- **Builder stage**: Installs development node packages, copies the TS code from `apps/backend` and packages, compiles TypeScript, and runs `prisma generate`.
- **Runner stage**: Copies only the compiled javascript (`/dist` directories), the Prisma Client, and installs production-only dependencies. This minimizes container size and security vulnerability footprints.
- **Nginx routing gateway**: Acts as an entry proxy routing HTTP traffic on port 80/443 to the Node API container on port 4000, and enables WebSocket connection upgrade handshake protocols.
