import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/index';
import { AuthenticationError, AuthorizationError } from '../errors/index';
import { UserRole } from '../constants/index';
import { UserContext, AccessTokenPayload } from '@rms/types';
import prisma from '../prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
      sessionId?: string;
    }
  }
}

/**
 * Concrete Authentication Middleware
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Bearer authorization token is missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    let payload: AccessTokenPayload;

    try {
      payload = jwt.verify(token, config.security.jwtSecret) as AccessTokenPayload;
    } catch (err: any) {
      throw new AuthenticationError('JWT token has expired or is invalid');
    }

    // Retrieve active session from database to support instant session revocation
    const session = await prisma.userSession.findFirst({
      where: {
        userId: payload.userId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session || session.user.status !== 'ACTIVE') {
      throw new AuthenticationError('User session has been revoked or account is inactive');
    }

    // Map DB permissions structure into flat string array
    const permissions = session.user.role.permissions.map((rp: any) => rp.permission.name);

    req.user = {
      id: session.user.id,
      tenantId: session.user.tenantId,
      username: session.user.username,
      role: session.user.role.name as UserRole,
      permissions,
    };
    req.sessionId = session.id;

    // Async update last activity timestamp (non-blocking)
    prisma.userSession.update({
      where: { id: session.id },
      data: { lastActivityAt: new Date() },
    }).catch((err: any) => {});

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Permission-based Authorization Middleware
 */
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    const hasPermission = req.user.permissions.includes(permission) || req.user.permissions.includes('*');
    if (!hasPermission) {
      return next(new AuthorizationError(`Access denied. Missing permission: ${permission}`));
    }

    next();
  };
}

/**
 * Role-based Authorization Middleware
 */
export function requireRoles(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AuthorizationError(`Access denied. Restricted to roles: [${allowedRoles.join(', ')}]`));
    }

    next();
  };
}
