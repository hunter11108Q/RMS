import { Request, Response, NextFunction } from 'express';
import authService, { SessionDeviceTelemetry } from './auth.service';
import { HTTP_STATUS } from '../../constants/index';
import { BaseController } from '../../controllers/base';

export class AuthController extends BaseController {
  /**
   * Helper to parse client platform headers
   */
  private getTelemetry(req: Request): SessionDeviceTelemetry {
    return {
      deviceName: (req.headers['x-device-name'] as string) || 'Browser/Unknown',
      osName: (req.headers['x-os-name'] as string) || 'Unknown OS',
      clientAppName: (req.headers['x-client-app-name'] as string) || 'Web/Desktop',
      ipAddress: req.ip || req.socket.remoteAddress || undefined,
      userAgent: req.get('User-Agent'),
    };
  }

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const telemetry = this.getTelemetry(req);
      const result = await authService.login(req.body, telemetry);
      this.sendSuccess(res, result, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public rotate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const telemetry = this.getTelemetry(req);
      const { refreshToken } = req.body;
      const result = await authService.rotateTokens(refreshToken, telemetry);
      this.sendSuccess(res, result, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const telemetry = this.getTelemetry(req);
      if (req.sessionId && req.user) {
        await authService.logout(req.sessionId, req.user.id, telemetry);
      }
      this.sendSuccess(res, { success: true }, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public currentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.sendSuccess(res, { user: req.user }, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public getSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing context');
      const sessions = await authService.getActiveSessions(req.user.id);
      this.sendSuccess(res, sessions, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public revokeSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const telemetry = this.getTelemetry(req);
      const { sessionId } = req.body;
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing context');
      await authService.revokeSession(sessionId, req.user.id, req.user.tenantId, telemetry);
      this.sendSuccess(res, { revoked: true }, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const telemetry = this.getTelemetry(req);
      const { currentPassword, newPassword } = req.body;
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Missing context');
      await authService.changePassword(req.user.id, req.user.tenantId, currentPassword, newPassword, telemetry);
      this.sendSuccess(res, { success: true }, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // OTP/Reset stubs
  public requestReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.sendSuccess(res, { message: 'Reset token dispatched to registered email placeholder' }, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public confirmReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.sendSuccess(res, { success: true, message: 'Password reset confirmed' }, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };
}

export const authController = new AuthController();
export default authController;
