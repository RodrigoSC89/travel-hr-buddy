/**
 * Crew Training Matrix - STCW Compliance Component
 * Matriz visual de treinamentos da tripulação
 */
 
import React, { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  GraduationCap,
  Search,
  Filter,
  Download,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Calendar,
  Ship,
  User,
  BookOpen,
  Award,
  Sparkles,
  Plus,
  Eye,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  vessel: string;
  department: string;
}

interface Training {
  id: string;
  code: string;
  name: string;
  category: "STCW" | "MLC" | "Company" | "Safety" | "Technical";
  mandatory: boolean;
}

interface TrainingRecord {
  crewId: string;
  trainingId: string;
  status: "completed" | "expired" | "expiring" | "pending" | "scheduled" | "not_applicable";
  completedDate?: string;
  expiryDate?: string;
  score?: number;
}

// Fallback data - used when no Supabase data available
const fallbackCrew: CrewMember[] = [
  { id: "1", name: "João Silva", rank: "Master", vessel: "MV Atlântico Sul", department: "Deck" },
  { id: "2", name: "Maria Santos", rank: "Chief Officer", vessel: "MV Atlântico Sul", department: "Deck" },
  { id: "3", name: "Pedro Costa", rank: "2nd Officer", vessel: "MV Horizonte", department: "Deck" },
  { id: "4", name: "Ana Lima", rank: "Chief Engineer", vessel: "MV Oceano", department: "Engine" },
  { id: "5", name: "Carlos Mendes", rank: "2nd Engineer", vessel: "MV Pacífico", department: "Engine" },
];

const fallbackTrainings: Training[] = [
  { id: "t1", code: "BST", name: "Basic Safety Training", category: "STCW", mandatory: true },
  { id: "t2", code: "PSCRB", name: "Proficiency in Survival Craft", category: "STCW", mandatory: true },
  { id: "t3", code: "AFF", name: "Advanced Fire Fighting", category: "STCW", mandatory: true },
  { id: "t4", code: "MFA", name: "Medical First Aid", category: "STCW", mandatory: true },
  { id: "t5", code: "GMDSS", name: "GMDSS Operator", category: "STCW", mandatory: false },
  { id: "t6", code: "BRM", name: "Bridge Resource Management", category: "STCW", mandatory: true },
  { id: "t7", code: "ERM", name: "Engine Resource Management", category: "STCW", mandatory: true },
  { id: "t8", code: "SSO", name: "Ship Security Officer", category: "Safety", mandatory: false },
  { id: "t9", code: "MLC", name: "MLC 2006 Awareness", category: "MLC", mandatory: true },
  { id: "t10", code: "HACCP", name: "Food Safety HACCP", category: "Company", mandatory: false },
];

const fallbackRecords: TrainingRecord[] = [];

const statusConfig = {
  completed: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Concluído" },
  expired: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Expirado" },
  expiring: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", label: "Expirando" },
  pending: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted", label: "Pendente" },
  scheduled: { icon: Calendar, color: "text-primary", bg: "bg-primary/10", label: "Agendado" },
  not_applicable: { icon: null, color: "text-muted-foreground/30", bg: "bg-transparent", label: "N/A" },
};

