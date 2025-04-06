#!/bin/bash

# Script to fix Next.js build issues
echo "=== Fixing Next.js Build for ShoppingAI ==="

# Stop and remove existing containers
echo "Stopping and removing existing containers..."
docker-compose down

# Remove node_modules volume
echo "Removing node_modules volume..."
docker volume rm $(docker volume ls -q | grep frontend_node_modules) 2>/dev/null || true

# Clean frontend build files
echo "Cleaning frontend build files..."
cd frontend
rm -rf node_modules
rm -rf .next
rm -rf package-lock.json

# Update package.json to latest Next.js version
echo "Updating package.json..."
cat > package.json << 'EOL'
{
  "name": "shoppingai-frontend",
  "version": "0.1.0",
  "description": "Frontend for ShoppingAI: AI-Powered Shopping Assistant",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "axios": "^1.6.2",
    "next": "^13.5.6",
    "node-fetch": "^3.3.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-markdown": "^8.0.7",
    "remark-gfm": "^3.0.1",
    "swr": "^2.2.4"
  },
  "devDependencies": {
    "@tailwindcss/forms": "^0.5.7",
    "@tailwindcss/typography": "^0.5.10",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-config-next": "^13.5.6",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6"
  }
}
EOL

# Install dependencies locally first
echo "Installing dependencies locally..."
npm install

# Build locally to test
echo "Testing build locally..."
npm run build

# Rebuild the Docker containers
echo "Rebuilding Docker containers..."
cd ..
docker-compose build --no-cache frontend

echo "=== Fix completed ==="
echo "To start the application, run: docker-compose up" 