/**
 * Hook for fetching Medical Infirmary data from Supabase
 * Uses crew_members table with available columns
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CrewMember, MedicalSupply, MedicalRecord, MedicalReport } from '../types';

export function useCrewMembers() {
  return useQuery({
    queryKey: ['medical-crew-members'],
    queryFn: async (): Promise<CrewMember[]> => {
      const { data } = await supabase
        .from('crew_members')
        .select('id, full_name, rank, status, nationality')
        .order('full_name')
        .limit(20);

      if (data && data.length > 0) {
        return data.map(row => ({
          id: row.id,
          name: row.full_name || '',
          position: row.rank || '',
          bloodType: 'Não informado',
          allergies: [],
          conditions: [],
          lastCheckup: '',
          nextCheckup: '',
          status: row.status === 'active' ? 'fit' as const : 'restricted' as const,
          vaccinations: []
        }));
      }
      return getDefaultCrewMembers();
    },
    staleTime: 5 * 60 * 1000
  });
}

function getDefaultCrewMembers(): CrewMember[] {
  return [
    { id: '1', name: 'João Silva', position: 'Comandante', bloodType: 'O+', allergies: ['Penicilina'], conditions: ['Hipertensão controlada'], lastCheckup: '2024-01-15', nextCheckup: '2024-07-15', status: 'fit', vaccinations: [] },
    { id: '2', name: 'Maria Santos', position: 'Chefe de Máquinas', bloodType: 'A+', allergies: [], conditions: [], lastCheckup: '2024-01-10', nextCheckup: '2024-07-10', status: 'fit', vaccinations: [] },
    { id: '3', name: 'Carlos Lima', position: 'Oficial de Náutica', bloodType: 'B-', allergies: ['Dipirona'], conditions: [], lastCheckup: '2023-12-20', nextCheckup: '2024-06-20', status: 'fit', vaccinations: [] }
  ];
}

export function useMedicalSupplies() {
  return useQuery({
    queryKey: ['medical-supplies'],
    queryFn: async (): Promise<MedicalSupply[]> => {
      const { data } = await supabase
        .from('inventory_items')
        .select('id, name, category, quantity, min_quantity, unit, location')
        .or('category.ilike.%medical%,category.ilike.%medicamento%')
        .limit(20);

      if (data && data.length > 0) {
        return data.map(row => ({
          id: row.id,
          name: row.name || '',
          category: row.category || 'Geral',
          quantity: row.quantity || 0,
          minStock: row.min_quantity || 10,
          unit: row.unit || 'unidades',
          expiryDate: '',
          batchNumber: '',
          location: row.location || 'Enfermaria',
          status: (row.quantity || 0) < (row.min_quantity || 10) ? 'low' as const : 'ok' as const,
          lastRestock: ''
        }));
      }
      return getDefaultSupplies();
    },
    staleTime: 5 * 60 * 1000
  });
}

function getDefaultSupplies(): MedicalSupply[] {
  return [
    { id: '1', name: 'Paracetamol 500mg', category: 'Analgésicos', quantity: 120, minStock: 50, unit: 'comprimidos', expiryDate: '2025-06-15', batchNumber: 'PAR2024001', location: 'Armário A1', status: 'ok', lastRestock: '2024-01-01' },
    { id: '2', name: 'Dipirona 1g', category: 'Analgésicos', quantity: 85, minStock: 40, unit: 'comprimidos', expiryDate: '2024-03-20', batchNumber: 'DIP2023045', location: 'Armário A1', status: 'expiring', lastRestock: '2023-12-15' },
    { id: '3', name: 'Ibuprofeno 600mg', category: 'Anti-inflamatórios', quantity: 60, minStock: 30, unit: 'comprimidos', expiryDate: '2025-08-10', batchNumber: 'IBU2024012', location: 'Armário A2', status: 'ok', lastRestock: '2024-01-05' },
    { id: '4', name: 'Bandagem elástica', category: 'Curativos', quantity: 15, minStock: 20, unit: 'rolos', expiryDate: '2026-12-01', batchNumber: 'BAN2024001', location: 'Armário B1', status: 'low', lastRestock: '2023-11-20' },
    { id: '5', name: 'Soro fisiológico 500ml', category: 'Soluções', quantity: 8, minStock: 15, unit: 'frascos', expiryDate: '2024-08-10', batchNumber: 'SOR2023089', location: 'Armário C1', status: 'critical', lastRestock: '2023-10-15' }
  ];
}

export function useMedicalRecords() {
  return useQuery({
    queryKey: ['medical-records'],
    queryFn: async (): Promise<MedicalRecord[]> => getDefaultRecords(),
    staleTime: 5 * 60 * 1000
  });
}

function getDefaultRecords(): MedicalRecord[] {
  return [
    { id: '1', crewMemberId: '1', crewMemberName: 'João Silva', date: '2024-01-15', time: '14:30', type: 'consultation', chiefComplaint: 'Cefaleia persistente', symptoms: ['Dor de cabeça', 'Fadiga'], diagnosis: 'Cefaleia tensional', treatment: 'Paracetamol 500mg', medications: [], vitalSigns: { bloodPressure: '130/85', heartRate: 72 }, notes: 'Orientado repouso', status: 'resolved' },
    { id: '2', crewMemberId: '2', crewMemberName: 'Maria Santos', date: '2024-01-14', time: '09:15', type: 'emergency', chiefComplaint: 'Laceração em mão', symptoms: ['Corte profundo'], diagnosis: 'Laceração 3cm', treatment: 'Sutura + curativo', medications: [], vitalSigns: { bloodPressure: '125/80', heartRate: 88 }, notes: 'Retorno para retirada de pontos', status: 'monitoring', followUp: '2024-01-21' }
  ];
}

export function useMedicalReports() {
  return useQuery({
    queryKey: ['medical-reports'],
    queryFn: async (): Promise<MedicalReport[]> => [
      { id: '1', type: 'mlc', title: 'Relatório MLC 2006 - Janeiro 2024', generatedAt: '2024-01-31', period: '2024-01', status: 'completed', data: { compliance: 100, items: 15 } },
      { id: '2', type: 'monthly', title: 'Relatório Mensal de Atendimentos', generatedAt: '2024-01-31', period: '2024-01', status: 'completed', data: { consultations: 8, emergencies: 1, routine: 3 } }
    ],
    staleTime: 5 * 60 * 1000
  });
}

export const medicalCategories = [
  'Analgésicos', 'Anti-inflamatórios', 'Antibióticos', 'Antieméticos',
  'Gastrointestinal', 'Curativos', 'Soluções', 'Emergência', 'EPIs', 'Equipamentos'
];
