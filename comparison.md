# Comparison: Old vs New Validation Script

## Key Differences

### 1. Location
- **Old**: `validate-lovable-preview.sh` (root directory)
- **New**: `scripts/validate-nautilus-preview.sh` (scripts directory)

### 2. Dependency Installation
- **Old**: `npm install`
- **New**: `npm ci || npm install` (faster, more deterministic)

### 3. Server Port
- **Old**: Uses dev server on port 8080 (`npm run dev`)
- **New**: Uses preview server on port 5173 (`npm run preview -- --port 5173`)

### 4. Wait Time
- **Old**: `sleep 10` (10 seconds)
- **New**: `sleep 15` (15 seconds)

### 5. Routes Tested
- **Old**: Missing root `/` route
- **New**: Includes root `/` route plus all others

### 6. Test Assertions
- **Old**: `expect(page).toHaveTitle(/Nautilus|DP|Forecast/i)`
- **New**: `expect(page.locator('main, header, h1')).toBeVisible({ timeout: 10000 })`

### 7. Vercel Build
- **Old**: Always tries to run (fails if not installed)
- **New**: Conditional with fallback message if CLI not installed

### 8. Error Handling
- **Old**: Kills server but may not clean up properly
- **New**: Ensures server is killed on test failure with explicit cleanup

## Side-by-Side Route Comparison

### Old Routes (10 routes)
```typescript
'/dashboard',
'/dp-intelligence',
'/bridgelink',
'/forecast-global',
'/control-hub',
'/fmea-expert',
'/peo-dp',
'/documentos-ia',
'/assistente-ia',
'/analytics-avancado'
```

### New Routes (11 routes)
```typescript
'/',                      // ← NEW
'/dashboard',
'/dp-intelligence',
'/bridgelink',
'/forecast-global',
'/control-hub',
'/fmea-expert',
'/peo-dp',
'/documentos-ia',
'/assistente-ia',
'/analytics-avancado'
```

## Improvements Summary

| Feature | Old | New | Benefit |
|---------|-----|-----|---------|
| Location | Root | scripts/ | Better organization |
| Install cmd | npm install | npm ci \|\| npm install | Faster, deterministic |
| Server | Dev (8080) | Preview (5173) | Matches production better |
| Wait time | 10s | 15s | More reliable |
| Root route | ❌ | ✅ | Complete coverage |
| Test method | Title check | Element visibility | More robust |
| Vercel CLI | Required | Optional | More flexible |
| Cleanup | Basic | Enhanced | Better reliability |

