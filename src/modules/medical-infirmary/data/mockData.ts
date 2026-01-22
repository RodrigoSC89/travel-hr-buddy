/**
 * Medical Infirmary Data - Re-exports from hooks
 * This file provides backward compatibility for components importing mock data
 */

import type { CrewMember, MedicalSupply, MedicalRecord, MedicalReport } from '../types';

// Empty arrays - components should use hooks instead
export const mockCrewMembers: CrewMember[] = [];
export const mockMedicalSupplies: MedicalSupply[] = [];
export const mockMedicalRecords: MedicalRecord[] = [];
export const mockMedicalReports: MedicalReport[] = [];

// Aliases for different import names
export const mockRecords = mockMedicalRecords;
export const mockReports = mockMedicalReports;
export const mockSupplies = mockMedicalSupplies;

// Categories for UI dropdowns
export const medicalCategories = [
  'Analgésicos', 'Anti-inflamatórios', 'Antibióticos', 'Antieméticos',
  'Gastrointestinal', 'Curativos', 'Soluções', 'Emergência', 'EPIs', 'Equipamentos'
];
