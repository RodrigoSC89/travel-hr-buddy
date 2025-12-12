/**
 * Safety Guardian Dashboard - Refactored
 * Dashboard principal com todas as funcionalidades integradas
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Settings, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { LTICounterBanner } from "./LTICounterBanner";
import { SafetyKPICards } from "./SafetyKPICards";
import { AIAlertsPanel } from "./AIAlertsPanel";
import { IncidentsList } from "./IncidentsList";
import { IncidentReportDialog } from "./IncidentReportDialog";
import { IncidentDetailsDialog } from "./IncidentDetailsDialog";
import { useSafetyData } from "../hooks/useSafetyData";
import { useSafetyAI } from "../hooks/useSafetyAI";
import type { SafetyIncident } from "../types";

export const SafetyDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("ytd");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<SafetyIncident | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const {
    loading,
    metrics,
    incidents,
    alerts,
    filters,
    setFilters,
    createIncident,
    markAlertAsRead,
    markAllAlertsAsRead,
    getFilteredIncidents,
    unreadAlertsCount,
    refresh,
  } = useSafetyData();

  const { analyzeIncident, analysisState, generatePredictiveInsights } = useSafetyAI();

  useEffect(() => {
    generatePredictiveInsights();
  }, []);

  const handleSubmitReport = async (incident: Partial<SafetyIncident>) => {
    await createIncident(incident);
  };

  const handleViewDetails = (incident: SafetyIncident) => {
    setSelectedIncident(incident);
    setDetailsDialogOpen(true);
  };

  const handleAnalyzeIncident = async (incident: SafetyIncident) => {
    setSelectedIncident(incident);
    setDetailsDialogOpen(true);
    return analyzeIncident(incident);
  };

  const filteredIncidents = getFilteredIncidents();

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mtd">Este Mês</SelectItem>
            <SelectItem value="qtd">Este Trimestre</SelectItem>
            <SelectItem value="ytd">Este Ano</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            className="bg-destructive hover:bg-destructive/90"
            onClick={() => setReportDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Reportar Ocorrência
          </Button>
        </div>
      </div>

      {/* LTI Banner */}
      <LTICounterBanner daysWithoutLTI={metrics.daysWithoutLTI} goal={365} />

      {/* KPI Cards */}
      <SafetyKPICards metrics={metrics} loading={loading} />

      {/* AI Alerts */}
      <AIAlertsPanel
        alerts={alerts}
        onMarkAsRead={markAlertAsRead}
        onMarkAllAsRead={markAllAlertsAsRead}
        unreadCount={unreadAlertsCount}
      />

      {/* Incidents List */}
      <IncidentsList
        incidents={filteredIncidents}
        filters={filters}
        onFilterChange={setFilters}
        onViewDetails={handleViewDetails}
        onAnalyze={handleAnalyzeIncident}
        loading={loading}
      />

      {/* Dialogs */}
      <IncidentReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        onSubmit={handleSubmitReport}
      />

      <IncidentDetailsDialog
        incident={selectedIncident}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onAnalyze={handleAnalyzeIncident}
        analysisLoading={analysisState.loading}
      />
    </div>
  );
};
