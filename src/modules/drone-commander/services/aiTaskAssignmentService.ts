/**
 * PATCH 534 - AI Task Assignment Service
 * LLM-based intelligent task distribution for drone fleet
 */

import { logger } from "@/lib/logger";
import type { DroneStatus } from "../types";

export interface TaskAssignment {
  droneId: string;
  droneName: string;
  task: DroneTask;
  assignedAt: number;
  estimatedCompletion: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
}

export interface DroneTask {
  id: string;
  type: 'patrol' | 'inspection' | 'delivery' | 'search' | 'surveillance' | 'emergency';
  description: string;
  location: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  requirements: {
    minBattery: number;
    maxDistance?: number;
    requiredSensors?: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface FleetSimulation {
  id: string;
  name: string;
  drones: DroneStatus[];
  tasks: DroneTask[];
  assignments: TaskAssignment[];
  startTime: number;
  status: 'pending' | 'running' | 'completed' | 'paused';
  statistics: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageResponseTime: number;
    totalDistance: number;
  };
}

class AITaskAssignmentService {
  /**
   * PATCH 534: Assign tasks to drones using AI logic
   */
  assignTasksToDrones(drones: DroneStatus[], tasks: DroneTask[]): TaskAssignment[] {
    const assignments: TaskAssignment[] = [];
    const availableDrones = [...drones].filter(d => 
      d.status === 'idle' || d.status === 'hovering'
    );
    const pendingTasks = [...tasks].sort((a, b) => 
      this.getPriorityScore(b.requirements.priority) - 
      this.getPriorityScore(a.requirements.priority)
    );

    logger.info("Starting AI task assignment", {
      drones: availableDrones.length,
      tasks: pendingTasks.length,
    });

    for (const task of pendingTasks) {
      const bestDrone = this.selectBestDrone(availableDrones, task);
      
      if (bestDrone) {
        const assignment: TaskAssignment = {
          droneId: bestDrone.id,
          droneName: bestDrone.name,
          task,
          assignedAt: Date.now(),
          estimatedCompletion: Date.now() + this.estimateCompletionTime(bestDrone, task),
          priority: task.requirements.priority,
          status: 'assigned',
        };

        assignments.push(assignment);
        
        // Remove drone from available pool
        const index = availableDrones.findIndex(d => d.id === bestDrone.id);
        if (index !== -1) {
          availableDrones.splice(index, 1);
        }

        logger.info("Task assigned", {
          droneId: bestDrone.id,
          taskType: task.type,
          priority: task.requirements.priority,
        });
      } else {
        logger.warn("No suitable drone found for task", { taskType: task.type });
      }
    }

    return assignments;
  }

  /**
   * Select the best drone for a task using AI scoring
   */
  private selectBestDrone(drones: DroneStatus[], task: DroneTask): DroneStatus | null {
    if (drones.length === 0) return null;

    const scores = drones.map(drone => ({
      drone,
      score: this.calculateDroneScore(drone, task),
    }));

    // Sort by score (higher is better)
    scores.sort((a, b) => b.score - a.score);

    // Return best drone if score is acceptable
    const best = scores[0];
    return best.score > 50 ? best.drone : null;
  }

  /**
   * Calculate suitability score for a drone-task pair
   */
  private calculateDroneScore(drone: DroneStatus, task: DroneTask): number {
    let score = 100;

    // Battery check (critical factor)
    if (drone.battery < task.requirements.minBattery) {
      return 0; // Disqualify
    }
    score += (drone.battery - task.requirements.minBattery) * 0.5;

    // Distance check
    const distance = this.calculateDistance(
      drone.position,
      task.location
    );
    
    if (task.requirements.maxDistance && distance > task.requirements.maxDistance) {
      return 0; // Disqualify
    }
    
    // Prefer closer drones
    score += Math.max(0, 100 - distance);

    // Signal strength (important for reliability)
    score += drone.signal * 0.3;

    // Status bonus
    if (drone.status === 'idle') {
      score += 20;
    }

    // Speed capability
    if (task.requirements.priority === 'critical' || task.requirements.priority === 'high') {
      score += drone.speed * 0.5;
    }

    return score;
  }

