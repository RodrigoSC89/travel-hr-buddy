# Visual Regression Test Snapshots

This directory contains visual regression test snapshots for UI validation across different screen resolutions.

## Resolutions Tested
- Mobile Small: 320x568
- Mobile Medium: 375x667  
- Mobile Large: 414x896
- Tablet: 768x1024
- Desktop Small: 1024x768
- Desktop Medium: 1366x768
- Desktop Large: 1440x900
- Desktop XL: 1920x1080

## Running Tests
```bash
npm run test:e2e -- visual-regression.spec.ts
```

## Updating Snapshots
```bash
npm run test:e2e -- visual-regression.spec.ts --update-snapshots
```

