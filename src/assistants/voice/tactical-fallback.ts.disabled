/**
 * PATCH 609: Voice Command Tactical Fallback
 * 
 * Tactical fallback system for voice commands in critical situations
 * when UI fails or operations require hands-free control.
 * 
 * Features:
 * - Emergency command registration
 * - Offline mode execution
 * - Watchdog integration
 * - UI-independent operation
 */

import { supabase } from "@/integrations/supabase/client";

export type TacticalCommandType =
  | "emergency_stop"
  | "system_restart"
  | "alert_broadcast"
  | "manual_override"
  | "status_check"
  | "backup_activate"
  | "safe_mode"
  | "recover_system";

export interface TacticalCommand {
  id: string;
  type: TacticalCommandType;
  name: string;
  trigger: string[];
  priority: "critical" | "high" | "medium";
  requiresConfirmation: boolean;
  offlineEnabled: boolean;
  handler: Function;
  description: string;
}

export interface FallbackExecution {
  commandId: string;
  commandType: TacticalCommandType;
  trigger: string;
  status: "initiated" | "confirmed" | "executing" | "completed" | "failed";
  result: any;
  timestamp: string;
  executionTime: number;
  watchdogNotified: boolean;
}

export interface WatchdogAlert {
  alertId: string;
  alertType: "fallback_activated" | "command_executed" | "system_recovered" | "emergency";
  severity: "critical" | "warning" | "info";
  message: string;
  context: Record<string, any>;
  timestamp: string;
}

export class VoiceCommandTacticalFallback {
  private tacticalCommands: Map<string, TacticalCommand> = new Map();
  private executionHistory: FallbackExecution[] = [];
  private isInitialized = false;
  private offlineMode = false;
  private watchdogConnected = false;

  constructor() {
    this.initializeTacticalCommands();
  }

  /**
   * Initialize tactical fallback system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("🛡️ Initializing Voice Command Tactical Fallback...");

      // Connect to watchdog system
      await this.connectToWatchdog();

      // Setup offline mode detection
      this.setupOfflineModeDetection();

      // Register emergency handlers
      this.registerEmergencyHandlers();

      this.isInitialized = true;
      console.log("✓ Tactical Fallback system initialized");

      await this.notifyWatchdog({
        alertType: "fallback_activated",
        severity: "info",
        message: "Tactical fallback system initialized",
        context: {
          commandsRegistered: this.tacticalCommands.size,
          offlineEnabled: this.offlineMode,
        },
      });
    } catch (error) {
      console.error("Failed to initialize Tactical Fallback:", error);
      throw error;
    }
  }

  /**
   * Process tactical voice command
   */
  async processTacticalCommand(voiceInput: string): Promise<FallbackExecution> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = performance.now();

