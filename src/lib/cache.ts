/**
 * Caching Service (Redis Integration - Ready for Phase 2)
 * Handles caching of frequently accessed data
 * Can be switched on/off via environment variable
 */


/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  CATEGORIES_ALL: {
    key: "categories:all",
    ttl: 3600, // 1 hour
  },
  FEATURED_PRODUCTS: {
    key: "products:featured",
    ttl: 1800, // 30 minutes
  },
  NEW_PRODUCTS: {
    key: "products:new",
    ttl: 1800, // 30 minutes
  },
  PRODUCT_DETAIL: {
    key: (id: string) => `product:${id}`,
    ttl: 7200, // 2 hours
  },
  CATEGORY_BY_SLUG: {
    key: (slug: string) => `category:${slug}`,
    ttl: 3600, // 1 hour
  },
  HOMEPAGE_DATA: {
    key: "homepage:data",
    ttl: 600, // 10 minutes (more frequent updates)
  },
} as const;

/**
 * Simple in-memory cache implementation
 * Can be replaced with Redis in production
 */
class CacheManager {
  private cache: Map<string, { data: any; expiresAt: number }> = new Map();
  private enabled: boolean = true;

  constructor(enabled = true) {
    this.enabled = enabled;
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    if (!this.enabled) return null;

    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (item.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, data: T, ttl: number): void {
    if (!this.enabled) return;

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl * 1000,
    });
  }

  /**
   * Delete value from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      enabled: this.enabled,
    };
  }
}

// Initialize cache manager
export const cacheManager = new CacheManager(
  process.env.NODE_ENV !== "production"
);

/**
 * Invalidate related caches
 */
export function invalidateProductCaches(productId?: string) {
  if (productId) {
    cacheManager.delete(CACHE_CONFIG.PRODUCT_DETAIL.key(productId));
  }
  cacheManager.delete(CACHE_CONFIG.FEATURED_PRODUCTS.key);
  cacheManager.delete(CACHE_CONFIG.NEW_PRODUCTS.key);
  cacheManager.delete(CACHE_CONFIG.HOMEPAGE_DATA.key);
}

export function invalidateCategoryCaches() {
  cacheManager.delete(CACHE_CONFIG.CATEGORIES_ALL.key);
  cacheManager.delete(CACHE_CONFIG.HOMEPAGE_DATA.key);
}

export function invalidateAllCaches() {
  cacheManager.clear();
}

/**
 * Helper: Get or fetch data with caching
 */
export async function getOrCache<T>(
  cacheKey: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache
  const cached = cacheManager.get<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Store in cache
  cacheManager.set(cacheKey, data, ttl);

  return data;
}
