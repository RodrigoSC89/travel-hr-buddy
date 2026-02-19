/**
 * Noon Report AI Validation Tab
 * AI-driven validation of noon report data: consumption anomalies, speed/slip checks, weather cross-ref
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Brain, AlertTriangle, CheckCircle2, TrendingUp,
  Fuel, Wind, Gauge, Anchor, BarChart3, Zap,
  RefreshCw, Download, Clock, Ship
} from "lucide-react";

interface ValidationResult {
  id: string;
  reportDate: string;
  vesselName: string;
  status: "valid" | "warning" | "critical";
  overallScore: number;
  checks: ValidationCheck[];
}

interface ValidationCheck {
  name: string;
  category: "consumption" | "speed" | "weather" | "distance" | "compliance";
  status: "pass" | "warning" | "fail";
  value: string;
  expected: string;
  deviation: number;
  aiComment: string;
}

// Mock validation results based on realistic noon report data
const MOCK_VALIDATIONS: ValidationResult[] = [
  {
    id: "nr-001",
    reportDate: new Date().toISOString().split("T")[0],
    vesselName: "MV Atlântico Sul",
    status: "warning",
    overallScore: 78,
    checks: [
      { name: "Consumo FO Main Engine", category: "consumption", status: "warning", value: "32.5 MT", expected: "28-30 MT", deviation: 8.3, aiComment: "Consumo 8.3% acima do esperado para speed/draft reportados. Verificar condições de hull fouling." },
      { name: "Consumo DO Aux Engines", category: "consumption", status: "pass", value: "4.2 MT", expected: "3.8-4.5 MT", deviation: 0, aiComment: "Dentro da faixa normal." },
      { name: "Velocidade vs RPM", category: "speed", status: "pass", value: "12.5 kn @ 85 RPM", expected: "12.2-12.8 kn", deviation: 0, aiComment: "Relação speed/RPM consistente com curva de performance." },
      { name: "Slip %", category: "speed", status: "warning", value: "8.2%", expected: "3-6%", deviation: 36.6, aiComment: "Slip elevado indica possível fouling ou corrente adversa. Cross-ref com dados de corrente marítima." },
      { name: "Distância vs Speed x Tempo", category: "distance", status: "pass", value: "298 NM", expected: "300 NM", deviation: 0.6, aiComment: "Distância consistente com velocidade e tempo reportados." },
      { name: "Beaufort vs Speed Loss", category: "weather", status: "pass", value: "BF 5, -0.8 kn", expected: "-0.5 a -1.2 kn", deviation: 0, aiComment: "Perda de velocidade compatível com estado do mar reportado." },
      { name: "ROB vs Consumo", category: "compliance", status: "pass", value: "ROB 850 MT", expected: "845-855 MT", deviation: 0, aiComment: "ROB consistente com consumo reportado e ROB anterior." },
    ],
  },
  {
    id: "nr-002",
    reportDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    vesselName: "MV Santos Express",
    status: "critical",
    overallScore: 52,
    checks: [
      { name: "Consumo FO Main Engine", category: "consumption", status: "fail", value: "45.2 MT", expected: "35-38 MT", deviation: 18.9, aiComment: "Consumo 18.9% acima do limite. Provável erro de medição ou vazamento não reportado." },
      { name: "Consumo DO Aux Engines", category: "consumption", status: "warning", value: "6.8 MT", expected: "4.5-5.5 MT", deviation: 23.6, aiComment: "Consumo DO elevado. Verificar se todos os geradores estavam necessários." },
      { name: "Velocidade vs RPM", category: "speed", status: "fail", value: "14.2 kn @ 75 RPM", expected: "11.5-12.5 kn", deviation: 13.6, aiComment: "Velocidade incompatível com RPM reportado. Verificar dados de GPS vs log." },
      { name: "Slip %", category: "speed", status: "pass", value: "4.5%", expected: "3-6%", deviation: 0, aiComment: "Dentro da faixa normal." },
      { name: "Distância vs Speed x Tempo", category: "distance", status: "warning", value: "340 NM", expected: "288 NM", deviation: 18.0, aiComment: "Distância 18% acima do esperado pela velocidade/tempo. Possível erro de posição." },
      { name: "Beaufort vs Speed Loss", category: "weather", status: "pass", value: "BF 3, -0.2 kn", expected: "0 a -0.3 kn", deviation: 0, aiComment: "Condições meteorológicas favoráveis, perda mínima." },
      { name: "ROB vs Consumo", category: "compliance", status: "fail", value: "ROB 620 MT", expected: "680-700 MT", deviation: 11.4, aiComment: "Diferença significativa no ROB. 60-80 MT não contabilizados. Investigar." },
    ],
  },
  {
    id: "nr-003",
    reportDate: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
    vesselName: "MV Rio Grande",
    status: "valid",
    overallScore: 95,
    checks: [
      { name: "Consumo FO Main Engine", category: "consumption", status: "pass", value: "26.8 MT", expected: "25-28 MT", deviation: 0, aiComment: "Consumo dentro da faixa ideal." },
      { name: "Consumo DO Aux Engines", category: "consumption", status: "pass", value: "3.9 MT", expected: "3.5-4.2 MT", deviation: 0, aiComment: "Nominal." },
      { name: "Velocidade vs RPM", category: "speed", status: "pass", value: "11.8 kn @ 80 RPM", expected: "11.5-12.2 kn", deviation: 0, aiComment: "Consistente com curva de performance." },
      { name: "Slip %", category: "speed", status: "pass", value: "4.1%", expected: "3-6%", deviation: 0, aiComment: "Normal." },
      { name: "Distância vs Speed x Tempo", category: "distance", status: "pass", value: "283 NM", expected: "280-285 NM", deviation: 0, aiComment: "Exato." },
      { name: "Beaufort vs Speed Loss", category: "weather", status: "pass", value: "BF 4, -0.5 kn", expected: "-0.3 a -0.7 kn", deviation: 0, aiComment: "Compatível." },
      { name: "ROB vs Consumo", category: "compliance", status: "pass", value: "ROB 1,120 MT", expected: "1,115-1,125 MT", deviation: 0, aiComment: "ROB consistente." },
    ],
  },
];

export function NoonReportAIValidation() {
  const [validations] = useState<ValidationResult[]>(MOCK_VALIDATIONS);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const stats = useMemo(() => {
    const total = validations.length;
    const valid = validations.filter(v => v.status === "valid").length;
    const warnings = validations.filter(v => v.status === "warning").length;
    const critical = validations.filter(v => v.status === "critical").length;
    const avgScore = Math.round(validations.reduce((s, v) => s + v.overallScore, 0) / Math.max(total, 1));
    return { total, valid, warnings, critical, avgScore };
  }, [validations]);

  const handleRevalidate = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      toast.success("Validação IA concluída", { description: `${stats.total} reports analisados` });
    }, 2000);
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
          Validação automática: consumo, velocidade/RPM/slip, distância, weather cross-ref, ROB
        </p>
        <Button onClick={handleRevalidate} disabled={isValidating}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? "animate-spin" : ""}`} />
          {isValidating ? "Validando..." : "Revalidar Tudo"}
        </Button>
      </div>

      {/* Reports List */}
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
