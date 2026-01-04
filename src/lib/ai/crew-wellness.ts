/**
 * Crew Wellness AI - Nautilus One v3.2.0
 * AI-powered wellness monitoring, burnout prediction, and intervention
 */

// Types
interface CrewMember {
  id: string;
  name: string;
  rank: string;
  department: string;
  contractStartDate: Date;
  contractEndDate: Date;
  familyStatus: 'single' | 'married' | 'with_children';
  previousVoyages: number;
}

interface HealthCheckIn {
  id: string;
  crewMemberId: string;
  timestamp: Date;
  mood: 1 | 2 | 3 | 4 | 5;
  stressLevel: 1 | 2 | 3 | 4 | 5;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  physicalHealth: 1 | 2 | 3 | 4 | 5;
  socialInteraction: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

interface WellnessAnalysis {
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  patterns: {
    mood: { trend: string; average: number };
    stress: { trend: string; average: number };
    sleep: { trend: string; average: number };
    social: { average: number };
  };
  burnoutRisk: number;
  recommendations: string[];
  alerts: Array<{
    type: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
  }>;
}

interface Intervention {
  crewMember: CrewMember;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  actions: string[];
  scheduledDate?: Date;
}

interface ShiftSchedule {
  crewMemberId: string;
  date: Date;
  shift: 'morning' | 'afternoon' | 'night' | 'off';
  hours: number;
  role: string;
}

interface RotationRecommendation {
  recommended: Date;
  reason: string;
  flexibility: {
    earliest: Date;
    latest: Date;
  };
  cost: number;
  wellnessImpact: string;
}

export class CrewWellnessAI {
  private static checkInHistory: Map<string, HealthCheckIn[]> = new Map();
  
  // Analyze crew wellness patterns
  static async analyzeCrewWellness(
    crewMember: CrewMember,
    checkIns: HealthCheckIn[]
  ): Promise<WellnessAnalysis> {
    // Store check-ins
    this.checkInHistory.set(crewMember.id, checkIns);
    
    // Analyze patterns
    const patterns = {
      mood: this.analyzeTrend(checkIns.map(c => c.mood)),
      stress: this.analyzeTrend(checkIns.map(c => c.stressLevel)),
      sleep: this.analyzeTrend(checkIns.map(c => c.sleepQuality)),
      social: { 
        average: this.calculateAverage(checkIns.map(c => c.socialInteraction)),
        trend: 'stable'
      },
    };
    
    // Calculate wellness score (0-100)
    const wellnessScore = this.calculateWellnessScore(patterns);
    
    // Predict burnout risk
    const burnoutRisk = this.predictBurnoutRisk(patterns, crewMember);
    
    // Determine overall trend
    const trend = this.determineOverallTrend(patterns);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(patterns, burnoutRisk, crewMember);
    
    // Generate alerts
    const alerts = this.generateAlerts(wellnessScore, burnoutRisk, patterns);
    
    return {
      score: wellnessScore,
      trend,
      patterns,
      burnoutRisk,
      recommendations,
      alerts,
    };
  }
  
