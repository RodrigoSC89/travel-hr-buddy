/**
 * Career Path AI Engine
 * Sugestões de progressão de carreira baseadas em performance
 */

export interface CrewProfile {
  id: string;
  name: string;
  current_rank: string;
  current_department: string;
  years_in_rank: number;
  total_sea_time_months: number;
  certifications: Certification[];
  performance_history: PerformanceRecord[];
  training_completed: TrainingRecord[];
  goals?: CareerGoal[];
}

export interface Certification {
  name: string;
  code: string;
  issued_date: string;
  expiry_date: string;
  issuing_authority: string;
  level?: string;
}

export interface PerformanceRecord {
  period: string;
  overall_score: number;
  technical_skills: number;
  leadership: number;
  teamwork: number;
  safety_compliance: number;
  comments?: string;
}

export interface TrainingRecord {
  course_name: string;
  completion_date: string;
  score?: number;
  provider: string;
  hours: number;
}

export interface CareerGoal {
  target_rank: string;
  target_timeframe_years: number;
  priority: 'low' | 'medium' | 'high';
}

export interface CareerRecommendation {
  type: 'promotion' | 'training' | 'certification' | 'experience' | 'lateral';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  requirements: string[];
  estimated_timeline: string;
  success_probability: number;
  benefits: string[];
}

export interface CareerPath {
  crew_member_id: string;
  crew_member_name: string;
  current_position: string;
  career_readiness_score: number;
  next_promotion: NextPromotion | null;
  alternative_paths: AlternativePath[];
  skill_gaps: SkillGap[];
  recommendations: CareerRecommendation[];
  timeline: CareerMilestone[];
}

export interface NextPromotion {
  target_rank: string;
  readiness_percentage: number;
  estimated_time_months: number;
  blocking_requirements: string[];
  completed_requirements: string[];
}

export interface AlternativePath {
  path_name: string;
  description: string;
  target_positions: string[];
  compatibility_score: number;
  required_training: string[];
}

export interface SkillGap {
  skill: string;
  current_level: number;
  required_level: number;
  gap_percentage: number;
  recommended_action: string;
}

export interface CareerMilestone {
  milestone: string;
  target_date: string;
  status: 'completed' | 'in_progress' | 'upcoming' | 'blocked';
  requirements: string[];
}

// Maritime rank hierarchy
const RANK_HIERARCHY: Record<string, { level: number; department: string; next: string[] }> = {
  // Deck Department
  'deck_cadet': { level: 1, department: 'deck', next: ['third_officer'] },
  'third_officer': { level: 2, department: 'deck', next: ['second_officer'] },
  'second_officer': { level: 3, department: 'deck', next: ['chief_officer'] },
  'chief_officer': { level: 4, department: 'deck', next: ['master'] },
  'master': { level: 5, department: 'deck', next: [] },
  
  // Engine Department
  'engine_cadet': { level: 1, department: 'engine', next: ['fourth_engineer'] },
  'fourth_engineer': { level: 2, department: 'engine', next: ['third_engineer'] },
  'third_engineer': { level: 3, department: 'engine', next: ['second_engineer'] },
  'second_engineer': { level: 4, department: 'engine', next: ['chief_engineer'] },
  'chief_engineer': { level: 5, department: 'engine', next: [] },
  
  // ETO
  'eto_trainee': { level: 1, department: 'eto', next: ['electro_technical_officer'] },
  'electro_technical_officer': { level: 3, department: 'eto', next: ['senior_eto'] },
  'senior_eto': { level: 4, department: 'eto', next: [] }
};

// Required certifications per rank
const RANK_REQUIREMENTS: Record<string, string[]> = {
  'third_officer': ['STCW', 'OOW Deck', 'GMDSS', 'Medical First Aid', 'Survival Craft'],
  'second_officer': ['STCW', 'OOW Deck', 'GMDSS', 'Medical Care', 'Advanced Firefighting'],
  'chief_officer': ['STCW', 'Chief Mate CoC', 'ISM/ISPS', 'Ship Handling'],
  'master': ['STCW', 'Master CoC', 'ISM/ISPS', 'BRM', 'Crisis Management'],
  'fourth_engineer': ['STCW', 'OOW Engine', 'Basic Safety'],
  'third_engineer': ['STCW', 'OOW Engine', 'Advanced Firefighting'],
  'second_engineer': ['STCW', 'Second Engineer CoC', 'ERM'],
  'chief_engineer': ['STCW', 'Chief Engineer CoC', 'ERM', 'ISM']
};

