/**
 * Hook para dados CII reais do Supabase
 * Integra com emissions_records e vessels
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  calculateCII, 
  EMISSION_FACTORS,
  type CIIResult 
} from "@/lib/esg/cii-calculator";
import { toast } from "sonner";

export interface VesselCIIData {
  vesselId: string;
  vesselName: string;
  imoNumber: string;
  vesselType: string;
  grossTonnage: number;
  currentCII: number;
  requiredCII: number;
  rating: 'A' | 'B' | 'C' | 'D' | 'E';
  totalCO2: number;
  totalDistance: number;
  complianceStatus: 'compliant' | 'warning' | 'non_compliant';
  trend: 'improving' | 'stable' | 'declining';
}

export interface FleetCIIStats {
  avgCII: number;
  totalCO2: number;
  compliantVessels: number;
  warningVessels: number;
  nonCompliantVessels: number;
  totalVessels: number;
  ratingDistribution: Record<string, number>;
}

/**
 * Buscar dados CII de todas embarcações
 */
export function useFleetCIIData(year: number = new Date().getFullYear()) {
  return useQuery({
    queryKey: ['fleet-cii', year],
    queryFn: async (): Promise<{ vessels: VesselCIIData[]; stats: FleetCIIStats }> => {
      // Buscar embarcações
      const { data: vessels, error: vesselsError } = await supabase
        .from('vessels')
        .select('id, name, vessel_type, gross_tonnage, capacity, imo_number, status')
        .eq('status', 'active');
      
      if (vesselsError) throw vesselsError;
      
      if (!vessels || vessels.length === 0) {
        return {
          vessels: [],
          stats: {
            avgCII: 0,
            totalCO2: 0,
            compliantVessels: 0,
            warningVessels: 0,
            nonCompliantVessels: 0,
            totalVessels: 0,
            ratingDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0 }
          }
        };
      }
      
      // Buscar registros de emissões para o ano
      const startOfYear = `${year}-01-01`;
      const endOfYear = `${year}-12-31`;
      
      const { data: emissions, error: emissionsError } = await supabase
        .from('emissions_records')
        .select('*')
        .gte('recorded_date', startOfYear)
        .lte('recorded_date', endOfYear);
      
      // Agrupar emissões por embarcação
      const emissionsByVessel: Record<string, {
        totalFuel: number;
        totalDistance: number;
        totalCO2: number;
        fuelTypes: Record<string, number>;
      }> = {};
      
      if (emissions) {
        for (const record of emissions) {
          const vesselId = record.vessel_id as string;
          if (!vesselId) continue;
          
          if (!emissionsByVessel[vesselId]) {
            emissionsByVessel[vesselId] = {
              totalFuel: 0,
              totalDistance: 0,
              totalCO2: 0,
              fuelTypes: {}
            };
          }
          
          const fuelType = (record.fuel_type as string) || 'hfo';
          const fuelQty = (record.fuel_consumed_mt as number) || 0;
          const co2 = (record.co2_tonnes as number) || 0;
          const distance = (record.distance_nm as number) || 0;
          
          emissionsByVessel[vesselId].totalFuel += fuelQty;
          emissionsByVessel[vesselId].totalDistance += distance;
          emissionsByVessel[vesselId].totalCO2 += co2;
          emissionsByVessel[vesselId].fuelTypes[fuelType] = 
            (emissionsByVessel[vesselId].fuelTypes[fuelType] || 0) + fuelQty;
        }
      }
      
      // Calcular CII para cada embarcação
      const vesselCIIData: VesselCIIData[] = [];
      let totalFleetCO2 = 0;
      let sumCII = 0;
      let ciiCount = 0;
      const ratingDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
      let compliant = 0;
      let warning = 0;
      let nonCompliant = 0;
      
      for (const vessel of vessels) {
        const vesselEmissions = emissionsByVessel[vessel.id];
        
        // Usar gross_tonnage como aproximação de DWT (DWT ≈ GT * 1.5 para cargueiros)
        const estimatedDWT = (vessel.gross_tonnage || vessel.capacity || 5000) * 1.5;
        
        // Se não há dados de emissões, calcular CII estimado baseado no tipo
        let ciiResult: CIIResult;
        let totalCO2 = 0;
        let totalDistance = 0;
        
        if (vesselEmissions && vesselEmissions.totalDistance > 0) {
          // Converter fuelTypes para array
          const fuelConsumption = Object.entries(vesselEmissions.fuelTypes).map(
            ([fuelType, quantity]) => ({ fuelType, quantity })
          );
          
          ciiResult = calculateCII({
            vesselId: vessel.id,
            vesselType: vessel.vessel_type || 'offshore',
            dwt: estimatedDWT,
            fuelConsumption,
            distanceNm: vesselEmissions.totalDistance,
            year,
          });
          
          totalCO2 = vesselEmissions.totalCO2 || ciiResult.totalCO2;
          totalDistance = vesselEmissions.totalDistance;
        } else {
          // Estimar CII baseado em tipo de embarcação (dados de benchmark)
          const estimatedCII = getEstimatedCII(vessel.vessel_type || 'offshore');
          ciiResult = {
            attainedCII: estimatedCII.cii,
            requiredCII: estimatedCII.required,
            rating: estimatedCII.rating,
            totalCO2: 0,
            emissionsByFuel: {},
            complianceStatus: estimatedCII.rating === 'D' ? 'warning' : 
                              estimatedCII.rating === 'E' ? 'non_compliant' : 'compliant',
            reductionRequired: 0,
          };
        }
        
        // Calcular tendência (simplificado - baseado no rating)
        const trend: 'improving' | 'stable' | 'declining' = 
          ciiResult.rating === 'A' || ciiResult.rating === 'B' ? 'improving' :
          ciiResult.rating === 'D' || ciiResult.rating === 'E' ? 'declining' : 'stable';
        
        vesselCIIData.push({
          vesselId: vessel.id,
          vesselName: vessel.name,
          imoNumber: vessel.imo_number || '',
          vesselType: vessel.vessel_type || 'Unknown',
          grossTonnage: vessel.gross_tonnage || 0,
          currentCII: ciiResult.attainedCII,
          requiredCII: ciiResult.requiredCII,
          rating: ciiResult.rating,
          totalCO2,
          totalDistance,
          complianceStatus: ciiResult.complianceStatus,
          trend,
        });
        
        // Agregar estatísticas
        totalFleetCO2 += totalCO2;
        if (ciiResult.attainedCII > 0) {
          sumCII += ciiResult.attainedCII;
          ciiCount++;
        }
        ratingDistribution[ciiResult.rating]++;
        
        if (ciiResult.complianceStatus === 'compliant') compliant++;
        else if (ciiResult.complianceStatus === 'warning') warning++;
        else nonCompliant++;
      }
      
      return {
        vessels: vesselCIIData,
        stats: {
          avgCII: ciiCount > 0 ? Math.round((sumCII / ciiCount) * 100) / 100 : 0,
          totalCO2: Math.round(totalFleetCO2 * 10) / 10,
          compliantVessels: compliant,
          warningVessels: warning,
          nonCompliantVessels: nonCompliant,
          totalVessels: vessels.length,
          ratingDistribution,
        }
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Buscar CII de uma embarcação específica
 */
export function useVesselCII(vesselId: string, year: number = new Date().getFullYear()) {
  return useQuery({
    queryKey: ['vessel-cii', vesselId, year],
    queryFn: async () => {
      // Buscar dados da embarcação
      const { data: vessel, error: vesselError } = await supabase
        .from('vessels')
        .select('*')
        .eq('id', vesselId)
        .single();
      
      if (vesselError) throw vesselError;
      
      // Buscar emissões do ano
      const startOfYear = `${year}-01-01`;
      const endOfYear = `${year}-12-31`;
      
      const { data: emissions, error: emissionsError } = await supabase
        .from('emissions_records')
        .select('*')
        .eq('vessel_id', vesselId)
        .gte('recorded_date', startOfYear)
        .lte('recorded_date', endOfYear)
        .order('recorded_date', { ascending: true });
      
      if (emissionsError) throw emissionsError;
      
      // Usar gross_tonnage como aproximação de DWT
      const estimatedDWT = (vessel.gross_tonnage || vessel.capacity || 5000) * 1.5;
      
      // Calcular CII mensal
      const monthlyData = [];
      const fuelConsumption: { fuelType: string; quantity: number }[] = [];
      let totalDistance = 0;
      
      if (emissions && emissions.length > 0) {
        // Agrupar por mês
        const monthlyEmissions: Record<number, { fuel: number; distance: number; co2: number }> = {};
        
        for (const record of emissions) {
          const recordDate = record.recorded_date as string;
          const month = new Date(recordDate).getMonth();
          if (!monthlyEmissions[month]) {
            monthlyEmissions[month] = { fuel: 0, distance: 0, co2: 0 };
          }
          
          const fuelQty = (record.fuel_consumed_mt as number) || 0;
          const distance = (record.distance_nm as number) || 0;
          const co2 = (record.co2_tonnes as number) || 0;
          const fuelType = (record.fuel_type as string) || 'hfo';
          
          monthlyEmissions[month].fuel += fuelQty;
          monthlyEmissions[month].distance += distance;
          monthlyEmissions[month].co2 += co2;
          
          // Agregar para cálculo total
          const existing = fuelConsumption.find(f => f.fuelType === fuelType);
          if (existing) {
            existing.quantity += fuelQty;
          } else {
            fuelConsumption.push({ fuelType, quantity: fuelQty });
          }
          totalDistance += distance;
        }
        
        // Converter para array
        for (let i = 0; i < 12; i++) {
          const data = monthlyEmissions[i] || { fuel: 0, distance: 0, co2: 0 };
          monthlyData.push({
            month: i,
            monthName: new Date(year, i).toLocaleString('pt-BR', { month: 'short' }),
            fuelConsumed: data.fuel,
            distance: data.distance,
            co2: data.co2,
            cii: data.distance > 0 
              ? (data.co2 * 1000000) / (estimatedDWT * data.distance)
              : 0,
          });
        }
      }
      
      // Calcular CII total
      const ciiResult = fuelConsumption.length > 0 && totalDistance > 0
        ? calculateCII({
            vesselId,
            vesselType: vessel.vessel_type || 'offshore',
            dwt: estimatedDWT,
            fuelConsumption,
            distanceNm: totalDistance,
            year,
          })
        : null;
      
      return {
        vessel,
        cii: ciiResult,
        monthlyData,
        totalDistance,
        hasData: fuelConsumption.length > 0,
      };
    },
    enabled: !!vesselId,
  });
}

/**
 * Registrar consumo de combustível e calcular emissões
 */
export function useRecordEmissions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      vesselId: string;
      voyageId?: string;
      recordedDate: Date;
      fuelType: string;
      fuelConsumedMt: number;
      distanceNm: number;
      cargoCarriedMt?: number;
    }) => {
      // Calcular CO2
      const factor = EMISSION_FACTORS[data.fuelType.toLowerCase()] || EMISSION_FACTORS.hfo;
      const co2Tonnes = data.fuelConsumedMt * factor;
      
      // Calcular carbon intensity
      const carbonIntensity = data.cargoCarriedMt && data.distanceNm
        ? (co2Tonnes * 1000000) / (data.cargoCarriedMt * data.distanceNm)
        : null;
      
      const { data: record, error } = await supabase
        .from('emissions_records')
        .insert({
          vessel_id: data.vesselId,
          voyage_id: data.voyageId,
          recorded_date: data.recordedDate.toISOString().split('T')[0],
          fuel_type: data.fuelType,
          fuel_consumed_mt: data.fuelConsumedMt,
          distance_nm: data.distanceNm,
          cargo_carried_mt: data.cargoCarriedMt,
          co2_tonnes: co2Tonnes,
          carbon_intensity: carbonIntensity,
        })
        .select()
        .single();
      
      if (error) throw error;
      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fleet-cii'] });
      queryClient.invalidateQueries({ queryKey: ['vessel-cii'] });
      toast.success('Emissões registradas com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao registrar emissões: ' + (error as Error).message);
    },
  });
}

