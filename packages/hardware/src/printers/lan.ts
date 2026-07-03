import net from 'net';
import { PrinterConfigInfo } from '@rms/types';

export const printToLan = (payload: Buffer, printer: PrinterConfigInfo): Promise<boolean> => {
  return new Promise((resolve) => {
    const ip = printer.ipAddress || '127.0.0.1';
    const port = printer.portNumber || 9100;

    const socket = new net.Socket();
    
    // Set connection timeout to 4 seconds
    socket.setTimeout(4000);

    socket.connect(port, ip, () => {
      socket.write(payload, () => {
        socket.destroy();
        resolve(true);
      });
    });

    socket.on('error', (err) => {
      console.warn(`LAN Printer connection failed for ${ip}:${port}`, err.message);
      socket.destroy();
      resolve(false);
    });

    socket.on('timeout', () => {
      console.warn(`LAN Printer connection timed out for ${ip}:${port}`);
      socket.destroy();
      resolve(false);
    });
  });
};
