// @ts-nocheck
/**
 * PATCH 383: Mission Control - Tactical Planning Service
 * Service for mission planning, resource allocation, and real-time synchronization
 */

import { supabase } from '@/integrations/supabase/client';

export interface Mission {
  id: string;
  mission_id: string;
  name: string;
  description?: string;
  mission_type: 'tactical' | 'strategic' | 'emergency' | 'training';
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'critical';
  start_date?: string;
  end_date?: string;
  estimated_duration_hours?: number;
  actual_duration_hours?: number;
  assigned_agents: string[];
  assigned_systems: string[];
  resources: ResourceAllocation[];
  objectives: MissionObjective[];
  progress_percentage: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface ResourceAllocation {
  resource_id: string;
  resource_type: 'personnel' | 'equipment' | 'vehicle' | 'satellite' | 'system';
  resource_name: string;
  quantity: number;
  allocated_from?: string;
  allocated_to?: string;
  status: 'requested' | 'allocated' | 'in_use' | 'released';
  notes?: string;
}

export interface MissionObjective {
  id: string;
  objective: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: number;
  assigned_to?: string;
  completion_percentage: number;
  created_at: string;
  completed_at?: string;
}

export interface MissionAgent {
  id: string;
  agent_id: string;
  agent_name: string;
  agent_type: 'human' | 'ai' | 'autonomous_system' | 'hybrid';
  role: string;
  capabilities: string[];
  status: 'available' | 'assigned' | 'busy' | 'offline';
  current_mission_id?: string;
  performance_rating?: number;
  metadata?: Record<string, unknown>;
}

export interface MissionStatus {
  mission_id: string;
  status: string;
  progress_percentage: number;
  active_objectives: number;
  completed_objectives: number;
  agents_deployed: number;
  systems_active: number;
  last_update: string;
  critical_events: any[];
}

export interface MissionLog {
  id: string;
  mission_id: string;
  log_type: 'info' | 'warning' | 'error' | 'critical' | 'success';
  message: string;
  source?: string;
  agent_id?: string;
  data?: Record<string, unknown>;
  timestamp: string;
  created_at: string;
}

export interface MissionReport {
  mission: Mission;
  status: MissionStatus;
  agents: MissionAgent[];
  logs: MissionLog[];
  performance_metrics: any;
  resource_utilization: any;
  generated_at: string;
}

export class MissionControlService {
  // Mission Management
  static async getMissions(filters?: {
    status?: string[];
    priority?: string[];
    mission_type?: string[];
  }): Promise<Mission[]> {
    let query = supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }
    if (filters?.priority?.length) {
      query = query.in('priority', filters.priority);
    }
    if (filters?.mission_type?.length) {
      query = query.in('mission_type', filters.mission_type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getMission(missionId: string): Promise<Mission | null> {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('mission_id', missionId)
      .single();

    if (error) throw error;
    return data;
  }

  static async createMission(mission: Partial<Mission>): Promise<Mission> {
    const missionId = `mission_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const { data, error } = await supabase
      .from('missions')
      .insert({
        mission_id: missionId,
        ...mission,
        status: mission.status || 'planning',
        priority: mission.priority || 'normal',
        progress_percentage: 0,
      })
      .select()
      .single();

    if (error) throw error;

    // Log mission creation
    await this.logMissionEvent(data.mission_id, 'info', 'Mission created', {
      created_by: mission.created_by,
    });

    return data;
  }

  static async updateMission(
    missionId: string,
    updates: Partial<Mission>
  ): Promise<Mission> {
    const { data, error } = await supabase
      .from('missions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('mission_id', missionId)
      .select()
      .single();

    if (error) throw error;

    // Log mission update
    await this.logMissionEvent(missionId, 'info', 'Mission updated', {
      fields_updated: Object.keys(updates),
    });

    return data;
  }

  static async updateMissionStatus(
    missionId: string,
    status: string,
    progressPercentage?: number
  ): Promise<void> {
    const updates: any = { status };
    
    if (progressPercentage !== undefined) {
      updates.progress_percentage = progressPercentage;
    }

    if (status === 'completed') {
      updates.end_date = new Date().toISOString();
      
      const mission = await this.getMission(missionId);
      if (mission?.start_date) {
        const duration = 
          (new Date().getTime() - new Date(mission.start_date).getTime()) / 
          (1000 * 60 * 60);
        updates.actual_duration_hours = Math.round(duration * 10) / 10;
      }
    }

    await this.updateMission(missionId, updates);
    
    await this.logMissionEvent(missionId, 'success', `Mission status changed to ${status}`);
  }

  // Resource Allocation
  static async allocateResource(
    missionId: string,
    resource: ResourceAllocation
  ): Promise<void> {
    const mission = await this.getMission(missionId);
    if (!mission) throw new Error('Mission not found');

    const resources = mission.resources || [];
    resources.push({
      ...resource,
      status: 'allocated',
    });

    await this.updateMission(missionId, { resources });

    await this.logMissionEvent(
      missionId,
      'info',
      `Resource allocated: ${resource.resource_name}`,
      { resource }
    );
  }

  static async releaseResource(
    missionId: string,
    resourceId: string
  ): Promise<void> {
    const mission = await this.getMission(missionId);
    if (!mission) throw new Error('Mission not found');

    const resources = (mission.resources || []).map(r =>
      r.resource_id === resourceId ? { ...r, status: 'released' } : r
    );

    await this.updateMission(missionId, { resources });

    await this.logMissionEvent(
      missionId,
      'info',
      `Resource released: ${resourceId}`
    );
  }

  // Agent Management
  static async getAgents(filters?: {
    status?: string[];
    agent_type?: string[];
    available?: boolean;
  }): Promise<MissionAgent[]> {
    let query = supabase
      .from('mission_agents')
      .select('*')
      .order('agent_name');

    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }
    if (filters?.agent_type?.length) {
      query = query.in('agent_type', filters.agent_type);
    }
    if (filters?.available) {
      query = query.eq('status', 'available');
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async assignAgentToMission(
    missionId: string,
    agentId: string,
    role?: string
  ): Promise<void> {
    const mission = await this.getMission(missionId);
    if (!mission) throw new Error('Mission not found');

    const assignedAgents = mission.assigned_agents || [];
    if (!assignedAgents.includes(agentId)) {
      assignedAgents.push(agentId);
    }

    await this.updateMission(missionId, { assigned_agents: assignedAgents });

    // Update agent status
    await supabase
      .from('mission_agents')
      .update({
        status: 'assigned',
        current_mission_id: missionId,
      })
      .eq('agent_id', agentId);

    await this.logMissionEvent(
      missionId,
      'info',
      `Agent ${agentId} assigned to mission`,
      { role }
    );
  }

  static async unassignAgentFromMission(
    missionId: string,
    agentId: string
  ): Promise<void> {
    const mission = await this.getMission(missionId);
    if (!mission) throw new Error('Mission not found');

    const assignedAgents = (mission.assigned_agents || []).filter(
      id => id !== agentId
    );

    await this.updateMission(missionId, { assigned_agents: assignedAgents });

    // Update agent status
    await supabase
      .from('mission_agents')
      .update({
        status: 'available',
        current_mission_id: null,
      })
      .eq('agent_id', agentId);

    await this.logMissionEvent(
      missionId,
      'info',
      `Agent ${agentId} unassigned from mission`
    );
  }

  // Real-time Status Synchronization
  static async getMissionStatus(missionId: string): Promise<MissionStatus> {
    const mission = await this.getMission(missionId);
    if (!mission) throw new Error('Mission not found');

    const objectives = mission.objectives || [];
    const activeObjectives = objectives.filter(
      o => o.status === 'in_progress'
    ).length;
    const completedObjectives = objectives.filter(
      o => o.status === 'completed'
    ).length;

    const recentLogs = await this.getMissionLogs(missionId, 10);
    const criticalEvents = recentLogs.filter(
      log => log.log_type === 'critical' || log.log_type === 'error'
    );

    return {
      mission_id: missionId,
      status: mission.status,
      progress_percentage: mission.progress_percentage,
      active_objectives: activeObjectives,
      completed_objectives: completedObjectives,
      agents_deployed: mission.assigned_agents?.length || 0,
      systems_active: mission.assigned_systems?.length || 0,
      last_update: mission.updated_at,
      critical_events: criticalEvents,
    };
  }

  static subscribeToMissionUpdates(
    missionId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`mission:${missionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'missions',
          filter: `mission_id=eq.${missionId}`,
        },
        callback
      )
      .subscribe();
  }

  // Mission Logging
  static async logMissionEvent(
    missionId: string,
    logType: string,
    message: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    try {
      await supabase.from('mission_logs').insert({
        mission_id: missionId,
        log_type: logType,
        message,
        data,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log mission event:', error);
    }
  }

  static async getMissionLogs(
    missionId: string,
    limit = 100
  ): Promise<MissionLog[]> {
    const { data, error } = await supabase
      .from('mission_logs')
      .select('*')
      .eq('mission_id', missionId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Objectives Management
  static async addObjective(
    missionId: string,
    objective: Partial<MissionObjective>
  ): Promise<void> {
    const mission = await this.getMission(missionId);
    if (!mission) throw new Error('Mission not found');

    const objectives = mission.objectives || [];
    objectives.push({
      id: crypto.randomUUID(),
      status: 'pending',
      completion_percentage: 0,
      created_at: new Date().toISOString(),
      ...objective,
    } as MissionObjective);

    await this.updateMission(missionId, { objectives });

    await this.logMissionEvent(
      missionId,
      'info',
      `Objective added: ${objective.objective}`
    );
  }

  static async updateObjective(
    missionId: string,
    objectiveId: string,
    updates: Partial<MissionObjective>
  ): Promise<void> {
    const mission = await this.getMission(missionId);
    if (!mission) throw new Error('Mission not found');

    const objectives = (mission.objectives || []).map(obj =>
      obj.id === objectiveId ? { ...obj, ...updates } : obj
    );

    await this.updateMission(missionId, { objectives });

    // Recalculate mission progress
    const totalObjectives = objectives.length;
    const completedObjectives = objectives.filter(
      o => o.status === 'completed'
    ).length;
    const progressPercentage = totalObjectives > 0
      ? Math.round((completedObjectives / totalObjectives) * 100)
      : 0;

    await this.updateMission(missionId, { 
      progress_percentage: progressPercentage 
    });

    await this.logMissionEvent(
      missionId,
      'info',
      `Objective updated: ${objectiveId}`,
      updates
    );
  }

  // Reporting
  static async generateMissionReport(
    missionId: string
  ): Promise<MissionReport> {
    const mission = await this.getMission(missionId);
    if (!mission) throw new Error('Mission not found');

    const status = await this.getMissionStatus(missionId);
    const logs = await this.getMissionLogs(missionId, 100);

    // Get agents assigned to mission
    const agents = await this.getAgents();
    const assignedAgents = agents.filter(agent =>
      mission.assigned_agents?.includes(agent.agent_id)
    );

    // Calculate performance metrics
    const performanceMetrics = {
      completion_rate: status.progress_percentage,
      objectives_completed: status.completed_objectives,
      objectives_total: mission.objectives?.length || 0,
      agents_utilized: assignedAgents.length,
      duration_hours: mission.actual_duration_hours || 0,
      critical_events_count: status.critical_events.length,
    };

    // Calculate resource utilization
    const resourceUtilization = {
      resources_allocated: mission.resources?.length || 0,
      resources_in_use: mission.resources?.filter(r => r.status === 'in_use').length || 0,
      resource_types: [...new Set(mission.resources?.map(r => r.resource_type) || [])],
    };

    return {
      mission,
      status,
      agents: assignedAgents,
      logs,
      performance_metrics: performanceMetrics,
      resource_utilization: resourceUtilization,
      generated_at: new Date().toISOString(),
    };
  }

  static async exportMissionReportToCSV(missionId: string): Promise<string> {
    const report = await this.generateMissionReport(missionId);
    
    let csv = 'Mission Report\n\n';
    csv += `Mission ID:,${report.mission.mission_id}\n`;
    csv += `Name:,${report.mission.name}\n`;
    csv += `Status:,${report.mission.status}\n`;
    csv += `Priority:,${report.mission.priority}\n`;
    csv += `Progress:,${report.mission.progress_percentage}%\n`;
    csv += `Start Date:,${report.mission.start_date || 'N/A'}\n`;
    csv += `End Date:,${report.mission.end_date || 'N/A'}\n`;
    csv += '\n';
    
    csv += 'Objectives\n';
    csv += 'Objective,Status,Priority,Completion %\n';
    for (const obj of report.mission.objectives || []) {
      csv += `"${obj.objective}",${obj.status},${obj.priority},${obj.completion_percentage}\n`;
    }
    csv += '\n';
    
    csv += 'Assigned Agents\n';
    csv += 'Agent ID,Name,Type,Role,Status\n';
    for (const agent of report.agents) {
      csv += `${agent.agent_id},${agent.agent_name},${agent.agent_type},"${agent.role}",${agent.status}\n`;
    }
    csv += '\n';
    
    csv += 'Performance Metrics\n';
    csv += `Completion Rate:,${report.performance_metrics.completion_rate}%\n`;
    csv += `Objectives Completed:,${report.performance_metrics.objectives_completed}/${report.performance_metrics.objectives_total}\n`;
    csv += `Agents Utilized:,${report.performance_metrics.agents_utilized}\n`;
    csv += `Duration (hours):,${report.performance_metrics.duration_hours}\n`;
    
    return csv;
  }
}
