import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Download, TrendingUp } from "lucide-react";

interface TitleScore {
  key: string;
  title: string;
  regulations: string[];
  score: number;
  items: { name: string; status: "ok" | "warning" | "critical"; detail: string }[];
}

const MLC_TITLES: TitleScore[] = [
  {
    key: "title1", title: "Título 1 — Requisitos Mínimos para Trabalho a Bordo",
    regulations: ["Reg. 1.1 Idade Mínima", "Reg. 1.2 Certificado Médico", "Reg. 1.3 Qualificações", "Reg. 1.4 Recrutamento"],
    score: 92,
    items: [
      { name: "Idade mínima (16 anos)", status: "ok", detail: "Todos os marítimos acima de 18 anos" },
      { name: "Certificados médicos válidos", status: "warning", detail: "2 certificados vencem em 30 dias" },
      { name: "Certificados STCW", status: "ok", detail: "100% dos certificados válidos" },
      { name: "Agências recrutamento licenciadas", status: "ok", detail: "3 agências com licença válida" },
    ],
  },
  {
    key: "title2", title: "Título 2 — Condições de Emprego",
    regulations: ["Reg. 2.1 SEA", "Reg. 2.2 Salários", "Reg. 2.3 Horas Trabalho/Descanso", "Reg. 2.4 Férias", "Reg. 2.5 Repatriação", "Reg. 2.7 Manning"],
    score: 85,
    items: [
      { name: "Contratos SEA assinados", status: "ok", detail: "22/22 CEMs válidos a bordo" },
      { name: "Salário mínimo ITF ($673/mês)", status: "ok", detail: "Todos acima do mínimo" },
      { name: "Registros horas trabalho/descanso", status: "warning", detail: "3 violações de descanso mínimo no último mês" },
      { name: "Férias anuais (2.5 dias/mês)", status: "ok", detail: "Cálculos corretos para todos" },
      { name: "Seguro repatriação", status: "ok", detail: "P&I Club coverage ativo" },
      { name: "Certificado Safe Manning", status: "critical", detail: "Vencido há 15 dias — renovar urgente" },
    ],
  },
  {
    key: "title3", title: "Título 3 — Alojamento, Instalações Recreativas, Alimentação",
    regulations: ["Reg. 3.1 Alojamento", "Reg. 3.2 Alimentação e Catering"],
    score: 88,
    items: [
      { name: "Espaço mínimo por marítimo (3.6m²)", status: "ok", detail: "Todas as cabines em conformidade" },
      { name: "Ventilação e iluminação", status: "ok", detail: "Última inspeção: conforme" },
      { name: "Cozinheiro certificado", status: "ok", detail: "2 cozinheiros com certificado Ship Cook" },
      { name: "Qualidade alimentar", status: "warning", detail: "Inspeção de galley pendente (vence em 7 dias)" },
    ],
  },
  {
    key: "title4", title: "Título 4 — Proteção da Saúde, Cuidados Médicos, Bem-Estar, Segurança Social",
    regulations: ["Reg. 4.1 Medical Care", "Reg. 4.2 Shipowner Liability", "Reg. 4.3 H&S", "Reg. 4.4 Welfare"],
    score: 91,
    items: [
      { name: "Hospital de bordo equipado", status: "ok", detail: "Medicamentos e equipamentos atualizados" },
      { name: "Oficial médico designado", status: "ok", detail: "2nd Officer com STCW Medical First Aid" },
      { name: "Seguro de responsabilidade", status: "ok", detail: "P&I Club coverage para doença e lesão" },
      { name: "Comitê de segurança", status: "ok", detail: "Reuniões mensais documentadas" },
      { name: "Área de lazer", status: "ok", detail: "Sala de convivência, internet, ginásio" },
    ],
  },
  {
    key: "title5", title: "Título 5 — Conformidade e Execução",
    regulations: ["Reg. 5.1.1 Flag State", "Reg. 5.1.3 MLC Certificate/DMLC", "Reg. 5.1.5 Grievance", "Reg. 5.2 Port State"],
    score: 78,
    items: [
      { name: "MLC Certificate válido", status: "ok", detail: "Válido até 2027-03-15" },
      { name: "DMLC Parte I", status: "ok", detail: "Emitida pelo Flag State" },
      { name: "DMLC Parte II", status: "warning", detail: "Última revisão há 14 meses — atualizar" },
      { name: "Procedimento de queixas", status: "critical", detail: "Não traduzido para idioma de 4 marítimos filipinos" },
      { name: "Inspeção interna anual", status: "ok", detail: "Realizada em 2025-11-20" },
    ],
  },
];

export function MLCComplianceByTitle() {
  const [titles, setTitles] = useState(MLC_TITLES);
  const [expandedTitle, setExpandedTitle] = useState<string | null>(null);

  const overallScore = Math.round(titles.reduce((acc, t) => acc + t.score, 0) / titles.length);
  const criticalCount = titles.reduce((acc, t) => acc + t.items.filter(i => i.status === "critical").length, 0);
  const warningCount = titles.reduce((acc, t) => acc + t.items.filter(i => i.status === "warning").length, 0);

  const scoreColor = (score: number) => score >= 90 ? "text-green-600" : score >= 70 ? "text-amber-600" : "text-red-600";
  const progressColor = (score: number) => score >= 90 ? "bg-green-500" : score >= 70 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-4">
      {/* Overall Score Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Conformidade MLC 2006 — Score Geral</p>
              <p className="text-xs text-muted-foreground mt-1">Maritime Labour Convention 2006 — Tempo Real</p>
            </div>
            <div className="text-right">
              <p className={`text-5xl font-bold ${scoreColor(overallScore)}`}>
                {overallScore}<span className="text-lg text-muted-foreground">/100</span>
              </p>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" /> {criticalCount} Críticas
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="gap-1 border-warning text-warning">
                <AlertTriangle className="h-3 w-3" /> {warningCount} Atenção
              </Badge>
            )}
            {criticalCount === 0 && warningCount === 0 && (
              <Badge variant="secondary" className="gap-1 border-green-500 text-green-600">
                <CheckCircle className="h-3 w-3" /> Totalmente Conforme
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Titles */}
      {titles.map(title => {
        const isExpanded = expandedTitle === title.key;
        return (
          <Card key={title.key} className={`cursor-pointer transition-all ${title.items.some(i => i.status === "critical") ? "border-destructive/30" : ""}`}
            onClick={() => setExpandedTitle(isExpanded ? null : title.key)}>
            <CardContent className="pt-4 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{title.title}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {title.regulations.map(r => (
                      <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className={`text-2xl font-bold ${scoreColor(title.score)}`}>{title.score}%</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${progressColor(title.score)}`}
                    style={{ width: `${title.score}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-8">{title.score}%</span>
              </div>

              {isExpanded && (
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

      {/* Critical NCs */}
      {criticalCount > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> Não Conformidades Críticas — Risco de Detenção PSC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {titles.flatMap(t => t.items.filter(i => i.status === "critical").map(i => (
                <li key={i.name} className="text-sm flex items-start gap-2">
                  <span className="text-destructive mt-0.5">●</span>
                  <div>
                    <span className="font-medium">{i.name}</span>
                    <span className="text-muted-foreground"> — {i.detail}</span>
                  </div>
                </li>
              )))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
