# xCards v1.0.0 - Installation Guide

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Setup Instructions

1. **Extract the backup files**
   ```bash
   # Extract all files to your project directory
   cp -r backup_v1.0.0/* your-project-folder/
   cd your-project-folder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open your browser to `http://localhost:5000`
   - The app will automatically create a sample deck on first visit

## Production Deployment

### Static Hosting (Recommended)
Since xCards is completely client-side, you can deploy to any static hosting service:

1. **Build the production version**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to:
   - Netlify
   - Vercel
   - GitHub Pages
   - Any static hosting service

### Self-Hosted Server
You can also run the included Express server:

```bash
npm start
```

## Configuration

### Environment Variables
No environment variables required - the app runs entirely in the browser.

### PWA Installation
Users can install xCards as a Progressive Web App:
- Chrome: "Install xCards" button in address bar
- Mobile: "Add to Home Screen" option

## Data Storage

- **Local Storage**: All data is stored in browser localStorage
- **Backup**: Users can export their decks as CSV files
- **Privacy**: No data is sent to external servers

## Troubleshooting

### Common Issues

1. **Blank screen on startup**
   - Clear browser cache and localStorage
   - Check browser console for errors

2. **PWA not installing**
   - Ensure HTTPS is enabled (required for PWA)
   - Check that manifest.json is accessible

3. **Import/Export not working**
   - Verify browser supports File API
   - Check file format matches expected CSV structure

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## File Structure

```
project/
├── client/           # React frontend
├── server/           # Express server (dev only)
├── shared/           # Shared types
├── package.json      # Dependencies
├── vite.config.ts    # Build configuration
└── tailwind.config.ts # Styling configuration
```

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Key Dependencies
- React 18
- TypeScript 5
- Vite 5
- Tailwind CSS 3
- Radix UI components

For support or questions, refer to the README.md file or the project repository.