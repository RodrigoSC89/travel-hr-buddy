/**
 * Hook para carregar dados PEOTRAM do banco de dados
 * Com fallback para dados locais quando offline
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PEOTRAM_2024_ELEMENTS } from '@/data/peotram-2024-elements';

export interface PeotramElementDB {
  id: string;
  element_number: number;
  element_name: string;
  element_sigla: string | null;
  description: string | null;
  weight_percentage: number | null;
  is_critical: boolean | null;
  importance_level: string | null;
  total_items: number | null;
}

export interface PeotramItemDB {
  id: string;
  element_id: string | null;
  item_number: string;
  item_name: string;
  description: string | null;
  requirement: string | null;
  evidence_required: string[] | null;
  norm_reference: string | null;
  criticality_level: string | null;
}

export interface PeotramAuditDB {
  id: string;
  vessel_name: string | null;
  vessel_imo: string | null;
  auditor_name: string | null;
  audit_date: string;
  audit_status: string | null;
  overall_score: number | null;
}

export function usePeotramData() {
  const [elements, setElements] = useState<PeotramElementDB[]>([]);
  const [items, setItems] = useState<PeotramItemDB[]>([]);
  const [audits, setAudits] = useState<PeotramAuditDB[]>([]);
  // PATCH v44: Iniciar com loading=false para NUNCA bloquear a renderização
  // O loading será setado para true apenas quando o fetch iniciar
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Load elements from Supabase
  const loadElements = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('peotram_elements_2024')
        .select('*')
        .order('element_number');

      if (error) throw error;

      if (data && data.length > 0) {
        setElements(data);
        // PATCH v20: Não alterar isOnline baseado em dados
        return data;
      } else {
        // Fallback to local data
        console.log('Using local PEOTRAM data (no remote data)');
        // PATCH v20: NÃO definir isOnline como false - dados locais não significam offline
        const localElements = PEOTRAM_2024_ELEMENTS.map(e => ({
          id: `local-${e.id}`,
          element_number: e.id,
          element_name: e.name,
          element_sigla: e.shortName,
          description: e.description,
          weight_percentage: 7.7,
          is_critical: e.isCritical,
          importance_level: e.criticalityLevel === 3 ? 'critical' : e.criticalityLevel === 2 ? 'high' : 'normal',
          total_items: e.totalItems
        }));
        setElements(localElements);
        return localElements;
      }
    } catch (err) {
      console.error('Error loading elements:', err);
      setError('Erro ao carregar elementos');
      // PATCH v20: NÃO definir isOnline como false - erros de API não significam offline
      // Fallback to local data
      const localElements = PEOTRAM_2024_ELEMENTS.map(e => ({
        id: `local-${e.id}`,
        element_number: e.id,
        element_name: e.name,
        element_sigla: e.shortName,
        description: e.description,
        weight_percentage: 7.7,
        is_critical: e.isCritical,
        importance_level: e.criticalityLevel === 3 ? 'critical' : e.criticalityLevel === 2 ? 'high' : 'normal',
        total_items: e.totalItems
      }));
      setElements(localElements);
      return localElements;
    }
  }, []);

  // Load items for a specific element
  const loadItemsForElement = useCallback(async (elementId: string) => {
    try {
      const { data, error } = await supabase
        .from('peotram_items_2024')
        .select('*')
        .eq('element_id', elementId)
        .order('item_number');

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error loading items:', err);
      return [];
    }
  }, []);

  // Load all items
  const loadAllItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('peotram_items_2024')
        .select('*')
        .order('item_number');

      if (error) throw error;
      setItems(data || []);
      return data || [];
    } catch (err) {
      console.error('Error loading items:', err);
      setItems([]);
      return [];
    }
  }, []);

  // Load audits
  const loadAudits = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('peotram_audits_2024')
        .select('*')
        .order('audit_date', { ascending: false });

      if (error) throw error;
      setAudits(data || []);
      return data || [];
    } catch (err) {
      console.error('Error loading audits:', err);
      setAudits([]);
      return [];
    }
  }, []);

  // Create new audit
  const createAudit = useCallback(async (auditData: Partial<PeotramAuditDB>) => {
    try {
      const { data, error } = await supabase
        .from('peotram_audits_2024')
        .insert([{
          vessel_name: auditData.vessel_name,
          vessel_imo: auditData.vessel_imo,
          auditor_name: auditData.auditor_name,
          audit_date: auditData.audit_date || new Date().toISOString().split('T')[0],
          audit_status: 'draft',
          overall_score: 0
        }])
        .select()
        .single();

      if (error) throw error;
      await loadAudits();
      return data;
    } catch (err) {
      console.error('Error creating audit:', err);
      throw err;
    }
  }, [loadAudits]);

  // Save audit response
  const saveAuditResponse = useCallback(async (response: {
    audit_id: string;
    item_number: string;
    element_number: number;
    status: string;
    score?: number;
    nc_classification?: string;
    auditor_notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('peotram_audit_responses_2024')
        .upsert([response], { onConflict: 'audit_id,item_number' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error saving response:', err);
      throw err;
    }
  }, []);

  // Get audit responses
  const getAuditResponses = useCallback(async (auditId: string) => {
    try {
      const { data, error } = await supabase
        .from('peotram_audit_responses_2024')
        .select('*')
        .eq('audit_id', auditId);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error loading responses:', err);
      return [];
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([
        loadElements(),
        loadAllItems(),
        loadAudits()
      ]);
      setIsLoading(false);
    };
    init();
  }, [loadElements, loadAllItems, loadAudits]);

  // Refresh data
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await Promise.all([
      loadElements(),
      loadAllItems(),
      loadAudits()
    ]);
    setIsLoading(false);
  }, [loadElements, loadAllItems, loadAudits]);

  return {
    elements,
    items,
    audits,
    isLoading,
    error,
    isOnline,
    refresh,
    loadElements,
    loadItemsForElement,
    loadAllItems,
    loadAudits,
    createAudit,
    saveAuditResponse,
    getAuditResponses
  };
}

export default usePeotramData;
