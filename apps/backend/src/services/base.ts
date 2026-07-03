import logger from '../services/logger';

export abstract class BaseService {
  protected log = logger;

  protected logError(message: string, error: any, context?: string): void {
    this.log.error(message, {
      error: error.message || error,
      stack: error.stack,
      context: context || this.constructor.name,
    });
  }

  protected logInfo(message: string, context?: string): void {
    this.log.info(message, {
      context: context || this.constructor.name,
    });
  }
}

export default BaseService;
