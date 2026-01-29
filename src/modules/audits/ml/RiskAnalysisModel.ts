/**
 * 🧠 Audit Risk Analysis Model - TensorFlow.js ML
 * NAUTILUS ONE v5.0 - Predictive Analytics
 * 
 * Machine learning model for audit risk prediction
 * with explainable AI (SHAP-like feature importance)
 */

import * as tf from '@tensorflow/tfjs';
import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';

export interface FeatureImpact {
  feature: string;
  value: number;
  impact: number;
  direction: 'increases' | 'decreases' | 'neutral';
  description: string;
}

export interface RiskPrediction {
  overallRisk: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  topRiskFactors: FeatureImpact[];
  confidence: number;
  recommendations: Recommendation[];
  modelVersion: string;
}

export interface Recommendation {
  factor: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  estimatedImpact: string;
  deadline?: Date;
}

export interface VesselRiskData {
  vesselAge: number;
  lastAuditScore: number;
  daysSinceLastAudit: number;
  crewTurnoverRate: number;
  maintenanceBacklog: number;
  certificateExpiries: number;
  incidentHistory: number;
  portStateInspections: number;
  flagStatePerformance: number;
  classificationScore: number;
}

const RISK_FACTORS = [
  { name: 'vesselAge', label: 'Vessel Age', weight: 0.12 },
  { name: 'lastAuditScore', label: 'Last Audit Score', weight: 0.18 },
  { name: 'daysSinceLastAudit', label: 'Days Since Last Audit', weight: 0.10 },
  { name: 'crewTurnoverRate', label: 'Crew Turnover Rate', weight: 0.08 },
  { name: 'maintenanceBacklog', label: 'Maintenance Backlog', weight: 0.14 },
  { name: 'certificateExpiries', label: 'Certificate Expiries', weight: 0.15 },
  { name: 'incidentHistory', label: 'Incident History', weight: 0.10 },
  { name: 'portStateInspections', label: 'Port State Inspections', weight: 0.05 },
  { name: 'flagStatePerformance', label: 'Flag State Performance', weight: 0.04 },
  { name: 'classificationScore', label: 'Classification Score', weight: 0.04 }
];

class AuditRiskAnalyzer {
  private model: tf.LayersModel | null = null;
  private isInitialized = false;

  /**
   * Initialize the model
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Try to load pre-trained model
      this.model = await this.loadOrTrainModel();
      this.isInitialized = true;
      logger.info('Audit Risk Model initialized');
    } catch (error) {
      logger.warn('Model initialization failed, using statistical fallback', { error });
      this.isInitialized = true;
    }
  }

  /**
   * Load existing model or train a new one
   */
  private async loadOrTrainModel(): Promise<tf.LayersModel> {
    try {
      // Check if model exists in IndexedDB
      const existingModel = await tf.loadLayersModel('indexeddb://audit-risk-model');
      logger.info('Loaded existing audit risk model');
      return existingModel;
    } catch {
      // Train new model
      logger.info('Training new audit risk model');
      return this.trainModel();
    }
  }

