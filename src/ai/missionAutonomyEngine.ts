/**
 * PATCH 214.0 - Mission AI Autonomy (Autonomia com Supervisão)
 * 
 * Enable AI to execute low/medium-risk decisions autonomously and request 
 * human approval for critical actions.
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import { learningCore } from "./learning-core";

export type DecisionLevel = 'auto_execute' | 'request_approval' | 'forbidden';
export type ActionStatus = 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';

export interface AutonomyAction {
  id?: string;
  action_type: string;
  decision_level: DecisionLevel;
  status: ActionStatus;
  context: Record<string, any>;
  reasoning: string;
  confidence_score: number;
  risk_score: number;
  approved_by?: string;
  executed_at?: Date;
  result?: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}

export interface DecisionRule {
  action_type: string;
  decision_level: DecisionLevel;
  risk_threshold: number; // 0-1
  confidence_threshold: number; // 0-1
  requires_approval_if: (context: Record<string, any>) => boolean;
}

export interface WebhookNotification {
  action_id: string;
  action_type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  context: Record<string, any>;
  timestamp: Date;
}

class MissionAutonomyEngine {
  private decisionRules: Map<string, DecisionRule> = new Map();
  private webhookUrl: string | null = null;
  private pendingApprovals: Map<string, AutonomyAction> = new Map();

  constructor() {
    logger.info("[MissionAutonomy] Initialized");
    this.initializeDecisionRules();
  }

  /**
   * Initialize decision rules
   */
  private initializeDecisionRules(): void {
    // Route adjustment - auto-execute for low risk
    this.addDecisionRule({
      action_type: 'route_adjustment',
      decision_level: 'auto_execute',
      risk_threshold: 0.3,
      confidence_threshold: 0.7,
      requires_approval_if: (context) => context.deviation_percentage > 20,
    });

    // Speed change - auto-execute for minor changes
    this.addDecisionRule({
      action_type: 'speed_change',
      decision_level: 'auto_execute',
      risk_threshold: 0.4,
      confidence_threshold: 0.6,
      requires_approval_if: (context) => Math.abs(context.speed_delta) > 5,
    });

    // Resource allocation - request approval for significant changes
    this.addDecisionRule({
      action_type: 'resource_allocation',
      decision_level: 'request_approval',
      risk_threshold: 0.6,
      confidence_threshold: 0.7,
      requires_approval_if: (context) => context.resource_value > 10000,
    });

    // Emergency protocol - always request approval
    this.addDecisionRule({
      action_type: 'emergency_protocol',
      decision_level: 'request_approval',
      risk_threshold: 0.8,
      confidence_threshold: 0.8,
      requires_approval_if: () => true,
    });

    // Crew reassignment - request approval
    this.addDecisionRule({
      action_type: 'crew_reassignment',
      decision_level: 'request_approval',
      risk_threshold: 0.5,
      confidence_threshold: 0.75,
      requires_approval_if: (context) => context.role_critical === true,
    });

    // System shutdown - forbidden without explicit override
    this.addDecisionRule({
      action_type: 'system_shutdown',
      decision_level: 'forbidden',
      risk_threshold: 1.0,
      confidence_threshold: 1.0,
      requires_approval_if: () => true,
    });

    // Mission abort - forbidden without explicit override
    this.addDecisionRule({
      action_type: 'mission_abort',
      decision_level: 'forbidden',
      risk_threshold: 1.0,
      confidence_threshold: 1.0,
      requires_approval_if: () => true,
    });
  }

  /**
   * Add a decision rule
   */
  addDecisionRule(rule: DecisionRule): void {
    this.decisionRules.set(rule.action_type, rule);
    logger.info("[MissionAutonomy] Decision rule added", {
      action_type: rule.action_type,
      decision_level: rule.decision_level,
    });
  }

  /**
   * Configure webhook URL for notifications
   */
  setWebhookUrl(url: string): void {
    this.webhookUrl = url;
    logger.info("[MissionAutonomy] Webhook URL configured");
  }

  /**
   * Propose an action
   */
  async proposeAction(
    action_type: string,
    context: Record<string, any>,
    reasoning: string,
    confidence_score: number,
    risk_score: number
  ): Promise<AutonomyAction> {
    try {
      logger.info("[MissionAutonomy] Proposing action", {
        action_type,
        confidence_score,
        risk_score,
      });

      // Get decision rule
      const rule = this.decisionRules.get(action_type);
      if (!rule) {
        logger.warn("[MissionAutonomy] No rule found for action type", {
          action_type,
        });
        // Default to request approval
        return this.createAction(
          action_type,
          'request_approval',
          context,
          reasoning,
          confidence_score,
          risk_score
        );
      }

      // Determine decision level
      let decision_level = rule.decision_level;

      // Check if approval is required based on context
      if (rule.requires_approval_if(context)) {
        decision_level = 'request_approval';
      }

      // Check risk and confidence thresholds
      if (risk_score > rule.risk_threshold) {
        decision_level = 'request_approval';
      }

      if (confidence_score < rule.confidence_threshold) {
        decision_level = 'request_approval';
      }

      // Create action
      const action = await this.createAction(
        action_type,
        decision_level,
        context,
        reasoning,
        confidence_score,
        risk_score
      );

      // Execute or request approval
      if (decision_level === 'auto_execute') {
        await this.executeAction(action);
      } else if (decision_level === 'request_approval') {
        await this.requestApproval(action);
      } else {
        logger.warn("[MissionAutonomy] Action is forbidden", { action_type });
        action.status = 'rejected';
        await this.updateAction(action);
      }

      return action;
    } catch (error) {
      logger.error("[MissionAutonomy] Failed to propose action", { error });
      throw error;
    }
  }

  /**
   * Create an autonomy action
   */
  private async createAction(
    action_type: string,
    decision_level: DecisionLevel,
    context: Record<string, any>,
    reasoning: string,
    confidence_score: number,
    risk_score: number
  ): Promise<AutonomyAction> {
    try {
      const { data, error } = await (supabase as any)
        .from('autonomy_actions')
        .insert({
          action_type,
          decision_level,
          status: 'pending',
          context,
          reasoning,
          confidence_score,
          risk_score,
        })
        .select()
        .single();

      if (error) throw error;

      const action: AutonomyAction = {
        id: data.id,
        action_type: data.action_type,
        decision_level: data.decision_level,
        status: data.status,
        context: data.context,
        reasoning: data.reasoning,
        confidence_score: data.confidence_score,
        risk_score: data.risk_score,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };

      logger.info("[MissionAutonomy] Action created", { actionId: action.id });

      return action;
    } catch (error) {
      logger.error("[MissionAutonomy] Failed to create action", { error });
      throw error;
    }
  }

  /**
   * Execute an action
   */
  async executeAction(action: AutonomyAction): Promise<void> {
    try {
      logger.info("[MissionAutonomy] Executing action", {
        actionId: action.id,
        action_type: action.action_type,
      });

      // Simulate action execution
      const result = await this.performAction(action);

      // Update action status
      action.status = 'executed';
      action.executed_at = new Date();
      action.result = result;

      await this.updateAction(action);

      // Track decision with learning core
      await learningCore.trackDecision(
        'mission-autonomy',
        action.action_type,
        action.context,
        result,
        action.confidence_score
      );

      logger.info("[MissionAutonomy] Action executed successfully", {
        actionId: action.id,
      });
    } catch (error) {
      logger.error("[MissionAutonomy] Failed to execute action", { error });
      
      action.status = 'failed';
      action.result = { error: String(error) };
      await this.updateAction(action);
      
      throw error;
    }
  }

  /**
   * Perform the actual action
   */
  private async performAction(
    action: AutonomyAction
  ): Promise<Record<string, any>> {
    // Simulate action execution based on type
    logger.info("[MissionAutonomy] Performing action", {
      action_type: action.action_type,
    });

    switch (action.action_type) {
      case 'route_adjustment':
        return {
          success: true,
          new_route: action.context.new_route,
          estimated_time_saved: 15,
        };

      case 'speed_change':
        return {
          success: true,
          old_speed: action.context.current_speed,
          new_speed: action.context.target_speed,
          impact: 'minimal',
        };

      case 'resource_allocation':
        return {
          success: true,
          resources_allocated: action.context.resources,
          allocation_complete: true,
        };

      default:
        return {
          success: true,
          message: `Action ${action.action_type} completed`,
        };
    }
  }

  /**
   * Request approval for an action
   */
  private async requestApproval(action: AutonomyAction): Promise<void> {
    try {
      logger.info("[MissionAutonomy] Requesting approval", {
        actionId: action.id,
        action_type: action.action_type,
      });

      // Store in pending approvals
      if (action.id) {
        this.pendingApprovals.set(action.id, action);
      }

      // Send webhook notification
      await this.sendWebhookNotification({
        action_id: action.id || '',
        action_type: action.action_type,
        priority: this.determinePriority(action.risk_score),
        message: `Approval required for ${action.action_type}`,
        context: action.context,
        timestamp: new Date(),
      });

      logger.info("[MissionAutonomy] Approval requested", {
        actionId: action.id,
      });
    } catch (error) {
      logger.error("[MissionAutonomy] Failed to request approval", { error });
      throw error;
    }
  }

  /**
   * Approve an action
   */
  async approveAction(actionId: string, approvedBy: string): Promise<void> {
    try {
      logger.info("[MissionAutonomy] Approving action", {
        actionId,
        approvedBy,
      });

      const action = await this.getAction(actionId);
      if (!action) {
        throw new Error(`Action ${actionId} not found`);
      }

      // Update action
      action.status = 'approved';
      action.approved_by = approvedBy;
      await this.updateAction(action);

      // Execute approved action
      await this.executeAction(action);

      // Remove from pending
      this.pendingApprovals.delete(actionId);

      logger.info("[MissionAutonomy] Action approved and executed", {
        actionId,
      });
    } catch (error) {
      logger.error("[MissionAutonomy] Failed to approve action", { error });
      throw error;
    }
  }

  /**
   * Reject an action
   */
  async rejectAction(actionId: string, rejectedBy: string): Promise<void> {
    try {
      logger.info("[MissionAutonomy] Rejecting action", {
        actionId,
        rejectedBy,
      });

      const action = await this.getAction(actionId);
      if (!action) {
        throw new Error(`Action ${actionId} not found`);
      }

      action.status = 'rejected';
      action.approved_by = rejectedBy;
      await this.updateAction(action);

      // Remove from pending
      this.pendingApprovals.delete(actionId);

      logger.info("[MissionAutonomy] Action rejected", { actionId });
    } catch (error) {
      logger.error("[MissionAutonomy] Failed to reject action", { error });
      throw error;
    }
  }

  /**
   * Get an action by ID
   */
  private async getAction(actionId: string): Promise<AutonomyAction | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('autonomy_actions')
        .select('*')
        .eq('id', actionId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        action_type: data.action_type,
        decision_level: data.decision_level,
        status: data.status,
        context: data.context,
        reasoning: data.reasoning,
        confidence_score: data.confidence_score,
        risk_score: data.risk_score,
        approved_by: data.approved_by,
        executed_at: data.executed_at ? new Date(data.executed_at) : undefined,
        result: data.result,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };
    } catch (error) {
      logger.error("[MissionAutonomy] Failed to get action", { error });
      return null;
    }
  }

  /**
   * Update an action
   */
  private async updateAction(action: AutonomyAction): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from('autonomy_actions')
        .update({
          status: action.status,
          approved_by: action.approved_by,
          executed_at: action.executed_at?.toISOString(),
          result: action.result,
        })
        .eq('id', action.id);

      if (error) throw error;
    } catch (error) {
      logger.error("[MissionAutonomy] Failed to update action", { error });
      throw error;
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(
    notification: WebhookNotification
  ): Promise<void> {
    if (!this.webhookUrl) {
      logger.warn("[MissionAutonomy] Webhook URL not configured");
      return;
    }

    try {
      logger.info("[MissionAutonomy] Sending webhook notification", {
        action_id: notification.action_id,
      });

      // Simulate webhook call (replace with actual implementation)
      // await fetch(this.webhookUrl, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(notification),
      // });

      logger.info("[MissionAutonomy] Webhook notification sent");
    } catch (error) {
      logger.error("[MissionAutonomy] Failed to send webhook", { error });
    }
  }

  /**
   * Determine priority based on risk score
   */
  private determinePriority(
    risk_score: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (risk_score >= 0.8) return 'critical';
    if (risk_score >= 0.6) return 'high';
    if (risk_score >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * List pending approvals
   */
  getPendingApprovals(): AutonomyAction[] {
    return Array.from(this.pendingApprovals.values());
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(limit: number = 100): Promise<AutonomyAction[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('autonomy_actions')
        .from('autonomy_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((d: any) => ({
        id: d.id,
        action_type: d.action_type,
        decision_level: d.decision_level,
        status: d.status,
        context: d.context,
        reasoning: d.reasoning,
        confidence_score: d.confidence_score,
        risk_score: d.risk_score,
        approved_by: d.approved_by,
        executed_at: d.executed_at ? new Date(d.executed_at) : undefined,
        result: d.result,
        created_at: new Date(d.created_at),
        updated_at: new Date(d.updated_at),
      }));
    } catch (error) {
      logger.error("[MissionAutonomy] Failed to get audit logs", { error });
      return [];
    }
  }
}

export const missionAutonomyEngine = new MissionAutonomyEngine();
