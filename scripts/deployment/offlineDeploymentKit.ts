/**
 * PATCH 224.0 - Deployment Kit Autobuilder
 * Packages and exports Nautilus instance operable without cloud
 * Generates packaging kit for offline missions (autonomous Nautilus instance)
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export type ExportFormat = 'zip' | 'usb' | 'iso';
export type DatabaseType = 'sqlite' | 'dexie' | 'indexeddb';

export interface DeploymentOptions {
  name: string;
  format: ExportFormat;
  includeAI: boolean;
  includeMaps: boolean;
  includeOfflineData: boolean;
  databaseType: DatabaseType;
  targetPlatform: 'web' | 'desktop' | 'mobile';
  compressionLevel: 'none' | 'low' | 'medium' | 'high';
  encryption?: {
    enabled: boolean;
    algorithm: 'aes-256' | 'aes-128';
  };
}

export interface DeploymentManifest {
  version: string;
  name: string;
  createdAt: string;
  platform: string;
  format: ExportFormat;
  size: number; // bytes
  checksum: string;
  components: {
    app: {
      version: string;
      buildTime: string;
      entryPoint: string;
    };
    database: {
      type: DatabaseType;
      size: number;
      tables: string[];
    };
    ai: {
      included: boolean;
      models?: string[];
      totalSize?: number;
    };
    assets: {
      count: number;
      size: number;
    };
  };
  capabilities: string[];
  offlineMode: boolean;
  requirements: {
    minimumMemory: string;
    minimumStorage: string;
    recommendedBrowser?: string;
  };
}

export interface BuildResult {
  success: boolean;
  outputPath: string;
  manifest: DeploymentManifest;
  errors?: string[];
  warnings?: string[];
  buildTime: number; // ms
}

class OfflineDeploymentKit {
  private buildDir = '/tmp/nautilus-build';
  private exportDir = '/exports';
  private distDir = 'dist';

  /**
   * Create offline deployment package
   */
  async createPackage(options: DeploymentOptions): Promise<BuildResult> {
    console.log('[DeploymentKit] Creating offline deployment package...');
    const startTime = Date.now();

    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Clean and prepare build directory
      await this.prepareBuildEnvironment();

      // Step 1: Build Vite application
      console.log('[DeploymentKit] Building Vite application...');
      await this.buildViteApp();

      // Step 2: Export and mock database
      console.log('[DeploymentKit] Setting up local database...');
      await this.setupLocalDatabase(options.databaseType);

      // Step 3: Package AI models if requested
      if (options.includeAI) {
        console.log('[DeploymentKit] Packaging AI models...');
        await this.packageAIModels();
      } else {
        warnings.push('AI models not included - limited offline functionality');
      }

      // Step 4: Package offline assets
      if (options.includeOfflineData) {
        console.log('[DeploymentKit] Packaging offline data...');
        await this.packageOfflineAssets(options.includeMaps);
      }

      // Step 5: Generate manifest
      console.log('[DeploymentKit] Generating manifest...');
      const manifest = await this.generateManifest(options);

      // Step 6: Create final package
      console.log('[DeploymentKit] Creating final package...');
      const outputPath = await this.createFinalPackage(options, manifest);

      const buildTime = Date.now() - startTime;

      console.log(`[DeploymentKit] Package created successfully in ${buildTime}ms`);
      console.log(`[DeploymentKit] Output: ${outputPath}`);

      return {
        success: true,
        outputPath,
        manifest,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        buildTime,
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      console.error('[DeploymentKit] Failed to create package:', error);

      return {
        success: false,
        outputPath: '',
        manifest: this.createEmptyManifest(options),
        errors,
        warnings: warnings.length > 0 ? warnings : undefined,
        buildTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Prepare build environment
   */
  private async prepareBuildEnvironment(): Promise<void> {
    // Clean build directory
    if (fs.existsSync(this.buildDir)) {
      fs.rmSync(this.buildDir, { recursive: true, force: true });
    }
    fs.mkdirSync(this.buildDir, { recursive: true });

    // Ensure export directory exists
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }

  /**
   * Build Vite application
   */
  private async buildViteApp(): Promise<void> {
    try {
      // Run Vite build
      execSync('npm run build', {
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: 'production',
          VITE_OFFLINE_MODE: 'true',
        },
      });

      // Copy dist to build directory
      this.copyDirectory(this.distDir, path.join(this.buildDir, 'app'));
    } catch (error) {
      throw new Error(`Vite build failed: ${error}`);
    }
  }

  /**
   * Setup local database
   */
  private async setupLocalDatabase(dbType: DatabaseType): Promise<void> {
    const dbDir = path.join(this.buildDir, 'database');
    fs.mkdirSync(dbDir, { recursive: true });

    switch (dbType) {
      case 'sqlite':
        await this.createSQLiteDB(dbDir);
        break;
      case 'dexie':
        await this.createDexieConfig(dbDir);
        break;
      case 'indexeddb':
        await this.createIndexedDBSchema(dbDir);
        break;
    }
  }

  /**
   * Create SQLite database
   */
  private async createSQLiteDB(dbDir: string): Promise<void> {
    const dbPath = path.join(dbDir, 'nautilus.db');
    
    // Create database schema
    const schema = `
      CREATE TABLE IF NOT EXISTS modules (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        active BOOLEAN DEFAULT 1,
        config TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_memory (
        id TEXT PRIMARY KEY,
        content TEXT,
        context TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `;

    fs.writeFileSync(path.join(dbDir, 'schema.sql'), schema);
    console.log('[DeploymentKit] SQLite schema created');
  }

  /**
   * Create Dexie configuration
   */
  private async createDexieConfig(dbDir: string): Promise<void> {
    const config = {
      name: 'NautilusOfflineDB',
      version: 1,
      stores: {
        modules: 'id, name, active, config',
        ai_memory: 'id, content, context, created_at',
        settings: 'key, value',
        cache: 'key, value, expires_at',
      },
    };

    fs.writeFileSync(
      path.join(dbDir, 'dexie-config.json'),
      JSON.stringify(config, null, 2)
    );
    console.log('[DeploymentKit] Dexie configuration created');
  }

  /**
   * Create IndexedDB schema
   */
  private async createIndexedDBSchema(dbDir: string): Promise<void> {
    const schema = {
      database: 'NautilusOffline',
      version: 1,
      objectStores: [
        {
          name: 'modules',
          keyPath: 'id',
          indexes: [
            { name: 'name', keyPath: 'name', unique: false },
            { name: 'active', keyPath: 'active', unique: false },
          ],
        },
        {
          name: 'ai_memory',
          keyPath: 'id',
          indexes: [
            { name: 'created_at', keyPath: 'created_at', unique: false },
          ],
        },
        {
          name: 'settings',
          keyPath: 'key',
        },
      ],
    };

    fs.writeFileSync(
      path.join(dbDir, 'indexeddb-schema.json'),
      JSON.stringify(schema, null, 2)
    );
    console.log('[DeploymentKit] IndexedDB schema created');
  }

  /**
   * Package AI models
   */
  private async packageAIModels(): Promise<void> {
    const aiDir = path.join(this.buildDir, 'ai');
    fs.mkdirSync(aiDir, { recursive: true });

    // Package lightweight models
    const models = [
      { name: 'route-optimizer.onnx', size: 5000000 },
      { name: 'failure-detector.ggml', size: 3000000 },
      { name: 'quick-response.tflite', size: 2000000 },
    ];

    const modelsList: string[] = [];

    for (const model of models) {
      const modelPath = path.join(aiDir, model.name);
      // TODO: In production, copy actual model files from source directory
      // For now, create placeholder files for development/testing only
      // Real implementation should use: fs.copyFileSync(sourceModelPath, modelPath);
      fs.writeFileSync(modelPath, Buffer.alloc(model.size));
      modelsList.push(model.name);
    }

    // Create models manifest
    fs.writeFileSync(
      path.join(aiDir, 'models.json'),
      JSON.stringify({ models: modelsList }, null, 2)
    );

    console.log(`[DeploymentKit] Packaged ${models.length} AI models`);
  }

  /**
   * Package offline assets
   */
  private async packageOfflineAssets(includeMaps: boolean): Promise<void> {
    const assetsDir = path.join(this.buildDir, 'assets');
    fs.mkdirSync(assetsDir, { recursive: true });

    // Copy essential assets
    if (fs.existsSync('public')) {
      this.copyDirectory('public', assetsDir);
    }

    // Package offline data
    const offlineData = {
      essentialData: true,
      timestamp: new Date().toISOString(),
      includeMaps,
    };

    fs.writeFileSync(
      path.join(assetsDir, 'offline-data.json'),
      JSON.stringify(offlineData, null, 2)
    );

    console.log('[DeploymentKit] Offline assets packaged');
  }

  /**
   * Generate deployment manifest
   */
  private async generateManifest(options: DeploymentOptions): Promise<DeploymentManifest> {
    const buildPath = this.buildDir;
    const totalSize = this.getDirectorySize(buildPath);

    const manifest: DeploymentManifest = {
      version: '1.0.0',
      name: options.name,
      createdAt: new Date().toISOString(),
      platform: options.targetPlatform,
      format: options.format,
      size: totalSize,
      checksum: this.calculateChecksum(buildPath),
      components: {
        app: {
          version: '1.0.0',
          buildTime: new Date().toISOString(),
          entryPoint: 'index.html',
        },
        database: {
          type: options.databaseType,
          size: this.getDirectorySize(path.join(buildPath, 'database')),
          tables: ['modules', 'ai_memory', 'settings'],
        },
        ai: {
          included: options.includeAI,
          models: options.includeAI ? ['route-optimizer', 'failure-detector', 'quick-response'] : undefined,
          totalSize: options.includeAI ? this.getDirectorySize(path.join(buildPath, 'ai')) : undefined,
        },
        assets: {
          count: this.countFiles(path.join(buildPath, 'assets')),
          size: this.getDirectorySize(path.join(buildPath, 'assets')),
        },
      },
      capabilities: [
        'offline_mode',
        'local_ai',
        'data_persistence',
        options.includeAI ? 'ai_inference' : null,
        options.includeMaps ? 'offline_maps' : null,
      ].filter(Boolean) as string[],
      offlineMode: true,
      requirements: {
        minimumMemory: '2GB',
        minimumStorage: `${Math.ceil(totalSize / (1024 * 1024 * 1024))}GB`,
        recommendedBrowser: 'Chrome 90+, Firefox 88+, Safari 14+',
      },
    };

    return manifest;
  }

  /**
   * Create final package
   */
  private async createFinalPackage(
    options: DeploymentOptions,
    manifest: DeploymentManifest
  ): Promise<string> {
    // Write manifest
    const manifestPath = path.join(this.buildDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    // Create output filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputName = `nautilus-${options.name}-${timestamp}`;
    const outputPath = path.join(this.exportDir, `${outputName}.${options.format}`);

    // Package based on format
    switch (options.format) {
      case 'zip':
        await this.createZipPackage(this.buildDir, outputPath);
        break;
      case 'usb':
        await this.createUSBImage(this.buildDir, outputPath);
        break;
      case 'iso':
        await this.createISOZipPackage(this.buildDir, outputPath);
        break;
    }

    return outputPath;
  }

  /**
   * Create ZIP package
   * Note: In production, consider using the 'archiver' npm package for safer ZIP creation
   */
  private async createZipPackage(sourceDir: string, outputPath: string): Promise<void> {
    try {
      // Escape paths to prevent command injection
      const escapedSourceDir = sourceDir.replace(/["'$`\\]/g, '\\$&');
      const escapedOutputPath = outputPath.replace(/["'$`\\]/g, '\\$&');
      
      execSync(`cd "${escapedSourceDir}" && zip -r "${escapedOutputPath}" .`, { stdio: 'inherit' });
      console.log('[DeploymentKit] ZIP package created');
    } catch (error) {
      throw new Error(`Failed to create ZIP package: ${error}`);
    }
  }

  /**
   * Create USB image
   */
  private async createUSBImage(sourceDir: string, outputPath: string): Promise<void> {
    // For USB, we create a bootable image with autorun
    const usbDir = `${sourceDir}-usb`;
    fs.mkdirSync(usbDir, { recursive: true });

    // Copy all files
    this.copyDirectory(sourceDir, usbDir);

    // Create autorun file
    const autorun = `[autorun]\nopen=start.bat\nicon=icon.ico`;
    fs.writeFileSync(path.join(usbDir, 'autorun.inf'), autorun);

    // Create start script with fallback browsers
    const startScript = `@echo off
echo Starting Nautilus...
where chrome.exe >nul 2>&1 && start chrome.exe --app=file:///%CD%/app/index.html && exit
where msedge.exe >nul 2>&1 && start msedge.exe --app=file:///%CD%/app/index.html && exit
where firefox.exe >nul 2>&1 && start firefox.exe -url file:///%CD%/app/index.html && exit
echo No suitable browser found. Please open app/index.html manually.
pause`;
    fs.writeFileSync(path.join(usbDir, 'start.bat'), startScript);

    // Create ZIP of USB contents
    await this.createZipPackage(usbDir, outputPath);
    
    // Clean up temp directory
    fs.rmSync(usbDir, { recursive: true, force: true });

    console.log('[DeploymentKit] USB image created');
  }

  /**
   * Create ISO image (currently creates ZIP package)
   * Note: True ISO creation requires system tools like mkisofs or genisoimage
   * TODO: Implement actual ISO creation with proper error handling:
   * - Check for mkisofs/genisoimage availability
   * - Use proper ISO 9660 filesystem format
   * - Add bootable sector if needed
   */
  private async createISOZipPackage(sourceDir: string, outputPath: string): Promise<void> {
    // For now, create a ZIP package as a fallback
    await this.createZipPackage(sourceDir, outputPath.replace('.iso', '.zip'));
    console.log('[DeploymentKit] ISO package created (as ZIP format)');
    console.log('[DeploymentKit] Warning: True ISO format not yet implemented');
    console.log('[DeploymentKit] Note: Use mkisofs or genisoimage for true ISO creation');
  }

  /**
   * Helper: Copy directory recursively
   */
  private copyDirectory(source: string, destination: string): void {
    if (!fs.existsSync(source)) return;

    fs.mkdirSync(destination, { recursive: true });

    const entries = fs.readdirSync(source, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * Helper: Get directory size
   */
  private getDirectorySize(dirPath: string): number {
    if (!fs.existsSync(dirPath)) return 0;

    let size = 0;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        size += this.getDirectorySize(fullPath);
      } else {
        size += fs.statSync(fullPath).size;
      }
    }

    return size;
  }

  /**
   * Helper: Count files in directory
   */
  private countFiles(dirPath: string): number {
    if (!fs.existsSync(dirPath)) return 0;

    let count = 0;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        count += this.countFiles(fullPath);
      } else {
        count++;
      }
    }

    return count;
  }

  /**
   * Helper: Calculate checksum
   * TODO: In production, implement proper SHA-256 hash for integrity verification
   * Consider using the 'crypto' module: crypto.createHash('sha256').update(data).digest('hex')
   */
  private calculateChecksum(dirPath: string): string {
    // Simplified checksum for development - NOT cryptographically secure
    const size = this.getDirectorySize(dirPath);
    const timestamp = Date.now();
    return `dev-${size}-${timestamp}`;
  }

  /**
   * Helper: Create empty manifest
   */
  private createEmptyManifest(options: DeploymentOptions): DeploymentManifest {
    return {
      version: '1.0.0',
      name: options.name,
      createdAt: new Date().toISOString(),
      platform: options.targetPlatform,
      format: options.format,
      size: 0,
      checksum: '',
      components: {
        app: { version: '', buildTime: '', entryPoint: '' },
        database: { type: options.databaseType, size: 0, tables: [] },
        ai: { included: false },
        assets: { count: 0, size: 0 },
      },
      capabilities: [],
      offlineMode: true,
      requirements: { minimumMemory: '', minimumStorage: '' },
    };
  }
}

// Export as default
export const offlineDeploymentKit = new OfflineDeploymentKit();