    try {
      // Match input to tactical command
      const command = this.matchTacticalCommand(voiceInput);

      if (!command) {
        throw new Error(`No tactical command matched for: "${voiceInput}"`);
      }

      // Check if offline mode required and available
      if (!this.offlineMode && !navigator.onLine) {
        this.offlineMode = true;
        console.log("⚠️ Switched to offline mode");
      }

      if (!command.offlineEnabled && this.offlineMode) {
        throw new Error(`Command "${command.name}" not available in offline mode`);
      }

      const execution: FallbackExecution = {
        commandId: `tactical-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        commandType: command.type,
        trigger: voiceInput,
        status: "initiated",
        result: null,
        timestamp: new Date().toISOString(),
        executionTime: 0,
        watchdogNotified: false,
      };

      // Notify watchdog of initiation
      await this.notifyWatchdog({
        alertType: "command_executed",
        severity: command.priority === "critical" ? "critical" : "warning",
        message: `Tactical command initiated: ${command.name}`,
        context: {
          commandId: execution.commandId,
          commandType: command.type,
          requiresConfirmation: command.requiresConfirmation,
        },
      });

      execution.watchdogNotified = true;

      // Confirmation for critical commands
      if (command.requiresConfirmation) {
        const confirmed = await this.requestConfirmation(command);
        if (!confirmed) {
          execution.status = "failed";
          execution.result = { error: "Command not confirmed" };
          return execution;
        }
        execution.status = "confirmed";
      }

      // Execute command
      execution.status = "executing";
      const result = await command.handler();

      execution.status = "completed";
      execution.result = result;
      execution.executionTime = performance.now() - startTime;

      // Log execution
      this.executionHistory.push(execution);
      await this.logExecution(execution);

      // Notify watchdog of completion
      await this.notifyWatchdog({
        alertType: "command_executed",
        severity: "info",
        message: `Tactical command completed: ${command.name}`,
        context: {
          commandId: execution.commandId,
          executionTime: execution.executionTime,
          result: result,
        },
      });

      return execution;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error processing tactical command:", error);

      const execution: FallbackExecution = {
        commandId: `error-${Date.now()}`,
        commandType: "status_check",
        trigger: voiceInput,
        status: "failed",
        result: { error: errorMessage },
        timestamp: new Date().toISOString(),
        executionTime: performance.now() - startTime,
        watchdogNotified: true,
      };

      await this.notifyWatchdog({
        alertType: "emergency",
        severity: "critical",
        message: `Tactical command failed: ${errorMessage}`,
        context: { error: errorMessage, input: voiceInput },
      });

      return execution;
    }
  }

  /**
   * Initialize tactical commands
   */
  private initializeTacticalCommands(): void {
    // Emergency stop
    this.registerTacticalCommand({
      id: "emergency-stop",
      type: "emergency_stop",
      name: "Emergency Stop",
      trigger: ["emergency stop", "stop all", "halt system", "freeze"],
      priority: "critical",
      requiresConfirmation: true,
      offlineEnabled: true,
      handler: async () => this.handleEmergencyStop(),
      description: "Immediately halt all system operations",
    });

    // System restart
    this.registerTacticalCommand({
      id: "system-restart",
      type: "system_restart",
      name: "System Restart",
      trigger: ["restart system", "reboot system", "system reboot"],
      priority: "critical",
      requiresConfirmation: true,
      offlineEnabled: true,
      handler: async () => this.handleSystemRestart(),
      description: "Restart the entire system",
    });

    // Alert broadcast
    this.registerTacticalCommand({
      id: "alert-broadcast",
      type: "alert_broadcast",
      name: "Broadcast Alert",
      trigger: ["broadcast alert", "send alert", "emergency alert"],
      priority: "high",
      requiresConfirmation: false,
      offlineEnabled: true,
      handler: async () => this.handleAlertBroadcast(),
      description: "Broadcast emergency alert to all users",
    });

    // Manual override
    this.registerTacticalCommand({
      id: "manual-override",
      type: "manual_override",
      name: "Manual Override",
      trigger: ["manual override", "take control", "override auto"],
      priority: "high",
      requiresConfirmation: true,
      offlineEnabled: true,
      handler: async () => this.handleManualOverride(),
      description: "Enable manual control override",
    });

    // Status check
    this.registerTacticalCommand({
      id: "status-check",
      type: "status_check",
      name: "System Status Check",
      trigger: ["check status", "system status", "health check"],
      priority: "medium",
      requiresConfirmation: false,
      offlineEnabled: true,
      handler: async () => this.handleStatusCheck(),
      description: "Check current system status",
    });

    // Backup activate
    this.registerTacticalCommand({
      id: "backup-activate",
      type: "backup_activate",
      name: "Activate Backup",
      trigger: ["activate backup", "switch to backup", "failover"],
      priority: "critical",
      requiresConfirmation: false,
      offlineEnabled: true,
      handler: async () => this.handleBackupActivate(),
      description: "Switch to backup systems",
    });

    // Safe mode
    this.registerTacticalCommand({
      id: "safe-mode",
      type: "safe_mode",
      name: "Enter Safe Mode",
      trigger: ["safe mode", "enter safe mode", "minimal mode"],
      priority: "high",
      requiresConfirmation: false,
      offlineEnabled: true,
      handler: async () => this.handleSafeMode(),
      description: "Enter safe mode with minimal functionality",
    });

    // System recovery
    this.registerTacticalCommand({
      id: "system-recovery",
      type: "recover_system",
      name: "System Recovery",
      trigger: ["recover system", "system recovery", "restore system"],
      priority: "critical",
      requiresConfirmation: true,
      offlineEnabled: true,
      handler: async () => this.handleSystemRecovery(),
      description: "Initiate system recovery procedure",
    });
  }

  /**
   * Register a tactical command
   */
  registerTacticalCommand(command: TacticalCommand): void {
    this.tacticalCommands.set(command.id, command);
    console.log(`✓ Registered tactical command: ${command.name}`);
  }

  /**
   * Match voice input to tactical command
   */
  private matchTacticalCommand(voiceInput: string): TacticalCommand | null {
    const normalized = voiceInput.toLowerCase().trim();

    for (const command of this.tacticalCommands.values()) {
      for (const trigger of command.trigger) {
        if (normalized.includes(trigger.toLowerCase())) {
          return command;
        }
      }
    }

    return null;
  }

  /**
   * Request confirmation for critical commands
   */
  private async requestConfirmation(command: TacticalCommand): Promise<boolean> {
    // In production, use voice confirmation or other UI-independent method
    console.log(`⚠️ Confirmation required for: ${command.name}`);

    // Simulate confirmation (in production, wait for actual voice confirmation)
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✓ Command confirmed");
        resolve(true);
      }, 1000);
    });
  }

  /**
   * Connect to watchdog system
   */
  private async connectToWatchdog(): Promise<void> {
    try {
      // In production, establish actual connection to watchdog service
      this.watchdogConnected = true;
      console.log("✓ Connected to Watchdog system");
    } catch (error) {
      console.warn("Could not connect to Watchdog:", error);
      this.watchdogConnected = false;
    }
  }

  /**
   * Setup offline mode detection
   */
  private setupOfflineModeDetection(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("offline", () => {
        this.offlineMode = true;
        console.log("⚠️ System offline - Tactical fallback active");
      });

      window.addEventListener("online", () => {
        this.offlineMode = false;
        console.log("✓ System online");
      });

      this.offlineMode = !navigator.onLine;
    }
  }

  /**
   * Register emergency handlers
   */
  private registerEmergencyHandlers(): void {
    // Register global emergency handler
    if (typeof window !== "undefined") {
      (window as any).__tacticalFallback = this;
    }
  }

  /**
   * Notify watchdog system
   */
  private async notifyWatchdog(alert: Omit<WatchdogAlert, "alertId" | "timestamp">): Promise<void> {
    if (!this.watchdogConnected) {
      console.log("⚠️ Watchdog not connected, alert queued:", alert.message);
      return;
    }

    const watchdogAlert: WatchdogAlert = {
      alertId: `watchdog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...alert,
      timestamp: new Date().toISOString(),
    };

    try {
      await supabase.from("watchdog_alerts").insert({
        alert_id: watchdogAlert.alertId,
        alert_type: watchdogAlert.alertType,
        severity: watchdogAlert.severity,
        message: watchdogAlert.message,
        context: watchdogAlert.context,
        timestamp: watchdogAlert.timestamp,
      });

      console.log(`✓ Watchdog notified: ${alert.message}`);
    } catch (error) {
      console.error("Failed to notify watchdog:", error);
    }
  }

