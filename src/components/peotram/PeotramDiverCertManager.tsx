import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, AlertTriangle, CheckCircle, Clock, Search, Download } from "lucide-react";

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

const MOCK_DIVERS: Diver[] = [
  {
    id: "1", name: "Carlos Mendes", role: "Supervisor de Mergulho", sat_hours: 4200, total_dives: 890, last_medical: "2025-09-15", medical_valid: true, fitness_status: "fit",
    certifications: [
      { name: "IMCA Diving Supervisor", issuer: "IMCA", number: "DS-2024-0142", issued: "2023-06-15", expiry: "2028-06-15", status: "valid" },
      { name: "HSE Saturation Diving", issuer: "HSE UK", number: "HSE-SAT-889", issued: "2022-03-10", expiry: "2027-03-10", status: "valid" },
      { name: "STCW Basic Safety", issuer: "DPC", number: "STCW-2024-4421", issued: "2024-01-20", expiry: "2029-01-20", status: "valid" },
      { name: "First Aid at Work", issuer: "HSE UK", number: "FA-2024-112", issued: "2024-06-01", expiry: "2027-06-01", status: "valid" },
    ],
  },
  {
    id: "2", name: "André Santos", role: "Mergulhador SAT", sat_hours: 2800, total_dives: 620, last_medical: "2025-11-20", medical_valid: true, fitness_status: "fit",
    certifications: [
      { name: "IMCA Diver (SAT)", issuer: "IMCA", number: "SAT-2024-0255", issued: "2023-09-01", expiry: "2028-09-01", status: "valid" },
      { name: "HSE Saturation Diving", issuer: "HSE UK", number: "HSE-SAT-945", issued: "2023-01-15", expiry: "2028-01-15", status: "valid" },
      { name: "NDT Level II", issuer: "CSWIP", number: "NDT-2024-078", issued: "2024-03-10", expiry: "2026-03-10", status: "expiring" },
    ],
  },
  {
    id: "3", name: "Roberto Lima", role: "Mergulhador SAT", sat_hours: 1500, total_dives: 380, last_medical: "2025-06-10", medical_valid: true, fitness_status: "fit",
    certifications: [
      { name: "IMCA Diver (SAT)", issuer: "IMCA", number: "SAT-2024-0301", issued: "2024-02-20", expiry: "2029-02-20", status: "valid" },
      { name: "HSE Air Diving", issuer: "HSE UK", number: "HSE-AIR-1102", issued: "2021-08-15", expiry: "2026-08-15", status: "valid" },
    ],
  },
  {
    id: "4", name: "Paulo Ferreira", role: "LST (Life Support Technician)", sat_hours: 0, total_dives: 0, last_medical: "2025-04-01", medical_valid: true, fitness_status: "restricted",
    certifications: [
      { name: "IMCA LST", issuer: "IMCA", number: "LST-2024-0089", issued: "2023-11-01", expiry: "2028-11-01", status: "valid" },
      { name: "Gas Analysis", issuer: "Analox", number: "GA-2025-045", issued: "2025-01-10", expiry: "2026-01-10", status: "expiring" },
      { name: "DMAC Medical", issuer: "DMAC", number: "DMAC-2024-022", issued: "2024-05-15", expiry: "2025-11-15", status: "expired" },
    ],
  },
];

const STATUS_COLOR = {
  valid: "border-green-500 text-green-600 bg-green-500/10",
  expiring: "border-amber-500 text-amber-600 bg-amber-500/10",
  expired: "border-red-500 text-red-600 bg-red-500/10",
};

export function PeotramDiverCertManager() {
  const [divers] = useState(MOCK_DIVERS);
  const [search, setSearch] = useState("");

  const filtered = divers.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.role.toLowerCase().includes(search.toLowerCase()));

  const totalCerts = divers.flatMap(d => d.certifications);
  const expiringCount = totalCerts.filter(c => c.status === "expiring").length;
  const expiredCount = totalCerts.filter(c => c.status === "expired").length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">{divers.length}</p>
            <p className="text-xs text-muted-foreground">Mergulhadores</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-green-600">{totalCerts.filter(c => c.status === "valid").length}</p>
            <p className="text-xs text-muted-foreground">Certificados Válidos</p>
          </CardContent>
        </Card>
        <Card className={expiringCount > 0 ? "border-warning/50 bg-warning/5" : ""}>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-warning">{expiringCount}</p>
            <p className="text-xs text-muted-foreground">Vencendo</p>
          </CardContent>
        </Card>
        <Card className={expiredCount > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-destructive">{expiredCount}</p>
            <p className="text-xs text-muted-foreground">⚠️ Vencidos</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input placeholder="Buscar mergulhador..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9" />
        </div>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => toast.success("Relatório exportado!")}>
          <Download className="h-3.5 w-3.5" /> Exportar
        </Button>
      </div>

      {/* Divers */}
      {filtered.map(diver => (
        <Card key={diver.id}>
          <CardContent className="pt-4 pb-3 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{diver.name}</h4>
                <p className="text-xs text-muted-foreground">{diver.role}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={diver.fitness_status === "fit" ? "default" : diver.fitness_status === "restricted" ? "secondary" : "destructive"} className="text-xs">
                  {diver.fitness_status === "fit" ? "✅ Apto" : diver.fitness_status === "restricted" ? "⚠️ Restrição" : "❌ Inapto"}
                </Badge>
              </div>
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
                <p className="font-bold text-lg">{new Date(diver.last_medical).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })}</p>
                <p className="text-muted-foreground">Último Médico</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Certificações:</p>
              {diver.certifications.map((cert, i) => (
                <div key={i} className={`flex items-center justify-between p-2 rounded border text-xs ${STATUS_COLOR[cert.status]}`}>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
