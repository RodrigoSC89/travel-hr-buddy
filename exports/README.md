# Nautilus Deployment Exports

This directory contains exported Nautilus deployment packages created by the Offline Deployment Kit (PATCH 224).

## Directory Structure

```
exports/
├── nautilus-[name]-[timestamp].zip     # ZIP packages
├── nautilus-[name]-[timestamp].usb     # USB bootable images
└── nautilus-[name]-[timestamp].iso     # ISO images
```

## Package Contents

Each deployment package includes:

1. **Application Build**
   - Vite build output
   - All static assets
   - PWA service worker
   - Optimized bundles

2. **Local Database**
   - SQLite, Dexie, or IndexedDB schema
   - Essential data structures
   - Offline-capable storage

3. **AI Models** (if included)
   - Lightweight ONNX/GGML models
   - Edge AI inference capabilities
   - Offline operation support

4. **Manifest File**
   - Package metadata
   - Component inventory
   - System requirements
   - Checksums

## Usage

### Installing from ZIP
1. Extract the ZIP file
2. Open `app/index.html` in a web browser
3. Follow on-screen setup instructions

### Installing from USB
1. Write USB image to flash drive
2. Run `start.bat` (Windows) or `start.sh` (Linux/Mac)
3. Browser will open automatically

### Installing from ISO
1. Burn ISO to CD/DVD or mount virtually
2. Run installation script
3. Follow setup wizard

## Security

All packages support optional AES encryption for sensitive deployments.

## Support

For issues with deployment packages, contact the system administrator.
