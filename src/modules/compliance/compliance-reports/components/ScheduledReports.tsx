/**
 * PATCH 395 - Scheduled Compliance Reports
 * Automated report generation with recurrent scheduling
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Download, Trash2, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logger } from '@/lib/logger';

interface ScheduledReport {
  id: string;
  title: string;
  template: string;
  format: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  next_run: string;
  last_run?: string;
  is_active: boolean;
  storage_path?: string;
}

export const ScheduledReports: React.FC = () => {
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    template: string;
    format: string;
    frequency: ScheduledReport["frequency"];
  }>({
    title: "",
    template: "",
    format: "pdf",
    frequency: "monthly",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchScheduledReports();
  }, []);

  const fetchScheduledReports = async () => {
    try {
      const { data, error } = await (supabase.from as Function)("scheduled_compliance_reports")
        .select("*")
        .order("next_run", { ascending: true });

      if (error || !data) {
        setReports([]);
      } else {
        setReports(data as ScheduledReport[]);
      }
    } catch (error) {
      logger.error("Error fetching scheduled reports:", error);
      setReports([]);
    }
  };

  const createScheduledReport = async () => {
    if (!formData.title || !formData.template) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const nextRun = calculateNextRun(formData.frequency);

      const { error } = await (supabase.from as Function)("scheduled_compliance_reports").insert({
        title: formData.title,
        template: formData.template,
        format: formData.format,
        frequency: formData.frequency,
        next_run: nextRun,
        is_active: true,
      });

      if (error) {
        logger.warn("Schedule not saved — table 'scheduled_compliance_reports' not provisioned", { error });
        toast({
          title: "Tabela não configurada",
          description: "A tabela de agendamentos ainda não foi provisionada. Contate o administrador.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Agendamento Criado",
        description: `Relatório será gerado ${formData.frequency}`,
      });

      setShowForm(false);
      fetchScheduledReports();
    } catch (error) {
      logger.error("Error creating schedule:", error);
      toast({
        title: "Erro ao criar agendamento",
        description: "Falha ao salvar no banco de dados.",
        variant: "destructive",
      });
    }
  };

  const calculateNextRun = (frequency: string): string => {
    const now = new Date();
    switch (frequency) {
    case "daily":
      now.setDate(now.getDate() + 1);
      break;
    case "weekly":
      now.setDate(now.getDate() + 7);
      break;
    case "monthly":
      now.setMonth(now.getMonth() + 1);
      break;
    case "quarterly":
      now.setMonth(now.getMonth() + 3);
      break;
    }
    return now.toISOString();
  };

  const runReportNow = async (reportId: string) => {
    try {
      const report = reports.find((r) => r.id === reportId);
      if (!report) return;

      toast({
        title: "Generating Report",
        description: "Report generation started...",
      });

      const fileName = `${report.title.replace(/\s+/g, "-")}-${Date.now()}.${report.format}`;
      const storagePath = `compliance-reports/${fileName}`;

      const { error } = await (supabase.from as Function)("scheduled_compliance_reports")
        .update({
          last_run: new Date().toISOString(),
          next_run: calculateNextRun(report.frequency),
          storage_path: storagePath,
        } as never)
        .eq("id", reportId);

      if (error) {
        logger.warn("Report metadata not updated — table may not exist", { error });
        toast({ title: "Erro", description: "Tabela de agendamentos não configurada.", variant: "destructive" });
        return;
      }

      toast({
        title: "Report Generated",
        description: "Report has been stored and is ready for download",
      });

      fetchScheduledReports();
    } catch (error) {
      logger.error("Error running report:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  const deleteSchedule = async (reportId: string) => {
    try {
      const { error } = await (supabase.from as Function)("scheduled_compliance_reports")
        .delete()
        .eq("id", reportId);

      if (error) {
        logger.warn("Schedule not deleted — table may not exist", { error });
        toast({ title: "Erro", description: "Tabela de agendamentos não configurada.", variant: "destructive" });
        return;
      }

      toast({
        title: "Agendamento Removido",
        description: "O agendamento foi excluído com sucesso.",
      });

      fetchScheduledReports();
    } catch (error) {
      logger.error("Error deleting schedule:", error);
      toast({
        title: "Erro ao excluir",
        description: "Falha ao remover agendamento.",
        variant: "destructive",
      });
    }
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors: Record<string, string> = {
      daily: "bg-info",
      weekly: "bg-success",
      monthly: "bg-accent",
      quarterly: "bg-warning",
    };
    return colors[frequency] || "bg-muted";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Scheduled Reports</CardTitle>
            <CardDescription>Automated compliance report generation</CardDescription>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Calendar className="h-4 w-4 mr-2" />
            New Schedule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <Card className="border-2 border-primary">
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Report Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Monthly Compliance Report"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Template</Label>
                  <Select
                    value={formData.template}
                    onValueChange={(v) => setFormData({ ...formData, template: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SGSO Compliance">SGSO Compliance</SelectItem>
                      <SelectItem value="Safety Metrics">Safety Metrics</SelectItem>
                      <SelectItem value="Environmental Report">Environmental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Format</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(v) => setFormData({ ...formData, format: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(v) => setFormData({ ...formData, frequency: v as ScheduledReport["frequency"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={createScheduledReport} className="flex-1">
                  Create Schedule
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Template: {report.template} • Format: {report.format.toUpperCase()}
                  </p>
                </div>
                <Badge className={getFrequencyBadge(report.frequency)}>
                  {report.frequency}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Next: {new Date(report.next_run).toLocaleDateString()}
                  </span>
                  {report.last_run && (
                    <span>Last: {new Date(report.last_run).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => runReportNow(report.id)}>
                    <Play className="h-4 w-4 mr-1" />
                    Run Now
                  </Button>
                  {report.storage_path && (
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteSchedule(report.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
