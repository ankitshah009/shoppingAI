#!/bin/bash

# Script to rebuild and restart the frontend
echo "=== Rebuilding ShoppingAI Frontend ==="

# Navigate to frontend directory
cd frontend

# Clean node_modules and .next
echo "Cleaning build files..."
rm -rf node_modules
rm -rf .next
rm -rf package-lock.json

# Install dependencies
echo "Installing dependencies..."
npm install

# Force install Next.js
echo "Installing Next.js..."
npm install next@13.5.6 react@18.2.0 react-dom@18.2.0 --save

# Install specific Tailwind CSS dependencies
echo "Installing Tailwind CSS and required packages..."
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest

# Initialize Tailwind if needed
if [ ! -f tailwind.config.js ]; then
  echo "Initializing Tailwind CSS..."
  npx tailwindcss init -p
fi

# Fix potential ESLint issues
echo "Fixing ESLint configuration..."
npm install -D eslint@latest eslint-config-next@13.5.6

# Build the application
echo "Building the application..."
npm run build

# Start the application
echo "Starting the application..."
npm run dev

echo "Frontend restarted! Access at http://localhost:3000" 