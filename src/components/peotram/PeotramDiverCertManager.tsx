import { useState } from "react";
import { quickExport } from "@/lib/export-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Search, Download, Plus, Loader2 } from "lucide-react";

interface Diver {
  id: string;
  name: string;
  role: string;
  certifications: { name: string; issuer: string; number: string; issued: string; expiry: string; status: "valid" | "expiring" | "expired" }[];
  sat_hours: number;
  total_dives: number;
  last_medical: string;
  medical_valid: boolean;
  fitness_status: "fit" | "restricted" | "unfit";
}

const STATUS_COLOR = {
  valid: "border-green-500 text-green-600 bg-green-500/10",
  expiring: "border-amber-500 text-amber-600 bg-amber-500/10",
  expired: "border-red-500 text-red-600 bg-red-500/10",
};

export function PeotramDiverCertManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDiver, setNewDiver] = useState({ name: "", role: "Mergulhador SAT", sat_hours: 0, total_dives: 0 });

  const { data: divers = [], isLoading } = useQuery({
    queryKey: ["peotram-divers"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("peotram_divers")
        .select("*")
        .order("name");
      if (error) throw error;
      return (data || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        name: (row.name as string) || "",
        role: (row.role as string) || "",
        certifications: Array.isArray(row.certifications) ? row.certifications : [],
        sat_hours: (row.sat_hours as number) || 0,
        total_dives: (row.total_dives as number) || 0,
        last_medical: (row.last_medical as string) || "",
        medical_valid: (row.medical_valid as boolean) ?? true,
        fitness_status: (row.fitness_status as string) || "fit",
      })) as Diver[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (d: typeof newDiver) => {
      const { error } = await (supabase.from as Function)("peotram_divers").insert({
        name: d.name,
        role: d.role,
        sat_hours: d.sat_hours,
        total_dives: d.total_dives,
        certifications: [],
        medical_valid: true,
        fitness_status: "fit",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peotram-divers"] });
      setIsAddOpen(false);
      setNewDiver({ name: "", role: "Mergulhador SAT", sat_hours: 0, total_dives: 0 });
      toast.success("Mergulhador registrado!");
    },
    onError: () => toast.error("Erro ao registrar mergulhador"),
  });

  const filtered = divers.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.role.toLowerCase().includes(search.toLowerCase()));

  const totalCerts = divers.flatMap(d => d.certifications);
  const expiringCount = totalCerts.filter((c: { status: string }) => c.status === "expiring").length;
  const expiredCount = totalCerts.filter((c: { status: string }) => c.status === "expired").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando mergulhadores...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 pb-3 text-center">
          <p className="text-2xl font-bold">{divers.length}</p>
          <p className="text-xs text-muted-foreground">Mergulhadores</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center">
          <p className="text-2xl font-bold text-success">{totalCerts.filter((c: { status: string }) => c.status === "valid").length}</p>
          <p className="text-xs text-muted-foreground">Certificados Válidos</p>
        </CardContent></Card>
        <Card className={expiringCount > 0 ? "border-warning/50 bg-warning/5" : ""}><CardContent className="pt-4 pb-3 text-center">
          <p className="text-2xl font-bold text-warning">{expiringCount}</p>
          <p className="text-xs text-muted-foreground">Vencendo</p>
        </CardContent></Card>
        <Card className={expiredCount > 0 ? "border-destructive/50 bg-destructive/5" : ""}><CardContent className="pt-4 pb-3 text-center">
          <p className="text-2xl font-bold text-destructive">{expiredCount}</p>
          <p className="text-xs text-muted-foreground">⚠️ Vencidos</p>
        </CardContent></Card>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input placeholder="Buscar mergulhador..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9" />
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> Novo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Mergulhador</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Nome completo" value={newDiver.name} onChange={e => setNewDiver({ ...newDiver, name: e.target.value })} />
              <Input placeholder="Função (ex: Mergulhador SAT)" value={newDiver.role} onChange={e => setNewDiver({ ...newDiver, role: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Horas SAT" value={newDiver.sat_hours} onChange={e => setNewDiver({ ...newDiver, sat_hours: Number(e.target.value) })} />
                <Input type="number" placeholder="Total Mergulhos" value={newDiver.total_dives} onChange={e => setNewDiver({ ...newDiver, total_dives: Number(e.target.value) })} />
              </div>
              <Button className="w-full" onClick={() => addMutation.mutate(newDiver)} disabled={addMutation.isPending || !newDiver.name}>
                {addMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Registrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => quickExport(divers || [], "PEOTRAM Diver Certs")}>
          <Download className="h-3.5 w-3.5" /> Exportar
        </Button>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Nenhum mergulhador encontrado. Registre o primeiro.</p>
      )}

      {filtered.map(diver => (
        <Card key={diver.id}>
          <CardContent className="pt-4 pb-3 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{diver.name}</h4>
                <p className="text-xs text-muted-foreground">{diver.role}</p>
              </div>
              <Badge variant={diver.fitness_status === "fit" ? "default" : diver.fitness_status === "restricted" ? "secondary" : "destructive"} className="text-xs">
                {diver.fitness_status === "fit" ? "✅ Apto" : diver.fitness_status === "restricted" ? "⚠️ Restrição" : "❌ Inapto"}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-muted/50 rounded p-2">
                <p className="font-bold text-lg">{diver.sat_hours.toLocaleString()}</p>
                <p className="text-muted-foreground">Horas SAT</p>
              </div>
              <div className="bg-muted/50 rounded p-2">
                <p className="font-bold text-lg">{diver.total_dives}</p>
                <p className="text-muted-foreground">Total Mergulhos</p>
              </div>
              <div className="bg-muted/50 rounded p-2">
                <p className="font-bold text-lg">{diver.last_medical ? new Date(diver.last_medical).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }) : "—"}</p>
                <p className="text-muted-foreground">Último Médico</p>
              </div>
            </div>

            {diver.certifications.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Certificações:</p>
                {diver.certifications.map((cert: { name: string; issuer: string; number: string; expiry: string; status: "valid" | "expiring" | "expired" }, i: number) => (
                  <div key={i} className={`flex items-center justify-between p-2 rounded border text-xs ${STATUS_COLOR[cert.status] || ""}`}>
                    <div>
                      <p className="font-medium">{cert.name}</p>
                      <p className="opacity-70">{cert.issuer} • {cert.number}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {cert.status === "valid" ? "✅" : cert.status === "expiring" ? "⚠️" : "❌"}{" "}
                        {new Date(cert.expiry).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
