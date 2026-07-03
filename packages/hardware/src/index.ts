import { printQueueManager } from './queue';
import { printToLan } from './printers/lan';
import { printToUsb } from './printers/usb';

// Register drivers on load
printQueueManager.registerDriver('LAN', printToLan);
printQueueManager.registerDriver('USB', printToUsb);
printQueueManager.registerDriver('BLUETOOTH', async () => true); // Placeholder bluetooth

export * from './escpos';
export * from './queue';
export * from './cashdrawer';
export * from './barcode';
export * from './qrcode';
export * from './diagnostics';
export * from './rules';
export * from './printers/lan';
export * from './printers/usb';
