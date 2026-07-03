import prisma from '../../prisma/client';
import { ValidationError, ConflictError } from '../../errors/index';
import BaseService from '../../services/base';

export class ShiftService extends BaseService {
  public async open(userId: string, branchId: string, openingCash: number, notes?: string): Promise<any> {
    // Assert no active open shifts for this operator at this branch
    const active = await prisma.userShift.findFirst({
      where: { userId, branchId, status: 'OPEN' },
    });

    if (active) {
      throw new ConflictError('A shift is already active/open for this operator on this branch.');
    }

    const shift = await prisma.userShift.create({
      data: {
        userId,
        branchId,
        openingCash,
        notes,
        status: 'OPEN',
      },
      include: {
        user: true,
        branch: true,
      },
    });

    await this.logAudit(shift.user.tenantId, userId, 'SHIFT_OPEN', 'user_shifts', shift.id, null, {
      openingCash,
      branchId,
    });

    return shift;
  }

  public async close(id: string, userId: string, closingCash: number, notes?: string): Promise<any> {
    const shift = await prisma.userShift.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!shift || shift.userId !== userId) {
      throw new ValidationError('Shift record not found or access restricted.');
    }

    if (shift.status === 'CLOSED') {
      throw new ValidationError('Shift session is already closed.');
    }

    // PLACEHOLDER: Summarize sales metrics from orders database to find expected cash
    // For scaffolding, assume expectedCash matches openingCash plus virtual transactions (e.g. 500)
    const expectedCash = shift.openingCash + 500;
    const cashDifference = closingCash - expectedCash;

    const closedShift = await prisma.userShift.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closingCash,
        expectedCash,
        actualCash: closingCash,
        cashDifference,
        notes: notes || shift.notes,
      },
    });

    await this.logAudit(shift.user.tenantId, userId, 'SHIFT_CLOSE', 'user_shifts', id, null, {
      closingCash,
      expectedCash,
      cashDifference,
    });

    return closedShift;
  }

  public async getActive(userId: string, branchId: string): Promise<any | null> {
    return prisma.userShift.findFirst({
      where: { userId, branchId, status: 'OPEN' },
    });
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
      this.logError('Audit logger failure inside shift service:', err);
    }
  }
}

export const shiftService = new ShiftService();
export default shiftService;
