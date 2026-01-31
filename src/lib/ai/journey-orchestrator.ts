/**
 * OJAC - Orquestrador de Jornadas Automatizadas Contextual
 * Intelligent workflow orchestration based on operational context
 * NAUTILUS ONE v4.0 - Autonomous Platform
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

export interface JourneyContext {
  vesselId?: string;
  vesselName?: string;
  port?: string;
  crewAvailable?: number;
  daysUntilDeparture?: number;
  complianceStatus?: string[];
  inspectionFindings?: string[];
  emergencyLevel?: 'none' | 'low' | 'medium' | 'high' | 'critical';
  weather?: 'clear' | 'moderate' | 'severe';
  fuelLevel?: number;
  maintenanceRequired?: boolean;
  timestamp: Date;
}

export interface JourneyTask {
  id: string;
  action: string;
  description: string;
  responsible: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  dependsOn?: string[];
  autoExecute: boolean;
  documentsAttached?: string[];
  result?: string;
  completedAt?: Date;
  completedBy?: string;
}

export interface JourneyDefinition {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number; // minutes
  tasks: JourneyTask[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  context: JourneyContext;
  aiReasoning?: string;
}

export interface JourneyTemplate {
  id: string;
  name: string;
  triggerPattern: string;
  taskTemplates: Omit<JourneyTask, 'id' | 'status' | 'result'>[];
}

export type JourneyEvent = 
  | 'inspection.findings.critical'
  | 'inspection.findings.minor'
  | 'crew.unavailable'
  | 'equipment.failure'
  | 'equipment.degraded'
  | 'fuel.low'
  | 'weather.severe'
  | 'port.arrival'
  | 'port.departure'
  | 'compliance.deadline'
  | 'maintenance.scheduled'
  | 'accident.reported'
  | 'certification.expiring';

/**
 * OJAC - Journey Orchestrator
 * Automatically creates and manages workflows based on operational context
 */
