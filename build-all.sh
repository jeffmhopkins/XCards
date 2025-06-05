#!/bin/bash

# xCards Build and Archive Script
# Runs both build scripts and creates a versioned project archive

set -e  # Exit on any error

# Get version from CHANGELOG.md
VERSION=$(grep -m1 "^## v" CHANGELOG.md | sed 's/^## v\([0-9.]*\).*/\1/')

if [ -z "$VERSION" ]; then
    echo "Error: Could not extract version from CHANGELOG.md"
    exit 1
fi

echo "xCards Build and Archive v$VERSION"
echo "=================================="
echo ""

node build-dist.js
node build-docs.js
echo " Builds completed successfully!"
echo

# Check if builds exist, if not provide instructions
if [ ! -d "dist" ] || [ ! -d "docs" ]; then
    echo "Build folders not found. Please run builds manually first:"
    echo "1. node build-dist.js"
    echo "2. node build-docs.js"
    echo "3. Then run this script again"
    echo ""
    exit 1
fi

echo "Using existing build outputs..."
echo "✓ dist/ folder found"
echo "✓ docs/ folder found"
echo ""

# Create archive
ARCHIVE_NAME="xCards_v${VERSION}.tar.gz"
echo "Creating project archive: $ARCHIVE_NAME"
echo ""

# Create temporary directory for archive preparation
TEMP_DIR="xCards_temp"
rm -rf $TEMP_DIR
mkdir $TEMP_DIR

# Copy essential project files
echo "Copying project files..."

# Source code and configuration
cp -r client/ $TEMP_DIR/
cp -r server/ $TEMP_DIR/
cp -r shared/ $TEMP_DIR/

# Build outputs
cp -r dist/ $TEMP_DIR/
cp -r docs/ $TEMP_DIR/

# Configuration files
cp package.json $TEMP_DIR/
cp package-lock.json $TEMP_DIR/
cp tsconfig.json $TEMP_DIR/
cp tailwind.config.ts $TEMP_DIR/
cp postcss.config.js $TEMP_DIR/
cp components.json $TEMP_DIR/
cp capacitor.config.ts $TEMP_DIR/
cp drizzle.config.ts $TEMP_DIR/

# Vite configurations
cp vite.config.ts $TEMP_DIR/
cp vite.config.client.ts $TEMP_DIR/
cp vite.config.dist.ts $TEMP_DIR/
cp vite.config.docs.ts $TEMP_DIR/

# Build scripts
cp build-dist.js $TEMP_DIR/
cp build-docs.js $TEMP_DIR/
cp build-all.sh $TEMP_DIR/

# Documentation
cp README.md $TEMP_DIR/
cp CHANGELOG.md $TEMP_DIR/
cp INSTALLATION.md $TEMP_DIR/
cp DEPLOYMENT.md $TEMP_DIR/

# Assets and icons
cp app-icon-512.png $TEMP_DIR/
cp app-icon-512.svg $TEMP_DIR/
cp feature-graphic-1024x500-clean.png $TEMP_DIR/
cp feature-graphic-1024x500-clean.svg $TEMP_DIR/
cp feature-graphic-1024x500.svg $TEMP_DIR/

# Git configuration (if exists)
if [ -f .gitignore ]; then
    cp .gitignore $TEMP_DIR/
fi

# Create the archive
tar -czf $ARCHIVE_NAME -C $TEMP_DIR .

# Clean up temporary directory
rm -rf $TEMP_DIR

# Get archive size
ARCHIVE_SIZE=$(du -h $ARCHIVE_NAME | cut -f1)

echo "✓ Archive created successfully!"
echo "  File: $ARCHIVE_NAME"
echo "  Size: $ARCHIVE_SIZE"
echo ""
echo "Archive contents:"
echo "- Complete source code (client/, server/, shared/)"
echo "- Built outputs (dist/, docs/)"
echo "- All configuration files"
echo "- Build scripts"
echo "- Documentation"
echo "- Assets and icons"
echo ""
echo "To recreate the project:"
echo "1. Extract: tar -xzf $ARCHIVE_NAME"
echo "2. Install dependencies: npm install"
echo "3. Build: ./build-all.sh"
echo ""