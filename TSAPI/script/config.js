// API Configuration and Constants
class Config {
    static API_CONFIGS = {
        STACK_EXCHANGE: {
            name: 'Stack Exchange',
            url: 'https://api.stackexchange.com/2.3/search',
            params: {
                order: 'desc',
                sort: 'relevance',
                site: 'stackoverflow',
                pagesize: 5
            },
            parser: (data) => data.items.map(item => ({
                title: item.title,
                description: item.body_markdown?.substring(0, 200) + '...',
                link: item.link,
                tags: item.tags.slice(0, 3),
                source: 'Stack Overflow'
            }))
        },

        GITHUB_ISSUES: {
            name: 'GitHub Issues',
            url: 'https://api.github.com/search/issues',
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            },
            parser: (data) => data.items.map(item => ({
                title: item.title,
                description: item.body?.substring(0, 200) + '...',
                link: item.html_url,
                tags: item.labels.map(label => label.name),
                source: 'GitHub'
            }))
        },

        PUBLIC_APIS: {
            name: 'Public APIs',
            url: 'https://api.publicapis.org/entries',
            parser: (data) => data.entries
                .filter(entry => entry.Category.toLowerCase().includes('development'))
                .slice(0, 5)
                .map(entry => ({
                    title: entry.API,
                    description: entry.Description,
                    link: entry.Link,
                    tags: [entry.Category],
                    source: 'Public APIs'
                }))
        },

        JSON_PLACEHOLDER: {
            name: 'JSON Placeholder',
            url: 'https://jsonplaceholder.typicode.com/posts',
            parser: (data) => data.slice(0, 5).map(post => ({
                title: post.title,
                description: post.body.substring(0, 150) + '...',
                tags: ['sample', 'placeholder'],
                source: 'JSON Placeholder'
            }))
        },

        // Additional free APIs can be added here
        QUOTE_API: {
            name: 'Programming Quotes',
            url: 'https://programming-quotes-api.herokuapp.com/quotes',
            parser: (data) => data.slice(0, 5).map(quote => ({
                title: 'Programming Quote',
                description: quote.en,
                author: quote.author,
                tags: ['programming', 'motivation'],
                source: 'Programming Quotes'
            }))
        }
    };

    static DEFAULT_SEARCH_TERMS = [
        'JavaScript error',
        'Python bug',
        'React issue',
        'Node.js problem',
        'Database connection',
        'API failed',
        'Docker container',
        'Git merge conflict',
        'Linux permission',
        'Windows update'
    ];

    static CATEGORIES = [
        'programming', 'hardware', 'software', 
        'networking', 'security', 'database', 
        'web', 'mobile', 'cloud'
    ];

    static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    static ITEMS_PER_PAGE = 9;
}

export default Config;