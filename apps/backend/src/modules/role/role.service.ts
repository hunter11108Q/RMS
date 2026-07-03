import prisma from '../../prisma/client';
import { ConflictError, ValidationError } from '../../errors/index';
import BaseService from '../../services/base';

export class RoleService extends BaseService {
  public async create(data: any, actingUserId: string, tenantId: string): Promise<any> {
    const existing = await prisma.role.findFirst({
      where: { tenantId, name: data.name },
    });

    if (existing) {
      throw new ConflictError('Role name already exists within this tenant organization.');
    }

    const role = await prisma.$transaction(async (tx) => {
      const r = await tx.role.create({
        data: {
          tenantId,
          name: data.name,
          description: data.description,
        },
      });

      // Upsert permissions and link them
      for (const permName of data.permissions) {
        let permission = await tx.permission.findUnique({
          where: { name: permName },
        });

        if (!permission) {
          const mod = permName.split(':')[0] || 'general';
          permission = await tx.permission.create({
            data: {
              name: permName,
              module: mod,
              description: `Generated dynamic permission for module ${mod}`,
            },
          });
        }

        await tx.rolePermission.create({
          data: {
            roleId: r.id,
            permissionId: permission.id,
          },
        });
      }

      return r;
    });

    await this.logAudit(tenantId, actingUserId, 'ROLE_CREATE', 'roles', role.id, null, {
      name: role.name,
      permissions: data.permissions,
    });

    return this.getById(role.id, tenantId);
  }

  public async getById(id: string, tenantId: string): Promise<any> {
    return prisma.role.findFirst({
      where: { id, tenantId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  public async list(tenantId: string): Promise<any[]> {
    return prisma.role.findMany({
      where: { tenantId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  public async update(id: string, data: any, actingUserId: string, tenantId: string): Promise<any> {
    const role = await prisma.$transaction(async (tx) => {
      const r = await tx.role.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
        },
      });

      if (data.permissions) {
        // Clear previous links
        await tx.rolePermission.deleteMany({ where: { roleId: id } });

        // Bind new permissions
        for (const permName of data.permissions) {
          let permission = await tx.permission.findUnique({
            where: { name: permName },
          });

          if (!permission) {
            const mod = permName.split(':')[0] || 'general';
            permission = await tx.permission.create({
              data: {
                name: permName,
                module: mod,
              },
            });
          }

          await tx.rolePermission.create({
            data: {
              roleId: id,
              permissionId: permission.id,
            },
          });
        }
      }

      return r;
    });

    await this.logAudit(tenantId, actingUserId, 'ROLE_UPDATE', 'roles', id, null, {
      name: role.name,
      permissionsCount: data.permissions?.length,
    });

    return this.getById(id, tenantId);
  }

  public async delete(id: string, actingUserId: string, tenantId: string): Promise<void> {
    // Assert no active users map to this role before deleting
    const usersCount = await prisma.user.count({ where: { roleId: id } });
    if (usersCount > 0) {
      throw new ValidationError('Access Denied. Cannot delete role with active bound users.');
    }

    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      await tx.role.delete({ where: { id } });
    });

    await this.logAudit(tenantId, actingUserId, 'ROLE_DELETE', 'roles', id, { id }, null);
  }

  public async clone(id: string, newName: string, actingUserId: string, tenantId: string): Promise<any> {
    const sourceRole = await this.getById(id, tenantId);
    if (!sourceRole) {
      throw new ValidationError('Source role not found');
    }

    const permissions = sourceRole.permissions.map((p: any) => p.permission.name);
    return this.create(
      {
        name: newName,
        description: `Cloned copy of ${sourceRole.name}`,
        permissions,
      },
      actingUserId,
      tenantId
    );
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
      this.logError('Audit logger failure inside role service:', err);
    }
  }
}

export const roleService = new RoleService();
export default roleService;