  // Optimize shift scheduling
  static async optimizeShiftSchedule(
    crew: CrewMember[],
    currentSchedule: ShiftSchedule[],
    constraints: {
      minRestHours: number;
      maxConsecutiveDays: number;
      requiredRoles: Record<string, number>;
    }
  ): Promise<ShiftSchedule[]> {
    const optimizedSchedule: ShiftSchedule[] = [];
    
    // Get wellness scores for all crew
    const wellnessScores = new Map<string, number>();
    for (const member of crew) {
      const checkIns = this.checkInHistory.get(member.id) || [];
      if (checkIns.length > 0) {
        const analysis = await this.analyzeCrewWellness(member, checkIns);
        wellnessScores.set(member.id, analysis.score);
      } else {
        wellnessScores.set(member.id, 75); // Default score
      }
    }
    
    // Group schedule by date
    const dates = [...new Set(currentSchedule.map(s => s.date.toISOString().split('T')[0]))];
    
    for (const dateStr of dates) {
      const date = new Date(dateStr);
      const daySchedule = currentSchedule.filter(
        s => s.date.toISOString().split('T')[0] === dateStr
      );
      
      // Check and optimize each shift
      for (const shift of daySchedule) {
        const member = crew.find(c => c.id === shift.crewMemberId);
        if (!member) continue;
        
        const wellness = wellnessScores.get(member.id) || 75;
        
        // If wellness is low, try to reduce workload
        if (wellness < 50 && shift.shift === 'night') {
          // Try to swap with someone healthier
          const healthierCrew = crew.find(c => {
            const score = wellnessScores.get(c.id) || 75;
            return score > 70 && c.id !== member.id && c.department === member.department;
          });
          
          if (healthierCrew) {
            // Swap shifts
            optimizedSchedule.push({
              ...shift,
              crewMemberId: healthierCrew.id,
            });
            continue;
          }
        }
        
        // Ensure rest hours compliance
        const recentShifts = currentSchedule.filter(
          s => s.crewMemberId === member.id && 
               new Date(s.date).getTime() >= date.getTime() - 48 * 60 * 60 * 1000
        );
        
        const totalRecentHours = recentShifts.reduce((sum, s) => sum + s.hours, 0);
        
        if (totalRecentHours + shift.hours > 48 - constraints.minRestHours) {
          // Too many hours, try to reschedule
          optimizedSchedule.push({
            ...shift,
            shift: 'off',
            hours: 0,
          });
        } else {
          optimizedSchedule.push(shift);
        }
      }
    }
    
    return optimizedSchedule;
  }
  
  // Monitor for intervention needs
  static async monitorForInterventionNeeds(
    crew: CrewMember[]
  ): Promise<Intervention[]> {
    const interventions: Intervention[] = [];
    
    for (const member of crew) {
      const checkIns = this.checkInHistory.get(member.id) || [];
      if (checkIns.length === 0) continue;
      
      const wellness = await this.analyzeCrewWellness(member, checkIns);
      
      // Critical threshold - burnout risk > 70%
      if (wellness.burnoutRisk > 0.7) {
        interventions.push({
          crewMember: member,
          urgency: 'critical',
          type: 'burnout_prevention',
          actions: [
            'Schedule immediate rest period',
            'Arrange counseling session',
            'Consider early rotation',
            'Reduce workload immediately',
          ],
        });
        continue;
      }
      
      // High threshold - burnout risk > 50% or low wellness
      if (wellness.burnoutRisk > 0.5 || wellness.score < 40) {
        interventions.push({
          crewMember: member,
          urgency: 'high',
          type: 'wellness_support',
          actions: [
            'Check-in with ship doctor',
            'Provide wellness resources',
            'Adjust workload if possible',
            'Schedule peer support session',
          ],
        });
        continue;
      }
      
      // Medium threshold - declining trend
      if (wellness.trend === 'declining' && wellness.score < 60) {
        interventions.push({
          crewMember: member,
          urgency: 'medium',
          type: 'preventive_care',
          actions: [
            'Weekly wellness check-in',
            'Encourage social activities',
            'Review sleep schedule',
          ],
        });
      }
    }
    
    return interventions;
  }
  
