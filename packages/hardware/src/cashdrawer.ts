import { PrinterConfigInfo } from '@rms/types';
import { printQueueManager } from './queue';
import { ESC_POS_COMMANDS } from './escpos';

export interface CashDrawerEvent {
  id: string;
  action: 'AUTO_OPEN' | 'MANUAL_OPEN';
  waiterName?: string;
  timestamp: string;
}

export class CashDrawerManager {
  private auditLog: CashDrawerEvent[] = [];

  public triggerDrawerOpen(
    printer: PrinterConfigInfo,
    action: 'AUTO_OPEN' | 'MANUAL_OPEN',
    waiterName?: string
  ): void {
    const event: CashDrawerEvent = {
      id: `cdr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      action,
      waiterName,
      timestamp: new Date().toISOString(),
    };

    this.auditLog.unshift(event);

    // Enqueue drawer kick payload with high priority (10)
    printQueueManager.enqueue(printer, ESC_POS_COMMANDS.DRAWER_KICK, 10);
  }

  public getLogs(): CashDrawerEvent[] {
    return this.auditLog;
  }
}

export const cashDrawerManager = new CashDrawerManager();
export default cashDrawerManager;
