/**
 * MLC DMLC Part I/II Checklist — Real Supabase persistence
 */
import React, { useState } from "react";
import { quickExport } from "@/lib/export-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fromUntyped } from "@/integrations/supabase/untyped-client";

interface DMLCItem {
  id: string;
  title: string;
  regulation: string;
  partI: string;
  partII: string;
  status: "compliant" | "non_compliant" | "partial" | "not_verified";
  notes: string;
}

const DEFAULT_DMLC_ITEMS: DMLCItem[] = [
  { id: "1", title: "Minimum Age", regulation: "MLC Reg. 1.1", partI: "Minimum age 16; night work 18+; hazardous work 18+", partII: "", status: "not_verified", notes: "" },
  { id: "2", title: "Medical Certificate", regulation: "MLC Reg. 1.2", partI: "Valid medical certificate per STCW/ILO-147; max 2 years", partII: "", status: "not_verified", notes: "" },
  { id: "3", title: "Training and Qualifications", regulation: "MLC Reg. 1.3", partI: "Personal training per STCW; safety familiarization", partII: "", status: "not_verified", notes: "" },
  { id: "4", title: "Recruitment and Placement", regulation: "MLC Reg. 1.4", partI: "Licensed recruitment service; no fees to seafarers", partII: "", status: "not_verified", notes: "" },
  { id: "5", title: "Seafarers' Employment Agreements", regulation: "MLC Reg. 2.1", partI: "Written SEA; minimum content requirements", partII: "", status: "not_verified", notes: "" },
  { id: "6", title: "Wages", regulation: "MLC Reg. 2.2", partI: "Monthly wages; allotment facility; no hidden deductions", partII: "", status: "not_verified", notes: "" },
  { id: "7", title: "Hours of Work and Rest", regulation: "MLC Reg. 2.3", partI: "Max 14h/24h or 72h/7d work; min 10h/24h rest", partII: "", status: "not_verified", notes: "" },
  { id: "8", title: "Entitlement to Leave", regulation: "MLC Reg. 2.4", partI: "Minimum 2.5 days annual leave per month", partII: "", status: "not_verified", notes: "" },
  { id: "9", title: "Repatriation", regulation: "MLC Reg. 2.5", partI: "Right to repatriation; financial security; max 11 months", partII: "", status: "not_verified", notes: "" },
  { id: "10", title: "Compensation for Ship's Loss", regulation: "MLC Reg. 2.6", partI: "Compensation for unemployment due to ship loss", partII: "", status: "not_verified", notes: "" },
  { id: "11", title: "Manning Levels", regulation: "MLC Reg. 2.7", partI: "Safe manning document; adequate crew", partII: "", status: "not_verified", notes: "" },
  { id: "12", title: "Accommodation", regulation: "MLC Reg. 3.1", partI: "Minimum cabin size; berth specifications", partII: "", status: "not_verified", notes: "" },
  { id: "13", title: "Food and Catering", regulation: "MLC Reg. 3.2", partI: "Adequate food; trained cook; hygiene standards", partII: "", status: "not_verified", notes: "" },
  { id: "14", title: "Health and Safety", regulation: "MLC Reg. 4.3", partI: "OHS policy; risk assessment; PPE", partII: "", status: "not_verified", notes: "" },
  { id: "15", title: "Medical Care", regulation: "MLC Reg. 4.1", partI: "Medical chest; qualified officer; TMAS access", partII: "", status: "not_verified", notes: "" },
  { id: "16", title: "Complaint Procedures", regulation: "MLC Reg. 5.1.5", partI: "Fair complaint procedure; no victimization", partII: "", status: "not_verified", notes: "" },
];

