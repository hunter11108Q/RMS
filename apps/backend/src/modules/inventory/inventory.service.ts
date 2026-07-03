import prisma from '../../prisma/client';
import { ConflictError, ValidationError } from '../../errors/index';
import BaseService from '../../services/base';

export class InventoryService extends BaseService {
  // --- Suppliers CRUD ---
  public async createSupplier(data: any, actingUserId: string, tenantId: string): Promise<any> {
    const existing = await prisma.supplier.findFirst({
      where: { branchId: data.branchId, code: data.code },
    });
    if (existing) throw new ConflictError('Supplier with this code already exists in this branch');

    const supplier = await prisma.supplier.create({
      data: {
        branchId: data.branchId,
        name: data.name,
        code: data.code,
        contactPerson: data.contactPerson,
        phone: data.phone,
        email: data.email,
        gstNumber: data.gstNumber,
        address: data.address,
        creditLimit: data.creditLimit || 0,
      },
    });

    await this.logAudit(tenantId, actingUserId, 'SUPPLIER_CREATE', 'suppliers', supplier.id, null, supplier);
    return supplier;
  }

  public async getSupplier(id: string): Promise<any | null> {
    return prisma.supplier.findUnique({
      where: { id },
      include: { purchaseOrders: true },
    });
  }

  // --- Purchase Order and Stock Receipts ---
  public async createPO(data: any, actingUserId: string, tenantId: string): Promise<any> {
    let subTotal = 0;
    const itemsData = data.items.map((i: any) => {
      const itemTotal = i.quantity * i.unitPrice;
      subTotal += itemTotal;
      return {
        ingredientId: i.ingredientId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        grandTotal: itemTotal,
      };
    });

    const po = await prisma.$transaction(async (tx) => {
      const p = await tx.purchaseOrder.create({
        data: {
          supplierId: data.supplierId,
          branchId: data.branchId,
          poNumber: data.poNumber,
          status: 'SENT',
          subTotal,
          grandTotal: subTotal,
          createdBy: actingUserId,
          items: {
            create: itemsData,
          },
        },
        include: { items: true },
      });

      // Update ingredient stock levels and average cost (weighted average valuation)
      for (const item of p.items) {
        const ingredient = await tx.ingredient.findUnique({ where: { id: item.ingredientId } });
        if (ingredient) {
          const totalStock = ingredient.currentStock + item.quantity;
          const totalCost = (ingredient.currentStock * ingredient.averageCost) + (item.quantity * item.unitPrice);
          const newAvgCost = totalStock > 0 ? parseFloat((totalCost / totalStock).toFixed(2)) : item.unitPrice;

          await tx.ingredient.update({
            where: { id: item.ingredientId },
            data: {
              currentStock: totalStock,
              averageCost: newAvgCost,
            },
          });

          // Create stock movement log
          await tx.stockMovement.create({
            data: {
              ingredientId: item.ingredientId,
              branchId: data.branchId,
              type: 'PURCHASE',
              quantity: item.quantity,
              referenceId: p.id,
              createdBy: actingUserId,
            },
          });
        }
      }

      return p;
    });

    await this.logAudit(tenantId, actingUserId, 'PO_CREATE', 'purchase_orders', po.id, null, po);
    return po;
  }

  // --- Recipe Costing Margins calculations ---
  public async getRecipeCosting(menuItemId: string): Promise<any> {
    const recipes = await prisma.recipe.findMany({
      where: { menuItemId },
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
    });

    if (recipes.length === 0) return { menuItemId, totalCost: 0, ingredientsCount: 0 };

    const recipe = recipes[0];
    let totalCost = 0;

    const costingLines = recipe.ingredients.map((line) => {
      // averageCost per standard unit
      const unitCost = line.ingredient.averageCost;
      const wastageMultiplier = 1 + (line.wastePercentage / 100);
      const ingredientCost = line.quantity * unitCost * wastageMultiplier;
      totalCost += ingredientCost;

      return {
        ingredientName: line.ingredient.name,
        quantity: line.quantity,
        unit: line.unit,
        unitCost,
        wastagePercent: line.wastePercentage,
        lineCost: parseFloat(ingredientCost.toFixed(2)),
      };
    });

    return {
      menuItemId,
      recipeId: recipe.id,
      totalCost: parseFloat(totalCost.toFixed(2)),
      costingLines,
    };
  }

  // --- Automatic Recipe Stock Deduction when order settles ---
  public async deductRecipeStock(orderId: string, branchId: string, actingUserId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) return;

    for (const item of order.items) {
      // Find recipe for this menu item
      const recipes = await prisma.recipe.findMany({
        where: { menuItemId: item.menuItemId },
        include: { ingredients: true },
      });

      if (recipes.length > 0) {
        const recipe = recipes[0];
        for (const line of recipe.ingredients) {
          const qtyToDeduct = line.quantity * item.quantity;

          await prisma.$transaction(async (tx) => {
            const ingredient = await tx.ingredient.findUnique({ where: { id: line.ingredientId } });
            if (ingredient) {
              await tx.ingredient.update({
                where: { id: line.ingredientId },
                data: {
                  currentStock: Math.max(0, ingredient.currentStock - qtyToDeduct),
                },
              });

              // Create stock movement log
              await tx.stockMovement.create({
                data: {
                  ingredientId: line.ingredientId,
                  branchId,
                  type: 'SALE',
                  quantity: -qtyToDeduct,
                  referenceId: orderId,
                  createdBy: actingUserId,
                },
              });
            }
          });
        }
      }
    }
  }

  // --- Wastage Entries ---
  public async createWastage(data: any, actingUserId: string, tenantId: string): Promise<any> {
    const wastage = await prisma.$transaction(async (tx) => {
      const w = await tx.wastageEntry.create({
        data: {
          branchId: data.branchId,
          ingredientId: data.ingredientId,
          quantity: data.quantity,
          reason: data.reason,
          status: 'APPROVED',
          approvedBy: actingUserId,
        },
      });

      const ingredient = await tx.ingredient.findUnique({ where: { id: data.ingredientId } });
      if (ingredient) {
        await tx.ingredient.update({
          where: { id: data.ingredientId },
          data: {
            currentStock: Math.max(0, ingredient.currentStock - data.quantity),
          },
        });

        // Create stock movement log
        await tx.stockMovement.create({
          data: {
            ingredientId: data.ingredientId,
            branchId: data.branchId,
            type: 'WASTAGE',
            quantity: -data.quantity,
            referenceId: w.id,
            createdBy: actingUserId,
          },
        });
      }

      return w;
    });

    await this.logAudit(tenantId, actingUserId, 'WASTAGE_CREATE', 'wastage_entries', wastage.id, null, wastage);
    return wastage;
  }

  // --- Stock transfer between outlets ---
  public async createTransfer(data: any, actingUserId: string, tenantId: string): Promise<any> {
    const transfer = await prisma.stockTransfer.create({
      data: {
        fromBranchId: data.fromBranchId,
        toBranchId: data.toBranchId,
        status: 'REQUESTED',
        notes: data.notes,
        requestedBy: actingUserId,
        items: {
          create: data.items.map((i: any) => ({
            ingredientId: i.ingredientId,
            quantity: i.quantity,
          })),
        },
      },
      include: { items: true },
    });

    await this.logAudit(tenantId, actingUserId, 'TRANSFER_CREATE', 'stock_transfers', transfer.id, null, transfer);
    return transfer;
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
      this.logError('Audit logger failure inside inventory service:', err);
    }
  }
}

export const inventoryService = new InventoryService();
export default inventoryService;
