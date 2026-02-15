/**
 * PEO-DP Anexo N-1 — Avaliação de GAP de FMEA/CAMO/ASOG
 * 19 categories for FMEA, 19 for CAMO, 11 for ASOG
 * Evaluation: A (omitted/errors), B (incomplete), C (satisfactory), D (N/A)
 */
import React, { useState, useMemo } from "react";
import { quickExport } from "@/lib/export-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, AlertTriangle, Download, CheckCircle } from "lucide-react";
import { toast } from "sonner";

type Grade = "A" | "B" | "C" | "D" | "pending";

interface GapItem {
  id: string;
  category: number;
  categoryName: string;
  subItem: string;
  description: string;
  grade: Grade;
  isCritical?: boolean;
}

const FMEA_CATEGORIES: { cat: number; name: string; items: { sub: string; desc: string; critical?: boolean }[] }[] = [
  { cat: 1, name: "Controle Manual e Joystick Independente", items: [
    { sub: "1.1", desc: "Alavancas Manuais dos propulsores (Principais e Laterais) testadas" },
    { sub: "1.2", desc: "Joystick Independente - IJS" },
  ]},
  { cat: 2, name: "Sistema de controle de DP", items: [
    { sub: "2.1", desc: "Programa de Análises de Consequência (Consequence Analysis)" },
    { sub: "2.2", desc: "Chave Seletora de Modo DP" },
    { sub: "2.3", desc: "OSs de DP" },
    { sub: "2.4", desc: "Controladoras" },
  ]},
  { cat: 3, name: "Sistema de Referência de Posição", items: [
    { sub: "3.1", desc: "PRS habilitados, configurações e Filosofia dos PRS" },
    { sub: "3.2", desc: "DGPS - conjuntos de antenas, correções, obstruções" },
    { sub: "3.3", desc: "Referência Relativa baseada em Micro-ondas" },
    { sub: "3.4", desc: "Referência Relativa baseada em Radar" },
    { sub: "3.5", desc: "Referência Relativa baseada em Laser" },
  ]},
  { cat: 4, name: "Sensores", items: [
    { sub: "4.1", desc: "Agulhas Giroscópicas" },
    { sub: "4.2", desc: "Agulhas Giroscópicas - Ajuste de velocidade e latitude" },
    { sub: "4.3", desc: "Sensores de Vento" },
    { sub: "4.4", desc: "VRU/MRU" },
  ]},
  { cat: 5, name: "Performance da embarcação", items: [
    { sub: "5.1", desc: "Velocidades dentro da zona dos 500m e modo DP" },
    { sub: "5.2", desc: "Taxa de guinada" },
    { sub: "5.3", desc: "Configuração dos alarmes de desvios de Posição e Aproamento" },
    { sub: "5.4", desc: "Calado da embarcação" },
    { sub: "5.5", desc: "Centro de rotação" },
    { sub: "5.6", desc: "Máximos incrementos na mudança de posição (STEPS)" },
    { sub: "5.7", desc: "Teste de deriva" },
  ]},
  { cat: 7, name: "Sistemas de combustível", items: [
    { sub: "7.1", desc: "Tanques diários com fornecimento conforme conceito de redundância" },
    { sub: "7.2", desc: "Bombas elétricas conforme conceito de redundância" },
    { sub: "7.3", desc: "Segregação da fonte de alimentação de bombas elétricas" },
    { sub: "7.6", desc: "Segregação das linhas de suprimento com válvulas Crossover" },
    { sub: "7.7", desc: "Controle de água e contaminação microbiológica" },
  ]},
  { cat: 12, name: "Propulsão principal e equipamentos", items: [
    { sub: "12.1", desc: "Modos de operação dos geradores disponíveis" },
    { sub: "12.2", desc: "Funcionalidade de partida da propulsão principal" },
    { sub: "12.4", desc: "Detecção de falhas - sistema hidráulico" },
    { sub: "12.5", desc: "Detecção de falhas - sistema elétrico" },
    { sub: "12.8", desc: "Detecção de falhas - paradas de emergência" },
  ]},
  { cat: 13, name: "Thrusters", items: [
    { sub: "13.1", desc: "Detecção de falhas - comando e feedback" },
    { sub: "13.2", desc: "Redundância dos indicadores de ângulo" },
    { sub: "13.3", desc: "Detecção de falhas - alinhamento dos thrusters" },
    { sub: "13.4", desc: "Controles alternativos e manuais de emergência" },
    { sub: "13.5", desc: "Alternância automático/manual sem interrupções" },
    { sub: "13.10", desc: "Sensores de carga e torque dos thrusters" },
  ]},
  { cat: 14, name: "Segurança", items: [
    { sub: "14.1", desc: "Análises de riscos em SIMOPS e comunicações com ativos", critical: true },
    { sub: "14.2", desc: "Detecção de falhas - sistemas de incêndio" },
    { sub: "14.3", desc: "Comunicação interna entre tripulantes e com ativos" },
  ]},
  { cat: 15, name: "Geração/Distribuição de Energia", items: [
    { sub: "15.1", desc: "Geradores Principais SG1 e SG2" },
    { sub: "15.3", desc: "Separação entre sistemas redundantes" },
    { sub: "15.4", desc: "Geradores de Emergência" },
    { sub: "15.6", desc: "Configuração dos barramentos em tensão (primária)" },
    { sub: "15.8", desc: "Calibração dos relés a cada 5 anos" },
  ]},
  { cat: 16, name: "Gerenciamento de Energia", items: [
    { sub: "16.1", desc: "Status do sistema PMS" },
    { sub: "16.2", desc: "Configuração de parada de emergência" },
    { sub: "16.3", desc: "Configuração automática de recuperação após blackout" },
    { sub: "16.4", desc: "Limitação de carga (Potência Elétrica)" },
  ]},
  { cat: 17, name: "UPS - Fonte de energia ininterrupta", items: [
    { sub: "17.1", desc: "Condição operacional dos retificadores" },
    { sub: "17.2", desc: "Sistema de alimentação ininterrupta (UPS)" },
    { sub: "17.3", desc: "Fonte de alimentação 24 Vdc" },
    { sub: "17.4", desc: "Condição operacional das baterias" },
  ]},
];

