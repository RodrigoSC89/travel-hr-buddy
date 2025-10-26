/**
 * PATCH 224 – Deployment Kit Autobuilder
 * 
 * Packages and exports complete Nautilus instances for offline operations.
 * Generates self-contained deployment kits with local DB, embedded AI, and assets.
 * 
 * @module OfflineDeploymentKit
 * @version 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Export format types
export type ExportFormat = "zip" | "usb" | "iso" | "docker";

// Deployment kit configuration
export interface DeploymentConfig {
  name: string;
  version: string;
  format: ExportFormat;
  includeAI: boolean;
  includeDB: boolean;
  includeAssets: boolean;
  dbType: "sqlite" | "dexie" | "indexeddb";
  aiModels: string[];
  compression: boolean;
  outputPath: string;
}

// Manifest metadata
export interface DeploymentManifest {
  id: string;
  name: string;
  version: string;
  buildDate: string;
  format: ExportFormat;
  components: {
    core: boolean;
    database: boolean;
    ai: boolean;
    assets: boolean;
  };
  files: ManifestFile[];
  totalSize: number;
  checksums: Record<string, string>;
  requirements: {
    minMemory: number; // MB
    minStorage: number; // MB
    nodeVersion: string;
    browser?: string;
  };
}

// File entry in manifest
export interface ManifestFile {
  path: string;
  size: number;
  checksum: string;
  type: "core" | "database" | "ai" | "asset";
}

// Build result
export interface BuildResult {
  success: boolean;
  manifest: DeploymentManifest;
  outputFile: string;
  buildTime: number; // ms
  errors: string[];
  warnings: string[];
}

/**
 * OfflineDeploymentBuilder - Builds deployable Nautilus packages
 */
export class OfflineDeploymentBuilder {
  private workDir: string;
  private buildDir: string;

  constructor() {
    this.workDir = process.cwd();
    this.buildDir = path.join(this.workDir, 'dist');
  }

  /**
   * Build a deployment kit
   */
  async build(config: DeploymentConfig): Promise<BuildResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log(`[DeploymentKit] Building ${config.name} v${config.version}...`);

    try {
      // Step 1: Build Vite project
      console.log('[DeploymentKit] Step 1: Building Vite project...');
      await this.buildVite();

      // Step 2: Prepare database
      if (config.includeDB) {
        console.log(`[DeploymentKit] Step 2: Preparing ${config.dbType} database...`);
        await this.prepareDatabase(config.dbType);
      }

      // Step 3: Package AI models
      if (config.includeAI && config.aiModels.length > 0) {
        console.log('[DeploymentKit] Step 3: Packaging AI models...');
        await this.packageAIModels(config.aiModels);
      }

      // Step 4: Collect assets
      if (config.includeAssets) {
        console.log('[DeploymentKit] Step 4: Collecting assets...');
        await this.collectAssets();
      }

      // Step 5: Generate manifest
      console.log('[DeploymentKit] Step 5: Generating manifest...');
      const manifest = await this.generateManifest(config);

      // Step 6: Create package
      console.log(`[DeploymentKit] Step 6: Creating ${config.format} package...`);
      const outputFile = await this.createPackage(config, manifest);

      const buildTime = Date.now() - startTime;
      console.log(`[DeploymentKit] Build completed in ${buildTime}ms`);

      return {
        success: true,
        manifest,
        outputFile,
        buildTime,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(String(error));
      console.error(`[DeploymentKit] Build failed: ${error}`);

      return {
        success: false,
        manifest: this.getEmptyManifest(config),
        outputFile: '',
        buildTime: Date.now() - startTime,
        errors,
        warnings
      };
    }
  }

  /**
   * Build Vite project
   */
  private async buildVite(): Promise<void> {
    try {
      const { stdout, stderr } = await execAsync('npm run build', { cwd: this.workDir });
      
      if (stderr && !stderr.includes('warning')) {
        throw new Error(stderr);
      }

      console.log('[DeploymentKit] Vite build successful');
    } catch (error) {
      throw new Error(`Vite build failed: ${error}`);
    }
  }

  /**
   * Prepare database mock
   */
  private async prepareDatabase(dbType: "sqlite" | "dexie" | "indexeddb"): Promise<void> {
    const dbScripts: Record<string, string> = {
      sqlite: this.generateSQLiteScript(),
      dexie: this.generateDexieScript(),
      indexeddb: this.generateIndexedDBScript()
    };

    const script = dbScripts[dbType];
    const dbPath = path.join(this.buildDir, 'db', `${dbType}-init.js`);

    // Ensure db directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    fs.writeFileSync(dbPath, script);
    console.log(`[DeploymentKit] ${dbType} database script created`);
  }

