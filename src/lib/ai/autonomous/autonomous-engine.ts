/**
 * Autonomous Decision Engine
 * Core autonomous operations loop
 * NAUTILUS ONE v4.0 - Autonomous Platform
 */

import { agentOrchestrator, type Situation, type Decision } from './agent-orchestrator';
import { vesselDigitalTwin, type VesselState, type Anomaly } from './digital-twin';
import { BlockchainComplianceLedger } from '@/lib/blockchain/compliance-ledger';

const blockchainLedger = new BlockchainComplianceLedger();

export interface AutonomousConfig {
  enabled: boolean;
  loopIntervalMs: number;
  maxAutonomyLevel: 0 | 1 | 2 | 3;
  criticalAlertThreshold: number;
  autoExecuteNonCritical: boolean;
  requireApprovalFor: string[];
}

export interface SystemStatus {
  engineStatus: 'running' | 'paused' | 'stopped';
  lastTick: Date | null;
  tickCount: number;
  decisionsThisSession: number;
  anomaliesDetected: number;
  averageDecisionTime: number;
  uptime: number;
}

/**
 * Autonomous Decision Engine
 * Main loop for autonomous vessel management
 */
export class AutonomousDecisionEngine {
  private config: AutonomousConfig = {
    enabled: false,
    loopIntervalMs: 5000,
    maxAutonomyLevel: 2,
    criticalAlertThreshold: 0.8,
    autoExecuteNonCritical: true,
    requireApprovalFor: ['emergency', 'route-change', 'crew-dismissal']
  };

  private loopInterval: ReturnType<typeof setInterval> | null = null;
  private status: SystemStatus = {
    engineStatus: 'stopped',
    lastTick: null,
    tickCount: 0,
    decisionsThisSession: 0,
    anomaliesDetected: 0,
    averageDecisionTime: 0,
    uptime: 0
  };
  private startTime: Date | null = null;
  private decisionTimes: number[] = [];
  private listeners: Map<string, ((data: unknown) => void)[]> = new Map();

  /**
   * Initialize the autonomous engine
   */
  async initialize(vesselId: string, vesselName: string): Promise<void> {
    console.log('[AutonomousEngine] Initializing...');
    
    // Initialize digital twin
    await vesselDigitalTwin.initialize(vesselId, vesselName);
    
    // Setup event listeners
    this.setupEventListeners();
    
    console.log('[AutonomousEngine] Initialized');
    this.emit('initialized', { vesselId, vesselName });
  }

  /**
   * Start the autonomous loop
   */
  start(): void {
    if (this.loopInterval) {
      console.warn('[AutonomousEngine] Already running');
      return;
    }

    this.config.enabled = true;
    this.startTime = new Date();
    this.status.engineStatus = 'running';

    // Start digital twin simulation
    vesselDigitalTwin.startSimulation(this.config.loopIntervalMs);

    // Start autonomous loop
    this.loopInterval = setInterval(() => {
      this.autonomousTick();
    }, this.config.loopIntervalMs);

    console.log('[AutonomousEngine] Started');
    this.emit('started', this.status);
  }

  /**
   * Pause the autonomous loop
   */
  pause(): void {
    this.status.engineStatus = 'paused';
    this.emit('paused', this.status);
  }

  /**
   * Resume the autonomous loop
   */
  resume(): void {
    this.status.engineStatus = 'running';
    this.emit('resumed', this.status);
  }

  /**
   * Stop the autonomous loop
   */
  stop(): void {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }

    vesselDigitalTwin.stopSimulation();

    this.config.enabled = false;
    this.status.engineStatus = 'stopped';

