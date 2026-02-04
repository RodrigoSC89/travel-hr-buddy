/**
 * CrewScheduler - Agendador de Tripulação Premium
 * Gestão de escalas, rotações e embarques
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, Users, Ship, Clock, AlertTriangle, CheckCircle2,
  ArrowRightLeft, Plane, Hotel, FileText, Search, Filter,
  Plus, ArrowRight, MapPin, Brain, TrendingUp, UserPlus,
  CalendarDays, Timer, Anchor
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

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

const crewMembers: CrewMember[] = [
  { id: "1", name: "Carlos Silva", rank: "Comandante", department: "Deck", vessel: "MV Atlântico Sul", status: "onboard", embarkedDate: "2025-11-15", plannedDisembark: "2026-02-15", daysOnboard: 82, maxDays: 120, certifications: 12, expiringCerts: 1 },
  { id: "2", name: "João Santos", rank: "Chefe de Máquinas", department: "Engine", vessel: "MV Atlântico Sul", status: "onboard", embarkedDate: "2025-12-01", plannedDisembark: "2026-03-01", daysOnboard: 65, maxDays: 90, certifications: 15, expiringCerts: 0 },
  { id: "3", name: "Maria Costa", rank: "1º Oficial", department: "Deck", vessel: "MV Horizonte", status: "onboard", embarkedDate: "2025-10-20", plannedDisembark: "2026-02-20", daysOnboard: 107, maxDays: 120, certifications: 10, expiringCerts: 2 },
  { id: "4", name: "Pedro Oliveira", rank: "2º Oficial", department: "Deck", vessel: "MV Oceano", status: "standby", embarkedDate: "", plannedDisembark: "", daysOnboard: 0, maxDays: 120, nextRotation: "2026-02-10", certifications: 8, expiringCerts: 0 },
  { id: "5", name: "Ana Ferreira", rank: "Cozinheira", department: "Catering", vessel: "MV Atlântico Sul", status: "on-leave", embarkedDate: "", plannedDisembark: "", daysOnboard: 0, maxDays: 90, nextRotation: "2026-02-25", certifications: 5, expiringCerts: 1 },
];

const upcomingRotations: Rotation[] = [
  { id: "1", type: "disembark", crewMember: "Roberto Dias", rank: "Imediato", vessel: "MV Atlântico Sul", port: "Santos", date: "2026-02-10", status: "confirmed", flight: "LA3456", hotel: "Ibis Santos" },
  { id: "2", type: "embark", crewMember: "Pedro Oliveira", rank: "2º Oficial", vessel: "MV Oceano", port: "Santos", date: "2026-02-10", status: "scheduled", flight: "LA3458" },
  { id: "3", type: "transfer", crewMember: "Lucas Mendes", rank: "Marinheiro", vessel: "MV Horizonte → MV Pacífico", port: "Rotterdam", date: "2026-02-12", status: "scheduled" },
  { id: "4", type: "disembark", crewMember: "Carlos Silva", rank: "Comandante", vessel: "MV Atlântico Sul", port: "Santos", date: "2026-02-15", status: "scheduled", flight: "LA3460", hotel: "Hilton Santos" },
];

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

function CrewCard({ crew }: { crew: CrewMember }) {
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
        <Button size="sm" variant="outline" className="flex-1 gap-1">
          <FileText className="h-3 w-3" />
          Perfil
        </Button>
        <Button size="sm" variant="outline" className="gap-1">
          <ArrowRightLeft className="h-3 w-3" />
          Rotação
        </Button>
      </div>
    </motion.div>
  );
}

function RotationCard({ rotation }: { rotation: Rotation }) {
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
        <Button size="sm" variant="outline" className="flex-1 gap-1">
          Detalhes
        </Button>
        {rotation.status === "scheduled" && (
          <Button size="sm" className="gap-1">
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

  const stats = {
    onboard: crewMembers.filter(c => c.status === "onboard").length,
    standby: crewMembers.filter(c => c.status === "standby").length,
    onLeave: crewMembers.filter(c => c.status === "on-leave").length,
    upcomingRotations: upcomingRotations.filter(r => r.status === "scheduled").length,
    overdueCrews: crewMembers.filter(c => c.daysOnboard > c.maxDays * 0.9).length,
  };

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
            <Button variant="outline" className="gap-2">
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
              <Button className="gap-2">
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
                    <CrewCard key={crew.id} crew={crew} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="rotations">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {upcomingRotations.map((rotation) => (
                    <RotationCard key={rotation.id} rotation={rotation} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="calendar">
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Calendário de Rotações</p>
                <p className="text-sm">Visualização em calendário em desenvolvimento</p>
              </div>
            </TabsContent>

            <TabsContent value="compliance">
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Dashboard de Conformidade MLC</p>
                <p className="text-sm">Monitoramento de horas de trabalho e descanso</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
