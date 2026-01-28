/**
 * Auto-Scheduling Maintenance Engine
 * Agendamento autônomo de manutenção baseado em condição
 */

export interface EquipmentCondition {
  equipment_id: string;
  equipment_name: string;
  category: string;
  current_health: number; // 0-100
  operating_hours: number;
  last_maintenance: string;
  sensor_readings: SensorReading[];
  failure_history: FailureEvent[];
  maintenance_history: MaintenanceEvent[];
}

export interface SensorReading {
  sensor_id: string;
  parameter: string;
  value: number;
  unit: string;
  timestamp: string;
  threshold_low?: number;
  threshold_high?: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface FailureEvent {
  date: string;
  failure_type: string;
  severity: 'minor' | 'major' | 'critical';
  root_cause?: string;
  downtime_hours: number;
  repair_cost: number;
}

export interface MaintenanceEvent {
  date: string;
  type: 'preventive' | 'corrective' | 'predictive' | 'inspection';
  description: string;
  cost: number;
  duration_hours: number;
  technician_id?: string;
}

export interface MaintenanceSchedule {
  equipment_id: string;
  equipment_name: string;
  schedule_id: string;
  scheduled_date: string;
  maintenance_type: 'preventive' | 'corrective' | 'predictive';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_duration_hours: number;
  estimated_cost: number;
  required_parts: RequiredPart[];
  required_skills: string[];
  justification: string;
  auto_scheduled: boolean;
  confidence: number;
}

export interface RequiredPart {
  part_id: string;
  part_name: string;
  quantity: number;
  available: boolean;
}

export interface ScheduleOptimization {
  vessel_id: string;
  vessel_name: string;
  optimization_date: string;
  scheduled_maintenance: MaintenanceSchedule[];
  resource_utilization: ResourceUtilization;
  conflicts: ScheduleConflict[];
  recommendations: ScheduleRecommendation[];
  projected_downtime_hours: number;
  projected_cost: number;
}

export interface ResourceUtilization {
  technician_hours_allocated: number;
  technician_hours_available: number;
  utilization_percentage: number;
  peak_days: string[];
  idle_days: string[];
}

export interface ScheduleConflict {
  type: 'resource' | 'part_availability' | 'operational' | 'safety';
  description: string;
  affected_schedules: string[];
  resolution_options: string[];
}

export interface ScheduleRecommendation {
  type: 'reschedule' | 'combine' | 'defer' | 'expedite';
  schedule_ids: string[];
  rationale: string;
  expected_benefit: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ConditionBasedTrigger {
  equipment_id: string;
  trigger_type: 'health_threshold' | 'operating_hours' | 'sensor_anomaly' | 'calendar';
  trigger_value: number;
  current_value: number;
  triggered: boolean;
  triggered_at?: string;
  recommended_action: string;
}

class AutoSchedulingEngine {
  private readonly HEALTH_THRESHOLDS = {
    critical: 30,
    warning: 50,
    attention: 70
  };

  private readonly MAINTENANCE_INTERVALS: Record<string, number> = {
    'main_engine': 3000, // hours
    'generator': 2500,
    'pump': 2000,
    'compressor': 1500,
    'navigation': 8760, // 1 year
    'safety_equipment': 4380 // 6 months
  };

  /**
   * Evaluate equipment condition and generate schedule
   */
  evaluateAndSchedule(
    equipment: EquipmentCondition,
    existingSchedules: MaintenanceSchedule[] = []
  ): { schedule: MaintenanceSchedule | null; triggers: ConditionBasedTrigger[] } {
    const triggers = this.evaluateTriggers(equipment);
    const activeTrigers = triggers.filter(t => t.triggered);

    if (activeTrigers.length === 0) {
      return { schedule: null, triggers };
    }

    // Check if maintenance already scheduled
    const hasScheduled = existingSchedules.some(
      s => s.equipment_id === equipment.equipment_id &&
           new Date(s.scheduled_date) > new Date()
    );

    if (hasScheduled) {
      return { schedule: null, triggers };
    }

    // Generate new schedule
    const schedule = this.generateSchedule(equipment, activeTrigers);
    
    return { schedule, triggers };
  }