const CAMO_CATEGORIES: { cat: number; name: string; items: { sub: string; desc: string }[] }[] = [
  { cat: 1, name: "Condições Meteorológicas e Performance", items: [
    { sub: "1.1", desc: "Distância mínima / Limites de separação da UM" },
    { sub: "1.2", desc: "Condições ambientais máximas de operação" },
    { sub: "1.3", desc: "DP footprint - excursões de posição e rumo" },
    { sub: "1.4", desc: "Cenários de Drive-off e Drift-off" },
    { sub: "1.5", desc: "Taxa de guinada" },
    { sub: "1.6", desc: "Velocidades dentro da zona dos 500m e modos DP" },
    { sub: "1.7", desc: "Rota de fuga" },
  ]},
  { cat: 3, name: "Sistema de Controle de DP", items: [
    { sub: "3.1", desc: "Programa de Análises de Consequência" },
    { sub: "3.2", desc: "OSs de DP" },
    { sub: "3.3", desc: "DP Network" },
    { sub: "3.4", desc: "Controladoras" },
  ]},
  { cat: 4, name: "Sistema de Referência de Posição", items: [
    { sub: "4.1", desc: "PRS habilitados e configurações" },
    { sub: "4.2", desc: "DGPS" },
    { sub: "4.3", desc: "Referência baseada em Micro-ondas" },
    { sub: "4.4", desc: "Referência baseada em Radar" },
    { sub: "4.5", desc: "Referência baseada em Laser" },
  ]},
];

const gradeConfig: Record<Grade, { label: string; variant: "destructive" | "secondary" | "default" | "outline" }> = {
  A: { label: "A", variant: "destructive" },
  B: { label: "B", variant: "secondary" },
  C: { label: "C", variant: "default" },
  D: { label: "D", variant: "outline" },
  pending: { label: "—", variant: "outline" },
};

function buildItems(categories: typeof FMEA_CATEGORIES, prefix: string): GapItem[] {
  return categories.flatMap(c =>
    c.items.map(item => ({
      id: `${prefix}-${c.cat}-${item.sub}`,
      category: c.cat,
      categoryName: c.name,
      subItem: item.sub,
      description: item.desc,
      grade: "pending" as Grade,
      isCritical: (item as { critical?: boolean }).critical,
    }))
  );
}

