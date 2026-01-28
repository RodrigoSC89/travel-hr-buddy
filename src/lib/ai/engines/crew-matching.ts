/**
 * Intelligent Crew Matching Engine
 * IA monta rosters otimizados considerando certificações, preferências e histórico
 * Nível: Semi-autônomo
 */

export interface CrewCandidate {
  id: string;
  name: string;
  nationality: string;
  currentPosition: string;
  targetPosition: string;
  certifications: CertificationRecord[];
  experience: ExperienceRecord[];
  availability: AvailabilityWindow;
  preferences: CrewPreferences;
  performanceHistory: PerformanceRecord[];
  languageSkills: LanguageSkill[];
  medicalStatus: MedicalStatus;
  lastVessel: string | null;
  contractHistory: ContractRecord[];
}

export interface CertificationRecord {
  type: string;
  code: string;
  issueDate: Date;
  expiryDate: Date;
  issuingAuthority: string;
  status: 'valid' | 'expiring_soon' | 'expired';
}

export interface ExperienceRecord {
  vesselType: string;
  position: string;
  company: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  rating: number;
}

export interface AvailabilityWindow {
  availableFrom: Date;
  availableUntil: Date;
  preferredContractLength: number; // months
  flexibleDates: boolean;
}

export interface CrewPreferences {
  preferredVesselTypes: string[];
  preferredRoutes: string[];
  maxContractLength: number;
  minSalary: number;
  rotationPreference: 'equal' | 'extended_on' | 'extended_off';
  teamPreferences: string[]; // colleague IDs they work well with
  avoidList: string[]; // colleague IDs to avoid
}

export interface PerformanceRecord {
  period: string;
  score: number;
  feedback: string;
  strengths: string[];
  areasForImprovement: string[];
}

export interface LanguageSkill {
  language: string;
  level: 'basic' | 'intermediate' | 'fluent' | 'native';
}

export interface MedicalStatus {
  lastExamDate: Date;
  expiryDate: Date;
  status: 'fit' | 'fit_with_restrictions' | 'unfit' | 'pending';
  restrictions: string[];
}

export interface ContractRecord {
  vesselId: string;
  vesselName: string;
  startDate: Date;
  endDate: Date;
  position: string;
  performanceRating: number;
  earlyTermination: boolean;
  terminationReason?: string;
}

export interface CrewVesselPosition {
  positionId: string;
  vesselId: string;
  vesselName: string;
  vesselType: string;
  position: string;
  requiredCertifications: string[];
  minimumExperience: number; // months
  requiredLanguages: string[];
  startDate: Date;
  contractLength: number; // months
  salaryRange: { min: number; max: number };
  route: string;
  priority: 'normal' | 'high' | 'critical';
}

export interface MatchResult {
  candidateId: string;
  candidateName: string;
  positionId: string;
  vesselName: string;
  position: string;
  overallScore: number;
  matchBreakdown: MatchBreakdown;
  compatibilityFactors: CompatibilityFactor[];
  risks: MatchRisk[];
  recommendation: 'highly_recommended' | 'recommended' | 'acceptable' | 'not_recommended';
  estimatedRetention: number; // percentage likelihood of completing contract
}

export interface MatchBreakdown {
  certificationScore: number;
  experienceScore: number;
  availabilityScore: number;
  preferenceScore: number;
  performanceScore: number;
  teamCompatibilityScore: number;
  languageScore: number;
}

export interface CompatibilityFactor {
  factor: string;
  impact: 'positive' | 'neutral' | 'negative';
  description: string;
  weight: number;
}

export interface MatchRisk {
  risk: string;
  severity: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface RosterSuggestion {
  vesselId: string;
  vesselName: string;
  positions: RosterPosition[];
  overallCompatibility: number;
  teamDynamicsScore: number;
  operationalReadiness: number;
  estimatedCost: number;
  warnings: string[];
}

export interface RosterPosition {
  position: string;
  suggestedCandidate: MatchResult;
  alternativeCandidates: MatchResult[];
  filledStatus: 'suggested' | 'confirmed' | 'vacant';
}

class CrewMatchingEngine {
  private readonly CERTIFICATION_WEIGHT = 0.25;
  private readonly EXPERIENCE_WEIGHT = 0.20;
  private readonly AVAILABILITY_WEIGHT = 0.15;
  private readonly PREFERENCE_WEIGHT = 0.15;
  private readonly PERFORMANCE_WEIGHT = 0.15;
  private readonly TEAM_WEIGHT = 0.05;
  private readonly LANGUAGE_WEIGHT = 0.05;

