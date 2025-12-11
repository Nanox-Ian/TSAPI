// UI Manager for handling DOM updates
class UIManager {
    constructor() {
        this.solutions = [];
        this.currentPage = 1;
        this.itemsPerPage = Config.ITEMS_PER_PAGE;
        this.recentSearches = JSON.parse(localStorage.getItem('recent_searches') || '[]');
    }

    displaySolutions(solutionsData) {
        this.solutions = solutionsData.flatMap(apiResult => 
            apiResult.data.map(item => ({
                ...item,
                source: apiResult.source,
                responseTime: apiResult.responseTime
            }))
        );

        this.updateStats();
        this.renderSolutions();
        this.updateRecentSearches();
    }

    renderSolutions() {
        const container = document.getElementById('solutionsContainer');
        const pagination = document.getElementById('pagination');
        
        if (this.solutions.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search fa-3x"></i>
                    <h3>No solutions found</h3>
                    <p>Try a different search term or check the API status.</p>
                </div>
            `;
            pagination.innerHTML = '';
            return;
        }

        // Calculate pagination
        const totalPages = Math.ceil(this.solutions.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageSolutions = this.solutions.slice(startIndex, endIndex);

        // Render solutions
        container.innerHTML = pageSolutions.map(solution => `
            <div class="solution-card">
                <h4>${this.escapeHTML(solution.title)}</h4>
                <p>${this.escapeHTML(solution.description || 'No description available.')}</p>
                ${solution.author ? `<p class="author"><strong>Author:</strong> ${solution.author}</p>` : ''}
                ${solution.link ? `<a href="${solution.link}" target="_blank" class="solution-link">View Solution <i class="fas fa-external-link-alt"></i></a>` : ''}
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

        // Render pagination
        this.renderPagination(totalPages);
    }

    renderPagination(totalPages) {
        const pagination = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = `
            <button class="btn-secondary" id="prevPage" ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i> Previous
            </button>
            <span class="page-info">Page ${this.currentPage} of ${totalPages}</span>
            <button class="btn-secondary" id="nextPage" ${this.currentPage === totalPages ? 'disabled' : ''}>
                Next <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;

        // Add event listeners
        document.getElementById('prevPage')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderSolutions();
            }
        });

        document.getElementById('nextPage')?.addEventListener('click', () => {
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderSolutions();
            }
        });
    }

    updateStats() {
        document.getElementById('totalSolutions').textContent = this.solutions.length;
        document.getElementById('responseTime').textContent = 'Calculating...';
    }

    updateAPIStatusDisplay(apiStatus) {
        const statusList = document.getElementById('apiStatusList');
        
        statusList.innerHTML = apiStatus.map(api => `
            <div class="api-item">
                <span>
                    <span class="status-indicator ${api.online ? 'status-online' : 'status-offline'}"></span>
                    ${api.name}
                </span>
                <span class="status-text">${api.online ? 'Online' : 'Offline'}</span>
            </div>
        `).join('');
    }

    updateRecentSearches() {
        const container = document.getElementById('recentSearches');
        
        if (this.recentSearches.length === 0) {
            container.innerHTML = '<li>No recent searches</li>';
            return;
        }

        container.innerHTML = this.recentSearches.slice(0, 5).map(search => `
            <li>${this.escapeHTML(search)}</li>
        `).join('');

        // Add click handlers
        container.querySelectorAll('li').forEach((li, index) => {
            li.addEventListener('click', () => {
                const searchTerm = this.recentSearches[index];
                document.getElementById('searchInput').value = searchTerm;
                document.getElementById('searchBtn').click();
            });
        });
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
        this.updateRecentSearches();
    }

    showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.style.display = show ? 'block' : 'none';
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    displayError(message) {
        const container = document.getElementById('solutionsContainer');
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <h3>Error Loading Data</h3>
                <p>${message}</p>
                <button id="retryBtn" class="btn-primary">
                    <i class="fas fa-sync-alt"></i> Retry
                </button>
            </div>
        `;
    }
}

export default UIManager;