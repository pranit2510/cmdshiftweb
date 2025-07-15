/**
 * CacheManager - A localStorage-based caching utility with TTL support
 */
class CacheManager {
  constructor(prefix = 'cmdshift_cache_') {
    this.prefix = prefix;
    this.maxSize = 5 * 1024 * 1024; // 5MB default limit
    this.cleanupInterval = null;
    
    // Start periodic cleanup
    this.startPeriodicCleanup();
  }

  /**
   * Generate a prefixed cache key
   * @param {string} key - The original key
   * @returns {string} - Prefixed key
   */
  getCacheKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   * @returns {boolean} - Success status
   */
  set(key, value, ttl = null) {
    try {
      const cacheKey = this.getCacheKey(key);
      const now = Date.now();
      
      const cacheData = {
        value,
        timestamp: now,
        expiry: ttl ? now + ttl : null
      };

      const serialized = JSON.stringify(cacheData);
      
      // Check size before storing
      if (!this.checkSize(serialized)) {
        console.warn('Cache size limit would be exceeded');
        // Try to clean up expired items first
        this.cleanup();
        
        // Check again after cleanup
        if (!this.checkSize(serialized)) {
          throw new Error('Cache quota exceeded');
        }
      }

      localStorage.setItem(cacheKey, serialized);
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError' || 
          error.message.includes('quota') ||
          error.message.includes('QuotaExceeded')) {
        console.error('localStorage quota exceeded:', error);
        
        // Try aggressive cleanup
        this.cleanup(true);
        
        // Retry once after cleanup
        try {
          const cacheKey = this.getCacheKey(key);
          const cacheData = {
            value,
            timestamp: Date.now(),
            expiry: ttl ? Date.now() + ttl : null
          };
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
          return true;
        } catch (retryError) {
          console.error('Failed to cache after cleanup:', retryError);
          return false;
        }
      }
      
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any} - Cached value or null if not found/expired
   */
  get(key) {
    try {
      const cacheKey = this.getCacheKey(key);
      console.log('[Cache.get] Looking for key:', cacheKey);
      
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) {
        console.log('[Cache.get] No cache found for key:', key);
        return null;
      }

      console.log('[Cache.get] Raw cached data:', cached);
      const cacheData = JSON.parse(cached);
      console.log('[Cache.get] Parsed cache data:', cacheData);
      
      // Check if expired
      if (cacheData.expiry && Date.now() > cacheData.expiry) {
        console.log('[Cache.get] Cache expired for key:', key);
        this.remove(key);
        return null;
      }

      console.log('[Cache.get] Returning cached value:', cacheData.value);
      return cacheData.value;
    } catch (error) {
      console.error('Cache get error:', error);
      // Remove corrupted cache entry
      this.remove(key);
      return null;
    }
  }

  /**
   * Check if a cache key exists and is valid
   * @param {string} key - Cache key
   * @returns {boolean} - True if exists and not expired
   */
  has(key) {
    try {
      const cacheKey = this.getCacheKey(key);
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) {
        return false;
      }

      const cacheData = JSON.parse(cached);
      
      // Check if expired
      if (cacheData.expiry && Date.now() > cacheData.expiry) {
        this.remove(key);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Cache has error:', error);
      return false;
    }
  }

  /**
   * Remove a specific cache entry
   * @param {string} key - Cache key
   * @returns {boolean} - Success status
   */
  remove(key) {
    try {
      const cacheKey = this.getCacheKey(key);
      localStorage.removeItem(cacheKey);
      return true;
    } catch (error) {
      console.error('Cache remove error:', error);
      return false;
    }
  }

  /**
   * Clear all cache entries with this prefix
   * @returns {boolean} - Success status
   */
  clear() {
    try {
      const keys = this.getAllCacheKeys();
      keys.forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Get all cache keys with this prefix
   * @returns {string[]} - Array of cache keys
   */
  getAllCacheKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Clean up expired cache entries
   * @param {boolean} aggressive - If true, removes oldest entries if needed
   * @returns {number} - Number of entries removed
   */
  cleanup(aggressive = false) {
    let removed = 0;
    const now = Date.now();
    const entries = [];

    try {
      // Collect all cache entries
      const keys = this.getAllCacheKeys();
      
      for (const key of keys) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const cacheData = JSON.parse(cached);
            
            // Remove expired entries
            if (cacheData.expiry && now > cacheData.expiry) {
              localStorage.removeItem(key);
              removed++;
            } else if (aggressive) {
              // Collect for potential removal if aggressive cleanup
              entries.push({
                key,
                timestamp: cacheData.timestamp || 0,
                size: cached.length
              });
            }
          }
        } catch (error) {
          // Remove corrupted entries
          localStorage.removeItem(key);
          removed++;
        }
      }

      // If aggressive cleanup, remove oldest entries
      if (aggressive && entries.length > 0) {
        // Sort by timestamp (oldest first)
        entries.sort((a, b) => a.timestamp - b.timestamp);
        
        // Remove oldest 25% of entries
        const toRemove = Math.ceil(entries.length * 0.25);
        for (let i = 0; i < toRemove && i < entries.length; i++) {
          localStorage.removeItem(entries[i].key);
          removed++;
        }
      }
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }

    return removed;
  }

  /**
   * Check if adding data would exceed size limit
   * @param {string} data - Serialized data to check
   * @returns {boolean} - True if within limits
   */
  checkSize(data) {
    try {
      // Get current size
      let currentSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          const value = localStorage.getItem(key);
          if (value) {
            currentSize += key.length + value.length;
          }
        }
      }

      // Check if adding new data would exceed limit
      return (currentSize + data.length) < this.maxSize;
    } catch (error) {
      console.error('Size check error:', error);
      return true; // Allow operation to proceed
    }
  }

  /**
   * Get cache statistics
   * @returns {object} - Cache stats
   */
  getStats() {
    const stats = {
      totalEntries: 0,
      totalSize: 0,
      expiredEntries: 0,
      validEntries: 0
    };

    try {
      const now = Date.now();
      const keys = this.getAllCacheKeys();
      
      for (const key of keys) {
        const cached = localStorage.getItem(key);
        if (cached) {
          stats.totalEntries++;
          stats.totalSize += key.length + cached.length;
          
          try {
            const cacheData = JSON.parse(cached);
            if (cacheData.expiry && now > cacheData.expiry) {
              stats.expiredEntries++;
            } else {
              stats.validEntries++;
            }
          } catch (error) {
            // Count corrupted entries as expired
            stats.expiredEntries++;
          }
        }
      }
    } catch (error) {
      console.error('Stats calculation error:', error);
    }

    return stats;
  }

  /**
   * Start periodic cleanup of expired entries
   * @param {number} interval - Cleanup interval in milliseconds
   */
  startPeriodicCleanup(interval = 60000) { // Default: 1 minute
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      const removed = this.cleanup();
      if (removed > 0) {
        console.debug(`Cache cleanup: removed ${removed} expired entries`);
      }
    }, interval);
  }

  /**
   * Stop periodic cleanup
   */
  stopPeriodicCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Destroy the cache manager instance
   */
  destroy() {
    this.stopPeriodicCleanup();
  }
}

// Create default instance
const defaultCache = new CacheManager();

// Export both the class and default instance
export { CacheManager, defaultCache };

// Export convenience functions using default instance
export const cache = {
  set: (key, value, ttl) => defaultCache.set(key, value, ttl),
  get: (key) => defaultCache.get(key),
  has: (key) => defaultCache.has(key),
  remove: (key) => defaultCache.remove(key),
  clear: () => defaultCache.clear(),
  cleanup: (aggressive) => defaultCache.cleanup(aggressive),
  getStats: () => defaultCache.getStats()
};

export default cache;