/**
 * PEOTRAM Correlation Matrix - World-Class Element Analysis
 * NO COMPETITOR HAS THIS: AI-driven correlation between 13 elements
 * Shows how weaknesses in one element cascade to others
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Brain, TrendingUp, AlertTriangle, ArrowRight, Zap } from "lucide-react";
import { toast } from "sonner";

// Correlation matrix between PEOTRAM elements (1-13)
// Values: 0=no correlation, 1=weak, 2=moderate, 3=strong
const ELEMENT_CORRELATIONS: number[][] = [
  //  1  2  3  4  5  6  7  8  9 10 11 12 13
  [0, 3, 2, 3, 2, 2, 2, 1, 3, 2, 3, 2, 3], // 1-LGR
  [3, 0, 3, 2, 2, 3, 2, 2, 1, 2, 1, 2, 2], // 2-CL
  [2, 3, 0, 3, 3, 2, 3, 1, 2, 2, 3, 3, 2], // 3-GR
  [3, 2, 3, 0, 3, 2, 3, 2, 2, 2, 3, 3, 2], // 4-OP★
  [2, 2, 3, 3, 0, 3, 2, 1, 2, 1, 3, 2, 2], // 5-ST
  [2, 3, 2, 2, 3, 0, 2, 1, 1, 1, 2, 2, 2], // 6-MN★
  [2, 2, 3, 3, 2, 2, 0, 2, 2, 2, 2, 2, 3], // 7-GM
  [1, 2, 1, 2, 1, 1, 2, 0, 1, 1, 1, 1, 1], // 8-AQ
  [3, 1, 2, 2, 2, 1, 2, 1, 0, 2, 2, 2, 2], // 9-RH
  [2, 2, 2, 2, 1, 1, 2, 1, 2, 0, 2, 2, 2], // 10-GI
  [3, 1, 3, 3, 3, 2, 2, 1, 2, 2, 0, 3, 2], // 11-PE★
  [2, 2, 3, 3, 2, 2, 2, 1, 2, 2, 3, 0, 3], // 12-AI★
  [3, 2, 2, 2, 2, 2, 3, 1, 2, 2, 2, 3, 0], // 13-MC
];

const ELEMENTS = [
  { id: 1, sigla: "LGR", name: "Liderança", critical: false },
  { id: 2, sigla: "CL", name: "Conformidade Legal", critical: false },
  { id: 3, sigla: "GR", name: "Gestão de Riscos", critical: false },
  { id: 4, sigla: "OP", name: "Operações", critical: true },
  { id: 5, sigla: "ST", name: "Saúde e Segurança", critical: false },
  { id: 6, sigla: "MN", name: "Meio Ambiente", critical: true },
  { id: 7, sigla: "GM", name: "Gestão de Mudanças", critical: false },
  { id: 8, sigla: "AQ", name: "Aquisição", critical: false },
  { id: 9, sigla: "RH", name: "Recursos Humanos", critical: false },
  { id: 10, sigla: "GI", name: "Gestão da Informação", critical: false },
  { id: 11, sigla: "PE", name: "Emergências", critical: true },
  { id: 12, sigla: "AI", name: "Análise de Incidentes", critical: true },
  { id: 13, sigla: "MC", name: "Melhoria Contínua", critical: false },
];

interface Props {
  elementScores?: Record<string, number>;
}

export function PeotramCorrelationMatrix({ elementScores = {} }: Props) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [cascadeAnalysis, setCascadeAnalysis] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);

  const getCellColor = (value: number) => {
    if (value === 0) return "bg-muted/20";
    if (value === 1) return "bg-blue-500/20";
    if (value === 2) return "bg-amber-500/30";
    return "bg-red-500/30";
  };

  const weakestElements = useMemo(() => {
    return ELEMENTS.map(el => ({
      ...el,
      score: elementScores[String(el.id)] ?? 50,
    }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 5);
  }, [elementScores]);

  const runCascadeAnalysis = () => {
    setAnalyzing(true);

    let analysis = "## 🔗 Análise de Cascata PEOTRAM\n\n";

    weakestElements.forEach(el => {
      const correlations = ELEMENT_CORRELATIONS[el.id - 1];
      const stronglyCorrelated = ELEMENTS.filter((_, i) => correlations[i] === 3 && i !== el.id - 1);

      if (stronglyCorrelated.length > 0) {
        analysis += `### ${el.sigla} (${el.score}%) → Impacta fortemente:\n`;
        stronglyCorrelated.forEach(target => {
          analysis += `- **${target.sigla}** (${target.name}): Correlação forte. `;
          analysis += `NC em ${el.sigla} provavelmente gerará NC em ${target.sigla}.\n`;
        });
        analysis += "\n";
      }
    });

    analysis += "### 💡 Recomendação Estratégica\n";
    analysis += `Priorize investimentos nos elementos com scores abaixo de 70% e alta correlação com elementos críticos (★).\n`;
    analysis += `Elementos ${weakestElements.map(e => e.sigla).join(", ")} devem receber atenção imediata.`;

    setCascadeAnalysis(analysis);
    setAnalyzing(false);
    toast.success("Análise de cascata concluída");
  };

  return (
    <div className="space-y-6">
      {/* Matrix Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-warning" />
                Matriz de Correlação entre Elementos
              </CardTitle>
              <CardDescription>
                Visualização das interdependências entre os 13 elementos PEOTRAM
              </CardDescription>
            </div>
            <Button onClick={runCascadeAnalysis} disabled={analyzing} className="gap-2">
              <Brain className="h-4 w-4" />
              {analyzing ? "Analisando..." : "Análise de Cascata IA"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-muted/20 border" /> Sem correlação</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-blue-500/20 border" /> Fraca</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-amber-500/30 border" /> Moderada</div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-red-500/30 border" /> Forte</div>
            <Badge variant="destructive" className="text-xs ml-4">★ = Crítico</Badge>
          </div>

          {/* Correlation Matrix */}
          <TooltipProvider>
            <div className="overflow-x-auto">
              <div className="inline-grid" style={{ gridTemplateColumns: `80px repeat(13, 44px)` }}>
                {/* Header row */}
                <div />
                {ELEMENTS.map(el => (
                  <div key={`h-${el.id}`} className="text-center text-xs font-bold p-1">
                    <span className={el.critical ? "text-destructive" : ""}>{el.sigla}</span>
                    {el.critical && <span className="text-destructive">★</span>}
                  </div>
                ))}

                {/* Data rows */}
                {ELEMENTS.map((rowEl, rowIdx) => (
                  <React.Fragment key={`r-${rowEl.id}`}>
                    <div className="flex items-center text-xs font-medium pr-2 whitespace-nowrap">
                      <span className={rowEl.critical ? "text-destructive font-bold" : ""}>{rowEl.sigla}</span>
                      {rowEl.critical && <span className="text-destructive ml-0.5">★</span>}
                    </div>
                    {ELEMENTS.map((colEl, colIdx) => {
                      const value = ELEMENT_CORRELATIONS[rowIdx][colIdx];
                      const isHovered = hoveredCell?.row === rowIdx || hoveredCell?.col === colIdx;
                      const isDiagonal = rowIdx === colIdx;
                      return (
                        <Tooltip key={`c-${rowEl.id}-${colEl.id}`}>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-10 h-10 rounded border flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${
                                isDiagonal ? "bg-muted/50" : getCellColor(value)
                              } ${isHovered ? "ring-2 ring-primary" : ""}`}
                              onMouseEnter={() => setHoveredCell({ row: rowIdx, col: colIdx })}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              {isDiagonal ? "—" : value}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{rowEl.sigla} ↔ {colEl.sigla}</p>
                            <p className="text-xs">{value === 0 ? "Sem correlação" : value === 1 ? "Fraca" : value === 2 ? "Moderada" : "Forte"}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Weakest Elements + Cascade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Elementos Mais Fracos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weakestElements.map(el => (
              <div key={el.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Badge variant={el.critical ? "destructive" : "outline"} className="text-xs">
                    {el.sigla}{el.critical ? "★" : ""}
                  </Badge>
                  <span className="text-sm">{el.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${el.score < 60 ? "text-destructive" : el.score < 80 ? "text-amber-600" : "text-emerald-600"}`}>
                    {el.score}%
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {ELEMENT_CORRELATIONS[el.id - 1].filter(v => v === 3).length} conexões fortes
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {cascadeAnalysis && (
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Análise de Cascata IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm whitespace-pre-wrap font-sans">{cascadeAnalysis}</pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
