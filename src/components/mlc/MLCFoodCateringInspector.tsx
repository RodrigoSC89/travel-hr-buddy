/**
 * MLC Food & Catering Inspector - Regulation 3.2 Compliance
 * Tracks galley inspections, cook certificates, food quality and storage
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  UtensilsCrossed, CheckCircle, AlertTriangle, ThermometerSun,
  ClipboardCheck, Award, ShieldCheck, Calendar, XCircle
} from "lucide-react";

interface InspectionItem {
  id: string;
  category: string;
  requirement: string;
  regulation: string;
  status: "compliant" | "non_compliant" | "observation" | "not_inspected";
  notes: string;
  critical: boolean;
}

const INSPECTION_ITEMS: InspectionItem[] = [
  // Galley & Equipment
  { id: "fc-1", category: "Galley", requirement: "Cozinha limpa e organizada, livre de pragas", regulation: "A3.2 §2(a)", status: "not_inspected", notes: "", critical: true },
  { id: "fc-2", category: "Galley", requirement: "Equipamentos de cocção em bom estado de funcionamento", regulation: "A3.2 §2(b)", status: "not_inspected", notes: "", critical: false },
  { id: "fc-3", category: "Galley", requirement: "Ventilação e exaustão adequadas na cozinha", regulation: "A3.2 §2(c)", status: "not_inspected", notes: "", critical: false },
  { id: "fc-4", category: "Galley", requirement: "Superfícies de trabalho em material sanitário lavável", regulation: "A3.2 §2(d)", status: "not_inspected", notes: "", critical: true },
  { id: "fc-5", category: "Galley", requirement: "Sistema de refrigeração operacional com termômetros", regulation: "A3.2 §3", status: "not_inspected", notes: "", critical: true },
  // Food Storage
  { id: "fc-6", category: "Armazenamento", requirement: "Paiol de mantimentos seco, ventilado e limpo", regulation: "A3.2 §4(a)", status: "not_inspected", notes: "", critical: false },
  { id: "fc-7", category: "Armazenamento", requirement: "Alimentos perecíveis armazenados em temperatura adequada (≤5°C)", regulation: "A3.2 §4(b)", status: "not_inspected", notes: "", critical: true },
  { id: "fc-8", category: "Armazenamento", requirement: "FIFO (First In First Out) implementado", regulation: "A3.2 §4(c)", status: "not_inspected", notes: "", critical: false },
  { id: "fc-9", category: "Armazenamento", requirement: "Separação adequada entre alimentos crus e cozidos", regulation: "A3.2 §4(d)", status: "not_inspected", notes: "", critical: true },
  { id: "fc-10", category: "Armazenamento", requirement: "Sem alimentos vencidos - registro de validade em dia", regulation: "A3.2 §4(e)", status: "not_inspected", notes: "", critical: true },
  // Food Quality
  { id: "fc-11", category: "Qualidade", requirement: "Cardápio variado atendendo necessidades nutricionais", regulation: "A3.2 §1", status: "not_inspected", notes: "", critical: false },
  { id: "fc-12", category: "Qualidade", requirement: "Dietas especiais/religiosas acomodadas", regulation: "A3.2 §1(b)", status: "not_inspected", notes: "", critical: false },
  { id: "fc-13", category: "Qualidade", requirement: "Água potável disponível 24h com qualidade testada", regulation: "A3.2 §5", status: "not_inspected", notes: "", critical: true },
  { id: "fc-14", category: "Qualidade", requirement: "Quantidade suficiente de refeições (min. 3/dia)", regulation: "A3.2 §1(c)", status: "not_inspected", notes: "", critical: true },
  // Personnel
  { id: "fc-15", category: "Pessoal", requirement: "Cozinheiro com certificado de competência válido (STCW)", regulation: "A3.2 §3", status: "not_inspected", notes: "", critical: true },
  { id: "fc-16", category: "Pessoal", requirement: "Treinamento em higiene alimentar documentado", regulation: "A3.2 §3(b)", status: "not_inspected", notes: "", critical: true },
  { id: "fc-17", category: "Pessoal", requirement: "Exames de saúde dos manipuladores em dia", regulation: "A3.2 §3(c)", status: "not_inspected", notes: "", critical: true },
  // Hygiene
  { id: "fc-18", category: "Higiene", requirement: "Programa de limpeza documentado e seguido", regulation: "B3.2 §1", status: "not_inspected", notes: "", critical: false },
  { id: "fc-19", category: "Higiene", requirement: "Registro de temperaturas de câmaras (diário)", regulation: "B3.2 §2", status: "not_inspected", notes: "", critical: true },
  { id: "fc-20", category: "Higiene", requirement: "Programa de controle de pragas (dedetização) válido", regulation: "B3.2 §3", status: "not_inspected", notes: "", critical: true },
  { id: "fc-21", category: "Higiene", requirement: "EPIs disponíveis para manipuladores (luvas, toucas)", regulation: "B3.2 §4", status: "not_inspected", notes: "", critical: false },
  { id: "fc-22", category: "Higiene", requirement: "Lavatório com sabão e álcool na entrada da cozinha", regulation: "B3.2 §5", status: "not_inspected", notes: "", critical: true },
];

const statusConfig = {
  compliant: { label: "Conforme", color: "text-green-500", icon: CheckCircle, badge: "default" as const },
  non_compliant: { label: "Não Conforme", color: "text-destructive", icon: XCircle, badge: "destructive" as const },
  observation: { label: "Observação", color: "text-warning", icon: AlertTriangle, badge: "secondary" as const },
  not_inspected: { label: "Não Inspecionado", color: "text-muted-foreground", icon: ClipboardCheck, badge: "outline" as const },
};

export const MLCFoodCateringInspector: React.FC = () => {
  const [items, setItems] = useState<InspectionItem[]>(INSPECTION_ITEMS);
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = ["all", ...Array.from(new Set(items.map(i => i.category)))];
  const filtered = activeCategory === "all" ? items : items.filter(i => i.category === activeCategory);

  const inspected = items.filter(i => i.status !== "not_inspected").length;
  const compliant = items.filter(i => i.status === "compliant").length;
  const nonCompliant = items.filter(i => i.status === "non_compliant").length;
  const observations = items.filter(i => i.status === "observation").length;
  const score = inspected > 0 ? Math.round((compliant / inspected) * 100) : 0;

  const updateItem = (id: string, update: Partial<InspectionItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...update } : i));
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card className="border-green-500/30 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500/10">
                <UtensilsCrossed className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Inspeção Alimentação & Catering</h3>
                <p className="text-sm text-muted-foreground">MLC 2006 Regulation 3.2 • Standard A3.2 & Guideline B3.2</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-4xl font-bold ${score >= 90 ? "text-green-500" : score >= 70 ? "text-warning" : "text-destructive"}`}>
                {score}%
              </span>
              <p className="text-xs text-muted-foreground">Score de Conformidade</p>
            </div>
          </div>
          <Progress value={(inspected / items.length) * 100} className="h-2 mb-3" />
          <div className="grid grid-cols-5 gap-3 text-center">
            <div className="p-2 rounded-lg bg-muted/50">
              <span className="text-lg font-bold">{items.length}</span>
              <p className="text-[10px] text-muted-foreground">Total Itens</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <span className="text-lg font-bold text-blue-500">{inspected}</span>
              <p className="text-[10px] text-muted-foreground">Inspecionados</p>
            </div>
            <div className="p-2 rounded-lg bg-green-500/10">
              <span className="text-lg font-bold text-green-500">{compliant}</span>
              <p className="text-[10px] text-muted-foreground">Conformes</p>
            </div>
            <div className="p-2 rounded-lg bg-destructive/10">
              <span className="text-lg font-bold text-destructive">{nonCompliant}</span>
              <p className="text-[10px] text-muted-foreground">Não Conformes</p>
            </div>
            <div className="p-2 rounded-lg bg-warning/10">
              <span className="text-lg font-bold text-warning">{observations}</span>
              <p className="text-[10px] text-muted-foreground">Observações</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <Button key={cat} size="sm" variant={activeCategory === cat ? "default" : "outline"} onClick={() => setActiveCategory(cat)}>
            {cat === "all" ? "Todos" : cat} {cat !== "all" && `(${items.filter(i => i.category === cat).length})`}
          </Button>
        ))}
      </div>

      {/* Inspection Items */}
      <div className="space-y-3">
        {filtered.map(item => {
          const cfg = statusConfig[item.status];
          const StatusIcon = cfg.icon;
          return (
            <Card key={item.id} className={`${item.status === "non_compliant" ? "border-destructive/30" : ""}`}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-3">
                  <StatusIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm">{item.requirement}</span>
                      {item.critical && <Badge variant="destructive" className="text-[10px] px-1 py-0">Crítico</Badge>}
                      <Badge variant="outline" className="text-[10px] px-1 py-0">{item.regulation}</Badge>
                    </div>

                    {/* Status Buttons */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {(["compliant", "observation", "non_compliant"] as const).map(s => {
                        const sc = statusConfig[s];
                        return (
                          <Button
                            key={s} size="sm" variant={item.status === s ? "default" : "outline"}
                            className={`h-7 text-xs gap-1 ${item.status === s && s === "compliant" ? "bg-green-500 hover:bg-green-600" : ""} ${item.status === s && s === "non_compliant" ? "bg-destructive hover:bg-destructive/90" : ""}`}
                            onClick={() => updateItem(item.id, { status: s })}
                          >
                            <sc.icon className="h-3 w-3" /> {sc.label}
                          </Button>
                        );
                      })}
                    </div>

                    {/* Notes */}
                    {item.status !== "not_inspected" && (
                      <Textarea
                        className="mt-2 text-xs h-16"
                        placeholder="Observações da inspeção..."
                        value={item.notes}
                        onChange={e => updateItem(item.id, { notes: e.target.value })}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
