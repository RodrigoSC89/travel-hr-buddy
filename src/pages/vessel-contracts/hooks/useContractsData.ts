/**
 * useContractsData Hook - Extracted from VesselContractsV2
 * Handles contracts and downtime data fetching and mutations
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

export interface Contract {
  id: string;
  contract_number: string;
  client_name: string;
  operator_name?: string | null;
  start_date: string;
  end_date: string;
  sla_downtime_percent: number | null;
  penalty_per_hour: number | null;
  status: string | null;
  vessel_id?: string | null;
}

export interface DowntimeEvent {
  id: string;
  start_time: string;
  end_time?: string | null;
  duration_hours?: number | null;
  reason: string | null;
  reason_category: string | null;
  ai_analysis?: Record<string, unknown> | null;
  impact_level: string | null;
  justification_status: string | null;
}

export interface NewContractForm {
  contract_number: string;
  client_name: string;
  start_date: string;
  end_date: string;
  sla_downtime_percent: string;
  penalty_per_hour: string;
  terms: string;
}

export function useContractsData() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [downtimeEvents, setDowntimeEvents] = useState<DowntimeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [contractsRes, downtimeRes] = await Promise.all([
        supabase.from('vessel_contracts').select('*').order('created_at', { ascending: false }),
        supabase.from('downtime_events').select('*').order('start_time', { ascending: false }).limit(50)
      ]);

      if (contractsRes.data) setContracts(contractsRes.data);
      if (downtimeRes.data) {
        // Map to ensure type compatibility
        const mappedEvents: DowntimeEvent[] = downtimeRes.data.map(d => ({
          id: d.id,
          start_time: d.start_time,
          end_time: d.end_time,
          duration_hours: d.duration_hours,
          reason: d.reason,
          reason_category: d.reason_category,
          impact_level: d.impact_level,
          justification_status: d.justification_status,
          ai_analysis: d.ai_analysis as Record<string, unknown> | null
        }));
        setDowntimeEvents(mappedEvents);
      }
    } catch (error) {
      logger.error('Error loading contracts data', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createContract = async (newContract: NewContractForm) => {
    if (!newContract.contract_number || !newContract.client_name) {
      toast.error('Preencha os campos obrigatórios');
      return false;
    }

    try {
      const { error } = await supabase.from('vessel_contracts').insert({
        contract_number: newContract.contract_number,
        client_name: newContract.client_name,
        start_date: newContract.start_date,
        end_date: newContract.end_date,
        sla_downtime_percent: parseFloat(newContract.sla_downtime_percent) || null,
        penalty_per_hour: parseFloat(newContract.penalty_per_hour) || null,
        status: 'active'
      });

      if (error) throw error;
      
      toast.success('Contrato criado com sucesso!');
      await loadData();
      return true;
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error('Erro ao criar contrato');
      return false;
    }
  };

  const createDowntime = async (data: {
    start_time: string;
    end_time: string;
    reported_reason: string;
    category: string;
    vessel_id?: string;
    contract_id?: string;
    notes?: string;
  }) => {
    try {
      const startTime = new Date(data.start_time);
      const endTime = data.end_time ? new Date(data.end_time) : null;
      const durationHours = endTime 
        ? (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
        : null;

      const { error } = await supabase.from('downtime_events').insert({
        start_time: startTime.toISOString(),
        end_time: endTime?.toISOString() || null,
        duration_hours: durationHours,
        reason: data.reported_reason,
        reason_category: data.category,
        impact_level: 'medium',
        justification_status: 'pending'
      });

      if (error) throw error;
      
      toast.success('Downtime registrado com sucesso!');
      await loadData();
      return true;
    } catch (error) {
      console.error('Error creating downtime:', error);
      toast.error('Erro ao registrar downtime');
      return false;
    }
  };

  const analyzeContractWithAI = async (contractId: string) => {
    setIsAnalyzing(true);
    try {
      const { error } = await supabase.functions.invoke('contract-downtime-ai', {
        body: { action: 'analyze_contract', contractId }
      });

      if (error) throw error;
      toast.success('Análise IA do contrato concluída');
      await loadData();
    } catch (error) {
      toast.error('Erro na análise IA');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateBROA = async (eventId: string) => {
    setIsAnalyzing(true);
    try {
      const { error } = await supabase.functions.invoke('contract-downtime-ai', {
        body: { action: 'generate_broa', eventId }
      });

      if (error) throw error;
      toast.success('BROA gerado com sucesso');
    } catch (error) {
      toast.error('Erro ao gerar BROA');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportContracts = () => {
    const content = contracts.map(c => 
      `${c.contract_number},${c.client_name},${c.start_date},${c.end_date},${c.status}`
    ).join('\n');
    
    const blob = new Blob([`Contrato,Cliente,Início,Fim,Status\n${content}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contratos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Contratos exportados!');
  };

  // Computed stats
  const stats = {
    activeContracts: contracts.filter(c => c.status === 'active').length,
    totalDowntimeHours: downtimeEvents.reduce((acc, d) => acc + (d.duration_hours || 0), 0),
    criticalDowntimes: downtimeEvents.filter(d => d.impact_level === 'critical').length,
    avgSLA: contracts.length > 0 
      ? (contracts.reduce((acc, c) => acc + (c.sla_downtime_percent || 0), 0) / contracts.length).toFixed(1)
      : '0'
  };

  return {
    contracts,
    downtimeEvents,
    loading,
    isAnalyzing,
    stats,
    loadData,
    createContract,
    createDowntime,
    analyzeContractWithAI,
    generateBROA,
    exportContracts
  };
}
