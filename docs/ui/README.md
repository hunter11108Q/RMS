# RMS User Interface & Styling Blueprint

This document defines design guidelines, color layouts, touch target constraints, accessibility benchmarks, and Electron IPC messaging protocols.

---

## 1. Design Philosophy: Shift-Ready Accessibility

The RMS UI is built for fast-paced, high-pressure environments. It is optimized for long work shifts (up to 12 hours) and senior operators (60–65 years old) who might have minor visual or motor skill changes.

### Minimal Eye Strain
- **Default Theme**: Soft light mode (light-slate background `#F8FAFC`, soft white cards `#FFFFFF`) to avoid glare under indoor restaurant lighting.
- **Harsh Contrast Avoidance**: We avoid pure white-on-black or pure black-on-neon text. Colors are selected from slate, zinc, and soft sky-blue ranges.
- **No Animations**: Interactive transitions must not exceed `150ms`. Dynamic slide-overs, fades, or loaders must be kept minimal and functional.

### Large Touch Targets
- **Mobile POS & Waiter Devices**: All clickable components (buttons, item tiles, cart modifiers) must enforce a minimum touch target size of **48x48px**.
- **Desktop POS Buttons**: Enforce a minimum target size of **44x44px**.
- **Touch Gaps**: Clicking buttons must have at least **8px** of visual separation to prevent double-press errors.

---

## 2. Typography & Layout Hierarchy

We use a dual-font structure:
1. **Inter**: Standard sans-serif for UI labels, tables, input fields, navigation text.
2. **Outfit**: Display font with distinct numbers for prices, quantities, token counters, and grand totals to maximize reading accuracy.

### Font-Sizes
- `Label Small`: `12px` (used for secondary timestamps or user IDs).
- `Label Base`: `16px` (main input text, buttons, table cell values).
- `Header Item`: `18px` (dish name, menu categories).
- `Grand Total`: `24px` (bold Outfit typography for invoice amounts).

---

## 3. Electron IPC Architecture (Desktop POS Boundary)

Desktop POS terminals communicate with physical system hardware (receipt thermal printers, cash drawer kicks, local barcode scanners) via a secure Electron Bridge.

```
┌──────────────────────────┐           (Secure Bridge)            ┌────────────────────────┐
│  React Renderer Process  │ ───────────────────────────────────> │  Electron Main Process  │
│  (Isolated Sandbox)      │ ◄─────────────────────────────────── │  (Full Node.js Context)│
└──────────────────────────┘      window.api.invokeChannel()      └────────────────────────┘
```

- **Sandbox Security Rules**:
  - `nodeIntegration` is disabled in the renderer window config.
  - `contextIsolation` is enabled.
  - Sockets, node filesystem access, or printing drivers are kept out of the React web code.
- **Preload expose schema**:
  Only expose narrow, explicit methods inside `packages/ui` and `apps/desktop/src/preload.ts`:
  ```typescript
  contextBridge.exposeInMainWorld('api', {
    printReceipt: (orderPayload: any) => ipcRenderer.invoke('hardware:print', orderPayload),
    kickDrawer: () => ipcRenderer.invoke('hardware:drawer'),
  });
  ```
- **IPC Channel naming**:
  Use explicit prefixes for IPC invocation:
  - `hardware:print` (Receipt print trigger)
  - `hardware:drawer` (Cash drawer kickout)
  - `hardware:scanner` (Barcode trigger)
