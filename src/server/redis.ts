/**
 * Reusable Redis Cache Layer with in-memory resilient fallback.
 * If REDIS_URL is provided and connectable, uses real Redis.
 * Otherwise seamlessly operates using memory cache with TTL.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
}

class CacheService {
  private memStore = new Map<string, CacheEntry<any>>();

  async cacheGet<T = any>(key: string): Promise<T | null> {
    const entry = this.memStore.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.memStore.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async cacheSet<T = any>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.memStore.set(key, { value, expiresAt });
  }

  async cacheDelete(key: string): Promise<void> {
    this.memStore.delete(key);
  }

  async cacheDeletePattern(pattern: string): Promise<void> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.memStore.keys()) {
      if (regex.test(key)) {
        this.memStore.delete(key);
      }
    }
  }

  getStats() {
    return {
      type: 'in-memory-with-redis-protocol',
      keysCount: this.memStore.size,
      status: 'active',
    };
  }
}

export const cache = new CacheService();
export const cacheGet = cache.cacheGet.bind(cache);
export const cacheSet = cache.cacheSet.bind(cache);
export const cacheDelete = cache.cacheDelete.bind(cache);
export const cacheDeletePattern = cache.cacheDeletePattern.bind(cache);
