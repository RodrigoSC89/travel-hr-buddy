/**
 * OPFS (Origin Private File System) Manager
 * PATCH 850 - Armazenamento offline robusto com cache em camadas
 */

export interface OPFSFile {
  name: string;
  path: string;
  size: number;
  type: string;
  tier: "hot" | "warm" | "cold";
  lastAccessed: number;
  accessCount: number;
  priority: number;
  metadata?: Record<string, unknown>;
}

export interface TierConfig {
  maxSize: number; // bytes
  maxAge: number; // milliseconds
  priority: number;
}

export interface OPFSConfig {
  quotaBytes: number;
  tiers: {
    hot: TierConfig;
    warm: TierConfig;
    cold: TierConfig;
  };
}

const DEFAULT_CONFIG: OPFSConfig = {
  quotaBytes: 500 * 1024 * 1024, // 500MB default
  tiers: {
    hot: {
      maxSize: 50 * 1024 * 1024, // 50MB
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      priority: 3,
    },
    warm: {
      maxSize: 150 * 1024 * 1024, // 150MB
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      priority: 2,
    },
    cold: {
      maxSize: 300 * 1024 * 1024, // 300MB
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      priority: 1,
    },
  },
};

// File index stored in localStorage
const INDEX_KEY = "opfs_file_index";

class OPFSManager {
  private config: OPFSConfig;
  private fileIndex: Map<string, OPFSFile> = new Map();
  private rootHandle: FileSystemDirectoryHandle | null = null;
  private initialized = false;

  constructor(config: Partial<OPFSConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadIndex();
  }

