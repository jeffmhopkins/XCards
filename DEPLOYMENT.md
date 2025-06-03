# Deployment Guide - xCards v1.0.4

This guide explains how to deploy xCards using the pre-built production files included in this archive.

## Available Builds

### Standard Deployment (/dist/)
Use the `/dist/` folder for:
- Standard web hosting services
- CDN deployments
- Custom domain hosting
- Any hosting that serves from root path "/"

### GitHub Pages Deployment (/docs/)
Use the `/docs/` folder for:
- GitHub Pages repository hosting
- Serves from "/XCards/" path
- Optimized for username.github.io/XCards/ URLs

## Deployment Methods

### 1. Standard Web Hosting

1. Upload contents of `/dist/` folder to your web server root
2. Ensure your server can serve static files
3. Configure your server to serve `index.html` for all routes (SPA routing)

Example nginx configuration:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 2. GitHub Pages

1. Copy contents of `/docs/` folder to your repository root
2. Enable GitHub Pages in repository settings
3. Set source to "Deploy from a branch"
4. Select "main" branch and "/ (root)" folder
5. Your app will be available at: https://username.github.io/repository-name/

### 3. Static Hosting Services

**Netlify/Vercel:**
- Upload `/dist/` folder
- Configure redirects: `/* /index.html 200`

**AWS S3:**
- Upload `/dist/` contents to S3 bucket
- Enable static website hosting
- Set index document to `index.html`
- Set error document to `index.html`

## PWA Features

Both builds include full PWA support:
- Service worker for offline functionality
- Web app manifest for installation
- Responsive design for mobile devices
- Local storage for data persistence

## File Structure

```
dist/ (or docs/)
├── assets/
│   ├── index-[hash].js    # Main application bundle
│   └── index-[hash].css   # Stylesheet bundle
├── icon-192.png           # PWA icon
├── icon-192.svg           # SVG icon
├── index.html             # Main HTML file
├── manifest.json          # PWA manifest
└── sw.js                  # Service worker
```

## Security Headers (Recommended)

Add these security headers to your server configuration:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## Domain Configuration

For custom domains, update the manifest.json if needed:
- Standard deployment: paths already use relative references
- GitHub Pages: paths are configured for /XCards/ base

## Troubleshooting

**Blank page after deployment:**
- Check browser console for errors
- Verify all asset paths are accessible
- Ensure server supports SPA routing

**PWA not installing:**
- Verify manifest.json is accessible
- Check service worker registration
- Ensure HTTPS is enabled (required for PWA)

**GitHub Pages 404 errors:**
- Verify repository name matches the /XCards/ path in docs build
- Check that GitHub Pages is enabled in repository settings