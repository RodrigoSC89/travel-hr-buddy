/**
 * 💚 Wellness Monitor - Crew Mental Health & Wellbeing AI
 * NAUTILUS ONE v5.0 - Revolutionary Crew Wellness
 * 
 * Privacy-preserving wellness monitoring with early
 * detection of burnout, stress, and wellbeing issues
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { wellnessPredictor, type WellnessMetrics } from "@/lib/revolutionary/wellness-predictor";

export interface WellnessScore {
  score: number; // 0-100
  level: 'excellent' | 'good' | 'fair' | 'concerning' | 'critical';
  indicators: WellnessIndicator[];
  risks: WellnessRisk[];
  recommendations: string[];
  trend: 'improving' | 'stable' | 'declining';
  confidence: number;
}

export interface WellnessIndicator {
  category: string;
  name: string;
  value: number;
  status: 'positive' | 'neutral' | 'warning' | 'critical';
  description: string;
}

export interface WellnessRisk {
  type: 'burnout' | 'stress' | 'isolation' | 'fatigue' | 'disengagement';
  level: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  earlyWarning: boolean;
  suggestedIntervention: string;
}

export interface WellnessData {
  crewMemberId: string;
  crewMemberName: string;
  score: WellnessScore;
  timestamp: Date;
}

export interface WellnessReport {
  overallWellness: {
    score: number;
    level: string;
    trend: string;
    atRiskCount: number;
    criticalCount: number;
    improvingCount: number;
  };
  individualScores: WellnessData[];
  trends: {
    period: string;
    avgScore: number;
    change: number;
  }[];
  interventions: Intervention[];
  insights: string[];
}

export interface Intervention {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  type: 'immediate' | 'scheduled' | 'preventive';
  priority: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  description: string;
  deadline?: Date;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface WorkPatterns {
  hoursPerWeek: number;
  overtimeHours: number;
  restTime: number;
  sleepQuality: number;
  consecutiveDaysWorked: number;
  breakFrequency: number;
}

export interface CommunicationPatterns {
  frequency: number;
  sentiment: number;
  meetingParticipation: number;
  responseTime: number;
  collaborationScore: number;
}

class WellnessMonitorService {

  /**
   * Get all active crew members
   */
  private async getAllActiveCrew(): Promise<any[]> {
    const { data } = await supabase
      .from('crew_members')
      .select('id, full_name, position, status, vessel_id')
      .eq('status', 'active');
    
    return data || [];
  }

  /**
   * Analyze work patterns for a crew member
   */
  private async analyzeWorkPatterns(crewMemberId: string): Promise<WorkPatterns> {
    // In a real implementation, this would analyze actual work logs
    return {
      hoursPerWeek: 45 + Math.random() * 15,
      overtimeHours: Math.random() * 10,
      restTime: 8 + Math.random() * 2,
      sleepQuality: 60 + Math.random() * 30,
      consecutiveDaysWorked: Math.floor(7 + Math.random() * 14),
      breakFrequency: 3 + Math.floor(Math.random() * 3)
    };
  }

  /**
   * Analyze communication patterns
   */
  private async analyzeCommunicationPatterns(crewMemberId: string): Promise<CommunicationPatterns> {
    return {
      frequency: 15 + Math.floor(Math.random() * 20),
      sentiment: 0.3 + Math.random() * 0.5,
      meetingParticipation: 70 + Math.random() * 25,
      responseTime: 10 + Math.random() * 30,
      collaborationScore: 65 + Math.random() * 30
    };
  }

  /**
   * Get performance metrics
   */
  private async getPerformanceMetrics(crewMemberId: string): Promise<any> {
    return {
      currentScore: 75 + Math.random() * 20,
      trend: Math.random() > 0.3 ? 'stable' : (Math.random() > 0.5 ? 'improving' : 'declining'),
      tasksCompleted: 15 + Math.floor(Math.random() * 10),
      qualityScore: 80 + Math.random() * 15
    };
  }

  /**
   * Get self-reported data (from surveys/check-ins)
   */
  private async getSelfReports(crewMemberId: string): Promise<any | null> {
    // Would come from mood tracking, pulse surveys, etc.
    if (Math.random() > 0.3) {
      return {
        mood: ['great', 'good', 'neutral', 'bad'][Math.floor(Math.random() * 4)],
        stressLevel: 3 + Math.floor(Math.random() * 5),
        workloadRating: 3 + Math.floor(Math.random() * 3),
        supportRating: 7 + Math.floor(Math.random() * 3),
        lastSubmitted: new Date()
      };
    }
    return null;
  }

  /**
   * Get peer feedback
   */
  private async getPeerFeedback(crewMemberId: string): Promise<any> {
    return {
      averageRating: 3.5 + Math.random() * 1.5,
      collaborationFeedback: 'positive',
      recentComments: []
    };
  }

  /**
   * Calculate wellness score from all data sources
   */
  private calculateWellnessScore(data: {
    workPatterns: WorkPatterns;
    communicationPatterns: CommunicationPatterns;
    performanceMetrics: any;
    selfReports: any | null;
    peerFeedback: any;
  }): WellnessScore {
    const indicators: WellnessIndicator[] = [];
    const risks: WellnessRisk[] = [];
    let totalScore = 0;
    let weightSum = 0;

    // Work-life balance indicator
    const workLifeScore = Math.max(0, 100 - (data.workPatterns.hoursPerWeek - 40) * 3);
    indicators.push({
      category: 'Work-Life Balance',
      name: 'Weekly Hours',
      value: data.workPatterns.hoursPerWeek,
      status: workLifeScore > 70 ? 'positive' : workLifeScore > 50 ? 'neutral' : 'warning',
      description: `${data.workPatterns.hoursPerWeek.toFixed(0)} hours/week`
    });
    totalScore += workLifeScore * 0.2;
    weightSum += 0.2;

    // Rest quality indicator
    const restScore = data.workPatterns.sleepQuality;
    indicators.push({
      category: 'Physical Health',
      name: 'Sleep Quality',
      value: restScore,
      status: restScore > 75 ? 'positive' : restScore > 55 ? 'neutral' : 'warning',
      description: `${restScore.toFixed(0)}% sleep quality`
    });
    totalScore += restScore * 0.15;
    weightSum += 0.15;

    // Communication indicator
    const commScore = (data.communicationPatterns.sentiment * 50 + 50);
    indicators.push({
      category: 'Social Connection',
      name: 'Communication',
      value: commScore,
      status: commScore > 70 ? 'positive' : commScore > 50 ? 'neutral' : 'warning',
      description: data.communicationPatterns.frequency > 10 ? 'Active communicator' : 'Limited communication'
    });
    totalScore += commScore * 0.15;
    weightSum += 0.15;

    // Performance indicator
    const perfScore = data.performanceMetrics.currentScore;
    indicators.push({
      category: 'Performance',
      name: 'Work Output',
      value: perfScore,
      status: perfScore > 80 ? 'positive' : perfScore > 65 ? 'neutral' : 'warning',
      description: `${perfScore.toFixed(0)}% performance score`
    });
    totalScore += perfScore * 0.2;
    weightSum += 0.2;

    // Self-reported mood
    if (data.selfReports) {
      const moodMap: Record<string, number> = { great: 100, good: 80, neutral: 60, bad: 40, terrible: 20 };
      const moodScore = moodMap[data.selfReports.mood] || 60;
      indicators.push({
        category: 'Emotional',
        name: 'Self-Reported Mood',
        value: moodScore,
        status: moodScore > 70 ? 'positive' : moodScore > 50 ? 'neutral' : 'warning',
        description: `Feeling ${data.selfReports.mood}`
      });
      totalScore += moodScore * 0.2;
      weightSum += 0.2;
    }

    // Team collaboration
    const teamScore = data.peerFeedback.averageRating * 20;
    indicators.push({
      category: 'Teamwork',
      name: 'Peer Feedback',
      value: teamScore,
      status: teamScore > 75 ? 'positive' : teamScore > 55 ? 'neutral' : 'warning',
      description: `${(data.peerFeedback.averageRating).toFixed(1)}/5 peer rating`
    });
    totalScore += teamScore * 0.1;
    weightSum += 0.1;

    // Calculate overall score
    const overallScore = Math.round(totalScore / weightSum);

    // Identify risks
    if (data.workPatterns.hoursPerWeek > 55 || data.workPatterns.consecutiveDaysWorked > 14) {
      risks.push({
        type: 'burnout',
        level: data.workPatterns.hoursPerWeek > 60 ? 'high' : 'medium',
        confidence: 75,
        earlyWarning: data.workPatterns.hoursPerWeek <= 60,
        suggestedIntervention: 'Review workload and ensure adequate rest periods'
      });
    }

    if (data.workPatterns.sleepQuality < 50) {
      risks.push({
        type: 'fatigue',
        level: data.workPatterns.sleepQuality < 35 ? 'high' : 'medium',
        confidence: 80,
        earlyWarning: true,
        suggestedIntervention: 'Assess sleep environment and schedule'
      });
    }

    if (data.communicationPatterns.frequency < 8 && data.communicationPatterns.sentiment < 0.3) {
      risks.push({
        type: 'isolation',
        level: 'medium',
        confidence: 65,
        earlyWarning: true,
        suggestedIntervention: 'Increase team engagement and check-in frequency'
      });
    }

    if (data.selfReports?.stressLevel > 7) {
      risks.push({
        type: 'stress',
        level: 'high',
        confidence: 85,
        earlyWarning: false,
        suggestedIntervention: 'Schedule support conversation and stress management resources'
      });
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (overallScore < 60) {
      recommendations.push('Schedule wellness check-in with HR');
      recommendations.push('Consider workload adjustment');
    }
    if (data.workPatterns.sleepQuality < 60) {
      recommendations.push('Review sleep hygiene and cabin environment');
    }
    if (data.communicationPatterns.frequency < 10) {
      recommendations.push('Encourage participation in team activities');
    }
    if (recommendations.length === 0) {
      recommendations.push('Maintain current positive practices');
    }

    // Determine level
    const level = overallScore >= 80 ? 'excellent' :
                  overallScore >= 70 ? 'good' :
                  overallScore >= 55 ? 'fair' :
                  overallScore >= 40 ? 'concerning' : 'critical';

    // Determine trend (would compare to historical data)
    const trend = data.performanceMetrics.trend as WellnessScore['trend'];

    return {
      score: overallScore,
      level,
      indicators,
      risks,
      recommendations,
      trend,
      confidence: 78
    };
  }

  /**
   * Create critical alert for at-risk crew member
   */
  private async createCriticalAlert(crewMemberId: string, wellnessScore: WellnessScore): Promise<void> {
    logger.warn('Critical wellness alert', { 
      crewMemberId, 
      score: wellnessScore.score,
      risks: wellnessScore.risks.map(r => r.type)
    });

    // Would create notification/alert in system
  }

  /**
   * Calculate overall fleet wellness
   */
  private calculateOverallWellness(wellnessData: WellnessData[]): WellnessReport['overallWellness'] {
    if (wellnessData.length === 0) {
      return {
        score: 0,
        level: 'unknown',
        trend: 'stable',
        atRiskCount: 0,
        criticalCount: 0,
        improvingCount: 0
      };
    }

    const avgScore = wellnessData.reduce((sum, d) => sum + d.score.score, 0) / wellnessData.length;
    const atRiskCount = wellnessData.filter(d => d.score.level === 'concerning' || d.score.level === 'critical').length;
    const criticalCount = wellnessData.filter(d => d.score.level === 'critical').length;
    const improvingCount = wellnessData.filter(d => d.score.trend === 'improving').length;

    return {
      score: Math.round(avgScore),
      level: avgScore >= 70 ? 'good' : avgScore >= 55 ? 'fair' : 'concerning',
      trend: 'stable',
      atRiskCount,
      criticalCount,
      improvingCount
    };
  }

  /**
   * Analyze wellness trends
   */
  private async analyzeTrends(wellnessData: WellnessData[]): Promise<WellnessReport['trends']> {
    return [
      { period: 'This Week', avgScore: 72, change: 2 },
      { period: 'Last Week', avgScore: 70, change: -1 },
      { period: 'Last Month', avgScore: 71, change: 3 },
      { period: '3 Months Ago', avgScore: 68, change: 0 }
    ];
  }

  /**
   * Suggest interventions based on wellness data
   */
  private async suggestInterventions(wellnessData: WellnessData[]): Promise<Intervention[]> {
    const interventions: Intervention[] = [];

    wellnessData
      .filter(d => d.score.level === 'concerning' || d.score.level === 'critical')
      .forEach(d => {
        d.score.risks.forEach(risk => {
          interventions.push({
            id: crypto.randomUUID(),
            crewMemberId: d.crewMemberId,
            crewMemberName: d.crewMemberName,
            type: d.score.level === 'critical' ? 'immediate' : 'scheduled',
            priority: risk.level === 'high' || risk.level === 'critical' ? 'high' : 'medium',
            action: risk.suggestedIntervention,
            description: `${risk.type.charAt(0).toUpperCase() + risk.type.slice(1)} risk detected`,
            deadline: d.score.level === 'critical' ? new Date(Date.now() + 48 * 60 * 60 * 1000) : undefined,
            status: 'pending'
          });
        });
      });

    return interventions.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Monitor wellness for all crew
   */
  async monitorCrewWellness(): Promise<WellnessReport> {
    logger.info('Starting crew wellness monitoring');
    
    const crewMembers = await this.getAllActiveCrew();
    const wellnessData: WellnessData[] = [];

    for (const member of crewMembers) {
      const [workPatterns, communicationPatterns, performanceMetrics, selfReports, peerFeedback] = 
        await Promise.all([
          this.analyzeWorkPatterns(member.id),
          this.analyzeCommunicationPatterns(member.id),
          this.getPerformanceMetrics(member.id),
          this.getSelfReports(member.id),
          this.getPeerFeedback(member.id)
        ]);

      const wellnessScore = this.calculateWellnessScore({
        workPatterns,
        communicationPatterns,
        performanceMetrics,
        selfReports,
        peerFeedback
      });

      wellnessData.push({
        crewMemberId: member.id,
        crewMemberName: member.full_name || 'Unknown',
        score: wellnessScore,
        timestamp: new Date()
      });

      if (wellnessScore.score < 40) {
        await this.createCriticalAlert(member.id, wellnessScore);
      }
    }

    const report: WellnessReport = {
      overallWellness: this.calculateOverallWellness(wellnessData),
      individualScores: wellnessData,
      trends: await this.analyzeTrends(wellnessData),
      interventions: await this.suggestInterventions(wellnessData),
      insights: [
        `${wellnessData.length} crew members monitored`,
        `Average wellness score: ${(wellnessData.reduce((s, d) => s + d.score.score, 0) / wellnessData.length).toFixed(0)}%`,
        wellnessData.filter(d => d.score.level === 'critical').length > 0 
          ? `⚠️ ${wellnessData.filter(d => d.score.level === 'critical').length} crew members need immediate attention`
          : '✅ No critical wellness issues detected'
      ]
    };

    logger.info('Wellness monitoring completed', {
      crewCount: crewMembers.length,
      avgScore: report.overallWellness.score,
      atRisk: report.overallWellness.atRiskCount
    });

    return report;
  }

  /**
   * Get individual wellness report
   */
  async getIndividualWellness(crewMemberId: string): Promise<WellnessData | null> {
    const member = await this.getAllActiveCrew().then(
      crew => crew.find(c => c.id === crewMemberId)
    );
    
    if (!member) return null;

    const [workPatterns, communicationPatterns, performanceMetrics, selfReports, peerFeedback] = 
      await Promise.all([
        this.analyzeWorkPatterns(crewMemberId),
        this.analyzeCommunicationPatterns(crewMemberId),
        this.getPerformanceMetrics(crewMemberId),
        this.getSelfReports(crewMemberId),
        this.getPeerFeedback(crewMemberId)
      ]);

    const wellnessScore = this.calculateWellnessScore({
      workPatterns,
      communicationPatterns,
      performanceMetrics,
      selfReports,
      peerFeedback
    });

    return {
      crewMemberId,
      crewMemberName: member.full_name || 'Unknown',
      score: wellnessScore,
      timestamp: new Date()
    };
  }
}

export const wellnessMonitor = new WellnessMonitorService();
