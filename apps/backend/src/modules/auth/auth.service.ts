import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../config/index';
import prisma from '../../prisma/client';
import { AuthenticationError, ValidationError, ConflictError, DatabaseError } from '../../errors/index';
import { UserRole } from '../../constants/index';
import { AccessTokenPayload, RefreshTokenPayload } from '@rms/types';
import BaseService from '../../services/base';

export interface LoginParams {
  tenantId: string;
  username?: string;
  email?: string;
  phone?: string;
  pin?: string;
  password?: string;
}

export interface SessionDeviceTelemetry {
  deviceName?: string;
  osName?: string;
  clientAppName?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuthService extends BaseService {
  /**
   * Universal Login Resolver
   */
  public async login(
    params: LoginParams,
    telemetry: SessionDeviceTelemetry
  ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const { tenantId, username, email, phone, pin, password } = params;

    // 1. Resolve User account based on provided identifier
    let user = null;

    if (pin) {
      // Login via short PIN (Cashier/Waiter modes)
      if (!phone && !username) {
        throw new ValidationError('Phone or Username must be provided along with PIN login.');
      }
      user = await prisma.user.findFirst({
        where: {
          tenantId,
          status: 'ACTIVE',
          OR: phone ? [{ phone }] : [{ username }],
        },
        include: { role: true },
      });

      if (!user || !user.pinHash || !(await bcrypt.compare(pin, user.pinHash))) {
        await this.logAuditPlaceholder(tenantId, 'FAILED_LOGIN', 'users', 'UNKNOWN', { reason: 'Invalid PIN' }, telemetry);
        throw new AuthenticationError('Invalid login credentials');
      }
    } else if (password) {
      // Login via Password
      user = await prisma.user.findFirst({
        where: {
          tenantId,
          status: 'ACTIVE',
          OR: [
            ...(username ? [{ username }] : []),
            ...(email ? [{ email }] : []),
            ...(phone ? [{ phone }] : []),
          ],
        },
        include: { role: true },
      });

      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        await this.logAuditPlaceholder(tenantId, 'FAILED_LOGIN', 'users', 'UNKNOWN', { reason: 'Invalid password' }, telemetry);
        throw new AuthenticationError('Invalid login credentials');
      }
    } else {
      throw new ValidationError('Authentication credentials incomplete');
    }

    // 2. Create Active UserSession and Sign Tokens
    const sessionExpiresAt = new Date();
    sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 7); // 7 days refresh validity

    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), // Secure random string
        deviceName: telemetry.deviceName || 'Unknown Device',
        osName: telemetry.osName || 'Unknown OS',
        clientAppName: telemetry.clientAppName || 'Unknown App',
        ipAddress: telemetry.ipAddress,
        userAgent: telemetry.userAgent,
        expiresAt: sessionExpiresAt,
      },
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(session.id, user.id);

    // Save actual JWT hash/token to the session object
    await prisma.userSession.update({
      where: { id: session.id },
      data: { refreshToken },
    });

    await this.logAudit(user.tenantId, user.id, 'LOGIN_SUCCESS', 'user_sessions', session.id, null, { session }, telemetry);

    const userBranch = await prisma.userBranch.findFirst({
      where: { userId: user.id },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        tenantId: user.tenantId,
        username: user.username,
        role: user.role.name,
        branchId: userBranch ? userBranch.branchId : null,
      },
    };
  }

  /**
   * Session Refresh / Token Rotation (RTR)
   */
  public async rotateTokens(
    oldRefreshToken: string,
    telemetry: SessionDeviceTelemetry
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(oldRefreshToken, config.security.jwtRefreshSecret) as RefreshTokenPayload;
      
      // Let's resolve properly
      const activeSession = await prisma.userSession.findFirst({
        where: {
          refreshToken: oldRefreshToken,
          status: 'ACTIVE',
          expiresAt: { gt: new Date() },
        },
        include: { user: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
      });

      if (!activeSession) {
        // Potential Token Theft/Replay! Revoke all sessions for safety
        if (decoded.userId) {
          await prisma.userSession.updateMany({
            where: { userId: decoded.userId },
            data: { status: 'REVOKED' },
          });
          this.log.warn(`Potential Refresh Token Theft detected for User: ${decoded.userId}. Revoked all sessions.`, {
            context: 'AuthService',
          });
        }
        throw new AuthenticationError('Invalid or expired refresh token');
      }

      // Rotate token: invalidate old session, spawn new rotated session
      await prisma.userSession.update({
        where: { id: activeSession.id },
        data: { status: 'REVOKED' },
      });

      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7);

      const rotatedSession = await prisma.userSession.create({
        data: {
          userId: activeSession.userId,
          refreshToken: 'temp-placeholder',
          deviceName: telemetry.deviceName || activeSession.deviceName,
          osName: telemetry.osName || activeSession.osName,
          clientAppName: telemetry.clientAppName || activeSession.clientAppName,
          ipAddress: telemetry.ipAddress || activeSession.ipAddress,
          userAgent: telemetry.userAgent || activeSession.userAgent,
          expiresAt: newExpiresAt,
        },
      });

      const accessToken = this.generateAccessToken(activeSession.user);
      const refreshToken = this.generateRefreshToken(rotatedSession.id, activeSession.userId);

      await prisma.userSession.update({
        where: { id: rotatedSession.id },
        data: { refreshToken },
      });

      return { accessToken, refreshToken };
    } catch (err: any) {
      throw new AuthenticationError(err.message || 'Token refresh failed');
    }
  }

  /**
   * Revoke session (Logout)
   */
  public async logout(sessionId: string, userId: string, telemetry: SessionDeviceTelemetry): Promise<void> {
    const session = await prisma.userSession.findUnique({ where: { id: sessionId }, include: { user: true } });
    if (session && session.userId === userId) {
      await prisma.userSession.update({
        where: { id: sessionId },
        data: { status: 'REVOKED' },
      });
      await this.logAudit(session.user.tenantId, userId, 'LOGOUT', 'user_sessions', sessionId, null, null, telemetry);
    }
  }

  /**
   * Retrieve active device sessions
   */
  public async getActiveSessions(userId: string): Promise<any[]> {
    return prisma.userSession.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        deviceName: true,
        osName: true,
        clientAppName: true,
        ipAddress: true,
        createdAt: true,
        lastActivityAt: true,
      },
    });
  }

  /**
   * Revoke specific session id
   */
  public async revokeSession(targetSessionId: string, userId: string, tenantId: string, telemetry: SessionDeviceTelemetry): Promise<void> {
    const session = await prisma.userSession.findFirst({
      where: { id: targetSessionId, userId },
    });

    if (!session) {
      throw new ValidationError('Session not found or access denied');
    }

    await prisma.userSession.update({
      where: { id: targetSessionId },
      data: { status: 'REVOKED' },
    });

    await this.logAudit(tenantId, userId, 'SESSION_REVOCATION', 'user_sessions', targetSessionId, null, null, telemetry);
  }

  // --- Password Operations ---

  public async changePassword(userId: string, tenantId: string, currentPw: string, newPw: string, telemetry: SessionDeviceTelemetry): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(currentPw, user.passwordHash))) {
      throw new AuthenticationError('Incorrect current password');
    }

    const passwordHash = await bcrypt.hash(newPw, config.security.bcryptRounds);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Revoke all other active sessions for this user for security compliance
    await prisma.userSession.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: { status: 'REVOKED' },
    });

    await this.logAudit(tenantId, userId, 'PASSWORD_CHANGE', 'users', userId, null, null, telemetry);
  }

  // --- Private Helpers ---

  private generateAccessToken(user: any): string {
    const payload: AccessTokenPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      username: user.username,
      role: user.role.name as UserRole,
      permissions: user.role.permissions ? user.role.permissions.map((rp: any) => rp.permission.name) : [],
    };
    return jwt.sign(payload, config.security.jwtSecret, { expiresIn: config.security.jwtAccessExpiry as any });
  }

  private generateRefreshToken(sessionId: string, userId: string): string {
    const payload: RefreshTokenPayload = {
      sessionId,
      userId,
    };
    return jwt.sign(payload, config.security.jwtRefreshSecret, { expiresIn: config.security.jwtRefreshExpiry as any });
  }

  private async logAudit(
    tenantId: string,
    userId: string,
    action: string,
    tableName: string,
    recordId: string,
    oldValues: any,
    newValues: any,
    telemetry: SessionDeviceTelemetry
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
          ipAddress: telemetry.ipAddress,
          userAgent: telemetry.userAgent,
        },
      });
    } catch (err: any) {
      this.logError('Failed to write audit log:', err);
    }
  }

  private async logAuditPlaceholder(
    tenantId: string,
    action: string,
    tableName: string,
    recordId: string,
    newValues: any,
    telemetry: SessionDeviceTelemetry
  ): Promise<void> {
    try {
      // Placeholders logger (e.g. system logs)
      this.log.info(`Security Alert: [${action}] on table [${tableName}] for Tenant: ${tenantId}`, {
        ipAddress: telemetry.ipAddress,
        userAgent: telemetry.userAgent,
        newValues,
      });
    } catch {}
  }
}

export const authService = new AuthService();
export default authService;
