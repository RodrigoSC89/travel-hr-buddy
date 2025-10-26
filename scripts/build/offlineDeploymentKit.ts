/**
 * Offline Deployment Kit Builder - PATCH 224
 * 
 * Gera pacotes offline autônomos do Nautilus
 * Inclui: Build Vite, DB local, AI embarcada
 * Formatos: .zip, .usb, .iso, Docker
 * 
 * @module tools/build/offlineDeploymentKit
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export type DeploymentFormat = 'zip' | 'usb' | 'iso' | 'docker';
export type DatabaseType = 'sqlite' | 'dexie' | 'pouchdb';

export interface DeploymentConfig {
  format: DeploymentFormat;
  includeAI: boolean;
  dbType: DatabaseType;
  includeModels?: string[];
  targetPlatform?: 'linux' | 'windows' | 'macos' | 'universal';
  compression?: 'none' | 'gzip' | 'brotli';
  outputDir?: string;
}

export interface DeploymentManifest {
  version: string;
  buildDate: string;
  format: DeploymentFormat;
  contents: {
    app: {
      files: number;
      size: number;
    };
    database: {
      type: DatabaseType;
      size: number;
    };
    ai: {
      included: boolean;
      models: string[];
      size: number;
    };
  };
  checksums: Record<string, string>;
  systemRequirements: {
    minMemory: string;
    minDisk: string;
    os: string[];
    browser?: string[];
  };
  installation: {
    steps: string[];
    notes: string[];
  };
}

export interface BuildResult {
  success: boolean;
  format: DeploymentFormat;
  outputPath: string;
  size: number;
  manifest: DeploymentManifest;
  duration: number;
  error?: string;
}

class OfflineDeploymentBuilder {
  private readonly VERSION = '1.0.0';
  private readonly BUILD_DIR = 'dist';
  private readonly EXPORT_DIR = 'exports';

  /**
   * Constrói o pacote de deployment
   */
  async build(config: DeploymentConfig): Promise<BuildResult> {
    const startTime = Date.now();
    
    console.log(`[DeploymentKit] Building ${config.format} package...`);
    
    try {
      // 1. Criar diretório de output
      const outputDir = config.outputDir || this.EXPORT_DIR;
      this.ensureDirectory(outputDir);

      // 2. Build da aplicação Vite
      console.log('[DeploymentKit] Building Vite application...');
      await this.buildViteApp();

      // 3. Preparar database offline
      console.log(`[DeploymentKit] Preparing ${config.dbType} database...`);
      const dbSize = await this.prepareDatabaseOffline(config.dbType, outputDir);

      // 4. Empacotar modelos de AI (se incluído)
      let aiSize = 0;
      const models: string[] = [];
      if (config.includeAI) {
        console.log('[DeploymentKit] Packaging AI models...');
        const aiResult = await this.packageAIModels(config.includeModels || [], outputDir);
        aiSize = aiResult.size;
        models.push(...aiResult.models);
      }

      // 5. Gerar manifest
      const manifest = this.generateManifest(config, dbSize, aiSize, models);

      // 6. Criar pacote no formato especificado
      console.log(`[DeploymentKit] Creating ${config.format} package...`);
      const outputPath = await this.createPackage(config, outputDir, manifest);

      const duration = Date.now() - startTime;
      const size = this.getFileSize(outputPath);

      const result: BuildResult = {
        success: true,
        format: config.format,
        outputPath,
        size,
        manifest,
        duration
      };

      console.log(`[DeploymentKit] Build complete: ${outputPath} (${this.formatSize(size)})`);
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('[DeploymentKit] Build failed:', error);
      
      return {
        success: false,
        format: config.format,
        outputPath: '',
        size: 0,
        manifest: {} as DeploymentManifest,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Build da aplicação Vite
   */
  private async buildViteApp(): Promise<void> {
    try {
      execSync('npm run build', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (error) {
      throw new Error('Vite build failed');
    }
  }

  /**
   * Prepara database para uso offline
   */
  private async prepareDatabaseOffline(
    dbType: DatabaseType,
    outputDir: string
  ): Promise<number> {
    const dbDir = path.join(outputDir, 'database');
    this.ensureDirectory(dbDir);

    // Mock database files
    const schemaFile = path.join(dbDir, 'schema.sql');
    const seedFile = path.join(dbDir, 'seed.sql');
    
    const schemaContent = this.generateDatabaseSchema(dbType);
    const seedContent = this.generateDatabaseSeed(dbType);

    fs.writeFileSync(schemaFile, schemaContent);
    fs.writeFileSync(seedFile, seedContent);

    // Gerar arquivo de configuração
    const configFile = path.join(dbDir, 'config.json');
    const config = {
      type: dbType,
      version: '1.0.0',
      autoMigrate: true,
      offlineFirst: true
    };
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

    return this.getDirectorySize(dbDir);
  }

  /**
   * Empacota modelos de AI
   */
  private async packageAIModels(
    modelIds: string[],
    outputDir: string
  ): Promise<{ size: number; models: string[] }> {
    const aiDir = path.join(outputDir, 'ai-models');
    this.ensureDirectory(aiDir);

    // Lista de modelos default se nenhum especificado
    const modelsToPackage = modelIds.length > 0 ? modelIds : [
      'route-analyzer-v1',
      'failure-detector-v1',
      'incident-classifier-v1'
    ];

    const packagedModels: string[] = [];

    for (const modelId of modelsToPackage) {
      // Mock - criar arquivo de modelo
      const modelFile = path.join(aiDir, `${modelId}.onnx`);
      const modelData = Buffer.from(`MOCK_MODEL_DATA_${modelId}`);
      fs.writeFileSync(modelFile, modelData);
      
      // Criar metadata
      const metaFile = path.join(aiDir, `${modelId}.meta.json`);
      const metadata = {
        id: modelId,
        format: 'onnx-lite',
        version: '1.0.0',
        size: modelData.length,
        quantization: 'int8'
      };
      fs.writeFileSync(metaFile, JSON.stringify(metadata, null, 2));
      
      packagedModels.push(modelId);
    }

    return {
      size: this.getDirectorySize(aiDir),
      models: packagedModels
    };
  }

  /**
   * Gera o manifest do deployment
   */
  private generateManifest(
    config: DeploymentConfig,
    dbSize: number,
    aiSize: number,
    models: string[]
  ): DeploymentManifest {
    const appSize = this.getDirectorySize(this.BUILD_DIR);
    const appFiles = this.countFiles(this.BUILD_DIR);

    return {
      version: this.VERSION,
      buildDate: new Date().toISOString(),
      format: config.format,
      contents: {
        app: {
          files: appFiles,
          size: appSize
        },
        database: {
          type: config.dbType,
          size: dbSize
        },
        ai: {
          included: config.includeAI,
          models,
          size: aiSize
        }
      },
      checksums: this.generateChecksums(),
      systemRequirements: {
        minMemory: config.includeAI ? '4GB' : '2GB',
        minDisk: this.formatSize(appSize + dbSize + aiSize + 500 * 1024 * 1024),
        os: this.getTargetOS(config.targetPlatform),
        browser: config.format === 'zip' ? ['Chrome 90+', 'Firefox 88+', 'Safari 14+'] : undefined
      },
      installation: {
        steps: this.generateInstallationSteps(config.format),
        notes: this.generateInstallationNotes(config)
      }
    };
  }

  /**
   * Cria o pacote no formato especificado
   */
  private async createPackage(
    config: DeploymentConfig,
    outputDir: string,
    manifest: DeploymentManifest
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `nautilus-offline-${config.format}-${timestamp}`;

    // Salvar manifest
    const manifestPath = path.join(outputDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    switch (config.format) {
      case 'zip':
        return this.createZipPackage(outputDir, filename);
      
      case 'usb':
        return this.createUSBPackage(outputDir, filename);
      
      case 'iso':
        return this.createISOPackage(outputDir, filename);
      
      case 'docker':
        return this.createDockerPackage(outputDir, filename);
      
      default:
        throw new Error(`Unsupported format: ${config.format}`);
    }
  }

  /**
   * Cria pacote ZIP
   */
  private createZipPackage(sourceDir: string, filename: string): string {
    const outputPath = path.join(sourceDir, `${filename}.zip`);
    
    // Mock - criar arquivo vazio
    fs.writeFileSync(outputPath, `ZIP_PACKAGE_${filename}`);
    
    console.log(`[DeploymentKit] ZIP package created: ${outputPath}`);
    return outputPath;
  }

  /**
   * Cria pacote USB
   */
  private createUSBPackage(sourceDir: string, filename: string): string {
    const outputPath = path.join(sourceDir, `${filename}.usb.img`);
    
    // Mock
    fs.writeFileSync(outputPath, `USB_IMAGE_${filename}`);
    
    console.log(`[DeploymentKit] USB image created: ${outputPath}`);
    return outputPath;
  }

  /**
   * Cria imagem ISO
   */
  private createISOPackage(sourceDir: string, filename: string): string {
    const outputPath = path.join(sourceDir, `${filename}.iso`);
    
    // Mock
    fs.writeFileSync(outputPath, `ISO_IMAGE_${filename}`);
    
    console.log(`[DeploymentKit] ISO image created: ${outputPath}`);
    return outputPath;
  }

  /**
   * Cria pacote Docker
   */
  private createDockerPackage(sourceDir: string, filename: string): string {
    const dockerDir = path.join(sourceDir, 'docker');
    this.ensureDirectory(dockerDir);

    // Criar Dockerfile
    const dockerfile = `
FROM node:18-alpine
WORKDIR /app
COPY dist ./dist
COPY database ./database
COPY ai-models ./ai-models
EXPOSE 3000
CMD ["npm", "start"]
    `.trim();
    
    fs.writeFileSync(path.join(dockerDir, 'Dockerfile'), dockerfile);
    
    // Criar docker-compose.yml
    const dockerCompose = `
version: '3.8'
services:
  nautilus:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
    `.trim();
    
    fs.writeFileSync(path.join(dockerDir, 'docker-compose.yml'), dockerCompose);

    console.log(`[DeploymentKit] Docker package created: ${dockerDir}`);
    return dockerDir;
  }

  // Métodos auxiliares

  private ensureDirectory(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private getFileSize(filePath: string): number {
    try {
      return fs.statSync(filePath).size;
    } catch {
      return 0;
    }
  }

  private getDirectorySize(dirPath: string): number {
    if (!fs.existsSync(dirPath)) return 0;
    
    let size = 0;
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        size += this.getDirectorySize(filePath);
      } else {
        size += stat.size;
      }
    }
    
    return size;
  }

  private countFiles(dirPath: string): number {
    if (!fs.existsSync(dirPath)) return 0;
    
    let count = 0;
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        count += this.countFiles(filePath);
      } else {
        count++;
      }
    }
    
    return count;
  }

  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  private generateDatabaseSchema(dbType: DatabaseType): string {
    return `-- ${dbType.toUpperCase()} Schema for Nautilus Offline
-- Version: 1.0.0

CREATE TABLE IF NOT EXISTS clone_registry (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  snapshot_data TEXT,
  user_id TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS edge_ai_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_id TEXT,
  task TEXT,
  backend TEXT,
  latency_ms REAL,
  success BOOLEAN,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS clone_sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT,
  target_id TEXT,
  operation TEXT,
  status TEXT,
  created_at TEXT
);
`;
  }

  private generateDatabaseSeed(dbType: DatabaseType): string {
    return `-- ${dbType.toUpperCase()} Seed Data
-- Initial data for offline operation

-- Add default configurations here
`;
  }

  private generateChecksums(): Record<string, string> {
    return {
      app: 'sha256:mock-checksum-app',
      database: 'sha256:mock-checksum-db',
      ai: 'sha256:mock-checksum-ai'
    };
  }

  private getTargetOS(platform?: string): string[] {
    switch (platform) {
      case 'linux': return ['Linux'];
      case 'windows': return ['Windows 10+'];
      case 'macos': return ['macOS 10.15+'];
      default: return ['Linux', 'Windows 10+', 'macOS 10.15+'];
    }
  }

  private generateInstallationSteps(format: DeploymentFormat): string[] {
    const steps: Record<DeploymentFormat, string[]> = {
      zip: [
        'Extract the ZIP file to desired location',
        'Open terminal in extracted directory',
        'Run: npm install',
        'Run: npm start',
        'Access at http://localhost:3000'
      ],
      usb: [
        'Insert USB drive',
        'Copy all files from USB to local directory',
        'Follow ZIP installation steps'
      ],
      iso: [
        'Mount ISO image',
        'Copy contents to local directory',
        'Follow ZIP installation steps'
      ],
      docker: [
        'Ensure Docker is installed',
        'Navigate to docker directory',
        'Run: docker-compose up -d',
        'Access at http://localhost:3000'
      ]
    };

    return steps[format];
  }

  private generateInstallationNotes(config: DeploymentConfig): string[] {
    const notes = [
      'This is an offline deployment package',
      'No internet connection required after installation'
    ];

    if (config.includeAI) {
      notes.push('AI models are included for local inference');
    }

    notes.push(`Database: ${config.dbType}`);

    return notes;
  }
}

// Export singleton instance
export const offlineDeploymentBuilder = new OfflineDeploymentBuilder();
