/**
 * Crew Matching AI Engine v2.0
 * Algoritmo de compatibilidade tripulante-embarcação com score multidimensional
 */

export interface CrewCandidate {
  id: string;
  name: string;
  rank: string;
  certifications: string[];
  experience_years: number;
  languages: string[];
  nationality: string;
  availability_date: string;
  last_vessel_type?: string;
  performance_score?: number;
  wellness_score?: number;
  training_scores?: Record<string, number>;
}

export interface VesselPosition {
  vessel_id: string;
  vessel_name: string;
  vessel_type: string;
  position: string;
  required_certifications: string[];
  preferred_experience: number;
  preferred_languages: string[];
  contract_duration_months: number;
  departure_date: string;
  special_requirements?: string[];
}

export interface MatchScore {
  overall: number;
  certification_match: number;
  experience_match: number;
  language_match: number;
  availability_match: number;
  cultural_fit: number;
  performance_factor: number;
  vessel_familiarity: number;
}

export interface CrewMatch {
  candidate: CrewCandidate;
  position: VesselPosition;
  scores: MatchScore;
  recommendation: 'excellent' | 'good' | 'acceptable' | 'poor';
  risks: string[];
  strengths: string[];
  suggested_training?: string[];
}

export interface TeamComposition {
  vessel_id: string;
  assignments: CrewMatch[];
  team_synergy_score: number;
  diversity_index: number;
  experience_balance: number;
  language_coverage: number;
  risks: string[];
}

class CrewMatchingEngine {
  private readonly WEIGHTS = {
    certification: 0.30,
    experience: 0.20,
    language: 0.10,
    availability: 0.10,
    cultural_fit: 0.10,
    performance: 0.15,
    vessel_familiarity: 0.05
  };

  private readonly VESSEL_TYPE_SIMILARITY: Record<string, string[]> = {
    'tanker': ['chemical_tanker', 'oil_tanker', 'lpg_tanker', 'lng_tanker'],
    'bulk_carrier': ['ore_carrier', 'grain_carrier'],
    'container': ['feeder', 'panamax', 'post_panamax'],
    'offshore': ['dpov', 'ahts', 'psv', 'fpso'],
    'cruise': ['passenger', 'ferry', 'yacht']
  };

  /**
   * Match single candidate to position
   */
  matchCandidateToPosition(
    candidate: CrewCandidate,
    position: VesselPosition
  ): CrewMatch {
    const scores = this.calculateMatchScores(candidate, position);
    const overall = this.calculateOverallScore(scores);
    
    const recommendation = this.getRecommendation(overall);
    const { risks, strengths } = this.analyzeMatchQuality(candidate, position, scores);
    const suggestedTraining = this.suggestTraining(candidate, position);

    return {
      candidate,
      position,
      scores: { ...scores, overall },
      recommendation,
      risks,
      strengths,
      suggested_training: suggestedTraining
    };
  }

  /**
   * Find best matches for a position
   */
  findBestMatches(
    candidates: CrewCandidate[],
    position: VesselPosition,
    limit: number = 10
  ): CrewMatch[] {
    const matches = candidates.map(c => this.matchCandidateToPosition(c, position));
    
    return matches
      .sort((a, b) => b.scores.overall - a.scores.overall)
      .slice(0, limit);
  }

  /**
   * Optimize crew composition for vessel
   */
  optimizeTeamComposition(
    candidates: CrewCandidate[],
    positions: VesselPosition[]
  ): TeamComposition {
    const assignments: CrewMatch[] = [];
    const assignedCandidates = new Set<string>();
    
    // Sort positions by priority (critical roles first)
    const prioritizedPositions = this.prioritizePositions(positions);
    
    for (const position of prioritizedPositions) {
      const availableCandidates = candidates.filter(
        c => !assignedCandidates.has(c.id)
      );
      
      const matches = this.findBestMatches(availableCandidates, position, 1);
      
      if (matches.length > 0 && matches[0].scores.overall >= 0.5) {
        assignments.push(matches[0]);
        assignedCandidates.add(matches[0].candidate.id);
      }
    }

    return {
      vessel_id: positions[0]?.vessel_id || '',
      assignments,
      team_synergy_score: this.calculateTeamSynergy(assignments),
      diversity_index: this.calculateDiversityIndex(assignments),
      experience_balance: this.calculateExperienceBalance(assignments),
      language_coverage: this.calculateLanguageCoverage(assignments),
      risks: this.identifyTeamRisks(assignments)
    };
  }

