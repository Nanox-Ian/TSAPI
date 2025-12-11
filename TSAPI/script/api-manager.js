import Config from './config.js';
import CacheManager from './cache-manager.js';

// API Manager for handling API calls
class APIManager {
    constructor() {
        this.cacheManager = new CacheManager();
        this.apiStatus = {};
        this.responseTimes = [];
    }

    async fetchFromAPI(apiName, query = '', additionalParams = {}) {
        const apiConfig = Config.API_CONFIGS[apiName];
        if (!apiConfig) {
            throw new Error(`API ${apiName} not configured`);
        }

        const cacheKey = this.cacheManager.generateCacheKey(
            apiName, 
            query, 
            additionalParams
        );

        const startTime = Date.now();

        try {
            const data = await this.cacheManager.getOrFetch(
                cacheKey, 
                async () => await this.makeAPICall(apiConfig, query, additionalParams)
            );

            const responseTime = Date.now() - startTime;
            this.recordResponseTime(responseTime);
            this.updateAPIStatus(apiName, true);

            return {
                source: apiConfig.name,
                data: apiConfig.parser(data),
                responseTime
            };
        } catch (error) {
            console.error(`Error fetching from ${apiName}:`, error);
            this.updateAPIStatus(apiName, false);
            return null;
        }
    }

    async makeAPICall(apiConfig, query, additionalParams) {
        const url = new URL(apiConfig.url);
        
        // Add query parameters
        const params = { ...apiConfig.params, ...additionalParams };
        if (query) {
            params.q = query;
        }

        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        const options = {
            headers: {
                'Content-Type': 'application/json',
                ...apiConfig.headers
            }
        };

        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        return await response.json();
    }

    async fetchAllAPIs(query = '', category = '') {
        const apiPromises = Object.keys(Config.API_CONFIGS).map(async (apiName) => {
            const params = category ? { category } : {};
            return await this.fetchFromAPI(apiName, query, params);
        });

        const results = await Promise.allSettled(apiPromises);
        
        return results
            .filter(result => result.status === 'fulfilled' && result.value)
            .map(result => result.value);
    }

    recordResponseTime(time) {
        this.responseTimes.push(time);
        if (this.responseTimes.length > 100) {
            this.responseTimes.shift();
        }
    }

    getAverageResponseTime() {
        if (this.responseTimes.length === 0) return 0;
        const sum = this.responseTimes.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.responseTimes.length);
    }

    updateAPIStatus(apiName, isOnline) {
        this.apiStatus[apiName] = {
            online: isOnline,
            lastChecked: new Date().toISOString()
        };
    }

    getAPIStatus() {
        return Object.entries(Config.API_CONFIGS).map(([key, config]) => ({
            name: config.name,
            online: this.apiStatus[key]?.online ?? false
        }));
    }
}

export default APIManager;