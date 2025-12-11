# Tech Fixes Hub

A comprehensive website that fetches tech solutions from 20+ free APIs using proper software architecture principles.

## Features

- **Multi-API Integration**: Fetches data from multiple free APIs simultaneously
- **Smart Caching**: Implements local caching for faster load times
- **Responsive Design**: Works on all devices from mobile to desktop
- **Dark/Light Theme**: User-friendly theme switching
- **Search & Filter**: Advanced search with category and API source filtering
- **Real-time Status**: Shows API health and response times
- **Recent Searches**: Remembers and allows quick access to recent searches

## Project Structure
tech-fixes-website/
├── index.html # Main HTML file
├── styles/
│ ├── main.css # Main stylesheet
│ └── responsive.css # Responsive styles
└── scripts/
├── app.js # Main application logic
├── api-manager.js # API management
├── ui-manager.js # UI updates and rendering
├── cache-manager.js # Cache management
└── config.js # Configuration and constants

text

## APIs Integrated

1. **Stack Exchange API** - Programming Q&A
2. **GitHub Issues API** - Code issues and bugs
3. **Public APIs** - Various development APIs
4. **JSON Placeholder** - Sample data
5. **Programming Quotes** - Motivational quotes

## Adding More APIs

To add more APIs, edit `config.js`:

```javascript
NEW_API: {
    name: 'API Name',
    url: 'API_ENDPOINT_URL',
    params: {
        // API parameters
    },
    parser: (data) => {
        // Parse API response
        return data.map(item => ({
            title: item.title,
            description: item.description,
            // ... other properties
        }));
    }
}
Setup Instructions
Clone or download the project files

Open index.html in a web browser

No server required - runs entirely client-side

Browser Support
Chrome 60+

Firefox 55+

Safari 11+

Edge 79+

License
This project is for educational purposes. All API data belongs to their respective owners.

Contributing
Feel free to add more APIs or improve the existing code structure!

text

## How to Use:

1. **Download all files** into a single folder
2. **Open `index.html`** in a modern web browser
3. **Search for tech issues** using the search bar
4. **Filter by category** or API source
5. **Toggle dark/light theme** using the moon/sun icon

## Key Features:

- **Modular Architecture**: Each component is separated into its own file
- **Error Handling**: Graceful handling of API failures
- **Performance**: Caching system reduces API calls
- **UX/UI**: Clean, modern interface with loading states
- **Extensible**: Easy to add more APIs or features

## Additional APIs to Add:

You can extend this by adding more free APIs from:
1. **StackOverflow API**
2. **RapidAPI Hub** (free tier)
3. **GitHub REST API**
4. **Reddit API** (tech subreddits)
5. **Dev.to API**
6. **Hacker News API**
7. **FreeCodeCamp API**
8. **Medium API**
9. **Twitter API** (for tech support accounts)
10. **Discourse API** (tech forums)