  // Predict optimal rotation timing
  static async predictOptimalRotation(crewMember: CrewMember): Promise<RotationRecommendation> {
    const checkIns = this.checkInHistory.get(crewMember.id) || [];
    const wellness = checkIns.length > 0 
      ? await this.analyzeCrewWellness(crewMember, checkIns)
      : { score: 75, burnoutRisk: 0.3 };
    
    const now = new Date();
    const contractEnd = crewMember.contractEndDate;
    const contractDuration = contractEnd.getTime() - crewMember.contractStartDate.getTime();
    const elapsed = now.getTime() - crewMember.contractStartDate.getTime();
    const percentComplete = elapsed / contractDuration;
    
    // Base recommendation: 70% of contract duration
    let optimalRotationTime = crewMember.contractStartDate.getTime() + contractDuration * 0.7;
    
    // Adjust based on wellness
    if (wellness.score < 50) {
      // Low wellness: recommend earlier rotation
      optimalRotationTime -= 14 * 24 * 60 * 60 * 1000; // 2 weeks earlier
    } else if (wellness.burnoutRisk > 0.5) {
      // High burnout risk: recommend earlier
      optimalRotationTime -= 7 * 24 * 60 * 60 * 1000; // 1 week earlier
    }
    
    // Family status adjustment
    if (crewMember.familyStatus === 'with_children' && percentComplete > 0.5) {
      optimalRotationTime -= 7 * 24 * 60 * 60 * 1000; // 1 week earlier
    }
    
    const recommended = new Date(Math.max(now.getTime() + 7 * 24 * 60 * 60 * 1000, optimalRotationTime));
    
    // Generate reason
    const reasons: string[] = [];
    if (wellness.score < 50) reasons.push('low wellness score');
    if (wellness.burnoutRisk > 0.5) reasons.push('elevated burnout risk');
    if (crewMember.familyStatus === 'with_children') reasons.push('family considerations');
    if (reasons.length === 0) reasons.push('optimal contract timing');
    
    return {
      recommended,
      reason: `Based on ${reasons.join(', ')}`,
      flexibility: {
        earliest: new Date(recommended.getTime() - 14 * 24 * 60 * 60 * 1000),
        latest: new Date(Math.min(
          recommended.getTime() + 14 * 24 * 60 * 60 * 1000,
          contractEnd.getTime()
        )),
      },
      cost: this.estimateRotationCost(crewMember, recommended),
      wellnessImpact: wellness.score < 60 
        ? 'Rotation will significantly improve wellness' 
        : 'Rotation will maintain current wellness level',
    };
  }
  
  // Private: Analyze trend from values
  private static analyzeTrend(values: number[]): { trend: string; average: number } {
    if (values.length < 3) {
      return { trend: 'stable', average: this.calculateAverage(values) };
    }
    
    const recent = values.slice(-5);
    const older = values.slice(-10, -5);
    
    const recentAvg = this.calculateAverage(recent);
    const olderAvg = this.calculateAverage(older);
    
    if (olderAvg === 0) {
      return { trend: 'stable', average: recentAvg };
    }
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    let trend: string;
    if (change > 0.1) trend = 'improving';
    else if (change < -0.1) trend = 'declining';
    else trend = 'stable';
    
    return { trend, average: recentAvg };
  }
  
  // Private: Calculate average
  private static calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }
  
  // Private: Calculate wellness score
  private static calculateWellnessScore(patterns: WellnessAnalysis['patterns']): number {
    const moodScore = (patterns.mood.average / 5) * 25;
    const stressScore = ((6 - patterns.stress.average) / 5) * 25; // Inverse - lower stress is better
    const sleepScore = (patterns.sleep.average / 5) * 25;
    const socialScore = (patterns.social.average / 5) * 25;
    
    return Math.round(moodScore + stressScore + sleepScore + socialScore);
  }
  
  // Private: Predict burnout risk
  private static predictBurnoutRisk(
    patterns: WellnessAnalysis['patterns'],
    crewMember: CrewMember
  ): number {
    let risk = 0;
    
    // High stress is a major factor
    if (patterns.stress.average > 4) risk += 0.3;
    else if (patterns.stress.average > 3) risk += 0.15;
    
    // Poor sleep increases risk
    if (patterns.sleep.average < 2) risk += 0.25;
    else if (patterns.sleep.average < 3) risk += 0.1;
    
    // Declining mood is concerning
    if (patterns.mood.trend === 'declining') risk += 0.2;
    if (patterns.mood.average < 2) risk += 0.15;
    
    // Low social interaction
    if (patterns.social.average < 2) risk += 0.1;
    
    // Contract duration factor
    const now = new Date();
    const timeOnContract = now.getTime() - crewMember.contractStartDate.getTime();
    const daysOnContract = timeOnContract / (1000 * 60 * 60 * 24);
    
    if (daysOnContract > 120) risk += 0.1; // Over 4 months
    if (daysOnContract > 180) risk += 0.1; // Over 6 months
    
    return Math.min(1, risk);
  }
  
  // Private: Determine overall trend
  private static determineOverallTrend(
    patterns: WellnessAnalysis['patterns']
  ): 'improving' | 'stable' | 'declining' {
    const trends = [patterns.mood.trend, patterns.stress.trend, patterns.sleep.trend];
    
    const improving = trends.filter(t => t === 'improving').length;
    const declining = trends.filter(t => t === 'declining').length;
    
    if (improving > declining) return 'improving';
    if (declining > improving) return 'declining';
    return 'stable';
  }
  
