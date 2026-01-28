/**
 * Edge AI - ONNX Runtime for Offline Inference
 * Run ML models locally on device without server calls
 */

import * as ort from 'onnxruntime-web';
import { logger } from '@/lib/logger';

export interface ModelConfig {
  name: string;
  path: string;
  inputShape: number[];
  outputShape: number[];
  labels?: string[];
}

export interface InferenceResult<T = unknown> {
  predictions: T;
  confidence: number;
  inferenceTime: number;
  modelName: string;
}

// Pre-configured models for maritime use cases
export const MARITIME_MODELS: Record<string, ModelConfig> = {
  crew_risk: {
    name: 'Crew Risk Assessment',
    path: '/models/crew-risk.onnx',
    inputShape: [1, 10], // 10 features
    outputShape: [1, 1], // risk score 0-1
    labels: ['low_risk', 'medium_risk', 'high_risk']
  },
  document_classification: {
    name: 'Document Classification',
    path: '/models/document-classifier.onnx',
    inputShape: [1, 512], // text embedding
    outputShape: [1, 15], // 15 document types
    labels: [
      'passport', 'seamans_book', 'coc', 'endorsement', 'medical_certificate',
      'stcw_certificate', 'contract', 'invoice', 'voyage_report', 'maintenance_log',
      'safety_drill_record', 'inspection_report', 'cargo_manifest', 'bill_of_lading', 'other'
    ]
  },
  maintenance_prediction: {
    name: 'Maintenance Prediction',
    path: '/models/maintenance-prediction.onnx',
    inputShape: [1, 20], // equipment features
    outputShape: [1, 4], // [failure_prob, days_to_failure, severity, confidence]
    labels: ['failure_probability', 'days_to_failure', 'severity', 'confidence']
  },
  compliance_risk: {
    name: 'Compliance Risk Score',
    path: '/models/compliance-risk.onnx',
    inputShape: [1, 15], // compliance features
    outputShape: [1, 3], // [risk_score, category, confidence]
    labels: ['risk_score', 'category', 'confidence']
  }
};

class ONNXRuntime {
  private sessions: Map<string, ort.InferenceSession> = new Map();
  private loadingPromises: Map<string, Promise<ort.InferenceSession>> = new Map();
  private isInitialized = false;

