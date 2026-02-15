import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Settings, AlertTriangle, CheckCircle, Wrench, XCircle, Search } from "lucide-react";

const SYSTEM_TYPES = [
  { id: "all", label: "Todos", icon: "⚙️" },
  { id: "power", label: "Energia", icon: "⚡" },
  { id: "propulsion", label: "Propulsão", icon: "🔩" },
  { id: "reference", label: "Referência", icon: "📡" },
  { id: "sensors", label: "Sensores", icon: "🌊" },
  { id: "control", label: "Controle DP", icon: "🖥️" },
  { id: "communication", label: "Comunicação", icon: "📻" },
  { id: "fire_safety", label: "Incêndio", icon: "🧯" },
  { id: "navigation", label: "Navegação", icon: "🧭" },
];

const STATUS_CONFIG = {
  operational: { label: "Operacional", color: "bg-green-500", icon: CheckCircle, badge: "default" as const },
  degraded: { label: "Degradado", color: "bg-amber-500", icon: AlertTriangle, badge: "secondary" as const },
  failed: { label: "Falha", color: "bg-red-500", icon: XCircle, badge: "destructive" as const },
  maintenance: { label: "Manutenção", color: "bg-blue-500", icon: Wrench, badge: "outline" as const },
};

interface Equipment {
  id: string;
  name: string;
  system_type: string;
  status: keyof typeof STATUS_CONFIG;
  manufacturer: string;
  model: string;
  serial_number: string;
  last_calibration: string;
  next_calibration: string;
  status_notes: string;
  maintenance_count: number;
}

const MOCK_EQUIPMENT: Equipment[] = [
  { id: "1", name: "Main Generator #1", system_type: "power", status: "operational", manufacturer: "Caterpillar", model: "CAT 3516C", serial_number: "CAT-2024-001", last_calibration: "2025-11-15", next_calibration: "2026-05-15", status_notes: "", maintenance_count: 12 },
  { id: "2", name: "Main Generator #2", system_type: "power", status: "operational", manufacturer: "Caterpillar", model: "CAT 3516C", serial_number: "CAT-2024-002", last_calibration: "2025-11-15", next_calibration: "2026-05-15", status_notes: "", maintenance_count: 11 },
  { id: "3", name: "Emergency Generator", system_type: "power", status: "degraded", manufacturer: "Caterpillar", model: "CAT 3412", serial_number: "CAT-2024-003", last_calibration: "2025-09-01", next_calibration: "2026-03-01", status_notes: "Vibração acima do normal", maintenance_count: 8 },
  { id: "4", name: "Bow Thruster #1", system_type: "propulsion", status: "operational", manufacturer: "Rolls-Royce", model: "TT 2200", serial_number: "RR-2024-001", last_calibration: "2025-10-20", next_calibration: "2026-04-20", status_notes: "", maintenance_count: 6 },
  { id: "5", name: "Bow Thruster #2", system_type: "propulsion", status: "operational", manufacturer: "Rolls-Royce", model: "TT 2200", serial_number: "RR-2024-002", last_calibration: "2025-10-20", next_calibration: "2026-04-20", status_notes: "", maintenance_count: 7 },
  { id: "6", name: "Stern Thruster", system_type: "propulsion", status: "maintenance", manufacturer: "Rolls-Royce", model: "TT 1800", serial_number: "RR-2024-003", last_calibration: "2025-08-10", next_calibration: "2026-02-10", status_notes: "Manutenção programada - selo", maintenance_count: 9 },
  { id: "7", name: "DGPS Fugro Starfix", system_type: "reference", status: "operational", manufacturer: "Fugro", model: "Starfix.HP", serial_number: "FUG-2024-001", last_calibration: "2025-12-01", next_calibration: "2026-06-01", status_notes: "", maintenance_count: 3 },
  { id: "8", name: "HiPAP 501", system_type: "reference", status: "operational", manufacturer: "Kongsberg", model: "HiPAP 501", serial_number: "KON-2024-001", last_calibration: "2025-11-20", next_calibration: "2026-05-20", status_notes: "", maintenance_count: 4 },
  { id: "9", name: "Fanbeam Mk4", system_type: "reference", status: "operational", manufacturer: "Renishaw", model: "Fanbeam Mk4", serial_number: "REN-2024-001", last_calibration: "2025-10-15", next_calibration: "2026-04-15", status_notes: "", maintenance_count: 2 },
  { id: "10", name: "Gyrocompass #1", system_type: "sensors", status: "operational", manufacturer: "Sperry Marine", model: "NAVIGAT X MK2", serial_number: "SPR-2024-001", last_calibration: "2025-11-01", next_calibration: "2026-05-01", status_notes: "", maintenance_count: 5 },
  { id: "11", name: "MRU Seatex", system_type: "sensors", status: "operational", manufacturer: "Kongsberg Seatex", model: "MRU 5+", serial_number: "KS-2024-001", last_calibration: "2025-12-10", next_calibration: "2026-06-10", status_notes: "", maintenance_count: 2 },
  { id: "12", name: "DP Control System", system_type: "control", status: "operational", manufacturer: "Kongsberg", model: "K-Pos DP-22", serial_number: "KON-DP-001", last_calibration: "2025-10-01", next_calibration: "2026-04-01", status_notes: "", maintenance_count: 3 },
  { id: "13", name: "PMS - Power Management", system_type: "control", status: "operational", manufacturer: "ABB", model: "PGMS-800", serial_number: "ABB-2024-001", last_calibration: "2025-09-15", next_calibration: "2026-03-15", status_notes: "", maintenance_count: 4 },
  { id: "14", name: "UPS DP Console", system_type: "power", status: "operational", manufacturer: "APC", model: "Smart-UPS 3000", serial_number: "APC-2024-001", last_calibration: "2025-11-01", next_calibration: "2026-05-01", status_notes: "", maintenance_count: 1 },
  { id: "15", name: "Fire & Gas Detection", system_type: "fire_safety", status: "operational", manufacturer: "Consilium", model: "Salwico", serial_number: "CON-2024-001", last_calibration: "2025-12-05", next_calibration: "2026-06-05", status_notes: "", maintenance_count: 6 },
];

