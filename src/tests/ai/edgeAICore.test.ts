/**
 * Unit tests for Edge AI Operations Core (PATCH 223)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  EdgeAICore,
  edgeAICore,
  analyzeRoute,
  detectFailure,
  type ModelMetadata,
  type InferenceRequest
} from '@/ai/edge/edgeAICore';

describe('EdgeAICore', () => {
  let core: EdgeAICore;

  beforeEach(() => {
    core = new EdgeAICore();
  });

  describe('registerModel', () => {
    it('should register a model successfully', () => {
      const metadata: ModelMetadata = {
        id: 'test-model',
        name: 'Test Model',
        version: '1.0.0',
        format: 'onnx-lite',
        size: 1024 * 1024,
        inputShape: [1, 10],
        outputShape: [1, 5],
        taskType: 'classification',
        description: 'Test classification model'
      };

      core.registerModel(metadata);

      const models = core.listModels();
      expect(models).toHaveLength(1);
      expect(models[0]).toEqual(metadata);
    });
  });

  describe('loadModel', () => {
    it('should load a registered model', async () => {
      const metadata: ModelMetadata = {
        id: 'test-model',
        name: 'Test Model',
        version: '1.0.0',
        format: 'ggml',
        size: 1024 * 1024,
        inputShape: [1, 10],
        outputShape: [1, 5],
        taskType: 'routing',
        description: 'Test routing model'
      };

      core.registerModel(metadata);
      await core.loadModel('test-model');

      expect(core.getModelStatus('test-model')).toBe('loaded');
      expect(core.getLoadedModels()).toContain('test-model');
    });
  });

  describe('infer', () => {
    it('should run inference on a loaded model', async () => {
      const metadata: ModelMetadata = {
        id: 'test-model',
        name: 'Test Model',
        version: '1.0.0',
        format: 'onnx-lite',
        size: 1024 * 1024,
        inputShape: [1, 10],
        outputShape: [1, 10],
        taskType: 'classification',
        description: 'Test model'
      };

      core.registerModel(metadata);
      await core.loadModel('test-model');

      const request: InferenceRequest = {
        modelId: 'test-model',
        input: new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      };

      const result = await core.infer(request);

      expect(result).toBeDefined();
      expect(result.modelId).toBe('test-model');
      expect(result.output).toBeInstanceOf(Float32Array);
      expect(result.latency).toBeGreaterThan(0);
    });
  });
});

describe('Convenience functions', () => {
  describe('analyzeRoute', () => {
    it('should analyze route data', async () => {
      const routeData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = await analyzeRoute(routeData);

      expect(result).toBeDefined();
      expect(result.modelId).toBe('route-analyzer-v1');
    });
  });

  describe('detectFailure', () => {
    it('should detect failure from sensor data', async () => {
      const sensorData = [1.0, 0.5, 0.8, 1.2, 0.9];
      const result = await detectFailure(sensorData);

      expect(result).toBeDefined();
      expect(result.modelId).toBe('failure-detector-v1');
    });
  });
});

describe('edgeAICore singleton', () => {
  it('should export a singleton instance', () => {
    expect(edgeAICore).toBeDefined();
    expect(edgeAICore).toBeInstanceOf(EdgeAICore);
  });
});
