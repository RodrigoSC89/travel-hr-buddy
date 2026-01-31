/**
 * Hook for IMCA Incidents management
 * Provides CRUD operations and AI analysis integration
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface IMCABulletin {
  id: string;
  bulletin_id: string;
  title: string;
  category: string;
  description: string;
  root_causes: string[];
  lessons_learned: string[];
  recommendations: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  incident_date: string | null;
  source: string;
  is_global: boolean;
  created_at: string;
}

export interface IMCALocalIncident {
  id: string;
  organization_id: string | null;
  vessel_id: string | null;
  incident_code: string;
  vessel_name: string | null;
  incident_date: string;
  category: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  equipment_involved: string | null;
  injuries: number;
  environmental_impact: boolean;
  reported_by: string | null;
  ai_analysis: Record<string, unknown>;
  similar_bulletins: Array<{ bulletin_id: string; similarity_score: number }>;
  status: 'open' | 'investigating' | 'closed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface IMCAStats {
  totalBulletins: number;
  totalLocalIncidents: number;
  openIncidents: number;
  closedIncidents: number;
  criticalCount: number;
  highCount: number;
  byCategory: Record<string, number>;
}

export function useIMCAIncidents() {
  const [bulletins, setBulletins] = useState<IMCABulletin[]>([]);
  const [localIncidents, setLocalIncidents] = useState<IMCALocalIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [stats, setStats] = useState<IMCAStats>({
    totalBulletins: 0,
    totalLocalIncidents: 0,
    openIncidents: 0,
    closedIncidents: 0,
    criticalCount: 0,
    highCount: 0,
    byCategory: {}
  });

  const fetchBulletins = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('imca_incidents_database')
        .select('*')
        .order('incident_date', { ascending: false });

      if (error) throw error;
      
      // Type-safe mapping
      const mappedData: IMCABulletin[] = (data || []).map(item => ({
        id: item.id,
        bulletin_id: item.bulletin_id,
        title: item.title,
        category: item.category,
        description: item.description,
        root_causes: item.root_causes || [],
        lessons_learned: item.lessons_learned || [],
        recommendations: item.recommendations || [],
        severity: item.severity as IMCABulletin['severity'],
        incident_date: item.incident_date,
        source: item.source || 'IMCA',
        is_global: item.is_global || false,
        created_at: item.created_at || new Date().toISOString()
      }));
      
      setBulletins(mappedData);
    } catch (error) {
      logger.error('Error fetching IMCA bulletins:', error);
    }
  }, []);

  const fetchLocalIncidents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('imca_local_incidents')
        .select('*')
        .order('incident_date', { ascending: false });

      if (error) throw error;
      
      // Type-safe mapping
      const mappedData: IMCALocalIncident[] = (data || []).map(item => ({
        id: item.id,
        organization_id: item.organization_id,
        vessel_id: item.vessel_id,
        incident_code: item.incident_code,
        vessel_name: item.vessel_name,
        incident_date: item.incident_date,
        category: item.category,
        severity: item.severity as IMCALocalIncident['severity'],
        description: item.description,
        equipment_involved: item.equipment_involved,
        injuries: item.injuries || 0,
        environmental_impact: item.environmental_impact || false,
        reported_by: item.reported_by,
        ai_analysis: (item.ai_analysis as Record<string, unknown>) || {},
        similar_bulletins: (item.similar_bulletins as Array<{ bulletin_id: string; similarity_score: number }>) || [],
        status: item.status as IMCALocalIncident['status'],
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString()
      }));
      
      setLocalIncidents(mappedData);
    } catch (error) {
      logger.error('Error fetching local incidents:', error);
    }
  }, []);

  const calculateStats = useCallback(() => {
    const byCategory: Record<string, number> = {};
    
    [...bulletins, ...localIncidents].forEach(item => {
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    });

    const criticalCount = localIncidents.filter(i => i.severity === 'critical').length +
                          bulletins.filter(b => b.severity === 'critical').length;
    const highCount = localIncidents.filter(i => i.severity === 'major').length +
                      bulletins.filter(b => b.severity === 'high').length;

    setStats({
      totalBulletins: bulletins.length,
      totalLocalIncidents: localIncidents.length,
      openIncidents: localIncidents.filter(i => i.status === 'open' || i.status === 'investigating').length,
      closedIncidents: localIncidents.filter(i => i.status === 'closed' || i.status === 'archived').length,
      criticalCount,
      highCount,
      byCategory
    });
  }, [bulletins, localIncidents]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchBulletins(), fetchLocalIncidents()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchBulletins, fetchLocalIncidents]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  const createLocalIncident = async (incident: Partial<IMCALocalIncident>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const insertData = {
        incident_code: incident.incident_code || `INC-${Date.now()}`,
        vessel_name: incident.vessel_name || '',
        vessel_id: incident.vessel_id,
        incident_date: incident.incident_date || new Date().toISOString().split('T')[0],
        category: incident.category || 'Personal Safety',
        severity: incident.severity || 'moderate',
        description: incident.description || '',
        equipment_involved: incident.equipment_involved,
        injuries: incident.injuries || 0,
        environmental_impact: incident.environmental_impact || false,
        reported_by: userData.user?.id,
        organization_id: incident.organization_id,
        status: 'open' as const
      };

      const { data, error } = await supabase
        .from('imca_local_incidents')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Incidente registrado com sucesso');
      await fetchLocalIncidents();
      return data;
    } catch (error) {
      logger.error('Error creating incident:', error);
      toast.error('Erro ao registrar incidente');
      throw error;
    }
  };

  const analyzeIncident = async (incidentId: string) => {
    setAnalyzing(true);
    try {
      const incident = localIncidents.find(i => i.id === incidentId);
      if (!incident) throw new Error('Incidente não encontrado');

      const { data, error } = await supabase.functions.invoke('imca-incident-analyzer', {
        body: {
          incident: {
            id: incident.id,
            vessel_name: incident.vessel_name,
            incident_date: incident.incident_date,
            category: incident.category,
            severity: incident.severity,
            description: incident.description,
            equipment_involved: incident.equipment_involved,
            injuries: incident.injuries,
            environmental_impact: incident.environmental_impact
          },
          action: 'analyze'
        }
      });

      if (error) throw error;

      // Salvar resultado da análise
      const { error: updateError } = await supabase
        .from('imca_local_incidents')
        .update({
          ai_analysis: data.analysis,
          similar_bulletins: data.analysis?.similar_incidents?.map((s: { bulletin_id: string; similarity_score: number }) => ({
            bulletin_id: s.bulletin_id,
            similarity_score: s.similarity_score
          })) || [],
          status: 'investigating'
        })
        .eq('id', incidentId);

      if (updateError) throw updateError;

      toast.success('Análise IMCA concluída');
      await fetchLocalIncidents();
      return data.analysis;
    } catch (error: unknown) {
      logger.error('Error analyzing incident:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('429')) {
        toast.error('Limite de requisições atingido. Aguarde alguns minutos.');
      } else {
        toast.error('Erro na análise de incidente');
      }
      throw error;
    } finally {
      setAnalyzing(false);
    }
  };

  const updateIncidentStatus = async (incidentId: string, status: IMCALocalIncident['status']) => {
    try {
      const { error } = await supabase
        .from('imca_local_incidents')
        .update({ status })
        .eq('id', incidentId);

      if (error) throw error;

      toast.success(`Status atualizado para ${status}`);
      await fetchLocalIncidents();
    } catch (error) {
      logger.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
      throw error;
    }
  };

  const deleteIncident = async (incidentId: string) => {
    try {
      const { error } = await supabase
        .from('imca_local_incidents')
        .delete()
        .eq('id', incidentId);

      if (error) throw error;

      toast.success('Incidente removido');
      await fetchLocalIncidents();
    } catch (error) {
      logger.error('Error deleting incident:', error);
      toast.error('Erro ao remover incidente');
      throw error;
    }
  };

  return {
    bulletins,
    localIncidents,
    loading,
    analyzing,
    stats,
    refetch: () => Promise.all([fetchBulletins(), fetchLocalIncidents()]),
    createLocalIncident,
    analyzeIncident,
    updateIncidentStatus,
    deleteIncident
  };
}
