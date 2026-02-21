/**
 * MLC Food & Catering Inspector - Regulation 3.2 Compliance
 * Connected to Supabase for real persistence
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { toast } from "sonner";
import {
  UtensilsCrossed, CheckCircle, AlertTriangle, XCircle, ClipboardCheck, Loader2
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

const TEMPLATE_ITEMS: Omit<InspectionItem, "status" | "notes">[] = [
  { id: "fc-1", category: "Galley", requirement: "Cozinha limpa e organizada, livre de pragas", regulation: "A3.2 §2(a)", critical: true },
  { id: "fc-2", category: "Galley", requirement: "Equipamentos de cocção em bom estado", regulation: "A3.2 §2(b)", critical: false },
  { id: "fc-3", category: "Galley", requirement: "Ventilação e exaustão adequadas", regulation: "A3.2 §2(c)", critical: false },
  { id: "fc-4", category: "Galley", requirement: "Superfícies em material sanitário lavável", regulation: "A3.2 §2(d)", critical: true },
  { id: "fc-5", category: "Galley", requirement: "Sistema de refrigeração com termômetros", regulation: "A3.2 §3", critical: true },
  { id: "fc-6", category: "Armazenamento", requirement: "Paiol de mantimentos seco e ventilado", regulation: "A3.2 §4(a)", critical: false },
  { id: "fc-7", category: "Armazenamento", requirement: "Perecíveis em temperatura ≤5°C", regulation: "A3.2 §4(b)", critical: true },
  { id: "fc-8", category: "Armazenamento", requirement: "FIFO implementado", regulation: "A3.2 §4(c)", critical: false },
  { id: "fc-9", category: "Armazenamento", requirement: "Separação crus/cozidos", regulation: "A3.2 §4(d)", critical: true },
  { id: "fc-10", category: "Armazenamento", requirement: "Sem alimentos vencidos", regulation: "A3.2 §4(e)", critical: true },
  { id: "fc-11", category: "Qualidade", requirement: "Cardápio variado e nutritivo", regulation: "A3.2 §1", critical: false },
  { id: "fc-12", category: "Qualidade", requirement: "Dietas especiais/religiosas", regulation: "A3.2 §1(b)", critical: false },
  { id: "fc-13", category: "Qualidade", requirement: "Água potável 24h", regulation: "A3.2 §5", critical: true },
  { id: "fc-14", category: "Qualidade", requirement: "Min. 3 refeições/dia", regulation: "A3.2 §1(c)", critical: true },
  { id: "fc-15", category: "Pessoal", requirement: "Cozinheiro com certificado STCW", regulation: "A3.2 §3", critical: true },
  { id: "fc-16", category: "Pessoal", requirement: "Treinamento higiene documentado", regulation: "A3.2 §3(b)", critical: true },
  { id: "fc-17", category: "Pessoal", requirement: "Exames de saúde em dia", regulation: "A3.2 §3(c)", critical: true },
  { id: "fc-18", category: "Higiene", requirement: "Programa de limpeza documentado", regulation: "B3.2 §1", critical: false },
  { id: "fc-19", category: "Higiene", requirement: "Registro de temperaturas diário", regulation: "B3.2 §2", critical: true },
  { id: "fc-20", category: "Higiene", requirement: "Controle de pragas válido", regulation: "B3.2 §3", critical: true },
  { id: "fc-21", category: "Higiene", requirement: "EPIs para manipuladores", regulation: "B3.2 §4", critical: false },
  { id: "fc-22", category: "Higiene", requirement: "Lavatório com sabão na entrada", regulation: "B3.2 §5", critical: true },
];

const statusConfig = {
  compliant: { label: "Conforme", color: "text-success", icon: CheckCircle },
  non_compliant: { label: "Não Conforme", color: "text-destructive", icon: XCircle },
  observation: { label: "Observação", color: "text-warning", icon: AlertTriangle },
  not_inspected: { label: "Não Inspecionado", color: "text-muted-foreground", icon: ClipboardCheck },
};

export const MLCFoodCateringInspector: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: savedItems = [], isLoading } = useQuery({
    queryKey: ["mlc-food-inspections"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("mlc_food_inspections")
        .select("*")
        .order("item_id");
      if (error) throw error;
      return data as Array<Record<string, unknown>>;
    },
  });

  // Merge template with saved data
  const items: InspectionItem[] = TEMPLATE_ITEMS.map(t => {
    const saved = savedItems.find((s: Record<string, unknown>) => String(s.item_id) === t.id);
    return {
      ...t,
      status: saved ? (String(saved.status) as InspectionItem["status"]) : "not_inspected",
      notes: saved ? String(saved.notes || "") : "",
    };
  });

  const saveMutation = useMutation({
    mutationFn: async ({ itemId, status, notes }: { itemId: string; status: string; notes: string }) => {
      const template = TEMPLATE_ITEMS.find(t => t.id === itemId);
      const { error } = await fromUntyped("mlc_food_inspections")
        .upsert({
          item_id: itemId,
          status,
          notes,
          category: template?.category || "",
          requirement: template?.requirement || "",
          regulation: template?.regulation || "",
          is_critical: template?.critical || false,
          inspected_at: new Date().toISOString(),
        } as never, { onConflict: "item_id" });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mlc-food-inspections"] }),
  });

  const categories = ["all", ...Array.from(new Set(TEMPLATE_ITEMS.map(i => i.category)))];
  const filtered = activeCategory === "all" ? items : items.filter(i => i.category === activeCategory);

  const inspected = items.filter(i => i.status !== "not_inspected").length;
  const compliant = items.filter(i => i.status === "compliant").length;
  const nonCompliant = items.filter(i => i.status === "non_compliant").length;
  const observations = items.filter(i => i.status === "observation").length;
  const score = inspected > 0 ? Math.round((compliant / inspected) * 100) : 0;

  const updateItem = (id: string, status: string, notes?: string) => {
    const current = items.find(i => i.id === id);
    saveMutation.mutate({ itemId: id, status, notes: notes ?? current?.notes ?? "" });
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card className="border-success/30 bg-gradient-to-r from-success/5 to-emerald-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/10"><UtensilsCrossed className="h-6 w-6 text-success" /></div>
              <div>
                <h3 className="text-xl font-bold">Inspeção Alimentação & Catering</h3>
                <p className="text-sm text-muted-foreground">MLC 2006 Regulation 3.2</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-4xl font-bold ${score >= 90 ? "text-success" : score >= 70 ? "text-warning" : "text-destructive"}`}>{score}%</span>
              <p className="text-xs text-muted-foreground">Score de Conformidade</p>
            </div>
          </div>
          <Progress value={(inspected / items.length) * 100} className="h-2 mb-3" />
          <div className="grid grid-cols-5 gap-3 text-center">
            <div className="p-2 rounded-lg bg-muted/50"><span className="text-lg font-bold">{items.length}</span><p className="text-[10px] text-muted-foreground">Total</p></div>
            <div className="p-2 rounded-lg bg-primary/10"><span className="text-lg font-bold text-primary">{inspected}</span><p className="text-[10px] text-muted-foreground">Inspecionados</p></div>
            <div className="p-2 rounded-lg bg-success/10"><span className="text-lg font-bold text-success">{compliant}</span><p className="text-[10px] text-muted-foreground">Conformes</p></div>
            <div className="p-2 rounded-lg bg-destructive/10"><span className="text-lg font-bold text-destructive">{nonCompliant}</span><p className="text-[10px] text-muted-foreground">NCs</p></div>
            <div className="p-2 rounded-lg bg-warning/10"><span className="text-lg font-bold text-warning">{observations}</span><p className="text-[10px] text-muted-foreground">Observações</p></div>
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
            <Card key={item.id} className={item.status === "non_compliant" ? "border-destructive/30" : ""}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-3">
                  <StatusIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm">{item.requirement}</span>
                      {item.critical && <Badge variant="destructive" className="text-[10px] px-1 py-0">Crítico</Badge>}
                      <Badge variant="outline" className="text-[10px] px-1 py-0">{item.regulation}</Badge>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {(["compliant", "observation", "non_compliant"] as const).map(s => {
                        const sc = statusConfig[s];
                        return (
                          <Button key={s} size="sm" variant={item.status === s ? "default" : "outline"}
                            className={`h-7 text-xs gap-1 ${item.status === s && s === "compliant" ? "bg-success hover:bg-success/90" : ""} ${item.status === s && s === "non_compliant" ? "bg-destructive hover:bg-destructive/90" : ""}`}
                            onClick={() => updateItem(item.id, s)}>
                            <sc.icon className="h-3 w-3" /> {sc.label}
                          </Button>
                        );
                      })}
                    </div>
                    {item.status !== "not_inspected" && (
                      <Textarea className="mt-2 text-xs h-16" placeholder="Observações..." value={item.notes}
                        onChange={e => updateItem(item.id, item.status, e.target.value)} />
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
