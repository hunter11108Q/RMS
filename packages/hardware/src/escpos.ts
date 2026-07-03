export const ESC_POS_COMMANDS = {
  INIT:          Buffer.from([0x1b, 0x40]),
  BOLD_ON:       Buffer.from([0x1b, 0x45, 0x01]),
  BOLD_OFF:      Buffer.from([0x1b, 0x45, 0x00]),
  UNDERLINE_ON:  Buffer.from([0x1b, 0x2d, 0x01]),
  UNDERLINE_OFF: Buffer.from([0x1b, 0x2d, 0x00]),
  ALIGN_LEFT:    Buffer.from([0x1b, 0x61, 0x00]),
  ALIGN_CENTER:  Buffer.from([0x1b, 0x61, 0x01]),
  ALIGN_RIGHT:   Buffer.from([0x1b, 0x61, 0x02]),
  FONT_LARGE:    Buffer.from([0x1d, 0x21, 0x11]), // Double height & width
  FONT_NORMAL:   Buffer.from([0x1d, 0x21, 0x00]),
  PAPER_CUT:     Buffer.from([0x1d, 0x56, 0x42, 0x00]), // Feed and cut
  DRAWER_KICK:   Buffer.from([0x1b, 0x70, 0x00, 0x19, 0xfa]), // RJ11 pulse
};

export class EscPosBuilder {
  private buffer: Buffer = Buffer.alloc(0);

  public init(): this {
    this.buffer = Buffer.concat([this.buffer, ESC_POS_COMMANDS.INIT]);
    return this;
  }

  public writeLine(text: string): this {
    this.buffer = Buffer.concat([this.buffer, Buffer.from(text + '\n')]);
    return this;
  }

  public bold(on: boolean): this {
    this.buffer = Buffer.concat([this.buffer, on ? ESC_POS_COMMANDS.BOLD_ON : ESC_POS_COMMANDS.BOLD_OFF]);
    return this;
  }

  public underline(on: boolean): this {
    this.buffer = Buffer.concat([this.buffer, on ? ESC_POS_COMMANDS.UNDERLINE_ON : ESC_POS_COMMANDS.UNDERLINE_OFF]);
    return this;
  }

  public align(type: 'left' | 'center' | 'right'): this {
    const cmd = type === 'center' ? ESC_POS_COMMANDS.ALIGN_CENTER : type === 'right' ? ESC_POS_COMMANDS.ALIGN_RIGHT : ESC_POS_COMMANDS.ALIGN_LEFT;
    this.buffer = Buffer.concat([this.buffer, cmd]);
    return this;
  }

  public fontLarge(on: boolean): this {
    this.buffer = Buffer.concat([this.buffer, on ? ESC_POS_COMMANDS.FONT_LARGE : ESC_POS_COMMANDS.FONT_NORMAL]);
    return this;
  }

  public cut(): this {
    this.buffer = Buffer.concat([this.buffer, ESC_POS_COMMANDS.PAPER_CUT]);
    return this;
  }

  public kickDrawer(): this {
    this.buffer = Buffer.concat([this.buffer, ESC_POS_COMMANDS.DRAWER_KICK]);
    return this;
  }

  public feed(lines = 3): this {
    this.buffer = Buffer.concat([this.buffer, Buffer.from('\n'.repeat(lines))]);
    return this;
  }

  public getBytes(): Buffer {
    return this.buffer;
  }
}

