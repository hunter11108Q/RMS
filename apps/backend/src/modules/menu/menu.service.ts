import prisma from '../../prisma/client';
import { ConflictError, ValidationError } from '../../errors/index';
import BaseService from '../../services/base';

export class MenuService extends BaseService {
  // --- Category CRUD ---
  public async createCategory(data: any, actingUserId: string, tenantId: string): Promise<any> {
    const existing = await prisma.category.findFirst({
      where: { tenantId, code: data.code },
    });

    if (existing) {
      throw new ConflictError('Category code already exists in this tenant organization.');
    }

    const category = await prisma.category.create({
      data: {
        tenantId,
        name: data.name,
        displayName: data.displayName,
        code: data.code,
        description: data.description,
        displayOrder: data.displayOrder || 0,
        parentId: data.parentId,
        branchIds: data.branchIds,
        kitchenIds: data.kitchenIds,
      },
    });

    await this.logAudit(tenantId, actingUserId, 'CATEGORY_CREATE', 'categories', category.id, null, category);
    return category;
  }

  public async listCategories(tenantId: string): Promise<any[]> {
    return prisma.category.findMany({
      where: { tenantId },
      include: { children: true },
    });
  }

  // --- MenuItem CRUD ---
  public async createItem(data: any, actingUserId: string, tenantId: string): Promise<any> {
    const existing = await prisma.menuItem.findFirst({
      where: { branchId: data.branchId, sku: data.sku },
    });

    if (existing) {
      throw new ConflictError('SKU identifier already exists in this branch catalogue.');
    }

    const item = await prisma.menuItem.create({
      data,
      include: { category: true },
    });

    await this.logAudit(tenantId, actingUserId, 'MENU_ITEM_CREATE', 'menu_items', item.id, null, item);
    return item;
  }

  public async listItems(branchId: string, search?: string): Promise<any[]> {
    return prisma.menuItem.findMany({
      where: {
        branchId,
        isActive: true,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as any } },
                { sku: { contains: search, mode: 'insensitive' as any } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
        variants: true,
        recipes: {
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });
  }

  // --- Variant Operations ---
  public async addVariant(itemId: string, data: any): Promise<any> {
    return prisma.menuItemVariant.create({
      data: {
        menuItemId: itemId,
        name: data.name,
        price: data.price,
        sku: data.sku,
        barcode: data.barcode,
      },
    });
  }

  // --- Modifier Operations ---
  public async createModifierGroup(branchId: string, data: any): Promise<any> {
    return prisma.modifierGroup.create({
      data: {
        branchId,
        name: data.name,
        minSelect: data.minSelect || 0,
        maxSelect: data.maxSelect || 1,
        options: {
          create: data.options.map((opt: any) => ({
            name: opt.name,
            price: opt.price,
            isFree: opt.isFree || false,
            maxQuantity: opt.maxQuantity || 1,
            kitchenInstructions: opt.kitchenInstructions,
          })),
        },
      },
      include: { options: true },
    });
  }

  // --- Recipe Operations ---
  public async createRecipe(data: any): Promise<any> {
    return prisma.recipe.create({
      data: {
        menuItemId: data.menuItemId,
        menuItemVariantId: data.menuItemVariantId,
        instructions: data.instructions,
        ingredients: {
          create: data.ingredients.map((ing: any) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            unit: ing.unit,
            wastePercentage: ing.wastePercentage || 0,
          })),
        },
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
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
      this.logError('Audit logger failure inside menu service:', err);
    }
  }
}

export const menuService = new MenuService();
export default menuService;
