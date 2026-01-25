/**
 * Adaptive Learning AI Tests
 * Unit and integration tests for crew training system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AdaptiveLearningAI,
  adaptiveLearning,
  CrewMember,
  SkillGap,
  LearningPath,
  TestResult
} from '../adaptive-learning';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null })
    }))
  }
}));

describe('AdaptiveLearningAI', () => {
  let ai: AdaptiveLearningAI;

  beforeEach(() => {
    ai = AdaptiveLearningAI.getInstance();
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AdaptiveLearningAI.getInstance();
      const instance2 = AdaptiveLearningAI.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should export a singleton instance', () => {
      expect(adaptiveLearning).toBeDefined();
      expect(adaptiveLearning).toBeInstanceOf(AdaptiveLearningAI);
    });
  });

  describe('assessSkills', () => {
    const mockCrewMember: CrewMember = {
      id: 'crew-001',
      name: 'John Captain',
      role: 'captain',
      department: 'Deck',
      certifications: [],
      completedTrainings: [],
      skillScores: {
        navigation: 80,
        leadership: 75,
        safety_management: 85
      },
      preferredLanguage: 'en'
    };

    it('should return crew member skill scores', async () => {
      const skills = await ai.assessSkills(mockCrewMember);
      
      expect(skills).toMatchObject({
        navigation: 80,
        leadership: 75,
        safety_management: 85
      });
    });

    it('should preserve existing skill scores when no performance data', async () => {
      const skills = await ai.assessSkills(mockCrewMember);
      
      expect(skills.navigation).toBe(80);
      expect(skills.leadership).toBe(75);
    });
  });

  describe('identifySkillGaps', () => {
    it('should identify skill gaps for captain role', async () => {
      const currentSkills = {
        navigation: 70,      // Required: 95, Gap: 25
        leadership: 85,      // Required: 90, Gap: 5
        safety_management: 90, // Required: 95, Gap: 5
        emergency_response: 80, // Required: 95, Gap: 15
        communication: 88     // Required: 90, Gap: 2
      };

      const gaps = await ai.identifySkillGaps('captain', currentSkills);
      
      expect(gaps.length).toBeGreaterThan(0);
      expect(gaps.every(g => g.gap > 0)).toBe(true);
    });

    it('should prioritize required skills correctly', async () => {
      const currentSkills = {
        navigation: 50,      // Gap: 45 → required
        leadership: 80,      // Gap: 10 → optional
        regulatory_compliance: 60 // Gap: 30 → required
      };

      const gaps = await ai.identifySkillGaps('captain', currentSkills);
      
      // Required gaps should come first
      const firstGap = gaps[0];
      expect(firstGap.priority).toBe('required');
    });

    it('should calculate gap priority based on severity', async () => {
      // Based on calculatePriority logic:
      // - required: gap > 30 OR requiredLevel >= 90
      // - recommended: gap > 15 
      // - optional: gap <= 15 AND requiredLevel < 90
      const gaps = await ai.identifySkillGaps('captain', {
        navigation: 60,      // Gap: 35, requiredLevel=95 → required
        leadership: 75,      // Gap: 15, requiredLevel=90 → required (because requiredLevel >= 90)
        communication: 85    // Gap: 5, requiredLevel=90 → required (because requiredLevel >= 90)
      });

      const navGap = gaps.find(g => g.skill === 'navigation');
      const leadGap = gaps.find(g => g.skill === 'leadership');
      const commGap = gaps.find(g => g.skill === 'communication');

      // All captain skills have requiredLevel >= 90, so all are 'required'
      expect(navGap?.priority).toBe('required');
      expect(leadGap?.priority).toBe('required');
      expect(commGap?.priority).toBe('required');
    });

    it('should include training modules for each gap', async () => {
      const gaps = await ai.identifySkillGaps('captain', { navigation: 70 });
      
      const navGap = gaps.find(g => g.skill === 'navigation');
      expect(navGap?.trainingModules).toBeDefined();
      expect(navGap?.trainingModules.length).toBeGreaterThan(0);
    });

    it('should handle unknown roles with default requirements', async () => {
      const gaps = await ai.identifySkillGaps('unknown_role', { safety_procedures: 50 });
      
      // Should fall back to crew_member requirements
      expect(gaps.some(g => g.skill === 'safety_procedures')).toBe(true);
    });

    it('should return empty array when no gaps exist', async () => {
      const perfectSkills = {
        navigation: 100,
        leadership: 100,
        safety_management: 100,
        emergency_response: 100,
        communication: 100,
        regulatory_compliance: 100
      };

      const gaps = await ai.identifySkillGaps('captain', perfectSkills);
      expect(gaps.length).toBe(0);
    });
  });

  describe('generateTrainingPath', () => {
    const mockCrewMember: CrewMember = {
      id: 'crew-path-001',
      name: 'Test Officer',
      role: 'chief_officer',
      department: 'Deck',
      certifications: [],
      completedTrainings: [],
      skillScores: {
        navigation: 70,
        cargo_operations: 75,
        safety_management: 80
      },
      preferredLanguage: 'en'
    };

    it('should generate comprehensive training path', async () => {
      const path = await ai.generateTrainingPath(mockCrewMember);
      
      expect(path).toMatchObject({
        required: expect.any(Array),
        recommended: expect.any(Array),
        optional: expect.any(Array),
        estimatedTime: expect.any(Number),
        deliveryMethod: expect.any(String),
        modules: expect.any(Array)
      });
    });

    it('should include training modules in path', async () => {
      const path = await ai.generateTrainingPath(mockCrewMember);
      
      expect(path.modules.length).toBeGreaterThan(0);
      expect(path.modules.every(m => m.id && m.title && m.duration)).toBe(true);
    });

    it('should calculate estimated time correctly', async () => {
      const path = await ai.generateTrainingPath(mockCrewMember);
      
      const calculatedTime = path.modules.reduce((sum, m) => sum + m.duration, 0);
      expect(path.estimatedTime).toBe(calculatedTime);
    });

    it('should group gaps by priority', async () => {
      const path = await ai.generateTrainingPath(mockCrewMember);
      
      // Required should have highest priority gaps
      if (path.required.length > 0) {
        expect(path.required.every(g => g.priority === 'required')).toBe(true);
      }
      
      if (path.recommended.length > 0) {
        expect(path.recommended.every(g => g.priority === 'recommended')).toBe(true);
      }
    });
  });

  describe('detectLearningStyle', () => {
    it('should return default visual style when no history', async () => {
      const style = await ai.detectLearningStyle('new-crew-member');
      expect(style).toBe('visual');
    });
  });

  describe('generateAdaptiveTest', () => {
    it('should generate beginner test for low skill level', async () => {
      const test = await ai.generateAdaptiveTest('navigation', 30);
      
      expect(test.difficulty).toBe('beginner');
      expect(test.questions.length).toBe(10);
      expect(test.timeLimit).toBe(20); // 10 questions × 2 min
    });

    it('should generate intermediate test for medium skill level', async () => {
      const test = await ai.generateAdaptiveTest('navigation', 60);
      
      expect(test.difficulty).toBe('intermediate');
      expect(test.questions.length).toBe(15);
      expect(test.timeLimit).toBe(30);
    });

    it('should generate advanced test for high skill level', async () => {
      const test = await ai.generateAdaptiveTest('navigation', 85);
      
      expect(test.difficulty).toBe('advanced');
      expect(test.questions.length).toBe(20);
      expect(test.timeLimit).toBe(40);
    });

    it('should include skill-specific questions', async () => {
      const test = await ai.generateAdaptiveTest('safety_management', 50);
      
      expect(test.questions.every(q => q.skill === 'safety_management')).toBe(true);
    });

    it('should assign correct points based on difficulty', async () => {
      const beginnerTest = await ai.generateAdaptiveTest('nav', 30);
      const advancedTest = await ai.generateAdaptiveTest('nav', 90);
      
      expect(beginnerTest.questions[0].points).toBe(1);
      expect(advancedTest.questions[0].points).toBe(3);
    });
  });

  describe('validateCompetency', () => {
    const mockCrewMember: CrewMember = {
      id: 'crew-validate-001',
      name: 'Test Crew',
      role: 'deck_officer',
      department: 'Deck',
      certifications: [],
      completedTrainings: [],
      skillScores: { navigation: 60 },
      preferredLanguage: 'en'
    };

    it('should pass with high score', async () => {
      const answers = Object.fromEntries(
        Array(15).fill(null).map((_, i) => [`q-${i}`, { correct: true }])
      );
      
      const result = await ai.validateCompetency(mockCrewMember, 'navigation', answers);
      
      expect(result.passed).toBe(true);
      expect(result.score).toBe(100);
      expect(result.strengths.length).toBeGreaterThan(0);
    });

    it('should fail with low score', async () => {
      const answers = Object.fromEntries(
        Array(15).fill(null).map((_, i) => [`q-${i}`, { correct: i < 5 }]) // Only 5 correct
      );
      
      const result = await ai.validateCompetency(mockCrewMember, 'navigation', answers);
      
      expect(result.passed).toBe(false);
      expect(result.weaknesses.length).toBeGreaterThan(0);
    });

    it('should provide recommendations based on score', async () => {
      const answers = { q1: { correct: true } };
      const result = await ai.validateCompetency(mockCrewMember, 'navigation', answers);
      
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should track time spent', async () => {
      const result = await ai.validateCompetency(mockCrewMember, 'navigation', {});
      
      expect(result.timeSpent).toBeDefined();
      expect(result.timeSpent).toBeGreaterThan(0);
    });
  });

  describe('getAvailableSimulations', () => {
    it('should return captain-specific simulations', async () => {
      const crewMember: CrewMember = {
        id: 'sim-crew-001',
        name: 'Captain Test',
        role: 'captain',
        department: 'Bridge',
        certifications: [],
        completedTrainings: [],
        skillScores: {},
        preferredLanguage: 'en'
      };

      const simulations = await ai.getAvailableSimulations(crewMember);
      
      expect(simulations.length).toBeGreaterThan(0);
      expect(simulations.some(s => s.name.includes('Man Overboard'))).toBe(true);
    });

    it('should return engineer-specific simulations', async () => {
      const crewMember: CrewMember = {
        id: 'sim-crew-002',
        name: 'Chief Engineer',
        role: 'engineer',
        department: 'Engine',
        certifications: [],
        completedTrainings: [],
        skillScores: {},
        preferredLanguage: 'en'
      };

      const simulations = await ai.getAvailableSimulations(crewMember);
      
      expect(simulations.some(s => s.type === 'maintenance')).toBe(true);
    });

    it('should return default simulations for unknown roles', async () => {
      const crewMember: CrewMember = {
        id: 'sim-crew-003',
        name: 'New Crew',
        role: 'unknown',
        department: 'General',
        certifications: [],
        completedTrainings: [],
        skillScores: {},
        preferredLanguage: 'en'
      };

      const simulations = await ai.getAvailableSimulations(crewMember);
      
      expect(simulations.length).toBeGreaterThan(0);
      expect(simulations.some(s => s.name.includes('Fire'))).toBe(true);
    });

    it('should include all required simulation properties', async () => {
      const crewMember: CrewMember = {
        id: 'sim-crew-004',
        name: 'Test',
        role: 'captain',
        department: 'Bridge',
        certifications: [],
        completedTrainings: [],
        skillScores: {},
        preferredLanguage: 'en'
      };

      const simulations = await ai.getAvailableSimulations(crewMember);
      
      simulations.forEach(sim => {
        expect(sim).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          type: expect.any(String),
          description: expect.any(String),
          objectives: expect.any(Array),
          difficulty: expect.any(String),
          estimatedDuration: expect.any(Number)
        });
      });
    });
  });

  describe('runSimulation', () => {
    const mockCrewMember: CrewMember = {
      id: 'run-sim-001',
      name: 'Simulation Test',
      role: 'captain',
      department: 'Bridge',
      certifications: [],
      completedTrainings: [],
      skillScores: {},
      preferredLanguage: 'en'
    };

    it('should complete simulation successfully', async () => {
      const result = await ai.runSimulation(mockCrewMember, 'sim-emergency-1');
      
      expect(result.completed).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(60);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should provide feedback after simulation', async () => {
      const result = await ai.runSimulation(mockCrewMember, 'sim-nav-1');
      
      expect(result.feedback).toBeDefined();
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should track objectives achieved', async () => {
      const result = await ai.runSimulation(mockCrewMember, 'sim-emergency-1');
      
      expect(result.objectivesAchieved).toBeDefined();
      expect(Array.isArray(result.objectivesAchieved)).toBe(true);
    });

    it('should identify improvement areas for lower scores', async () => {
      // Run multiple times to get various scores
      const results = await Promise.all(
        Array(5).fill(null).map(() => 
          ai.runSimulation(mockCrewMember, 'sim-emergency-1')
        )
      );
      
      // At least one result should have score < 80 with improvement areas
      const lowScoreResults = results.filter(r => r.score < 80);
      if (lowScoreResults.length > 0) {
        expect(lowScoreResults.some(r => r.improvementAreas.length > 0)).toBe(true);
      }
    });
  });
});

describe('Integration Tests - AdaptiveLearningAI', () => {
  let ai: AdaptiveLearningAI;

  beforeEach(() => {
    ai = AdaptiveLearningAI.getInstance();
  });

  it('should complete full training workflow: assess → identify gaps → generate path → test', async () => {
    const crewMember: CrewMember = {
      id: 'integration-001',
      name: 'Integration Test Crew',
      role: 'chief_officer',
      department: 'Deck',
      certifications: [],
      completedTrainings: [],
      skillScores: {
        navigation: 70,
        cargo_operations: 65,
        safety_management: 75
      },
      preferredLanguage: 'en'
    };

    // 1. Assess skills
    const skills = await ai.assessSkills(crewMember);
    expect(Object.keys(skills).length).toBeGreaterThan(0);

    // 2. Identify gaps
    const gaps = await ai.identifySkillGaps(crewMember.role, skills);
    expect(gaps.length).toBeGreaterThan(0);

    // 3. Generate training path
    const path = await ai.generateTrainingPath(crewMember);
    expect(path.modules.length).toBeGreaterThan(0);

    // 4. Generate test for first skill gap
    const firstGap = gaps[0];
    const test = await ai.generateAdaptiveTest(firstGap.skill, firstGap.currentLevel);
    expect(test.questions.length).toBeGreaterThan(0);

    // 5. Validate competency
    const answers = Object.fromEntries(
      test.questions.map((q, i) => [q.id, { correct: i % 2 === 0 }])
    );
    const result = await ai.validateCompetency(crewMember, firstGap.skill, answers);
    expect(result).toMatchObject({
      score: expect.any(Number),
      passed: expect.any(Boolean),
      recommendations: expect.any(Array)
    });
  });

  it('should handle simulation-based learning flow', async () => {
    const crewMember: CrewMember = {
      id: 'simulation-flow-001',
      name: 'Simulation Flow Test',
      role: 'captain',
      department: 'Bridge',
      certifications: [],
      completedTrainings: [],
      skillScores: { emergency_response: 70 },
      preferredLanguage: 'en'
    };

    // 1. Get available simulations
    const simulations = await ai.getAvailableSimulations(crewMember);
    expect(simulations.length).toBeGreaterThan(0);

    // 2. Run first simulation
    const firstSim = simulations[0];
    const result = await ai.runSimulation(crewMember, firstSim.id);
    
    expect(result.completed).toBe(true);
    expect(result.feedback.length).toBeGreaterThan(0);
  });

  it('should adapt recommendations based on role requirements', async () => {
    const roles = ['captain', 'chief_officer', 'engineer', 'deck_officer', 'crew_member'];
    const baseSkills = { navigation: 70, safety_management: 75 };

    const results = await Promise.all(
      roles.map(async role => {
        const gaps = await ai.identifySkillGaps(role, baseSkills);
        return { role, gapCount: gaps.length };
      })
    );

    // Captain should have more gaps due to higher requirements
    const captainResult = results.find(r => r.role === 'captain');
    const crewResult = results.find(r => r.role === 'crew_member');
    
    expect(captainResult!.gapCount).toBeGreaterThan(crewResult!.gapCount);
  });
});