  findBestMatches(
    position: CrewVesselPosition,
    candidates: CrewCandidate[],
    existingCrew: string[] = []
  ): MatchResult[] {
    const results: MatchResult[] = [];

    for (const candidate of candidates) {
      const matchResult = this.evaluateMatch(candidate, position, existingCrew);
      results.push(matchResult);
    }

    return results
      .filter(r => r.overallScore >= 40)
      .sort((a, b) => b.overallScore - a.overallScore);
  }

  evaluateMatch(
    candidate: CrewCandidate,
    position: CrewVesselPosition,
    existingCrew: string[]
  ): MatchResult {
    const breakdown = this.calculateMatchBreakdown(candidate, position, existingCrew);
    const overallScore = this.calculateOverallScore(breakdown);
    const factors = this.identifyCompatibilityFactors(candidate, position);
    const risks = this.identifyRisks(candidate, position);

    return {
      candidateId: candidate.id,
      candidateName: candidate.name,
      positionId: position.positionId,
      vesselName: position.vesselName,
      position: position.position,
      overallScore,
      matchBreakdown: breakdown,
      compatibilityFactors: factors,
      risks,
      recommendation: this.getRecommendation(overallScore, risks),
      estimatedRetention: this.estimateRetention(candidate, position, overallScore)
    };
  }

  private calculateMatchBreakdown(
    candidate: CrewCandidate,
    position: CrewVesselPosition,
    existingCrew: string[]
  ): MatchBreakdown {
    return {
      certificationScore: this.scoreCertifications(candidate, position),
      experienceScore: this.scoreExperience(candidate, position),
      availabilityScore: this.scoreAvailability(candidate, position),
      preferenceScore: this.scorePreferences(candidate, position),
      performanceScore: this.scorePerformance(candidate),
      teamCompatibilityScore: this.scoreTeamCompatibility(candidate, existingCrew),
      languageScore: this.scoreLanguages(candidate, position)
    };
  }

  private calculateOverallScore(breakdown: MatchBreakdown): number {
    return Math.round(
      breakdown.certificationScore * this.CERTIFICATION_WEIGHT +
      breakdown.experienceScore * this.EXPERIENCE_WEIGHT +
      breakdown.availabilityScore * this.AVAILABILITY_WEIGHT +
      breakdown.preferenceScore * this.PREFERENCE_WEIGHT +
      breakdown.performanceScore * this.PERFORMANCE_WEIGHT +
      breakdown.teamCompatibilityScore * this.TEAM_WEIGHT +
      breakdown.languageScore * this.LANGUAGE_WEIGHT
    );
  }

  private scoreCertifications(candidate: CrewCandidate, position: CrewVesselPosition): number {
    const required = position.requiredCertifications;
    if (required.length === 0) return 100;

    const validCerts = candidate.certifications.filter(c => c.status === 'valid');
    const matchedCerts = required.filter((req: string) =>
      validCerts.some(cert => cert.code === req || cert.type.includes(req))
    );

    const baseScore = (matchedCerts.length / required.length) * 100;
    
    // Penalty for expiring certifications
    const expiringPenalty = candidate.certifications
      .filter(c => c.status === 'expiring_soon')
      .length * 5;

    return Math.max(0, baseScore - expiringPenalty);
  }

  private scoreExperience(candidate: CrewCandidate, position: CrewVesselPosition): number {
    const relevantExperience = candidate.experience.filter(
      exp => exp.vesselType === position.vesselType || exp.position === position.position
    );

    const totalMonths = relevantExperience.reduce((sum, exp) => sum + (exp.totalDays / 30), 0);
    const requiredMonths = position.minimumExperience;

    if (totalMonths >= requiredMonths * 2) return 100;
    if (totalMonths >= requiredMonths) return 80 + (totalMonths - requiredMonths) / requiredMonths * 20;
    if (totalMonths >= requiredMonths * 0.7) return 60;
    return Math.max(0, (totalMonths / requiredMonths) * 50);
  }

