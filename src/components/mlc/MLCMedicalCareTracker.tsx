/**
 * MLC Medical Care Tracker — Reg. 4.1 Compliance
 * Top 5 deficiency area in MLC inspections
 */
import React, { useState, useMemo } from "react";
import { quickExport } from "@/lib/export-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Heart, Pill, Stethoscope, CheckCircle, AlertTriangle, Clock,
  Download, Shield, Phone, Users
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type ItemStatus = "compliant" | "non_compliant" | "expiring" | "na";

interface MedicalItem {
  id: string;
  category: string;
  item: string;
  regulation: string;
  status: ItemStatus;
  expiryDate: string | null;
  quantity: number | null;
  requiredQuantity: number | null;
  lastChecked: string;
  notes: string;
}

const STATUS_CONFIG: Record<ItemStatus, { label: string; color: string }> = {
  compliant: { label: "Conforme", color: "text-success" },
  non_compliant: { label: "Não Conforme", color: "text-destructive" },
  expiring: { label: "Vencendo", color: "text-warning" },
  na: { label: "N/A", color: "text-muted-foreground" },
};

const MEDICAL_ITEMS: MedicalItem[] = [
  { id: "MC-01", category: "Farmácia de Bordo", item: "Analgésicos (Paracetamol, Ibuprofeno)", regulation: "MLC A4.1, ILO/WHO Guide", status: "compliant", expiryDate: "2027-03-15", quantity: 200, requiredQuantity: 100, lastChecked: "2026-02-01", notes: "" },
  { id: "MC-02", category: "Farmácia de Bordo", item: "Antibióticos (Amoxicilina, Ciprofloxacina)", regulation: "MLC A4.1", status: "compliant", expiryDate: "2026-09-30", quantity: 50, requiredQuantity: 30, lastChecked: "2026-02-01", notes: "" },
  { id: "MC-03", category: "Farmácia de Bordo", item: "Medicamentos cardíacos de emergência", regulation: "MLC A4.1", status: "expiring", expiryDate: "2026-04-15", quantity: 10, requiredQuantity: 10, lastChecked: "2026-02-01", notes: "Reposição necessária em 60 dias" },
  { id: "MC-05", category: "Farmácia de Bordo", item: "Epinefrina auto-injetável", regulation: "MLC A4.1", status: "compliant", expiryDate: "2026-12-01", quantity: 4, requiredQuantity: 2, lastChecked: "2026-02-01", notes: "" },
  { id: "ME-01", category: "Equipamentos Médicos", item: "Desfibrilador (DEA)", regulation: "MLC A4.1, SOLAS", status: "compliant", expiryDate: null, quantity: 2, requiredQuantity: 1, lastChecked: "2026-01-15", notes: "Pads verificados" },
  { id: "ME-02", category: "Equipamentos Médicos", item: "Kit de oxigênio e ressuscitação", regulation: "MLC A4.1", status: "compliant", expiryDate: "2027-01-01", quantity: 3, requiredQuantity: 2, lastChecked: "2026-02-01", notes: "" },
  { id: "ME-04", category: "Equipamentos Médicos", item: "Kit de sutura e material cirúrgico", regulation: "MLC A4.1", status: "non_compliant", expiryDate: "2025-08-01", quantity: 1, requiredQuantity: 2, lastChecked: "2025-12-10", notes: "Kit vencido — substituição urgente" },
  { id: "MP-01", category: "Pessoal & Treinamento", item: "Oficial médico qualificado a bordo", regulation: "MLC A4.1.4(b)", status: "compliant", expiryDate: "2027-05-20", quantity: 1, requiredQuantity: 1, lastChecked: "2026-01-01", notes: "" },
  { id: "MP-03", category: "Pessoal & Treinamento", item: "Medical First Aid Provider (MFAP)", regulation: "STCW A-VI/4-1", status: "expiring", expiryDate: "2026-04-01", quantity: 2, requiredQuantity: 2, lastChecked: "2026-01-10", notes: "1 certificado vencendo" },
  { id: "TM-01", category: "Telemedicina & Registros", item: "Serviço TMAS 24h", regulation: "MLC A4.1.4(d)", status: "compliant", expiryDate: null, quantity: null, requiredQuantity: null, lastChecked: "2026-02-01", notes: "Contrato TMAS ativo" },
  { id: "TM-03", category: "Telemedicina & Registros", item: "Medical Chest Inspection Certificate", regulation: "Flag State", status: "non_compliant", expiryDate: "2025-12-31", quantity: null, requiredQuantity: null, lastChecked: "2025-12-31", notes: "Certificado vencido — reagendar" },
];

