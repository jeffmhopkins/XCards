# xCards v1.0.5 - Deployment Guide

## Overview

xCards v1.0.5 includes two pre-built deployment configurations:

- **`dist/`** - Generic static hosting (root path deployment)
- **`docs/`** - GitHub Pages optimized (subdirectory deployment)

## Build Process

```bash
# Build both configurations
npm run build

# This creates:
# - dist/ folder for generic hosting
# - docs/ folder for GitHub Pages
```

## Deployment Methods

### 1. GitHub Pages (Recommended)

**Automatic Setup:**
1. Fork/clone the repository to your GitHub account
2. Enable GitHub Pages in repository settings
3. Set source to "Deploy from a branch" → "main" → "/docs"
4. Access at: `https://yourusername.github.io/XCards/`

**Manual Setup:**
```bash
git clone https://github.com/jeffmhopkins/XCards.git
cd XCards
npm install
npm run build
git add docs/
git commit -m "Deploy v1.0.5"
git push origin main
```

### 2. Netlify

**Option A: Drag & Drop**
1. Build locally: `npm run build`
2. Drag `dist/` folder to Netlify dashboard
3. Site will be available at generated URL

**Option B: Git Integration**
1. Connect GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

### 3. Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd dist
vercel --name xcards
```

### 4. Self-Hosted Server

**Apache:**
```bash
# Copy files to web root
sudo cp -r dist/* /var/www/html/
```

**Nginx:**
```bash
# Copy files to web root
sudo cp -r dist/* /usr/share/nginx/html/
```

**Node.js Server:**
```bash
# Simple static server
cd dist
npx serve -s . -p 3000
```

## PWA Configuration

### Service Worker Registration

Both builds include automatic service worker registration:

- **Generic build**: Registers `/sw.js`
- **GitHub Pages build**: Registers `/XCards/sw.js`

### Manifest Configuration

PWA manifest is automatically configured for:
- Standalone app mode
- Custom theme colors
- App icons (192x192)
- Offline functionality

### Installation Prompts

Modern browsers will automatically show install prompts when:
- Site is served over HTTPS
- Service worker is registered
- Web app manifest is valid

## HTTPS Requirements

PWA features require HTTPS. Most hosting services provide this automatically:

- GitHub Pages: Automatic HTTPS
- Netlify: Automatic HTTPS
- Vercel: Automatic HTTPS
- Custom domain: Requires SSL certificate

## Performance Optimization

### Built-in Optimizations

- Minified CSS/JS bundles
- Tree-shaken dependencies
- Optimized asset loading
- Service worker caching

### Bundle Sizes (v1.0.5)

- CSS: ~74KB (12KB gzipped)
- JavaScript: ~342KB (98KB gzipped)
- Total bundle: ~416KB (110KB gzipped)

## Cache Strategy

Service worker implements cache-first strategy:

1. Check cache for requested resource
2. Return cached version if available
3. Fetch from network if not cached
4. Cache new resources for offline use

## Monitoring & Analytics

The application includes no tracking by default. To add analytics:

1. Modify `client/public/index.html`
2. Add your analytics script before closing `</head>`
3. Rebuild and redeploy

## Version Management

### Updating Deployments

```bash
# Update version in package.json and README.md
# Build new version
npm run build

# For GitHub Pages
git add docs/
git commit -m "Deploy v1.0.x"
git push

# For other platforms
# Upload new dist/ folder contents
```

### Cache Invalidation

Service worker automatically handles cache updates:
- New builds get new cache keys
- Old caches are automatically cleared
- Users get updates on next visit

## Troubleshooting

### Common Issues

**PWA not installing:**
- Verify HTTPS is enabled
- Check service worker registration in DevTools
- Ensure manifest.json is accessible

**Assets not loading:**
- Check browser network tab for 404 errors
- Verify correct base path configuration
- Ensure all files are uploaded

**Offline mode not working:**
- Confirm service worker is registered
- Check Application tab in DevTools
- Verify cache storage contains assets

### Debug Tools

Use browser DevTools to debug:
- **Application tab**: Service worker status, cache storage
- **Network tab**: Failed requests, offline simulation
- **Console**: Service worker registration logs

## Security Considerations

- No server-side vulnerabilities (static deployment)
- All data stored locally in browser
- No external API dependencies
- No sensitive data transmitted

## Backup & Recovery

User data is stored in browser localStorage:
- Export feature creates CSV backups
- No server-side data to backup
- Users responsible for their own data

This deployment setup ensures reliable, fast, and secure hosting for the xCards application across multiple platforms.