  private scoreAvailability(candidate: CrewCandidate, position: CrewVesselPosition): number {
    const posStart = new Date(position.startDate);
    const availFrom = new Date(candidate.availability.availableFrom);
    const availUntil = new Date(candidate.availability.availableUntil);

    // Check if available for start date
    if (availFrom > posStart) {
      const daysLate = Math.floor((availFrom.getTime() - posStart.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLate > 14) return 0;
      return 100 - (daysLate * 5);
    }

    // Check contract length compatibility
    const preferredLength = candidate.availability.preferredContractLength;
    const positionLength = position.contractLength;
    
    if (Math.abs(preferredLength - positionLength) <= 1) return 100;
    if (Math.abs(preferredLength - positionLength) <= 2) return 85;
    return 70;
  }

  private scorePreferences(candidate: CrewCandidate, position: CrewVesselPosition): number {
    let score = 100;

    // Vessel type preference
    if (candidate.preferences.preferredVesselTypes.length > 0 &&
        !candidate.preferences.preferredVesselTypes.includes(position.vesselType)) {
      score -= 15;
    }

    // Route preference
    if (candidate.preferences.preferredRoutes.length > 0 &&
        !candidate.preferences.preferredRoutes.includes(position.route)) {
      score -= 10;
    }

    // Salary preference
    if (position.salaryRange.max < candidate.preferences.minSalary) {
      score -= 30;
    } else if (position.salaryRange.min < candidate.preferences.minSalary) {
      score -= 10;
    }

    // Contract length preference
    if (position.contractLength > candidate.preferences.maxContractLength) {
      score -= 20;
    }

    return Math.max(0, score);
  }

  private scorePerformance(candidate: CrewCandidate): number {
    if (candidate.performanceHistory.length === 0) return 70;

    const recentPerformance = candidate.performanceHistory.slice(-3);
    const avgScore = recentPerformance.reduce((sum, p) => sum + p.score, 0) / recentPerformance.length;
    
    return Math.min(100, avgScore);
  }

  private scoreTeamCompatibility(candidate: CrewCandidate, existingCrew: string[]): number {
    if (existingCrew.length === 0) return 80;

    // Check avoid list
    const conflicts = existingCrew.filter(id => candidate.preferences.avoidList.includes(id));
    if (conflicts.length > 0) return 20;

    // Check team preferences
    const positive = existingCrew.filter(id => candidate.preferences.teamPreferences.includes(id));
    if (positive.length > 0) return 100;

    return 75;
  }

  private scoreLanguages(candidate: CrewCandidate, position: CrewVesselPosition): number {
    const required = position.requiredLanguages;
    if (required.length === 0) return 100;

    const hasEnglish = candidate.languageSkills.some(
      l => l.language.toLowerCase() === 'english' && ['fluent', 'native'].includes(l.level)
    );

    if (!hasEnglish) return 50;

    const matchedLanguages = required.filter((req: string) =>
      candidate.languageSkills.some(l => 
        l.language.toLowerCase() === req.toLowerCase() && 
        ['intermediate', 'fluent', 'native'].includes(l.level)
      )
    );

    return (matchedLanguages.length / required.length) * 100;
  }

  private identifyCompatibilityFactors(
    candidate: CrewCandidate,
    position: CrewVesselPosition
  ): CompatibilityFactor[] {
    const factors: CompatibilityFactor[] = [];

    // Previous vessel experience
    if (candidate.lastVessel === position.vesselId) {
      factors.push({
        factor: 'Experiência prévia no navio',
        impact: 'positive',
        description: 'Candidato já serviu neste navio',
        weight: 10
      });
    }

    // Contract completion history
    const completedContracts = candidate.contractHistory.filter(c => !c.earlyTermination);
    const completionRate = completedContracts.length / Math.max(1, candidate.contractHistory.length);
    
    if (completionRate >= 0.9) {
      factors.push({
        factor: 'Alto índice de conclusão de contratos',
        impact: 'positive',
        description: `${Math.round(completionRate * 100)}% dos contratos concluídos`,
        weight: 8
      });
    } else if (completionRate < 0.7) {
      factors.push({
        factor: 'Histórico de rescisões antecipadas',
        impact: 'negative',
        description: `${Math.round((1 - completionRate) * 100)}% dos contratos com rescisão antecipada`,
        weight: -15
      });
    }

    // Medical status
    if (candidate.medicalStatus.status === 'fit_with_restrictions') {
      factors.push({
        factor: 'Restrições médicas',
        impact: 'neutral',
        description: `Restrições: ${candidate.medicalStatus.restrictions.join(', ')}`,
        weight: -5
      });
    }

    return factors;
  }

  private identifyRisks(candidate: CrewCandidate, position: CrewVesselPosition): MatchRisk[] {
    const risks: MatchRisk[] = [];

    // Certification expiry risk
    const expiringCerts = candidate.certifications.filter(c => c.status === 'expiring_soon');
    if (expiringCerts.length > 0) {
      risks.push({
        risk: `${expiringCerts.length} certificação(ões) expirando em breve`,
        severity: expiringCerts.length > 2 ? 'high' : 'medium',
        mitigation: 'Agendar renovação antes do embarque'
      });
    }

    // Medical expiry
    const daysToMedicalExpiry = Math.floor(
      (new Date(candidate.medicalStatus.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysToMedicalExpiry < 60) {
      risks.push({
        risk: 'Certificado médico próximo do vencimento',
        severity: daysToMedicalExpiry < 30 ? 'high' : 'medium',
        mitigation: 'Agendar exame médico antes do embarque'
      });
    }

    // Position mismatch
    if (candidate.currentPosition !== position.position && 
        candidate.targetPosition !== position.position) {
      risks.push({
        risk: 'Posição diferente da atual/desejada',
        severity: 'low',
        mitigation: 'Verificar interesse e qualificações para a posição'
      });
    }

    return risks;
  }

  private getRecommendation(
    score: number,
    risks: MatchRisk[]
  ): MatchResult['recommendation'] {
    const highRisks = risks.filter(r => r.severity === 'high').length;
    
    if (highRisks >= 2) return 'not_recommended';
    if (score >= 85 && highRisks === 0) return 'highly_recommended';
    if (score >= 70) return 'recommended';
    if (score >= 50) return 'acceptable';
    return 'not_recommended';
  }

  private estimateRetention(
    candidate: CrewCandidate,
    position: CrewVesselPosition,
    matchScore: number
  ): number {
    let retention = 70; // Base retention

    // Contract history
    const completedContracts = candidate.contractHistory.filter(c => !c.earlyTermination);
    const completionRate = completedContracts.length / Math.max(1, candidate.contractHistory.length);
    retention += (completionRate - 0.7) * 30;

    // Match score impact
    retention += (matchScore - 50) * 0.3;

    // Preference alignment
    if (candidate.preferences.preferredVesselTypes.includes(position.vesselType)) {
      retention += 5;
    }

    return Math.min(98, Math.max(30, Math.round(retention)));
  }

  buildOptimalRoster(
    vessel: { id: string; name: string; positions: CrewVesselPosition[] },
    candidates: CrewCandidate[]
  ): RosterSuggestion {
    const roster: RosterPosition[] = [];
    const assignedCandidates = new Set<string>();

    // Sort positions by priority
    const sortedPositions = [...vessel.positions].sort((a, b) => {
      const priorityOrder: Record<'critical' | 'high' | 'normal', number> = { critical: 0, high: 1, normal: 2 };
      return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
    });

    for (const position of sortedPositions) {
      const availableCandidates = candidates.filter(c => !assignedCandidates.has(c.id));
      const existingCrew = Array.from(assignedCandidates);
      
      const matches = this.findBestMatches(position, availableCandidates, existingCrew);
      
      if (matches.length > 0) {
        assignedCandidates.add(matches[0].candidateId);
        roster.push({
          position: position.position,
          suggestedCandidate: matches[0],
          alternativeCandidates: matches.slice(1, 4),
          filledStatus: 'suggested'
        });
      } else {
        roster.push({
          position: position.position,
          suggestedCandidate: null as unknown as MatchResult,
          alternativeCandidates: [],
          filledStatus: 'vacant'
        });
      }
    }

    const filledPositions = roster.filter(r => r.filledStatus !== 'vacant');
    const avgCompatibility = filledPositions.length > 0
      ? filledPositions.reduce((sum, r) => sum + r.suggestedCandidate.overallScore, 0) / filledPositions.length
      : 0;

    return {
      vesselId: vessel.id,
      vesselName: vessel.name,
      positions: roster,
      overallCompatibility: Math.round(avgCompatibility),
      teamDynamicsScore: this.calculateTeamDynamics(roster),
      operationalReadiness: (filledPositions.length / roster.length) * 100,
      estimatedCost: this.estimateRosterCost(roster, vessel.positions),
      warnings: this.generateRosterWarnings(roster)
    };
  }

  private calculateTeamDynamics(roster: RosterPosition[]): number {
    // Simplified team dynamics calculation
    const filled = roster.filter(r => r.filledStatus !== 'vacant');
    if (filled.length < 2) return 75;

    const avgTeamScore = filled.reduce(
      (sum, r) => sum + r.suggestedCandidate.matchBreakdown.teamCompatibilityScore, 0
    ) / filled.length;

    return Math.round(avgTeamScore);
  }

  private estimateRosterCost(roster: RosterPosition[], positions: CrewVesselPosition[]): number {
    return positions.reduce((sum, pos) => sum + pos.salaryRange.min, 0) * 12;
  }

  private generateRosterWarnings(roster: RosterPosition[]): string[] {
    const warnings: string[] = [];

    const vacant = roster.filter(r => r.filledStatus === 'vacant');
    if (vacant.length > 0) {
      warnings.push(`${vacant.length} posição(ões) sem candidato adequado`);
    }

    const lowScores = roster.filter(
      r => r.filledStatus !== 'vacant' && r.suggestedCandidate.overallScore < 60
    );
    if (lowScores.length > 0) {
      warnings.push(`${lowScores.length} posição(ões) com match score abaixo de 60%`);
    }

    const highRisks = roster.filter(
      r => r.filledStatus !== 'vacant' && 
           r.suggestedCandidate.risks.some(risk => risk.severity === 'high')
    );
    if (highRisks.length > 0) {
      warnings.push(`${highRisks.length} candidato(s) com riscos altos identificados`);
    }

    return warnings;
  }
}

export const crewMatchingEngine = new CrewMatchingEngine();