  // Private: Generate recommendations
  private static generateRecommendations(
    patterns: WellnessAnalysis['patterns'],
    burnoutRisk: number,
    crewMember: CrewMember
  ): string[] {
    const recommendations: string[] = [];
    
    if (patterns.sleep.average < 3) {
      recommendations.push('Prioritize sleep hygiene - aim for 7-8 hours');
      recommendations.push('Avoid caffeine 6 hours before sleep');
    }
    
    if (patterns.stress.average > 3) {
      recommendations.push('Practice daily relaxation techniques');
      recommendations.push('Take short breaks during shifts');
    }
    
    if (patterns.social.average < 3) {
      recommendations.push('Participate in crew social activities');
      recommendations.push('Schedule regular video calls with family');
    }
    
    if (burnoutRisk > 0.5) {
      recommendations.push('Discuss workload with supervisor');
      recommendations.push('Consider using available wellness resources');
    }
    
    if (patterns.mood.trend === 'declining') {
      recommendations.push('Engage in physical exercise - improves mood');
      recommendations.push('Keep a gratitude journal');
    }
    
    return recommendations;
  }
  
  // Private: Generate alerts
  private static generateAlerts(
    wellnessScore: number,
    burnoutRisk: number,
    patterns: WellnessAnalysis['patterns']
  ): WellnessAnalysis['alerts'] {
    const alerts: WellnessAnalysis['alerts'] = [];
    
    if (wellnessScore < 30) {
      alerts.push({
        type: 'wellness_critical',
        severity: 'critical',
        message: 'Critical wellness level - immediate intervention recommended',
      });
    } else if (wellnessScore < 50) {
      alerts.push({
        type: 'wellness_low',
        severity: 'warning',
        message: 'Low wellness score - monitoring recommended',
      });
    }
    
    if (burnoutRisk > 0.7) {
      alerts.push({
        type: 'burnout_high',
        severity: 'critical',
        message: 'High burnout risk detected - schedule support session',
      });
    } else if (burnoutRisk > 0.5) {
      alerts.push({
        type: 'burnout_elevated',
        severity: 'warning',
        message: 'Elevated burnout risk - preventive measures advised',
      });
    }
    
    if (patterns.sleep.average < 2) {
      alerts.push({
        type: 'sleep_poor',
        severity: 'warning',
        message: 'Consistently poor sleep quality reported',
      });
    }
    
    if (patterns.stress.average > 4) {
      alerts.push({
        type: 'stress_high',
        severity: 'warning',
        message: 'High stress levels reported',
      });
    }
    
    return alerts;
  }
  
  // Private: Estimate rotation cost
  private static estimateRotationCost(crewMember: CrewMember, date: Date): number {
    // Base costs by rank
    const baseCosts: Record<string, number> = {
      'Captain': 5000,
      'Chief Officer': 4000,
      'Second Officer': 3500,
      'Chief Engineer': 4500,
      'Engineer': 3000,
      'Bosun': 2500,
      'Able Seaman': 2000,
      'Oiler': 2000,
      'Cook': 2000,
      default: 2500,
    };
    
    const baseCost = baseCosts[crewMember.rank] || baseCosts['default'];
    
    // Add urgency premium
    const now = new Date();
    const daysUntilRotation = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    let urgencyMultiplier = 1;
    if (daysUntilRotation < 7) urgencyMultiplier = 1.5;
    else if (daysUntilRotation < 14) urgencyMultiplier = 1.25;
    
    return Math.round(baseCost * urgencyMultiplier);
  }
  
  // Record new check-in
  static recordCheckIn(checkIn: HealthCheckIn): void {
    const existing = this.checkInHistory.get(checkIn.crewMemberId) || [];
    existing.push(checkIn);
    
    // Keep last 90 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const filtered = existing.filter(c => new Date(c.timestamp) > cutoff);
    
    this.checkInHistory.set(checkIn.crewMemberId, filtered);
  }
  
  // Get check-in history
  static getCheckInHistory(crewMemberId: string): HealthCheckIn[] {
    return this.checkInHistory.get(crewMemberId) || [];
  }
}

export default CrewWellnessAI;