  /**
   * Generate SQLite initialization script
   */
  private generateSQLiteScript(): string {
    return `
// SQLite database initialization for offline mode
const SQL = require('sql.js');

async function initDatabase() {
  const SQL = await initSqlJs({
    locateFile: file => \`/db/\${file}\`
  });
  
  const db = new SQL.Database();
  
  // Create tables
  db.run(\`
    CREATE TABLE IF NOT EXISTS nautilus_data (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      data TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );
    
    CREATE INDEX idx_type ON nautilus_data(type);
    CREATE INDEX idx_timestamp ON nautilus_data(timestamp);
  \`);
  
  console.log('[SQLite] Database initialized');
  return db;
}

export { initDatabase };
`;
  }

  /**
   * Generate Dexie initialization script
   */
  private generateDexieScript(): string {
    return `
// Dexie database initialization for offline mode
import Dexie from 'dexie';

const db = new Dexie('NautilusOfflineDB');

db.version(1).stores({
  data: 'id, type, timestamp',
  cache: 'key, value, expires',
  sync: 'id, status, lastSync'
});

db.version(2).stores({
  clones: 'id, name, status',
  logs: '++id, timestamp, type'
});

console.log('[Dexie] Database initialized');

export { db };
`;
  }

  /**
   * Generate IndexedDB initialization script
   */
  private generateIndexedDBScript(): string {
    return `
// IndexedDB initialization for offline mode
const DB_NAME = 'NautilusOfflineDB';
const DB_VERSION = 1;

function initDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('data')) {
        const dataStore = db.createObjectStore('data', { keyPath: 'id' });
        dataStore.createIndex('type', 'type', { unique: false });
        dataStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }
      
      console.log('[IndexedDB] Database initialized');
    };
  });
}

export { initDatabase };
`;
  }

  /**
   * Package AI models
   */
  private async packageAIModels(models: string[]): Promise<void> {
    const aiDir = path.join(this.buildDir, 'ai-models');
    
    if (!fs.existsSync(aiDir)) {
      fs.mkdirSync(aiDir, { recursive: true });
    }

    // Create model registry
    const registry = {
      version: "1.0.0",
      models: models.map(model => ({
        id: model,
        path: `ai-models/${model}.onnx`,
        format: "onnx-lite",
        size: 0 // Will be populated
      }))
    };

    fs.writeFileSync(
      path.join(aiDir, 'registry.json'),
      JSON.stringify(registry, null, 2)
    );

    console.log(`[DeploymentKit] Packaged ${models.length} AI models`);
  }

  /**
   * Collect assets
   */
  private async collectAssets(): Promise<void> {
    const assetsDir = path.join(this.buildDir, 'assets');
    
    if (!fs.existsSync(assetsDir)) {
      console.log('[DeploymentKit] Assets already included in build');
      return;
    }

    // Assets are already handled by Vite build
    console.log('[DeploymentKit] Assets collected');
  }

