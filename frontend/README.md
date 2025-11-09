# Frontend - Scoper Chat UI

Frontend application for Scoper Chat UI using Vite.

## Setup

1. Install dependencies:
```bash
npm install
```

## Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build

Build for production:
```bash
npm run build
```

The built files will be in the `dist/` directory.

## Preview Production Build

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
frontend/
├── index.html          # Main HTML file
├── src/
│   ├── app.js         # Main application logic
│   ├── api.js         # API client and utilities
│   ├── storage.js     # LocalStorage utilities
│   └── styles.css     # Styles
├── public/
│   ├── fonts/         # Font files
│   ├── logo.svg       # Logo
│   └── send.svg       # Send icon
├── vite.config.js     # Vite configuration
└── package.json       # Dependencies and scripts
```

## Configuration

The API base URL can be configured in `index.html`:
```javascript
window.API_BASE_URL = 'http://localhost:8787';
```