// Minimum sea time requirements (months)
const SEA_TIME_REQUIREMENTS: Record<string, number> = {
  'third_officer': 12,
  'second_officer': 24,
  'chief_officer': 48,
  'master': 72,
  'fourth_engineer': 12,
  'third_engineer': 24,
  'second_engineer': 48,
  'chief_engineer': 72
};

class CareerPathEngine {
  /**
   * Generate career path analysis for a crew member
   */
  analyzeCareerPath(profile: CrewProfile): CareerPath {
    const careerReadiness = this.calculateCareerReadiness(profile);
    const nextPromotion = this.assessNextPromotion(profile);
    const alternativePaths = this.identifyAlternativePaths(profile);
    const skillGaps = this.identifySkillGaps(profile);
    const recommendations = this.generateRecommendations(profile, nextPromotion, skillGaps);
    const timeline = this.createCareerTimeline(profile, nextPromotion);

    return {
      crew_member_id: profile.id,
      crew_member_name: profile.name,
      current_position: profile.current_rank,
      career_readiness_score: careerReadiness,
      next_promotion: nextPromotion,
      alternative_paths: alternativePaths,
      skill_gaps: skillGaps,
      recommendations,
      timeline
    };
  }

  /**
   * Get promotion requirements for a specific rank
   */
  getPromotionRequirements(currentRank: string): {
    nextRanks: string[];
    requirements: Record<string, { certifications: string[]; seaTime: number }>;
  } {
    const rankInfo = RANK_HIERARCHY[currentRank.toLowerCase().replace(/ /g, '_')];
    if (!rankInfo) {
      return { nextRanks: [], requirements: {} };
    }

    const requirements: Record<string, { certifications: string[]; seaTime: number }> = {};
    
    rankInfo.next.forEach(nextRank => {
      requirements[nextRank] = {
        certifications: RANK_REQUIREMENTS[nextRank] || [],
        seaTime: SEA_TIME_REQUIREMENTS[nextRank] || 0
      };
    });

    return { nextRanks: rankInfo.next, requirements };
  }

  /**
   * Compare two crew members for promotion
   */
  compareForPromotion(
    candidates: CrewProfile[],
    targetRank: string
  ): { ranking: Array<{ profile: CrewProfile; score: number; strengths: string[]; gaps: string[] }> } {
    const evaluations = candidates.map(profile => {
      const path = this.analyzeCareerPath(profile);
      const score = this.calculatePromotionScore(profile, targetRank);
      const strengths = this.identifyStrengths(profile);
      const gaps = path.skill_gaps.map(g => g.skill);

      return { profile, score, strengths, gaps };
    });

    return {
      ranking: evaluations.sort((a, b) => b.score - a.score)
    };
  }

  private calculateCareerReadiness(profile: CrewProfile): number {
    let score = 0;

    // Performance history (40%)
    if (profile.performance_history.length > 0) {
      const avgPerformance = profile.performance_history.reduce(
        (sum, p) => sum + p.overall_score, 0
      ) / profile.performance_history.length;
      score += avgPerformance * 0.4;
    }

    // Certifications (30%)
    const requiredCerts = RANK_REQUIREMENTS[profile.current_rank.toLowerCase().replace(/ /g, '_')] || [];
    const certMatch = requiredCerts.length > 0
      ? profile.certifications.filter(c => 
          requiredCerts.some(req => c.name.toLowerCase().includes(req.toLowerCase()))
        ).length / requiredCerts.length
      : 1;
    score += certMatch * 30;

    // Experience (20%)
    const requiredTime = SEA_TIME_REQUIREMENTS[profile.current_rank.toLowerCase().replace(/ /g, '_')] || 12;
    const timeScore = Math.min(1, profile.total_sea_time_months / requiredTime);
    score += timeScore * 20;

    // Training (10%)
    const trainingScore = Math.min(1, profile.training_completed.length / 5);
    score += trainingScore * 10;

    return Math.round(score);
  }

