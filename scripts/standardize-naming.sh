#!/bin/bash
# Naming Convention Standardization Script
# Nauti One v4.0
#
# Conventions:
# - Components: PascalCase (UserCard.tsx)
# - Hooks: camelCase with 'use' prefix (useAuth.ts)
# - Utils/Services: camelCase (formatDate.ts)
# - Types: PascalCase (User.ts)
# - Constants: UPPER_SNAKE_CASE
#
# Usage: ./scripts/standardize-naming.sh [--dry-run]

set -e

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "⚠️  DRY RUN MODE - No changes will be made"
fi

echo ""
echo "📝 Nauti One Naming Standardization"
echo "===================================="
echo ""

renamed_count=0

# Helper function to convert to PascalCase
to_pascal_case() {
  echo "$1" | sed -E 's/(^|[-_])([a-z])/\U\2/g' | sed -E 's/[-_]//g'
}

# Helper function to convert to camelCase
to_camel_case() {
  local pascal=$(to_pascal_case "$1")
  echo "${pascal,}"
}

# Helper function for renaming
rename_file() {
  local old_path="$1"
  local new_path="$2"
  
  if [ "$old_path" != "$new_path" ]; then
    if [ "$DRY_RUN" = true ]; then
      echo "  [DRY-RUN] $old_path -> $new_path"
    else
      mv "$old_path" "$new_path"
      echo "  ✓ $old_path -> $new_path"
    fi
    renamed_count=$((renamed_count + 1))
  fi
}

# 1. Check Components (PascalCase)
echo "🧩 Checking Components (PascalCase)..."

if [ -d "src/components" ]; then
  find src/components -name "*.tsx" -type f 2>/dev/null | while read file; do
    dir=$(dirname "$file")
    base=$(basename "$file" .tsx)
    
    # Skip index files
    if [ "$base" = "index" ]; then continue; fi
    
    # Convert to PascalCase
    pascal=$(to_pascal_case "$base")
    
    if [ "$base" != "$pascal" ]; then
      rename_file "$file" "$dir/$pascal.tsx"
    fi
  done
fi

# 2. Check Hooks (camelCase with 'use' prefix)
echo ""
echo "🪝 Checking Hooks (useXxx)..."

if [ -d "src/hooks" ]; then
  find src/hooks -name "*.ts" -o -name "*.tsx" 2>/dev/null | while read file; do
    dir=$(dirname "$file")
    ext="${file##*.}"
    base=$(basename "$file" ".$ext")
    
    # Skip index files
    if [ "$base" = "index" ]; then continue; fi
    
    # Ensure 'use' prefix
    if [[ ! "$base" =~ ^use ]]; then
      # Remove any existing prefix and add 'use'
      clean_name=$(echo "$base" | sed -E 's/^(hook-?|Hook)?//')
      camel=$(to_camel_case "$clean_name")
      new_name="use${camel^}"
      
      rename_file "$file" "$dir/$new_name.$ext"
    fi
  done
fi

# 3. Check Utils/Lib (camelCase)
echo ""
echo "🔧 Checking Utils (camelCase)..."

for util_dir in "src/lib" "src/utils" "src/services"; do
  if [ -d "$util_dir" ]; then
    find "$util_dir" -name "*.ts" -type f 2>/dev/null | while read file; do
      dir=$(dirname "$file")
      base=$(basename "$file" .ts)
      
      # Skip index files and type files
      if [ "$base" = "index" ] || [[ "$base" =~ \.types$ ]]; then continue; fi
      
      # Convert kebab-case to camelCase
      camel=$(to_camel_case "$base")
      
      if [ "$base" != "$camel" ]; then
        rename_file "$file" "$dir/$camel.ts"
      fi
    done
  fi
done

# 4. Check Types (PascalCase)
echo ""
echo "📋 Checking Types (PascalCase)..."

if [ -d "src/types" ]; then
  find src/types -name "*.ts" -type f 2>/dev/null | while read file; do
    dir=$(dirname "$file")
    base=$(basename "$file" .ts)
    
    # Skip index, database.types, and generated files
    if [ "$base" = "index" ] || [[ "$base" =~ \.types$ ]] || [[ "$base" =~ \.generated$ ]]; then
      continue
    fi
    
    # Convert to PascalCase
    pascal=$(to_pascal_case "$base")
    
    if [ "$base" != "$pascal" ]; then
      rename_file "$file" "$dir/$pascal.ts"
    fi
  done
fi

# 5. Check Pages (PascalCase)
echo ""
echo "📄 Checking Pages (PascalCase)..."

if [ -d "src/pages" ]; then
  find src/pages -name "*.tsx" -type f 2>/dev/null | while read file; do
    dir=$(dirname "$file")
    base=$(basename "$file" .tsx)
    
    # Skip index files
    if [ "$base" = "index" ]; then continue; fi
    
    # Convert to PascalCase
    pascal=$(to_pascal_case "$base")
    
    if [ "$base" != "$pascal" ]; then
      rename_file "$file" "$dir/$pascal.tsx"
    fi
  done
fi

# Summary
echo ""
echo "===================================="

if [ "$renamed_count" -eq 0 ]; then
  echo "✅ All files already follow naming conventions!"
else
  echo "📊 Renamed $renamed_count files"
  
  if [ "$DRY_RUN" = true ]; then
    echo ""
    echo "💡 Run without --dry-run to apply changes"
  else
    echo ""
    echo "⚠️  Remember to update imports in affected files!"
    echo "   Run: npm run lint -- --fix"
  fi
fi

echo ""