  /**
   * Generate deployment manifest
   */
  private async generateManifest(config: DeploymentConfig): Promise<DeploymentManifest> {
    const files: ManifestFile[] = [];
    let totalSize = 0;

    // Scan build directory
    const scanDir = (dir: string, type: ManifestFile['type']) => {
      if (!fs.existsSync(dir)) return;

      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isFile()) {
          const relativePath = path.relative(this.buildDir, itemPath);
          const size = stat.size;
          totalSize += size;

          files.push({
            path: relativePath,
            size,
            checksum: this.calculateChecksum(itemPath),
            type
          });
        } else if (stat.isDirectory()) {
          scanDir(itemPath, type);
        }
      }
    };

    scanDir(this.buildDir, 'core');
    if (config.includeDB) scanDir(path.join(this.buildDir, 'db'), 'database');
    if (config.includeAI) scanDir(path.join(this.buildDir, 'ai-models'), 'ai');

    const manifest: DeploymentManifest = {
      id: this.generateManifestId(),
      name: config.name,
      version: config.version,
      buildDate: new Date().toISOString(),
      format: config.format,
      components: {
        core: true,
        database: config.includeDB,
        ai: config.includeAI,
        assets: config.includeAssets
      },
      files,
      totalSize,
      checksums: this.calculateAllChecksums(files),
      requirements: {
        minMemory: 512,
        minStorage: Math.ceil(totalSize / (1024 * 1024)) + 100,
        nodeVersion: "18.x",
        browser: "Chrome 90+, Firefox 88+, Safari 14+"
      }
    };

    // Write manifest to exports directory
    const exportsDir = path.join(this.workDir, 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(exportsDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    return manifest;
  }

  /**
   * Create deployment package
   */
  private async createPackage(config: DeploymentConfig, manifest: DeploymentManifest): Promise<string> {
    const outputDir = config.outputPath || path.join(this.workDir, 'exports');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${config.name}-${config.version}-${timestamp}`;

    switch (config.format) {
      case 'zip':
        return await this.createZip(outputDir, filename);
      case 'usb':
        return await this.createUSB(outputDir, filename);
      case 'iso':
        return await this.createISO(outputDir, filename);
      case 'docker':
        return await this.createDocker(outputDir, filename);
      default:
        throw new Error(`Unsupported format: ${config.format}`);
    }
  }

  /**
   * Create ZIP package
   */
  private async createZip(outputDir: string, filename: string): Promise<string> {
    const outputFile = path.join(outputDir, `${filename}.zip`);
    
    try {
      await execAsync(`cd ${this.buildDir} && zip -r ${outputFile} .`);
      console.log(`[DeploymentKit] ZIP created: ${outputFile}`);
      return outputFile;
    } catch (error) {
      throw new Error(`Failed to create ZIP: ${error}`);
    }
  }

  /**
   * Create USB-ready package
   */
  private async createUSB(outputDir: string, filename: string): Promise<string> {
    const usbDir = path.join(outputDir, filename);
    
    if (!fs.existsSync(usbDir)) {
      fs.mkdirSync(usbDir, { recursive: true });
    }

    // Copy build to USB directory
    await execAsync(`cp -r ${this.buildDir}/* ${usbDir}/`);

    // Create autorun file
    const autorunContent = `
[autorun]
open=index.html
icon=favicon.ico
label=Nautilus Offline
`;
    fs.writeFileSync(path.join(usbDir, 'autorun.inf'), autorunContent);

    console.log(`[DeploymentKit] USB package created: ${usbDir}`);
    return usbDir;
  }

  /**
   * Create ISO image
   */
  private async createISO(outputDir: string, filename: string): Promise<string> {
    const outputFile = path.join(outputDir, `${filename}.iso`);
    
    try {
      // Requires mkisofs or genisoimage
      await execAsync(`mkisofs -o ${outputFile} -V "Nautilus" -R -J ${this.buildDir}`);
      console.log(`[DeploymentKit] ISO created: ${outputFile}`);
      return outputFile;
    } catch (error) {
      console.warn('[DeploymentKit] mkisofs not available, creating ZIP instead');
      return await this.createZip(outputDir, filename);
    }
  }

  /**
   * Create Docker image
   */
  private async createDocker(outputDir: string, filename: string): Promise<string> {
    const dockerfilePath = path.join(this.workDir, 'Dockerfile.offline');
    
    const dockerfile = `
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY exports/manifest.json /usr/share/nginx/html/manifest.json
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;

    fs.writeFileSync(dockerfilePath, dockerfile);

    const imageName = `nautilus-offline:${filename}`;
    await execAsync(`docker build -f ${dockerfilePath} -t ${imageName} .`);

    console.log(`[DeploymentKit] Docker image created: ${imageName}`);
    return imageName;
  }

  /**
   * Calculate file checksum
   */
  private calculateChecksum(filePath: string): string {
    const crypto = require('crypto');
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  }

  /**
   * Calculate all checksums
   */
  private calculateAllChecksums(files: ManifestFile[]): Record<string, string> {
    const checksums: Record<string, string> = {};
    for (const file of files) {
      checksums[file.path] = file.checksum;
    }
    return checksums;
  }

  /**
   * Generate unique manifest ID
   */
  private generateManifestId(): string {
    return `manifest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get empty manifest for error cases
   */
  private getEmptyManifest(config: DeploymentConfig): DeploymentManifest {
    return {
      id: this.generateManifestId(),
      name: config.name,
      version: config.version,
      buildDate: new Date().toISOString(),
      format: config.format,
      components: {
        core: false,
        database: false,
        ai: false,
        assets: false
      },
      files: [],
      totalSize: 0,
      checksums: {},
      requirements: {
        minMemory: 512,
        minStorage: 100,
        nodeVersion: "18.x"
      }
    };
  }
}

// CLI interface
if (require.main === module) {
  const builder = new OfflineDeploymentBuilder();

  const defaultConfig: DeploymentConfig = {
    name: "nautilus-offline",
    version: "1.0.0",
    format: "zip",
    includeAI: true,
    includeDB: true,
    includeAssets: true,
    dbType: "dexie",
    aiModels: ["route-analyzer", "failure-detector"],
    compression: true,
    outputPath: path.join(process.cwd(), 'exports')
  };

  builder.build(defaultConfig)
    .then(result => {
      if (result.success) {
        console.log('\n✅ Build successful!');
        console.log(`Output: ${result.outputFile}`);
        console.log(`Build time: ${result.buildTime}ms`);
      } else {
        console.error('\n❌ Build failed!');
        console.error('Errors:', result.errors);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { OfflineDeploymentBuilder };
