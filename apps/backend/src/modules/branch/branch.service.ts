import prisma from '../../prisma/client';
import { ConflictError, ValidationError } from '../../errors/index';
import BaseService from '../../services/base';

export class BranchService extends BaseService {
  // --- Branch operations ---
  public async create(data: any, actingUserId: string, tenantId: string): Promise<any> {
    const existing = await prisma.branch.findFirst({
      where: { tenantId, code: data.code },
    });

    if (existing) {
      throw new ConflictError('Branch code already exists in this organization.');
    }

    const branch = await prisma.$transaction(async (tx) => {
      const b = await tx.branch.create({
        data: {
          tenantId,
          name: data.name,
          code: data.code,
          phone: data.phone,
          email: data.email,
          address: data.address,
          workingHours: data.workingHours,
        },
      });

      // Spawn default number sequences for this branch automatically
      const defaultEntities = ['BILL', 'ORDER', 'KOT', 'EXPENSE'];
      for (const entity of defaultEntities) {
        await tx.numberSeries.create({
          data: {
            branchId: b.id,
            entityType: entity,
            prefix: `${data.code}-${entity}-`,
            digits: 6,
            nextNumber: 1,
          },
        });
      }

      return b;
    });

    await this.logAudit(tenantId, actingUserId, 'BRANCH_CREATE', 'branches', branch.id, null, branch);

    return branch;
  }

  public async getById(id: string, tenantId: string): Promise<any | null> {
    return prisma.branch.findFirst({
      where: { id, tenantId },
      include: {
        floors: true,
        taxes: true,
        printers: true,
        series: true,
      },
    });
  }

  public async list(tenantId: string): Promise<any[]> {
    return prisma.branch.findMany({
      where: { tenantId },
    });
  }

  public async update(id: string, data: any, actingUserId: string, tenantId: string): Promise<any> {
    const original = await prisma.branch.findFirst({ where: { id, tenantId } });
    if (!original) throw new ValidationError('Branch not found');

    const branch = await prisma.branch.update({
      where: { id },
      data,
    });

    await this.logAudit(tenantId, actingUserId, 'BRANCH_UPDATE', 'branches', id, original, branch);
    return branch;
  }

  // --- Sub-Entities CRUD (Floor, Tax, Printer) ---
  public async addFloor(branchId: string, data: any): Promise<any> {
    return prisma.floor.create({
      data: {
        branchId,
        name: data.name,
        sortOrder: data.sortOrder || 0,
      },
    });
  }

  public async addTax(branchId: string, data: any): Promise<any> {
    return prisma.taxConfig.create({
      data: {
        branchId,
        name: data.name,
        rate: data.rate,
        type: data.type,
        isCompound: data.isCompound || false,
      },
    });
  }

  public async addPrinter(branchId: string, data: any): Promise<any> {
    return prisma.printerConfig.create({
      data: {
        branchId,
        name: data.name,
        type: data.type,
        paperSize: data.paperSize || '80mm',
        connectionType: data.connectionType,
        ipAddress: data.ipAddress,
        portNumber: data.portNumber,
      },
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
      this.logError('Audit logger failure inside branch service:', err);
    }
  }
}

export const branchService = new BranchService();
export default branchService;
