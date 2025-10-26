/**
 * Unit tests for Cognitive Clone Core (PATCH 221)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  CognitiveCloneManager,
  cognitiveCloneManager,
  type ModuleConfig,
  type CloneContext
} from '@/core/clones/cognitiveClone';

describe('CognitiveCloneManager', () => {
  let manager: CognitiveCloneManager;
  
  beforeEach(() => {
    manager = new CognitiveCloneManager();
    // Clear localStorage
    localStorage.clear();
  });

  describe('createSnapshot', () => {
    it('should create a snapshot with valid configuration', async () => {
      const modules: ModuleConfig[] = [
        { name: 'mmi', version: '1.0.0', enabled: true, config: {} },
        { name: 'dp-intelligence', version: '1.0.0', enabled: true, config: {} }
      ];

      const context: CloneContext = {
        operationalMode: 'tactical',
        contextWindow: 2048,
        activeModules: ['mmi', 'dp-intelligence'],
        lastSync: new Date().toISOString()
      };

      const snapshot = await manager.createSnapshot('Test Clone', modules, context);

      expect(snapshot).toBeDefined();
      expect(snapshot.name).toBe('Test Clone');
      expect(snapshot.version).toBe('1.0.0');
      expect(snapshot.modules).toEqual(modules);
      expect(snapshot.context).toEqual(context);
      expect(snapshot.status).toBe('inactive');
      expect(snapshot.llmConfig).toBeDefined();
    });

    it('should generate unique snapshot IDs', async () => {
      const modules: ModuleConfig[] = [];
      const context: CloneContext = {
        operationalMode: 'strategic',
        contextWindow: 1024,
        activeModules: [],
        lastSync: new Date().toISOString()
      };

      const snapshot1 = await manager.createSnapshot('Clone 1', modules, context);
      const snapshot2 = await manager.createSnapshot('Clone 2', modules, context);

      expect(snapshot1.id).not.toBe(snapshot2.id);
    });
  });

  describe('cloneInstance', () => {
    it('should clone an instance from a snapshot', async () => {
      const modules: ModuleConfig[] = [
        { name: 'test', version: '1.0.0', enabled: true, config: {} }
      ];

      const context: CloneContext = {
        operationalMode: 'tactical',
        contextWindow: 2048,
        activeModules: ['test'],
        lastSync: new Date().toISOString()
      };

      const snapshot = await manager.createSnapshot('Test', modules, context);
      const cloneId = await manager.cloneInstance(snapshot.id, 'local', 'user123');

      expect(cloneId).toBeDefined();
      expect(cloneId).toMatch(/^clone_/);

      const clone = manager.getClone(cloneId);
      expect(clone).toBeDefined();
      expect(clone?.createdBy).toBe('user123');
      expect(clone?.snapshot.status).toBe('active');
    });

    it('should throw error when snapshot not found', async () => {
      await expect(
        manager.cloneInstance('invalid-id', 'local', 'user123')
      ).rejects.toThrow('Snapshot not found');
    });
  });

  describe('getClone and listClones', () => {
    it('should retrieve a clone by ID', async () => {
      const modules: ModuleConfig[] = [];
      const context: CloneContext = {
        operationalMode: 'autonomous',
        contextWindow: 512,
        activeModules: [],
        lastSync: new Date().toISOString()
      };

      const snapshot = await manager.createSnapshot('Test', modules, context);
      const cloneId = await manager.cloneInstance(snapshot.id, 'local', 'user123');

      const clone = manager.getClone(cloneId);
      expect(clone).toBeDefined();
      expect(clone?.cloneId).toBe(cloneId);
    });

    it('should list all clones', async () => {
      const modules: ModuleConfig[] = [];
      const context: CloneContext = {
        operationalMode: 'tactical',
        contextWindow: 1024,
        activeModules: [],
        lastSync: new Date().toISOString()
      };

      const snapshot = await manager.createSnapshot('Test', modules, context);
      await manager.cloneInstance(snapshot.id, 'local', 'user1');
      await manager.cloneInstance(snapshot.id, 'local', 'user2');

      const clones = manager.listClones();
      expect(clones).toHaveLength(2);
    });
  });

  describe('updateCloneStatus', () => {
    it('should update clone status', async () => {
      const modules: ModuleConfig[] = [];
      const context: CloneContext = {
        operationalMode: 'tactical',
        contextWindow: 1024,
        activeModules: [],
        lastSync: new Date().toISOString()
      };

      const snapshot = await manager.createSnapshot('Test', modules, context);
      const cloneId = await manager.cloneInstance(snapshot.id, 'local', 'user123');

      await manager.updateCloneStatus(cloneId, 'syncing');

      const clone = manager.getClone(cloneId);
      expect(clone?.snapshot.status).toBe('syncing');
    });

    it('should throw error for non-existent clone', async () => {
      await expect(
        manager.updateCloneStatus('invalid-id', 'active')
      ).rejects.toThrow('Clone not found');
    });
  });

  describe('deleteClone', () => {
    it('should delete a clone', async () => {
      const modules: ModuleConfig[] = [];
      const context: CloneContext = {
        operationalMode: 'tactical',
        contextWindow: 1024,
        activeModules: [],
        lastSync: new Date().toISOString()
      };

      const snapshot = await manager.createSnapshot('Test', modules, context);
      const cloneId = await manager.cloneInstance(snapshot.id, 'local', 'user123');

      expect(manager.getClone(cloneId)).toBeDefined();

      await manager.deleteClone(cloneId);

      expect(manager.getClone(cloneId)).toBeUndefined();
    });
  });

  describe('exportClone and importClone', () => {
    it('should export a clone as Blob', async () => {
      const modules: ModuleConfig[] = [];
      const context: CloneContext = {
        operationalMode: 'tactical',
        contextWindow: 1024,
        activeModules: [],
        lastSync: new Date().toISOString()
      };

      const snapshot = await manager.createSnapshot('Test', modules, context);
      const cloneId = await manager.cloneInstance(snapshot.id, 'local', 'user123');

      const blob = await manager.exportClone(cloneId);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json');
    });

    it('should import a clone from JSON', async () => {
      const modules: ModuleConfig[] = [];
      const context: CloneContext = {
        operationalMode: 'tactical',
        contextWindow: 1024,
        activeModules: [],
        lastSync: new Date().toISOString()
      };

      const snapshot = await manager.createSnapshot('Test', modules, context);
      const cloneId = await manager.cloneInstance(snapshot.id, 'local', 'user123');

      const blob = await manager.exportClone(cloneId);
      // Read blob as text using FileReader or text() if available
      const text = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsText(blob);
      });

      const newCloneId = await manager.importClone(text, 'user456');

      expect(newCloneId).toBeDefined();
      expect(newCloneId).not.toBe(cloneId);

      const newClone = manager.getClone(newCloneId);
      expect(newClone?.createdBy).toBe('user456');
    });

    it('should throw error for invalid import data', async () => {
      await expect(
        manager.importClone('invalid json', 'user123')
      ).rejects.toThrow('Invalid clone data');
    });
  });

  describe('syncClone', () => {
    it('should sync a clone successfully', async () => {
      const modules: ModuleConfig[] = [];
      const context: CloneContext = {
        operationalMode: 'tactical',
        contextWindow: 1024,
        activeModules: [],
        lastSync: new Date().toISOString()
      };

      const snapshot = await manager.createSnapshot('Test', modules, context);
      const cloneId = await manager.cloneInstance(snapshot.id, 'local', 'user123');

      await manager.syncClone(cloneId);

      const clone = manager.getClone(cloneId);
      expect(clone?.syncStatus.syncPercentage).toBe(100);
      expect(clone?.snapshot.status).toBe('active');
    });

    it('should throw error for non-existent clone', async () => {
      await expect(
        manager.syncClone('invalid-id')
      ).rejects.toThrow('Clone not found');
    });
  });

  describe('localStorage persistence', () => {
    it('should persist clone to localStorage', async () => {
      const modules: ModuleConfig[] = [];
      const context: CloneContext = {
        operationalMode: 'tactical',
        contextWindow: 1024,
        activeModules: [],
        lastSync: new Date().toISOString()
      };

      const snapshot = await manager.createSnapshot('Test', modules, context);
      const cloneId = await manager.cloneInstance(snapshot.id, 'local', 'user123');

      const key = `nautilus_clone_${cloneId}`;
      const stored = localStorage.getItem(key);

      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.cloneId).toBe(cloneId);
    });

    it('should load clone from localStorage', async () => {
      const modules: ModuleConfig[] = [];
      const context: CloneContext = {
        operationalMode: 'tactical',
        contextWindow: 1024,
        activeModules: [],
        lastSync: new Date().toISOString()
      };

      const snapshot = await manager.createSnapshot('Test', modules, context);
      const cloneId = await manager.cloneInstance(snapshot.id, 'local', 'user123');

      // Create new manager to simulate fresh load
      const newManager = new CognitiveCloneManager();
      const loaded = await newManager.loadClone(cloneId);

      expect(loaded).toBeDefined();
      expect(loaded?.cloneId).toBe(cloneId);
    });

    it('should return null for non-existent clone in localStorage', async () => {
      const loaded = await manager.loadClone('non-existent-id');
      expect(loaded).toBeNull();
    });
  });
});

describe('cognitiveCloneManager singleton', () => {
  it('should export a singleton instance', () => {
    expect(cognitiveCloneManager).toBeDefined();
    expect(cognitiveCloneManager).toBeInstanceOf(CognitiveCloneManager);
  });
});
