import { describe, it, expect, beforeEach } from 'vitest';
import { mockCrew, mockVessel, createMany } from '../../shared/mock-factories';

describe('Crew Manager', () => {
  describe('Crew Assignment', () => {
    it('should assign crew to vessel successfully', () => {
      // Arrange
      const crew = mockCrew({ status: 'available' });
      const vessel = mockVessel({ crew_capacity: 50 });
      
      // Act
      const assignment = assignCrewToVessel(crew, vessel);
      
      // Assert
      expect(assignment.crew_id).toBe(crew.id);
      expect(assignment.vessel_id).toBe(vessel.id);
      expect(assignment.status).toBe('assigned');
    });

    it('should reject assignment when vessel at capacity', () => {
      // Arrange
      const crew = mockCrew();
      const vessel = mockVessel({ crew_capacity: 0 });
      
      // Act & Assert
      expect(() => assignCrewToVessel(crew, vessel)).toThrow('Vessel at capacity');
    });

    it('should handle multiple crew assignments', () => {
      // Arrange
      const crewMembers = createMany(mockCrew, 5);
      const vessel = mockVessel({ crew_capacity: 50 });
      
      // Act
      const assignments = crewMembers.map(crew => assignCrewToVessel(crew, vessel));
      
      // Assert
      expect(assignments).toHaveLength(5);
      expect(assignments.every(a => a.vessel_id === vessel.id)).toBe(true);
    });
  });

  describe('Crew Validation', () => {
    it('should validate crew certifications', () => {
      // Arrange
      const crew = mockCrew({ certifications: ['STCW', 'HUET'] });
      
      // Act
      const isValid = validateCrewCertifications(crew);
      
      // Assert
      expect(isValid).toBe(true);
    });

    it('should reject crew without required certifications', () => {
      // Arrange
      const crew = mockCrew({ certifications: [] });
      
      // Act
      const isValid = validateCrewCertifications(crew);
      
      // Assert
      expect(isValid).toBe(false);
    });
  });
});

// Mock implementations for demonstration
function assignCrewToVessel(crew: any, vessel: any) {
  if (vessel.crew_capacity === 0) {
    throw new Error('Vessel at capacity');
  }
  return {
    crew_id: crew.id,
    vessel_id: vessel.id,
    status: 'assigned',
    assigned_at: new Date().toISOString(),
  };
}

function validateCrewCertifications(crew: any): boolean {
  const requiredCerts = ['STCW'];
  return requiredCerts.every(cert => crew.certifications.includes(cert));
}