  /**
   * Train the neural network model
   */
  private async trainModel(): Promise<tf.LayersModel> {
    // Generate synthetic training data based on domain knowledge
    const trainingData = this.generateTrainingData(1000);
    
    const xs = tf.tensor2d(trainingData.features);
    const ys = tf.tensor2d(trainingData.labels);

    // Build neural network architecture
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ 
          inputShape: [10], 
          units: 64, 
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ 
          units: 32, 
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ 
          units: 16, 
          activation: 'relu' 
        }),
        tf.layers.dense({ 
          units: 1, 
          activation: 'sigmoid' 
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    // Train the model
    await model.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      verbose: 0,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            logger.debug(`Training epoch ${epoch}`, { 
              loss: logs?.loss?.toFixed(4), 
              accuracy: logs?.acc?.toFixed(4) 
            });
          }
        }
      }
    });

    // Save model to IndexedDB
    try {
      await model.save('indexeddb://audit-risk-model');
      logger.info('Audit risk model saved to IndexedDB');
    } catch (error) {
      logger.warn('Failed to save model to IndexedDB', { error });
    }

    // Cleanup tensors
    xs.dispose();
    ys.dispose();

    return model;
  }

  /**
   * Generate synthetic training data based on domain knowledge
   */
  private generateTrainingData(samples: number): { features: number[][]; labels: number[][] } {
    const features: number[][] = [];
    const labels: number[][] = [];

    for (let i = 0; i < samples; i++) {
      // Generate random vessel data
      const vesselAge = Math.random() * 30; // 0-30 years
      const lastAuditScore = 50 + Math.random() * 50; // 50-100
      const daysSinceLastAudit = Math.random() * 365; // 0-365 days
      const crewTurnoverRate = Math.random() * 50; // 0-50%
      const maintenanceBacklog = Math.floor(Math.random() * 20); // 0-20 tasks
      const certificateExpiries = Math.floor(Math.random() * 5); // 0-5 expiring
      const incidentHistory = Math.floor(Math.random() * 10); // 0-10 incidents
      const portStateInspections = Math.floor(Math.random() * 3); // 0-3 deficiencies
      const flagStatePerformance = 70 + Math.random() * 30; // 70-100
      const classificationScore = 80 + Math.random() * 20; // 80-100

      // Normalize features (0-1)
      const normalizedFeatures = [
        vesselAge / 30,
        (100 - lastAuditScore) / 50, // Invert so higher = worse
        daysSinceLastAudit / 365,
        crewTurnoverRate / 50,
        maintenanceBacklog / 20,
        certificateExpiries / 5,
        incidentHistory / 10,
        portStateInspections / 3,
        (100 - flagStatePerformance) / 30,
        (100 - classificationScore) / 20
      ];

      // Calculate risk based on weighted factors
      let riskScore = 0;
      normalizedFeatures.forEach((f, idx) => {
        riskScore += f * RISK_FACTORS[idx].weight;
      });

      // Add some noise
      riskScore += (Math.random() - 0.5) * 0.1;
      riskScore = Math.max(0, Math.min(1, riskScore));

      // Binary classification: high risk (>0.5) or low risk (<=0.5)
      const isHighRisk = riskScore > 0.5 ? 1 : 0;

      features.push(normalizedFeatures);
      labels.push([isHighRisk]);
    }

    return { features, labels };
  }

  /**
   * Normalize vessel data for model input
   */
  private normalizeVesselData(data: VesselRiskData): number[] {
    return [
      Math.min(data.vesselAge / 30, 1),
      Math.max(0, (100 - data.lastAuditScore) / 50),
      Math.min(data.daysSinceLastAudit / 365, 1),
      Math.min(data.crewTurnoverRate / 50, 1),
      Math.min(data.maintenanceBacklog / 20, 1),
      Math.min(data.certificateExpiries / 5, 1),
      Math.min(data.incidentHistory / 10, 1),
      Math.min(data.portStateInspections / 3, 1),
      Math.max(0, (100 - data.flagStatePerformance) / 30),
      Math.max(0, (100 - data.classificationScore) / 20)
    ];
  }

  /**
   * Predict risk using neural network
   */
  private async predictWithModel(features: number[]): Promise<number> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    const tensor = tf.tensor2d([features]);
    const prediction = this.model.predict(tensor) as tf.Tensor;
    const riskScore = (await prediction.data())[0];
    
    tensor.dispose();
    prediction.dispose();

    return riskScore;
  }

  /**
   * Statistical fallback prediction
   */
  private statisticalPrediction(features: number[]): number {
    let riskScore = 0;
    features.forEach((f, idx) => {
      riskScore += f * RISK_FACTORS[idx].weight;
    });
    return Math.max(0, Math.min(1, riskScore));
  }

  /**
   * Calculate feature importance (SHAP-like)
   */
  private async explainPrediction(
    features: number[], 
    baseRisk: number
  ): Promise<FeatureImpact[]> {
    const impacts: FeatureImpact[] = [];
    const baseline = new Array(features.length).fill(0.5);

    for (let i = 0; i < features.length; i++) {
      // Create modified feature set with only this feature changed
      const modified = [...baseline];
      modified[i] = features[i];

      let modifiedRisk: number;
      if (this.model) {
        modifiedRisk = await this.predictWithModel(modified);
      } else {
        modifiedRisk = this.statisticalPrediction(modified);
      }

      const baselineRisk = this.statisticalPrediction(baseline);
      const impact = Math.abs(modifiedRisk - baselineRisk);
      const direction = modifiedRisk > baselineRisk ? 'increases' : 
                        modifiedRisk < baselineRisk ? 'decreases' : 'neutral';

      impacts.push({
        feature: RISK_FACTORS[i].name,
        value: features[i],
        impact,
        direction,
        description: this.getFeatureDescription(RISK_FACTORS[i].name, features[i], direction)
      });
    }

    return impacts.sort((a, b) => b.impact - a.impact);
  }

  /**
   * Get human-readable description for feature impact
   */
  private getFeatureDescription(
    feature: string, 
    value: number, 
    direction: string
  ): string {
    const descriptions: Record<string, (v: number, d: string) => string> = {
      vesselAge: (v, d) => 
        `Vessel age of ${Math.round(v * 30)} years ${d} risk`,
      lastAuditScore: (v, d) => 
        `Previous audit score of ${Math.round(100 - v * 50)}% ${d} risk`,
      daysSinceLastAudit: (v, d) => 
        `${Math.round(v * 365)} days since last audit ${d} risk`,
      crewTurnoverRate: (v, d) => 
        `Crew turnover of ${Math.round(v * 50)}% ${d} risk`,
      maintenanceBacklog: (v, d) => 
        `${Math.round(v * 20)} pending maintenance tasks ${d} risk`,
      certificateExpiries: (v, d) => 
        `${Math.round(v * 5)} certificates expiring soon ${d} risk`,
      incidentHistory: (v, d) => 
        `${Math.round(v * 10)} incidents in history ${d} risk`,
      portStateInspections: (v, d) => 
        `${Math.round(v * 3)} PSC deficiencies ${d} risk`,
      flagStatePerformance: (v, d) => 
        `Flag state performance score ${d} risk`,
      classificationScore: (v, d) => 
        `Classification society score ${d} risk`
    };

    const descFn = descriptions[feature];
    return descFn ? descFn(value, direction) : `${feature} ${direction} risk`;
  }

  /**
   * Generate recommendations based on risk factors
   */
  private generateRecommendations(impacts: FeatureImpact[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    for (const impact of impacts) {
      if (impact.impact > 0.1 && impact.direction === 'increases') {
        const rec = this.getRecommendationForFactor(impact);
        if (rec) recommendations.push(rec);
      }
    }

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  /**
   * Get specific recommendation for a risk factor
   */
  private getRecommendationForFactor(impact: FeatureImpact): Recommendation | null {
    const actionMap: Record<string, Recommendation> = {
      vesselAge: {
        factor: 'Vessel Age',
        priority: 'medium',
        action: 'Schedule comprehensive structural inspection and modernization assessment',
        estimatedImpact: `Addresses ${Math.round(impact.impact * 100)}% of risk`
      },
      lastAuditScore: {
        factor: 'Previous Audit Performance',
        priority: 'high',
        action: 'Conduct gap analysis on previous audit findings and implement corrective actions',
        estimatedImpact: `Could improve score by ${Math.round(impact.value * 15)}%`
      },
      daysSinceLastAudit: {
        factor: 'Audit Frequency',
        priority: 'medium',
        action: 'Schedule internal audit within 30 days',
        estimatedImpact: 'Maintains compliance readiness'
      },
      crewTurnoverRate: {
        factor: 'Crew Stability',
        priority: 'medium',
        action: 'Review crew retention programs and ensure proper handover procedures',
        estimatedImpact: 'Improves operational continuity'
      },
      maintenanceBacklog: {
        factor: 'Maintenance Status',
        priority: 'high',
        action: 'Prioritize and clear critical maintenance items before audit',
        estimatedImpact: `Clear ${Math.round(impact.value * 20)} pending tasks`
      },
      certificateExpiries: {
        factor: 'Certification Status',
        priority: 'critical',
        action: 'Immediate renewal of expiring certificates',
        estimatedImpact: 'Critical compliance requirement'
      },
      incidentHistory: {
        factor: 'Safety Record',
        priority: 'high',
        action: 'Review incident investigation reports and verify corrective actions',
        estimatedImpact: 'Demonstrates safety commitment'
      },
      portStateInspections: {
        factor: 'Port State Control',
        priority: 'high',
        action: 'Address all outstanding PSC deficiencies',
        estimatedImpact: 'Reduces detention risk'
      },
      flagStatePerformance: {
        factor: 'Flag State Compliance',
        priority: 'medium',
        action: 'Review flag state requirements and update compliance documentation',
        estimatedImpact: 'Aligns with flag state standards'
      },
      classificationScore: {
        factor: 'Classification Status',
        priority: 'medium',
        action: 'Schedule class survey if overdue',
        estimatedImpact: 'Maintains class certification'
      }
    };

    return actionMap[impact.feature] || null;
  }

  /**
   * Categorize risk level
   */
  private categorizeRisk(score: number): RiskPrediction['riskLevel'] {
    if (score >= 0.75) return 'critical';
    if (score >= 0.50) return 'high';
    if (score >= 0.25) return 'medium';
    return 'low';
  }

  /**
   * Calculate confidence based on model performance
   */
  private calculateConfidence(features: number[]): number {
    // Base confidence
    let confidence = this.model ? 85 : 70;

    // Reduce confidence for extreme values
    const extremeCount = features.filter(f => f < 0.1 || f > 0.9).length;
    confidence -= extremeCount * 2;

    return Math.max(50, Math.min(95, confidence));
  }

  /**
   * Main prediction method
   */
  async predictRisk(vesselData: VesselRiskData): Promise<RiskPrediction> {
    await this.initialize();

    // Normalize input data
    const features = this.normalizeVesselData(vesselData);

    // Get risk score
    let riskScore: number;
    if (this.model) {
      riskScore = await this.predictWithModel(features);
    } else {
      riskScore = this.statisticalPrediction(features);
    }

    // Explain prediction
    const featureImportance = await this.explainPrediction(features, riskScore);

    // Generate recommendations
    const recommendations = this.generateRecommendations(featureImportance);

    return {
      overallRisk: Math.round(riskScore * 100),
      riskLevel: this.categorizeRisk(riskScore),
      topRiskFactors: featureImportance.slice(0, 5),
      confidence: this.calculateConfidence(features),
      recommendations,
      modelVersion: this.model ? 'TensorFlow.js Neural Network v1.0' : 'Statistical Fallback v1.0'
    };
  }

  /**
   * Predict risk for a vessel by ID
   */
  async predictRiskForVessel(vesselId: string): Promise<RiskPrediction> {
    // Fetch vessel data from database
    const { data: vessel } = await supabase
      .from('vessels')
      .select('*')
      .eq('id', vesselId)
      .maybeSingle();

    // Fetch related data
    const { data: lastAudit } = await supabase
      .from('peotram_audits')
      .select('compliance_score, audit_date')
      .eq('vessel_id', vesselId)
      .order('audit_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { count: maintenanceBacklog } = await supabase
      .from('maintenance_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('vessel_id', vesselId)
      .eq('status', 'pending');

    // Get incident count from action_items
    const { count: incidentCount } = await supabase
      .from('action_items')
      .select('*', { count: 'exact', head: true })
      .eq('vessel_id', vesselId)
      .eq('source_module', 'incident');

    const { count: expiringCerts } = await supabase
      .from('vessel_certificates')
      .select('*', { count: 'exact', head: true })
      .eq('vessel_id', vesselId)
      .lt('expiry_date', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString());

    // Calculate days since last audit
    const daysSinceLastAudit = lastAudit?.audit_date
      ? Math.floor((Date.now() - new Date(lastAudit.audit_date).getTime()) / (1000 * 60 * 60 * 24))
      : 365;

    // Build vessel risk data
    const vesselData: VesselRiskData = {
      vesselAge: 10, // Default age
      lastAuditScore: lastAudit?.compliance_score || 80,
      daysSinceLastAudit,
      crewTurnoverRate: 15, // Would come from crew module
      maintenanceBacklog: maintenanceBacklog || 0,
      certificateExpiries: expiringCerts || 0,
      incidentHistory: incidentCount || 0,
      portStateInspections: 0, // Would come from PSC data
      flagStatePerformance: 85,
      classificationScore: 90
    };

    return this.predictRisk(vesselData);
  }
}

export const auditRiskAnalyzer = new AuditRiskAnalyzer();
