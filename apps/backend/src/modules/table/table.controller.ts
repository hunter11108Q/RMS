import { Request, Response, NextFunction } from 'express';
import tableService from './table.service';
import { HTTP_STATUS } from '../../constants/index';
import { BaseController } from '../../controllers/base';

export class TableController extends BaseController {
  // --- Table Handlers ---
  public createTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const table = await tableService.createTable(req.body, req.user.id, req.user.tenantId);
      this.sendSuccess(res, table, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  public listTables = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branchId = req.query.branchId as string;
      const floorId = req.query.floorId as string;
      if (!branchId) return this.throwError(HTTP_STATUS.BAD_REQUEST, 'VALIDATION_FAILED', 'branchId parameter is required');
      const tables = await tableService.listTables(branchId, floorId);
      this.sendSuccess(res, tables, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public updatePosition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const table = await tableService.updatePosition(req.params.id, req.body);
      this.sendSuccess(res, table, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.body;
      const table = await tableService.updateStatus(req.params.id, status);
      this.sendSuccess(res, table, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public mergeTables = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tableIds, parentMergeId } = req.body;
      await tableService.mergeTables(tableIds, parentMergeId);
      this.sendSuccess(res, { success: true }, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public splitTables = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { parentMergeId } = req.body;
      await tableService.splitTables(parentMergeId);
      this.sendSuccess(res, { success: true }, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // --- Reservation Handlers ---
  public createReservation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const reservation = await tableService.createReservation(req.body, req.user.tenantId);
      this.sendSuccess(res, reservation, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  public listReservations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branchId = req.query.branchId as string;
      if (!branchId) return this.throwError(HTTP_STATUS.BAD_REQUEST, 'VALIDATION_FAILED', 'branchId parameter is required');
      const bookings = await tableService.listReservations(branchId);
      this.sendSuccess(res, bookings, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // --- Waitlist Handlers ---
  public addWaitlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const entry = await tableService.addWaitlist(req.body);
      this.sendSuccess(res, entry, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  public listWaitlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branchId = req.query.branchId as string;
      if (!branchId) return this.throwError(HTTP_STATUS.BAD_REQUEST, 'VALIDATION_FAILED', 'branchId parameter is required');
      const entries = await tableService.listWaitlist(branchId);
      this.sendSuccess(res, entries, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };
}

export const tableController = new TableController();
export default tableController;