  /**
   * Optimize maintenance schedule for vessel
   */
  optimizeSchedule(
    vesselId: string,
    vesselName: string,
    equipmentList: EquipmentCondition[],
    existingSchedules: MaintenanceSchedule[],
    availableResources: { technicians: number; hours_per_day: number }
  ): ScheduleOptimization {
    // Generate new schedules for equipment needing maintenance
    const newSchedules: MaintenanceSchedule[] = [];
    
    equipmentList.forEach(eq => {
      const result = this.evaluateAndSchedule(eq, [...existingSchedules, ...newSchedules]);
      if (result.schedule) {
        newSchedules.push(result.schedule);
      }
    });

    const allSchedules = [...existingSchedules, ...newSchedules]
      .filter(s => new Date(s.scheduled_date) > new Date())
      .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());

    // Analyze resource utilization
    const resourceUtilization = this.analyzeResourceUtilization(
      allSchedules,
      availableResources
    );

    // Identify conflicts
    const conflicts = this.identifyConflicts(allSchedules, equipmentList);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      allSchedules,
      conflicts,
      resourceUtilization
    );

    // Calculate projections
    const projectedDowntime = allSchedules.reduce(
      (sum, s) => sum + s.estimated_duration_hours, 0
    );
    const projectedCost = allSchedules.reduce(
      (sum, s) => sum + s.estimated_cost, 0
    );

    return {
      vessel_id: vesselId,
      vessel_name: vesselName,
      optimization_date: new Date().toISOString(),
      scheduled_maintenance: allSchedules,
      resource_utilization: resourceUtilization,
      conflicts,
      recommendations,
      projected_downtime_hours: projectedDowntime,
      projected_cost: projectedCost
    };
  }

  /**
   * Auto-reschedule based on operational constraints
   */
  autoReschedule(
    schedule: MaintenanceSchedule,
    constraints: {
      blackout_periods: { start: string; end: string }[];
      preferred_windows: { start: string; end: string }[];
      max_delay_days: number;
    }
  ): MaintenanceSchedule {
    const originalDate = new Date(schedule.scheduled_date);
    let newDate = originalDate;

    // Check if in blackout period
    const inBlackout = constraints.blackout_periods.some(period => {
      const start = new Date(period.start);
      const end = new Date(period.end);
      return originalDate >= start && originalDate <= end;
    });

    if (inBlackout) {
      // Find next available window
      const sortedWindows = constraints.preferred_windows
        .filter(w => new Date(w.start) > originalDate)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

      if (sortedWindows.length > 0) {
        newDate = new Date(sortedWindows[0].start);
      } else {
        // Move to after blackout
        const blackout = constraints.blackout_periods.find(period => {
          const start = new Date(period.start);
          const end = new Date(period.end);
          return originalDate >= start && originalDate <= end;
        });
        if (blackout) {
          newDate = new Date(blackout.end);
          newDate.setDate(newDate.getDate() + 1);
        }
      }

      // Check max delay constraint
      const delayDays = (newDate.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24);
      if (delayDays > constraints.max_delay_days && schedule.priority === 'critical') {
        // Can't delay critical maintenance - keep original and flag conflict
        newDate = originalDate;
      }
    }

    return {
      ...schedule,
      scheduled_date: newDate.toISOString().split('T')[0],
      justification: newDate !== originalDate
        ? `${schedule.justification} (reagendado automaticamente devido a restrições operacionais)`
        : schedule.justification
    };
  }

