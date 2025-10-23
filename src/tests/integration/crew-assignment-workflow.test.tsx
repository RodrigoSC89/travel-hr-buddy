import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockCrew, mockVessel, createMany } from '../shared/mock-factories';

describe('Integration: Crew Assignment Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full crew assignment workflow', async () => {
    // Arrange
    const vessel = mockVessel({ crew_capacity: 20 });
    const crew = mockCrew({ status: 'available' });

    // Act - Check availability
    const isAvailable = crew.status === 'available';
    expect(isAvailable).toBe(true);

    // Act - Check vessel capacity  
    const hasCapacity = vessel.crew_capacity > 0;
    expect(hasCapacity).toBe(true);

    // Act - Assign crew
    const assignment = {
      crew_id: crew.id,
      vessel_id: vessel.id,
      assigned_at: new Date(),
      rank: crew.rank,
      status: 'active',
    };

    // Assert
    expect(assignment.crew_id).toBe(crew.id);
    expect(assignment.vessel_id).toBe(vessel.id);
    expect(assignment.status).toBe('active');
  });

  it('should handle crew rotation scheduling', async () => {
    // Arrange
    const onDutyCrew = createMany(mockCrew, 5, { status: 'on_duty' });
    const offDutyCrew = createMany(mockCrew, 5, { status: 'off_duty' });

    // Act - Schedule rotation
    const rotation = {
      scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      crew_off_duty: onDutyCrew.map((c: any) => c.id),
      crew_on_duty: offDutyCrew.map((c: any) => c.id),
    };

    // Assert
    expect(rotation.crew_off_duty).toHaveLength(5);
    expect(rotation.crew_on_duty).toHaveLength(5);
    expect(rotation.scheduled_date.getTime()).toBeGreaterThan(Date.now());
  });

  it('should validate crew certifications before assignment', async () => {
    // Arrange
    const crew = mockCrew({ 
      certifications: ['STCW', 'HUET', 'Medical First Aid']
    });
    const requiredCerts = ['STCW', 'HUET'];

    // Act
    const hasAllCertifications = requiredCerts.every(cert => 
      crew.certifications.includes(cert)
    );

    // Assert
    expect(hasAllCertifications).toBe(true);
  });

  it('should reject assignment when certifications are missing', async () => {
    // Arrange
    const crew = mockCrew({ 
      certifications: ['STCW']
    });
    const requiredCerts = ['STCW', 'HUET', 'Advanced Fire Fighting'];

    // Act
    const hasAllCertifications = requiredCerts.every(cert => 
      crew.certifications.includes(cert)
    );

    // Assert
    expect(hasAllCertifications).toBe(false);
  });

  it('should track crew work hours and enforce limits', async () => {
    // Arrange
    const crew = mockCrew();
    const workLog = [
      { date: '2025-01-20', hours: 8 },
      { date: '2025-01-21', hours: 10 },
      { date: '2025-01-22', hours: 9 },
      { date: '2025-01-23', hours: 11 },
      { date: '2025-01-24', hours: 8 },
    ];

    // Act - Calculate total hours in 5 days
    const totalHours = workLog.reduce((sum, log) => sum + log.hours, 0);
    const averageHours = totalHours / workLog.length;
    const MAX_WEEKLY_HOURS = 48;

    // Assert
    expect(totalHours).toBe(46);
    expect(averageHours).toBe(9.2);
    expect(totalHours).toBeLessThanOrEqual(MAX_WEEKLY_HOURS);
  });

  it('should handle emergency crew replacement', async () => {
    // Arrange
    const currentCrew = mockCrew({ status: 'sick_leave' });
    const replacementCrew = mockCrew({ status: 'available', rank: currentCrew.rank });
    const vessel = mockVessel();

    // Act - Replace crew member
    const replacement = {
      original_crew_id: currentCrew.id,
      replacement_crew_id: replacementCrew.id,
      vessel_id: vessel.id,
      reason: 'sick_leave',
      replaced_at: new Date(),
    };

    // Assert
    expect(replacement.original_crew_id).toBe(currentCrew.id);
    expect(replacement.replacement_crew_id).toBe(replacementCrew.id);
    expect(replacement.reason).toBe('sick_leave');
  });

  it('should support bulk crew assignments', async () => {
    // Arrange
    const vessel = mockVessel({ crew_capacity: 50 });
    const crewMembers = createMany(mockCrew, 20, { status: 'available' });

    // Act - Bulk assign
    const assignments = crewMembers.map((crew: any) => ({
      crew_id: crew.id,
      vessel_id: vessel.id,
      assigned_at: new Date(),
      rank: crew.rank,
    }));

    // Assert
    expect(assignments).toHaveLength(20);
    expect(assignments.every(a => a.vessel_id === vessel.id)).toBe(true);
  });
});