export const ReceiptFormatter = {
  buildKOTReceipt: (kot: any, paperSize: '58mm' | '80mm' = '80mm'): Buffer => {
    const builder = new EscPosBuilder().init().align('center').bold(true).fontLarge(true);
    builder.writeLine('KITCHEN ORDER TICKET');
    builder.fontLarge(false).bold(false);
    
    const width = paperSize === '58mm' ? 32 : 48;
    const divider = '-'.repeat(width);
    
    builder.writeLine(divider);
    builder.align('left');
    builder.writeLine(`KOT No: ${kot.kotNumber || 'New'}`);
    builder.writeLine(`Table: ${kot.tableName || 'Walk-in'}`);
    builder.writeLine(`Waiter: ${kot.waiterName || 'POS'}`);
    builder.writeLine(`Time: ${new Date(kot.createdAt).toLocaleTimeString()}`);
    builder.writeLine(divider);

    // Items list header
    builder.bold(true);
    if (paperSize === '58mm') {
      builder.writeLine('QTY  ITEM NAME');
    } else {
      builder.writeLine('QTY   ITEM NAME                      NOTES');
    }
    builder.bold(false);
    builder.writeLine(divider);

    kot.items.forEach((item: any) => {
      const qtyStr = String(item.quantity).padEnd(4);
      if (paperSize === '58mm') {
        builder.writeLine(`${qtyStr} ${item.name.slice(0, 26)}`);
        if (item.notes) builder.writeLine(`   * ${item.notes}`);
      } else {
        const nameCol = item.name.slice(0, 30).padEnd(30);
        const notesCol = item.notes ? item.notes.slice(0, 10) : '';
        builder.writeLine(`${qtyStr}  ${nameCol} ${notesCol}`);
      }
    });

    builder.writeLine(divider);
    builder.feed(2).cut();
    return builder.getBytes();
  },

  buildCustomerBillReceipt: (bill: any, paperSize: '58mm' | '80mm' = '80mm'): Buffer => {
    const builder = new EscPosBuilder().init().align('center').bold(true);
    builder.writeLine(bill.restaurantName || 'RESTAURANT OUTLET');
    builder.bold(false);
    builder.writeLine(bill.address || '123 Main Street, City');
    builder.writeLine(`GSTIN: ${bill.gstin || '27XXXXX0000X1Z1'}`);
    builder.writeLine(`FSSAI: ${bill.fssai || '100XXXXXXXXXX'}`);
    
    const width = paperSize === '58mm' ? 32 : 48;
    const divider = '-'.repeat(width);
    
    builder.writeLine(divider);
    builder.align('left');
    builder.writeLine(`Bill No: ${bill.billNumber}`);
    builder.writeLine(`Date: ${new Date(bill.createdAt).toLocaleDateString()}`);
    builder.writeLine(`Table: ${bill.tableName || 'Takeaway'}`);
    builder.writeLine(divider);

    // Headers
    builder.bold(true);
    if (paperSize === '58mm') {
      builder.writeLine('ITEM NAME          QTY     RATE');
    } else {
      builder.writeLine('ITEM NAME               QTY    RATE      AMOUNT');
    }
    builder.bold(false);
    builder.writeLine(divider);

    bill.items.forEach((item: any) => {
      if (paperSize === '58mm') {
        const nameCol = item.name.slice(0, 16).padEnd(16);
        const qtyCol = String(item.quantity).padStart(5);
        const rateCol = String(item.rate).padStart(8);
        builder.writeLine(`${nameCol}${qtyCol}${rateCol}`);
      } else {
        const nameCol = item.name.slice(0, 22).padEnd(22);
        const qtyCol = String(item.quantity).padStart(6);
        const rateCol = String(item.rate).padStart(8);
        const amtCol = String(item.quantity * item.rate).padStart(10);
        builder.writeLine(`${nameCol}${qtyCol}${rateCol}${amtCol}`);
      }
    });

    builder.writeLine(divider);
    builder.align('right');
    builder.writeLine(`Subtotal: ₹${bill.subtotal}`);
    builder.writeLine(`GST charges: ₹${bill.tax || 0}`);
    builder.bold(true);
    builder.writeLine(`GRAND TOTAL: ₹${bill.grandTotal}`);
    builder.bold(false);
    builder.writeLine(divider);
    builder.align('center');
    builder.writeLine('Thank you! Please visit again.');
    builder.feed(2).cut();
    return builder.getBytes();
  },
};