  private evaluateTriggers(equipment: EquipmentCondition): ConditionBasedTrigger[] {
    const triggers: ConditionBasedTrigger[] = [];

    // Health threshold trigger
    triggers.push({
      equipment_id: equipment.equipment_id,
      trigger_type: 'health_threshold',
      trigger_value: this.HEALTH_THRESHOLDS.warning,
      current_value: equipment.current_health,
      triggered: equipment.current_health < this.HEALTH_THRESHOLDS.warning,
      triggered_at: equipment.current_health < this.HEALTH_THRESHOLDS.warning
        ? new Date().toISOString()
        : undefined,
      recommended_action: equipment.current_health < this.HEALTH_THRESHOLDS.critical
        ? 'Manutenção corretiva urgente'
        : 'Manutenção preventiva recomendada'
    });

    // Operating hours trigger
    const interval = this.MAINTENANCE_INTERVALS[equipment.category.toLowerCase()] || 2000;
    const lastMaintenance = equipment.maintenance_history
      .filter(m => m.type === 'preventive')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    const hoursSinceLastMaintenance = lastMaintenance
      ? this.calculateHoursSince(lastMaintenance.date, equipment.operating_hours)
      : equipment.operating_hours;

    triggers.push({
      equipment_id: equipment.equipment_id,
      trigger_type: 'operating_hours',
      trigger_value: interval,
      current_value: hoursSinceLastMaintenance,
      triggered: hoursSinceLastMaintenance >= interval * 0.9,
      triggered_at: hoursSinceLastMaintenance >= interval * 0.9
        ? new Date().toISOString()
        : undefined,
      recommended_action: `Manutenção preventiva a cada ${interval} horas`
    });

    // Sensor anomaly trigger
    const anomalySensors = equipment.sensor_readings.filter(
      s => s.status === 'warning' || s.status === 'critical'
    );
    
    if (anomalySensors.length > 0) {
      triggers.push({
        equipment_id: equipment.equipment_id,
        trigger_type: 'sensor_anomaly',
        trigger_value: 0,
        current_value: anomalySensors.length,
        triggered: true,
        triggered_at: new Date().toISOString(),
        recommended_action: `Investigar ${anomalySensors.length} leitura(s) anormal(is): ${
          anomalySensors.map(s => s.parameter).join(', ')
        }`
      });
    }

    // Calendar-based trigger
    const daysSinceLastMaint = lastMaintenance
      ? (Date.now() - new Date(lastMaintenance.date).getTime()) / (1000 * 60 * 60 * 24)
      : 365;
    
    triggers.push({
      equipment_id: equipment.equipment_id,
      trigger_type: 'calendar',
      trigger_value: 180, // 6 months
      current_value: daysSinceLastMaint,
      triggered: daysSinceLastMaint >= 180,
      triggered_at: daysSinceLastMaint >= 180 ? new Date().toISOString() : undefined,
      recommended_action: 'Inspeção semestral programada'
    });

    return triggers;
  }

  private generateSchedule(
    equipment: EquipmentCondition,
    triggers: ConditionBasedTrigger[]
  ): MaintenanceSchedule {
    // Determine priority based on triggers
    let priority: MaintenanceSchedule['priority'] = 'low';
    let maintenanceType: MaintenanceSchedule['maintenance_type'] = 'preventive';

    const healthTrigger = triggers.find(t => t.trigger_type === 'health_threshold');
    const anomalyTrigger = triggers.find(t => t.trigger_type === 'sensor_anomaly');

    if (healthTrigger?.triggered && equipment.current_health < this.HEALTH_THRESHOLDS.critical) {
      priority = 'critical';
      maintenanceType = 'corrective';
    } else if (anomalyTrigger?.triggered) {
      priority = 'high';
      maintenanceType = 'predictive';
    } else if (healthTrigger?.triggered) {
      priority = 'medium';
      maintenanceType = 'preventive';
    }

    // Calculate scheduled date based on priority
    const now = new Date();
    let scheduledDate = new Date(now);

    switch (priority) {
      case 'critical':
        scheduledDate = now; // Immediate
        break;
      case 'high':
        scheduledDate.setDate(scheduledDate.getDate() + 3);
        break;
      case 'medium':
        scheduledDate.setDate(scheduledDate.getDate() + 14);
        break;
      default:
        scheduledDate.setDate(scheduledDate.getDate() + 30);
    }

    // Estimate duration and cost
    const estimatedDuration = this.estimateDuration(equipment, maintenanceType);
    const estimatedCost = this.estimateCost(equipment, maintenanceType);

    // Determine required parts
    const requiredParts = this.determineRequiredParts(equipment, maintenanceType);

    // Determine required skills
    const requiredSkills = this.determineRequiredSkills(equipment);

    // Build justification
    const justification = triggers
      .filter(t => t.triggered)
      .map(t => t.recommended_action)
      .join('; ');

    return {
      equipment_id: equipment.equipment_id,
      equipment_name: equipment.equipment_name,
      schedule_id: `SCH-${Date.now()}-${equipment.equipment_id.slice(-4)}`,
      scheduled_date: scheduledDate.toISOString().split('T')[0],
      maintenance_type: maintenanceType,
      priority,
      estimated_duration_hours: estimatedDuration,
      estimated_cost: estimatedCost,
      required_parts: requiredParts,
      required_skills: requiredSkills,
      justification,
      auto_scheduled: true,
      confidence: this.calculateConfidence(equipment, triggers)
    };
  }