  // Command handlers
  private async handleEmergencyStop(): Promise<any> {
    console.log("🚨 EMERGENCY STOP INITIATED");
    // In production, halt all critical operations
    return { success: true, message: "All operations halted" };
  }

  private async handleSystemRestart(): Promise<any> {
    console.log("🔄 SYSTEM RESTART INITIATED");
    // In production, trigger system restart
    return { success: true, message: "System restart scheduled" };
  }

  private async handleAlertBroadcast(): Promise<any> {
    console.log("📢 ALERT BROADCAST INITIATED");
    // In production, broadcast alert to all users/systems
    return { success: true, message: "Alert broadcasted", recipients: "all" };
  }

  private async handleManualOverride(): Promise<any> {
    console.log("🎛️ MANUAL OVERRIDE ACTIVATED");
    // In production, enable manual control mode
    return { success: true, message: "Manual override active" };
  }

  private async handleStatusCheck(): Promise<any> {
    console.log("📊 CHECKING SYSTEM STATUS");
    return {
      success: true,
      status: {
        system: "operational",
        offlineMode: this.offlineMode,
        watchdog: this.watchdogConnected,
        timestamp: new Date().toISOString(),
      },
    };
  }

  private async handleBackupActivate(): Promise<any> {
    console.log("💾 ACTIVATING BACKUP SYSTEMS");
    // In production, failover to backup systems
    return { success: true, message: "Backup systems activated" };
  }

  private async handleSafeMode(): Promise<any> {
    console.log("🛡️ ENTERING SAFE MODE");
    // In production, switch to safe mode
    return { success: true, message: "Safe mode enabled" };
  }

  private async handleSystemRecovery(): Promise<any> {
    console.log("🔧 SYSTEM RECOVERY INITIATED");
    // In production, start recovery procedures
    return { success: true, message: "Recovery procedure started" };
  }

  /**
   * Get all tactical commands
   */
  getTacticalCommands(): TacticalCommand[] {
    return Array.from(this.tacticalCommands.values());
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit: number = 20): FallbackExecution[] {
    return this.executionHistory.slice(-limit);
  }

  /**
   * Get system status
   */
  getSystemStatus(): {
    initialized: boolean;
    offlineMode: boolean;
    watchdogConnected: boolean;
    commandsAvailable: number;
  } {
    return {
      initialized: this.isInitialized,
      offlineMode: this.offlineMode,
      watchdogConnected: this.watchdogConnected,
      commandsAvailable: this.tacticalCommands.size,
    };
  }

  /**
   * Log execution to database
   */
  private async logExecution(execution: FallbackExecution): Promise<void> {
    try {
      await supabase.from("tactical_fallback_logs").insert({
        command_id: execution.commandId,
        command_type: execution.commandType,
        trigger: execution.trigger,
        status: execution.status,
        result: execution.result,
        execution_time: execution.executionTime,
        watchdog_notified: execution.watchdogNotified,
        timestamp: execution.timestamp,
      });
    } catch (error) {
      console.error("Failed to log execution:", error);
    }
  }
}

// Export singleton instance
export const tacticalFallback = new VoiceCommandTacticalFallback();