export function PeoDPFMEAGapAssessment() {
  const [fmeaItems, setFmeaItems] = useState<GapItem[]>(() => buildItems(FMEA_CATEGORIES, "fmea"));
  const [camoItems, setCamoItems] = useState<GapItem[]>(() => buildItems(CAMO_CATEGORIES, "camo"));
  const [activeTab, setActiveTab] = useState("fmea");

  const currentItems = activeTab === "fmea" ? fmeaItems : camoItems;
  const setCurrentItems = activeTab === "fmea" ? setFmeaItems : setCamoItems;

  const stats = useMemo(() => ({
    total: currentItems.length,
    a: currentItems.filter(i => i.grade === "A").length,
    b: currentItems.filter(i => i.grade === "B").length,
    c: currentItems.filter(i => i.grade === "C").length,
    d: currentItems.filter(i => i.grade === "D").length,
    pending: currentItems.filter(i => i.grade === "pending").length,
  }), [currentItems]);

  const conformityPct = stats.total > 0 ? Math.round(((stats.c + stats.d) / stats.total) * 100) : 0;

  const updateGrade = (id: string, grade: Grade) => {
    setCurrentItems(prev => prev.map(i => i.id === id ? { ...i, grade } : i));
  };

  const categories = [...new Set(currentItems.map(i => i.categoryName))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            GAP de FMEA/CAMO/ASOG — Anexo N-1
          </h3>
          <p className="text-sm text-muted-foreground">
            Avaliação conforme IMCA M 166 / M 103 / M 109 • PEO-DP 2026
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1 h-9" onClick={() => quickExport(categories, "PEO-DP GAP N1")}>
          <Download className="h-3 w-3" /> Exportar
        </Button>
      </div>

      {stats.a > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">
              <strong>{stats.a} item(ns) "A"</strong> — Documento não será aceito. CONTRATADA deverá revisar e entregar no prazo do BROA.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        <Card><CardContent className="pt-3 text-center"><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold">{stats.total}</p></CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="pt-3 text-center"><p className="text-xs text-destructive">A</p><p className="text-xl font-bold text-destructive">{stats.a}</p></CardContent></Card>
        <Card className="border-warning/20"><CardContent className="pt-3 text-center"><p className="text-xs text-warning">B</p><p className="text-xl font-bold text-warning">{stats.b}</p></CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-3 text-center"><p className="text-xs text-success">C</p><p className="text-xl font-bold text-success">{stats.c}</p></CardContent></Card>
        <Card><CardContent className="pt-3 text-center"><p className="text-xs text-muted-foreground">D</p><p className="text-xl font-bold">{stats.d}</p></CardContent></Card>
        <Card><CardContent className="pt-3 text-center"><p className="text-xs text-muted-foreground">Conforme</p><p className="text-xl font-bold">{conformityPct}%</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="fmea">FMEA/FMECA ({fmeaItems.length})</TabsTrigger>
          <TabsTrigger value="camo">CAMO ({camoItems.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardContent className="pt-4">
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {categories.map(cat => (
                    <div key={cat}>
                      <h4 className="text-sm font-semibold mb-2 text-primary">{cat}</h4>
                      <div className="space-y-1">
                        {currentItems.filter(i => i.categoryName === cat).map(item => (
                          <div key={item.id} className={`flex items-center gap-3 p-2 rounded border ${
                            item.grade === "A" ? "border-destructive/20 bg-destructive/5" :
                            item.grade === "C" ? "border-success/20 bg-success/5" :
                            "border-border"
                          }`}>
                            <span className="text-xs font-mono text-muted-foreground w-10">{item.subItem}</span>
                            <span className="text-sm flex-1">{item.description}</span>
                            {item.isCritical && <Badge variant="destructive" className="text-xs">CRÍTICO</Badge>}
                            <div className="flex gap-1">
                              {(["A", "B", "C", "D"] as Grade[]).map(g => (
                                <Button key={g} size="sm" variant={item.grade === g ? gradeConfig[g].variant : "outline"}
                                  className="h-7 w-7 p-0 text-xs font-bold" onClick={() => updateGrade(item.id, g)}>
                                  {g}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