  private loadIndex(): void {
    try {
      const stored = localStorage.getItem(INDEX_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.fileIndex = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error("Failed to load OPFS index:", error);
    }
  }

  private saveIndex(): void {
    try {
      const obj = Object.fromEntries(this.fileIndex);
      localStorage.setItem(INDEX_KEY, JSON.stringify(obj));
    } catch (error) {
      console.error("Failed to save OPFS index:", error);
    }
  }

  async init(): Promise<boolean> {
    if (this.initialized) return true;

    if (!("storage" in navigator) || !("getDirectory" in navigator.storage)) {
      console.warn("OPFS not supported in this browser");
      return false;
    }

    try {
      this.rootHandle = await navigator.storage.getDirectory();

      // Create tier directories
      for (const tier of ["hot", "warm", "cold"]) {
        await this.rootHandle.getDirectoryHandle(tier, { create: true });
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize OPFS:", error);
      return false;
    }
  }

  /**
   * Determine appropriate tier based on file characteristics
   */
  determineTier(file: { size: number; type: string; priority?: number }): "hot" | "warm" | "cold" {
    const priority = file.priority ?? 1;
    
    // High priority or small files go to hot
    if (priority >= 3 || file.size < 1024 * 1024) {
      return "hot";
    }
    
    // Medium priority or medium files go to warm
    if (priority >= 2 || file.size < 10 * 1024 * 1024) {
      return "warm";
    }
    
    // Everything else goes to cold
    return "cold";
  }

  /**
   * Store a file in OPFS
   */
  async storeFile(
    path: string,
    data: ArrayBuffer | Blob | string,
    options: {
      type?: string;
      tier?: "hot" | "warm" | "cold";
      priority?: number;
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<OPFSFile | null> {
    if (!this.initialized) {
      const success = await this.init();
      if (!success) return null;
    }

    try {
      // Convert data to ArrayBuffer
      let buffer: ArrayBuffer;
      if (data instanceof Blob) {
        buffer = await data.arrayBuffer();
      } else if (typeof data === "string") {
        buffer = new TextEncoder().encode(data).buffer;
      } else {
        buffer = data;
      }

      // Determine tier
      const tier = options.tier ?? this.determineTier({
        size: buffer.byteLength,
        type: options.type ?? "application/octet-stream",
        priority: options.priority,
      });

      // Check quota
      const tierUsage = await this.getTierUsage(tier);
      if (tierUsage + buffer.byteLength > this.config.tiers[tier].maxSize) {
        // Try to evict old files
        await this.evictOldFiles(tier, buffer.byteLength);
      }

      // Get tier directory
      const tierHandle = await this.rootHandle!.getDirectoryHandle(tier);
      
      // Create file
      const fileName = this.sanitizeFileName(path);
      const fileHandle = await tierHandle.getFileHandle(fileName, { create: true });
      
      // Write data
      const writable = await fileHandle.createWritable();
      await writable.write(buffer);
      await writable.close();

      // Update index
      const fileInfo: OPFSFile = {
        name: fileName,
        path,
        size: buffer.byteLength,
        type: options.type ?? "application/octet-stream",
        tier,
        lastAccessed: Date.now(),
        accessCount: 0,
        priority: options.priority ?? 1,
        metadata: options.metadata,
      };

      this.fileIndex.set(path, fileInfo);
      this.saveIndex();

      return fileInfo;
    } catch (error) {
      console.error("Failed to store file in OPFS:", error);
      return null;
    }
  }

  /**
   * Retrieve a file from OPFS
   */
  async getFile(path: string): Promise<ArrayBuffer | null> {
    if (!this.initialized) {
      const success = await this.init();
      if (!success) return null;
    }

    const fileInfo = this.fileIndex.get(path);
    if (!fileInfo) return null;

    try {
      const tierHandle = await this.rootHandle!.getDirectoryHandle(fileInfo.tier);
      const fileHandle = await tierHandle.getFileHandle(fileInfo.name);
      const file = await fileHandle.getFile();
      
      // Update access info
      fileInfo.lastAccessed = Date.now();
      fileInfo.accessCount++;
      this.fileIndex.set(path, fileInfo);
      this.saveIndex();

      // Promote to hotter tier if frequently accessed
      await this.maybePromoteTier(fileInfo);

      return await file.arrayBuffer();
    } catch (error) {
      console.error("Failed to retrieve file from OPFS:", error);
      return null;
    }
  }

  /**
   * Delete a file from OPFS
   */
  async deleteFile(path: string): Promise<boolean> {
    if (!this.initialized) {
      const success = await this.init();
      if (!success) return false;
    }

    const fileInfo = this.fileIndex.get(path);
    if (!fileInfo) return false;

    try {
      const tierHandle = await this.rootHandle!.getDirectoryHandle(fileInfo.tier);
      await tierHandle.removeEntry(fileInfo.name);
      
      this.fileIndex.delete(path);
      this.saveIndex();
      
      return true;
    } catch (error) {
      console.error("Failed to delete file from OPFS:", error);
      return false;
    }
  }

  /**
   * Get total usage for a tier
   */
  async getTierUsage(tier: "hot" | "warm" | "cold"): Promise<number> {
    let total = 0;
    for (const file of this.fileIndex.values()) {
      if (file.tier === tier) {
        total += file.size;
      }
    }
    return total;
  }

  /**
   * Get total OPFS usage
   */
  async getTotalUsage(): Promise<number> {
    let total = 0;
    for (const file of this.fileIndex.values()) {
      total += file.size;
    }
    return total;
  }

  /**
   * Evict old files from a tier to free space
   */
  private async evictOldFiles(tier: "hot" | "warm" | "cold", neededBytes: number): Promise<void> {
    const tierFiles = Array.from(this.fileIndex.values())
      .filter(f => f.tier === tier)
      .sort((a, b) => a.lastAccessed - b.lastAccessed);

    let freedBytes = 0;
    for (const file of tierFiles) {
      if (freedBytes >= neededBytes) break;
      
      const demoted = await this.demoteTier(file);
      if (demoted) {
        freedBytes += file.size;
      }
    }
  }

  /**
   * Promote file to hotter tier if frequently accessed
   */
  private async maybePromoteTier(file: OPFSFile): Promise<void> {
    if (file.tier === "hot") return;
    
    // Promote if accessed more than 5 times recently
    if (file.accessCount > 5) {
      const newTier = file.tier === "cold" ? "warm" : "hot";
      await this.moveTier(file, newTier);
    }
  }

  /**
   * Demote file to colder tier
   */
  private async demoteTier(file: OPFSFile): Promise<boolean> {
    if (file.tier === "cold") {
      // Already coldest, delete if too old
      const age = Date.now() - file.lastAccessed;
      if (age > this.config.tiers.cold.maxAge) {
        return await this.deleteFile(file.path);
      }
      return false;
    }

    const newTier = file.tier === "hot" ? "warm" : "cold";
    return await this.moveTier(file, newTier);
  }

  /**
   * Move file between tiers
   */
  private async moveTier(file: OPFSFile, newTier: "hot" | "warm" | "cold"): Promise<boolean> {
    try {
      const data = await this.getFile(file.path);
      if (!data) return false;

      await this.deleteFile(file.path);
      
      const result = await this.storeFile(file.path, data, {
        type: file.type,
        tier: newTier,
        priority: file.priority,
        metadata: file.metadata,
      });

      return result !== null;
    } catch (error) {
      console.error("Failed to move file between tiers:", error);
      return false;
    }
  }

  /**
   * List all files in a tier
   */
  listFiles(tier?: "hot" | "warm" | "cold"): OPFSFile[] {
    const files = Array.from(this.fileIndex.values());
    if (tier) {
      return files.filter(f => f.tier === tier);
    }
    return files;
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    totalUsed: number;
    quota: number;
    tiers: Record<"hot" | "warm" | "cold", { used: number; max: number; count: number }>;
    fileCount: number;
  }> {
    const totalUsed = await this.getTotalUsage();
    
    const tiers = {
      hot: { used: 0, max: this.config.tiers.hot.maxSize, count: 0 },
      warm: { used: 0, max: this.config.tiers.warm.maxSize, count: 0 },
      cold: { used: 0, max: this.config.tiers.cold.maxSize, count: 0 },
    };

    for (const file of this.fileIndex.values()) {
      tiers[file.tier].used += file.size;
      tiers[file.tier].count++;
    }

    return {
      totalUsed,
      quota: this.config.quotaBytes,
      tiers,
      fileCount: this.fileIndex.size,
    };
  }

  /**
   * Sanitize file name for OPFS
   */
  private sanitizeFileName(path: string): string {
    return path.replace(/[^a-zA-Z0-9.-]/g, "_");
  }

  /**
   * Check if OPFS is supported
   */
  static isSupported(): boolean {
    return "storage" in navigator && "getDirectory" in navigator.storage;
  }
}

// Singleton instance
export const opfsManager = new OPFSManager();

/**
 * React hook for OPFS operations
 */
export function useOPFS() {
  return {
    storeFile: opfsManager.storeFile.bind(opfsManager),
    getFile: opfsManager.getFile.bind(opfsManager),
    deleteFile: opfsManager.deleteFile.bind(opfsManager),
    listFiles: opfsManager.listFiles.bind(opfsManager),
    getStats: opfsManager.getStats.bind(opfsManager),
    isSupported: OPFSManager.isSupported,
  };
}
