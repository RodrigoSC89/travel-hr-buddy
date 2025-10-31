/**
 * PATCH 576 - Situational Awareness Core
 * Real-time intelligence monitoring and analysis system
 * 
 * Features:
 * - Context collection from multiple modules (navigation, weather, failures, crew)
 * - Continuous AI analysis in observer mode
 * - Preventive alert generation
 * - Multi-source support (MQTT, Supabase, WebSocket)
 * - Real-time insight generation
 * - Situational logging
 * - Tactical decision suggestions
 */

import { BridgeLink } from "@/core/BridgeLink";
import { runOpenAI } from "@/ai/engine";
import { logger } from "@/lib/logger";
import {
  ModuleContextData,
  SituationalInsight,
  PreventiveAlert,
  TacticalDecision,
  SituationalState,
  ObserverConfig,
  SituationalLogEntry,
  ModuleSource,
  DataSource,
  AlertSeverity,
} from "./types";

/**
 * Core class for situational awareness
 */
export class SituationalAwarenessCore {
  private static instance: SituationalAwarenessCore;
  private observerConfig: ObserverConfig;
  private currentState: SituationalState;
  private contextBuffer: ModuleContextData[] = [];
  private logs: SituationalLogEntry[] = [];
  private observerInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  private constructor() {
    this.observerConfig = this.getDefaultConfig();
    this.currentState = this.getInitialState();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SituationalAwarenessCore {
    if (!SituationalAwarenessCore.instance) {
      SituationalAwarenessCore.instance = new SituationalAwarenessCore();
    }
    return SituationalAwarenessCore.instance;
  }

  /**
   * Initialize the core
   */
  public async initialize(config?: Partial<ObserverConfig>): Promise<void> {
    if (this.isInitialized) {
      logger.warn("Core already initialized", { category: "analysis" });
      return;
    }

    if (config) {
      this.observerConfig = { ...this.observerConfig, ...config };
    }

    // Set up event listeners for data sources
    this.setupDataSourceListeners();

    // Start observer mode if enabled
    if (this.observerConfig.enabled) {
      this.startObserver();
    }

    this.isInitialized = true;
    this.log("info", "analysis", "Situational Awareness Core initialized", {
      config: this.observerConfig,
    });

    (BridgeLink as any).emit("situational-awareness:initialized", "SituationalAwareness", {
      timestamp: Date.now(),
    });
  }

  /**
   * Collect context from a module
   */
  public async collectContext(
    source: ModuleSource,
    dataSource: DataSource,
    data: Record<string, any>,
    metadata?: ModuleContextData["metadata"]
  ): Promise<void> {
    const context: ModuleContextData = {
      source,
      dataSource,
      timestamp: Date.now(),
      data,
      metadata,
    };

    this.contextBuffer.push(context);

    // Keep buffer size manageable
    if (this.contextBuffer.length > 1000) {
      this.contextBuffer = this.contextBuffer.slice(-500);
    }

    // Update module state
    if (this.currentState.modules[source]) {
      this.currentState.modules[source].lastUpdate = context.timestamp;
      this.currentState.modules[source].metrics = data;
      this.currentState.modules[source].status = this.determineModuleStatus(data);
    }

    this.log("debug", "data_collection", `Context collected from ${source}`, {
      source,
      dataSource,
      dataKeys: Object.keys(data),
    });

    // Emit event
    (BridgeLink as any).emit("situational-awareness:context-collected", "SituationalAwareness", {
      source,
      timestamp: context.timestamp,
    });
  }

  /**
   * Perform continuous AI analysis
   */
  private async analyzeContext(): Promise<void> {
    if (this.contextBuffer.length === 0) {
      return;
    }

    try {
      const recentContext = this.contextBuffer.slice(-50); // Last 50 context entries
      const insights = await this.generateInsights(recentContext);
      
      // Add insights to state
      this.currentState.recentInsights = [
        ...insights,
        ...this.currentState.recentInsights.slice(0, 20),
      ];

      // Generate preventive alerts
      const alerts = await this.generatePreventiveAlerts(insights);
      
      // Update active alerts
      this.currentState.activeAlerts = [
        ...alerts,
        ...this.currentState.activeAlerts.filter(a => !a.expiresAt || a.expiresAt > Date.now()),
      ].slice(0, 50);

      // Update overall status
      this.updateOverallStatus();

      this.log("info", "analysis", "Analysis cycle completed", {
        insightsGenerated: insights.length,
        alertsGenerated: alerts.length,
        overallStatus: this.currentState.overall_status,
      });

      // Emit analysis complete event
      (BridgeLink as any).emit("situational-awareness:analysis-complete", "SituationalAwareness", {
        timestamp: Date.now(),
        insights: insights.length,
        alerts: alerts.length,
      });
    } catch (error) {
      this.log("error", "analysis", "Analysis failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Generate insights using AI
   */
  private async generateInsights(
    contextData: ModuleContextData[]
  ): Promise<SituationalInsight[]> {
    const insights: SituationalInsight[] = [];

    try {
      // Group context by source
      const contextBySource = contextData.reduce((acc, ctx) => {
        if (!acc[ctx.source]) acc[ctx.source] = [];
        acc[ctx.source].push(ctx);
        return acc;
      }, {} as Record<ModuleSource, ModuleContextData[]>);

      // Prepare AI prompt
      const contextSummary = Object.entries(contextBySource)
        .map(([source, contexts]) => {
          const latest = contexts[contexts.length - 1];
          return `${source}: ${JSON.stringify(latest.data)}`;
        })
        .join("\n");

      const response = await runOpenAI({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a maritime operations AI analyst. Analyze the following situational data and generate actionable insights. Focus on:
- Risks and opportunities
- System optimizations
- Preventive measures
- Critical alerts

Respond in JSON format with an array of insights, each containing: type, severity, title, description, affectedModules, confidence, suggestedActions.`,
          },
          {
            role: "user",
            content: `Analyze this situational data:\n${contextSummary}`,
          },
        ],
        temperature: 0.3,
        maxTokens: 1500,
      });

      // Parse AI response
      try {
        const parsed = JSON.parse(response.content);
        const insightsData = Array.isArray(parsed) ? parsed : parsed.insights || [];

        insightsData.forEach((item: any, index: number) => {
          insights.push({
            id: `insight-${Date.now()}-${index}`,
            timestamp: Date.now(),
            type: item.type || "risk",
            severity: item.severity || "medium",
            title: item.title || "Situational Insight",
            description: item.description || "",
            affectedModules: item.affectedModules || [],
            confidence: item.confidence || 0.7,
            suggestedActions: item.suggestedActions || [],
            context: item.context || {},
          });
        });
      } catch (parseError) {
        // Fallback: create a single insight from the text response
        insights.push({
          id: `insight-${Date.now()}`,
          timestamp: Date.now(),
          type: "risk",
          severity: "medium",
          title: "AI Analysis",
          description: response.content,
          affectedModules: Object.keys(contextBySource) as ModuleSource[],
          confidence: 0.6,
          suggestedActions: ["Review the analysis and take appropriate action"],
          context: {},
        });
      }
    } catch (error) {
      this.log("error", "analysis", "Failed to generate insights", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    return insights;
  }

  /**
   * Generate preventive alerts
   */
  private async generatePreventiveAlerts(
    insights: SituationalInsight[]
  ): Promise<PreventiveAlert[]> {
    const alerts: PreventiveAlert[] = [];

    // Convert high-severity insights to alerts
    insights
      .filter(i => i.severity === "critical" || i.severity === "high")
      .forEach(insight => {
        const tacticalDecisions = insight.suggestedActions.map((action, index) => ({
          id: `decision-${insight.id}-${index}`,
          action,
          priority: insight.severity === "critical" ? 9 : 7,
          estimatedImpact: `Address ${insight.type} in ${insight.affectedModules.join(", ")}`,
          implementationSteps: [action],
          risks: [],
          confidence: insight.confidence,
        }));

        alerts.push({
          id: `alert-${insight.id}`,
          timestamp: insight.timestamp,
          severity: insight.severity as AlertSeverity,
          type: "preventive",
          title: insight.title,
          description: insight.description,
          triggerConditions: [`${insight.type} detected with ${Math.round(insight.confidence * 100)}% confidence`],
          affectedSystems: insight.affectedModules,
          recommendedActions: tacticalDecisions,
          expiresAt: Date.now() + 3600000, // 1 hour
        });
      });

    return alerts;
  }

  /**
   * Get tactical decision suggestions
   */
  public async getTacticalSuggestions(): Promise<TacticalDecision[]> {
    const decisions: TacticalDecision[] = [];

    // Collect decisions from active alerts
    this.currentState.activeAlerts.forEach(alert => {
      decisions.push(...alert.recommendedActions);
    });

    // Sort by priority
    return decisions.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get current situational state
   */
  public getCurrentState(): SituationalState {
    return { ...this.currentState };
  }

  /**
   * Get recent logs
   */
  public getLogs(limit = 100): SituationalLogEntry[] {
    return this.logs.slice(-limit);
  }

  /**
   * Start observer mode
   */
  private startObserver(): void {
    if (this.observerInterval) {
      return;
    }

    this.observerInterval = setInterval(
      () => this.analyzeContext(),
      this.observerConfig.interval
    );

    this.log("info", "analysis", "Observer mode started", {
      interval: this.observerConfig.interval,
    });
  }

  /**
   * Stop observer mode
   */
  public stopObserver(): void {
    if (this.observerInterval) {
      clearInterval(this.observerInterval);
      this.observerInterval = null;
      this.log("info", "analysis", "Observer mode stopped");
    }
  }

  /**
   * Update observer configuration
   */
  public updateConfig(config: Partial<ObserverConfig>): void {
    this.observerConfig = { ...this.observerConfig, ...config };
    
    // Restart observer if running
    if (this.observerInterval) {
      this.stopObserver();
      if (this.observerConfig.enabled) {
        this.startObserver();
      }
    }
  }

  /**
   * Set up data source listeners
   */
  private setupDataSourceListeners(): void {
    // Listen for navigation data
    (BridgeLink as any).on("navigation:update", (_source: any, data: any) => {
      this.collectContext("navigation", "internal", data);
    });

    // Listen for weather data
    (BridgeLink as any).on("weather:update", (_source: any, data: any) => {
      this.collectContext("weather", "internal", data);
    });

    // Listen for failure reports
    (BridgeLink as any).on("system:failure", (_source: any, data: any) => {
      this.collectContext("failures", "internal", data);
    });

    // Listen for crew updates
    (BridgeLink as any).on("crew:update", (_source: any, data: any) => {
      this.collectContext("crew", "internal", data);
    });

    // Listen for sensor data
    (BridgeLink as any).on("sensors:data", (_source: any, data: any) => {
      this.collectContext("sensors", "internal", data);
    });

    // Listen for mission updates
    (BridgeLink as any).on("mission:update", (_source: any, data: any) => {
      this.collectContext("mission", "internal", data);
    });
  }

  /**
   * Determine module status based on data
   */
  private determineModuleStatus(data: Record<string, any>): "healthy" | "degraded" | "failed" | "unknown" {
    if (!data || Object.keys(data).length === 0) {
      return "unknown";
    }

    // Check for error indicators
    if (data.error || data.failed || data.status === "failed") {
      return "failed";
    }

    if (data.warning || data.degraded || data.status === "degraded") {
      return "degraded";
    }

    return "healthy";
  }

  /**
   * Update overall system status
   */
  private updateOverallStatus(): void {
    const criticalAlerts = this.currentState.activeAlerts.filter(a => a.severity === "critical");
    const highAlerts = this.currentState.activeAlerts.filter(a => a.severity === "high");
    const failedModules = Object.values(this.currentState.modules).filter(m => m.status === "failed");

    if (criticalAlerts.length > 0 || failedModules.length > 0) {
      this.currentState.overall_status = "critical";
    } else if (highAlerts.length > 2) {
      this.currentState.overall_status = "warning";
    } else if (highAlerts.length > 0) {
      this.currentState.overall_status = "caution";
    } else {
      this.currentState.overall_status = "normal";
    }

    // Calculate system health
    const moduleStatuses = Object.values(this.currentState.modules);
    const healthyCount = moduleStatuses.filter(m => m.status === "healthy").length;
    this.currentState.systemHealth = moduleStatuses.length > 0 
      ? healthyCount / moduleStatuses.length 
      : 1.0;
  }

  /**
   * Log a message
   */
  private log(
    level: SituationalLogEntry["level"],
    category: SituationalLogEntry["category"],
    message: string,
    context: Record<string, any> = {}
  ): void {
    const entry: SituationalLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      category,
      message,
      context,
    };

    this.logs.push(entry);

    // Keep logs manageable
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(-5000);
    }

    // Emit log event
    (BridgeLink as any).emit("situational-awareness:log", "SituationalAwareness", entry);

    // Use logger for output
    if (level === "error") {
      logger.error(message, context);
    } else if (level === "warn") {
      logger.warn(message, context);
    } else {
      logger.info(message, context);
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): ObserverConfig {
    return {
      enabled: true,
      interval: 30000, // 30 seconds
      sources: ["mqtt", "supabase", "websocket", "internal"],
      modules: ["navigation", "weather", "failures", "crew", "sensors", "mission", "system"],
      alertThresholds: {
        critical: 0.9,
        high: 0.7,
        medium: 0.5,
        low: 0.3,
      },
    };
  }

  /**
   * Get initial state
   */
  private getInitialState(): SituationalState {
    const modules: SituationalState["modules"] = {
      navigation: { status: "unknown", lastUpdate: 0, metrics: {} },
      weather: { status: "unknown", lastUpdate: 0, metrics: {} },
      failures: { status: "unknown", lastUpdate: 0, metrics: {} },
      crew: { status: "unknown", lastUpdate: 0, metrics: {} },
      sensors: { status: "unknown", lastUpdate: 0, metrics: {} },
      mission: { status: "unknown", lastUpdate: 0, metrics: {} },
      system: { status: "unknown", lastUpdate: 0, metrics: {} },
    };

    return {
      timestamp: Date.now(),
      overall_status: "normal",
      modules,
      activeAlerts: [],
      recentInsights: [],
      systemHealth: 1.0,
    };
  }

  /**
   * Cleanup
   */
  public cleanup(): void {
    this.stopObserver();
    this.contextBuffer = [];
    this.logs = [];
    this.isInitialized = false;
    
    (BridgeLink as any).emit("situational-awareness:cleanup", "SituationalAwareness", {
      timestamp: Date.now(),
    });
  }
}

// Export singleton instance
export const situationalAwareness = SituationalAwarenessCore.getInstance();
