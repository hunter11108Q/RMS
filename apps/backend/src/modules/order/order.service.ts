import prisma from '../../prisma/client';
import { ConflictError, ValidationError } from '../../errors/index';
import BaseService from '../../services/base';

export class OrderService extends BaseService {
  // --- Order CRUD & Draft states ---
  public async createOrder(data: any, actingUserId: string, tenantId: string): Promise<any> {
    const order = await prisma.order.create({
      data: {
        branchId: data.branchId,
        floorId: data.floorId,
        tableId: data.tableId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        guestsCount: data.guestsCount || 1,
        type: data.type,
        priority: data.priority || 'NORMAL',
        notes: data.notes,
        waiterId: actingUserId,
        status: 'DRAFT',
      },
    });

    if (data.tableId) {
      await prisma.restaurantTable.update({
        where: { id: data.tableId },
        data: { status: 'ORDER_IN_PROGRESS' },
      });
    }

    await this.logAudit(tenantId, actingUserId, 'ORDER_CREATE', 'orders', order.id, null, order);
    return order;
  }

  public async getOrderById(orderId: string): Promise<any | null> {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { modifiers: true },
        },
        kots: {
          include: { items: true },
        },
      },
    });
  }

  public async listOrders(branchId: string, status?: string): Promise<any[]> {
    return prisma.order.findMany({
      where: {
        branchId,
        ...(status ? { status } : { status: { not: 'COMPLETED' } }),
      },
      include: {
        items: true,
        kots: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async addOrderItem(orderId: string, data: any): Promise<any> {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new ValidationError('Order not found');

    const item = await prisma.orderItem.create({
      data: {
        orderId,
        menuItemId: data.menuItemId,
        menuItemVariantId: data.menuItemVariantId,
        name: data.name || 'Menu Item',
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        notes: data.notes,
        modifiers: data.modifiers
          ? {
              create: data.modifiers.map((m: any) => ({
                modifierOptionId: m.modifierOptionId,
                name: m.name,
                price: m.price,
                quantity: m.quantity || 1,
              })),
            }
          : undefined,
      },
    });

    // Update totals
    const itemTotal = (data.unitPrice + (data.modifiers ? data.modifiers.reduce((sum: number, m: any) => sum + m.price, 0) : 0)) * data.quantity;
    await prisma.order.update({
      where: { id: orderId },
      data: {
        totalAmount: order.totalAmount + itemTotal,
      },
    });

    return item;
  }

  public async holdOrder(orderId: string): Promise<any> {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'DRAFT',
        heldAt: new Date(),
      },
    });
  }

  // --- KOT Generation & Kitchen Routing ---
  public async generateKOT(orderId: string, branchId: string, waiterId?: string): Promise<any[]> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { where: { status: 'NEW' } } },
    });

    if (!order || order.items.length === 0) {
      throw new ValidationError('No new items found to dispatch to the kitchen.');
    }

    // Group items by category / kitchen config
    // For mock simplicity, we will split into Curry/Tandoor depending on categories, or route all to a single KOT.
    const kitchenConfigId = 'main-kitchen-uuid';
    const kotNumber = `KOT-${Date.now().toString().slice(-6)}`;

    const kot = await prisma.$transaction(async (tx) => {
      // 1. Create KOT record
      const k = await tx.kOT.create({
        data: {
          kotNumber,
          orderId,
          branchId,
          kitchenConfigId,
          status: 'NEW',
          priority: order.priority,
          waiterId: waiterId || order.waiterId,
          guestsCount: order.guestsCount,
        },
      });

      // 2. Create KOTItem records
      for (const item of order.items) {
        await tx.kOTItem.create({
          data: {
            kotId: k.id,
            menuItemId: item.menuItemId,
            menuItemVariantId: item.menuItemVariantId,
            name: item.name,
            quantity: item.quantity,
            notes: item.notes,
          },
        });

        // Update order item status to SENT
        await tx.orderItem.update({
          where: { id: item.id },
          data: { status: 'PREPARING' },
        });
      }

      // Update Order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'KITCHEN' },
      });

      // Add timer log
      await tx.kitchenTimerLog.create({
        data: {
          kotId: k.id,
          action: 'RECEIVED',
        },
      });

      return k;
    });

    return [kot];
  }

  public async updateKOTStatus(kotId: string, status: string): Promise<any> {
    const kot = await prisma.kOT.update({
      where: { id: kotId },
      data: { status },
    });

    await prisma.kitchenTimerLog.create({
      data: {
        kotId,
        action: status,
      },
    });

    return kot;
  }

  public async listKOTs(branchId: string): Promise<any[]> {
    return prisma.kOT.findMany({
      where: { branchId },
      include: {
        items: true,
        timers: true,
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
      this.logError('Audit logger failure inside order service:', err);
    }
  }
}

export const orderService = new OrderService();
export default orderService;