export function MLCDMLCChecklist() {
  const queryClient = useQueryClient();

  const { data: items = DEFAULT_DMLC_ITEMS, isLoading } = useQuery({
    queryKey: ["mlc-dmlc"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("mlc_dmlc")
        .select("*")
        .order("item_number");
      if (error) throw error;
      if (!data || data.length === 0) return DEFAULT_DMLC_ITEMS;
      return (data as Record<string, unknown>[]).map(row => ({
        id: row.id as string,
        title: (row.title as string) || "",
        regulation: (row.regulation as string) || "",
        partI: (row.part_i as string) || "",
        partII: (row.part_ii as string) || "",
        status: (row.status as DMLCItem["status"]) || "not_verified",
        notes: (row.notes as string) || "",
      }));
    },
  });

  const [localItems, setLocalItems] = useState<DMLCItem[] | null>(null);
  const displayItems = localItems || items;

  const saveMutation = useMutation({
    mutationFn: async (itemsToSave: DMLCItem[]) => {
      for (const item of itemsToSave) {
        const { error } = await fromUntyped("mlc_dmlc").upsert({
          id: item.id,
          title: item.title,
          regulation: item.regulation,
          part_i: item.partI,
          part_ii: item.partII,
          status: item.status,
          notes: item.notes,
          item_number: parseInt(item.id) || 0,
        }, { onConflict: "id" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mlc-dmlc"] });
      setLocalItems(null);
      toast.success("DMLC salvo com sucesso!");
    },
    onError: () => toast.error("Erro ao salvar DMLC"),
  });

  const updateItem = (id: string, patch: Partial<DMLCItem>) => {
    const current = localItems || items;
    setLocalItems(current.map(i => i.id === id ? { ...i, ...patch } : i));
  };

  const compliantCount = displayItems.filter(i => i.status === "compliant").length;
  const ncCount = displayItems.filter(i => i.status === "non_compliant").length;
  const partialCount = displayItems.filter(i => i.status === "partial").length;
  const verifiedPct = Math.round(((compliantCount + ncCount + partialCount) / displayItems.length) * 100);

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">DMLC — Declaration of Maritime Labour Compliance</h3>
          <p className="text-sm text-muted-foreground">Part I & Part II • {displayItems.length} requisitos • Dados reais</p>
        </div>
        <div className="flex gap-2">
          {localItems && (
            <Button size="sm" onClick={() => saveMutation.mutate(localItems)} disabled={saveMutation.isPending} className="gap-1">
              {saveMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Salvar
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => quickExport(localItems || [], "MLC DMLC Checklist")} className="gap-1">
            <Download className="h-3 w-3" /> Exportar
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-success/20"><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Conforme</p><p className="text-2xl font-bold text-success">{compliantCount}</p></CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Não Conforme</p><p className="text-2xl font-bold text-destructive">{ncCount}</p></CardContent></Card>
        <Card className="border-warning/20"><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Parcial</p><p className="text-2xl font-bold text-warning">{partialCount}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Verificação</p><p className="text-2xl font-bold">{verifiedPct}%</p></CardContent></Card>
      </div>

      {/* DMLC Items */}
      <div className="space-y-3">
        {displayItems.map(item => (
          <Card key={item.id} className={item.status === "non_compliant" ? "border-destructive/30" : item.status === "compliant" ? "border-success/20" : ""}>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono">{item.regulation}</Badge>
                    <span className="font-medium text-sm">{item.title}</span>
                  </div>
                  <Select value={item.status} onValueChange={(v) => updateItem(item.id, { status: v as DMLCItem["status"] })}>
                    <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compliant">✓ Conforme</SelectItem>
                      <SelectItem value="non_compliant">✗ Não Conforme</SelectItem>
                      <SelectItem value="partial">⚠ Parcial</SelectItem>
                      <SelectItem value="not_verified">— Não Verificado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <p className="font-medium text-muted-foreground mb-1">Part I — Flag State:</p>
                    <p>{item.partI}</p>
                  </div>
                  <div>
                    <p className="font-medium text-xs text-muted-foreground mb-1">Part II — Shipowner:</p>
                    <Textarea
                      placeholder="Descreva as medidas adotadas..."
                      value={item.partII}
                      onChange={(e) => updateItem(item.id, { partII: e.target.value })}
                      className="text-xs min-h-[60px]"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