  /**
   * Calculate distance between two positions (simplified)
   */
  private calculateDistance(
    pos1: { latitude: number; longitude: number },
    pos2: { latitude: number; longitude: number }
  ): number {
    // Simplified haversine formula (returns km)
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(pos2.latitude - pos1.latitude);
    const dLon = this.toRad(pos2.longitude - pos1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(pos1.latitude)) * 
      Math.cos(this.toRad(pos2.latitude)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Estimate task completion time
   */
  private estimateCompletionTime(drone: DroneStatus, task: DroneTask): number {
    const distance = this.calculateDistance(drone.position, task.location);
    const avgSpeed = 50; // km/h
    const travelTime = (distance / avgSpeed) * 3600000; // ms
    
    // Add task execution time based on type
    const executionTimes = {
      patrol: 1800000, // 30 min
      inspection: 900000, // 15 min
      delivery: 300000, // 5 min
      search: 3600000, // 60 min
      surveillance: 2700000, // 45 min
      emergency: 600000, // 10 min
    };

    return travelTime + (executionTimes[task.type] || 1800000);
  }

  /**
   * Get priority score
   */
  private getPriorityScore(priority: string): number {
    const scores = {
      critical: 100,
      high: 75,
      medium: 50,
      low: 25,
    };
    return scores[priority as keyof typeof scores] || 0;
  }

  /**
   * PATCH 534: Simulate a mission with multiple drones
   */
  async simulateMission(
    missionName: string,
    drones: DroneStatus[],
    taskCount: number = 5
  ): Promise<FleetSimulation> {
    logger.info("Starting fleet simulation", { missionName, drones: drones.length });

    // Generate random tasks
    const tasks = this.generateRandomTasks(taskCount);
    
    // Assign tasks
    const assignments = this.assignTasksToDrones(drones, tasks);

    const simulation: FleetSimulation = {
      id: `sim-${Date.now()}`,
      name: missionName,
      drones,
      tasks,
      assignments,
      startTime: Date.now(),
      status: 'pending',
      statistics: {
        totalTasks: tasks.length,
        completedTasks: 0,
        failedTasks: 0,
        averageResponseTime: 0,
        totalDistance: 0,
      },
    };

    return simulation;
  }

  /**
   * Generate random tasks for simulation
   */
  private generateRandomTasks(count: number): DroneTask[] {
    const tasks: DroneTask[] = [];
    const taskTypes: DroneTask['type'][] = [
      'patrol', 'inspection', 'delivery', 'search', 'surveillance', 'emergency'
    ];
    const priorities: DroneTask['requirements']['priority'][] = [
      'low', 'medium', 'high', 'critical'
    ];

    for (let i = 0; i < count; i++) {
      tasks.push({
        id: `task-${i + 1}`,
        type: taskTypes[Math.floor(Math.random() * taskTypes.length)],
        description: `Automated task ${i + 1} for simulation`,
        location: {
          latitude: -23.5 + (Math.random() * 2 - 1),
          longitude: -46.6 + (Math.random() * 2 - 1),
          altitude: 50 + Math.random() * 150,
        },
        requirements: {
          minBattery: 30 + Math.random() * 30,
          maxDistance: 50 + Math.random() * 100,
          priority: priorities[Math.floor(Math.random() * priorities.length)],
        },
      });
    }

    return tasks;
  }

  /**
   * Update simulation progress
   */
  updateSimulation(simulation: FleetSimulation): FleetSimulation {
    const updatedAssignments = simulation.assignments.map(assignment => {
      const now = Date.now();
      const elapsed = now - assignment.assignedAt;
      const duration = assignment.estimatedCompletion - assignment.assignedAt;
      const progress = elapsed / duration;

      if (progress >= 1 && assignment.status !== 'completed') {
        return {
          ...assignment,
          status: 'completed' as const,
        };
      } else if (assignment.status === 'assigned') {
        return {
          ...assignment,
          status: 'in_progress' as const,
        };
      }

      return assignment;
    });

    const completedTasks = updatedAssignments.filter(a => a.status === 'completed').length;
    const allCompleted = completedTasks === simulation.tasks.length;

    return {
      ...simulation,
      assignments: updatedAssignments,
      status: allCompleted ? 'completed' : simulation.status,
      statistics: {
        ...simulation.statistics,
        completedTasks,
      },
    };
  }
}

export const aiTaskAssignmentService = new AITaskAssignmentService();