export function DPEquipmentManager() {
  const [selectedSystem, setSelectedSystem] = useState("all");
  const [equipment, setEquipment] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [searchTerm, setSearchTerm] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = equipment.filter(eq => {
    const matchSystem = selectedSystem === "all" || eq.system_type === selectedSystem;
    const matchSearch = !searchTerm || eq.name.toLowerCase().includes(searchTerm.toLowerCase()) || eq.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSystem && matchSearch;
  });

  const stats = {
    total: equipment.length,
    operational: equipment.filter(e => e.status === "operational").length,
    degraded: equipment.filter(e => e.status === "degraded").length,
    failed: equipment.filter(e => e.status === "failed").length,
    maintenance: equipment.filter(e => e.status === "maintenance").length,
  };

  const redundancyScore = Math.round((stats.operational / stats.total) * 100);

  const updateStatus = (id: string, newStatus: keyof typeof STATUS_CONFIG) => {
    setEquipment(prev => prev.map(eq => eq.id === id ? { ...eq, status: newStatus } : eq));
    toast.success(`Status atualizado para ${STATUS_CONFIG[newStatus].label}`);
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-3xl font-bold text-primary">{redundancyScore}%</p>
            <p className="text-xs text-muted-foreground">Redundância DP</p>
          </CardContent>
        </Card>
        {(["operational", "degraded", "failed", "maintenance"] as const).map(s => {
          const cfg = STATUS_CONFIG[s];
          return (
            <Card key={s}>
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-2xl font-bold">{stats[s]}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${cfg.color}`} /> {cfg.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {SYSTEM_TYPES.map(s => (
          <Button key={s.id} size="sm" variant={selectedSystem === s.id ? "default" : "outline"}
            onClick={() => setSelectedSystem(s.id)} className="gap-1 text-xs">
            <span>{s.icon}</span> {s.label}
          </Button>
        ))}
        <div className="ml-auto flex gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 h-9 w-48 text-sm" />
          </div>
          <Button size="sm" className="gap-1" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Adicionar
          </Button>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(eq => {
          const cfg = STATUS_CONFIG[eq.status];
          const IconComp = cfg.icon;
          const daysToCalibration = eq.next_calibration ? Math.ceil((new Date(eq.next_calibration).getTime() - Date.now()) / 86400000) : null;
          const calibrationUrgent = daysToCalibration !== null && daysToCalibration <= 30;

          return (
            <Card key={eq.id} className={`transition-all ${eq.status === "failed" ? "border-destructive/50 bg-destructive/5" : eq.status === "degraded" ? "border-warning/50 bg-warning/5" : ""}`}>
              <CardContent className="pt-4 pb-3 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">{eq.name}</h4>
                    <p className="text-xs text-muted-foreground">{eq.manufacturer} • {eq.model}</p>
                    <p className="text-xs text-muted-foreground">S/N: {eq.serial_number}</p>
                  </div>
                  <Badge variant={cfg.badge} className="gap-1 text-xs">
                    <IconComp className="h-3 w-3" /> {cfg.label}
                  </Badge>
                </div>

                {eq.status_notes && (
                  <p className="text-xs text-warning bg-warning/10 rounded px-2 py-1">{eq.status_notes}</p>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className={calibrationUrgent ? "text-destructive font-medium" : "text-muted-foreground"}>
                    {calibrationUrgent ? "⚠️" : "📅"} Próx. calibração: {eq.next_calibration ? new Date(eq.next_calibration).toLocaleDateString("pt-BR") : "N/D"}
                    {daysToCalibration !== null && ` (${daysToCalibration}d)`}
                  </span>
                  <span className="text-muted-foreground">{eq.maintenance_count} manutenções</span>
                </div>

                <div className="flex gap-1">
                  {(["operational", "degraded", "failed", "maintenance"] as const).map(s => {
                    const sc = STATUS_CONFIG[s];
                    return (
                      <Button key={s} size="sm" variant={eq.status === s ? "default" : "ghost"}
                        className={`flex-1 text-xs h-7 ${eq.status === s ? sc.color + " text-white hover:" + sc.color + "/90" : ""}`}
                        onClick={() => updateStatus(eq.id, s)}>
                        {s === "operational" ? "✅" : s === "degraded" ? "⚠️" : s === "failed" ? "❌" : "🔧"}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum equipamento encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