  private calculateMatchScores(
    candidate: CrewCandidate,
    position: VesselPosition
  ): Omit<MatchScore, 'overall'> {
    return {
      certification_match: this.calculateCertificationMatch(
        candidate.certifications,
        position.required_certifications
      ),
      experience_match: this.calculateExperienceMatch(
        candidate.experience_years,
        position.preferred_experience
      ),
      language_match: this.calculateLanguageMatch(
        candidate.languages,
        position.preferred_languages
      ),
      availability_match: this.calculateAvailabilityMatch(
        candidate.availability_date,
        position.departure_date
      ),
      cultural_fit: this.calculateCulturalFit(candidate, position),
      performance_factor: candidate.performance_score || 0.7,
      vessel_familiarity: this.calculateVesselFamiliarity(
        candidate.last_vessel_type,
        position.vessel_type
      )
    };
  }

  private calculateOverallScore(scores: Omit<MatchScore, 'overall'>): number {
    return (
      scores.certification_match * this.WEIGHTS.certification +
      scores.experience_match * this.WEIGHTS.experience +
      scores.language_match * this.WEIGHTS.language +
      scores.availability_match * this.WEIGHTS.availability +
      scores.cultural_fit * this.WEIGHTS.cultural_fit +
      scores.performance_factor * this.WEIGHTS.performance +
      scores.vessel_familiarity * this.WEIGHTS.vessel_familiarity
    );
  }

  private calculateCertificationMatch(
    candidateCerts: string[],
    requiredCerts: string[]
  ): number {
    if (requiredCerts.length === 0) return 1;
    
    const matched = requiredCerts.filter(req =>
      candidateCerts.some(c => c.toLowerCase().includes(req.toLowerCase()))
    );
    
    return matched.length / requiredCerts.length;
  }

  private calculateExperienceMatch(
    candidateExp: number,
    requiredExp: number
  ): number {
    if (candidateExp >= requiredExp) return 1;
    if (candidateExp >= requiredExp * 0.7) return 0.8;
    if (candidateExp >= requiredExp * 0.5) return 0.6;
    return Math.max(0.3, candidateExp / requiredExp);
  }

  private calculateLanguageMatch(
    candidateLangs: string[],
    preferredLangs: string[]
  ): number {
    if (preferredLangs.length === 0) return 1;
    
    const matched = preferredLangs.filter(lang =>
      candidateLangs.some(cl => cl.toLowerCase() === lang.toLowerCase())
    );
    
    // English is mandatory
    const hasEnglish = candidateLangs.some(l => 
      l.toLowerCase() === 'english' || l.toLowerCase() === 'en'
    );
    
    if (!hasEnglish) return 0.3;
    
    return 0.5 + (matched.length / preferredLangs.length) * 0.5;
  }

  private calculateAvailabilityMatch(
    availableDate: string,
    departureDate: string
  ): number {
    const available = new Date(availableDate);
    const departure = new Date(departureDate);
    const diffDays = (departure.getTime() - available.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffDays < 0) return 0; // Not available in time
    if (diffDays <= 7) return 1; // Perfect timing
    if (diffDays <= 14) return 0.9;
    if (diffDays <= 30) return 0.8;
    if (diffDays <= 60) return 0.6;
    return 0.4; // Too far in advance
  }

  private calculateCulturalFit(
    candidate: CrewCandidate,
    position: VesselPosition
  ): number {
    // Base score from wellness
    let score = candidate.wellness_score || 0.7;
    
    // Adjust for team dynamics (simplified)
    if (candidate.experience_years > 10) score += 0.1;
    
    return Math.min(1, score);
  }

  private calculateVesselFamiliarity(
    lastVesselType?: string,
    targetVesselType?: string
  ): number {
    if (!lastVesselType || !targetVesselType) return 0.5;
    if (lastVesselType === targetVesselType) return 1;
    
    // Check similar vessel types
    for (const [category, types] of Object.entries(this.VESSEL_TYPE_SIMILARITY)) {
      if (types.includes(lastVesselType) && types.includes(targetVesselType)) {
        return 0.8;
      }
      if (category === lastVesselType && types.includes(targetVesselType)) {
        return 0.7;
      }
    }
    
    return 0.4;
  }

  private getRecommendation(score: number): CrewMatch['recommendation'] {
    if (score >= 0.85) return 'excellent';
    if (score >= 0.70) return 'good';
    if (score >= 0.55) return 'acceptable';
    return 'poor';
  }

