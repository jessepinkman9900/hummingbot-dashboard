#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Building Hummingbot Dashboard for NPM distribution   ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}\n"

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf npx-cli/dist-npm
mkdir -p npx-cli/dist-npm

# Build the frontend with production optimizations
echo -e "\n${YELLOW}📦 Building frontend with production optimizations...${NC}"
cd frontend
pnpm version patch
pnpm install --frozen-lockfile
NODE_ENV=production pnpm run build
cd ..

echo -e "${GREEN}✅ Frontend build complete${NC}"

# Copy built frontend to dist
echo -e "\n${YELLOW}📋 Copying frontend build...${NC}"
cp -r frontend/.next npx-cli/dist-npm/.next
cp -r frontend/public npx-cli/dist-npm/public
cp frontend/next.config.ts npx-cli/dist-npm/next.config.ts

# Copy source files that Next.js needs
mkdir -p npx-cli/dist-npm/src
cp -r frontend/src npx-cli/dist-npm/src

echo -e "${GREEN}✅ Files copied${NC}"

# Create the CLI structure
echo -e "\n${YELLOW}🔧 Creating CLI wrapper...${NC}"
mkdir -p npx-cli/dist-npm/bin
mkdir -p npx-cli/dist-npm/scripts

# Copy the CLI files from npx-cli template
cp npx-cli/bin/cli.js npx-cli/dist-npm/bin/cli.js
cp npx-cli/scripts/postinstall.js npx-cli/dist-npm/scripts/postinstall.js
chmod +x npx-cli/dist-npm/bin/cli.js
chmod +x npx-cli/dist-npm/scripts/postinstall.js

echo -e "${GREEN}✅ CLI wrapper created${NC}"

# Create package.json for npm with proper version
echo -e "\n${YELLOW}📝 Creating package.json...${NC}"
FRONTEND_VERSION=$(node -p "require('./frontend/package.json').version")

# Sync npx-cli package.json version with frontend version
echo -e "${YELLOW}🔄 Syncing npx-cli package version with frontend...${NC}"
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('npx-cli/package.json', 'utf8'));
pkg.version = '${FRONTEND_VERSION}';
fs.writeFileSync('npx-cli/package.json', JSON.stringify(pkg, null, 2));
"

# Copy the base package.json from npx-cli and update specific fields
cp npx-cli/package.json npx-cli/dist-npm/package.json

# Update version, repository URLs, and add src/ to files array
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('npx-cli/dist-npm/package.json', 'utf8'));
pkg.version = '${FRONTEND_VERSION}';
if (!pkg.files.includes('src/')) pkg.files.push('src/');
fs.writeFileSync('npx-cli/dist-npm/package.json', JSON.stringify(pkg, null, 2));
"

echo -e "${GREEN}✅ package.json created${NC}"

# Copy README from npx-cli template
echo -e "\n${YELLOW}📖 Copying README...${NC}"
cp npx-cli/README.md npx-cli/dist-npm/README.md

echo -e "${GREEN}✅ README created${NC}"

# Install production dependencies
echo -e "\n${YELLOW}📦 Installing production dependencies...${NC}"
cd npx-cli/dist-npm
pnpm install --production --silent
cd ../..

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Show package size
PACKAGE_SIZE=$(du -sh npx-cli/dist-npm | cut -f1)

echo -e "\n${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              ✅ Build Complete!                         ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}📦 Package size: ${PACKAGE_SIZE}${NC}"
echo -e "${GREEN}📁 Location: ./dist-npm/${NC}\n"

echo -e "${YELLOW}Next steps:${NC}\n"

echo -e "  ${CYAN}Test locally:${NC}"
echo -e "    cd npx-cli/dist-npm"
echo -e "    npm pack"
echo -e "    npx ./hummingbot-dashboard-${VERSION}.tgz\n"

echo -e "  ${CYAN}Publish to npm:${NC}"
echo -e "    cd npx-cli/dist-npm"
echo -e "    npm publish\n"

echo -e "  ${CYAN}Publish as beta:${NC}"
echo -e "    cd npx-cli/dist-npm"
echo -e "    npm publish --tag beta\n"

echo -e "${GREEN}🎉 Your Hummingbot Dashboard is ready for distribution!${NC}\n"