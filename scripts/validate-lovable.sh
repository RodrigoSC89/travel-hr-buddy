#!/bin/bash
echo "🔍 Validando build e preview do Nautilus One..."
npm run clean
npm run build
npx playwright test tests/preview.spec.ts
echo "✅ Lovable Preview Validation PASSED"
