import { Request, Response, NextFunction } from 'express';
import { AuthenticationError, AuthorizationError } from '../errors/index';
import { UserRole } from '../constants/index';
import { UserContext } from '@rms/types';

// Express Request context expansion
declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
    }
  }
}

/**
 * Placeholder JWT Authentication Middleware
 */
export function requireAuthPlaceholder(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthenticationError('Bearer authorization token is missing'));
  }

  // PLACEHOLDER: Decodes JWT payload in future prompts
  // Inject mock operator user context for scaffolding compilation checks
  req.user = {
    id: '00000000-0000-0000-0000-000000000000',
    tenantId: 't1',
    username: 'admin_scaffold',
    role: UserRole.OWNER,
    permissions: ['*'],
  };

  next();
}

/**
 * Placeholder Role authorization checks
 */
export function requireRolesPlaceholder(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AuthorizationError(`Access restricted to roles: [${allowedRoles.join(', ')}]`));
    }

    next();
  };
}
