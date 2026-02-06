/**
 * WasteManagementMARPOL - Real data from waste_records
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Recycle, Ship, CheckCircle2, FileText, Download, Calendar, MapPin, Scale } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/ui/UXStates";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const categoryLabels: Record<string, string> = {
  plastics: "Plásticos", food_waste: "Resíduos Alimentares", domestic: "Domésticos",
  cooking_oil: "Óleo de Cozinha", incinerator_ash: "Cinzas", operational: "Operacionais",
  animal: "Carcaças", fishing_gear: "Pesca", ewaste: "Eletrônico", cargo: "Carga",
};

export function WasteManagementMARPOL() {
  const [activeTab, setActiveTab] = useState("records");

  const { data, isLoading } = useQuery({
    queryKey: ["waste-management"],
    queryFn: async () => {
      const [wasteResult, vesselResult] = await Promise.all([
        supabase.from("waste_records")
          .select("id, vessel_id, waste_type, quantity, unit, disposal_method, disposal_date, port_code, marpol_annex, certificate_number")
          .order("disposal_date", { ascending: false }),
        supabase.from("vessels").select("id, name").order("name"),
      ]);
      if (wasteResult.error) throw wasteResult.error;
      if (vesselResult.error) throw vesselResult.error;
      return { records: wasteResult.data || [], vessels: vesselResult.data || [] };
    },
    staleTime: 30000,
  });

  if (isLoading) return <div className="space-y-4"><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-64" /></div>;

  const { records = [], vessels = [] } = data || {};
  const vesselMap = new Map(vessels.map((v: any) => [v.id, v.name]));

  if (records.length === 0) {
    return <EmptyState icon={Recycle} title="Sem registros MARPOL" message="Registre descartes de resíduos para conformidade MARPOL Annex V e e-GRB." />;
  }

  const totalWaste = records.reduce((sum: number, r: any) => sum + (Number(r.quantity) || 0), 0);
  const shoreCount = records.filter((r: any) => r.disposal_method === "shore").length;
  const seaCount = records.filter((r: any) => r.disposal_method === "sea").length;
  const withCert = records.filter((r: any) => r.certificate_number).length;

  const exportCSV = () => {
    const headers = ["Data", "Embarcação", "Tipo", "Quantidade", "Unidade", "Método", "Porto", "Certificado"];
    const rows = records.map((r: any) => [
      r.disposal_date, vesselMap.get(r.vessel_id) || "N/A", r.waste_type, r.quantity, r.unit, r.disposal_method, r.port_code || "", r.certificate_number || ""
    ]);
    const csv = [headers.join(","), ...rows.map((r: any[]) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "waste-marpol-report.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório GRB exportado");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Recycle className="h-6 w-6" />Gestão de Resíduos MARPOL</h2>
          <p className="text-muted-foreground">e-GRB (Electronic Garbage Record Book) • {records.length} registros</p>
        </div>
        <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2" />Exportar GRB</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Descartado</p><p className="text-2xl font-bold">{totalWaste.toFixed(1)}</p></div><Scale className="h-5 w-5 text-blue-600" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Descarte em Porto</p><p className="text-2xl font-bold">{shoreCount}</p></div><MapPin className="h-5 w-5 text-green-600" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Descarte no Mar</p><p className="text-2xl font-bold">{seaCount}</p></div><Ship className="h-5 w-5 text-amber-600" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Com Certificado</p><p className="text-2xl font-bold text-green-600">{withCert}</p></div><CheckCircle2 className="h-5 w-5 text-green-600" /></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="records">Registros GRB</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Registros Recentes</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {records.slice(0, 20).map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Trash2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{categoryLabels[record.waste_type] || record.waste_type}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Ship className="h-3 w-3" />
                          <span>{vesselMap.get(record.vessel_id) || "N/A"}</span>
                          {record.disposal_date && <>
                            <span>•</span>
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(record.disposal_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                          </>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{record.quantity} {record.unit}</p>
                        <Badge variant={record.disposal_method === "shore" ? "default" : "secondary"}>
                          {record.disposal_method === "shore" ? "Porto" : record.disposal_method === "sea" ? "Mar" : record.disposal_method}
                        </Badge>
                      </div>
                      {record.certificate_number && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />Cert
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Conformidade MARPOL Annex V</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border border-green-200 bg-green-50">
                <div className="flex items-center gap-2 mb-1"><CheckCircle2 className="h-5 w-5 text-green-600" /><span className="font-semibold text-green-700">e-GRB Ativo</span></div>
                <p className="text-sm text-green-600">{records.length} registros no livro eletrônico</p>
              </div>
              <div className="p-4 rounded-lg border border-green-200 bg-green-50">
                <div className="flex items-center gap-2 mb-1"><CheckCircle2 className="h-5 w-5 text-green-600" /><span className="font-semibold text-green-700">Certificados de Descarte</span></div>
                <p className="text-sm text-green-600">{withCert} de {shoreCount} descartes em porto com certificado</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default WasteManagementMARPOL;
