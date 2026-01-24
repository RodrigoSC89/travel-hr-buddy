/**
 * SOLAS Training Data - Empty arrays for Supabase integration
 * Data should be fetched from the database, not hardcoded
 */
import { Drill, CrewMember, Certification, TrainingAlert, DrillExecution } from '../types';

// Empty arrays - use hooks to fetch real data from Supabase
export const mockDrills: Drill[] = [];
export const mockCrewMembers: CrewMember[] = [];
export const mockCertifications: Certification[] = [];
export const mockAlerts: TrainingAlert[] = [];
export const mockDrillExecutions: DrillExecution[] = [];
