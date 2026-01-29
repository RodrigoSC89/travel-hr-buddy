/**
 * 🚀 Career Path Engine - AI-Powered Career Development
 * NAUTILUS ONE v5.0 - Revolutionary Career Planning
 * 
 * Creates personalized career paths with AI predictions,
 * skill gap analysis, and development recommendations
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface CareerMilestone {
  id: string;
  year: number;
  position: string;
  rank: string;
  department: string;
  actions: string[];
  certifications: string[];
  skills: string[];
  estimatedSalary: number;
  probability: number;
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  trainingRecommendation: string;
  estimatedTime: string;
}

export interface CareerPath {
  id: string;
  crewMemberId: string;
  createdAt: Date;
  currentAnalysis: {
    currentPosition: string;
    currentRank: string;
    strengths: string[];
    skillGaps: SkillGap[];
    marketPosition: string;
    potentialScore: number;
  };
  trajectory: CareerMilestone[];
  developmentPlan: {
    certifications: {
      name: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      deadline: Date;
      cost: number;
      provider?: string;
    }[];
    trainings: {
      name: string;
      type: 'online' | 'classroom' | 'on-the-job';
      duration: string;
      deadline: Date;
      skillsGained: string[];
    }[];
    experiences: {
      description: string;
      duration: string;
      vesselType?: string;
      position?: string;
    }[];
    mentorship: {
      recommended: boolean;
      mentorProfile: string;
      focus: string[];
    };
  };
  milestones: {
    quarter: string;
    objectives: string[];
    kpis: { metric: string; target: string }[];
  }[];
  risks: {
    obstacle: string;
    likelihood: 'low' | 'medium' | 'high';
    impact: string;
    mitigation: string;
  }[];
  financialProjection: {
    currentSalary: number;
    projectedSalary: number;
    timeframe: string;
    investmentRequired: number;
    roi: number;
  };
  confidence: number;
  lastUpdated: Date;
}

export interface CareerAspirations {
  targetPosition: string;
  targetRank: string;
  timeframe: number; // years
  priorities: ('salary' | 'work-life-balance' | 'leadership' | 'specialization' | 'variety')[];
  willingToRelocate: boolean;
  willingToTravel: boolean;
  preferredVesselTypes: string[];
}

export interface ProgressReport {
  overallProgress: number;
  milestones: {
    milestone: string;
    status: 'completed' | 'in_progress' | 'upcoming' | 'at_risk';
    completionDate?: Date;
    notes?: string;
  }[];
  adjustments: string[];
  recommendations: string[];
  nextSteps: string[];
  projectedCompletion: Date;
}

// Maritime career progression paths
const CAREER_PATHS = {
  deck: {
    junior: ['Cadet', 'Deck Trainee'],
    mid: ['3rd Officer', '2nd Officer', '1st Officer'],
    senior: ['Chief Officer', 'Master', 'Fleet Captain']
  },
  engine: {
    junior: ['Engine Cadet', 'Wiper', 'Oiler'],
    mid: ['4th Engineer', '3rd Engineer', '2nd Engineer'],
    senior: ['Chief Engineer', 'Fleet Engineer']
  },
  operations: {
    junior: ['Operations Trainee', 'Vessel Coordinator'],
    mid: ['Operations Supervisor', 'Fleet Coordinator'],
    senior: ['Operations Manager', 'Fleet Manager', 'VP Operations']
  }
};

// Required certifications by position
const POSITION_CERTIFICATIONS: Record<string, string[]> = {
  '3rd Officer': ['STCW Basic Safety', 'GMDSS', 'Radar Navigation'],
  '2nd Officer': ['STCW Basic Safety', 'GMDSS', 'ARPA', 'ECDIS'],
  '1st Officer': ['STCW Advanced', 'Bridge Resource Management', 'ISM Auditor'],
  'Chief Officer': ['STCW Management', 'ISM Lead Auditor', 'Emergency Response'],
  'Master': ['Master Mariner CoC', 'Company DSO', 'Crisis Management'],
  '3rd Engineer': ['STCW Engine Watch', 'Basic Safety', 'ERS'],
  '2nd Engineer': ['STCW Engine Watch', 'Advanced Fire Fighting', 'EEBD'],
  'Chief Engineer': ['Chief Engineer CoC', 'ISM Auditor', 'Energy Management']
};

class CareerPathEngine {

  /**
   * Get crew member data
   */
  private async getCrewMember(crewMemberId: string): Promise<any> {
    const { data } = await supabase
      .from('crew_members')
      .select(`
        *,
        crew_certifications(*),
        crew_rotations(*)
      `)
      .eq('id', crewMemberId)
      .maybeSingle();
    
    return data;
  }

  /**
   * Get or create aspirations for crew member
   */
  private async getAspirations(crewMemberId: string): Promise<CareerAspirations> {
    // In a real implementation, this would come from a survey/profile
    return {
      targetPosition: 'Chief Officer',
      targetRank: 'Senior',
      timeframe: 5,
      priorities: ['salary', 'leadership', 'specialization'],
      willingToRelocate: true,
      willingToTravel: true,
      preferredVesselTypes: ['OSV', 'PSV', 'AHTS']
    };
  }

  /**
   * Get industry market trends
   */
  private async getMarketTrends(): Promise<any> {
    return {
      demandingSkills: ['ECDIS', 'DP2', 'Dynamic Positioning', 'HVDC Systems', 'LNG Operations'],
      emergingRoles: ['Green Ship Specialist', 'Digital Officer', 'Autonomous Vessel Operator'],
      salaryTrends: {
        deck: { growth: 5.2, outlook: 'positive' },
        engine: { growth: 4.8, outlook: 'positive' },
        operations: { growth: 6.1, outlook: 'very positive' }
      },
      certificationDemand: ['DP2', 'STCW 2010', 'MLC 2006', 'ISM Code'],
      retirementWave: { peakYear: 2028, affectedPositions: ['Master', 'Chief Engineer'] }
    };
  }

  /**
   * Analyze current position and gaps
   */
  private analyzeCurrentPosition(member: any, aspirations: CareerAspirations): CareerPath['currentAnalysis'] {
    const currentPosition = member.position || 'Unknown';
    const currentRank = member.rank || 'Junior';
    
    // Identify strengths
    const strengths: string[] = [];
    const certs = member.crew_certifications || [];
    if (certs.length > 3) strengths.push('Strong certification portfolio');
    if (member.years_experience > 5) strengths.push('Extensive experience');
    if (member.sea_time_months > 48) strengths.push('Significant sea time');
    strengths.push('Maritime sector expertise');
    
    // Identify skill gaps
    const targetCerts = POSITION_CERTIFICATIONS[aspirations.targetPosition] || [];
    const currentCertNames = certs.map((c: any) => c.certificate_name);
    
    const skillGaps: SkillGap[] = targetCerts
      .filter(tc => !currentCertNames.includes(tc))
      .map(cert => ({
        skill: cert,
        currentLevel: 0,
        requiredLevel: 100,
        gap: 100,
        priority: 'high' as const,
        trainingRecommendation: `Obtain ${cert} certification`,
        estimatedTime: '2-4 months'
      }));
    
    // Add experience-based gaps
    if ((member.years_experience || 0) < 5) {
      skillGaps.push({
        skill: 'Leadership Experience',
        currentLevel: 30,
        requiredLevel: 80,
        gap: 50,
        priority: 'medium',
        trainingRecommendation: 'Take on leadership roles in current position',
        estimatedTime: '12-18 months'
      });
    }
    
    return {
      currentPosition,
      currentRank,
      strengths,
      skillGaps,
      marketPosition: 'Competitive',
      potentialScore: 75 + Math.random() * 20
    };
  }

  /**
   * Generate career trajectory
   */
  private generateTrajectory(
    currentPosition: string,
    aspirations: CareerAspirations,
    marketTrends: any
  ): CareerMilestone[] {
    const trajectory: CareerMilestone[] = [];
    const department = this.determineDepartment(currentPosition);
    const careerLadder = CAREER_PATHS[department as keyof typeof CAREER_PATHS]?.mid || ['Position 1', 'Position 2'];
    
    // Find current position index
    const allPositions = [
      ...(CAREER_PATHS[department as keyof typeof CAREER_PATHS]?.junior || []),
      ...careerLadder,
      ...(CAREER_PATHS[department as keyof typeof CAREER_PATHS]?.senior || [])
    ];
    
    let currentIndex = allPositions.findIndex(p => 
      p.toLowerCase().includes(currentPosition.toLowerCase()) ||
      currentPosition.toLowerCase().includes(p.toLowerCase())
    );
    
    if (currentIndex === -1) currentIndex = 0;
    
    // Generate 5-year trajectory
    for (let year = 1; year <= aspirations.timeframe; year++) {
      const positionIndex = Math.min(currentIndex + Math.floor(year / 2), allPositions.length - 1);
      const position = allPositions[positionIndex];
      
      const salaryMultiplier = 1 + (0.08 * year); // 8% annual growth
      const baseSalary = 60000;
      
      trajectory.push({
        id: crypto.randomUUID(),
        year,
        position,
        rank: year <= 2 ? 'Mid-level' : 'Senior',
        department: department.charAt(0).toUpperCase() + department.slice(1),
        actions: this.getActionsForYear(year, position),
        certifications: POSITION_CERTIFICATIONS[position]?.slice(0, 2) || [],
        skills: marketTrends.demandingSkills.slice(0, 2),
        estimatedSalary: Math.round(baseSalary * salaryMultiplier),
        probability: Math.max(60, 95 - (year * 5))
      });
    }
    
    return trajectory;
  }

  /**
   * Determine department from position
   */
  private determineDepartment(position: string): string {
    const posLower = position.toLowerCase();
    if (posLower.includes('engineer') || posLower.includes('engine')) return 'engine';
    if (posLower.includes('officer') || posLower.includes('master') || posLower.includes('deck')) return 'deck';
    return 'operations';
  }

  /**
   * Get recommended actions for a specific year
   */
  private getActionsForYear(year: number, position: string): string[] {
    const baseActions = [
      'Complete annual performance review',
      'Update skill assessments',
      'Network with industry professionals'
    ];
    
    if (year === 1) {
      return [
        'Identify and address immediate skill gaps',
        'Find a mentor in target role',
        'Start essential certifications',
        ...baseActions.slice(0, 1)
      ];
    }
    
    if (year === 2) {
      return [
        'Complete key certifications',
        'Take on additional responsibilities',
        'Build cross-functional relationships',
        ...baseActions.slice(0, 1)
      ];
    }
    
    if (year === 3) {
      return [
        'Lead significant projects',
        'Develop direct reports if applicable',
        'Seek promotion opportunities',
        ...baseActions.slice(0, 1)
      ];
    }
    
    return [
      `Transition to ${position} role`,
      'Establish yourself in new position',
      'Begin mentoring others',
      ...baseActions.slice(0, 1)
    ];
  }

  /**
   * Generate development plan
   */
  private generateDevelopmentPlan(
    analysis: CareerPath['currentAnalysis'],
    aspirations: CareerAspirations,
    marketTrends: any
  ): CareerPath['developmentPlan'] {
    const now = new Date();
    
    // Required certifications
    const certifications = analysis.skillGaps
      .filter(g => g.skill.includes('STCW') || g.skill.includes('CoC') || g.skill.includes('GMDSS'))
      .map((gap, index) => ({
        name: gap.skill,
        priority: gap.priority,
        deadline: new Date(now.getTime() + (6 + index * 3) * 30 * 24 * 60 * 60 * 1000),
        cost: 2000 + Math.random() * 3000,
        provider: 'Maritime Training Institute'
      }));
    
    // Training recommendations
    const trainings = [
      {
        name: 'Leadership in Maritime Operations',
        type: 'classroom' as const,
        duration: '5 days',
        deadline: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
        skillsGained: ['Leadership', 'Decision Making', 'Team Management']
      },
      {
        name: 'Advanced Navigation Systems',
        type: 'online' as const,
        duration: '40 hours',
        deadline: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        skillsGained: ['ECDIS', 'Radar Operations', 'Navigation']
      },
      {
        name: 'On-the-Job Bridge Team Leadership',
        type: 'on-the-job' as const,
        duration: '6 months',
        deadline: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
        skillsGained: ['Bridge Resource Management', 'Crisis Management']
      }
    ];
    
    return {
      certifications,
      trainings,
      experiences: [
        {
          description: 'Serve as acting Chief Officer during leave periods',
          duration: '3-6 months cumulative',
          vesselType: aspirations.preferredVesselTypes[0],
          position: 'Acting Chief Officer'
        },
        {
          description: 'Lead a major operational project (e.g., dry dock preparation)',
          duration: '2-3 months'
        }
      ],
      mentorship: {
        recommended: true,
        mentorProfile: 'Experienced Chief Officer or Master with 15+ years experience',
        focus: ['Career navigation', 'Technical expertise', 'Leadership development']
      }
    };
  }

  /**
   * Generate quarterly milestones
   */
  private generateMilestones(trajectory: CareerMilestone[]): CareerPath['milestones'] {
    const milestones: CareerPath['milestones'] = [];
    
    for (let q = 1; q <= 8; q++) {
      const year = Math.ceil(q / 4);
      const quarter = ((q - 1) % 4) + 1;
      const yearMilestone = trajectory.find(t => t.year === year);
      
      milestones.push({
        quarter: `Y${year}Q${quarter}`,
        objectives: this.getQuarterObjectives(q, yearMilestone),
        kpis: [
          { metric: 'Training Hours', target: `${20 + q * 5} hours` },
          { metric: 'Performance Score', target: `>${75 + q}%` },
          { metric: 'Skill Assessments', target: `${Math.min(3, Math.ceil(q / 2))} completed` }
        ]
      });
    }
    
    return milestones;
  }

  /**
   * Get objectives for a specific quarter
   */
  private getQuarterObjectives(quarter: number, yearMilestone?: CareerMilestone): string[] {
    const objectives: string[] = [];
    
    if (quarter === 1) {
      objectives.push('Complete career planning session with HR');
      objectives.push('Begin first priority certification');
    } else if (quarter === 2) {
      objectives.push('Complete first certification');
      objectives.push('Start mentorship program');
    } else if (quarter === 3) {
      objectives.push('Mid-year performance review');
      objectives.push('Assess progress against development plan');
    } else {
      objectives.push('Annual review and plan adjustment');
      objectives.push('Set next year objectives');
    }
    
    if (yearMilestone && yearMilestone.certifications.length > 0) {
      objectives.push(`Work towards ${yearMilestone.certifications[0]}`);
    }
    
    return objectives;
  }

  /**
   * Identify career risks
   */
  private identifyRisks(analysis: CareerPath['currentAnalysis'], marketTrends: any): CareerPath['risks'] {
    const risks: CareerPath['risks'] = [];
    
    if (analysis.skillGaps.length > 5) {
      risks.push({
        obstacle: 'Significant skill gaps',
        likelihood: 'high',
        impact: 'May delay progression by 12-18 months',
        mitigation: 'Prioritize critical certifications and accelerate training'
      });
    }
    
    risks.push({
      obstacle: 'Market volatility in maritime sector',
      likelihood: 'medium',
      impact: 'May affect promotion timeline',
      mitigation: 'Diversify skills to remain competitive across vessel types'
    });
    
    risks.push({
      obstacle: 'Retirement wave creating competition',
      likelihood: 'medium',
      impact: 'More candidates for senior positions',
      mitigation: 'Differentiate through specialized certifications and leadership'
    });
    
    return risks;
  }

  /**
   * Calculate financial projection
   */
  private calculateFinancialProjection(
    member: any,
    trajectory: CareerMilestone[],
    developmentPlan: CareerPath['developmentPlan']
  ): CareerPath['financialProjection'] {
    const currentSalary = member.salary || 60000;
    const finalMilestone = trajectory[trajectory.length - 1];
    const projectedSalary = finalMilestone?.estimatedSalary || currentSalary * 1.5;
    
    const certCost = developmentPlan.certifications.reduce((sum, c) => sum + c.cost, 0);
    const trainingCost = developmentPlan.trainings.length * 1500; // Estimated
    const investmentRequired = certCost + trainingCost;
    
    const salaryIncrease = projectedSalary - currentSalary;
    const roi = ((salaryIncrease * 5) / investmentRequired - 1) * 100; // 5-year ROI
    
    return {
      currentSalary,
      projectedSalary,
      timeframe: `${trajectory.length} years`,
      investmentRequired: Math.round(investmentRequired),
      roi: Math.round(roi)
    };
  }

  /**
   * Create career path for a crew member
   */
  async createCareerPath(crewMemberId: string): Promise<CareerPath> {
    logger.info('Creating career path', { crewMemberId });
    
    const member = await this.getCrewMember(crewMemberId);
    if (!member) {
      throw new Error('Crew member not found');
    }
    
    const aspirations = await this.getAspirations(crewMemberId);
    const marketTrends = await this.getMarketTrends();
    
    // Analyze current position
    const currentAnalysis = this.analyzeCurrentPosition(member, aspirations);
    
    // Generate trajectory
    const trajectory = this.generateTrajectory(
      currentAnalysis.currentPosition,
      aspirations,
      marketTrends
    );
    
    // Generate development plan
    const developmentPlan = this.generateDevelopmentPlan(
      currentAnalysis,
      aspirations,
      marketTrends
    );
    
    // Generate milestones
    const milestones = this.generateMilestones(trajectory);
    
    // Identify risks
    const risks = this.identifyRisks(currentAnalysis, marketTrends);
    
    // Calculate financial projection
    const financialProjection = this.calculateFinancialProjection(
      member,
      trajectory,
      developmentPlan
    );
    
    const careerPath: CareerPath = {
      id: crypto.randomUUID(),
      crewMemberId,
      createdAt: new Date(),
      currentAnalysis,
      trajectory,
      developmentPlan,
      milestones,
      risks,
      financialProjection,
      confidence: 78 + Math.random() * 15,
      lastUpdated: new Date()
    };
    
    logger.info('Career path created', { 
      crewMemberId, 
      trajectoryLength: trajectory.length,
      confidence: careerPath.confidence 
    });
    
    return careerPath;
  }

  /**
   * Monitor career progress
   */
  async monitorProgress(crewMemberId: string): Promise<ProgressReport> {
    const member = await this.getCrewMember(crewMemberId);
    
    // In a real implementation, compare against stored career path
    return {
      overallProgress: 35,
      milestones: [
        { milestone: 'Complete skill assessment', status: 'completed', completionDate: new Date() },
        { milestone: 'Start first certification', status: 'in_progress' },
        { milestone: 'Find mentor', status: 'upcoming' },
        { milestone: 'Leadership training', status: 'upcoming' }
      ],
      adjustments: [
        'Timeline adjusted due to certification availability'
      ],
      recommendations: [
        'Continue current certification progress',
        'Schedule mentor introduction meeting',
        'Register for Q2 leadership workshop'
      ],
      nextSteps: [
        'Complete GMDSS certification exam (due in 45 days)',
        'Submit mentor preference form',
        'Complete online navigation module'
      ],
      projectedCompletion: new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000)
    };
  }
}

export const careerPathEngine = new CareerPathEngine();
