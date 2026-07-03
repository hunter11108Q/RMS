export interface CacheItem<T = any> {
  value: T;
  expiry: number;
  version: number;
}

export class CacheManager {
  private cache: Map<string, CacheItem> = new Map();
  private version = 1;

  constructor(version = 1) {
    this.version = version;
  }

  public set<T>(key: string, value: T, ttlMs = 300000): void {
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, {
      value,
      expiry,
      version: this.version,
    });
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check version mismatch or cache expiration
    if (item.version !== this.version || Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public cleanup(): void {
    const now = Date.now();
    this.cache.forEach((item, key) => {
      if (now > item.expiry || item.version !== this.version) {
        this.cache.delete(key);
      }
    });
  }

  public size(): number {
    return this.cache.size;
  }
}
export default CacheManager;
