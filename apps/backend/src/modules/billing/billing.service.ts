import prisma from '../../prisma/client';
import { ConflictError, ValidationError } from '../../errors/index';
import BaseService from '../../services/base';

export class BillingService extends BaseService {
  // --- GST calculations & Bill generation ---
  public async generateBill(data: any, actingUserId: string, tenantId: string): Promise<any> {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { items: true },
    });

    if (!order) {
      throw new ValidationError('Associated order not found.');
    }

    const subTotal = order.totalAmount;
    const discountAmount = data.discountAmount || 0;
    const serviceCharge = data.serviceCharge || 0;
    const tipsAmount = data.tipsAmount || 0;

    // Calculate Indian GST (CGST 2.5%, SGST 2.5% for standard restaurants)
    const taxableAmount = subTotal - discountAmount;
    const cgst = parseFloat((taxableAmount * 0.025).toFixed(2));
    const sgst = parseFloat((taxableAmount * 0.025).toFixed(2));
    const taxAmount = cgst + sgst;

    const grandTotal = taxableAmount + taxAmount + serviceCharge + tipsAmount;
    const billNumber = `INV-${Date.now().toString().slice(-6)}`;

    const bill = await prisma.$transaction(async (tx) => {
      // 1. Create Invoice record
      const b = await tx.bill.create({
        data: {
          orderId: data.orderId,
          branchId: data.branchId,
          billNumber,
          subTotal,
          discountAmount,
          taxAmount,
          serviceCharge,
          tipsAmount,
          grandTotal,
          type: data.type,
          status: 'UNPAID',
          createdBy: actingUserId,
        },
      });

      // 2. Create GST split details
      await tx.billTaxDetail.create({
        data: { billId: b.id, taxName: 'CGST', rate: 2.5, amount: cgst },
      });
      await tx.billTaxDetail.create({
        data: { billId: b.id, taxName: 'SGST', rate: 2.5, amount: sgst },
      });

      // 3. Update associated order status
      await tx.order.update({
        where: { id: data.orderId },
        data: { status: 'COMPLETED' },
      });

      return b;
    });

    await this.logAudit(tenantId, actingUserId, 'BILL_GENERATE', 'bills', bill.id, null, bill);
    return bill;
  }

  public async getBillById(billId: string): Promise<any | null> {
    return prisma.bill.findUnique({
      where: { id: billId },
      include: {
        taxDetails: true,
        payments: true,
        refunds: true,
      },
    });
  }

  // --- Payment processing & drawer settlements ---
  public async processPayment(billId: string, data: any, actingUserId: string, tenantId: string): Promise<any> {
    const bill = await prisma.bill.findUnique({ where: { id: billId } });
    if (!bill) throw new ValidationError('Bill invoice not found');

    const payment = await prisma.$transaction(async (tx) => {
      // 1. Record payment transaction
      const p = await tx.payment.create({
        data: {
          billId,
          method: data.method,
          amount: data.amount,
          referenceNumber: data.referenceNumber,
          transactionId: data.transactionId,
          status: 'SUCCESS',
        },
      });

      // 2. Update Bill invoice status
      await tx.bill.update({
        where: { id: billId },
        data: { status: 'PAID' },
      });

      return p;
    });

    await this.logAudit(tenantId, actingUserId, 'PAYMENT_PROCESS', 'payments', payment.id, null, payment);
    return payment;
  }

  // --- Refunds ---
  public async processRefund(billId: string, data: any, actingUserId: string, tenantId: string): Promise<any> {
    const bill = await prisma.bill.findUnique({ where: { id: billId } });
    if (!bill) throw new ValidationError('Bill invoice not found');

    const refund = await prisma.$transaction(async (tx) => {
      const r = await tx.refund.create({
        data: {
          billId,
          amount: data.amount,
          reason: data.reason,
          approvedBy: actingUserId,
        },
      });

      await tx.bill.update({
        where: { id: billId },
        data: { status: 'REFUNDED' },
      });

      return r;
    });

    await this.logAudit(tenantId, actingUserId, 'REFUND_PROCESS', 'refunds', refund.id, null, refund);
    return refund;
  }

  // --- Cash Drawer Log entries ---
  public async addDrawerLog(data: any, actingUserId: string, tenantId: string): Promise<any> {
    const log = await prisma.cashDrawerLog.create({
      data: {
        shiftId: data.shiftId,
        action: data.action,
        amount: data.amount,
        notes: data.notes,
        createdBy: actingUserId,
      },
    });

    await this.logAudit(tenantId, actingUserId, 'DRAWER_ADJUST', 'cash_drawer_logs', log.id, null, log);
    return log;
  }

  private async logAudit(
    tenantId: string,
    userId: string,
    action: string,
    tableName: string,
    recordId: string,
    oldValues: any,
    newValues: any
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          tenantId,
          userId,
          action,
          tableName,
          recordId,
          oldValues: oldValues ? JSON.stringify(oldValues) : undefined,
          newValues: newValues ? JSON.stringify(newValues) : undefined,
        },
      });
    } catch (err: any) {
      this.logError('Audit logger failure inside billing service:', err);
    }
  }
}

export const billingService = new BillingService();
export default billingService;
