import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Calendar,
  Download,
  Plus,
  Settings,
  Trash2,
  Play,
  Clock,
  Users,
  BarChart3,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AutomatedReport {
  id: string;
  name: string;
  description: string;
  report_type: string;
  schedule_cron: string;
  recipients: string[];
  filters: any;
  format: "pdf" | "excel" | "html";
  is_active: boolean;
  last_generated_at?: string;
  next_scheduled_at?: string;
  created_at: string;
}

const reportTypes = {
  weekly_summary: {
    name: "Resumo Semanal",
    description: "Resumo das principais atividades da semana",
    icon: Calendar,
    defaultSchedule: "0 8 * * MON",
  },
  monthly_analysis: {
    name: "Análise Mensal",
    description: "Relatório completo de performance mensal",
    icon: BarChart3,
    defaultSchedule: "0 9 1 * *",
  },
  compliance_check: {
    name: "Verificação de Compliance",
    description: "Status de conformidade e certificações",
    icon: CheckCircle,
    defaultSchedule: "0 10 * * *",
  },
  crew_report: {
    name: "Relatório de Tripulação",
    description: "Escalas, certificações e performance da tripulação",
    icon: Users,
    defaultSchedule: "0 7 * * FRI",
  },
  financial_summary: {
    name: "Resumo Financeiro",
    description: "Custos operacionais e indicadores financeiros",
    icon: BarChart3,
    defaultSchedule: "0 9 * * MON",
  },
  maintenance_report: {
    name: "Relatório de Manutenção",
    description: "Status de manutenções e programações",
    icon: Settings,
    defaultSchedule: "0 8 * * *",
  },
};

const cronPatterns = {
  daily: { label: "Diário (9:00)", cron: "0 9 * * *" },
  weekly_mon: { label: "Semanal (Segunda 8:00)", cron: "0 8 * * MON" },
  weekly_fri: { label: "Semanal (Sexta 17:00)", cron: "0 17 * * FRI" },
  monthly: { label: "Mensal (Dia 1 às 9:00)", cron: "0 9 1 * *" },
  custom: { label: "Personalizado", cron: "" },
};

