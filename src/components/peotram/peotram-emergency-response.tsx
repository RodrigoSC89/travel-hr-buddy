import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Siren,
  Phone,
  MapPin,
  Clock,
  Users,
  Activity,
  Radio,
  Shield,
  Zap,
  Heart,
  Flame,
  Waves,
  Plus,
} from "lucide-react";

interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  department: string;
  priority: "primary" | "secondary" | "backup";
}

interface EmergencyProcedure {
  id: string;
  title: string;
  type: "fire" | "medical" | "collision" | "pollution" | "security" | "weather";
  description: string;
  steps: string[];
  contacts: string[];
  resources: string[];
  lastUpdated: string;
}

interface EmergencyIncident {
  id: string;
  type: "fire" | "medical" | "collision" | "pollution" | "security" | "weather";
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "contained" | "resolved";
  location: string;
  description: string;
  reportedBy: string;
  reportedAt: string;
  respondedAt?: string;
  resolvedAt?: string;
}

export const PeotramEmergencyResponse: React.FC = () => {
  const [incidents, setIncidents] = useState<EmergencyIncident[]>(getDemoIncidents());
  const [contacts, setContacts] = useState<EmergencyContact[]>(getDemoContacts());
  const [procedures, setProcedures] = useState<EmergencyProcedure[]>(getDemoProcedures());
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState(false);

  function getDemoIncidents(): EmergencyIncident[] {
    return [
      {
        id: "INC001",
        type: "fire",
        severity: "high",
        status: "active",
        location: "Deck Principal - Seção 3",
        description: "Princípio de incêndio detectado no sistema elétrico",
        reportedBy: "João Silva",
        reportedAt: "2024-01-22T10:30:00Z",
      },
      {
        id: "INC002",
        type: "medical",
        severity: "medium",
        status: "contained",
        location: "Praça de Máquinas",
        description: "Tripulante com ferimento no braço",
        reportedBy: "Maria Santos",
        reportedAt: "2024-01-22T08:15:00Z",
        respondedAt: "2024-01-22T08:18:00Z",
      },
    ];
  }

  function getDemoContacts(): EmergencyContact[] {
    return [
      {
        id: "CONT001",
        name: "Capitão Roberto Silva",
        role: "Comandante",
        phone: "+55 11 99999-0001",
        email: "capitao@embarcacao.com",
        department: "Comando",
        priority: "primary",
      },
      {
        id: "CONT002",
        name: "Enfermeiro Carlos Lima",
        role: "Responsável Médico",
        phone: "+55 11 99999-0002",
        email: "medico@embarcacao.com",
        department: "Saúde",
        priority: "primary",
      },
    ];
  }

  function getDemoProcedures(): EmergencyProcedure[] {
    return [
      {
        id: "PROC001",
        title: "Combate a Incêndio",
        type: "fire",
        description: "Procedimento padrão para combate a incêndios em embarcações",
        steps: [
          "Acionar alarme geral",
          "Comunicar à ponte de comando",
          "Isolar área afetada",
          "Utilizar equipamentos de combate apropriados",
          "Avaliar necessidade de abandono",
        ],
        contacts: ["CONT001", "CONT002"],
        resources: ["Extintores CO2", "Mangueiras", "Equipamentos de proteção"],
        lastUpdated: "2024-01-15",
      },
    ];
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/20 text-warning border-warning/30";
      case "low":
        return "bg-info/20 text-info border-info/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-success/20 text-success border-success/30";
      case "contained":
        return "bg-warning/20 text-warning border-warning/30";
      case "active":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "fire":
        return <Flame className="w-4 h-4" />;
      case "medical":
        return <Heart className="w-4 h-4" />;
      case "collision":
        return <Zap className="w-4 h-4" />;
      case "pollution":
        return <Waves className="w-4 h-4" />;
      case "security":
        return <Shield className="w-4 h-4" />;
      case "weather":
        return <Activity className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Resposta a Emergências</h2>
          <p className="text-muted-foreground">
            Gestão de incidentes e procedimentos de emergência
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="destructive">
            <Siren className="w-4 h-4 mr-2" />
            Alarme Geral
          </Button>
          <Dialog open={isNewIncidentOpen} onOpenChange={setIsNewIncidentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Reportar Incidente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Reportar Novo Incidente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="incident-type">Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de incidente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fire">Incêndio</SelectItem>
                        <SelectItem value="medical">Médico</SelectItem>
                        <SelectItem value="collision">Colisão</SelectItem>
                        <SelectItem value="pollution">Poluição</SelectItem>
                        <SelectItem value="security">Segurança</SelectItem>
                        <SelectItem value="weather">Clima</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incident-severity">Severidade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Nível de severidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incident-location">Localização</Label>
                  <Input id="incident-location" placeholder="Local do incidente" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incident-description">Descrição</Label>
                  <Textarea id="incident-description" placeholder="Descreva o incidente" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewIncidentOpen(false)}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={() => setIsNewIncidentOpen(false)}>
                    Reportar Emergência
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="incidents">Incidentes Ativos</TabsTrigger>
          <TabsTrigger value="procedures">Procedimentos</TabsTrigger>
          <TabsTrigger value="contacts">Contatos</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incidents.map(incident => (
              <Card key={incident.id} className="border-l-4 border-l-destructive">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(incident.type)}
                      <CardTitle className="text-lg">{incident.id}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{incident.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{incident.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(incident.reportedAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{incident.reportedBy}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Radio className="w-3 h-3 mr-1" />
                      Comunicar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Activity className="w-3 h-3 mr-1" />
                      Atualizar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="procedures" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {procedures.map(procedure => (
              <Card key={procedure.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(procedure.type)}
                    <CardTitle className="text-lg">{procedure.title}</CardTitle>
                  </div>
                  <CardDescription>{procedure.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Passos do Procedimento:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {procedure.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Ver Detalhes
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Iniciar Procedimento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contacts.map(contact => (
              <Card key={contact.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{contact.name}</CardTitle>
                  <CardDescription>{contact.role}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{contact.phone}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{contact.department}</div>
                  <Badge
                    variant="outline"
                    className={
                      contact.priority === "primary"
                        ? "bg-success/20 text-success border-success/30"
                        : contact.priority === "secondary"
                          ? "bg-warning/20 text-warning border-warning/30"
                          : "bg-muted/20 text-muted-foreground border-muted/30"
                    }
                  >
                    {contact.priority}
                  </Badge>
                  <Button variant="outline" size="sm" className="w-full">
                    <Phone className="w-3 h-3 mr-1" />
                    Ligar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="text-center p-8">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Recursos de Emergência</h3>
            <p className="text-muted-foreground mb-4">
              Gerencie equipamentos e recursos disponíveis para emergências
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Recurso
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
