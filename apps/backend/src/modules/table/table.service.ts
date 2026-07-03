import prisma from '../../prisma/client';
import { ConflictError, ValidationError } from '../../errors/index';
import BaseService from '../../services/base';

export class TableService extends BaseService {
  // --- Table CRUD ---
  public async createTable(data: any, actingUserId: string, tenantId: string): Promise<any> {
    const existing = await prisma.restaurantTable.findFirst({
      where: { branchId: data.branchId, number: data.number },
    });

    if (existing) {
      throw new ConflictError('Table number already registered in this branch layout.');
    }

    const table = await prisma.restaurantTable.create({
      data: {
        floorId: data.floorId,
        branchId: data.branchId,
        number: data.number,
        name: data.name,
        capacity: data.capacity,
        minCapacity: data.minCapacity || 1,
        maxCapacity: data.maxCapacity,
        type: data.type,
        posX: data.posX || 0,
        posY: data.posY || 0,
        width: data.width || 80,
        height: data.height || 80,
        rotate: data.rotate || 0,
      },
    });

    await this.logAudit(tenantId, actingUserId, 'TABLE_CREATE', 'restaurant_tables', table.id, null, table);
    return table;
  }

  public async listTables(branchId: string, floorId?: string): Promise<any[]> {
    return prisma.restaurantTable.findMany({
      where: {
        branchId,
        isActive: true,
        ...(floorId ? { floorId } : {}),
      },
      include: {
        floor: true,
      },
    });
  }

  public async updatePosition(tableId: string, data: any): Promise<any> {
    return prisma.restaurantTable.update({
      where: { id: tableId },
      data: {
        posX: data.posX,
        posY: data.posY,
        width: data.width,
        height: data.height,
        rotate: data.rotate,
      },
    });
  }

  // --- Table Seating Statuses & Merges ---
  public async updateStatus(tableId: string, status: string): Promise<any> {
    return prisma.restaurantTable.update({
      where: { id: tableId },
      data: { status },
    });
  }

  public async mergeTables(tableIds: string[], parentMergeId: string): Promise<void> {
    await prisma.restaurantTable.updateMany({
      where: { id: { in: tableIds } },
      data: { parentMergeId },
    });
  }

  public async splitTables(parentMergeId: string): Promise<void> {
    await prisma.restaurantTable.updateMany({
      where: { parentMergeId },
      data: { parentMergeId: null },
    });
  }

  // --- Reservation CRUD ---
  public async createReservation(data: any, tenantId: string): Promise<any> {
    const reservationDate = new Date(data.reservationDate);
    const reservation = await prisma.reservation.create({
      data: {
        branchId: data.branchId,
        tableId: data.tableId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        reservationDate,
        startTime: data.startTime,
        guestsCount: data.guestsCount,
        specialRequests: data.specialRequests,
        depositAmount: data.depositAmount || 0,
        source: data.source || 'WALK_IN',
      },
    });

    if (data.tableId) {
      await this.updateStatus(data.tableId, 'RESERVED');
    }

    return reservation;
  }

  public async listReservations(branchId: string): Promise<any[]> {
    return prisma.reservation.findMany({
      where: { branchId },
      include: { table: true },
      orderBy: { reservationDate: 'asc' },
    });
  }

  // --- Waitlist Operations ---
  public async addWaitlist(data: any): Promise<any> {
    return prisma.waitlistEntry.create({
      data: {
        branchId: data.branchId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        guestsCount: data.guestsCount,
        estimatedWaitMinutes: data.estimatedWaitMinutes || 15,
      },
    });
  }

  public async listWaitlist(branchId: string): Promise<any[]> {
    return prisma.waitlistEntry.findMany({
      where: { branchId, status: 'WAITING' },
      orderBy: { createdAt: 'asc' },
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
      this.logError('Audit logger failure inside table service:', err);
    }
  }
}

export const tableService = new TableService();
export default tableService;
