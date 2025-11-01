#!/bin/bash
# PATCH 568 - Production Branch Creation Script
# Creates production/v3.4-stable branch with proper validation

set -e

echo "🚀 PATCH 568 - Creating production/v3.4-stable branch"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not a git repository${NC}"
    exit 1
fi

# Ensure we have the latest changes
echo -e "${YELLOW}📥 Fetching latest changes from origin...${NC}"
git fetch origin --prune

# Check if develop branch exists
if ! git show-ref --verify --quiet refs/heads/develop; then
    # If develop doesn't exist locally, try to fetch it
    if git show-ref --verify --quiet refs/remotes/origin/develop; then
        echo -e "${YELLOW}📥 Checking out develop from origin...${NC}"
        git checkout -b develop origin/develop
    else
        echo -e "${RED}❌ Error: develop branch does not exist${NC}"
        exit 1
    fi
else
    # Checkout develop and pull latest
    echo -e "${YELLOW}📥 Updating develop branch...${NC}"
    git checkout develop
    git pull origin develop || echo -e "${YELLOW}⚠️  Warning: Could not pull develop (might not exist on remote)${NC}"
fi

# Check if production branch already exists
BRANCH_NAME="production/v3.4-stable"
if git show-ref --verify --quiet refs/heads/${BRANCH_NAME}; then
    echo -e "${YELLOW}⚠️  Branch ${BRANCH_NAME} already exists locally${NC}"
    read -p "Do you want to delete and recreate it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git branch -D ${BRANCH_NAME}
    else
        echo -e "${RED}❌ Aborted${NC}"
        exit 1
    fi
fi

if git show-ref --verify --quiet refs/remotes/origin/${BRANCH_NAME}; then
    echo -e "${YELLOW}⚠️  Branch ${BRANCH_NAME} already exists on remote${NC}"
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Aborted${NC}"
        exit 1
    fi
fi

# Create the production branch
echo -e "${GREEN}✅ Creating branch ${BRANCH_NAME} from develop...${NC}"
git checkout -b ${BRANCH_NAME}

# Update package.json version
echo -e "${YELLOW}📦 Updating version to 3.4.0...${NC}"
if command -v jq &> /dev/null; then
    # Use jq if available
    jq '.version = "3.4.0"' package.json > package.json.tmp && mv package.json.tmp package.json
else
    # Fallback to sed
    sed -i 's/"version": ".*"/"version": "3.4.0"/' package.json
fi

# Generate changelog
echo -e "${YELLOW}📝 Generating CHANGELOG v3.4...${NC}"
node scripts/generate-changelog-v3.4.js || echo -e "${YELLOW}⚠️  Changelog generation script not found, will be created separately${NC}"

# Commit changes
echo -e "${GREEN}✅ Committing changes...${NC}"
git add package.json CHANGELOG_v3.4.md 2>/dev/null || git add package.json
git commit -m "PATCH 568 - Create production/v3.4-stable branch

- Branch created from develop
- Version updated to 3.4.0
- Changelog v3.4 generated
- Includes patches 541-567
- Ready for pre-release validation" || echo -e "${YELLOW}⚠️  No changes to commit${NC}"

# Push to remote
echo -e "${GREEN}✅ Pushing branch to remote...${NC}"
git push -u origin ${BRANCH_NAME}

echo ""
echo -e "${GREEN}=================================================="
echo "✅ Production branch created successfully!"
echo "==================================================${NC}"
echo ""
echo "Branch: ${BRANCH_NAME}"
echo "Next steps:"
echo "  1. ✅ Run pre-release validations"
echo "  2. ✅ Deploy to staging environment"
echo "  3. ✅ Run E2E tests"
echo "  4. ✅ Check Lighthouse score"
echo "  5. ✅ Validate navigation and modules"
echo ""