  private assessNextPromotion(profile: CrewProfile): NextPromotion | null {
    const rankKey = profile.current_rank.toLowerCase().replace(/ /g, '_');
    const rankInfo = RANK_HIERARCHY[rankKey];

    if (!rankInfo || rankInfo.next.length === 0) {
      return null; // Already at top rank
    }

    const targetRank = rankInfo.next[0];
    const requirements = RANK_REQUIREMENTS[targetRank] || [];
    const requiredSeaTime = SEA_TIME_REQUIREMENTS[targetRank] || 0;

    const completedReqs: string[] = [];
    const blockingReqs: string[] = [];

    // Check certifications
    requirements.forEach(req => {
      const hasCert = profile.certifications.some(c =>
        c.name.toLowerCase().includes(req.toLowerCase()) &&
        new Date(c.expiry_date) > new Date()
      );
      if (hasCert) {
        completedReqs.push(req);
      } else {
        blockingReqs.push(`Certificação: ${req}`);
      }
    });

    // Check sea time
    if (profile.total_sea_time_months >= requiredSeaTime) {
      completedReqs.push(`Tempo de mar: ${requiredSeaTime} meses`);
    } else {
      blockingReqs.push(`Tempo de mar: faltam ${requiredSeaTime - profile.total_sea_time_months} meses`);
    }

    // Check performance
    const recentPerformance = profile.performance_history.slice(0, 3);
    const avgPerformance = recentPerformance.length > 0
      ? recentPerformance.reduce((sum, p) => sum + p.overall_score, 0) / recentPerformance.length
      : 0;
    
    if (avgPerformance >= 75) {
      completedReqs.push('Performance adequada');
    } else {
      blockingReqs.push('Performance abaixo do esperado (mín: 75%)');
    }

    const readiness = completedReqs.length / (completedReqs.length + blockingReqs.length) * 100;
    const estimatedMonths = blockingReqs.length * 6; // Rough estimate

    return {
      target_rank: targetRank.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      readiness_percentage: Math.round(readiness),
      estimated_time_months: estimatedMonths,
      blocking_requirements: blockingReqs,
      completed_requirements: completedReqs
    };
  }

  private identifyAlternativePaths(profile: CrewProfile): AlternativePath[] {
    const paths: AlternativePath[] = [];
    const department = RANK_HIERARCHY[profile.current_rank.toLowerCase().replace(/ /g, '_')]?.department;

    // Shore-based career
    paths.push({
      path_name: 'Carreira em Terra',
      description: 'Transição para funções administrativas ou técnicas em terra',
      target_positions: ['Superintendente', 'DPA', 'HSEQ Manager', 'Vetting Inspector'],
      compatibility_score: profile.years_in_rank >= 5 ? 0.85 : 0.6,
      required_training: ['Gestão Portuária', 'ISM Auditor', 'Lead Auditor ISO']
    });

    // Specialized vessels
    if (department === 'deck' || department === 'engine') {
      paths.push({
        path_name: 'Especialização Offshore',
        description: 'Transição para embarcações de apoio offshore ou plataformas',
        target_positions: ['DPO', 'Master DP', 'Chief Engineer DP'],
        compatibility_score: 0.75,
        required_training: ['DP Basic', 'DP Advanced', 'DP Simulator']
      });
    }

    // Training/Education
    if (profile.performance_history.some(p => p.leadership >= 80)) {
      paths.push({
        path_name: 'Instrutor/Educador',
        description: 'Carreira em treinamento e formação de novos profissionais',
        target_positions: ['Instrutor de Simulador', 'Professor Náutico', 'Training Manager'],
        compatibility_score: 0.7,
        required_training: ['Didática', 'IMO Model Course 6.09', 'Assessor Training']
      });
    }

    return paths.sort((a, b) => b.compatibility_score - a.compatibility_score);
  }

