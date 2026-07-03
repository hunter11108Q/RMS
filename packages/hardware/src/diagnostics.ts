import { PrinterConfigInfo } from '@rms/types';
import { EscPosBuilder } from './escpos';
import { printQueueManager } from './queue';

export const HardwareDiagnostics = {
  triggerTestPrint: (printer: PrinterConfigInfo): string => {
    const builder = new EscPosBuilder()
      .init()
      .align('center')
      .bold(true)
      .writeLine('DIAGNOSTIC TEST PRINT')
      .bold(false)
      .writeLine(`Printer: ${printer.name}`)
      .writeLine(`Type: ${printer.type}`)
      .writeLine(`Paper: ${printer.paperSize}`)
      .writeLine(`Connection: ${printer.connectionType}`)
      .writeLine(`Timestamp: ${new Date().toLocaleString()}`)
      .align('left')
      .writeLine('--------------------------------')
      .writeLine('Char test: ABCDEFGHIJKLMNOPQRSTUVWXYZ')
      .writeLine('Number test: 0123456789')
      .align('center')
      .writeLine('Status Check: SUCCESSFUL')
      .feed(2)
      .cut();

    const job = printQueueManager.enqueue(printer, builder.getBytes(), 8);
    return job.id;
  },

  checkLanPrinterPing: async (ip: string, port = 9100): Promise<boolean> => {
    return new Promise((resolve) => {
      const net = require('net');
      const socket = new net.Socket();
      socket.setTimeout(2000);

      socket.connect(port, ip, () => {
        socket.destroy();
        resolve(true);
      });

      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
    });
  },
};