export class JourneyOrchestrator {
  private activeJourneys: Map<string, JourneyDefinition> = new Map();
  private journeyHistory: JourneyDefinition[] = [];
  private templates: Map<string, JourneyTemplate> = new Map();
  private listeners: Map<string, ((data: unknown) => void)[]> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize predefined journey templates
   */
  private initializeTemplates(): void {
    // Port Inspection Red Flag Protocol
    this.templates.set('inspection-red-flag', {
      id: 'inspection-red-flag',
      name: 'Port Inspection - Red Flag Protocol',
      triggerPattern: 'inspection.findings.critical',
      taskTemplates: [
        {
          action: 'stop_operations',
          description: 'Parar operações de risco até avaliação',
          responsible: 'chief_engineer',
          deadline: new Date(Date.now() + 30 * 60 * 1000), // 30 min
          priority: 'urgent',
          dependsOn: [],
          autoExecute: true
        },
        {
          action: 'notify_authorities',
          description: 'Notificar autoridades portuárias',
          responsible: 'captain',
          deadline: new Date(Date.now() + 60 * 60 * 1000), // 1h
          priority: 'urgent',
          dependsOn: [],
          autoExecute: true,
          documentsAttached: ['red_flag_report', 'maintenance_plan']
        },
        {
          action: 'diagnose_issue',
          description: 'Diagnosticar causa raiz do problema',
          responsible: 'chief_engineer',
          deadline: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6h
          priority: 'high',
          dependsOn: ['stop_operations'],
          autoExecute: false
        },
        {
          action: 'create_remediation_plan',
          description: 'Criar plano de correção detalhado',
          responsible: 'captain',
          deadline: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12h
          priority: 'high',
          dependsOn: ['diagnose_issue'],
          autoExecute: false
        },
        {
          action: 'validate_compliance',
          description: 'Validar conformidade com regulamentações',
          responsible: 'safety_officer',
          deadline: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18h
          priority: 'high',
          dependsOn: ['create_remediation_plan'],
          autoExecute: false
        },
        {
          action: 'execute_repairs',
          description: 'Executar reparos conforme plano',
          responsible: 'engineering_team',
          deadline: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
          priority: 'high',
          dependsOn: ['validate_compliance'],
          autoExecute: false
        },
        {
          action: 'request_reinspection',
          description: 'Solicitar re-inspeção às autoridades',
          responsible: 'captain',
          deadline: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72h
          priority: 'medium',
          dependsOn: ['execute_repairs'],
          autoExecute: true
        }
      ]
    });

    // Crew Unavailability Protocol
    this.templates.set('crew-unavailable', {
      id: 'crew-unavailable',
      name: 'Crew Unavailability - Reschedule Protocol',
      triggerPattern: 'crew.unavailable',
      taskTemplates: [
        {
          action: 'assess_impact',
          description: 'Avaliar impacto na operação',
          responsible: 'hr_officer',
          deadline: new Date(Date.now() + 60 * 60 * 1000), // 1h
          priority: 'high',
          dependsOn: [],
          autoExecute: true
        },
        {
          action: 'find_replacement',
          description: 'Identificar tripulante substituto',
          responsible: 'hr_officer',
          deadline: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4h
          priority: 'high',
          dependsOn: ['assess_impact'],
          autoExecute: false
        },
        {
          action: 'reschedule_watches',
          description: 'Reorganizar escala de quarto',
          responsible: 'chief_officer',
          deadline: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6h
          priority: 'high',
          dependsOn: ['find_replacement'],
          autoExecute: true
        },
        {
          action: 'validate_mlc',
          description: 'Validar conformidade MLC 2006',
          responsible: 'safety_officer',
          deadline: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8h
          priority: 'high',
          dependsOn: ['reschedule_watches'],
          autoExecute: true
        },
        {
          action: 'notify_crew',
          description: 'Comunicar mudanças à tripulação',
          responsible: 'captain',
          deadline: new Date(Date.now() + 10 * 60 * 60 * 1000), // 10h
          priority: 'medium',
          dependsOn: ['validate_mlc'],
          autoExecute: true
        },
        {
          action: 'update_records',
          description: 'Atualizar registros de training',
          responsible: 'hr_officer',
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
          priority: 'low',
          dependsOn: ['notify_crew'],
          autoExecute: true
        }
      ]
    });

    // Equipment Failure Protocol
    this.templates.set('equipment-failure', {
      id: 'equipment-failure',
      name: 'Equipment Failure - Emergency Response',
      triggerPattern: 'equipment.failure',
      taskTemplates: [
        {
          action: 'isolate_equipment',
          description: 'Isolar equipamento com falha',
          responsible: 'chief_engineer',
          deadline: new Date(Date.now() + 15 * 60 * 1000), // 15 min
          priority: 'urgent',
          dependsOn: [],
          autoExecute: true
        },
        {
          action: 'assess_safety',
          description: 'Avaliar riscos de segurança',
          responsible: 'safety_officer',
          deadline: new Date(Date.now() + 30 * 60 * 1000), // 30 min
          priority: 'urgent',
          dependsOn: ['isolate_equipment'],
          autoExecute: true
        },
        {
          action: 'activate_backup',
          description: 'Ativar sistema de backup se disponível',
          responsible: 'chief_engineer',
          deadline: new Date(Date.now() + 45 * 60 * 1000), // 45 min
          priority: 'urgent',
          dependsOn: ['assess_safety'],
          autoExecute: true
        },
        {
          action: 'diagnose_failure',
          description: 'Diagnosticar causa da falha',
          responsible: 'chief_engineer',
          deadline: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4h
          priority: 'high',
          dependsOn: ['activate_backup'],
          autoExecute: false
        },
        {
          action: 'order_parts',
          description: 'Encomendar peças de reposição',
          responsible: 'procurement',
          deadline: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8h
          priority: 'high',
          dependsOn: ['diagnose_failure'],
          autoExecute: false
        },
        {
          action: 'execute_repair',
          description: 'Executar reparo',
          responsible: 'engineering_team',
          deadline: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
          priority: 'high',
          dependsOn: ['order_parts'],
          autoExecute: false
        },
        {
          action: 'test_equipment',
          description: 'Testar equipamento reparado',
          responsible: 'chief_engineer',
          deadline: new Date(Date.now() + 52 * 60 * 60 * 1000), // 52h
          priority: 'high',
          dependsOn: ['execute_repair'],
          autoExecute: false
        },
        {
          action: 'document_incident',
          description: 'Documentar incidente para compliance',
          responsible: 'safety_officer',
          deadline: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72h
          priority: 'medium',
          dependsOn: ['test_equipment'],
          autoExecute: true
        }
      ]
    });

    // Low Fuel Protocol
    this.templates.set('fuel-low', {
      id: 'fuel-low',
      name: 'Low Fuel Alert - Bunkering Protocol',
      triggerPattern: 'fuel.low',
      taskTemplates: [
        {
          action: 'calculate_range',
          description: 'Calcular autonomia restante',
          responsible: 'navigator',
          deadline: new Date(Date.now() + 30 * 60 * 1000), // 30 min
          priority: 'urgent',
          dependsOn: [],
          autoExecute: true
        },
        {
          action: 'reduce_consumption',
          description: 'Implementar medidas de economia',
          responsible: 'chief_engineer',
          deadline: new Date(Date.now() + 60 * 60 * 1000), // 1h
          priority: 'high',
          dependsOn: ['calculate_range'],
          autoExecute: true
        },
        {
          action: 'identify_bunkering_ports',
          description: 'Identificar portos para abastecimento',
          responsible: 'navigator',
          deadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2h
          priority: 'high',
          dependsOn: ['calculate_range'],
          autoExecute: true
        },
        {
          action: 'request_quotes',
          description: 'Solicitar cotações de combustível',
          responsible: 'procurement',
          deadline: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4h
          priority: 'high',
          dependsOn: ['identify_bunkering_ports'],
          autoExecute: true
        },
        {
          action: 'approve_purchase',
          description: 'Aprovar compra de combustível',
          responsible: 'captain',
          deadline: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6h
          priority: 'high',
          dependsOn: ['request_quotes'],
          autoExecute: false
        },
        {
          action: 'coordinate_bunkering',
          description: 'Coordenar operação de abastecimento',
          responsible: 'chief_engineer',
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
          priority: 'medium',
          dependsOn: ['approve_purchase'],
          autoExecute: false
        }
      ]
    });

    // Severe Weather Protocol
    this.templates.set('weather-severe', {
      id: 'weather-severe',
      name: 'Severe Weather - Safety Protocol',
      triggerPattern: 'weather.severe',
      taskTemplates: [
        {
          action: 'secure_cargo',
          description: 'Reforçar amarração de carga',
          responsible: 'chief_officer',
          deadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2h
          priority: 'urgent',
          dependsOn: [],
          autoExecute: true
        },
        {
          action: 'brief_crew',
          description: 'Briefing de segurança com tripulação',
          responsible: 'captain',
          deadline: new Date(Date.now() + 60 * 60 * 1000), // 1h
          priority: 'urgent',
          dependsOn: [],
          autoExecute: true
        },
        {
          action: 'evaluate_route',
          description: 'Avaliar rota alternativa',
          responsible: 'navigator',
          deadline: new Date(Date.now() + 90 * 60 * 1000), // 1.5h
          priority: 'urgent',
          dependsOn: [],
          autoExecute: true
        },
        {
          action: 'notify_authorities',
          description: 'Notificar MRCC se necessário',
          responsible: 'radio_officer',
          deadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2h
          priority: 'high',
          dependsOn: ['evaluate_route'],
          autoExecute: false
        },
        {
          action: 'reduce_speed',
          description: 'Reduzir velocidade para condições',
          responsible: 'captain',
          deadline: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3h
          priority: 'high',
          dependsOn: ['evaluate_route'],
          autoExecute: true
        }
      ]
    });
  }