export function MLCMedicalCareTracker() {
  const [items, setItems] = useState(MEDICAL_ITEMS);
  const [filterCategory, setFilterCategory] = useState("all");

  // Enrich with real crew medical data
  const { data: medicalStaff } = useQuery({
    queryKey: ["mlc-medical-staff"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_members")
        .select("id, first_name, last_name, rank")
        .or("rank.ilike.%medic%,rank.ilike.%nurse%,rank.ilike.%doctor%,rank.ilike.%enfermeiro%");
      if (error) throw error;
      return data || [];
    },
    staleTime: 120000,
  });

  const categories = useMemo(() => [...new Set(items.map(i => i.category))], [items]);
  const filtered = filterCategory === "all" ? items : items.filter(i => i.category === filterCategory);

  const stats = useMemo(() => {
    const compliant = items.filter(i => i.status === "compliant").length;
    const nonCompliant = items.filter(i => i.status === "non_compliant").length;
    const expiring = items.filter(i => i.status === "expiring").length;
    const total = items.filter(i => i.status !== "na").length;
    const score = total > 0 ? Math.round((compliant / total) * 100) : 0;
    return { compliant, nonCompliant, expiring, total, score };
  }, [items]);

  const resolveItem = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: "compliant" as const, lastChecked: new Date().toISOString().split("T")[0] } : i));
    toast.success("Item atualizado para conforme");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" />
            Medical Care — MLC Reg. 4.1
          </h3>
          <p className="text-sm text-muted-foreground">
            Farmácia, equipamentos, pessoal ({medicalStaff?.length || 0} médicos cadastrados), telemedicina
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => quickExport(items, "MLC Medical Care Reg 4.1")}>
          <Download className="h-3 w-3" /> Exportar
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className={stats.score === 100 ? "border-success/20" : "border-warning/20"}><CardContent className="pt-4 text-center">
          <p className={`text-3xl font-bold ${stats.score >= 90 ? "text-success" : stats.score >= 70 ? "text-warning" : "text-destructive"}`}>{stats.score}%</p>
          <p className="text-[10px] text-muted-foreground">Conformidade Reg. 4.1</p>
        </CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-success">{stats.compliant}</p>
          <p className="text-[10px] text-muted-foreground">Conformes</p>
        </CardContent></Card>
        <Card className={stats.nonCompliant > 0 ? "border-destructive/30 bg-destructive/5" : ""}><CardContent className="pt-4 text-center">
          <p className={`text-2xl font-bold ${stats.nonCompliant > 0 ? "text-destructive" : ""}`}>{stats.nonCompliant}</p>
          <p className="text-[10px] text-muted-foreground">Não Conformes</p>
        </CardContent></Card>
        <Card className={stats.expiring > 0 ? "border-warning/20" : ""}><CardContent className="pt-4 text-center">
          <p className={`text-2xl font-bold ${stats.expiring > 0 ? "text-warning" : ""}`}>{stats.expiring}</p>
          <p className="text-[10px] text-muted-foreground">Vencendo</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-[10px] text-muted-foreground">Total Itens</p>
        </CardContent></Card>
      </div>

      {(stats.nonCompliant > 0 || stats.expiring > 0) && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-3 space-y-1">
            {items.filter(i => i.status === "non_compliant" || i.status === "expiring").map(item => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <AlertTriangle className={`h-3.5 w-3.5 ${item.status === "non_compliant" ? "text-destructive" : "text-warning"}`} />
                <Badge variant={item.status === "non_compliant" ? "destructive" : "secondary"} className="text-[10px]">{item.category}</Badge>
                <span className="font-medium">{item.item}</span>
                {item.notes && <span className="text-xs text-muted-foreground">• {item.notes}</span>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-1 flex-wrap">
        <Button size="sm" variant={filterCategory === "all" ? "default" : "outline"} className="text-xs h-8" onClick={() => setFilterCategory("all")}>Todos</Button>
        {categories.map(cat => (
          <Button key={cat} size="sm" variant={filterCategory === cat ? "default" : "outline"} className="text-xs h-8" onClick={() => setFilterCategory(cat)}>{cat}</Button>
        ))}
      </div>

      {categories.filter(cat => filterCategory === "all" || cat === filterCategory).map(cat => {
        const catItems = filtered.filter(i => i.category === cat);
        if (catItems.length === 0) return null;
        const catCompliant = catItems.filter(i => i.status === "compliant").length;
        const catPct = Math.round((catCompliant / catItems.length) * 100);
        return (
          <Card key={cat}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {cat === "Farmácia de Bordo" ? <Pill className="h-4 w-4 text-primary" /> :
                   cat === "Equipamentos Médicos" ? <Stethoscope className="h-4 w-4 text-primary" /> :
                   cat === "Pessoal & Treinamento" ? <Users className="h-4 w-4 text-primary" /> :
                   <Phone className="h-4 w-4 text-primary" />}
                  {cat}
                </span>
                <Badge variant={catPct === 100 ? "default" : "secondary"} className="text-xs">{catCompliant}/{catItems.length} ({catPct}%)</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {catItems.map(item => (
                <div key={item.id} className={`flex items-center gap-3 p-2 rounded text-sm ${item.status === "non_compliant" ? "bg-destructive/5" : item.status === "expiring" ? "bg-warning/5" : ""}`}>
                  {item.status === "compliant" ? <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" /> :
                   item.status === "expiring" ? <Clock className="h-3.5 w-3.5 text-warning shrink-0" /> :
                   <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{item.item}</span>
                    {item.quantity !== null && <span className="text-xs text-muted-foreground ml-2">({item.quantity}/{item.requiredQuantity})</span>}
                    {item.expiryDate && (
                      <span className={`text-xs ml-2 ${new Date(item.expiryDate) < new Date() ? "text-destructive font-medium" : new Date(item.expiryDate) < new Date(Date.now() + 90 * 86400000) ? "text-warning" : "text-muted-foreground"}`}>
                        Val: {item.expiryDate}
                      </span>
                    )}
                    {item.notes && <span className="text-xs text-muted-foreground block">{item.notes}</span>}
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{item.regulation}</Badge>
                  {item.status !== "compliant" && (
                    <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => resolveItem(item.id)}>Resolver</Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