  /**
   * Initialize ONNX Runtime with WebGL/WASM backend
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Configure ONNX Runtime
      ort.env.wasm.wasmPaths = '/onnx/';
      
      // Try WebGL first (GPU acceleration), fallback to WASM
      const backends = ['webgl', 'wasm'];
      
      for (const backend of backends) {
        try {
          ort.env.wasm.numThreads = navigator.hardwareConcurrency || 4;
          logger.info(`ONNX Runtime initialized with ${backend} backend`);
          break;
        } catch (e) {
          logger.warn(`Failed to initialize ${backend} backend`, { error: e });
        }
      }

      this.isInitialized = true;
    } catch (error) {
      logger.error('Failed to initialize ONNX Runtime', error);
      throw error;
    }
  }

  /**
   * Load a model
   */
  async loadModel(modelKey: string): Promise<boolean> {
    const config = MARITIME_MODELS[modelKey];
    if (!config) {
      console.error(`Unknown model: ${modelKey}`);
      return false;
    }

    // Return existing session if already loaded
    if (this.sessions.has(modelKey)) {
      return true;
    }

    // Return existing loading promise if in progress
    if (this.loadingPromises.has(modelKey)) {
      await this.loadingPromises.get(modelKey);
      return true;
    }

    // Start loading
    const loadPromise = (async () => {
      try {
        await this.initialize();
        
        const session = await ort.InferenceSession.create(config.path, {
          executionProviders: ['webgl', 'wasm'],
          graphOptimizationLevel: 'all'
        });

        this.sessions.set(modelKey, session);
        logger.info(`ONNX model loaded: ${config.name}`);
        return session;
      } catch (error) {
        logger.error(`Failed to load ONNX model ${modelKey}`, { error });
        throw error;
      } finally {
        this.loadingPromises.delete(modelKey);
      }
    })();

    this.loadingPromises.set(modelKey, loadPromise);
    
    try {
      await loadPromise;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Run inference on a model
   */
  async infer<T = number[]>(
    modelKey: string,
    input: number[] | Float32Array
  ): Promise<InferenceResult<T> | null> {
    const config = MARITIME_MODELS[modelKey];
    if (!config) {
      console.error(`Unknown model: ${modelKey}`);
      return null;
    }

    // Load model if not already loaded
    const loaded = await this.loadModel(modelKey);
    if (!loaded) return null;

    const session = this.sessions.get(modelKey);
    if (!session) return null;

    try {
      const startTime = performance.now();

      // Prepare input tensor
      const inputData = input instanceof Float32Array ? input : new Float32Array(input);
      const inputTensor = new ort.Tensor('float32', inputData, config.inputShape);

      // Get input name from session
      const inputNames = session.inputNames;
      const feeds: Record<string, ort.Tensor> = {};
      feeds[inputNames[0]] = inputTensor;

      // Run inference
      const results = await session.run(feeds);

      const endTime = performance.now();
      const inferenceTime = endTime - startTime;

      // Get output
      const outputNames = session.outputNames;
      const outputTensor = results[outputNames[0]];
      const outputData = outputTensor.data as Float32Array;

      // Calculate confidence (max value for classification, direct value for regression)
      const predictions = Array.from(outputData);
      const confidence = predictions.length > 1 
        ? Math.max(...predictions)
        : predictions[0];

      return {
        predictions: predictions as T,
        confidence,
        inferenceTime,
        modelName: config.name
      };
    } catch (error) {
      console.error(`Inference failed for ${modelKey}:`, error);
      return null;
    }
  }

  /**
   * Assess crew risk using Edge AI
   */
  async assessCrewRisk(crewFeatures: {
    age: number;
    yearsExperience: number;
    certificationsCount: number;
    lastMedicalDays: number;
    voyagesCompleted: number;
    incidentCount: number;
    trainingScore: number;
    restHoursAvg: number;
    workHoursAvg: number;
    satisfactionScore: number;
  }): Promise<{
    riskLevel: 'low' | 'medium' | 'high';
    riskScore: number;
    factors: string[];
    confidence: number;
  } | null> {
    // Normalize features to 0-1 range
    const normalizedFeatures = [
      crewFeatures.age / 70, // max age 70
      crewFeatures.yearsExperience / 40, // max 40 years
      Math.min(crewFeatures.certificationsCount / 10, 1), // max 10 certs
      1 - Math.min(crewFeatures.lastMedicalDays / 730, 1), // 2 years max (invert - recent is better)
      Math.min(crewFeatures.voyagesCompleted / 50, 1), // max 50 voyages
      crewFeatures.incidentCount / 5, // max 5 incidents (more is worse)
      crewFeatures.trainingScore / 100, // 0-100 score
      crewFeatures.restHoursAvg / 12, // max 12 hours avg rest
      1 - (crewFeatures.workHoursAvg / 14), // max 14 hours (invert - less is better)
      crewFeatures.satisfactionScore / 10 // 0-10 score
    ];

    const result = await this.infer<number[]>('crew_risk', normalizedFeatures);
    
    if (!result) {
      // Fallback to simple heuristic if model not available
      return this.assessCrewRiskHeuristic(crewFeatures);
    }

    const riskScore = result.predictions[0];
    const riskLevel = riskScore < 0.3 ? 'low' : riskScore < 0.7 ? 'medium' : 'high';

    // Identify risk factors
    const factors: string[] = [];
    if (crewFeatures.lastMedicalDays > 365) factors.push('Medical exam due');
    if (crewFeatures.incidentCount > 2) factors.push('High incident history');
    if (crewFeatures.restHoursAvg < 8) factors.push('Insufficient rest hours');
    if (crewFeatures.trainingScore < 70) factors.push('Training needs improvement');
    if (crewFeatures.satisfactionScore < 5) factors.push('Low satisfaction score');

    return {
      riskLevel,
      riskScore,
      factors,
      confidence: result.confidence
    };
  }

  /**
   * Classify document using Edge AI
   */
  async classifyDocument(textEmbedding: number[]): Promise<{
    documentType: string;
    confidence: number;
    alternatives: { type: string; confidence: number }[];
  } | null> {
    const result = await this.infer<number[]>('document_classification', textEmbedding);
    
    if (!result) return null;

    const config = MARITIME_MODELS.document_classification;
    const predictions = result.predictions;
    
    // Sort predictions by confidence
    const sorted = predictions
      .map((conf, idx) => ({ type: config.labels![idx], confidence: conf }))
      .sort((a, b) => b.confidence - a.confidence);

    return {
      documentType: sorted[0].type,
      confidence: sorted[0].confidence,
      alternatives: sorted.slice(1, 4) // Top 3 alternatives
    };
  }

  /**
   * Predict maintenance needs
   */
  async predictMaintenance(equipmentFeatures: number[]): Promise<{
    failureProbability: number;
    daysToFailure: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    recommendation: string;
  } | null> {
    const result = await this.infer<number[]>('maintenance_prediction', equipmentFeatures);
    
    if (!result) return null;

    const [failureProb, daysToFailure, severityScore, confidence] = result.predictions;

    const severity = severityScore < 0.25 ? 'low' 
      : severityScore < 0.5 ? 'medium'
      : severityScore < 0.75 ? 'high' 
      : 'critical';

    let recommendation = '';
    if (failureProb > 0.8 && daysToFailure < 7) {
      recommendation = 'Immediate maintenance required';
    } else if (failureProb > 0.6 && daysToFailure < 14) {
      recommendation = 'Schedule maintenance within 1 week';
    } else if (failureProb > 0.4) {
      recommendation = 'Plan maintenance in next maintenance window';
    } else {
      recommendation = 'Equipment operating normally';
    }

    return {
      failureProbability: failureProb,
      daysToFailure: Math.round(daysToFailure * 30), // Convert to days
      severity,
      confidence,
      recommendation
    };
  }

  /**
   * Fallback heuristic when model not available
   */
  private assessCrewRiskHeuristic(features: {
    age: number;
    yearsExperience: number;
    certificationsCount: number;
    lastMedicalDays: number;
    voyagesCompleted: number;
    incidentCount: number;
    trainingScore: number;
    restHoursAvg: number;
    workHoursAvg: number;
    satisfactionScore: number;
  }): {
    riskLevel: 'low' | 'medium' | 'high';
    riskScore: number;
    factors: string[];
    confidence: number;
  } {
    let riskScore = 0;
    const factors: string[] = [];

    // Medical exam risk
    if (features.lastMedicalDays > 700) {
      riskScore += 0.25;
      factors.push('Medical exam overdue');
    } else if (features.lastMedicalDays > 365) {
      riskScore += 0.1;
      factors.push('Medical exam due soon');
    }

    // Incident history risk
    if (features.incidentCount > 3) {
      riskScore += 0.2;
      factors.push('High incident history');
    } else if (features.incidentCount > 1) {
      riskScore += 0.1;
      factors.push('Previous incidents recorded');
    }

    // Rest hours risk
    if (features.restHoursAvg < 7) {
      riskScore += 0.2;
      factors.push('Critically low rest hours');
    } else if (features.restHoursAvg < 10) {
      riskScore += 0.1;
      factors.push('Below recommended rest hours');
    }

    // Training score risk
    if (features.trainingScore < 60) {
      riskScore += 0.15;
      factors.push('Training improvement needed');
    } else if (features.trainingScore < 80) {
      riskScore += 0.05;
    }

    // Satisfaction risk (potential turnover)
    if (features.satisfactionScore < 4) {
      riskScore += 0.15;
      factors.push('Low crew satisfaction');
    } else if (features.satisfactionScore < 6) {
      riskScore += 0.05;
    }

    // Cap at 1.0
    riskScore = Math.min(riskScore, 1);

    return {
      riskLevel: riskScore < 0.3 ? 'low' : riskScore < 0.6 ? 'medium' : 'high',
      riskScore,
      factors,
      confidence: 0.7 // Lower confidence for heuristic
    };
  }

  /**
   * Check if a model is loaded
   */
  isModelLoaded(modelKey: string): boolean {
    return this.sessions.has(modelKey);
  }

  /**
   * Unload a model to free memory
   */
  async unloadModel(modelKey: string): Promise<void> {
    const session = this.sessions.get(modelKey);
    if (session) {
      // Note: ONNX.js doesn't have explicit dispose, but removing reference helps GC
      this.sessions.delete(modelKey);
    }
  }

  /**
   * Get loaded models
   */
  getLoadedModels(): string[] {
    return Array.from(this.sessions.keys());
  }
}

export const onnxRuntime = new ONNXRuntime();
