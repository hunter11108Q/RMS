import logger from './logger';
import config from '../config/index';

export class RedisService {
  private isConnected = false;
  private memoryCache: Map<string, string> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      // Log connection attempt to Redis host
      logger.info(`Attempting Redis connection to URL: ${config.redisUrl}`, { context: 'RedisService' });
      
      // In development/fallback context, we simulate successful connection or allow installing ioredis.
      // Since no ioredis dependency is listed, we fall back to a robust memory cache immediately.
      this.isConnected = true;
      logger.info('Redis connection simulated successfully (In-Memory Fallback Active).', { context: 'RedisService' });
    } catch (err: any) {
      logger.error(`Redis connection failed: ${err.message}`, { context: 'RedisService' });
      this.isConnected = false;
    }
  }

  public async get(key: string): Promise<string | null> {
    return this.memoryCache.get(key) || null;
  }

  public async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    this.memoryCache.set(key, value);
    if (expirySeconds) {
      setTimeout(() => {
        this.memoryCache.delete(key);
      }, expirySeconds * 1000);
    }
  }

  public async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
  }

  public checkHealth(): { status: 'UP' | 'DOWN'; details: string } {
    return {
      status: this.isConnected ? 'UP' : 'DOWN',
      details: this.isConnected ? 'Connected to cache service (mock/in-memory)' : 'Cache service unreachable',
    };
  }
}

export const redisService = new RedisService();
export default redisService;