  private analyzeResourceUtilization(
    schedules: MaintenanceSchedule[],
    resources: { technicians: number; hours_per_day: number }
  ): ResourceUtilization {
    const dailyHours: Record<string, number> = {};
    const availableHoursPerDay = resources.technicians * resources.hours_per_day;

    schedules.forEach(schedule => {
      const date = schedule.scheduled_date;
      dailyHours[date] = (dailyHours[date] || 0) + schedule.estimated_duration_hours;
    });

    const totalAllocated = Object.values(dailyHours).reduce((a, b) => a + b, 0);
    const totalAvailable = Object.keys(dailyHours).length * availableHoursPerDay;

    const peakDays = Object.entries(dailyHours)
      .filter(([_, hours]) => hours > availableHoursPerDay * 0.8)
      .map(([date]) => date);

    const idleDays = Object.entries(dailyHours)
      .filter(([_, hours]) => hours < availableHoursPerDay * 0.2)
      .map(([date]) => date);

    return {
      technician_hours_allocated: totalAllocated,
      technician_hours_available: totalAvailable,
      utilization_percentage: totalAvailable > 0 ? (totalAllocated / totalAvailable) * 100 : 0,
      peak_days: peakDays,
      idle_days: idleDays
    };
  }

  private identifyConflicts(
    schedules: MaintenanceSchedule[],
    equipment: EquipmentCondition[]
  ): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];

    // Check for parts availability conflicts
    const partRequirements: Record<string, { schedules: string[]; total: number }> = {};
    
    schedules.forEach(schedule => {
      schedule.required_parts.forEach(part => {
        if (!partRequirements[part.part_id]) {
          partRequirements[part.part_id] = { schedules: [], total: 0 };
        }
        partRequirements[part.part_id].schedules.push(schedule.schedule_id);
        partRequirements[part.part_id].total += part.quantity;
      });
    });

    Object.entries(partRequirements).forEach(([partId, req]) => {
      if (!req.schedules.every(s => 
        schedules.find(sch => sch.schedule_id === s)?.required_parts
          .find(p => p.part_id === partId)?.available
      )) {
        conflicts.push({
          type: 'part_availability',
          description: `Peça ${partId} pode não estar disponível para todas as manutenções`,
          affected_schedules: req.schedules,
          resolution_options: ['Encomendar peças antecipadamente', 'Reagendar manutenções']
        });
      }
    });

    // Check for resource conflicts (same day overload)
    const dailyLoad: Record<string, string[]> = {};
    schedules.forEach(schedule => {
      const date = schedule.scheduled_date;
      if (!dailyLoad[date]) dailyLoad[date] = [];
      dailyLoad[date].push(schedule.schedule_id);
    });

    Object.entries(dailyLoad).forEach(([date, scheduleIds]) => {
      if (scheduleIds.length > 3) {
        conflicts.push({
          type: 'resource',
          description: `Excesso de manutenções agendadas para ${date}`,
          affected_schedules: scheduleIds,
          resolution_options: ['Redistribuir entre dias', 'Alocar recursos adicionais']
        });
      }
    });

    return conflicts;
  }

  private generateRecommendations(
    schedules: MaintenanceSchedule[],
    conflicts: ScheduleConflict[],
    utilization: ResourceUtilization
  ): ScheduleRecommendation[] {
    const recommendations: ScheduleRecommendation[] = [];

    // Recommend combining similar maintenance
    const sameDaySchedules = schedules.reduce((acc, s) => {
      const date = s.scheduled_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(s);
      return acc;
    }, {} as Record<string, MaintenanceSchedule[]>);

    Object.entries(sameDaySchedules).forEach(([date, daySchedules]) => {
      const sameCategory = daySchedules.filter((s, i, arr) =>
        arr.some((other, j) => i !== j && 
          s.equipment_name.split(' ')[0] === other.equipment_name.split(' ')[0]
        )
      );
      
      if (sameCategory.length >= 2) {
        recommendations.push({
          type: 'combine',
          schedule_ids: sameCategory.map(s => s.schedule_id),
          rationale: 'Equipamentos similares agendados no mesmo dia',
          expected_benefit: 'Redução de tempo de preparação e mobilização',
          priority: 'medium'
        });
      }
    });

    // Recommend rescheduling for conflicts
    conflicts.forEach(conflict => {
      recommendations.push({
        type: 'reschedule',
        schedule_ids: conflict.affected_schedules,
        rationale: conflict.description,
        expected_benefit: 'Resolver conflito de ' + conflict.type,
        priority: conflict.type === 'resource' ? 'high' : 'medium'
      });
    });

    // Recommend expediting critical maintenance
    const critical = schedules.filter(s => s.priority === 'critical');
    critical.forEach(schedule => {
      if (new Date(schedule.scheduled_date) > new Date(Date.now() + 24 * 60 * 60 * 1000)) {
        recommendations.push({
          type: 'expedite',
          schedule_ids: [schedule.schedule_id],
          rationale: 'Manutenção crítica deve ser priorizada',
          expected_benefit: 'Evitar falha e tempo de parada não planejado',
          priority: 'high'
        });
      }
    });

    // Recommend deferring low-priority if utilization is high
    if (utilization.utilization_percentage > 90) {
      const lowPriority = schedules.filter(s => s.priority === 'low');
      if (lowPriority.length > 0) {
        recommendations.push({
          type: 'defer',
          schedule_ids: lowPriority.map(s => s.schedule_id),
          rationale: 'Alta utilização de recursos',
          expected_benefit: 'Balancear carga de trabalho',
          priority: 'low'
        });
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private calculateHoursSince(lastDate: string, currentHours: number): number {
    // Simplified calculation
    const daysSince = (Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince * 10; // Assume 10 operating hours per day
  }

  private estimateDuration(equipment: EquipmentCondition, type: string): number {
    const baseDuration: Record<string, number> = {
      preventive: 4,
      corrective: 8,
      predictive: 6,
      inspection: 2
    };
    
    const categoryMultiplier: Record<string, number> = {
      main_engine: 2,
      generator: 1.5,
      pump: 1,
      navigation: 0.5
    };

    const base = baseDuration[type] || 4;
    const multiplier = categoryMultiplier[equipment.category.toLowerCase()] || 1;

    return Math.round(base * multiplier * 10) / 10;
  }

  private estimateCost(equipment: EquipmentCondition, type: string): number {
    const baseCost: Record<string, number> = {
      preventive: 2000,
      corrective: 8000,
      predictive: 3000,
      inspection: 500
    };
    
    return baseCost[type] || 2000;
  }

  private determineRequiredParts(
    equipment: EquipmentCondition,
    type: string
  ): RequiredPart[] {
    // Simplified parts determination
    const parts: RequiredPart[] = [];
    
    if (type === 'preventive' || type === 'corrective') {
      parts.push({
        part_id: `FILTER-${equipment.equipment_id}`,
        part_name: 'Filtro',
        quantity: 2,
        available: true
      });
      parts.push({
        part_id: `SEAL-${equipment.equipment_id}`,
        part_name: 'Vedação',
        quantity: 1,
        available: true
      });
    }
    
    if (type === 'corrective') {
      parts.push({
        part_id: `BEARING-${equipment.equipment_id}`,
        part_name: 'Rolamento',
        quantity: 1,
        available: Math.random() > 0.3 // 70% chance available
      });
    }

    return parts;
  }

  private determineRequiredSkills(equipment: EquipmentCondition): string[] {
    const skillMap: Record<string, string[]> = {
      main_engine: ['Mecânico Motor', 'Eletricista'],
      generator: ['Eletricista', 'Mecânico'],
      pump: ['Mecânico'],
      navigation: ['Eletrônica', 'Calibração'],
      safety_equipment: ['Segurança', 'Mecânico']
    };

    return skillMap[equipment.category.toLowerCase()] || ['Técnico Geral'];
  }

  private calculateConfidence(
    equipment: EquipmentCondition,
    triggers: ConditionBasedTrigger[]
  ): number {
    let confidence = 0.7; // Base confidence

    // More triggers = more confidence in recommendation
    const triggeredCount = triggers.filter(t => t.triggered).length;
    confidence += triggeredCount * 0.1;

    // More historical data = more confidence
    if (equipment.maintenance_history.length >= 5) confidence += 0.1;
    if (equipment.failure_history.length >= 2) confidence += 0.05;

    // Sensor data increases confidence
    if (equipment.sensor_readings.length >= 3) confidence += 0.1;

    return Math.min(0.95, confidence);
  }
}

export const autoSchedulingEngine = new AutoSchedulingEngine();
