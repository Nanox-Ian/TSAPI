// Configuration
const API_CONFIGS = {
    STACK_EXCHANGE: {
        name: 'Stack Exchange',
        url: 'https://api.stackexchange.com/2.3/search',
        params: {
            order: 'desc',
            sort: 'relevance',
            site: 'stackoverflow',
            pagesize: 3
        },
        parser: (data) => data.items.map(item => ({
            title: item.title,
            description: item.title,
            link: item.link,
            tags: item.tags.slice(0, 3),
            source: 'Stack Overflow'
        }))
    },

    PUBLIC_APIS: {
        name: 'Public APIs',
        url: 'https://api.publicapis.org/entries',
        parser: (data) => data.entries
            .filter(entry => entry.Category.toLowerCase().includes('development'))
            .slice(0, 3)
            .map(entry => ({
                title: entry.API,
                description: entry.Description,
                link: entry.Link,
                tags: [entry.Category],
                source: 'Public APIs'
            }))
    },

    QUOTE_API: {
        name: 'Programming Quotes',
        url: 'https://programming-quotes-api.herokuapp.com/quotes',
        parser: (data) => data.slice(0, 3).map(quote => ({
            title: 'Programming Quote',
            description: quote.en,
            author: quote.author,
            tags: ['programming', 'motivation'],
            source: 'Programming Quotes'
        }))
    }
};

const DEFAULT_SEARCH_TERMS = [
    'JavaScript error',
    'Python bug',
    'React issue',
    'API failed'
];

// Cache Manager
class CacheManager {
    constructor() {
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
    }

    getCache(key) {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            
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

    setCache(key, data) {
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

    generateCacheKey(apiName, query) {
        return `cache_${apiName}_${query.toLowerCase().replace(/\s+/g, '_')}`;
    }
}

// API Manager
class APIManager {
    constructor() {
        this.cacheManager = new CacheManager();
    }

    async fetchFromAPI(apiName, query = '') {
        const apiConfig = API_CONFIGS[apiName];
        if (!apiConfig) return null;

        const cacheKey = this.cacheManager.generateCacheKey(apiName, query);
        const cached = this.cacheManager.getCache(cacheKey);
        
        if (cached) {
            console.log('Cache hit:', apiName);
            return {
                source: apiConfig.name,
                data: apiConfig.parser(cached)
            };
        }

        try {
            const url = new URL(apiConfig.url);
            const params = { ...apiConfig.params };
            
            if (query) {
                params.q = query;
            }

            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });

            console.log('Fetching from:', url.toString());
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API ${apiName} responded with status: ${response.status}`);
            }

            const data = await response.json();
            
            // Cache the response
            this.cacheManager.setCache(cacheKey, data);
            
            return {
                source: apiConfig.name,
                data: apiConfig.parser(data)
            };
        } catch (error) {
            console.error(`Error fetching from ${apiName}:`, error);
            return null;
        }
    }

    async fetchAllAPIs(query = '') {
        const apiPromises = Object.keys(API_CONFIGS).map(apiName => 
            this.fetchFromAPI(apiName, query)
        );

        const results = await Promise.allSettled(apiPromises);
        
        return results
            .filter(result => result.status === 'fulfilled' && result.value)
            .map(result => result.value);
    }
}

// UI Manager
class UIManager {
    constructor() {
        this.recentSearches = JSON.parse(localStorage.getItem('recent_searches') || '[]');
    }

    displaySolutions(solutionsData) {
        const container = document.getElementById('solutionsContainer');
        
        const allSolutions = solutionsData.flatMap(apiResult => 
            apiResult.data.map(item => ({
                ...item,
                source: apiResult.source
            }))
        );

        if (allSolutions.length === 0) {
            container.innerHTML = `
                <div class="solution-card placeholder">
                    <h4>No solutions found</h4>
                    <p>Try a different search term or check your internet connection.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = allSolutions.map(solution => `
            <div class="solution-card">
                <h4>${this.escapeHTML(solution.title)}</h4>
                <p>${this.escapeHTML(solution.description || 'No description available.')}</p>
                ${solution.author ? `<p><strong>Author:</strong> ${solution.author}</p>` : ''}
                ${solution.link ? `<a href="${solution.link}" target="_blank" class="solution-link" style="color: var(--primary-color); text-decoration: none; display: inline-block; margin-top: 10px;">View Source →</a>` : ''}
                <div class="solution-meta">
                    <div class="solution-tags">
                        ${(solution.tags || []).slice(0, 3).map(tag => 
                            `<span class="tag">${this.escapeHTML(tag)}</span>`
                        ).join('')}
                    </div>
                    <span class="api-source">${solution.source}</span>
                </div>
            </div>
        `).join('');
    }

    showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.style.display = show ? 'block' : 'none';
    }

    addRecentSearch(searchTerm) {
        if (!searchTerm.trim()) return;
        
        // Remove if already exists
        this.recentSearches = this.recentSearches.filter(s => s !== searchTerm);
        
        // Add to beginning
        this.recentSearches.unshift(searchTerm);
        
        // Keep only last 10 searches
        this.recentSearches = this.recentSearches.slice(0, 10);
        
        localStorage.setItem('recent_searches', JSON.stringify(this.recentSearches));
    }

    escapeHTML(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    displayError(message) {
        const container = document.getElementById('solutionsContainer');
        container.innerHTML = `
            <div class="solution-card placeholder">
                <h4>Error Loading Data</h4>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn-primary" style="margin-top: 1rem;">
                    <i class="fas fa-sync-alt"></i> Retry
                </button>
            </div>
        `;
    }
}

// Main Application
class TechFixesApp {
    constructor() {
        this.apiManager = new APIManager();
        this.uiManager = new UIManager();
        this.isLoading = false;
        
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.setupTheme();
        this.loadDefaultSolutions();
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => this.handleRefresh());

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
    }

    async handleSearch() {
        if (this.isLoading) return;
        
        const searchInput = document.getElementById('searchInput');
        const query = searchInput.value.trim();

        this.uiManager.showLoading(true);
        this.isLoading = true;

        try {
            let solutions;
            
            if (query) {
                this.uiManager.addRecentSearch(query);
                solutions = await this.apiManager.fetchAllAPIs(query);
            } else {
                // Use default search term if no query provided
                const randomTerm = DEFAULT_SEARCH_TERMS[
                    Math.floor(Math.random() * DEFAULT_SEARCH_TERMS.length)
                ];
                searchInput.value = randomTerm;
                solutions = await this.apiManager.fetchAllAPIs(randomTerm);
            }

            this.uiManager.displaySolutions(solutions);
        } catch (error) {
            console.error('Search error:', error);
            this.uiManager.displayError('Failed to fetch solutions. Please try again.');
        } finally {
            this.uiManager.showLoading(false);
            this.isLoading = false;
        }
    }

    async handleRefresh() {
        // Clear cache for fresh data
        const searchInput = document.getElementById('searchInput');
        const query = searchInput.value.trim();
        
        if (query) {
            // Clear cache for this specific query
            Object.keys(API_CONFIGS).forEach(apiName => {
                const cacheKey = `cache_${apiName}_${query.toLowerCase().replace(/\s+/g, '_')}`;
                localStorage.removeItem(cacheKey);
            });
        }
        
        await this.handleSearch();
    }

    async loadDefaultSolutions() {
        const randomTerm = DEFAULT_SEARCH_TERMS[
            Math.floor(Math.random() * DEFAULT_SEARCH_TERMS.length)
        ];
        document.getElementById('searchInput').value = randomTerm;
        await this.handleSearch();
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TechFixesApp();
});