# Hardware Integration & Thermal POS Peripherals Library

The `@rms/hardware` package provides modular interfaces to connect, test, and control restaurant POS hardware (thermal printers, cash drawers, barcode wedge readers).

---

## 🖨️ ESC/POS Thermal Printing

Receipt templates are compiled directly into ESC/POS bytes for fast, silent printing:
- Supports **80mm** (48 columns) and **58mm** (32 columns) printers.
- Paper cut and cash drawer pulse triggers are auto-injected dynamically.
- Models: Epson TM series, TVS, Citizen, NGX, and common Indian thermal brands.

---

## 💸 Cash Drawer RJ11 Kick

Drawers plugged into thermal printers via RJ11 phone lines are triggered by sending a kick pulse:
- Command: `ESC p m t1 t2` (`[0x1B, 0x70, 0x00, 0x19, 0xFA]`).
- Every drawer open event is logged to the `CashDrawerManager` audit ledger.

---

## 🏷️ Barcode wedges Wedge Reader

Wedges mimic standard keyboard inputs. The listener monitors timing key delays:
- Keeps a running key buffer.
- Reset buffer if delays between keypress events exceed 80ms.
- Dispatches payload instantly when suffix `Enter` is detected.

---

## 🔌 API Export Classes

- `EscPosBuilder`: Formats lines, margins, bold fonts, cut signals.
- `PrintQueueManager`: Prioritizes queues and manages connection retries.
- `LanPrinter` / `UsbPrinter`: Prints drivers sending raw buffers to TCP port `9100` or USB channels.
- `BarcodeScannerWedge`: Wedge buffer listener.
- `QrCodeGenerator`: EPSON model QR matrix compiler.
