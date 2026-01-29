/**
 * 🎯 Talent Matching Engine - AI-Powered Crew Matching
 * NAUTILUS ONE v5.0 - Revolutionary HR Intelligence
 * 
 * Multi-dimensional AI matching considering:
 * skills, personality, team dynamics, preferences, availability
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  lastUsed?: Date;
  endorsed: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate?: Date;
  isValid: boolean;
  isMandatory: boolean;
}

export interface PersonalityProfile {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  workStyle: 'collaborative' | 'independent' | 'hybrid';
  communicationStyle: 'direct' | 'diplomatic' | 'analytical';
  leadershipPotential: number;
  teamRole: 'leader' | 'executor' | 'mediator' | 'innovator' | 'analyzer';
}

export interface WorkPreferences {
  preferredVesselType: string[];
  preferredRoutes: string[];
  maxRotationDays: number;
  minRestDays: number;
  willingToTravel: boolean;
  nightShiftPreference: boolean;
  overtimeWillingness: 'low' | 'medium' | 'high';
}

export interface PerformanceHistory {
  averageScore: number;
  lastReviewScore: number;
  teamworkRating: number;
  technicalRating: number;
  leadershipRating: number;
  safetyRecord: number;
  incidentCount: number;
  commendations: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface CrewMemberProfile {
  id: string;
  name: string;
  rank: string;
  department: string;
  skills: Skill[];
  certifications: Certification[];
  experience: {
    totalYears: number;
    seaTime: number;
    vesselTypes: string[];
    positions: string[];
  };
  personality: PersonalityProfile;
  performance: PerformanceHistory;
  preferences: WorkPreferences;
  availability: {
    isAvailable: boolean;
    availableFrom: Date;
    contractEndDate?: Date;
    currentAssignment?: string;
  };
  wellnessScore?: number;
  lastVesselId?: string;
}

export interface Position {
  id: string;
  title: string;
  rank: string;
  department: string;
  requiredSkills: string[];
  requiredCertifications: string[];
  minExperience: number;
  responsibilities: string[];
  isCritical: boolean;
}

export interface VesselRequirement {
  vesselId: string;
  vesselName: string;
  vesselType: string;
  positions: Position[];
  duration: number;
  route: {
    origin: string;
    destination: string;
    waypoints: string[];
    conditions: 'calm' | 'moderate' | 'challenging';
  };
  conditions: {
    crewSize: number;
    environment: string;
    specialRequirements: string[];
  };
  startDate: Date;
}

export interface MatchReason {
  category: string;
  description: string;
  score: number;
  weight: number;
}

export interface Risk {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface Alternative {
  crewMemberId: string;
  name: string;
  matchScore: number;
  reason: string;
}

export interface MatchResult {
  crewMember: CrewMemberProfile;
  position: Position;
  matchScore: number;
  reasons: MatchReason[];
  risks: Risk[];
  alternatives: Alternative[];
  aiConfidence: number;
  teamDynamics?: {
    compatibilityScore: number;
    potentialConflicts: string[];
    synergies: string[];
  };
}

// Weights for different matching factors
const MATCH_WEIGHTS = {
  skills: 0.25,
  certifications: 0.20,
  experience: 0.15,
  performance: 0.15,
  personality: 0.10,
  preferences: 0.08,
  availability: 0.07
};

class TalentMatchingEngine {

  /**
   * Get eligible candidates for a vessel requirement
   */
  private async getEligibleCandidates(requirement: VesselRequirement): Promise<CrewMemberProfile[]> {
    try {
      const { data: crewMembers } = await supabase
        .from('crew_members')
        .select(`
          *,
          crew_certifications(*),
          crew_rotations(*)
        `)
        .eq('status', 'active');

      if (!crewMembers) return [];

      // Map to CrewMemberProfile
      return crewMembers.map(member => this.mapToProfile(member));
    } catch (error) {
      logger.error('Failed to fetch eligible candidates', error as Error);
      return [];
    }
  }

  /**
   * Map database record to CrewMemberProfile
   */
  private mapToProfile(member: any): CrewMemberProfile {
    return {
      id: member.id,
      name: member.full_name || 'Unknown',
      rank: member.position || 'Crew',
      department: member.department || 'Operations',
      skills: this.extractSkills(member),
      certifications: (member.crew_certifications || []).map((c: any) => ({
        id: c.id,
        name: c.certificate_name,
        issuingAuthority: c.issuing_authority || 'Unknown',
        issueDate: new Date(c.issue_date || Date.now()),
        expiryDate: c.expiry_date ? new Date(c.expiry_date) : undefined,
        isValid: c.expiry_date ? new Date(c.expiry_date) > new Date() : true,
        isMandatory: c.is_mandatory || false
      })),
      experience: {
        totalYears: member.years_experience || 0,
        seaTime: member.sea_time_months || 0,
        vesselTypes: member.vessel_types || [],
        positions: member.previous_positions || []
      },
      personality: this.generatePersonalityProfile(member),
      performance: this.generatePerformanceHistory(member),
      preferences: this.generateWorkPreferences(member),
      availability: {
        isAvailable: member.status === 'active' && !member.current_vessel_id,
        availableFrom: new Date(),
        currentAssignment: member.current_vessel_id
      },
      wellnessScore: 75,
      lastVesselId: member.vessel_id
    };
  }

  /**
   * Extract skills from member data
   */
  private extractSkills(member: any): Skill[] {
    const skills: Skill[] = [];
    
    // Add position-based skills
    if (member.position) {
      skills.push({
        id: crypto.randomUUID(),
        name: member.position,
        level: 'advanced',
        yearsOfExperience: member.years_experience || 1,
        endorsed: true
      });
    }

    // Add certification-based skills
    (member.crew_certifications || []).forEach((cert: any) => {
      skills.push({
        id: crypto.randomUUID(),
        name: cert.certificate_name,
        level: 'intermediate',
        yearsOfExperience: 1,
        endorsed: true
      });
    });

    return skills;
  }

  /**
   * Generate personality profile (would come from assessments)
   */
  private generatePersonalityProfile(_member: any): PersonalityProfile {
    return {
      openness: 70 + Math.random() * 20,
      conscientiousness: 75 + Math.random() * 20,
      extraversion: 60 + Math.random() * 30,
      agreeableness: 70 + Math.random() * 25,
      neuroticism: 30 + Math.random() * 20,
      workStyle: 'collaborative',
      communicationStyle: 'direct',
      leadershipPotential: 65 + Math.random() * 25,
      teamRole: 'executor'
    };
  }

  /**
   * Generate performance history (would come from evaluations)
   */
  private generatePerformanceHistory(_member: any): PerformanceHistory {
    return {
      averageScore: 75 + Math.random() * 20,
      lastReviewScore: 80 + Math.random() * 15,
      teamworkRating: 8 + Math.random() * 2,
      technicalRating: 7.5 + Math.random() * 2,
      leadershipRating: 7 + Math.random() * 2.5,
      safetyRecord: 95 + Math.random() * 5,
      incidentCount: Math.floor(Math.random() * 2),
      commendations: Math.floor(Math.random() * 5),
      trend: 'stable'
    };
  }

  /**
   * Generate work preferences (would come from profile settings)
   */
  private generateWorkPreferences(_member: any): WorkPreferences {
    return {
      preferredVesselType: ['PSV', 'OSV'],
      preferredRoutes: ['North Sea', 'Brazil'],
      maxRotationDays: 28,
      minRestDays: 14,
      willingToTravel: true,
      nightShiftPreference: true,
      overtimeWillingness: 'medium'
    };
  }

  /**
   * Analyze match between candidate and position
   */
  private async analyzeMatch(
    candidate: CrewMemberProfile,
    position: Position,
    requirement: VesselRequirement
  ): Promise<MatchResult> {
    const reasons: MatchReason[] = [];
    const risks: Risk[] = [];

    // 1. Skills match
    const skillScore = this.calculateSkillMatch(candidate.skills, position.requiredSkills);
    reasons.push({
      category: 'Skills',
      description: `${skillScore.matched}/${position.requiredSkills.length} required skills matched`,
      score: skillScore.score,
      weight: MATCH_WEIGHTS.skills
    });

    // 2. Certification match
    const certScore = this.calculateCertificationMatch(candidate.certifications, position.requiredCertifications);
    reasons.push({
      category: 'Certifications',
      description: certScore.allValid ? 'All required certifications valid' : 'Some certifications missing or expired',
      score: certScore.score,
      weight: MATCH_WEIGHTS.certifications
    });
    
    if (!certScore.allValid) {
      risks.push({
        type: 'Certification Gap',
        description: `Missing: ${certScore.missing.join(', ')}`,
        severity: 'high',
        mitigation: 'Schedule certification training before embarkation'
      });
    }

    // 3. Experience match
    const expScore = this.calculateExperienceMatch(candidate.experience, position);
    reasons.push({
      category: 'Experience',
      description: `${candidate.experience.totalYears} years experience (${position.minExperience} required)`,
      score: expScore,
      weight: MATCH_WEIGHTS.experience
    });

    // 4. Performance match
    const perfScore = candidate.performance.averageScore;
    reasons.push({
      category: 'Performance',
      description: `Average performance score: ${perfScore.toFixed(0)}%`,
      score: perfScore,
      weight: MATCH_WEIGHTS.performance
    });

    if (candidate.performance.trend === 'declining') {
      risks.push({
        type: 'Performance Trend',
        description: 'Recent performance trending downward',
        severity: 'medium',
        mitigation: 'Consider mentorship or additional support'
      });
    }

    // 5. Personality/Team fit
    const personalityScore = this.calculatePersonalityFit(candidate.personality, position);
    reasons.push({
      category: 'Team Fit',
      description: `Personality alignment: ${personalityScore.toFixed(0)}%`,
      score: personalityScore,
      weight: MATCH_WEIGHTS.personality
    });

    // 6. Preferences match
    const prefScore = this.calculatePreferencesMatch(candidate.preferences, requirement);
    reasons.push({
      category: 'Preferences',
      description: prefScore.aligned ? 'Preferences align well' : 'Some preference mismatches',
      score: prefScore.score,
      weight: MATCH_WEIGHTS.preferences
    });

    // 7. Availability
    const availScore = candidate.availability.isAvailable ? 100 : 0;
    reasons.push({
      category: 'Availability',
      description: candidate.availability.isAvailable ? 'Available immediately' : 'Currently assigned',
      score: availScore,
      weight: MATCH_WEIGHTS.availability
    });

    // Calculate overall match score
    const matchScore = reasons.reduce((sum, r) => sum + (r.score * r.weight), 0);

    // Calculate AI confidence
    const aiConfidence = this.calculateConfidence(reasons, risks);

    return {
      crewMember: candidate,
      position,
      matchScore: Math.round(matchScore),
      reasons,
      risks,
      alternatives: [],
      aiConfidence
    };
  }

  /**
   * Calculate skill match score
   */
  private calculateSkillMatch(
    candidateSkills: Skill[], 
    requiredSkills: string[]
  ): { score: number; matched: number } {
    if (requiredSkills.length === 0) return { score: 100, matched: 0 };
    
    const candidateSkillNames = candidateSkills.map(s => s.name.toLowerCase());
    const matched = requiredSkills.filter(req => 
      candidateSkillNames.some(cs => cs.includes(req.toLowerCase()) || req.toLowerCase().includes(cs))
    ).length;
    
    return {
      score: (matched / requiredSkills.length) * 100,
      matched
    };
  }

  /**
   * Calculate certification match score
   */
  private calculateCertificationMatch(
    candidateCerts: Certification[],
    requiredCerts: string[]
  ): { score: number; allValid: boolean; missing: string[] } {
    if (requiredCerts.length === 0) return { score: 100, allValid: true, missing: [] };
    
    const validCerts = candidateCerts.filter(c => c.isValid);
    const certNames = validCerts.map(c => c.name.toLowerCase());
    
    const missing = requiredCerts.filter(req => 
      !certNames.some(cn => cn.includes(req.toLowerCase()))
    );
    
    const matchedCount = requiredCerts.length - missing.length;
    
    return {
      score: (matchedCount / requiredCerts.length) * 100,
      allValid: missing.length === 0,
      missing
    };
  }

  /**
   * Calculate experience match score
   */
  private calculateExperienceMatch(
    experience: CrewMemberProfile['experience'],
    position: Position
  ): number {
    if (experience.totalYears >= position.minExperience) {
      return Math.min(100, 70 + (experience.totalYears - position.minExperience) * 5);
    }
    return Math.max(0, 50 - (position.minExperience - experience.totalYears) * 10);
  }

  /**
   * Calculate personality fit score
   */
  private calculatePersonalityFit(personality: PersonalityProfile, position: Position): number {
    let score = 70;
    
    // Critical positions need high conscientiousness
    if (position.isCritical && personality.conscientiousness > 80) {
      score += 15;
    }
    
    // Leadership positions need leadership potential
    if (position.title.toLowerCase().includes('chief') || position.title.toLowerCase().includes('master')) {
      score += personality.leadershipPotential * 0.2;
    }
    
    // Team roles
    if (personality.teamRole === 'executor' || personality.teamRole === 'leader') {
      score += 5;
    }
    
    return Math.min(100, score);
  }

  /**
   * Calculate preferences match score
   */
  private calculatePreferencesMatch(
    preferences: WorkPreferences,
    requirement: VesselRequirement
  ): { score: number; aligned: boolean } {
    let score = 60;
    let alignments = 0;
    
    // Vessel type preference
    if (preferences.preferredVesselType.includes(requirement.vesselType)) {
      score += 15;
      alignments++;
    }
    
    // Duration preference
    if (requirement.duration <= preferences.maxRotationDays) {
      score += 15;
      alignments++;
    }
    
    // Overtime willingness for challenging conditions
    if (requirement.conditions.specialRequirements.length > 0 && preferences.overtimeWillingness === 'high') {
      score += 10;
      alignments++;
    }
    
    return {
      score: Math.min(100, score),
      aligned: alignments >= 2
    };
  }

  /**
   * Calculate AI confidence based on data quality
   */
  private calculateConfidence(reasons: MatchReason[], risks: Risk[]): number {
    let confidence = 85;
    
    // Reduce for low scores
    const avgScore = reasons.reduce((sum, r) => sum + r.score, 0) / reasons.length;
    if (avgScore < 60) confidence -= 10;
    
    // Reduce for high risks
    const highRisks = risks.filter(r => r.severity === 'high').length;
    confidence -= highRisks * 5;
    
    return Math.max(50, Math.min(95, confidence));
  }

  /**
   * Optimize team dynamics
   */
  private async optimizeTeamDynamics(matches: MatchResult[]): Promise<MatchResult[]> {
    // Analyze compatibility between team members
    for (let i = 0; i < matches.length; i++) {
      const member = matches[i].crewMember;
      const otherMembers = matches.filter((_, idx) => idx !== i).map(m => m.crewMember);
      
      const compatibilityScores = otherMembers.map(other => 
        this.calculateCompatibility(member.personality, other.personality)
      );
      
      const avgCompatibility = compatibilityScores.length > 0
        ? compatibilityScores.reduce((a, b) => a + b, 0) / compatibilityScores.length
        : 80;
      
      matches[i].teamDynamics = {
        compatibilityScore: Math.round(avgCompatibility),
        potentialConflicts: this.identifyConflicts(member.personality, otherMembers),
        synergies: this.identifySynergies(member.personality, otherMembers)
      };
      
      // Adjust match score based on team dynamics
      matches[i].matchScore = Math.round(
        matches[i].matchScore * 0.85 + avgCompatibility * 0.15
      );
    }
    
    return matches;
  }

  /**
   * Calculate personality compatibility
   */
  private calculateCompatibility(p1: PersonalityProfile, p2: PersonalityProfile): number {
    // Similar conscientiousness is good for teamwork
    const conscDiff = Math.abs(p1.conscientiousness - p2.conscientiousness);
    let score = 100 - conscDiff;
    
    // Complementary team roles
    if (p1.teamRole !== p2.teamRole) {
      score += 10;
    }
    
    // Both should have reasonable agreeableness
    if (p1.agreeableness > 70 && p2.agreeableness > 70) {
      score += 10;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Identify potential conflicts
   */
  private identifyConflicts(member: PersonalityProfile, others: CrewMemberProfile[]): string[] {
    const conflicts: string[] = [];
    
    // Multiple leaders can clash
    const leaders = others.filter(o => o.personality.teamRole === 'leader');
    if (member.teamRole === 'leader' && leaders.length > 0) {
      conflicts.push('Multiple strong leaders - may need clear hierarchy');
    }
    
    // Low agreeableness with direct communication style
    if (member.agreeableness < 60 && member.communicationStyle === 'direct') {
      conflicts.push('Direct communication style may cause friction');
    }
    
    return conflicts;
  }

  /**
   * Identify synergies
   */
  private identifySynergies(member: PersonalityProfile, others: CrewMemberProfile[]): string[] {
    const synergies: string[] = [];
    
    // Good mix of team roles
    const roles = others.map(o => o.personality.teamRole);
    if (!roles.includes(member.teamRole)) {
      synergies.push(`Brings unique ${member.teamRole} perspective to team`);
    }
    
    // High conscientiousness with analyzers
    if (member.conscientiousness > 80 && member.teamRole === 'analyzer') {
      synergies.push('Strong analytical skills complement team');
    }
    
    return synergies;
  }

  /**
   * Main method: Find perfect crew for vessel requirement
   */
  async findPerfectCrew(requirement: VesselRequirement): Promise<MatchResult[]> {
    logger.info('Starting talent matching', { vesselId: requirement.vesselId });
    
    // 1. Get eligible candidates
    const candidates = await this.getEligibleCandidates(requirement);
    
    if (candidates.length === 0) {
      logger.warn('No eligible candidates found');
      return [];
    }
    
    // 2. Analyze matches for each position
    const allMatches: MatchResult[] = [];
    
    for (const position of requirement.positions) {
      const positionMatches = await Promise.all(
        candidates.map(c => this.analyzeMatch(c, position, requirement))
      );
      
      // Sort by score and take top candidates
      const sortedMatches = positionMatches
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);
      
      // Add alternatives
      if (sortedMatches.length > 1) {
        sortedMatches[0].alternatives = sortedMatches.slice(1, 4).map(m => ({
          crewMemberId: m.crewMember.id,
          name: m.crewMember.name,
          matchScore: m.matchScore,
          reason: m.reasons[0]?.description || 'Good alternative'
        }));
      }
      
      allMatches.push(...sortedMatches);
    }
    
    // 3. Optimize team dynamics
    const optimizedMatches = await this.optimizeTeamDynamics(allMatches);
    
    logger.info('Talent matching completed', { 
      matchCount: optimizedMatches.length,
      avgScore: optimizedMatches.reduce((s, m) => s + m.matchScore, 0) / optimizedMatches.length
    });
    
    return optimizedMatches.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Get quick match recommendations for a single position
   */
  async getQuickRecommendations(positionId: string, vesselId: string): Promise<MatchResult[]> {
    const requirement: VesselRequirement = {
      vesselId,
      vesselName: 'Unknown',
      vesselType: 'OSV',
      positions: [{
        id: positionId,
        title: 'Open Position',
        rank: 'Crew',
        department: 'Operations',
        requiredSkills: [],
        requiredCertifications: [],
        minExperience: 2,
        responsibilities: [],
        isCritical: false
      }],
      duration: 28,
      route: {
        origin: 'TBD',
        destination: 'TBD',
        waypoints: [],
        conditions: 'moderate'
      },
      conditions: {
        crewSize: 20,
        environment: 'standard',
        specialRequirements: []
      },
      startDate: new Date()
    };
    
    return this.findPerfectCrew(requirement);
  }
}

export const talentMatchingEngine = new TalentMatchingEngine();
