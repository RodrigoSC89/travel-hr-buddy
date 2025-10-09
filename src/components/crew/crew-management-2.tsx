import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Calendar,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  BookOpen,
  Shield,
  Heart,
  Briefcase,
  FileText,
  Bell,
} from "lucide-react";

interface CrewMember {
  id: string;
  name: string;
  position: string;
  vessel: string;
  status: "active" | "onleave" | "training" | "standby";
  certifications: {
    name: string;
    status: "valid" | "expiring" | "expired";
    expiryDate: string;
    daysRemaining: number;
  }[];
  schedule: {
    currentCycle: string;
    daysOnboard: number;
    daysRemaining: number;
    nextRotation: string;
  };
  performance: {
    score: number;
    trend: "up" | "down" | "stable";
    incidents: number;
    commendations: number;
  };
  health: {
    lastCheckup: string;
    status: "fit" | "restricted" | "pending";
    restrictions?: string[];
  };
  training: {
    completed: number;
    pending: number;
    nextTraining?: string;
  };
}

export const CrewManagement2: React.FC = () => {
  const [crew, setCrew] = useState<CrewMember[]>([
    {
      id: "1",
      name: "João Silva",
      position: "Capitão",
      vessel: "MV-Atlas",
      status: "active",
      certifications: [
        { name: "STCW Master", status: "valid", expiryDate: "2025-12-10", daysRemaining: 220 },
        { name: "DP Advanced", status: "expiring", expiryDate: "2025-08-20", daysRemaining: 110 },
        { name: "ISM Code", status: "valid", expiryDate: "2026-03-15", daysRemaining: 345 },
      ],
      schedule: {
        currentCycle: "28/28 dias",
        daysOnboard: 18,
        daysRemaining: 10,
        nextRotation: "2025-05-22",
      },
      performance: {
        score: 94,
        trend: "up",
        incidents: 0,
        commendations: 3,
      },
      health: {
        lastCheckup: "2025-03-10",
        status: "fit",
      },
      training: {
        completed: 12,
        pending: 2,
        nextTraining: "Leadership Avançado - 2025-06-01",
      },
    },
    {
      id: "2",
      name: "Maria Santos",
      position: "Chefe de Máquinas",
      vessel: "MV-Neptune",
      status: "active",
      certifications: [
        {
          name: "STCW Chief Engineer",
          status: "valid",
          expiryDate: "2026-02-20",
          daysRemaining: 310,
        },
        {
          name: "Diesel Maintenance",
          status: "expiring",
          expiryDate: "2025-06-15",
          daysRemaining: 45,
        },
        {
          name: "Safety Management",
          status: "valid",
          expiryDate: "2025-11-30",
          daysRemaining: 200,
        },
      ],
      schedule: {
        currentCycle: "21/21 dias",
        daysOnboard: 15,
        daysRemaining: 6,
        nextRotation: "2025-05-18",
      },
      performance: {
        score: 89,
        trend: "stable",
        incidents: 1,
        commendations: 2,
      },
      health: {
        lastCheckup: "2025-04-02",
        status: "fit",
      },
      training: {
        completed: 10,
        pending: 3,
        nextTraining: "Automação de Sistemas - 2025-05-25",
      },
    },
    {
      id: "3",
      name: "Pedro Oliveira",
      position: "Imediato",
      vessel: "MV-Poseidon",
      status: "training",
      certifications: [
        { name: "STCW Officer", status: "valid", expiryDate: "2025-07-22", daysRemaining: 80 },
        { name: "DP Basic", status: "expired", expiryDate: "2025-04-01", daysRemaining: -10 },
        { name: "First Aid", status: "valid", expiryDate: "2025-10-08", daysRemaining: 155 },
      ],
      schedule: {
        currentCycle: "28/28 dias",
        daysOnboard: 0,
        daysRemaining: 28,
        nextRotation: "2025-06-10",
      },
      performance: {
        score: 85,
        trend: "up",
        incidents: 0,
        commendations: 1,
      },
      health: {
        lastCheckup: "2025-03-20",
        status: "fit",
      },
      training: {
        completed: 8,
        pending: 4,
        nextTraining: "Em andamento - DP Advanced Certification",
      },
    },
    {
      id: "4",
      name: "Ana Costa",
      position: "Oficial de Náutica",
      vessel: "MV-Atlas",
      status: "active",
      certifications: [
        { name: "STCW Navigation", status: "valid", expiryDate: "2025-09-18", daysRemaining: 135 },
        { name: "ARPA/RADAR", status: "valid", expiryDate: "2026-06-30", daysRemaining: 420 },
        { name: "Medical Care", status: "expiring", expiryDate: "2025-05-30", daysRemaining: 28 },
      ],
      schedule: {
        currentCycle: "28/28 dias",
        daysOnboard: 22,
        daysRemaining: 6,
        nextRotation: "2025-05-18",
      },
      performance: {
        score: 91,
        trend: "stable",
        incidents: 0,
        commendations: 2,
      },
      health: {
        lastCheckup: "2025-04-05",
        status: "fit",
      },
      training: {
        completed: 11,
        pending: 1,
        nextTraining: "Meteorologia Avançada - 2025-06-15",
      },
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-600";
      case "onleave":
        return "bg-blue-600";
      case "training":
        return "bg-purple-600";
      case "standby":
        return "bg-yellow-600";
      default:
        return "bg-gray-600";
    }
  };

  const getCertStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "default";
      case "expiring":
        return "secondary";
      case "expired":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "fit":
        return "text-green-600";
      case "restricted":
        return "text-yellow-600";
      case "pending":
        return "text-orange-600";
      default:
        return "text-muted-foreground";
    }
  };

  const totalCrew = crew.length;
  const activeCrew = crew.filter(c => c.status === "active").length;
  const expiringCerts = crew.reduce(
    (sum, c) =>
      sum +
      c.certifications.filter(cert => cert.status === "expiring" || cert.status === "expired")
        .length,
    0
  );
  const avgPerformance = Math.round(
    crew.reduce((sum, c) => sum + c.performance.score, 0) / crew.length
  );

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Tripulantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCrew}</div>
            <p className="text-xs text-muted-foreground">{activeCrew} ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Performance Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPerformance}%</div>
            <p className="text-xs text-muted-foreground">Score geral</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Certificações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{expiringCerts}</div>
            <p className="text-xs text-muted-foreground">Vencendo/Vencidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Treinamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {crew.reduce((sum, c) => sum + c.training.pending, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Crew Management 2.0
              </CardTitle>
              <CardDescription>
                Gestão completa de tripulação, escalas, certificações e performance
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Planejar Escala
              </Button>
              <Button size="sm">
                <Users className="h-4 w-4 mr-2" />
                Adicionar Tripulante
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="certifications">Certificações</TabsTrigger>
              <TabsTrigger value="schedules">Escalas</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="health">Saúde</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {crew.map(member => (
                <Card key={member.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{member.name}</CardTitle>
                            <Badge className={getStatusColor(member.status)}>
                              {member.status.toUpperCase()}
                            </Badge>
                          </div>
                          <CardDescription className="mt-1">
                            {member.position} - {member.vessel}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{member.performance.score}%</div>
                        <div className="text-xs text-muted-foreground">Performance</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <Calendar className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                        <div className="text-sm font-bold">
                          {member.schedule.daysOnboard}/{member.schedule.daysRemaining}
                        </div>
                        <div className="text-xs text-muted-foreground">Dias</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <Award className="h-4 w-4 mx-auto mb-1 text-yellow-600" />
                        <div className="text-sm font-bold">{member.certifications.length}</div>
                        <div className="text-xs text-muted-foreground">Certificados</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <BookOpen className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                        <div className="text-sm font-bold">
                          {member.training.completed}/{member.training.pending}
                        </div>
                        <div className="text-xs text-muted-foreground">Treinamentos</div>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <Heart
                          className={`h-4 w-4 mx-auto mb-1 ${getHealthStatusColor(member.health.status)}`}
                        />
                        <div className="text-sm font-bold">
                          {member.health.status.toUpperCase()}
                        </div>
                        <div className="text-xs text-muted-foreground">Saúde</div>
                      </div>
                    </div>

                    {/* Alerts */}
                    {(member.certifications.some(c => c.status !== "valid") ||
                      member.training.pending > 0) && (
                      <div className="space-y-2">
                        {member.certifications
                          .filter(c => c.status !== "valid")
                          .map((cert, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950 rounded-lg"
                            >
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm flex-1">
                                {cert.name} -{" "}
                                {cert.status === "expired"
                                  ? "Vencida"
                                  : `Vence em ${cert.daysRemaining} dias`}
                              </span>
                              <Button size="sm" variant="outline">
                                Renovar
                              </Button>
                            </div>
                          ))}
                        {member.training.pending > 0 && (
                          <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <Bell className="h-4 w-4 text-blue-600" />
                            <span className="text-sm flex-1">
                              {member.training.pending} treinamento(s) pendente(s)
                            </span>
                            <Button size="sm" variant="outline">
                              Ver
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <FileText className="h-4 w-4 mr-2" />
                        Dossiê Completo
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Escala
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Award className="h-4 w-4 mr-2" />
                        Certificações
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="certifications" className="mt-4">
              <div className="space-y-4">
                {crew.map(member => (
                  <Card key={member.id}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {member.name} - {member.position}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {member.certifications.map((cert, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Shield className="h-5 w-5 text-blue-600" />
                              <div>
                                <div className="font-medium text-sm">{cert.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  Vencimento:{" "}
                                  {new Date(cert.expiryDate).toLocaleDateString("pt-BR")}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {cert.daysRemaining > 0
                                    ? `${cert.daysRemaining} dias`
                                    : "Vencida"}
                                </div>
                              </div>
                              <Badge variant={getCertStatusColor(cert.status) as any}>
                                {cert.status.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schedules" className="mt-4">
              <div className="space-y-4">
                {crew.map(member => (
                  <Card key={member.id}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {member.name} - Ciclo {member.schedule.currentCycle}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Dias Embarcado</div>
                          <div className="text-2xl font-bold">{member.schedule.daysOnboard}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Dias Restantes</div>
                          <div className="text-2xl font-bold">{member.schedule.daysRemaining}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Próxima Rotação</div>
                          <div className="text-lg font-medium">
                            {new Date(member.schedule.nextRotation).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                      </div>
                      <Progress
                        value={
                          (member.schedule.daysOnboard /
                            (member.schedule.daysOnboard + member.schedule.daysRemaining)) *
                          100
                        }
                        className="h-3"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="mt-4">
              <div className="space-y-4">
                {crew.map(member => (
                  <Card key={member.id}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>
                          {member.name} - {member.position}
                        </span>
                        <Badge
                          className={
                            member.performance.score >= 90
                              ? "bg-green-600"
                              : member.performance.score >= 75
                                ? "bg-blue-600"
                                : "bg-yellow-600"
                          }
                        >
                          {member.performance.score}%
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                          <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                          <div className="text-2xl font-bold">
                            {member.performance.commendations}
                          </div>
                          <div className="text-xs text-muted-foreground">Elogios</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                          <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-600" />
                          <div className="text-2xl font-bold">{member.performance.incidents}</div>
                          <div className="text-xs text-muted-foreground">Incidentes</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                          <div className="text-lg font-bold">
                            {member.performance.trend.toUpperCase()}
                          </div>
                          <div className="text-xs text-muted-foreground">Tendência</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="health" className="mt-4">
              <div className="space-y-4">
                {crew.map(member => (
                  <Card key={member.id}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>{member.name}</span>
                        <Badge
                          className={
                            member.health.status === "fit"
                              ? "bg-green-600"
                              : member.health.status === "restricted"
                                ? "bg-yellow-600"
                                : "bg-orange-600"
                          }
                        >
                          {member.health.status.toUpperCase()}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Heart
                              className={`h-5 w-5 ${getHealthStatusColor(member.health.status)}`}
                            />
                            <div>
                              <div className="font-medium text-sm">Último Exame</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(member.health.lastCheckup).toLocaleDateString("pt-BR")}
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Agendar Novo
                          </Button>
                        </div>
                        {member.health.restrictions && (
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                            <div className="font-medium text-sm mb-2">Restrições:</div>
                            <ul className="text-sm space-y-1">
                              {member.health.restrictions.map((r, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                  {r}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrewManagement2;
