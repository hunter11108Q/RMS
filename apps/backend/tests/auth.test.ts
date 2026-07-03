import { requireAuth, requirePermission, requireRoles } from '../src/middleware/auth';
import { UserRole } from '../src/constants/index';
import { Request, Response, NextFunction } from 'express';

describe('Authentication & Authorization Suite', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('requireRoles Middleware', () => {
    it('should pass if user role is within allowed roles list', () => {
      mockRequest.user = {
        id: '1',
        tenantId: 't1',
        username: 'cashier1',
        role: UserRole.CASHIER,
        permissions: ['order:create'],
      };

      const middleware = requireRoles([UserRole.OWNER, UserRole.CASHIER]);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(nextFunction).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should throw AuthorizationError if user role is not within allowed list', () => {
      mockRequest.user = {
        id: '1',
        tenantId: 't1',
        username: 'waiter1',
        role: UserRole.WAITER,
        permissions: ['order:create'],
      };

      const middleware = requireRoles([UserRole.OWNER, UserRole.CASHIER]);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 403,
        errorCode: 'FORBIDDEN',
      }));
    });
  });

  describe('requirePermission Middleware', () => {
    it('should pass if user has specific permission scope', () => {
      mockRequest.user = {
        id: '1',
        tenantId: 't1',
        username: 'manager1',
        role: UserRole.MANAGER,
        permissions: ['billing:refund'],
      };

      const middleware = requirePermission('billing:refund');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should pass if user has wildcard scope (*)', () => {
      mockRequest.user = {
        id: '1',
        tenantId: 't1',
        username: 'owner1',
        role: UserRole.OWNER,
        permissions: ['*'],
      };

      const middleware = requirePermission('inventory:adjust');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should throw AuthorizationError if user lacks specific permission', () => {
      mockRequest.user = {
        id: '1',
        tenantId: 't1',
        username: 'cashier1',
        role: UserRole.CASHIER,
        permissions: ['billing:create'],
      };

      const middleware = requirePermission('billing:refund');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 403,
      }));
    });
  });
});
