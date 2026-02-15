import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Loader2 } from "lucide-react";

interface TitleScore {
  key: string;
  title: string;
  regulations: string[];
  score: number;
  items: { name: string; status: "ok" | "warning" | "critical"; detail: string }[];
}

const DEFAULT_TITLES: TitleScore[] = [
  { key: "title1", title: "Título 1 — Requisitos Mínimos para Trabalho a Bordo", regulations: ["Reg. 1.1", "Reg. 1.2", "Reg. 1.3", "Reg. 1.4"], score: 0, items: [] },
  { key: "title2", title: "Título 2 — Condições de Emprego", regulations: ["Reg. 2.1", "Reg. 2.2", "Reg. 2.3", "Reg. 2.5", "Reg. 2.7"], score: 0, items: [] },
  { key: "title3", title: "Título 3 — Alojamento, Instalações Recreativas, Alimentação", regulations: ["Reg. 3.1", "Reg. 3.2"], score: 0, items: [] },
  { key: "title4", title: "Título 4 — Proteção da Saúde, Cuidados Médicos, Bem-Estar", regulations: ["Reg. 4.1", "Reg. 4.2", "Reg. 4.3", "Reg. 4.4"], score: 0, items: [] },
  { key: "title5", title: "Título 5 — Conformidade e Execução", regulations: ["Reg. 5.1.1", "Reg. 5.1.3", "Reg. 5.1.5", "Reg. 5.2"], score: 0, items: [] },
];

export function MLCComplianceByTitle() {
  const [expandedTitle, setExpandedTitle] = useState<string | null>(null);

  const { data: mlcData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["mlc-compliance-score"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("calculate-mlc-score", { body: {} });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const titles: TitleScore[] = mlcData ? [
    { ...DEFAULT_TITLES[0], score: mlcData.title1_min_requirements || 0, items: [
      { name: "Certificados médicos válidos", status: (mlcData.title1_min_requirements || 0) >= 90 ? "ok" : "warning", detail: `Score: ${mlcData.title1_min_requirements || 0}%` },
    ]},
    { ...DEFAULT_TITLES[1], score: mlcData.title2_conditions_employment || 0, items: [
      { name: "Contratos e salários", status: (mlcData.title2_conditions_employment || 0) >= 90 ? "ok" : (mlcData.title2_conditions_employment || 0) >= 70 ? "warning" : "critical", detail: `Score: ${mlcData.title2_conditions_employment || 0}%` },
    ]},
    { ...DEFAULT_TITLES[2], score: mlcData.title3_accommodation || 0, items: [
      { name: "Alojamento e alimentação", status: (mlcData.title3_accommodation || 0) >= 80 ? "ok" : "warning", detail: `Score: ${mlcData.title3_accommodation || 0}%` },
    ]},
    { ...DEFAULT_TITLES[3], score: mlcData.title4_health_safety || 0, items: [
      { name: "Saúde e segurança", status: (mlcData.title4_health_safety || 0) >= 80 ? "ok" : "warning", detail: `Score: ${mlcData.title4_health_safety || 0}%` },
    ]},
    { ...DEFAULT_TITLES[4], score: mlcData.title5_compliance || 0, items: [
      { name: "DCM e certificados MLC", status: (mlcData.title5_compliance || 0) >= 80 ? "ok" : "critical", detail: mlcData.dcmExpiryDate ? `DCM válida até ${new Date(mlcData.dcmExpiryDate).toLocaleDateString("pt-BR")}` : "DCM não encontrada" },
    ]},
  ] : DEFAULT_TITLES;

  const overallScore = mlcData?.overall || Math.round(titles.reduce((acc, t) => acc + t.score, 0) / titles.length);
  const criticalCount = titles.reduce((acc, t) => acc + t.items.filter(i => i.status === "critical").length, 0);
  const criticalNCs = mlcData?.criticalNonConformities || [];

  const scoreColor = (score: number) => score >= 90 ? "text-green-600" : score >= 70 ? "text-amber-600" : "text-red-600";
  const progressColor = (score: number) => score >= 90 ? "bg-green-500" : score >= 70 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Conformidade MLC 2006 — Score Geral</p>
              <p className="text-xs text-muted-foreground mt-1">Maritime Labour Convention 2006 — Tempo Real</p>
            </div>
            <div className="flex items-center gap-4">
              <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isRefetching} className="gap-1">
                {isRefetching ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />} Atualizar
              </Button>
              <div className="text-right">
                <p className={`text-5xl font-bold ${scoreColor(overallScore)}`}>
                  {isLoading ? "--" : overallScore}<span className="text-lg text-muted-foreground">/100</span>
                </p>
              </div>
            </div>
          </div>
          {mlcData?.totalCrew && (
            <p className="text-xs text-muted-foreground mt-2">
              {mlcData.totalCrew} tripulantes analisados • Calculado em {new Date(mlcData.calculatedAt).toLocaleString("pt-BR")}
            </p>
          )}
        </CardContent>
      </Card>

      {titles.map(title => {
        const isExpanded = expandedTitle === title.key;
        return (
          <Card key={title.key} className="cursor-pointer transition-all" onClick={() => setExpandedTitle(isExpanded ? null : title.key)}>
            <CardContent className="pt-4 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{title.title}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {title.regulations.map(r => <Badge key={r} variant="outline" className="text-xs">{r}</Badge>)}
                  </div>
                </div>
                <p className={`text-2xl font-bold ml-4 ${scoreColor(title.score)}`}>{title.score}%</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${progressColor(title.score)}`} style={{ width: `${title.score}%` }} />
                </div>
              </div>

              {isExpanded && title.items.length > 0 && (
                <div className="space-y-2 pt-2 border-t" onClick={e => e.stopPropagation()}>
                  {title.items.map((item, i) => (
                    <div key={i} className={`flex items-start gap-2 p-2 rounded text-sm ${item.status === "critical" ? "bg-destructive/10" : item.status === "warning" ? "bg-warning/10" : "bg-green-500/5"}`}>
                      {item.status === "ok" && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />}
                      {item.status === "warning" && <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />}
                      {item.status === "critical" && <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />}
                      <div>
                        <p className="font-medium text-xs">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {criticalNCs.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> Não Conformidades Críticas — Risco de Detenção PSC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {criticalNCs.map((nc: string, i: number) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-destructive mt-0.5">●</span> {nc}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
