import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Download, 
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  GraduationCap
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PerformanceMetrics {
  vesselName: string;
  compliancePercentage: number;
  auditScoreAvg: number;
  totalFailures: number;
  failuresBySystem: Record<string, number>;
  mttrHours: number;
  aiActionsCount: number;
  humanActionsCount: number;
  trainingsCompleted: number;
}

export default function PerformanceDashboard() {
  const [selectedVesselId, setSelectedVesselId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  // Fetch vessels
  const { data: vessels, isLoading: vesselsLoading } = useQuery({
    queryKey: ["vessels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, imo_number, vessel_type")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const loadMetrics = async () => {
    if (!selectedVesselId || !startDate || !endDate) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    setMetrics(null);

    try {
      // Call the database function
      const { data, error } = await supabase.rpc("calculate_vessel_performance_metrics", {
        p_vessel_id: selectedVesselId,
        p_start_date: startDate,
        p_end_date: endDate
      });

      if (error) throw error;

      // Get vessel name
      const vessel = vessels?.find(v => v.id === selectedVesselId);
      
      // Get failures by system (mock data for now)
      const { data: incidents } = await supabase
        .from("safety_incidents")
        .select("*")
        .eq("vessel_id", selectedVesselId)
        .gte("incident_date", startDate)
        .lte("incident_date", endDate);

      const failuresBySystem: Record<string, number> = {};
      incidents?.forEach(incident => {
        const system = incident.location || "Outros";
        failuresBySystem[system] = (failuresBySystem[system] || 0) + 1;
      });

      const result = data?.[0];
      setMetrics({
        vesselName: vessel?.name || "N/A",
        compliancePercentage: Number(result?.compliance_percentage || 0),
        auditScoreAvg: Number(result?.audit_score_avg || 0),
        totalFailures: Number(result?.total_failures || 0),
        failuresBySystem,
        mttrHours: Number(result?.mttr_hours || 0),
        aiActionsCount: Number(result?.ai_actions_count || 0),
        humanActionsCount: Number(result?.human_actions_count || 0),
        trainingsCompleted: Number(result?.trainings_completed || 0)
      });

      toast.success("Métricas carregadas com sucesso!");
    } catch (error) {
      console.error("Erro ao carregar métricas:", error);
      toast.error("Erro ao carregar métricas");
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = () => {
    if (!metrics) return;

    const csvContent = [
      ["Métrica", "Valor"],
      ["Embarcação", metrics.vesselName],
      ["Conformidade Normativa (%)", metrics.compliancePercentage.toFixed(2)],
      ["Score Médio de Auditorias", metrics.auditScoreAvg.toFixed(2)],
      ["Total de Falhas", metrics.totalFailures],
      ["MTTR (horas)", metrics.mttrHours.toFixed(2)],
      ["Ações com IA", metrics.aiActionsCount],
      ["Ações Humanas", metrics.humanActionsCount],
      ["Treinamentos Completados", metrics.trainingsCompleted],
      [""],
      ["Falhas por Sistema"],
      ...Object.entries(metrics.failuresBySystem).map(([system, count]) => [system, count])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `performance-${metrics.vesselName}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("CSV exportado com sucesso!");
  };

  const exportPDF = () => {
    if (!metrics) return;

    const pdf = new jsPDF();
    
    // Title
    pdf.setFontSize(18);
    pdf.text("Relatório de Performance Técnica", 14, 20);
    
    // Vessel info
    pdf.setFontSize(12);
    pdf.text(`Embarcação: ${metrics.vesselName}`, 14, 30);
    pdf.text(`Período: ${startDate} a ${endDate}`, 14, 37);
    
    // Metrics table
    autoTable(pdf, {
      startY: 45,
      head: [["Métrica", "Valor"]],
      body: [
        ["Conformidade Normativa (%)", `${metrics.compliancePercentage.toFixed(2)}%`],
        ["Score Médio de Auditorias", metrics.auditScoreAvg.toFixed(2)],
        ["Total de Falhas", metrics.totalFailures.toString()],
        ["MTTR (horas)", metrics.mttrHours.toFixed(2)],
        ["Ações com IA", metrics.aiActionsCount.toString()],
        ["Ações Humanas", metrics.humanActionsCount.toString()],
        ["Treinamentos Completados", metrics.trainingsCompleted.toString()],
      ],
    });
    
    // Failures by system
    if (Object.keys(metrics.failuresBySystem).length > 0) {
      autoTable(pdf, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        startY: (pdf as any).lastAutoTable.finalY + 10,
        head: [["Sistema", "Falhas"]],
        body: Object.entries(metrics.failuresBySystem).map(([system, count]) => [system, count.toString()]),
      });
    }
    
    pdf.save(`performance-${metrics.vesselName}-${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("PDF exportado com sucesso!");
  };

  // Prepare radar chart data
  const radarData = metrics ? [
    {
      metric: "Conformidade",
      value: metrics.compliancePercentage,
      fullMark: 100,
    },
    {
      metric: "Score Auditoria",
      value: metrics.auditScoreAvg,
      fullMark: 100,
    },
    {
      metric: "Eficiência IA",
      value: metrics.aiActionsCount + metrics.humanActionsCount > 0 
        ? (metrics.aiActionsCount / (metrics.aiActionsCount + metrics.humanActionsCount)) * 100 
        : 0,
      fullMark: 100,
    },
    {
      metric: "Treinamentos",
      value: metrics.totalFailures > 0 
        ? Math.min((metrics.trainingsCompleted / metrics.totalFailures) * 100, 100)
        : 100,
      fullMark: 100,
    },
    {
      metric: "Tempo Resposta",
      value: metrics.mttrHours > 0 ? Math.max(100 - (metrics.mttrHours * 2), 0) : 100,
      fullMark: 100,
    },
  ] : [];

  // Prepare bar chart data for failures by system
  const barData = metrics ? Object.entries(metrics.failuresBySystem).map(([system, count]) => ({
    system,
    count
  })) : [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Painel de Performance Técnica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vessel">Embarcação</Label>
              <Select value={selectedVesselId} onValueChange={setSelectedVesselId}>
                <SelectTrigger id="vessel">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {vesselsLoading ? (
                    <SelectItem value="loading" disabled>Carregando...</SelectItem>
                  ) : (
                    vessels?.map((vessel) => (
                      <SelectItem key={vessel.id} value={vessel.id}>
                        {vessel.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Data Início</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Button
              onClick={loadMetrics}
              disabled={isLoading || !selectedVesselId || !startDate || !endDate}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Carregar Métricas
                </>
              )}
            </Button>
            {metrics && (
              <>
                <Button onClick={exportCSV} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
                <Button onClick={exportPDF} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      {metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Conformidade</p>
                    <p className="text-2xl font-bold">{metrics.compliancePercentage.toFixed(1)}%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Falhas</p>
                    <p className="text-2xl font-bold">{metrics.totalFailures}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">MTTR</p>
                    <p className="text-2xl font-bold">{metrics.mttrHours.toFixed(1)}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Treinamentos</p>
                    <p className="text-2xl font-bold">{metrics.trainingsCompleted}</p>
                  </div>
                  <GraduationCap className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="#0ea5e9"
                      fill="#0ea5e9"
                      fillOpacity={0.6}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Falhas por Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="system" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* AI vs Human Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Ações IA vs Humanas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Ações com IA</span>
                    <span className="text-sm font-medium">{metrics.aiActionsCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          metrics.aiActionsCount + metrics.humanActionsCount > 0
                            ? (metrics.aiActionsCount / (metrics.aiActionsCount + metrics.humanActionsCount)) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Ações Humanas</span>
                    <span className="text-sm font-medium">{metrics.humanActionsCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${
                          metrics.aiActionsCount + metrics.humanActionsCount > 0
                            ? (metrics.humanActionsCount / (metrics.aiActionsCount + metrics.humanActionsCount)) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