/**
 * CII estimado por tipo de embarcação (benchmarks de mercado)
 */
function getEstimatedCII(vesselType: string): { cii: number; required: number; rating: 'A' | 'B' | 'C' | 'D' | 'E' } {
  const benchmarks: Record<string, { cii: number; required: number }> = {
    'bulk_carrier': { cii: 5.2, required: 6.5 },
    'tanker': { cii: 4.8, required: 5.8 },
    'container': { cii: 12.5, required: 14.0 },
    'lng_carrier': { cii: 3.5, required: 4.2 },
    'roro': { cii: 22.0, required: 25.0 },
    'cruise': { cii: 45.0, required: 52.0 },
    'offshore': { cii: 28.0, required: 32.0 },
    'psv': { cii: 25.0, required: 30.0 },
    'ahts': { cii: 35.0, required: 40.0 },
    'default': { cii: 8.0, required: 10.0 },
  };
  
  const normalized = vesselType.toLowerCase().replace(/[^a-z_]/g, '');
  const data = benchmarks[normalized] || benchmarks.default;
  
  const ratio = data.cii / data.required;
  let rating: 'A' | 'B' | 'C' | 'D' | 'E';
  
  if (ratio <= 0.86) rating = 'A';
  else if (ratio <= 0.94) rating = 'B';
  else if (ratio <= 1.06) rating = 'C';
  else if (ratio <= 1.18) rating = 'D';
  else rating = 'E';
  
  return { cii: data.cii, required: data.required, rating };
}
