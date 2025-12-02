#!/bin/bash
# PATCH 652 - Phase 4: Bundle Analysis Script
# Analyzes bundle size and generates report

echo "🔍 PATCH 652 - Bundle Size Analysis"
echo "===================================="
echo ""

# 1. Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf .vite-cache

# 2. Build with source maps for analysis
echo "⚙️ Building production bundle..."
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# 3. Calculate total bundle size
echo ""
echo "📊 Bundle Size Report"
echo "====================="
total_size=$(du -sh dist | cut -f1)
echo "Total dist size: $total_size"

# 4. Calculate JS bundle sizes
echo ""
echo "JavaScript Bundles:"
echo "-------------------"
find dist/assets -name "*.js" -type f -exec du -h {} \; | sort -rh | head -20

# 5. Calculate CSS bundle sizes
echo ""
echo "CSS Bundles:"
echo "------------"
find dist/assets -name "*.css" -type f -exec du -h {} \;

# 6. Count total files
echo ""
echo "File Count:"
echo "-----------"
js_count=$(find dist/assets -name "*.js" -type f | wc -l)
css_count=$(find dist/assets -name "*.css" -type f | wc -l)
echo "JavaScript files: $js_count"
echo "CSS files: $css_count"

# 7. Check for large files (>500KB)
echo ""
echo "⚠️  Large Files (>500KB):"
echo "========================"
find dist/assets -type f -size +500k -exec du -h {} \; | sort -rh

# 8. Gzipped sizes estimation
echo ""
echo "📦 Estimated Gzipped Sizes:"
echo "==========================="
for file in $(find dist/assets -name "*.js" -type f -size +100k); do
  original=$(du -h "$file" | cut -f1)
  gzipped=$(gzip -c "$file" | wc -c | awk '{printf "%.1fK", $1/1024}')
  echo "$(basename "$file"): $original → ~$gzipped (gzipped)"
done

echo ""
echo "✅ Analysis complete!"
echo ""
echo "📝 Recommendations:"
echo "==================="
echo "1. Check for files >500KB and consider code splitting"
echo "2. Verify lazy loading is working for heavy modules"
echo "3. Target: <500KB gzipped for initial load"
echo "4. Use 'npx vite-bundle-visualizer' for detailed analysis"