  private identifySkillGaps(profile: CrewProfile): SkillGap[] {
    const gaps: SkillGap[] = [];
    const recentPerformance = profile.performance_history[0];

    if (!recentPerformance) return gaps;

    const skillThresholds: Record<string, number> = {
      technical_skills: 80,
      leadership: 75,
      teamwork: 80,
      safety_compliance: 90
    };

    if (recentPerformance.technical_skills < skillThresholds.technical_skills) {
      gaps.push({
        skill: 'Habilidades Técnicas',
        current_level: recentPerformance.technical_skills,
        required_level: skillThresholds.technical_skills,
        gap_percentage: Math.round((skillThresholds.technical_skills - recentPerformance.technical_skills) / skillThresholds.technical_skills * 100),
        recommended_action: 'Completar treinamentos técnicos avançados'
      });
    }

    if (recentPerformance.leadership < skillThresholds.leadership) {
      gaps.push({
        skill: 'Liderança',
        current_level: recentPerformance.leadership,
        required_level: skillThresholds.leadership,
        gap_percentage: Math.round((skillThresholds.leadership - recentPerformance.leadership) / skillThresholds.leadership * 100),
        recommended_action: 'Participar de programas de desenvolvimento de liderança'
      });
    }

    if (recentPerformance.teamwork < skillThresholds.teamwork) {
      gaps.push({
        skill: 'Trabalho em Equipe',
        current_level: recentPerformance.teamwork,
        required_level: skillThresholds.teamwork,
        gap_percentage: Math.round((skillThresholds.teamwork - recentPerformance.teamwork) / skillThresholds.teamwork * 100),
        recommended_action: 'Treinamento em gestão de recursos de ponte/máquinas'
      });
    }

    if (recentPerformance.safety_compliance < skillThresholds.safety_compliance) {
      gaps.push({
        skill: 'Conformidade de Segurança',
        current_level: recentPerformance.safety_compliance,
        required_level: skillThresholds.safety_compliance,
        gap_percentage: Math.round((skillThresholds.safety_compliance - recentPerformance.safety_compliance) / skillThresholds.safety_compliance * 100),
        recommended_action: 'Reciclagem em procedimentos de segurança e ISM'
      });
    }

    return gaps.sort((a, b) => b.gap_percentage - a.gap_percentage);
  }

