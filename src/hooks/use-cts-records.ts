/**
 * Hook for CTS (Certificate of Safe Manning) records management
 * Provides CRUD operations and compliance calculations
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { Json } from '@/integrations/supabase/types';

export interface CTSRecord {
  id: string;
  organization_id: string | null;
  vessel_id: string | null;
  cts_number: string;
  flag_state: string;
  classification_society: string | null;
  issue_date: string;
  expiry_date: string;
  vessel_categories: Json | null;
  certified_equipment: Json | null;
  required_positions: Json | null;
  certification_docs: Json | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CTSStats {
  total: number;
  valid: number;
  expiring_soon: number;
  expired: number;
}

export function useCTSRecords(vesselId?: string) {
  const [records, setRecords] = useState<CTSRecord[]>([]);
  const [currentRecord, setCurrentRecord] = useState<CTSRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CTSStats>({
    total: 0,
    valid: 0,
    expiring_soon: 0,
    expired: 0
  });

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('cts_records')
        .select('*')
        .order('expiry_date', { ascending: false });

      if (vesselId) {
        query = query.eq('vessel_id', vesselId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setRecords(data || []);
      
      // Calculate stats
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);

      const statsCalc: CTSStats = {
        total: data?.length || 0,
        valid: 0,
        expiring_soon: 0,
        expired: 0
      };

      data?.forEach(record => {
        const expiry = new Date(record.expiry_date);
        if (expiry < now) {
          statsCalc.expired++;
        } else if (expiry <= thirtyDaysFromNow) {
          statsCalc.expiring_soon++;
        } else {
          statsCalc.valid++;
        }
      });

      setStats(statsCalc);

      // Set current record (most recent valid)
      const validRecord = data?.find(r => r.status === 'valid' && new Date(r.expiry_date) > now);
      setCurrentRecord(validRecord || null);

    } catch (error) {
      logger.error('Error fetching CTS records:', error);
      toast.error('Erro ao carregar registros CTS');
    } finally {
      setLoading(false);
    }
  }, [vesselId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const createRecord = async (record: Partial<CTSRecord>) => {
    try {
      const insertData = {
        cts_number: record.cts_number || '',
        flag_state: record.flag_state || '',
        issue_date: record.issue_date || new Date().toISOString().split('T')[0],
        expiry_date: record.expiry_date || '',
        vessel_id: record.vessel_id,
        organization_id: record.organization_id,
        classification_society: record.classification_society,
        required_positions: record.required_positions || {},
        vessel_categories: record.vessel_categories || [],
        certified_equipment: record.certified_equipment || [],
        certification_docs: record.certification_docs || [],
        status: record.status || 'valid'
      };

      const { data, error } = await supabase
        .from('cts_records')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast.success('CTS cadastrado com sucesso');
      await fetchRecords();
      return data;
    } catch (error) {
      logger.error('Error creating CTS record:', error);
      toast.error('Erro ao cadastrar CTS');
      throw error;
    }
  };

  const updateRecord = async (id: string, updates: Partial<CTSRecord>) => {
    try {
      const { data, error } = await supabase
        .from('cts_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('CTS atualizado com sucesso');
      await fetchRecords();
      return data;
    } catch (error) {
      logger.error('Error updating CTS record:', error);
      toast.error('Erro ao atualizar CTS');
      throw error;
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cts_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('CTS removido com sucesso');
      await fetchRecords();
    } catch (error) {
      logger.error('Error deleting CTS record:', error);
      toast.error('Erro ao remover CTS');
      throw error;
    }
  };

  const checkCompliance = async (ctsId: string, crewMembers: any[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('cts-conformity', {
        body: {
          cts_record: records.find(r => r.id === ctsId),
          crew_certifications: crewMembers.map(c => ({
            crew_name: c.full_name,
            certification_type: c.maritime_certificates?.[0]?.certificate_name || 'N/A',
            certificate_number: c.maritime_certificates?.[0]?.certificate_number || 'N/A',
            expiry_date: c.maritime_certificates?.[0]?.expiry_date || 'N/A'
          })),
          vessel_name: 'Vessel'
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('Error checking CTS compliance:', error);
      toast.error('Erro na verificação de conformidade');
      throw error;
    }
  };

  return {
    records,
    currentRecord,
    loading,
    stats,
    refetch: fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    checkCompliance
  };
}
