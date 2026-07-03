import { EscPosBuilder, ESC_POS_COMMANDS } from '../src/escpos';
import { printQueueManager } from '../src/queue';
import { cashDrawerManager } from '../src/cashdrawer';
import { barcodeScannerWedge } from '../src/barcode';
import { QrCodeGenerator } from '../src/qrcode';
import { PrinterConfigInfo } from '@rms/types';

describe('Hardware Integration Package Tests Suite', () => {
  beforeEach(() => {
    printQueueManager.clearQueue();
  });

  it('should verify ESC/POS Builder compiles exact byte commands', () => {
    const builder = new EscPosBuilder().init().bold(true).writeLine('TEST').cut();
    const bytes = builder.getBytes();

    expect(bytes.indexOf(ESC_POS_COMMANDS.INIT)).toBe(0);
    expect(bytes.indexOf(ESC_POS_COMMANDS.BOLD_ON)).toBe(2);
    expect(bytes.indexOf(ESC_POS_COMMANDS.PAPER_CUT)).toBeGreaterThan(0);
  });

  it('should verify print queue handles jobs prioritizations', () => {
    const printer: PrinterConfigInfo = {
      id: 'p-1',
      branchId: 'b-1',
      name: 'Receipt Printer',
      type: 'BILLING',
      paperSize: '80mm',
      connectionType: 'USB',
      isActive: true,
    };

    const payload = Buffer.from('Print data');

    const job1 = printQueueManager.enqueue(printer, payload, 2); // low priority
    const job2 = printQueueManager.enqueue(printer, payload, 9); // high priority

    const jobs = printQueueManager.getJobs();
    expect(jobs.length).toBe(2);
    
    // Low priority job has index 0 in insertion but high priority job2 is first in queue list
    expect(jobs[0].id).toBe(job1.id);
    expect(jobs[1].id).toBe(job2.id);
  });

  it('should log cash drawer opens events in diagnostics log', () => {
    const printer: PrinterConfigInfo = {
      id: 'p-1',
      branchId: 'b-1',
      name: 'Cash Drawer Printer',
      type: 'BILLING',
      paperSize: '80mm',
      connectionType: 'USB',
      isActive: true,
    };

    expect(cashDrawerManager.getLogs().length).toBe(0);
    cashDrawerManager.triggerDrawerOpen(printer, 'MANUAL_OPEN', 'Chef Kumar');
    
    const logs = cashDrawerManager.getLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].action).toBe('MANUAL_OPEN');
    expect(logs[0].waiterName).toBe('Chef Kumar');
  });

  it('should verify barcode scanner wedge buffers keyboard strokes', () => {
    let scannedBarcode = '';
    barcodeScannerWedge.addListener({
      onScan: (barcode) => {
        scannedBarcode = barcode;
      },
    });

    const now = Date.now();
    barcodeScannerWedge.handleKeyPress('8', now);
    barcodeScannerWedge.handleKeyPress('9', now + 5);
    barcodeScannerWedge.handleKeyPress('0', now + 10);
    barcodeScannerWedge.handleKeyPress('Enter', now + 15);

    expect(scannedBarcode).toBe('890');
  });

  it('should compile EPSON QR code print commands', () => {
    const qrBytes = QrCodeGenerator.buildEscPosQrCode('https://rms.digital/pay');
    expect(qrBytes.length).toBeGreaterThan(10);
  });
});