  private generateRecommendations(
    profile: CrewProfile,
    nextPromotion: NextPromotion | null,
    skillGaps: SkillGap[]
  ): CareerRecommendation[] {
    const recommendations: CareerRecommendation[] = [];

    // Promotion-related recommendations
    if (nextPromotion && nextPromotion.readiness_percentage >= 80) {
      recommendations.push({
        type: 'promotion',
        priority: 'high',
        title: `Promoção para ${nextPromotion.target_rank}`,
        description: `Candidato está ${nextPromotion.readiness_percentage}% pronto para promoção`,
        requirements: nextPromotion.blocking_requirements,
        estimated_timeline: `${nextPromotion.estimated_time_months} meses`,
        success_probability: nextPromotion.readiness_percentage / 100,
        benefits: ['Aumento salarial', 'Maior responsabilidade', 'Desenvolvimento profissional']
      });
    }

    // Certification recommendations
    if (nextPromotion) {
      nextPromotion.blocking_requirements
        .filter(r => r.includes('Certificação'))
        .forEach(cert => {
          recommendations.push({
            type: 'certification',
            priority: 'high',
            title: cert,
            description: 'Certificação necessária para progressão de carreira',
            requirements: ['Matrícula em curso aprovado', 'Aprovação em exame'],
            estimated_timeline: '3-6 meses',
            success_probability: 0.85,
            benefits: ['Pré-requisito para promoção', 'Valorização profissional']
          });
        });
    }

    // Skill gap recommendations
    skillGaps.forEach(gap => {
      recommendations.push({
        type: 'training',
        priority: gap.gap_percentage > 20 ? 'high' : 'medium',
        title: `Desenvolver ${gap.skill}`,
        description: gap.recommended_action,
        requirements: ['Participação em treinamento', 'Prática supervisionada'],
        estimated_timeline: '2-4 meses',
        success_probability: 0.8,
        benefits: ['Melhoria de performance', 'Preparação para promoção']
      });
    });

    // Experience recommendations
    if (profile.years_in_rank >= 3 && profile.performance_history.length > 0) {
      const avgPerf = profile.performance_history.reduce((sum, p) => sum + p.overall_score, 0) / profile.performance_history.length;
      if (avgPerf >= 80) {
        recommendations.push({
          type: 'experience',
          priority: 'medium',
          title: 'Experiência em diferentes tipos de embarcação',
          description: 'Diversificar experiência para aumentar empregabilidade',
          requirements: ['Disponibilidade para embarque', 'Adaptabilidade'],
          estimated_timeline: '12-18 meses',
          success_probability: 0.9,
          benefits: ['Versatilidade', 'Mais oportunidades', 'Desenvolvimento técnico']
        });
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private createCareerTimeline(
    profile: CrewProfile,
    nextPromotion: NextPromotion | null
  ): CareerMilestone[] {
    const milestones: CareerMilestone[] = [];
    const now = new Date();

    // Current certifications expiring
    profile.certifications
      .filter(c => {
        const expiry = new Date(c.expiry_date);
        const monthsToExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return monthsToExpiry <= 12 && monthsToExpiry > 0;
      })
      .forEach(cert => {
        milestones.push({
          milestone: `Renovar ${cert.name}`,
          target_date: new Date(new Date(cert.expiry_date).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'upcoming',
          requirements: ['Reciclagem', 'Exame']
        });
      });

    // Next promotion milestones
    if (nextPromotion) {
      nextPromotion.blocking_requirements.forEach((req, index) => {
        const targetDate = new Date(now.getTime() + (index + 1) * 3 * 30 * 24 * 60 * 60 * 1000);
        milestones.push({
          milestone: req,
          target_date: targetDate.toISOString(),
          status: 'upcoming',
          requirements: [req]
        });
      });

      const promotionDate = new Date(now.getTime() + nextPromotion.estimated_time_months * 30 * 24 * 60 * 60 * 1000);
      milestones.push({
        milestone: `Promoção para ${nextPromotion.target_rank}`,
        target_date: promotionDate.toISOString(),
        status: nextPromotion.readiness_percentage >= 100 ? 'in_progress' : 'blocked',
        requirements: nextPromotion.blocking_requirements.length > 0
          ? nextPromotion.blocking_requirements
          : ['Todos requisitos atendidos']
      });
    }

    return milestones.sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime());
  }

  private calculatePromotionScore(profile: CrewProfile, targetRank: string): number {
    let score = 0;

    // Performance (40%)
    if (profile.performance_history.length > 0) {
      const avgPerf = profile.performance_history.reduce((sum, p) => sum + p.overall_score, 0) / profile.performance_history.length;
      score += avgPerf * 0.4;
    }

    // Experience (30%)
    const requiredTime = SEA_TIME_REQUIREMENTS[targetRank.toLowerCase().replace(/ /g, '_')] || 12;
    const expScore = Math.min(100, (profile.total_sea_time_months / requiredTime) * 100);
    score += expScore * 0.3;

    // Certifications (20%)
    const requirements = RANK_REQUIREMENTS[targetRank.toLowerCase().replace(/ /g, '_')] || [];
    const certMatch = requirements.length > 0
      ? profile.certifications.filter(c =>
          requirements.some(req => c.name.toLowerCase().includes(req.toLowerCase()))
        ).length / requirements.length * 100
      : 100;
    score += certMatch * 0.2;

    // Training (10%)
    const trainingScore = Math.min(100, profile.training_completed.length * 10);
    score += trainingScore * 0.1;

    return Math.round(score);
  }

  private identifyStrengths(profile: CrewProfile): string[] {
    const strengths: string[] = [];
    const recentPerf = profile.performance_history[0];

    if (recentPerf) {
      if (recentPerf.technical_skills >= 85) strengths.push('Excelentes habilidades técnicas');
      if (recentPerf.leadership >= 85) strengths.push('Forte liderança');
      if (recentPerf.teamwork >= 85) strengths.push('Ótimo trabalho em equipe');
      if (recentPerf.safety_compliance >= 95) strengths.push('Exemplar em segurança');
    }

    if (profile.total_sea_time_months >= 60) {
      strengths.push('Ampla experiência marítima');
    }

    if (profile.certifications.length >= 10) {
      strengths.push('Certificações abrangentes');
    }

    if (profile.training_completed.length >= 15) {
      strengths.push('Comprometimento com desenvolvimento');
    }

    return strengths;
  }
}

export const careerPathEngine = new CareerPathEngine();
