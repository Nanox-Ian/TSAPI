// Cache Manager for API responses
class CacheManager {
    constructor() {
        this.cacheName = 'tech-fixes-cache';
        this.cacheDuration = Config.CACHE_DURATION;
    }

    async getCache(key) {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            
            // Check if cache is still valid
            if (Date.now() - timestamp > this.cacheDuration) {
                this.removeCache(key);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    async setCache(key, data) {
        try {
            const cacheItem = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(cacheItem));
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    removeCache(key) {
        localStorage.removeItem(key);
    }

    clearAllCache() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('cache_')) {
                localStorage.removeItem(key);
            }
        });
    }

    generateCacheKey(apiName, query, params = {}) {
        const keyParts = [
            'cache',
            apiName,
            query,
            ...Object.values(params)
        ];
        return keyParts.join('_').toLowerCase().replace(/\s+/g, '_');
    }

    async getOrFetch(key, fetchFunction) {
        const cached = await this.getCache(key);
        if (cached) {
            console.log('Cache hit:', key);
            return cached;
        }

        console.log('Cache miss:', key);
        const data = await fetchFunction();
        if (data) {
            await this.setCache(key, data);
        }
        return data;
    }
}

export default CacheManager;