export const AutomatedReportsManager: React.FC = () => {
  const [reports, setReports] = useState<AutomatedReport[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    report_type: "",
    schedule_cron: "0 9 * * *",
    recipients: [""],
    format: "pdf" as const,
    filters: {},
  });

  const loadReports = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("automated_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports((data as AutomatedReport[]) || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os relatórios automáticos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const createReport = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();

      const { error } = await supabase.from("automated_reports").insert({
        ...formData,
        recipients: formData.recipients.filter(email => email.trim() !== ""),
        created_by: user.user?.id,
        organization_id: user.user?.id, // Temporário para demo
      });

      if (error) throw error;

      setIsCreateDialogOpen(false);
      resetForm();
      await loadReports();

      toast({
        title: "Relatório criado!",
        description: "Relatório automático configurado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o relatório automático.",
        variant: "destructive",
      });
    }
  };

  const toggleReport = async (report: AutomatedReport) => {
    try {
      const { error } = await supabase
        .from("automated_reports")
        .update({ is_active: !report.is_active })
        .eq("id", report.id);

      if (error) throw error;

      setReports(prev =>
        prev.map(r => (r.id === report.id ? { ...r, is_active: !r.is_active } : r))
      );

      toast({
        title: report.is_active ? "Relatório pausado" : "Relatório ativado",
        description: `${report.name} foi ${report.is_active ? "pausado" : "ativado"}.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o relatório.",
        variant: "destructive",
      });
    }
  };

  const deleteReport = async (report: AutomatedReport) => {
    if (!confirm(`Tem certeza que deseja excluir "${report.name}"?`)) return;

    try {
      const { error } = await supabase.from("automated_reports").delete().eq("id", report.id);

      if (error) throw error;

      setReports(prev => prev.filter(r => r.id !== report.id));
      toast({
        title: "Relatório excluído",
        description: `${report.name} foi removido.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o relatório.",
        variant: "destructive",
      });
    }
  };

  const generateReportNow = async (report: AutomatedReport) => {
    try {
      // Simular geração de relatório
      toast({
        title: "Gerando relatório...",
        description: `${report.name} está sendo gerado. Você receberá por email em breve.`,
      });

      // Aqui você implementaria a lógica real de geração
      // Por exemplo, chamar uma edge function que gera o relatório
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      report_type: "",
      schedule_cron: "0 9 * * *",
      recipients: [""],
      format: "pdf",
      filters: {},
    });
  };

  const addRecipient = () => {
    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, ""],
    }));
  };

  const updateRecipient = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.map((email, i) => (i === index ? value : email)),
    }));
  };

  const removeRecipient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index),
    }));
  };

  const getReportTypeInfo = (type: string) => {
    return (
      reportTypes[type as keyof typeof reportTypes] || {
        name: type,
        description: "Relatório personalizado",
        icon: FileText,
        defaultSchedule: "0 9 * * *",
      }
    );
  };

  const getScheduleDescription = (cron: string) => {
    const found = Object.values(cronPatterns).find(p => p.cron === cron);
    return found ? found.label : `Personalizado: ${cron}`;
  };

  const getStatusBadge = (report: AutomatedReport) => {
    if (!report.is_active) {
      return <Badge variant="secondary">Pausado</Badge>;
    }
    return <Badge variant="default">Ativo</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relatórios Automáticos</h2>
          <p className="text-muted-foreground">
            Configure relatórios periódicos enviados automaticamente por email
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Relatório
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Relatório Automático</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-name">Nome do Relatório</Label>
                  <Input
                    id="report-name"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Relatório Semanal de Operações"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-type">Tipo de Relatório</Label>
                  <Select
                    value={formData.report_type}
                    onValueChange={value => {
                      const typeInfo = getReportTypeInfo(value);
                      setFormData(prev => ({
                        ...prev,
                        report_type: value,
                        schedule_cron: typeInfo.defaultSchedule,
                        name: prev.name || typeInfo.name,
                        description: prev.description || typeInfo.description,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(reportTypes).map(([key, type]) => (
                        <SelectItem key={key} value={key}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o conteúdo e objetivo deste relatório..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule">Frequência</Label>
                  <Select
                    value={
                      Object.entries(cronPatterns).find(
                        ([_, p]) => p.cron === formData.schedule_cron
                      )?.[0] || "custom"
                    }
                    onValueChange={value => {
                      if (value === "custom") return;
                      setFormData(prev => ({
                        ...prev,
                        schedule_cron: cronPatterns[value as keyof typeof cronPatterns].cron,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(cronPatterns).map(([key, pattern]) => (
                        <SelectItem key={key} value={key}>
                          {pattern.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Formato</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value: any) =>
                      setFormData(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Destinatários de Email</Label>
                  <Button variant="outline" size="sm" onClick={addRecipient}>
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </div>

                {formData.recipients.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={e => updateRecipient(index, e.target.value)}
                      placeholder="email@empresa.com"
                      className="flex-1"
                    />
                    {formData.recipients.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeRecipient(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={createReport}
                  disabled={
                    !formData.name ||
                    !formData.report_type ||
                    formData.recipients.filter(e => e.trim()).length === 0
                  }
                >
                  Criar Relatório
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Configurados</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum relatório automático</h3>
              <p className="text-muted-foreground">
                Configure relatórios para serem enviados automaticamente
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Relatório</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Destinatários</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Geração</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map(report => {
                  const typeInfo = getReportTypeInfo(report.report_type);
                  const Icon = typeInfo.icon;

                  return (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{report.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {report.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{typeInfo.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {getScheduleDescription(report.schedule_cron)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{report.format.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{report.recipients.length} destinatário(s)</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(report)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {report.last_generated_at
                            ? new Date(report.last_generated_at).toLocaleString("pt-BR")
                            : "Nunca"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateReportNow(report)}
                            title="Gerar agora"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleReport(report)}
                            title={report.is_active ? "Pausar" : "Ativar"}
                          >
                            {report.is_active ? (
                              <Clock className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteReport(report)}
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
