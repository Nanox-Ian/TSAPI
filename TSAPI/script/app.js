import Config from './config.js';
import APIManager from './api-manager.js';
import UIManager from './ui-manager.js';
import CacheManager from './cache-manager.js';

// Main Application Class
class TechFixesApp {
    constructor() {
        this.apiManager = new APIManager();
        this.uiManager = new UIManager();
        this.cacheManager = new CacheManager();
        this.isLoading = false;
        
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.setupTheme();
        this.populateAPIFilter();
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

        // Clear cache button
        document.getElementById('clearCacheBtn').addEventListener('click', () => this.clearCache());

        // Category tags
        document.querySelectorAll('.category-tags .tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                document.getElementById('categoryFilter').value = category;
                this.handleSearch();
            });
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
    }

    async handleSearch() {
        if (this.isLoading) return;
        
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const apiSourceFilter = document.getElementById('apiSourceFilter');
        
        const query = searchInput.value.trim();
        const category = categoryFilter.value;
        const apiSource = apiSourceFilter.value;

        this.uiManager.showLoading(true);
        this.isLoading = true;

        try {
            let solutions;
            
            if (query) {
                this.uiManager.addRecentSearch(query);
                solutions = await this.apiManager.fetchAllAPIs(query, category);
            } else {
                // Use default search terms if no query provided
                const randomTerm = Config.DEFAULT_SEARCH_TERMS[
                    Math.floor(Math.random() * Config.DEFAULT_SEARCH_TERMS.length)
                ];
                solutions = await this.apiManager.fetchAllAPIs(randomTerm, category);
            }

            this.uiManager.displaySolutions(solutions);
            this.updateAPIStatusDisplay();
            this.updateStats();
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
            Object.keys(Config.API_CONFIGS).forEach(apiName => {
                const cacheKey = this.cacheManager.generateCacheKey(apiName, query);
                this.cacheManager.removeCache(cacheKey);
            });
        }
        
        await this.handleSearch();
    }

    async loadDefaultSolutions() {
        const randomTerm = Config.DEFAULT_SEARCH_TERMS[
            Math.floor(Math.random() * Config.DEFAULT_SEARCH_TERMS.length)
        ];
        document.getElementById('searchInput').value = randomTerm;
        await this.handleSearch();
    }

    populateAPIFilter() {
        const select = document.getElementById('apiSourceFilter');
        Object.values(Config.API_CONFIGS).forEach(api => {
            const option = document.createElement('option');
            option.value = api.name;
            option.textContent = api.name;
            select.appendChild(option);
        });
    }

    updateAPIStatusDisplay() {
        const apiStatus = this.apiManager.getAPIStatus();
        this.uiManager.updateAPIStatusDisplay(apiStatus);
    }

    updateStats() {
        const avgResponseTime = this.apiManager.getAverageResponseTime();
        document.getElementById('responseTime').textContent = `${avgResponseTime}ms`;
        document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
    }

    clearCache() {
        this.cacheManager.clearAllCache();
        alert('Cache cleared successfully!');
        this.handleRefresh();
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