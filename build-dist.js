#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('Building dist folder...');

try {
  // Clean dist directory
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
    console.log('✓ Cleaned dist directory');
  }

  // Build dist
  execSync('npx vite build --config vite.config.dist.ts --emptyOutDir', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
  });
  
  console.log('✓ Dist build completed successfully!');
  console.log('- dist/ folder: Ready for static deployment');

} catch (error) {
  console.error('✗ Dist build failed:', error.message);
  process.exit(1);
}