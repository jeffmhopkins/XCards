#!/usr/bin/env node

import fs from 'fs/promises';
import { execSync } from 'child_process';

async function buildComplete() {
  console.log('Building complete xCards distribution...\n');
  
  try {
    // Ensure both folders exist (they already do from previous builds)
    const distExists = await fs.access('dist').then(() => true).catch(() => false);
    const docsExists = await fs.access('docs').then(() => true).catch(() => false);
    
    console.log(`Dist folder: ${distExists ? 'Found' : 'Missing'}`);
    console.log(`Docs folder: ${docsExists ? 'Found' : 'Missing'}`);
    
    if (!distExists) {
      console.log('Creating dist build...');
      execSync('node simple-build.js', { stdio: 'inherit' });
    }
    
    if (!docsExists) {
      console.log('Creating docs build...');
      execSync('node build-docs.js', { stdio: 'inherit' });
    }
    
    // Verify both builds are complete
    const distFinal = await fs.access('dist').then(() => true).catch(() => false);
    const docsFinal = await fs.access('docs').then(() => true).catch(() => false);
    
    if (distFinal && docsFinal) {
      console.log('\n✓ All builds completed successfully');
      
      // Create comprehensive archive
      console.log('Creating complete archive...');
      execSync('tar -czf xCards_v1.0.5_final.tar.gz dist docs README.md CHANGELOG.md INSTALLATION.md DEPLOYMENT.md package.json app-icon-512.svg client server shared *.config.* build-*.js', { 
        stdio: 'inherit' 
      });
      
      const stats = await fs.stat('xCards_v1.0.5_final.tar.gz');
      console.log(`✓ Final archive: xCards_v1.0.5_final.tar.gz (${(stats.size / 1024).toFixed(1)} KB)`);
      
      // Show directory structure
      console.log('\nFinal build structure:');
      console.log('dist/ - Production landing page');
      console.log('docs/ - React documentation app with PWA');
      
    } else {
      throw new Error('Build verification failed');
    }
    
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

buildComplete();