  /**
   * Trigger a journey based on an event
   */
  async triggerJourney(event: JourneyEvent, context: JourneyContext): Promise<JourneyDefinition> {
    logger.debug(`[OJAC] Triggering journey for event: ${event}`);
    
    // Find matching template
    const template = this.findTemplateForEvent(event);
    
    if (!template) {
      throw new Error(`No template found for event: ${event}`);
    }

    // Create journey from template
    const journey = this.createJourneyFromTemplate(template, context, event);
    
    // Get AI reasoning for the journey
    journey.aiReasoning = await this.getAIReasoning(journey, context);
    
    // Store journey
    this.activeJourneys.set(journey.id, journey);
    
    // Persist to database
    await this.persistJourney(journey);
    
    // Start execution
    this.startJourneyExecution(journey);
    
    this.emit('journey-started', journey);
    
    return journey;
  }

  /**
   * Find template matching event
   */
  private findTemplateForEvent(event: JourneyEvent): JourneyTemplate | undefined {
    const eventBase = event.split('.')[0];
    
    for (const [, template] of this.templates) {
      if (template.triggerPattern === event || template.triggerPattern.startsWith(eventBase)) {
        return template;
      }
    }
    
    // Fallback mappings
    const fallbackMap: Record<string, string> = {
      'inspection.findings.critical': 'inspection-red-flag',
      'inspection.findings.minor': 'inspection-red-flag',
      'crew.unavailable': 'crew-unavailable',
      'equipment.failure': 'equipment-failure',
      'equipment.degraded': 'equipment-failure',
      'fuel.low': 'fuel-low',
      'weather.severe': 'weather-severe'
    };
    
    const templateId = fallbackMap[event];
    return templateId ? this.templates.get(templateId) : undefined;
  }

