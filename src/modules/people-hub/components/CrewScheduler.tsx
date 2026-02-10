/**
 * CrewScheduler - Agendador de Tripulação Premium
 * Gestão de escalas, rotações e embarques
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, Users, Ship, Clock, AlertTriangle, CheckCircle2,
  ArrowRightLeft, Plane, Hotel, FileText, Search, Filter,
  Plus, ArrowRight, MapPin, Brain, TrendingUp, UserPlus,
  CalendarDays, Timer, Anchor
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useCrewRealData, type CrewMemberData } from "@/hooks/useCrewRealData";
import { EmptyState } from "@/components/ui/UXStates";

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  department: string;
  vessel: string;
  status: "onboard" | "on-leave" | "standby" | "traveling";
  embarkedDate: string;
  plannedDisembark: string;
  daysOnboard: number;
  maxDays: number;
  nextRotation?: string;
  certifications: number;
  expiringCerts: number;
}

interface Rotation {
  id: string;
  type: "embark" | "disembark" | "transfer";
  crewMember: string;
  rank: string;
  vessel: string;
  port: string;
  date: string;
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "delayed";
  flight?: string;
  hotel?: string;
}

function StatusBadge({ status }: { status: CrewMember["status"] }) {
  const config = {
    onboard: { label: "A Bordo", className: "bg-success/10 text-success" },
    "on-leave": { label: "Férias", className: "bg-primary/10 text-primary" },
    standby: { label: "Standby", className: "bg-warning/10 text-warning" },
    traveling: { label: "Em Viagem", className: "bg-cyan-500/10 text-cyan-600" },
  };
  const c = config[status];
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
}

function RotationTypeBadge({ type }: { type: Rotation["type"] }) {
  const config = {
    embark: { label: "Embarque", className: "bg-success/10 text-success", icon: Anchor },
    disembark: { label: "Desembarque", className: "bg-primary/10 text-primary", icon: Plane },
    transfer: { label: "Transferência", className: "bg-warning/10 text-warning", icon: ArrowRightLeft },
  };
  const c = config[type];
  return (
    <Badge variant="outline" className={c.className}>
      <c.icon className="h-3 w-3 mr-1" />
      {c.label}
    </Badge>
  );
}

function CrewCard({ crew, onViewProfile, onPlanRotation }: { crew: CrewMember; onViewProfile: (crew: CrewMember) => void; onPlanRotation: (crew: CrewMember) => void }) {
  const daysPercent = (crew.daysOnboard / crew.maxDays) * 100;
  const isOverdue = crew.daysOnboard > crew.maxDays * 0.9;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border hover:border-primary/50 hover:bg-accent/30 transition-all"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {crew.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{crew.name}</h4>
              <p className="text-sm text-muted-foreground">{crew.rank} • {crew.department}</p>
            </div>
            <StatusBadge status={crew.status} />
          </div>
          
          {crew.status === "onboard" && (
            <>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <Ship className="h-3 w-3 text-muted-foreground" />
                <span>{crew.vessel}</span>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={isOverdue ? "text-destructive font-medium" : ""}>
                    {crew.daysOnboard} / {crew.maxDays} dias
                  </span>
                  <span className="text-muted-foreground">
                    Desemb: {crew.plannedDisembark}
                  </span>
                </div>
                <Progress 
                  value={Math.min(daysPercent, 100)} 
                  className={`h-2 ${isOverdue ? "[&>div]:bg-destructive" : daysPercent > 75 ? "[&>div]:bg-warning" : ""}`}
                />
              </div>
            </>
          )}
          
          {crew.status === "standby" && crew.nextRotation && (
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Próximo embarque: {crew.nextRotation}
            </div>
          )}

          {crew.expiringCerts > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-warning">
              <AlertTriangle className="h-3 w-3" />
              {crew.expiringCerts} certificado(s) vencendo
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => onViewProfile(crew)}>
          <FileText className="h-3 w-3" />
          Perfil
        </Button>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => onPlanRotation(crew)}>
          <ArrowRightLeft className="h-3 w-3" />
          Rotação
        </Button>
      </div>
    </motion.div>
  );
}

function RotationCard({ rotation, onViewDetails, onConfirm }: { rotation: Rotation; onViewDetails: (rotation: Rotation) => void; onConfirm: (rotation: Rotation) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 rounded-lg border hover:bg-accent/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <RotationTypeBadge type={rotation.type} />
            <Badge variant="outline">{rotation.status}</Badge>
          </div>
          <h4 className="font-medium mt-2">{rotation.crewMember}</h4>
          <p className="text-sm text-muted-foreground">{rotation.rank}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Ship className="h-3 w-3" />
              {rotation.vessel}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {rotation.port}
            </span>
          </div>
          {(rotation.flight || rotation.hotel) && (
            <div className="flex items-center gap-4 mt-2 text-xs">
              {rotation.flight && (
                <span className="flex items-center gap-1 text-primary">
                  <Plane className="h-3 w-3" />
                  {rotation.flight}
                </span>
              )}
              {rotation.hotel && (
                <span className="flex items-center gap-1 text-warning">
                  <Hotel className="h-3 w-3" />
                  {rotation.hotel}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="font-medium">{rotation.date}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => onViewDetails(rotation)}>
          Detalhes
        </Button>
        {rotation.status === "scheduled" && (
          <Button size="sm" className="gap-1" onClick={() => onConfirm(rotation)}>
            <CheckCircle2 className="h-3 w-3" />
            Confirmar
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function CrewScheduler() {
  const [activeTab, setActiveTab] = useState("crew");
  const [searchTerm, setSearchTerm] = useState("");
  const { data: realData, isLoading } = useCrewRealData();
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedRotation, setSelectedRotation] = useState<Rotation | null>(null);
  const [showRotationDialog, setShowRotationDialog] = useState(false);

  // Map real data to component format
  const crewMembers: CrewMember[] = useMemo(() => {
    return (realData?.crew || []).map(c => ({
      id: c.id,
      name: c.name,
      rank: c.rank,
      department: c.department,
      vessel: c.vessel,
      status: c.status,
      embarkedDate: c.embarkedDate,
      plannedDisembark: c.plannedDisembark,
      daysOnboard: c.daysOnboard,
      maxDays: c.maxDays,
      certifications: c.certCount,
      expiringCerts: c.expiringCerts,
    }));
  }, [realData]);

  // Derive upcoming rotations from crew approaching limits
  const upcomingRotations: Rotation[] = useMemo(() => {
    return crewMembers
      .filter(c => c.status === "onboard" && c.daysOnboard > c.maxDays * 0.75)
      .map(c => ({
        id: c.id,
        type: "disembark" as const,
        crewMember: c.name,
        rank: c.rank,
        vessel: c.vessel,
        port: "A definir",
        date: c.plannedDisembark || "A definir",
        status: c.daysOnboard > c.maxDays * 0.9 ? "scheduled" as const : "confirmed" as const,
      }));
  }, [crewMembers]);

  const stats = {
    onboard: crewMembers.filter(c => c.status === "onboard").length,
    standby: crewMembers.filter(c => c.status === "standby").length,
    onLeave: crewMembers.filter(c => c.status === "on-leave").length,
    upcomingRotations: upcomingRotations.length,
    overdueCrews: crewMembers.filter(c => c.daysOnboard > c.maxDays * 0.9).length,
  };

  const handleViewProfile = (crew: CrewMember) => {
    setSelectedCrew(crew);
    setShowDetailDialog(true);
  };

  const handlePlanRotation = (crew: CrewMember) => {
    setSelectedRotation({
      id: crew.id,
      type: "disembark",
      crewMember: crew.name,
      rank: crew.rank,
      vessel: crew.vessel,
      port: "A definir",
      date: crew.plannedDisembark || "A definir",
      status: "scheduled",
    });
    setShowRotationDialog(true);
  };

  const handleConfirmRotation = (rotation: Rotation) => {
    toast.success(`Rotação de ${rotation.crewMember} confirmada para ${rotation.date}`);
  };

  const handleViewRotationDetails = (rotation: Rotation) => {
    setSelectedRotation(rotation);
    setShowRotationDialog(true);
  };

  const handleNewRotation = () => {
    setSelectedRotation(null);
    setShowRotationDialog(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (crewMembers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum tripulante cadastrado"
        message="Cadastre tripulantes para gerenciar escalas, rotações e conformidade MLC."
        actionLabel="Cadastrar Tripulante"
        onAction={() => { window.history.pushState({}, '', '/workbench?tab=people'); window.dispatchEvent(new PopStateEvent('popstate')); toast.success("Navegando para People Hub"); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">A Bordo</p>
                <p className="text-2xl font-bold text-success">{stats.onboard}</p>
              </div>
              <Anchor className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Standby</p>
                <p className="text-2xl font-bold text-warning">{stats.standby}</p>
              </div>
              <Timer className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Férias</p>
                <p className="text-2xl font-bold">{stats.onLeave}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Rotações</p>
                <p className="text-2xl font-bold text-cyan-600">{stats.upcomingRotations}</p>
              </div>
              <ArrowRightLeft className="h-8 w-8 text-cyan-500 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">MLC Crítico</p>
                <p className="text-2xl font-bold text-destructive">{stats.overdueCrews}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestion */}
      <Card className="border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <Brain className="h-6 w-6 text-purple-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Sugestão IA de Rotação</h4>
              <p className="text-sm text-muted-foreground">
                2 tripulantes atingirão limite MLC em 10 dias. 
                Sugestão: agendar rotação em Santos (02/15) para otimizar custos de logística.
              </p>
            </div>
            <Button variant="outline" className="gap-2" onClick={handleNewRotation}>
              <UserPlus className="h-4 w-4" />
              Planejar Rotação
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Gestão de Tripulação
              </CardTitle>
              <CardDescription>Escalas, rotações e conformidade MLC</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Buscar tripulante..." 
                className="w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button className="gap-2" onClick={handleNewRotation}>
                <Plus className="h-4 w-4" />
                Nova Rotação
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="crew">Tripulação</TabsTrigger>
              <TabsTrigger value="rotations">
                Rotações ({upcomingRotations.length})
              </TabsTrigger>
              <TabsTrigger value="calendar">Calendário</TabsTrigger>
              <TabsTrigger value="compliance">Conformidade MLC</TabsTrigger>
            </TabsList>

            <TabsContent value="crew">
              <ScrollArea className="h-[500px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {crewMembers.map((crew) => (
                    <CrewCard key={crew.id} crew={crew} onViewProfile={handleViewProfile} onPlanRotation={handlePlanRotation} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="rotations">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {upcomingRotations.map((rotation) => (
                    <RotationCard key={rotation.id} rotation={rotation} onViewDetails={handleViewRotationDetails} onConfirm={handleConfirmRotation} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="calendar">
              <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Calendário de Rotações</p>
                <p className="text-sm">Use a aba "Rotações" para gerenciar escalas atuais.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setActiveTab("rotations")}>
                  Abrir Calendário Operacional
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="compliance">
              <div className="space-y-4">
                {crewMembers.filter(c => c.daysOnboard > c.maxDays * 0.75).length > 0 ? (
                  crewMembers.filter(c => c.daysOnboard > c.maxDays * 0.75).map(c => (
                    <div key={c.id} className="p-4 rounded-lg border flex items-center justify-between">
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-sm text-muted-foreground">{c.rank} • {c.vessel}</p>
                        <p className="text-xs text-destructive mt-1">{c.daysOnboard}/{c.maxDays} dias a bordo</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handlePlanRotation(c)}>
                        Planejar Rotação
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Conformidade MLC OK</p>
                    <p className="text-sm">Todos os tripulantes dentro dos limites de dias a bordo.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Profile Dialog */}
      {selectedCrew && showDetailDialog && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Perfil - {selectedCrew.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Posto</p><p className="font-medium">{selectedCrew.rank}</p></div>
                <div><p className="text-xs text-muted-foreground">Departamento</p><p className="font-medium">{selectedCrew.department}</p></div>
                <div><p className="text-xs text-muted-foreground">Embarcação</p><p className="font-medium">{selectedCrew.vessel}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={selectedCrew.status} /></div>
                <div><p className="text-xs text-muted-foreground">Dias a Bordo</p><p className="font-medium">{selectedCrew.daysOnboard} / {selectedCrew.maxDays}</p></div>
                <div><p className="text-xs text-muted-foreground">Desembarque</p><p className="font-medium">{selectedCrew.plannedDisembark || "N/A"}</p></div>
                <div><p className="text-xs text-muted-foreground">Certificações</p><p className="font-medium">{selectedCrew.certifications}</p></div>
                <div><p className="text-xs text-muted-foreground">Vencendo</p><p className={`font-medium ${selectedCrew.expiringCerts > 0 ? 'text-warning' : ''}`}>{selectedCrew.expiringCerts}</p></div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Rotation Dialog */}
      {showRotationDialog && (
        <Dialog open={showRotationDialog} onOpenChange={setShowRotationDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                {selectedRotation ? `Rotação - ${selectedRotation.crewMember}` : "Nova Rotação"}
              </DialogTitle>
            </DialogHeader>
            {selectedRotation ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground">Tripulante</p><p className="font-medium">{selectedRotation.crewMember}</p></div>
                  <div><p className="text-xs text-muted-foreground">Posto</p><p className="font-medium">{selectedRotation.rank}</p></div>
                  <div><p className="text-xs text-muted-foreground">Embarcação</p><p className="font-medium">{selectedRotation.vessel}</p></div>
                  <div><p className="text-xs text-muted-foreground">Porto</p><p className="font-medium">{selectedRotation.port}</p></div>
                  <div><p className="text-xs text-muted-foreground">Data</p><p className="font-medium">{selectedRotation.date}</p></div>
                  <div><p className="text-xs text-muted-foreground">Status</p><Badge variant="outline">{selectedRotation.status}</Badge></div>
                </div>
                {selectedRotation.status === "scheduled" && (
                  <Button className="w-full" onClick={() => {
                    handleConfirmRotation(selectedRotation);
                    setShowRotationDialog(false);
                  }}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirmar Rotação
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Selecione um tripulante na aba "Tripulação" e clique em "Rotação" para planejar.</p>
                <Button variant="outline" className="w-full" onClick={() => {
                  setShowRotationDialog(false);
                  setActiveTab("crew");
                }}>
                  Ir para Tripulação
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
