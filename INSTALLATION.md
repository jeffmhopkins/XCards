# xCards v1.0.5 - Installation Guide

## Prerequisites

- Node.js 18+ and npm
- Git for cloning the repository
- Modern web browser with PWA support

## Quick Start

### 1. Clone from GitHub

```bash
git clone https://github.com/jeffmhopkins/XCards.git
cd XCards
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### 4. Production Build

```bash
npm run build
```

This creates optimized files in the `dist/` folder for deployment.

## Deployment Options

### Option 1: GitHub Pages

The `docs/` folder is pre-configured for GitHub Pages deployment:

1. Push the repository to GitHub
2. Go to repository Settings → Pages
3. Set source to "Deploy from a branch"
4. Select "main" branch and "/docs" folder
5. Your app will be available at `https://username.github.io/XCards/`

### Option 2: Generic Static Hosting

Use the `dist/` folder for any static hosting service:

- Netlify: Drag and drop the `dist/` folder
- Vercel: Deploy the `dist/` folder
- Apache/Nginx: Copy `dist/` contents to web root
- CDN: Upload `dist/` contents to your CDN

### Option 3: Self-Hosted

For your own server:

```bash
# After building
cd dist
python3 -m http.server 8080
# Or use any static file server
```

## PWA Installation

Once deployed, users can install the app as a PWA:

1. Visit the deployed URL in a mobile browser
2. Look for "Add to Home Screen" prompt
3. Or use browser menu → "Install App"

## Development Structure

```
xCards/
├── client/               # React frontend
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── lib/        # Utilities
│   │   └── pages/      # Application pages
├── server/              # Development server
├── shared/              # Shared types
├── dist/               # Production build (generic)
└── docs/               # GitHub Pages build
```

## Environment Configuration

No environment variables required - the app runs entirely client-side with localStorage.

## Troubleshooting

### Build Issues
- Ensure Node.js 18+ is installed
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

### PWA Issues
- Check that HTTPS is enabled (required for PWA)
- Verify service worker registration in browser dev tools

### GitHub Pages Issues
- Ensure repository is public or has Pages enabled
- Check that `/docs` folder exists and contains built files
- Verify paths use `/XCards/` prefix in docs folder

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

PWA features require modern browser support for service workers and web app manifests.