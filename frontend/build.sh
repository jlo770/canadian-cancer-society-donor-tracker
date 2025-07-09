#!/bin/bash

# Exit on error
set -e

echo "Building Canadian Cancer Society Donor Tracker Frontend..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Run tests
echo "Running tests..."
CI=true npm test

# Build for production
echo "Building for production..."
npm run build

echo "Build completed successfully!"
echo "The production build is available in the 'build' directory."
echo "You can deploy this directory to your hosting provider."
