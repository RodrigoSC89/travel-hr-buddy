/**
 * Incident Management & Automated Runbooks
 * PagerDuty-style incident handling with auto-remediation
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface Incident {
  id: string;
  organization_id: string;
  incident_number: number;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'acknowledged' | 'investigating' | 'mitigating' | 'resolved' | 'closed';
  priority: number;
  category: string;
  affected_services: string[];
  affected_users_count: number;
  runbook_id: string | null;
  runbook_progress: RunbookStep[];
  detected_at: string;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  closed_at: string | null;
  time_to_acknowledge: number | null;
  time_to_resolve: number | null;
  root_cause: string | null;
  resolution_summary: string | null;
  lessons_learned: string | null;
  action_items: ActionItem[];
  pagerduty_incident_id: string | null;
  slack_channel: string | null;
  created_at: string;
  updated_at: string;
}

export interface Runbook {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  trigger_conditions: TriggerCondition;
  severity: string;
  steps: RunbookStep[];
  auto_execute: boolean;
  notification_channels: string[];
  escalation_policy: EscalationPolicy | null;
  estimated_resolution_time: number;
  tags: string[];
  is_active: boolean;
}

export interface RunbookStep {
  step: number;
  action: string;
  auto: boolean;
  completed?: boolean;
  completed_at?: string;
  completed_by?: string;
  result?: string;
}

export interface TriggerCondition {
  error_type?: string;
  metric?: string;
  threshold?: number;
  type?: string;
  severity?: string;
}

export interface EscalationPolicy {
  levels: EscalationLevel[];
  timeout_minutes: number;
}

export interface EscalationLevel {
  level: number;
  notify: string[];
  timeout_minutes: number;
}

export interface ActionItem {
  id: string;
  action: string;
  owner: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface IncidentTimelineEvent {
  id: string;
  incident_id: string;
  event_type: 'status_change' | 'comment' | 'action' | 'escalation' | 'runbook_step';
  description: string;
  user_id: string | null;
  user_name: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Default runbooks for common scenarios
export const DEFAULT_RUNBOOKS: Omit<Runbook, 'id' | 'organization_id'>[] = [
  {
    name: 'Database Connection Failure',
    description: 'Steps to resolve database connectivity issues',
    trigger_conditions: { error_type: 'database_connection', threshold: 3 },
    severity: 'critical',
    steps: [
      { step: 1, action: 'Check Supabase status page', auto: true },
      { step: 2, action: 'Verify connection string in environment', auto: false },
      { step: 3, action: 'Test database connection manually', auto: false },
      { step: 4, action: 'Restart affected edge functions', auto: true },
      { step: 5, action: 'Escalate to DBA if unresolved after 15min', auto: false }
    ],
    auto_execute: false,
    notification_channels: ['slack', 'email', 'pagerduty'],
    escalation_policy: {
      levels: [
        { level: 1, notify: ['on_call_engineer'], timeout_minutes: 10 },
        { level: 2, notify: ['tech_lead', 'on_call_engineer'], timeout_minutes: 20 },
        { level: 3, notify: ['cto', 'tech_lead'], timeout_minutes: 30 }
      ],
      timeout_minutes: 30
    },
    estimated_resolution_time: 30,
    tags: ['database', 'infrastructure'],
    is_active: true
  },
  {
    name: 'High Error Rate Alert',
    description: 'Response to elevated error rates in application',
    trigger_conditions: { metric: 'error_rate', threshold: 0.05 },
    severity: 'high',
    steps: [
      { step: 1, action: 'Check recent deployments (last 24h)', auto: true },
      { step: 2, action: 'Review error logs for patterns', auto: false },
      { step: 3, action: 'Identify affected endpoints/components', auto: true },
      { step: 4, action: 'Rollback if deployment-related', auto: false },
      { step: 5, action: 'Apply hotfix if code bug identified', auto: false },
      { step: 6, action: 'Notify affected users if service degraded', auto: true }
    ],
    auto_execute: false,
    notification_channels: ['slack', 'email'],
    escalation_policy: {
      levels: [
        { level: 1, notify: ['on_call_engineer'], timeout_minutes: 15 },
        { level: 2, notify: ['tech_lead'], timeout_minutes: 30 }
      ],
      timeout_minutes: 45
    },
    estimated_resolution_time: 45,
    tags: ['errors', 'monitoring'],
    is_active: true
  },
  {
    name: 'Compliance Violation Detected',
    description: 'Handle critical compliance rule violations',
    trigger_conditions: { type: 'compliance_violation', severity: 'critical' },
    severity: 'critical',
    steps: [
      { step: 1, action: 'Notify compliance officer immediately', auto: true },
      { step: 2, action: 'Document violation details and evidence', auto: true },
      { step: 3, action: 'Assess regulatory impact', auto: false },
      { step: 4, action: 'Initiate remediation workflow', auto: false },
      { step: 5, action: 'Update compliance dashboard status', auto: true },
      { step: 6, action: 'Schedule post-incident review', auto: true }
    ],
    auto_execute: true,
    notification_channels: ['email', 'slack'],
    escalation_policy: {
      levels: [
        { level: 1, notify: ['compliance_officer'], timeout_minutes: 5 },
        { level: 2, notify: ['legal_counsel', 'ceo'], timeout_minutes: 30 }
      ],
      timeout_minutes: 60
    },
    estimated_resolution_time: 60,
    tags: ['compliance', 'regulatory'],
    is_active: true
  },
  {
    name: 'API Rate Limit Exceeded',
    description: 'Handle rate limiting scenarios',
    trigger_conditions: { error_type: 'rate_limit', threshold: 10 },
    severity: 'medium',
    steps: [
      { step: 1, action: 'Identify source of excessive requests', auto: true },
      { step: 2, action: 'Check for DDoS attack patterns', auto: true },
      { step: 3, action: 'Review API client implementations', auto: false },
      { step: 4, action: 'Increase rate limits if traffic is legitimate', auto: false },
      { step: 5, action: 'Implement request queuing if needed', auto: false }
    ],
    auto_execute: false,
    notification_channels: ['slack'],
    escalation_policy: null,
    estimated_resolution_time: 20,
    tags: ['api', 'performance'],
    is_active: true
  }
];

class IncidentManager {
  /**
   * Create a new incident
   */
  async createIncident(
    organizationId: string,
    incident: Omit<Incident, 'id' | 'organization_id' | 'incident_number' | 'created_at' | 'updated_at'>
  ): Promise<Incident | null> {
    try {
      const { data, error } = await (supabase
        .from('incidents') as any)
        .insert({
          ...incident,
          organization_id: organizationId,
          detected_at: incident.detected_at || new Date().toISOString(),
          affected_services: incident.affected_services,
          runbook_progress: incident.runbook_progress,
          action_items: incident.action_items
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to create incident:', error);
        return null;
      }

      // Add timeline event
      await this.addTimelineEvent(data.id, 'status_change', 'Incident created', null, null, {
        initial_severity: incident.severity,
        initial_status: incident.status
      });

      // Auto-execute runbook if configured
      if (incident.runbook_id) {
        const runbook = await this.getRunbook(incident.runbook_id);
        if (runbook?.auto_execute) {
          await this.executeAutoRunbookSteps(data.id, runbook);
        }
      }

      return data as unknown as Incident;
    } catch (error) {
      logger.error('Error creating incident:', error);
      return null;
    }
  }

  /**
   * Acknowledge an incident
   */
  async acknowledgeIncident(incidentId: string, userId: string): Promise<boolean> {
    const now = new Date().toISOString();
    
    // Get incident to calculate TTA
    const { data: incident } = await (supabase
      .from('incidents') as any)
      .select('detected_at')
      .eq('id', incidentId)
      .single();

    const tta = incident 
      ? Math.round((new Date(now).getTime() - new Date(incident.detected_at).getTime()) / 1000)
      : null;

    const { error } = await (supabase
      .from('incidents') as any)
      .update({
        status: 'acknowledged',
        acknowledged_at: now,
        acknowledged_by: userId,
        time_to_acknowledge: tta,
        updated_at: now
      })
      .eq('id', incidentId);

    if (!error) {
      await this.addTimelineEvent(incidentId, 'status_change', 'Incident acknowledged', userId, null, { tta });
    }

    return !error;
  }

  /**
   * Update incident status
   */
  async updateStatus(
    incidentId: string,
    status: Incident['status'],
    userId: string,
    notes?: string
  ): Promise<boolean> {
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {
      status,
      updated_at: now
    };

    if (status === 'resolved') {
      updates.resolved_at = now;
      updates.resolved_by = userId;
      
      // Calculate TTR
      const { data: incident } = await (supabase
        .from('incidents') as any)
        .select('detected_at')
        .eq('id', incidentId)
        .single();

      if (incident) {
        updates.time_to_resolve = Math.round(
          (new Date(now).getTime() - new Date(incident.detected_at).getTime()) / 1000
        );
      }
    } else if (status === 'closed') {
      updates.closed_at = now;
    }

    const { error } = await (supabase
      .from('incidents') as any)
      .update(updates)
      .eq('id', incidentId);

    if (!error) {
      await this.addTimelineEvent(
        incidentId, 
        'status_change', 
        `Status changed to ${status}${notes ? `: ${notes}` : ''}`,
        userId,
        null,
        { new_status: status }
      );
    }

    return !error;
  }

  /**
   * Complete a runbook step
   */
  async completeRunbookStep(
    incidentId: string,
    stepNumber: number,
    userId: string,
    result?: string
  ): Promise<boolean> {
    const { data: incident } = await (supabase
      .from('incidents') as any)
      .select('runbook_progress')
      .eq('id', incidentId)
      .single();

    if (!incident) return false;

    const progress = (incident.runbook_progress as RunbookStep[]) || [];
    const stepIndex = progress.findIndex((s: RunbookStep) => s.step === stepNumber);
    
    if (stepIndex === -1) return false;

    progress[stepIndex] = {
      ...progress[stepIndex],
      completed: true,
      completed_at: new Date().toISOString(),
      completed_by: userId,
      result
    };

    const { error } = await (supabase
      .from('incidents') as any)
      .update({
        runbook_progress: progress,
        updated_at: new Date().toISOString()
      })
      .eq('id', incidentId);

    if (!error) {
      await this.addTimelineEvent(
        incidentId,
        'runbook_step',
        `Completed step ${stepNumber}: ${progress[stepIndex].action}`,
        userId,
        null,
        { step: stepNumber, result }
      );
    }

    return !error;
  }

  /**
   * Add post-mortem details
   */
  async addPostMortem(
    incidentId: string,
    rootCause: string,
    resolutionSummary: string,
    lessonsLearned: string,
    actionItems: ActionItem[]
  ): Promise<boolean> {
    const { error } = await (supabase
      .from('incidents') as any)
      .update({
        root_cause: rootCause,
        resolution_summary: resolutionSummary,
        lessons_learned: lessonsLearned,
        action_items: actionItems,
        updated_at: new Date().toISOString()
      })
      .eq('id', incidentId);

    return !error;
  }

  /**
   * Get incident by ID
   */
  async getIncident(incidentId: string): Promise<Incident | null> {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', incidentId)
      .single();

    if (error) {
      logger.error('Failed to get incident:', error);
      return null;
    }

    return data as unknown as Incident;
  }

  /**
   * Get incidents with filters
   */
  async getIncidents(
    organizationId: string,
    filters?: {
      status?: Incident['status'][];
      severity?: Incident['severity'][];
      since?: Date;
    }
  ): Promise<Incident[]> {
    let query = supabase
      .from('incidents')
      .select('*')
      .eq('organization_id', organizationId);

    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }
    if (filters?.severity?.length) {
      query = query.in('severity', filters.severity);
    }
    if (filters?.since) {
      query = query.gte('detected_at', filters.since.toISOString());
    }

    const { data, error } = await query.order('detected_at', { ascending: false });

    if (error) {
      logger.error('Failed to get incidents:', error);
      return [];
    }

    return (data || []) as unknown as Incident[];
  }

  /**
   * Get incident timeline
   */
  async getTimeline(incidentId: string): Promise<IncidentTimelineEvent[]> {
    const { data, error } = await supabase
      .from('incident_timeline')
      .select('*')
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('Failed to get timeline:', error);
      return [];
    }

    return (data || []) as unknown as IncidentTimelineEvent[];
  }

  /**
   * Get runbook by ID
   */
  async getRunbook(runbookId: string): Promise<Runbook | null> {
    const { data, error } = await supabase
      .from('incident_runbooks')
      .select('*')
      .eq('id', runbookId)
      .single();

    if (error) {
      logger.error('Failed to get runbook:', error);
      return null;
    }

    return data as unknown as Runbook;
  }

  /**
   * Get all runbooks
   */
  async getRunbooks(organizationId?: string): Promise<Runbook[]> {
    let query = supabase
      .from('incident_runbooks')
      .select('*')
      .eq('is_active', true);

    if (organizationId) {
      query = query.or(`organization_id.is.null,organization_id.eq.${organizationId}`);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Failed to get runbooks:', error);
      return [];
    }

    return (data || []) as unknown as Runbook[];
  }

  /**
   * Get incident metrics
   */
  async getMetrics(organizationId: string, days: number = 30): Promise<{
    total: number;
    open: number;
    mttr: number;
    mtta: number;
    by_severity: Record<string, number>;
    by_status: Record<string, number>;
  }> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data } = await supabase
      .from('incidents')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('detected_at', since.toISOString());

    const incidents = (data || []) as unknown as Incident[];

    const resolved = incidents.filter(i => i.time_to_resolve);
    const acknowledged = incidents.filter(i => i.time_to_acknowledge);

    return {
      total: incidents.length,
      open: incidents.filter(i => !['resolved', 'closed'].includes(i.status)).length,
      mttr: resolved.length > 0 
        ? Math.round(resolved.reduce((sum, i) => sum + (i.time_to_resolve || 0), 0) / resolved.length / 60)
        : 0,
      mtta: acknowledged.length > 0
        ? Math.round(acknowledged.reduce((sum, i) => sum + (i.time_to_acknowledge || 0), 0) / acknowledged.length / 60)
        : 0,
      by_severity: incidents.reduce((acc, i) => {
        acc[i.severity] = (acc[i.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_status: incidents.reduce((acc, i) => {
        acc[i.status] = (acc[i.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  private async addTimelineEvent(
    incidentId: string,
    eventType: IncidentTimelineEvent['event_type'],
    description: string,
    userId: string | null,
    userName: string | null,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await (supabase.from('incident_timeline') as any).insert({
      incident_id: incidentId,
      event_type: eventType,
      description,
      user_id: userId,
      user_name: userName,
      metadata: metadata || {},
      created_at: new Date().toISOString()
    });
  }

  private async executeAutoRunbookSteps(incidentId: string, runbook: Runbook): Promise<void> {
    const autoSteps = runbook.steps.filter(s => s.auto);
    
    for (const step of autoSteps) {
      await this.completeRunbookStep(incidentId, step.step, 'system', 'Auto-executed');
      
      // Add small delay between auto-steps
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

export const incidentManager = new IncidentManager();
