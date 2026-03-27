#!/bin/bash
# Salmon HVAC - Safe Deployment Script
# This script ensures we only deploy to the correct Netlify site

set -e

# Configuration - MUST match .netlify-site
EXPECTED_SITE_ID="a9896567-7739-4354-be13-b04aad4e384f"
EXPECTED_SITE_NAME="salmon-hvac"
EXPECTED_URL="https://salmon-hvac.netlify.app"
EXPECTED_REPO="salmon-website"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "=============================================="
echo "  SALMON HVAC - SAFE DEPLOYMENT"
echo "=============================================="
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Change to project directory
cd "$PROJECT_DIR"

# Verify we're in the correct repository
CURRENT_REPO=$(basename -s .git $(git config --get remote.origin.url) 2>/dev/null || echo "unknown")
if [ "$CURRENT_REPO" != "$EXPECTED_REPO" ]; then
    echo -e "${RED}ERROR: Wrong repository!${NC}"
    echo "  Expected: $EXPECTED_REPO"
    echo "  Current:  $CURRENT_REPO"
    echo ""
    echo "Aborting deployment to prevent deploying to wrong site."
    exit 1
fi

# Check for .netlify-site file
if [ ! -f ".netlify-site" ]; then
    echo -e "${RED}ERROR: .netlify-site file not found!${NC}"
    echo "This file is required to verify correct deployment target."
    exit 1
fi

# Verify .netlify-site contains correct site ID
if ! grep -q "$EXPECTED_SITE_ID" .netlify-site; then
    echo -e "${RED}ERROR: Site ID mismatch in .netlify-site!${NC}"
    echo "This project should only deploy to: $EXPECTED_SITE_NAME"
    exit 1
fi

echo -e "${GREEN}✓ Repository verified: $CURRENT_REPO${NC}"
echo -e "${GREEN}✓ Site configuration verified${NC}"
echo ""
echo "Deploying to: $EXPECTED_URL"
echo "Site ID: $EXPECTED_SITE_ID"
echo ""

# Ask for confirmation unless --yes flag is passed
if [[ "$1" != "--yes" && "$1" != "-y" ]]; then
    read -p "Proceed with deployment? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi
fi

# Run the actual deployment with the correct site ID
echo ""
echo "Starting Netlify deployment..."
echo ""

netlify deploy --prod --site "$EXPECTED_SITE_ID"

echo ""
echo -e "${GREEN}=============================================="
echo "  DEPLOYMENT COMPLETE"
echo "=============================================="
echo ""
echo "  Site: $EXPECTED_URL"
echo "===============================================${NC}"
echo ""
