// @ts-nocheck
/**
 * PATCH 605 - ESG Widget Component
 * Dashboard widget displaying ESG compliance summary
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Leaf, TrendingDown, TrendingUp, AlertTriangle, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { ESGMetric, EmissionLog, CIIRating } from "../types";

export function ESGWidget() {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<ESGMetric[]>([]);
  const [emissions, setEmissions] = useState<EmissionLog[]>([]);
  const [complianceSummary, setComplianceSummary] = useState({
    compliant: 0,
    atRisk: 0,
    nonCompliant: 0,
    total: 0
  });

  useEffect(() => {
    loadESGData();
  }, []);

  const loadESGData = async () => {
    setIsLoading(true);
    try {
      // Load recent metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from("esg_metrics")
        .select("*")
        .order("measurement_date", { ascending: false })
        .limit(10);

      if (metricsError) throw metricsError;

      const mappedMetrics = (metricsData || []).map(mapMetricFromDB);
      setMetrics(mappedMetrics);

      // Calculate compliance summary
      const summary = {
        compliant: mappedMetrics.filter(m => m.complianceStatus === "compliant").length,
        atRisk: mappedMetrics.filter(m => m.complianceStatus === "at_risk").length,
        nonCompliant: mappedMetrics.filter(m => m.complianceStatus === "non_compliant").length,
        total: mappedMetrics.length
      };
      setComplianceSummary(summary);

      // Load recent emissions
      const { data: emissionsData, error: emissionsError } = await supabase
        .from("emissions_log")
        .select("*")
        .order("measurement_date", { ascending: false })
        .limit(5);

      if (emissionsError) throw emissionsError;

      setEmissions((emissionsData || []).map(mapEmissionFromDB));

      logger.info("[ESG Widget] Data loaded successfully");
    } catch (error) {
      logger.error("[ESG Widget] Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCIIBadgeColor = (rating?: CIIRating) => {
    if (!rating) return "secondary";
    switch (rating) {
      case "A": return "default";
      case "B": return "secondary";
      case "C": return "outline";
      case "D": return "destructive";
      case "E": return "destructive";
      default: return "secondary";
    }
  };

  const totalEmissions = emissions.reduce((sum, e) => sum + e.amount, 0);
  const avgCII = emissions.filter(e => e.ciiRating).length > 0
    ? emissions.filter(e => e.ciiRating)[0].ciiRating
    : undefined;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" />
            <div>
              <CardTitle>ESG & EEXI Compliance</CardTitle>
              <CardDescription>Environmental performance tracking</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={loadESGData}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading ESG data...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Compliance Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 dark:bg-green-950 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {complianceSummary.compliant}
                </div>
                <div className="text-xs text-green-600 dark:text-green-500">
                  Compliant
                </div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                  {complianceSummary.atRisk}
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-500">
                  At Risk
                </div>
              </div>
            </div>

            {/* Emissions Summary */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Total Emissions</span>
                <span className="text-lg font-bold">
                  {totalEmissions.toFixed(1)} <span className="text-xs">tonnes</span>
                </span>
              </div>
              
              {avgCII && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CII Rating</span>
                  <Badge variant={getCIIBadgeColor(avgCII)}>
                    {avgCII}
                  </Badge>
                </div>
              )}
            </div>

            {/* Alerts */}
            {complianceSummary.nonCompliant > 0 && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      {complianceSummary.nonCompliant} Non-Compliant Metric{complianceSummary.nonCompliant !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                      Immediate action required
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-green-600" />
                <span className="text-muted-foreground">Improving</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-600" />
                <span className="text-muted-foreground">EEXI Tracked</span>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = "/esg-dashboard"}>
              View Full Dashboard
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper functions to map database records
function mapMetricFromDB(data: any): ESGMetric {
  return {
    id: data.id,
    vesselId: data.vessel_id,
    metricType: data.metric_type,
    value: data.value,
    unit: data.unit,
    measurementDate: new Date(data.measurement_date),
    reportingPeriod: data.reporting_period,
    targetValue: data.target_value,
    baselineValue: data.baseline_value,
    complianceStatus: data.compliance_status,
    notes: data.notes,
    metadata: data.metadata,
    createdAt: new Date(data.created_at),
    updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    createdBy: data.created_by
  };
}

function mapEmissionFromDB(data: any): EmissionLog {
  return {
    id: data.id,
    vesselId: data.vessel_id,
    emissionType: data.emission_type,
    amount: data.amount,
    unit: data.unit,
    measurementDate: new Date(data.measurement_date),
    voyageId: data.voyage_id,
    distanceTraveled: data.distance_traveled,
    fuelConsumed: data.fuel_consumed,
    fuelType: data.fuel_type,
    eexiValue: data.eexi_value,
    ciiRating: data.cii_rating,
    calculationMethod: data.calculation_method,
    verified: data.verified,
    verifierId: data.verifier_id,
    verificationDate: data.verification_date ? new Date(data.verification_date) : undefined,
    notes: data.notes,
    metadata: data.metadata,
    createdAt: new Date(data.created_at),
    updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
  };
}