    console.log('[AutonomousEngine] Stopped');
    this.emit('stopped', this.status);
  }

  /**
   * Single autonomous tick
   */
  private async autonomousTick(): Promise<void> {
    if (this.status.engineStatus !== 'running') return;

    const tickStart = Date.now();
    this.status.tickCount++;
    this.status.lastTick = new Date();
    
    if (this.startTime) {
      this.status.uptime = Date.now() - this.startTime.getTime();
    }

    try {
      // 1. Get current state from digital twin
      const state = vesselDigitalTwin.getState();
      if (!state) return;

      // 2. Get anomalies
      const anomalies = vesselDigitalTwin.getAnomalies();
      const newAnomalies = anomalies.slice(-10); // Last 10
      this.status.anomaliesDetected += newAnomalies.length;

      // 3. Analyze situation
      const situation = this.analyzeSituation(state, newAnomalies);

      // 4. If situation requires action, get multi-agent decision
      if (situation.requiresImmediate || situation.priority !== 'low') {
        const decisionStart = Date.now();
        const decision = await agentOrchestrator.handleSituation(situation);
        const decisionTime = Date.now() - decisionStart;
        
        this.decisionTimes.push(decisionTime);
        this.status.averageDecisionTime = this.decisionTimes.reduce((a, b) => a + b, 0) / this.decisionTimes.length;
        this.status.decisionsThisSession++;

        // 5. Record in blockchain
        await this.recordToBlockchain(decision);

        this.emit('decision', decision);
      }

      // 6. Update context for agents
      agentOrchestrator.updateContext({
        vesselId: state.vesselId,
        vesselName: state.vesselName,
        position: state.position,
        fuelStatus: {
          current: state.fuelOnBoard,
          percentage: (state.fuelOnBoard / state.initialFuel) * 100
        },
        crewStatus: {
          avgFatigue: state.crew.reduce((acc, c) => acc + c.fatigue, 0) / state.crew.length,
          onDuty: state.crew.filter(c => c.status === 'on-duty').length
        },
        equipmentStatus: {
          avgHealth: state.equipment.reduce((acc, e) => acc + e.health, 0) / state.equipment.length,
          critical: state.equipment.filter(e => e.status === 'critical').length
        },
        complianceStatus: state.compliance,
        alerts: newAnomalies
      });

    } catch (error) {
      console.error('[AutonomousEngine] Tick error:', error);
      this.emit('error', error);
    }

    const tickDuration = Date.now() - tickStart;
    this.emit('tick', { 
      tickCount: this.status.tickCount, 
      duration: tickDuration 
    });
  }

  /**
   * Analyze current situation
   */
  private analyzeSituation(state: VesselState, anomalies: Anomaly[]): Situation {
    // Determine situation type based on anomalies
    let type = 'routine-monitoring';
    let priority: Situation['priority'] = 'low';
    let riskLevel: Situation['riskLevel'] = 'low';
    let requiresImmediate = false;
    let description = 'Monitoramento de rotina - sem anomalias detectadas';

    if (anomalies.length > 0) {
      const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
      
      if (criticalAnomalies.length > 0) {
        type = criticalAnomalies[0].type;
        priority = 'critical';
        riskLevel = 'critical';
        requiresImmediate = true;
        description = criticalAnomalies.map(a => a.description).join('; ');
      } else {
        type = anomalies[0].type;
        priority = 'medium';
        riskLevel = 'medium';
        description = anomalies.map(a => a.description).join('; ');
      }
    }

    // Check compliance
    if (state.compliance.overallScore < 90) {
      type = 'compliance';
      priority = state.compliance.overallScore < 80 ? 'high' : 'medium';
      riskLevel = state.compliance.overallScore < 80 ? 'high' : 'medium';
      description = `Score de compliance em ${state.compliance.overallScore}% - ${state.compliance.openItems} items abertos`;
    }

    // Check fuel
    const fuelPercent = (state.fuelOnBoard / state.initialFuel) * 100;
    if (fuelPercent < 15) {
      type = 'fuel';
      priority = fuelPercent < 10 ? 'critical' : 'high';
      riskLevel = fuelPercent < 10 ? 'critical' : 'high';
      requiresImmediate = fuelPercent < 10;
      description = `Combustível baixo: ${fuelPercent.toFixed(1)}%`;
    }

    // Check crew fatigue
    const avgFatigue = state.crew.reduce((acc, c) => acc + c.fatigue, 0) / state.crew.length;
    if (avgFatigue > 70) {
      type = 'crew';
      priority = avgFatigue > 85 ? 'critical' : 'high';
      riskLevel = avgFatigue > 85 ? 'critical' : 'high';
      description = `Fadiga média da tripulação: ${avgFatigue.toFixed(1)}%`;
    }

    return {
      id: crypto.randomUUID(),
      type,
      priority,
      riskLevel,
      description,
      context: {
        vesselId: state.vesselId,
        vesselName: state.vesselName,
        position: state.position,
        timestamp: new Date()
      },
      timestamp: new Date(),
      requiresImmediate
    };
  }

  /**
   * Record decision to blockchain
   */
  private async recordToBlockchain(decision: Decision): Promise<void> {
    try {
      await blockchainLedger.recordAuditEvent({
        auditType: 'autonomous-decision',
        vesselId: decision.perspectives[0]?.agentId || 'system',
        vesselName: 'Nautilus One',
        inspector: 'Autonomous Engine',
        score: decision.perspectives[0]?.confidence ? decision.perspectives[0].confidence * 100 : 80,
        findings: [decision.reasoning],
        recommendation: decision.recommendation,
        actionRequired: decision.approvalRequired
      });
    } catch (error) {
      console.error('[AutonomousEngine] Failed to record to blockchain:', error);
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen to digital twin anomalies
    vesselDigitalTwin.on('anomalies', (anomalies) => {
      this.emit('anomalies', anomalies);
    });

    // Listen to digital twin state updates
    vesselDigitalTwin.on('state-update', (state) => {
      this.emit('state-update', state);
    });

    // Listen to agent decisions
    agentOrchestrator.on('decision-executed', (decision) => {
      this.emit('decision-executed', decision);
    });

    agentOrchestrator.on('decision-pending', (decision) => {
      this.emit('decision-pending', decision);
    });
  }

  /**
   * Get current status
   */
  getStatus(): SystemStatus {
    return { ...this.status };
  }

  /**
   * Get configuration
   */
  getConfig(): AutonomousConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AutonomousConfig>): void {
    this.config = { ...this.config, ...config };
    this.emit('config-updated', this.config);
  }

  /**
   * Event emitter
   */
  on(event: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: unknown) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: unknown) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }
}

// Singleton instance
export const autonomousEngine = new AutonomousDecisionEngine();
