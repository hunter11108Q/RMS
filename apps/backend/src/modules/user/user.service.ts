import bcrypt from 'bcryptjs';
import prisma from '../../prisma/client';
import { ValidationError, ConflictError } from '../../errors/index';
import config from '../../config/index';
import BaseService from '../../services/base';

export class UserService extends BaseService {
  public async create(data: any, actingUserId: string, tenantId: string): Promise<any> {
    const existing = await prisma.user.findFirst({
      where: { tenantId, username: data.username },
    });

    if (existing) {
      throw new ConflictError('Username already exists in this tenant organization.');
    }

    const passwordHash = await bcrypt.hash(data.password, config.security.bcryptRounds);
    const pinHash = data.pin ? await bcrypt.hash(data.pin, config.security.bcryptRounds) : undefined;

    const user = await prisma.user.create({
      data: {
        tenantId,
        username: data.username,
        passwordHash,
        email: data.email,
        phone: data.phone,
        pinHash,
        roleId: data.roleId,
        employeeId: data.employeeId,
        designation: data.designation,
        department: data.department,
        branches: {
          create: data.branchIds.map((branchId: string) => ({
            branchId,
          })),
        },
      },
      include: {
        role: true,
        branches: true,
      },
    });

    // Write audit log
    await this.logAudit(tenantId, actingUserId, 'USER_CREATE', 'users', user.id, null, {
      id: user.id,
      username: user.username,
      roleId: user.roleId,
    });

    return user;
  }

  public async getById(id: string, tenantId: string): Promise<any> {
    return prisma.user.findFirst({
      where: { id, tenantId },
      include: {
        role: true,
        branches: {
          include: {
            branch: true,
          },
        },
      },
    });
  }

  public async list(tenantId: string, filters: any = {}): Promise<any[]> {
    return prisma.user.findMany({
      where: {
        tenantId,
        status: filters.status || { not: 'ARCHIVED' },
      },
      include: {
        role: true,
        branches: {
          include: {
            branch: true,
          },
        },
      },
    });
  }

  public async update(id: string, data: any, actingUserId: string, tenantId: string): Promise<any> {
    const updateData: any = { ...data };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, config.security.bcryptRounds);
      delete updateData.password;
    }

    if (data.pin) {
      updateData.pinHash = await bcrypt.hash(data.pin, config.security.bcryptRounds);
      delete updateData.pin;
    }

    if (data.branchIds) {
      // Re-assign branches
      await prisma.userBranch.deleteMany({ where: { userId: id } });
      updateData.branches = {
        create: data.branchIds.map((branchId: string) => ({
          branchId,
        })),
      };
      delete updateData.branchIds;
    }

    const original = await prisma.user.findUnique({ where: { id } });

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true, branches: true },
    });

    await this.logAudit(tenantId, actingUserId, 'USER_UPDATE', 'users', id, original, {
      id,
      status: user.status,
      roleId: user.roleId,
    });

    return user;
  }

  public async delete(id: string, actingUserId: string, tenantId: string): Promise<void> {
    // Soft delete/Archive compliance
    await prisma.user.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    await this.logAudit(tenantId, actingUserId, 'USER_DELETE', 'users', id, { status: 'ACTIVE' }, { status: 'ARCHIVED' });
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
      this.logError('Audit logger failure inside user service:', err);
    }
  }
}

export const userService = new UserService();
export default userService;
