/**
 * AI Tracking Hook
 * AI-powered predictions and recommendations for GNSS tracking
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { GnssLog, GnssAIRecommendation } from "../types";
import { logger } from '@/lib/logger';

interface AITrackingInput {
  positionHistory: GnssLog[];
  currentPosition?: GnssLog;
  correctionData?: {
    source: string;
    quality: number;
    age_ms: number;
  };
}

interface TrajectoryPrediction {
  points: Array<{ lat: number; lng: number; timestamp: string }>;
  confidence: number;
  estimatedArrival?: string;
}

interface SignalAnalysis {
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  recommendations: string[];
  predictedDegradation?: {
    probability: number;
    timeframe: string;
  };
}

export function useAITracking() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastPrediction, setLastPrediction] = useState<TrajectoryPrediction | null>(null);
  const [signalAnalysis, setSignalAnalysis] = useState<SignalAnalysis | null>(null);

  const predictTrajectory = useCallback(async (input: AITrackingInput): Promise<TrajectoryPrediction | null> => {
    if (input.positionHistory.length < 3) {
      toast.info("Histórico insuficiente para predição de trajetória");
      return null;
    }

    setIsAnalyzing(true);
    
    try {
      // Calculate trajectory based on historical positions
      const positions = input.positionHistory.slice(0, 10);
      
      // Calculate average velocity and heading
      let totalSpeed = 0;
      let totalHeading = 0;
      let validPoints = 0;
      
      for (const pos of positions) {
        if (pos.speed) {
          totalSpeed += pos.speed;
          validPoints++;
        }
        if (pos.heading) {
          totalHeading += pos.heading;
        }
      }
      
      const avgSpeed = validPoints > 0 ? totalSpeed / validPoints : 0;
      const avgHeading = validPoints > 0 ? totalHeading / validPoints : 0;
      
      // Project future positions (next 30 minutes, 5-minute intervals)
      const currentPos = input.currentPosition || positions[0];
      const predictedPoints: Array<{ lat: number; lng: number; timestamp: string }> = [];
      
      for (let i = 1; i <= 6; i++) {
        const timeOffset = i * 5 * 60 * 1000; // 5 minutes in ms
        const distance = avgSpeed * (5 / 60); // Distance in nautical miles for 5 minutes
        
        // Convert to lat/lng delta (simplified)
        const headingRad = (avgHeading * Math.PI) / 180;
        const latDelta = (distance / 60) * Math.cos(headingRad);
        const lngDelta = (distance / 60) * Math.sin(headingRad) / Math.cos((currentPos.latitude * Math.PI) / 180);
        
        predictedPoints.push({
          lat: currentPos.latitude + latDelta * i,
          lng: currentPos.longitude + lngDelta * i,
          timestamp: new Date(Date.now() + timeOffset).toISOString(),
        });
      }
      
      // Calculate confidence based on data quality
      const avgAccuracy = positions.reduce((sum, p) => sum + (p.accuracy || 10), 0) / positions.length;
      const confidence = Math.max(0.5, 1 - (avgAccuracy / 100));
      
      const prediction: TrajectoryPrediction = {
        points: predictedPoints,
        confidence,
        estimatedArrival: predictedPoints[predictedPoints.length - 1]?.timestamp,
      };
      
      setLastPrediction(prediction);
      
      // Save recommendation to database
      await supabase.from("gnss_ai_recommendations").insert({
        recommendation_type: "trajectory_prediction",
        title: "Previsão de Trajetória",
        description: `Trajetória projetada para os próximos 30 minutos com ${(confidence * 100).toFixed(0)}% de confiança`,
        confidence,
        predicted_trajectory: predictedPoints,
        suggested_action: avgSpeed < 1 ? "Embarcação em movimento lento ou parada" : "Manter curso atual",
      });
      
      return prediction;
    } catch (error) {
      logger.error("Trajectory prediction error:", error);
      toast.error("Erro ao calcular predição de trajetória");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const analyzeSignalQuality = useCallback(async (input: AITrackingInput): Promise<SignalAnalysis | null> => {
    if (!input.currentPosition) {
      return null;
    }

    setIsAnalyzing(true);
    
    try {
      const pos = input.currentPosition;
      const recommendations: string[] = [];
      let quality: SignalAnalysis['quality'] = 'good';
      
      // Analyze signal quality based on various metrics
      const signalScore = pos.signal_quality || 70;
      const satellites = pos.satellites_used || 6;
      const hdop = pos.hdop || 2.0;
      const accuracy = pos.accuracy || 5;
      
      // Determine quality level
      if (signalScore >= 90 && satellites >= 8 && hdop < 1.0 && accuracy < 2) {
        quality = 'excellent';
      } else if (signalScore >= 75 && satellites >= 6 && hdop < 1.5 && accuracy < 5) {
        quality = 'good';
      } else if (signalScore >= 50 && satellites >= 4 && hdop < 3.0 && accuracy < 10) {
        quality = 'fair';
        recommendations.push("Considere reposicionamento da antena GNSS");
      } else if (signalScore >= 25 && satellites >= 3) {
        quality = 'poor';
        recommendations.push("Qualidade de sinal degradada - verifique obstruções");
        recommendations.push("Ativar correções DGPS/RTK se disponível");
      } else {
        quality = 'critical';
        recommendations.push("Sinal GNSS crítico - navegação comprometida");
        recommendations.push("Verificar equipamento de recepção");
        recommendations.push("Considerar navegação por backup");
      }
      
      // Check correction data
      if (input.correctionData) {
        if (input.correctionData.age_ms > 30000) {
          recommendations.push("Dados de correção desatualizados (>30s)");
        }
        if (input.correctionData.quality < 50) {
          recommendations.push(`Qualidade de correção ${input.correctionData.source} baixa`);
        }
      } else if (pos.fix_type === 'gps') {
        recommendations.push("Sem correções ativas - considere RBMC/NTRIP");
      }
      
      // Predict degradation
      const recentHistory = input.positionHistory.slice(0, 5);
      const qualityTrend = recentHistory.map(p => p.signal_quality || 70);
      const isDecreasing = qualityTrend.length >= 3 && 
        qualityTrend[0] < qualityTrend[1] && qualityTrend[1] < qualityTrend[2];
      
      const analysis: SignalAnalysis = {
        quality,
        recommendations,
        predictedDegradation: isDecreasing ? {
          probability: 0.7,
          timeframe: "próximos 10-15 minutos",
        } : undefined,
      };
      
      setSignalAnalysis(analysis);
      
      // Save if there are recommendations
      if (recommendations.length > 0) {
        await supabase.from("gnss_ai_recommendations").insert({
          recommendation_type: "signal_optimization",
          title: `Análise de Sinal: ${quality.toUpperCase()}`,
          description: recommendations.join("; "),
          confidence: 0.85,
          suggested_action: recommendations[0],
        });
      }
      
      return analysis;
    } catch (error) {
      logger.error("Signal analysis error:", error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const detectRouteDeviation = useCallback(async (
    currentPosition: GnssLog,
    plannedRoute: Array<{ lat: number; lng: number }>,
    thresholdMeters = 500
  ): Promise<boolean> => {
    if (plannedRoute.length < 2) return false;
    
    // Find closest point on route
    let minDistance = Infinity;
    
    for (let i = 0; i < plannedRoute.length - 1; i++) {
      const p1 = plannedRoute[i];
      const p2 = plannedRoute[i + 1];
      
      // Calculate distance from current position to line segment
      const distance = pointToLineDistance(
        currentPosition.latitude,
        currentPosition.longitude,
        p1.lat,
        p1.lng,
        p2.lat,
        p2.lng
      );
      
      if (distance < minDistance) {
        minDistance = distance;
      }
    }
    
    const deviationDetected = minDistance > thresholdMeters;
    
    if (deviationDetected) {
      // Create alert
      await supabase.from("gnss_alerts").insert({
        alert_type: "route_deviation",
        severity: minDistance > thresholdMeters * 2 ? "critical" : "warning",
        title: "Desvio de Rota Detectado",
        description: `Distância da rota planejada: ${Math.round(minDistance)}m`,
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
        threshold_value: thresholdMeters,
        actual_value: minDistance,
      });
      
      toast.warning(`Desvio de rota: ${Math.round(minDistance)}m da rota planejada`);
    }
    
    return deviationDetected;
  }, []);

  return {
    isAnalyzing,
    lastPrediction,
    signalAnalysis,
    predictTrajectory,
    analyzeSignalQuality,
    detectRouteDeviation,
  };
}

// Helper function to calculate distance from point to line segment
function pointToLineDistance(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number
): number {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx: number, yy: number;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  
  // Convert to meters (approximate)
  const latDist = dx * 111320;
  const lngDist = dy * 111320 * Math.cos((px * Math.PI) / 180);
  
  return Math.sqrt(latDist * latDist + lngDist * lngDist);
}
