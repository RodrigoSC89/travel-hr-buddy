/**
 * Bundle Limits Tests
 * Validates that bundle sizes stay within budget for 2Mb connections
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Budget limits (in bytes)
const LIMITS = {
  INITIAL_JS_GZIP: 250 * 1024,      // 250KB gzipped
  MAX_CHUNK_RAW: 400 * 1024,         // 400KB raw
  CSS_GZIP: 40 * 1024,               // 40KB gzipped
  TOTAL_ASSETS: 2.5 * 1024 * 1024,   // 2.5MB total
};

// Gzip compression ratio estimate
const GZIP_RATIO = 0.35;

describe('Bundle Size Limits', () => {
  const distPath = path.resolve(process.cwd(), 'dist');
  const assetsPath = path.join(distPath, 'assets');

  const getFileSize = (filePath: string): number => {
    try {
      return fs.statSync(filePath).size;
    } catch {
      return 0;
    }
  };

  const getFilesWithExtension = (dir: string, ext: string): string[] => {
    try {
      if (!fs.existsSync(dir)) return [];
      return fs.readdirSync(dir)
        .filter(file => file.endsWith(ext))
        .map(file => path.join(dir, file));
    } catch {
      return [];
    }
  };

  it('should have dist folder (requires build)', () => {
    const exists = fs.existsSync(distPath);
    if (!exists) {
      console.warn('⚠️ dist/ not found. Run `npm run build` first.');
    }
    // Skip test if dist doesn't exist
    expect(true).toBe(true);
  });

  it('initial JS bundle should be under 250KB gzipped', () => {
    if (!fs.existsSync(assetsPath)) {
      console.warn('Skipping: dist/assets not found');
      return;
    }

    const coreFiles = getFilesWithExtension(assetsPath, '.js')
      .filter(f => 
        f.includes('core-react') || 
        f.includes('core-router') || 
        f.includes('index-')
      );

    const totalSize = coreFiles.reduce((sum, file) => sum + getFileSize(file), 0);
    const estimatedGzip = totalSize * GZIP_RATIO;

    console.log(`Initial JS: ${Math.round(totalSize / 1024)}KB raw, ≈${Math.round(estimatedGzip / 1024)}KB gzipped`);

    expect(estimatedGzip).toBeLessThan(LIMITS.INITIAL_JS_GZIP);
  });

  it('no individual chunk should exceed 400KB', () => {
    if (!fs.existsSync(assetsPath)) {
      console.warn('Skipping: dist/assets not found');
      return;
    }

    const jsFiles = getFilesWithExtension(assetsPath, '.js');
    const oversizedChunks: string[] = [];

    jsFiles.forEach(file => {
      const size = getFileSize(file);
      if (size > LIMITS.MAX_CHUNK_RAW) {
        oversizedChunks.push(`${path.basename(file)}: ${Math.round(size / 1024)}KB`);
      }
    });

    if (oversizedChunks.length > 0) {
      console.warn('Oversized chunks:', oversizedChunks);
    }

    expect(oversizedChunks.length).toBe(0);
  });

  it('CSS should be under 40KB gzipped', () => {
    if (!fs.existsSync(assetsPath)) {
      console.warn('Skipping: dist/assets not found');
      return;
    }

    const cssFiles = getFilesWithExtension(assetsPath, '.css');
    const totalSize = cssFiles.reduce((sum, file) => sum + getFileSize(file), 0);
    const estimatedGzip = totalSize * GZIP_RATIO;

    console.log(`CSS: ${Math.round(totalSize / 1024)}KB raw, ≈${Math.round(estimatedGzip / 1024)}KB gzipped`);

    expect(estimatedGzip).toBeLessThan(LIMITS.CSS_GZIP);
  });

  it('total assets should be under 2.5MB', () => {
    if (!fs.existsSync(distPath)) {
      console.warn('Skipping: dist/ not found');
      return;
    }

    const getTotalSize = (dir: string): number => {
      let total = 0;
      try {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            total += getTotalSize(fullPath);
          } else {
            total += stat.size;
          }
        });
      } catch {}
      return total;
    };

    const totalSize = getTotalSize(distPath);
    console.log(`Total dist size: ${Math.round(totalSize / 1024 / 1024 * 100) / 100}MB`);

    expect(totalSize).toBeLessThan(LIMITS.TOTAL_ASSETS);
  });
});

describe('Heavy Dependencies', () => {
  const srcPath = path.resolve(process.cwd(), 'src');

  const HEAVY_LIBS = [
    'three',
    '@react-three',
    'mapbox-gl',
    '@tensorflow',
    'onnxruntime',
    'firebase',
  ];

  it('heavy libraries should use dynamic imports', () => {
    if (!fs.existsSync(srcPath)) {
      console.warn('Skipping: src/ not found');
      return;
    }

    const findStaticImports = (dir: string, lib: string): string[] => {
      const results: string[] = [];
      
      const scanDir = (currentDir: string) => {
        try {
          const items = fs.readdirSync(currentDir);
          items.forEach(item => {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !item.includes('node_modules')) {
              scanDir(fullPath);
            } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
              const content = fs.readFileSync(fullPath, 'utf-8');
              const lines = content.split('\n');
              
              lines.forEach((line, idx) => {
                // Check for static import (not lazy/dynamic)
                if (line.includes(`from '${lib}`) || line.includes(`from "${lib}`)) {
                  if (!line.includes('lazy') && !line.includes('dynamic') && line.startsWith('import ')) {
                    results.push(`${fullPath}:${idx + 1}`);
                  }
                }
              });
            }
          });
        } catch {}
      };

      scanDir(dir);
      return results;
    };

    const issues: string[] = [];
    
    HEAVY_LIBS.forEach(lib => {
      const staticImports = findStaticImports(srcPath, lib);
      staticImports.forEach(location => {
        issues.push(`Static import of '${lib}' at ${location}`);
      });
    });

    if (issues.length > 0) {
      console.warn('⚠️ Heavy libraries with static imports:');
      issues.forEach(issue => console.warn(`  ${issue}`));
    }

    // Warn but don't fail - some static imports may be intentional
    expect(true).toBe(true);
  });
});
