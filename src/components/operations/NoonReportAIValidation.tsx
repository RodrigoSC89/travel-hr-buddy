/**
 * Noon Report AI Validation Tab — Connected to Supabase noon_reports + vessels
 * AI-driven validation of noon report data: consumption anomalies, speed/slip checks, weather cross-ref
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Brain, AlertTriangle, CheckCircle2, TrendingUp,
  Fuel, Wind, Gauge, Ship, BarChart3,
  RefreshCw, Clock, Loader2
} from "lucide-react";

interface ValidationCheck {
  name: string;
  category: "consumption" | "speed" | "weather" | "distance" | "compliance";
  status: "pass" | "warning" | "fail";
  value: string;
  expected: string;
  deviation: number;
  aiComment: string;
}

interface ValidationResult {
  id: string;
  reportDate: string;
  vesselName: string;
  status: "valid" | "warning" | "critical";
  overallScore: number;
  checks: ValidationCheck[];
}

function validateReport(report: any, vesselName: string): ValidationResult {
  const checks: ValidationCheck[] = [];
  let score = 100;

  // Consumption FO validation
  const consumptionHfo = Number(report.consumption_hfo) || 0;
  const expectedHfoMin = 25;
  const expectedHfoMax = 38;
  const hfoDeviation = consumptionHfo > expectedHfoMax ? ((consumptionHfo - expectedHfoMax) / expectedHfoMax) * 100 :
                        consumptionHfo < expectedHfoMin && consumptionHfo > 0 ? ((expectedHfoMin - consumptionHfo) / expectedHfoMin) * 100 : 0;
  const hfoStatus = hfoDeviation > 15 ? "fail" : hfoDeviation > 5 ? "warning" : "pass";
  if (hfoStatus !== "pass") score -= hfoDeviation > 15 ? 20 : 8;
  checks.push({
    name: "Consumo FO Main Engine", category: "consumption", status: hfoStatus,
    value: consumptionHfo > 0 ? `${consumptionHfo.toFixed(1)} MT` : "N/R",
    expected: `${expectedHfoMin}-${expectedHfoMax} MT`,
    deviation: Math.round(hfoDeviation * 10) / 10,
    aiComment: hfoStatus === "fail" ? "Consumo fora da faixa esperada. Verificar condições de hull fouling ou vazamento." :
               hfoStatus === "warning" ? "Consumo ligeiramente fora da faixa. Monitorar." : "Dentro da faixa normal."
  });

  // Speed vs RPM
  const speedAvg = Number(report.speed_avg) || 0;
  const rpm = Number(report.me_rpm) || 0;
  const expectedSpeed = rpm > 0 ? rpm * 0.15 : 12;
  const speedDev = speedAvg > 0 && rpm > 0 ? Math.abs(((speedAvg - expectedSpeed) / expectedSpeed) * 100) : 0;
  const speedStatus = speedDev > 15 ? "fail" : speedDev > 8 ? "warning" : "pass";
  if (speedStatus !== "pass") score -= speedDev > 15 ? 15 : 6;
  checks.push({
    name: "Velocidade vs RPM", category: "speed", status: speedStatus,
    value: speedAvg > 0 ? `${speedAvg.toFixed(1)} kn @ ${rpm} RPM` : "N/R",
    expected: `${(expectedSpeed * 0.9).toFixed(1)}-${(expectedSpeed * 1.1).toFixed(1)} kn`,
    deviation: Math.round(speedDev * 10) / 10,
    aiComment: speedStatus === "fail" ? "Velocidade incompatível com RPM. Verificar dados GPS vs log." :
               speedStatus === "warning" ? "Variação moderada na relação speed/RPM." : "Consistente com curva de performance."
  });

  // Distance validation
  const distance = Number(report.distance_run) || 0;
  const expectedDist = speedAvg * 24;
  const distDev = distance > 0 && expectedDist > 0 ? Math.abs(((distance - expectedDist) / expectedDist) * 100) : 0;
  const distStatus = distDev > 15 ? "fail" : distDev > 8 ? "warning" : "pass";
  if (distStatus !== "pass") score -= distDev > 15 ? 12 : 5;
  checks.push({
    name: "Distância vs Speed x Tempo", category: "distance", status: distStatus,
    value: distance > 0 ? `${distance.toFixed(0)} NM` : "N/R",
    expected: expectedDist > 0 ? `${(expectedDist * 0.9).toFixed(0)}-${(expectedDist * 1.1).toFixed(0)} NM` : "N/A",
    deviation: Math.round(distDev * 10) / 10,
    aiComment: distStatus === "pass" ? "Distância consistente." : "Discrepância na distância reportada."
  });

  // Weather cross-ref
  const windForce = report.wind_force || 0;
  const seaState = report.sea_state || 0;
  const weatherConsistent = Math.abs(windForce - seaState) <= 2;
  checks.push({
    name: "Beaufort vs Sea State", category: "weather", status: weatherConsistent ? "pass" : "warning",
    value: `BF ${windForce}, Sea ${seaState}`,
    expected: "Correlação ≤2 escalas",
    deviation: weatherConsistent ? 0 : Math.abs(windForce - seaState) * 10,
    aiComment: weatherConsistent ? "Condições meteorológicas consistentes." : "Discrepância entre vento e estado do mar."
  });
  if (!weatherConsistent) score -= 5;

  // ROB compliance
  const robHfo = Number(report.rob_hfo) || 0;
  const robMdo = Number(report.rob_mdo) || 0;
  checks.push({
    name: "ROB Report", category: "compliance", status: robHfo > 0 || robMdo > 0 ? "pass" : "warning",
    value: robHfo > 0 ? `HFO: ${robHfo.toFixed(0)} MT, MDO: ${robMdo.toFixed(0)} MT` : "Não reportado",
    expected: "ROB reportado",
    deviation: 0,
    aiComment: robHfo > 0 ? "ROB reportado." : "ROB não informado no relatório."
  });
  if (robHfo === 0 && robMdo === 0) score -= 5;

  score = Math.max(0, Math.min(100, Math.round(score)));
  const failCount = checks.filter(c => c.status === "fail").length;
  const warnCount = checks.filter(c => c.status === "warning").length;

  return {
    id: report.id,
    reportDate: report.report_date || new Date(report.created_at).toISOString().split("T")[0],
    vesselName,
    status: failCount > 0 ? "critical" : warnCount > 1 ? "warning" : "valid",
    overallScore: score,
    checks,
  };
}

export function NoonReportAIValidation() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const { data: validations = [], isLoading, refetch } = useQuery({
    queryKey: ["noon-report-validations"],
    queryFn: async () => {
      const [{ data: reports }, { data: vessels }] = await Promise.all([
        supabase.from("noon_reports").select("*").order("report_date", { ascending: false }).limit(20),
        supabase.from("vessels").select("id, name"),
      ]);
      const vesselMap = new Map((vessels || []).map(v => [v.id, v.name]));
      return (reports || []).map(r => validateReport(r, vesselMap.get(r.vessel_id!) || "Vessel"));
    },
    staleTime: 30000,
  });

  const stats = useMemo(() => {
    const total = validations.length;
    const valid = validations.filter(v => v.status === "valid").length;
    const warnings = validations.filter(v => v.status === "warning").length;
    const critical = validations.filter(v => v.status === "critical").length;
    const avgScore = total > 0 ? Math.round(validations.reduce((s, v) => s + v.overallScore, 0) / total) : 0;
    return { total, valid, warnings, critical, avgScore };
  }, [validations]);

  const [isValidating, setIsValidating] = useState(false);
  const handleRevalidate = async () => {
    setIsValidating(true);
    await refetch();
    setIsValidating(false);
    toast.success("Validação IA concluída", { description: `${stats.total} reports analisados` });
  };

  const getStatusColor = (status: string) => {
    if (status === "valid" || status === "pass") return "text-success";
    if (status === "warning") return "text-warning";
    return "text-destructive";
  };

  const getStatusBg = (status: string) => {
    if (status === "valid" || status === "pass") return "bg-success/20 text-success";
    if (status === "warning") return "bg-warning/20 text-warning";
    return "bg-destructive/20 text-destructive";
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "consumption": return Fuel;
      case "speed": return Gauge;
      case "weather": return Wind;
      case "distance": return Ship;
      case "compliance": return CheckCircle2;
      default: return BarChart3;
    }
  };

  const selectedValidation = validations.find(v => v.id === selectedReport);

  if (isLoading) {
    return (
      <Card><CardContent className="py-12 text-center">
        <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando noon reports...</p>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Score Médio IA", value: `${stats.avgScore}%`, icon: Brain, color: stats.avgScore >= 80 ? "text-success" : "text-warning" },
          { label: "Válidos", value: stats.valid, icon: CheckCircle2, color: "text-success" },
          { label: "Alertas", value: stats.warnings, icon: AlertTriangle, color: "text-warning" },
          { label: "Críticos", value: stats.critical, icon: AlertTriangle, color: "text-destructive" },
          { label: "Analisados", value: stats.total, icon: BarChart3, color: "text-primary" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-3 flex items-center gap-3">
              <Icon className={`h-5 w-5 ${color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          <Brain className="h-4 w-4 inline mr-1" />
          Validação automática: consumo, velocidade/RPM, distância, weather cross-ref, ROB
        </p>
        <Button onClick={handleRevalidate} disabled={isValidating}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? "animate-spin" : ""}`} />
          {isValidating ? "Validando..." : "Revalidar Tudo"}
        </Button>
      </div>

      {/* Reports List */}
      {validations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {validations.map(v => (
            <Card
              key={v.id}
              className={`cursor-pointer transition-all hover:border-primary/40 ${selectedReport === v.id ? "border-primary ring-1 ring-primary/30" : ""}`}
              onClick={() => setSelectedReport(v.id === selectedReport ? null : v.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{v.vesselName}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />{v.reportDate}
                    </p>
                  </div>
                  <Badge className={getStatusBg(v.status)}>
                    {v.status === "valid" ? "OK" : v.status === "warning" ? "Alerta" : "Crítico"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={v.overallScore} className="h-2 flex-1" />
                  <span className={`text-sm font-bold ${getStatusColor(v.status)}`}>{v.overallScore}%</span>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {v.checks.filter(c => c.status !== "pass").map(c => (
                    <Badge key={c.name} variant="outline" className={`text-[9px] ${getStatusBg(c.status)}`}>
                      {c.category}
                    </Badge>
                  ))}
                  {v.checks.every(c => c.status === "pass") && (
                    <Badge variant="outline" className="text-[9px] bg-success/10 text-success">Todos OK</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Ship className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum noon report encontrado</p>
        </CardContent></Card>
      )}

      {/* Detail Panel */}
      {selectedValidation && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Detalhes da Validação IA — {selectedValidation.vesselName} ({selectedValidation.reportDate})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedValidation.checks.map(check => {
              const CatIcon = getCategoryIcon(check.category);
              return (
                <div key={check.name} className="flex items-start gap-4 p-3 rounded-lg border">
                  <div className={`p-2 rounded-lg ${getStatusBg(check.status)}`}>
                    <CatIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-medium text-sm">{check.name}</h5>
                      <Badge className={`text-[10px] ${getStatusBg(check.status)}`}>
                        {check.status === "pass" ? "OK" : check.status === "warning" ? "Alerta" : "Falha"}
                      </Badge>
                      {check.deviation > 0 && (
                        <Badge variant="outline" className="text-[10px]">
                          <TrendingUp className="h-3 w-3 mr-1" />{check.deviation.toFixed(1)}% desvio
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span>Reportado: <strong className="text-foreground">{check.value}</strong></span>
                      <span>Esperado: <strong className="text-foreground">{check.expected}</strong></span>
                    </div>
                    <p className="text-xs mt-1 text-muted-foreground italic">
                      <Brain className="h-3 w-3 inline mr-1" />{check.aiComment}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
