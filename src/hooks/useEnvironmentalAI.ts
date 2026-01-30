/**
 * Hook for Environmental AI Module
 * Emissions tracking, decarbonization, ballast water, waste management
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmissionsData {
  vesselId: string;
  period: string;
  co2: number;
  nox: number;
  sox: number;
  pm: number;
  cii: { rating: string; score: number; trend: 'improving' | 'stable' | 'declining' };
  eexi: { value: number; required: number; compliant: boolean };
  fuelConsumption: { hfo: number; mgo: number; lng?: number };
  voyageEfficiency: number;
}

export interface DecarbonizationRoadmap {
  currentIntensity: number;
  targetIntensity: number;
  targetYear: number;
  milestones: Array<{ year: number; target: number; measures: string[] }>;
  technologies: Array<{ 
    name: string; 
    investment: number; 
    savings: number; 
    payback: number;
    co2Reduction: number;
  }>;
  roi: number;
  compliance: { imo2030: boolean; imo2050: boolean; eu2030: boolean };
}

export interface BallastWaterStatus {
  vesselId: string;
  systemType: string;
  lastSampling: string;
  nextSampling: string;
  complianceStatus: 'compliant' | 'non_compliant' | 'pending';
  treatmentLog: Array<{ date: string; volume: number; location: string }>;
  formEStatus: 'submitted' | 'pending' | 'expired';
}

export interface WasteManagement {
  vesselId: string;
  garbageRecordBook: Array<{ date: string; category: string; quantity: number; disposal: string }>;
  marpolCompliance: { annexI: boolean; annexII: boolean; annexIV: boolean; annexV: boolean; annexVI: boolean };
  recyclingRate: number;
  portReception: Array<{ port: string; facility: string; available: boolean }>;
  nextDisposal: { date: string; port: string; types: string[] };
}

export function useEnvironmentalAI() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getEmissions = useCallback(async (
    vesselId: string,
    period: 'month' | 'quarter' | 'year' = 'year'
  ): Promise<EmissionsData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('environmental-ai', {
        body: { 
          action: 'get_emissions',
          vesselId,
          period
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.emissionsData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar emissões';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculateCII = useCallback(async (
    vesselId: string,
    voyageData: Array<{ distance: number; cargo: number; fuelConsumed: number }>
  ): Promise<{ rating: string; score: number; projectedRating: string; improvement: string[] } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('environmental-ai', {
        body: { 
          action: 'calculate_cii',
          vesselId,
          voyageData
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'CII Calculado',
        description: `Rating: ${data.ciiResult?.rating || 'C'}`,
      });

      return data.ciiResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao calcular CII';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const generateDecarbonizationRoadmap = useCallback(async (
    vesselId: string,
    targetYear: number = 2050
  ): Promise<DecarbonizationRoadmap | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('environmental-ai', {
        body: { 
          action: 'generate_decarbonization_roadmap',
          vesselId,
          targetYear
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'Roadmap Gerado',
        description: `ROI estimado: ${data.roadmap?.roi || 150}%`,
      });

      return data.roadmap;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar roadmap';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getBallastWaterStatus = useCallback(async (
    vesselId: string
  ): Promise<BallastWaterStatus | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('environmental-ai', {
        body: { 
          action: 'get_ballast_water_status',
          vesselId
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.ballastWaterStatus;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar status BWM';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getWasteManagement = useCallback(async (
    vesselId: string
  ): Promise<WasteManagement | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('environmental-ai', {
        body: { 
          action: 'get_waste_management',
          vesselId
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.wasteManagement;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar gestão de resíduos';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitIMODCS = useCallback(async (
    vesselId: string,
    year: number
  ): Promise<{ submitted: boolean; reference: string; nextDeadline: string } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('environmental-ai', {
        body: { 
          action: 'submit_imo_dcs',
          vesselId,
          year
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'IMO DCS Submetido',
        description: `Referência: ${data.submission?.reference || 'DCS-2024-001'}`,
      });

      return data.submission;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao submeter IMO DCS';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    error,
    getEmissions,
    calculateCII,
    generateDecarbonizationRoadmap,
    getBallastWaterStatus,
    getWasteManagement,
    submitIMODCS
  };
}