  /**
   * Create journey from template
   */
  private createJourneyFromTemplate(
    template: JourneyTemplate, 
    context: JourneyContext,
    event: JourneyEvent
  ): JourneyDefinition {
    const now = new Date();
    
    const tasks: JourneyTask[] = template.taskTemplates.map((taskTemplate, index) => ({
      ...taskTemplate,
      id: `task-${Date.now()}-${index}`,
      status: 'pending' as const,
      // Adjust deadlines based on current time
      deadline: new Date(now.getTime() + (taskTemplate.deadline.getTime() - Date.now()))
    }));

    return {
      id: `journey-${Date.now()}`,
      name: template.name,
      description: `Jornada automática criada para: ${event}`,
      triggerEvent: event,
      priority: this.determinePriority(event),
      estimatedDuration: this.calculateEstimatedDuration(tasks),
      tasks,
      status: 'pending',
      createdAt: now,
      context
    };
  }

  /**
   * Determine priority based on event type
   */
  private determinePriority(event: JourneyEvent): 'low' | 'medium' | 'high' | 'critical' {
    if (event.includes('critical') || event.includes('failure') || event.includes('severe')) {
      return 'critical';
    }
    if (event.includes('unavailable') || event.includes('low') || event.includes('degraded')) {
      return 'high';
    }
    if (event.includes('deadline') || event.includes('expiring')) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Calculate estimated duration from tasks
   */
  private calculateEstimatedDuration(tasks: JourneyTask[]): number {
    if (tasks.length === 0) return 0;
    const lastTask = tasks[tasks.length - 1];
    return Math.round((lastTask.deadline.getTime() - Date.now()) / 60000);
  }

  /**
   * Get AI reasoning for the journey
   */
  private async getAIReasoning(journey: JourneyDefinition, context: JourneyContext): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-journey-reasoning', {
        body: {
          journeyName: journey.name,
          event: journey.triggerEvent,
          context,
          tasks: journey.tasks.map(t => ({ action: t.action, description: t.description }))
        }
      });

      if (error) throw error;
      return data?.reasoning || this.getDefaultReasoning(journey);
    } catch {
      return this.getDefaultReasoning(journey);
    }
  }

  /**
   * Get default reasoning if AI unavailable
   */
  private getDefaultReasoning(journey: JourneyDefinition): string {
    return `Jornada "${journey.name}" iniciada automaticamente em resposta ao evento "${journey.triggerEvent}". ` +
           `${journey.tasks.length} tarefas criadas com prioridade ${journey.priority}. ` +
           `Tempo estimado: ${journey.estimatedDuration} minutos.`;
  }

  /**
   * Start journey execution
   */
  private async startJourneyExecution(journey: JourneyDefinition): Promise<void> {
    journey.status = 'running';
    journey.startedAt = new Date();
    
    // Execute auto-execute tasks that have no dependencies
    for (const task of journey.tasks) {
      if (task.autoExecute && (!task.dependsOn || task.dependsOn.length === 0)) {
        await this.executeTask(journey.id, task.id);
      }
    }
  }

  /**
   * Execute a task
   */
  async executeTask(journeyId: string, taskId: string): Promise<boolean> {
    const journey = this.activeJourneys.get(journeyId);
    if (!journey) return false;

    const task = journey.tasks.find(t => t.id === taskId);
    if (!task) return false;

    // Check dependencies
    if (task.dependsOn && task.dependsOn.length > 0) {
      const dependenciesMet = task.dependsOn.every(depAction => {
        const depTask = journey.tasks.find(t => t.action === depAction);
        return depTask?.status === 'completed';
      });
      
      if (!dependenciesMet) {
        logger.debug(`[OJAC] Task ${task.action} waiting for dependencies`);
        return false;
      }
    }

    task.status = 'in_progress';
    this.emit('task-started', { journeyId, task });

    try {
      // Simulate task execution (in real system, would integrate with actual systems)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      task.status = 'completed';
      task.completedAt = new Date();
      task.result = 'Executado com sucesso';
      
      this.emit('task-completed', { journeyId, task });
      
      // Check if journey is complete
      this.checkJourneyCompletion(journey);
      
      // Trigger dependent tasks
      for (const nextTask of journey.tasks) {
        if (
          nextTask.status === 'pending' && 
          nextTask.autoExecute && 
          nextTask.dependsOn?.includes(task.action)
        ) {
          await this.executeTask(journeyId, nextTask.id);
        }
      }
      
      return true;
    } catch (error) {
      task.status = 'failed';
      task.result = error instanceof Error ? error.message : 'Falha na execução';
      this.emit('task-failed', { journeyId, task, error });
      return false;
    }
  }

  /**
   * Check if journey is complete
   */
  private checkJourneyCompletion(journey: JourneyDefinition): void {
    const allCompleted = journey.tasks.every(t => 
      t.status === 'completed' || t.status === 'skipped'
    );
    
    const anyFailed = journey.tasks.some(t => t.status === 'failed');
    
    if (allCompleted) {
      journey.status = 'completed';
      journey.completedAt = new Date();
      this.journeyHistory.push(journey);
      this.activeJourneys.delete(journey.id);
      this.emit('journey-completed', journey);
    } else if (anyFailed) {
      journey.status = 'failed';
      this.emit('journey-failed', journey);
    }
  }

  /**
   * Persist journey to database
   */
  private async persistJourney(journey: JourneyDefinition): Promise<void> {
    // Store in localStorage for persistence (database table would need migration)
    try {
      const stored = localStorage.getItem('ojac_journeys') || '[]';
      const journeys = JSON.parse(stored);
      const existing = journeys.findIndex((j: JourneyDefinition) => j.id === journey.id);
      if (existing >= 0) {
        journeys[existing] = journey;
      } else {
        journeys.push(journey);
      }
      localStorage.setItem('ojac_journeys', JSON.stringify(journeys.slice(-50)));
    } catch (error) {
      logger.error('[OJAC] Failed to persist journey:', error);
    }
  }

  /**
   * Get active journeys
   */
  getActiveJourneys(): JourneyDefinition[] {
    return Array.from(this.activeJourneys.values());
  }

  /**
   * Get journey by ID
   */
  getJourney(id: string): JourneyDefinition | undefined {
    return this.activeJourneys.get(id) || this.journeyHistory.find(j => j.id === id);
  }

  /**
   * Get journey history
   */
  getHistory(): JourneyDefinition[] {
    return this.journeyHistory;
  }

  /**
   * Cancel a journey
   */
  cancelJourney(journeyId: string): boolean {
    const journey = this.activeJourneys.get(journeyId);
    if (!journey) return false;

    journey.status = 'cancelled';
    journey.completedAt = new Date();
    
    for (const task of journey.tasks) {
      if (task.status === 'pending' || task.status === 'in_progress') {
        task.status = 'skipped';
      }
    }
    
    this.journeyHistory.push(journey);
    this.activeJourneys.delete(journeyId);
    this.emit('journey-cancelled', journey);
    
    return true;
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const total = this.journeyHistory.length + this.activeJourneys.size;
    const completed = this.journeyHistory.filter(j => j.status === 'completed').length;
    const failed = this.journeyHistory.filter(j => j.status === 'failed').length;
    
    return {
      total,
      active: this.activeJourneys.size,
      completed,
      failed,
      successRate: total > 0 ? (completed / total) * 100 : 100,
      averageDuration: this.calculateAverageDuration()
    };
  }

  /**
   * Calculate average journey duration
   */
  private calculateAverageDuration(): number {
    const completedJourneys = this.journeyHistory.filter(j => 
      j.status === 'completed' && j.startedAt && j.completedAt
    );
    
    if (completedJourneys.length === 0) return 0;
    
    const totalDuration = completedJourneys.reduce((sum, j) => {
      return sum + (j.completedAt!.getTime() - j.startedAt!.getTime());
    }, 0);
    
    return Math.round(totalDuration / completedJourneys.length / 60000); // minutes
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

  private emit(event: string, data: unknown) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }
}

// Singleton instance
export const journeyOrchestrator = new JourneyOrchestrator();
