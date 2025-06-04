#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('Building docs folder for GitHub Pages...');

try {
  // Clean docs directory
  if (fs.existsSync('docs')) {
    fs.rmSync('docs', { recursive: true });
    console.log('✓ Cleaned docs directory');
  }

  // Build docs
  execSync('npx vite build --config vite.config.docs.ts --emptyOutDir', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
  });
  
  console.log('✓ Docs build completed');

  // Configure PWA for GitHub Pages
  console.log('Configuring PWA for GitHub Pages...');
  
  // Fix manifest.json
  const manifestPath = 'docs/manifest.json';
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.start_url = '/XCards/';
    manifest.scope = '/XCards/';
    manifest.description = 'A modern flashcard application for effective learning';
    manifest.icons = manifest.icons.map(icon => ({
      ...icon,
      src: icon.src.replace(/^\//, '/XCards/')
    }));
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✓ Updated manifest.json');
  }

  // Fix service worker
  const swPath = 'docs/sw.js';
  if (fs.existsSync(swPath)) {
    let swContent = fs.readFileSync(swPath, 'utf8');
    swContent = swContent.replace(/const urlsToCache = \[\s*'\/'/,"const urlsToCache = [\n  '/XCards/'");
    swContent = swContent.replace(/'\/manifest\.json'/g, "'/XCards/manifest.json'");
    swContent = swContent.replace(/'\/icon-192\.svg'/g, "'/XCards/icon-192.svg'");
    swContent = swContent.replace(/return caches\.match\('\/'\)/g, "return caches.match('/XCards/')");
    fs.writeFileSync(swPath, swContent);
    console.log('✓ Updated service worker');
  }

  // Fix index.html
  const indexPath = 'docs/index.html';
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    content = content.replace(/<link rel="icon" type="image\/svg\+xml" href="\/vite\.svg" \/>/, '<link rel="icon" type="image/png" href="/XCards/icon-192.png" />');
    content = content.replace(/<title>xCards - Sci-Fi Flash Cards<\/title>/, '<title>xCards - Flash Cards</title>');
    content = content.replace(/A sci-fi themed flashcard application for immersive and adaptive learning/g, 'A modern flashcard application for effective learning');
    content = content.replace(/"xCards - Sci-Fi Flash Cards"/g, '"xCards - Flash Cards"');
    content = content.replace(/flashcards, study, learning, education, sci-fi, adaptive learning/, 'flashcards, study, learning, education, adaptive learning');
    fs.writeFileSync(indexPath, content);
    console.log('✓ Updated index.html');
  }

  console.log('✓ Docs build completed successfully!');
  console.log('- docs/ folder: Ready for GitHub Pages at /XCards/');

} catch (error) {
  console.error('✗ Docs build failed:', error.message);
  process.exit(1);
}