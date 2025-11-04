// @ts-nocheck
/**
 * PATCH 603 - Historical Failure Pattern Hook
 * React hook for analyzing and predicting failures based on historical data
 */

import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

export interface FailurePattern {
  pattern: string;
  occurrences: number;
  avgInterval: number; // days
  lastSeen: Date;
  nextPredicted: Date;
  confidence: number; // 0-1
  severity: number; // 1-10
}

export interface FailureTrend {
  increasing: boolean;
  percentage: number;
  period: string;
}

export function useHistoricalFailurePattern(moduleName: string, vesselId?: string) {
  const [patterns, setPatterns] = useState<FailurePattern[]>([]);
  const [trends, setTrends] = useState<FailureTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyzePatterns();
  }, [moduleName, vesselId]);

  const analyzePatterns = async () => {
    setIsLoading(true);
    setError(null);

    try {
      logger.info(`[Failure Pattern Hook] Analyzing patterns for ${moduleName}...`);

      // Fetch historical inspection data
      let query = supabase
        .from("auditorias")
        .select("*")
        .eq("tipo", moduleName)
        .order("data", { ascending: false })
        .limit(200);

      if (vesselId) {
        query = query.eq("vessel_id", vesselId);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        throw new Error(`Failed to fetch inspection history: ${queryError.message}`);
      }

      // Process patterns
      const detectedPatterns = processHistoricalData(data || []);
      setPatterns(detectedPatterns);

      // Calculate trends
      const calculatedTrends = calculateTrends(data || []);
      setTrends(calculatedTrends);

      logger.info(`[Failure Pattern Hook] Found ${detectedPatterns.length} patterns`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      logger.error("[Failure Pattern Hook] Error:", errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    analyzePatterns();
  };

  return {
    patterns,
    trends,
    isLoading,
    error,
    refresh
  };
}

/**
 * Process historical data to detect patterns
 */
function processHistoricalData(audits: any[]): FailurePattern[] {
  const patterns: FailurePattern[] = [];
  const failureMap = new Map<string, Date[]>();

  // Group findings by type
  audits.forEach(audit => {
    const findings = audit.findings || [];
    const auditDate = new Date(audit.data);

    findings.forEach((finding: string) => {
      if (!failureMap.has(finding)) {
        failureMap.set(finding, []);
      }
      failureMap.get(finding)?.push(auditDate);
    });
  });

  // Analyze each finding type
  failureMap.forEach((dates, finding) => {
    if (dates.length >= 2) {
      // Sort dates
      const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());

      // Calculate average interval
      let totalDays = 0;
      for (let i = 1; i < sortedDates.length; i++) {
        const daysDiff = Math.floor(
          (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
        );
        totalDays += daysDiff;
      }
      const avgInterval = totalDays / (sortedDates.length - 1);

      // Predict next occurrence
      const lastSeen = sortedDates[sortedDates.length - 1];
      const nextPredicted = new Date(lastSeen);
      nextPredicted.setDate(nextPredicted.getDate() + Math.floor(avgInterval));

      // Calculate confidence based on consistency of intervals
      const intervals: number[] = [];
      for (let i = 1; i < sortedDates.length; i++) {
        intervals.push(
          Math.floor((sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24))
        );
      }
      const variance = calculateVariance(intervals);
      const confidence = Math.max(0, Math.min(1, 1 - (variance / avgInterval)));

      // Calculate severity based on frequency and recency
      const daysSinceLastOccurrence = Math.floor(
        (new Date().getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24)
      );
      const recencyFactor = Math.max(0, 10 - (daysSinceLastOccurrence / 30));
      const frequencyFactor = Math.min(10, dates.length * 1.5);
      const severity = Math.min(10, Math.max(1, (frequencyFactor + recencyFactor) / 2));

      patterns.push({
        pattern: finding,
        occurrences: dates.length,
        avgInterval,
        lastSeen,
        nextPredicted,
        confidence,
        severity
      });
    }
  });

  // Sort by severity (highest first)
  return patterns.sort((a, b) => b.severity - a.severity);
}

/**
 * Calculate trends over time
 */
function calculateTrends(audits: any[]): FailureTrend[] {
  const trends: FailureTrend[] = [];

  if (audits.length < 4) {
    return trends;
  }

  // Split into two periods (last 6 months vs previous 6 months)
  const midpoint = Math.floor(audits.length / 2);
  const recentPeriod = audits.slice(0, midpoint);
  const olderPeriod = audits.slice(midpoint);

  // Count findings in each period
  const recentFindings = recentPeriod.reduce((sum, audit) => 
    sum + (audit.findings?.length || 0), 0
  );
  const olderFindings = olderPeriod.reduce((sum, audit) => 
    sum + (audit.findings?.length || 0), 0
  );

  if (olderFindings > 0) {
    const percentageChange = ((recentFindings - olderFindings) / olderFindings) * 100;
    
    trends.push({
      increasing: percentageChange > 0,
      percentage: Math.abs(percentageChange),
      period: "last_6_months"
    });
  }

  // Score trend
  const recentScores = recentPeriod.map(a => a.score || 0).filter(s => s > 0);
  const olderScores = olderPeriod.map(a => a.score || 0).filter(s => s > 0);

  if (recentScores.length > 0 && olderScores.length > 0) {
    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
    const scoreDiff = recentAvg - olderAvg;
    const scorePercentage = (Math.abs(scoreDiff) / olderAvg) * 100;

    trends.push({
      increasing: scoreDiff > 0, // Higher scores = improving
      percentage: scorePercentage,
      period: "compliance_score"
    });
  }

  return trends;
}

/**
 * Calculate variance of an array of numbers
 */
function calculateVariance(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
}
