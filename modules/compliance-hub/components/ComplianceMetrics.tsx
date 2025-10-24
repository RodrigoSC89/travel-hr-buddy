/**
 * Compliance Metrics Component
 * PATCH 92.0 - Dashboard metrics display
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, CheckCircle, AlertTriangle, FileText, 
  CheckSquare, TrendingUp, Clock, AlertCircle 
} from "lucide-react";
import { ComplianceMetrics as MetricsType } from "../types";

interface ComplianceMetricsProps {
  metrics: MetricsType;
}

export const ComplianceMetrics: React.FC<ComplianceMetricsProps> = ({ metrics }) => {
  const getScoreColor = (score: number) => {
    if (score >= 95) return "text-green-600 dark:text-green-400";
    if (score >= 85) return "text-blue-600 dark:text-blue-400";
    if (score >= 75) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Overall Compliance Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getScoreColor(metrics.overall_score)}`}>
            {metrics.overall_score.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">Overall rating</p>
        </CardContent>
      </Card>

      {/* Audits Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Audits</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.audits_completed}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.audits_pending} pending
          </p>
        </CardContent>
      </Card>

      {/* Checklists Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Checklists</CardTitle>
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.checklists_active}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.checklists_completed} completed
          </p>
        </CardContent>
      </Card>

      {/* Active Risks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Risks</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.risks_active}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.risks_critical} critical
          </p>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Documents</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.documents_total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.documents_expiring_soon} expiring soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
