import prisma from '../../prisma/client';
import { ConflictError, ValidationError } from '../../errors/index';
import BaseService from '../../services/base';

export class RestaurantService extends BaseService {
  public async createOrUpdate(data: any, actingUserId: string, tenantId: string): Promise<any> {
    const existing = await prisma.restaurant.findUnique({
      where: { tenantId },
    });

    let restaurant;

    if (existing) {
      // Update existing
      restaurant = await prisma.restaurant.update({
        where: { tenantId },
        data,
      });
      await this.logAudit(tenantId, actingUserId, 'RESTAURANT_UPDATE', 'restaurants', restaurant.id, existing, restaurant);
    } else {
      // Create new
      restaurant = await prisma.restaurant.create({
        data: {
          ...data,
          tenantId,
        },
      });
      await this.logAudit(tenantId, actingUserId, 'RESTAURANT_CREATE', 'restaurants', restaurant.id, null, restaurant);
    }

    return restaurant;
  }

  public async getProfile(tenantId: string): Promise<any | null> {
    return prisma.restaurant.findUnique({
      where: { tenantId },
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
      this.logError('Audit logger failure inside restaurant service:', err);
    }
  }
}

export const restaurantService = new RestaurantService();
export default restaurantService;
