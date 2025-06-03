#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Starting production build...');

// Function to run command with timeout
function runCommand(command, args, timeout = 120000) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'inherit' });
    
    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error(`Command timed out after ${timeout}ms`));
    }, timeout);
    
    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function build() {
  try {
    // Clean dist directory
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true });
    }
    fs.mkdirSync('dist');
    
    console.log('Building frontend...');
    await runCommand('npx', ['vite', 'build'], 180000);
    
    console.log('Building backend...');
    await runCommand('npx', ['esbuild', 'server/index.ts', '--platform=node', '--packages=external', '--bundle', '--format=esm', '--outdir=dist'], 60000);
    
    console.log('Build completed successfully!');
    
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

build();