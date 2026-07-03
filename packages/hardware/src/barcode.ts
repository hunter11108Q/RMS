export interface BarcodeScanListener {
  onScan: (barcode: string) => void;
}

export class BarcodeScannerWedge {
  private buffer = '';
  private lastKeyTime = 0;
  private listeners: Set<BarcodeScanListener> = new Set();

  public handleKeyPress(char: string, timestamp = Date.now()): void {
    const diff = timestamp - this.lastKeyTime;

    // Standard wedge scanners output keys rapidly (usually <15ms).
    // Reset buffer if delay since last key exceeds 80ms.
    if (diff > 80 && this.buffer.length > 0) {
      this.buffer = '';
    }

    this.lastKeyTime = timestamp;

    if (char === '\n' || char === 'Enter') {
      if (this.buffer.length > 3) {
        this.triggerScan(this.buffer);
      }
      this.buffer = '';
    } else {
      this.buffer += char;
    }
  }

  public addListener(listener: BarcodeScanListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private triggerScan(barcode: string): void {
    this.listeners.forEach((l) => {
      try {
        l.onScan(barcode);
      } catch (err) {
        console.warn('Barcode listener crash:', err);
      }
    });
  }
}

export const barcodeScannerWedge = new BarcodeScannerWedge();
export default barcodeScannerWedge;