  private analyzeMatchQuality(
    candidate: CrewCandidate,
    position: VesselPosition,
    scores: Omit<MatchScore, 'overall'>
  ): { risks: string[]; strengths: string[] } {
    const risks: string[] = [];
    const strengths: string[] = [];

    if (scores.certification_match < 0.8) {
      risks.push('Certificações incompletas para a posição');
    } else {
      strengths.push('Certificações completas');
    }

    if (scores.experience_match >= 0.9) {
      strengths.push('Experiência acima do esperado');
    } else if (scores.experience_match < 0.6) {
      risks.push('Experiência abaixo do ideal');
    }

    if (scores.availability_match < 0.7) {
      risks.push('Disponibilidade não ideal para embarque');
    }

    if (scores.vessel_familiarity >= 0.8) {
      strengths.push('Familiaridade com tipo de embarcação');
    }

    if (scores.performance_factor >= 0.85) {
      strengths.push('Alto desempenho histórico');
    }

    return { risks, strengths };
  }

  private suggestTraining(
    candidate: CrewCandidate,
    position: VesselPosition
  ): string[] {
    const suggestions: string[] = [];
    
    const missingCerts = position.required_certifications.filter(
      req => !candidate.certifications.some(c => 
        c.toLowerCase().includes(req.toLowerCase())
      )
    );
    
    missingCerts.forEach(cert => {
      suggestions.push(`Certificação necessária: ${cert}`);
    });
    
    if (position.special_requirements) {
      position.special_requirements.forEach(req => {
        suggestions.push(`Treinamento específico: ${req}`);
      });
    }
    
    return suggestions;
  }

  private prioritizePositions(positions: VesselPosition[]): VesselPosition[] {
    const priority: Record<string, number> = {
      'master': 1,
      'chief_officer': 2,
      'chief_engineer': 3,
      'second_officer': 4,
      'second_engineer': 5,
      'third_officer': 6,
      'third_engineer': 7
    };
    
    return [...positions].sort((a, b) => {
      const priorityA = priority[a.position.toLowerCase()] || 99;
      const priorityB = priority[b.position.toLowerCase()] || 99;
      return priorityA - priorityB;
    });
  }

  private calculateTeamSynergy(assignments: CrewMatch[]): number {
    if (assignments.length < 2) return 1;
    
    const avgScore = assignments.reduce(
      (sum, a) => sum + a.scores.overall, 0
    ) / assignments.length;
    
    // Penalize if there are many poor matches
    const poorMatches = assignments.filter(a => a.recommendation === 'poor').length;
    const penalty = poorMatches * 0.05;
    
    return Math.max(0, avgScore - penalty);
  }

  private calculateDiversityIndex(assignments: CrewMatch[]): number {
    if (assignments.length === 0) return 0;
    
    const nationalities = new Set(assignments.map(a => a.candidate.nationality));
    return Math.min(1, nationalities.size / Math.max(5, assignments.length * 0.5));
  }

  private calculateExperienceBalance(assignments: CrewMatch[]): number {
    if (assignments.length === 0) return 0;
    
    const experiences = assignments.map(a => a.candidate.experience_years);
    const avg = experiences.reduce((a, b) => a + b, 0) / experiences.length;
    const hasJuniors = experiences.some(e => e < 3);
    const hasSeniors = experiences.some(e => e > 10);
    
    if (hasJuniors && hasSeniors && avg >= 5) return 1;
    if (avg >= 5) return 0.8;
    return 0.6;
  }

  private calculateLanguageCoverage(assignments: CrewMatch[]): number {
    if (assignments.length === 0) return 0;
    
    const allLanguages = new Set<string>();
    assignments.forEach(a => {
      a.candidate.languages.forEach(l => allLanguages.add(l.toLowerCase()));
    });
    
    const hasEnglish = allLanguages.has('english') || allLanguages.has('en');
    if (!hasEnglish) return 0.3;
    
    return Math.min(1, 0.5 + allLanguages.size * 0.1);
  }

  private identifyTeamRisks(assignments: CrewMatch[]): string[] {
    const risks: string[] = [];
    
    const poorMatches = assignments.filter(a => a.recommendation === 'poor');
    if (poorMatches.length > 0) {
      risks.push(`${poorMatches.length} posição(ões) com match inadequado`);
    }
    
    const avgExperience = assignments.length > 0
      ? assignments.reduce((sum, a) => sum + a.candidate.experience_years, 0) / assignments.length
      : 0;
    
    if (avgExperience < 3) {
      risks.push('Equipe com experiência média baixa');
    }
    
    return risks;
  }
}

export const crewMatchingEngine = new CrewMatchingEngine();
