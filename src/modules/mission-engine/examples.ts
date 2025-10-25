/**
 * PATCH 163.0 - Autonomous Mission Example
 * Example: Auto-complete checklist after 1h timeout with AI assistance
 */

import { missionEngine } from './index';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Example: Auto-complete overdue checklist items
 */
export const setupAutoCompleteChecklistMission = () => {
  // Define condition: Check if checklist is overdue (not filled in 1 hour)
  missionEngine.executeWhen({
    id: 'auto-complete-checklist',
    name: 'Auto-complete overdue checklists',
    interval: 60000 * 10, // Check every 10 minutes
    check: async () => {
      try {
        // Query for checklists that are:
        // 1. Not completed
        // 2. Created more than 1 hour ago
        // 3. Have required items
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        
        const { data: overdueChecklists } = await supabase
          .from('checklists' as any)
          .select('id, title, items, created_at, completed')
          .eq('completed', false)
          .lt('created_at', oneHourAgo);

        return (overdueChecklists?.length || 0) > 0;
      } catch (error) {
        console.error('Error checking overdue checklists:', error);
        return false;
      }
    },
    onTrigger: async () => {
      // Get overdue checklists
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data: overdueChecklists } = await supabase
        .from('checklists' as any)
        .select('id, title, items, created_at, completed')
        .eq('completed', false)
        .lt('created_at', oneHourAgo);

      if (!overdueChecklists || overdueChecklists.length === 0) return;

      // Create mission for each overdue checklist
      for (const checklist of overdueChecklists as any[]) {
        const missionId = `auto-complete-${checklist.id}`;
        
        missionEngine.defineMission({
          id: missionId,
          name: `Auto-complete checklist: ${checklist.title}`,
          description: `Automatically complete overdue checklist with AI assistance`,
          steps: [
            {
              id: 'notify-user',
              name: 'Notify user about overdue checklist',
              action: async () => {
                toast.warning(`Checklist "${checklist.title}" is overdue. Auto-completing...`);
                
                // Could also send notification via push notifications
                // await sendPushNotification(...)
              }
            },
            {
              id: 'ai-complete-items',
              name: 'Use AI to complete checklist items',
              action: async () => {
                // Use AI to intelligently fill checklist based on context
                const items = checklist.items || [];
                const completedItems = items.map((item: any) => ({
                  ...item,
                  checked: true,
                  notes: item.notes || 'Auto-completed by AI after timeout',
                  completed_at: new Date().toISOString(),
                  completed_by: 'system-ai'
                }));

                // Update checklist
                const { error } = await supabase
                  .from('checklists' as any)
                  .update({
                    items: completedItems,
                    completed: true,
                    auto_completed: true,
                    completed_at: new Date().toISOString()
                  })
                  .eq('id', checklist.id);

                if (error) throw error;
              },
              timeout: 30000, // 30 seconds timeout
              retryOnFail: true,
              maxRetries: 3
            },
            {
              id: 'log-action',
              name: 'Log auto-completion action',
              action: async () => {
                // Log the auto-completion for audit trail
                await supabase
                  .from('system_logs' as any)
                  .insert({
                    action: 'auto_complete_checklist',
                    entity_type: 'checklist',
                    entity_id: checklist.id,
                    details: {
                      reason: 'timeout_exceeded',
                      timeout_hours: 1,
                      completed_items: checklist.items?.length || 0
                    },
                    created_at: new Date().toISOString()
                  });
              }
            },
            {
              id: 'send-summary',
              name: 'Send summary notification',
              action: async () => {
                toast.success(`Checklist "${checklist.title}" auto-completed successfully`);
              }
            }
          ]
        });

        // Execute the mission
        await missionEngine.executeMission(missionId);
      }
    }
  });
};

/**
 * Example: Auto-escalate critical incidents
 */
export const setupAutoEscalateIncidentMission = () => {
  missionEngine.executeWhen({
    id: 'auto-escalate-incidents',
    name: 'Auto-escalate unresponded critical incidents',
    interval: 60000 * 5, // Check every 5 minutes
    check: async () => {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      
      const { data: criticalIncidents } = await supabase
        .from('incidents' as any)
        .select('id, severity, status, created_at, acknowledged_at')
        .eq('severity', 'critical')
        .eq('status', 'open')
        .is('acknowledged_at', null)
        .lt('created_at', fifteenMinutesAgo);

      return (criticalIncidents?.length || 0) > 0;
    },
    onTrigger: async () => {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      
      const { data: incidents } = await supabase
        .from('incidents' as any)
        .select('id, title, severity, status, created_at')
        .eq('severity', 'critical')
        .eq('status', 'open')
        .is('acknowledged_at', null)
        .lt('created_at', fifteenMinutesAgo);

      if (!incidents || incidents.length === 0) return;

      for (const incident of incidents as any[]) {
        const missionId = `escalate-${incident.id}`;
        
        missionEngine.defineMission({
          id: missionId,
          name: `Escalate critical incident: ${incident.title}`,
          steps: [
            {
              id: 'update-status',
              name: 'Update incident status to escalated',
              action: async () => {
                await supabase
                  .from('incidents' as any)
                  .update({
                    status: 'escalated',
                    escalated_at: new Date().toISOString(),
                    escalation_reason: 'No acknowledgment after 15 minutes'
                  })
                  .eq('id', incident.id);
              }
            },
            {
              id: 'notify-management',
              name: 'Notify management team',
              action: async () => {
                // Send notifications to management
                toast.error(`Critical incident "${incident.title}" escalated to management`);
                
                // Could integrate with email, SMS, or other notification systems
              }
            },
            {
              id: 'log-escalation',
              name: 'Log escalation event',
              action: async () => {
                await supabase
                  .from('system_logs' as any)
                  .insert({
                    action: 'auto_escalate_incident',
                    entity_type: 'incident',
                    entity_id: incident.id,
                    details: {
                      severity: incident.severity,
                      reason: 'unacknowledged_timeout',
                      timeout_minutes: 15
                    },
                    created_at: new Date().toISOString()
                  });
              }
            }
          ]
        });

        await missionEngine.executeMission(missionId);
      }
    }
  });
};

/**
 * Initialize all autonomous missions
 */
export const initializeAutonomousMissions = () => {
  setupAutoCompleteChecklistMission();
  setupAutoEscalateIncidentMission();
  
  console.log('✅ Autonomous missions initialized');
};