function StatusCell({ record }: { record?: TrainingRecord }) {
  if (!record) {
    return (
      <div className="w-10 h-10 rounded-md bg-muted/30 flex items-center justify-center">
        <span className="text-muted-foreground/30">-</span>
      </div>
    );
  }

  const config = statusConfig[record.status];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "w-10 h-10 rounded-md flex items-center justify-center cursor-pointer transition-all hover:scale-110",
              config.bg
            )}
          >
            {Icon && <Icon className={cn("h-5 w-5", config.color)} />}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{config.label}</p>
            {record.completedDate && (
              <p className="text-xs text-muted-foreground">
                Concluído: {new Date(record.completedDate).toLocaleDateString("pt-BR")}
              </p>
            )}
            {record.expiryDate && (
              <p className="text-xs text-muted-foreground">
                Expira: {new Date(record.expiryDate).toLocaleDateString("pt-BR")}
              </p>
            )}
            {record.score && (
              <p className="text-xs">
                Nota: <span className="font-medium">{record.score}%</span>
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function CrewTrainingMatrix() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [vesselFilter, setVesselFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
  const [crewData, setCrewData] = useState<CrewMember[]>(fallbackCrew);
  const [trainingData] = useState<Training[]>(fallbackTrainings);
  const [recordsData, setRecordsData] = useState<TrainingRecord[]>(fallbackRecords);

  useEffect(() => {
    async function loadFromSupabase() {
      const { data: members } = await supabase
        .from("crew_members")
        .select("id, first_name, last_name, rank, department, vessel_id, vessels(name)")
        .limit(50);
      if (members && members.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- crew_members select with joined vessels
        setCrewData(members.map((m: any) => ({
          id: String(m.id),
          name: `${String(m.first_name || "")} ${String(m.last_name || "")}`.trim(),
          rank: String(m.rank || "Crew"),
          vessel: m.vessels?.name ? String(m.vessels.name) : "Unassigned",
          department: String(m.department || "Deck"),
        })));
      }
      const { data: certs } = await supabase
        .from("crew_certifications")
        .select("id, crew_member_id, certificate_name, issue_date, expiry_date, status")
        .limit(200);
      if (certs && certs.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- crew_certifications dynamic schema
        const records: TrainingRecord[] = certs.map((c: any) => {
          const now = new Date();
          const expiry = c.expiry_date ? new Date(c.expiry_date) : null;
          let status: TrainingRecord["status"] = "completed";
          if (expiry && expiry < now) status = "expired";
          else if (expiry && expiry.getTime() - now.getTime() < 90 * 86400000) status = "expiring";
          return {
            crewId: String(c.crew_member_id),
            trainingId: String(c.certificate_name || c.id),
            status,
            completedDate: c.issue_date ? String(c.issue_date).slice(0, 10) : undefined,
            expiryDate: c.expiry_date ? String(c.expiry_date).slice(0, 10) : undefined,
          };
        });
        setRecordsData(records);
      }
    }
    loadFromSupabase();
  }, []);

  // Filter crew
  const filteredCrew = useMemo(() => {
    return crewData.filter((crew: CrewMember) => {
      const matchesSearch = crew.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crew.rank.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = departmentFilter === "all" || crew.department === departmentFilter;
      const matchesVessel = vesselFilter === "all" || crew.vessel === vesselFilter;
      return matchesSearch && matchesDepartment && matchesVessel;
    });
  }, [searchTerm, departmentFilter, vesselFilter, crewData]);

  // Filter trainings
  const filteredTrainings = useMemo(() => {
    return trainingData.filter((training: Training) => {
      return categoryFilter === "all" || training.category === categoryFilter;
    });
  }, [categoryFilter, trainingData]);

  // Get record for crew+training
  const getRecord = (crewId: string, trainingId: string) => {
    return recordsData.find((r: TrainingRecord) => r.crewId === crewId && r.trainingId === trainingId);
  };

  // Calculate compliance stats
  const stats = useMemo(() => {
    const total = filteredCrew.length * filteredTrainings.filter((t: Training) => t.mandatory).length;
    const completed = recordsData.filter((r: TrainingRecord) => 
      r.status === "completed" && 
      filteredCrew.some((c: CrewMember) => c.id === r.crewId) &&
      filteredTrainings.some((t: Training) => t.id === r.trainingId && t.mandatory)
    ).length;
    const expiring = recordsData.filter((r: TrainingRecord) => 
      r.status === "expiring" &&
      filteredCrew.some((c: CrewMember) => c.id === r.crewId)
    ).length;
    const expired = recordsData.filter((r: TrainingRecord) => 
      r.status === "expired" &&
      filteredCrew.some((c: CrewMember) => c.id === r.crewId)
    ).length;

    return {
      compliance: total > 0 ? Math.round((completed / total) * 100) : 0,
      completed,
      expiring,
      expired,
      total,
    };
  }, [filteredCrew, filteredTrainings, recordsData]);

  const departments = [...new Set(crewData.map((c: CrewMember) => c.department))];
  const vessels = [...new Set(crewData.map((c: CrewMember) => c.vessel))];
  const categories = [...new Set(trainingData.map((t: Training) => t.category))];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Compliance Geral</p>
                <p className="text-2xl font-bold text-primary">{stats.compliance}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-60" />
            </div>
            <Progress value={stats.compliance} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-success">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Expirando</p>
                <p className="text-2xl font-bold text-warning">{stats.expiring}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Expirados</p>
                <p className="text-2xl font-bold text-destructive">{stats.expired}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tripulante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Depts</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={vesselFilter} onValueChange={setVesselFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Embarcação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Embarcações</SelectItem>
                {vessels.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Matrix */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Matriz de Treinamentos STCW
              </CardTitle>
              <CardDescription>
                {filteredCrew.length} tripulantes • {filteredTrainings.length} treinamentos
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                </div>
                <span>Concluído</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="h-3 w-3 text-warning" />
                </div>
                <span>Expirando</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-3 w-3 text-destructive" />
                </div>
                <span>Expirado</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-3 w-3 text-primary" />
                </div>
                <span>Agendado</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-muted flex items-center justify-center">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                </div>
                <span>Pendente</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="flex border-b pb-2 mb-2">
                <div className="w-52 flex-shrink-0 font-medium text-sm">Tripulante</div>
                {filteredTrainings.map((training) => (
                  <TooltipProvider key={training.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-12 flex-shrink-0 text-center">
                          <div className="text-xs font-medium truncate">{training.code}</div>
                          {training.mandatory && (
                            <Badge variant="outline" className="text-[10px] px-1 mt-0.5">
                              Obr.
                            </Badge>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{training.name}</p>
                        <p className="text-xs text-muted-foreground">{training.category}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>

              {/* Rows */}
              <div className="space-y-1">
                {filteredCrew.map((crew) => (
                  <motion.div
                    key={crew.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center hover:bg-muted/50 rounded-lg p-1 cursor-pointer"
                    onClick={() => setSelectedCrew(crew)}
                  >
                    <div className="w-52 flex-shrink-0">
                      <p className="font-medium text-sm">{crew.name}</p>
                      <p className="text-xs text-muted-foreground">{crew.rank} • {crew.vessel}</p>
                    </div>
                    {filteredTrainings.map((training) => (
                      <div key={training.id} className="w-12 flex-shrink-0 flex justify-center">
                        <StatusCell record={getRecord(crew.id, training.id)} />
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Crew Detail Dialog */}
      <Dialog open={!!selectedCrew} onOpenChange={() => setSelectedCrew(null)}>
        <DialogContent className="max-w-2xl">
          {selectedCrew && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <span>{selectedCrew.name}</span>
                    <p className="text-sm font-normal text-muted-foreground">
                      {selectedCrew.rank} • {selectedCrew.vessel}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-3 text-center">
                      <p className="text-2xl font-bold text-success">
                        {recordsData.filter((r: TrainingRecord) => r.crewId === selectedCrew.id && r.status === "completed").length}
                      </p>
                      <p className="text-xs text-muted-foreground">Concluídos</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <p className="text-2xl font-bold text-warning">
                        {recordsData.filter((r: TrainingRecord) => r.crewId === selectedCrew.id && r.status === "expiring").length}
                      </p>
                      <p className="text-xs text-muted-foreground">Expirando</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <p className="text-2xl font-bold text-destructive">
                        {recordsData.filter((r: TrainingRecord) => r.crewId === selectedCrew.id && r.status === "expired").length}
                      </p>
                      <p className="text-xs text-muted-foreground">Expirados</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-sm">Treinamentos</p>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {trainingData.map((training: Training) => {
                        const record = getRecord(selectedCrew.id, training.id);
                        const config = record ? statusConfig[record.status] : statusConfig.pending;
                        const Icon = config.icon || Clock;
                        return (
                          <div key={training.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2 rounded-lg", config.bg)}>
                                <Icon className={cn("h-4 w-4", config.color)} />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{training.name}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">{training.code}</Badge>
                                  <Badge variant="secondary" className="text-xs">{training.category}</Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className={config.color}>{config.label}</Badge>
                              {record?.expiryDate && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Exp: {new Date(record.expiryDate).toLocaleDateString("pt-BR")}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 gap-2">
                    <Plus className="h-4 w-4" />
                    Agendar Treinamento
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
