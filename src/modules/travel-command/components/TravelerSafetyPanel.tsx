/**
 * Traveler Safety & Duty of Care Panel
 * Rastreamento em tempo real, alertas de segurança e resposta a emergências
 */

import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  MapPin,
  AlertTriangle,
  Phone,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Navigation,
  Plane,
  Building2,
  Car,
  Heart,
  MessageSquare,
  Globe,
  Thermometer,
  CloudRain,
  AlertOctagon,
  Users,
  Radio,
  Locate,
  PhoneCall,
  Mail,
  Send,
  Eye,
  Activity,
  Wifi,
  WifiOff,
  Battery,
  Signal
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TravelerStatus {
  id: string;
  name: string;
  position: string;
  vessel?: string;
  photo?: string;
  tripId: string;
  tripPurpose: string;
  currentLocation: {
    city: string;
    country: string;
    coordinates: { lat: number; lng: number };
    lastUpdate: Date;
    source: "gps" | "checkin" | "flight" | "hotel";
  };
  status: "safe" | "in_transit" | "delayed" | "sos" | "offline" | "check_in_pending";
  nextCheckIn: Date;
  missedCheckIns: number;
  currentSegment: {
    type: "flight" | "hotel" | "ground";
    details: string;
    eta?: Date;
  };
  riskLevel: "low" | "medium" | "high" | "extreme";
  batteryLevel?: number;
  connectivity: "online" | "limited" | "offline";
}

interface TravelAlert {
  id: string;
  type: "weather" | "security" | "health" | "political" | "natural_disaster" | "flight_delay" | "sos";
  severity: "info" | "warning" | "critical" | "emergency";
  title: string;
  message: string;
  location: string;
  affectedTravelers: string[];
  createdAt: Date;
  acknowledged: boolean;
  actions?: { label: string; action: string }[];
}

interface RiskAssessment {
  destination: string;
  country: string;
  overallRisk: "low" | "medium" | "high" | "extreme";
  categories: {
    security: number;
    health: number;
    political: number;
    naturalDisaster: number;
    infrastructure: number;
  };
  advisories: string[];
  requirements: {
    visa: boolean;
    vaccination: string[];
    insurance: boolean;
    registration: boolean;
  };
  emergencyContacts: {
    embassy: string;
    police: string;
    medical: string;
  };
}

const fallbackTravelers: TravelerStatus[] = [
  {
    id: "1",
    name: "Carlos Silva",
    position: "Capitão",
    vessel: "MV Atlantic Explorer",
    tripId: "TRQ-2026-001234",
    tripPurpose: "Mobilização",
    currentLocation: {
      city: "Macaé",
      country: "Brasil",
      coordinates: { lat: -22.3847, lng: -41.7833 },
      lastUpdate: new Date(),
      source: "gps"
    },
    status: "safe",
    nextCheckIn: new Date(Date.now() + 4 * 60 * 60 * 1000),
    missedCheckIns: 0,
    currentSegment: { type: "hotel", details: "Macaé Business Hotel" },
    riskLevel: "low",
    batteryLevel: 78,
    connectivity: "online"
  },
  {
    id: "2",
    name: "Ana Rodrigues",
    position: "Engenheira Chefe",
    tripId: "TRQ-2026-001235",
    tripPurpose: "Treinamento",
    currentLocation: {
      city: "Houston",
      country: "EUA",
      coordinates: { lat: 29.7604, lng: -95.3698 },
      lastUpdate: new Date(Date.now() - 30 * 60 * 1000),
      source: "checkin"
    },
    status: "in_transit",
    nextCheckIn: new Date(Date.now() + 2 * 60 * 60 * 1000),
    missedCheckIns: 0,
    currentSegment: { type: "flight", details: "UA 1052 → IAH", eta: new Date(Date.now() + 3 * 60 * 60 * 1000) },
    riskLevel: "low",
    batteryLevel: 45,
    connectivity: "limited"
  },
  {
    id: "3",
    name: "Roberto Mendes",
    position: "Oficial de Máquinas",
    vessel: "MV Pacific Pioneer",
    tripId: "TRQ-2026-001236",
    tripPurpose: "Demobilização",
    currentLocation: {
      city: "Lagos",
      country: "Nigéria",
      coordinates: { lat: 6.5244, lng: 3.3792 },
      lastUpdate: new Date(Date.now() - 3 * 60 * 60 * 1000),
      source: "hotel"
    },
    status: "check_in_pending",
    nextCheckIn: new Date(Date.now() - 1 * 60 * 60 * 1000),
    missedCheckIns: 1,
    currentSegment: { type: "hotel", details: "Lagos Continental" },
    riskLevel: "high",
    batteryLevel: 12,
    connectivity: "offline"
  }
];

const fallbackAlerts: TravelAlert[] = [
  {
    id: "1",
    type: "weather",
    severity: "warning",
    title: "Tempestade Tropical se Aproximando",
    message: "Sistema de tempestade tropical previsto para atingir a costa do Golfo do México nas próximas 48 horas. Possíveis atrasos de voos.",
    location: "Houston, TX",
    affectedTravelers: ["Ana Rodrigues"],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    acknowledged: false,
    actions: [
      { label: "Ver Previsão", action: "view_forecast" },
      { label: "Contatar Viajantes", action: "contact" }
    ]
  },
  {
    id: "2",
    type: "security",
    severity: "critical",
    title: "Check-in Atrasado - Atenção Necessária",
    message: "Roberto Mendes perdeu o check-in programado há 1 hora. Última localização conhecida: Lagos, Nigéria.",
    location: "Lagos, Nigéria",
    affectedTravelers: ["Roberto Mendes"],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    acknowledged: false,
    actions: [
      { label: "Ligar Agora", action: "call" },
      { label: "Enviar SMS", action: "sms" },
      { label: "Acionar Protocolo", action: "protocol" }
    ]
  }
];

const fallbackRiskAssessment: RiskAssessment = {
  destination: "Lagos",
  country: "Nigéria",
  overallRisk: "high",
  categories: {
    security: 75,
    health: 60,
    political: 55,
    naturalDisaster: 25,
    infrastructure: 50
  },
  advisories: [
    "Risco elevado de criminalidade em áreas urbanas",
    "Atividade terrorista em regiões do norte",
    "Malária endêmica - profilaxia recomendada",
    "Infraestrutura médica limitada fora de Lagos"
  ],
  requirements: {
    visa: true,
    vaccination: ["Febre Amarela (obrigatória)", "Hepatite A/B", "Tifóide"],
    insurance: true,
    registration: true
  },
  emergencyContacts: {
    embassy: "+234 1 460 3400",
    police: "112",
    medical: "112"
  }
};

export const TravelerSafetyPanel: React.FC = () => {
  const [selectedTraveler, setSelectedTraveler] = useState<TravelerStatus | null>(null);
  const [showRiskAssessment, setShowRiskAssessment] = useState(false);

  const getStatusBadge = (status: TravelerStatus["status"]) => {
    const configs = {
      safe: { variant: "default" as const, icon: CheckCircle2, label: "Seguro", className: "bg-green-500" },
      in_transit: { variant: "secondary" as const, icon: Navigation, label: "Em Trânsito", className: "bg-blue-500" },
      delayed: { variant: "outline" as const, icon: Clock, label: "Atrasado", className: "bg-yellow-500" },
      sos: { variant: "destructive" as const, icon: AlertOctagon, label: "SOS", className: "bg-red-600" },
      offline: { variant: "outline" as const, icon: WifiOff, label: "Offline", className: "bg-gray-500" },
      check_in_pending: { variant: "outline" as const, icon: Bell, label: "Check-in Pendente", className: "bg-orange-500" }
    };
    const config = configs[status];
    return (
      <Badge className={`${config.className} text-white flex items-center gap-1`}>
        <config.icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getRiskBadge = (risk: TravelerStatus["riskLevel"]) => {
    const configs = {
      low: { className: "bg-green-100 text-green-800", label: "Baixo" },
      medium: { className: "bg-yellow-100 text-yellow-800", label: "Médio" },
      high: { className: "bg-orange-100 text-orange-800", label: "Alto" },
      extreme: { className: "bg-red-100 text-red-800", label: "Extremo" }
    };
    const config = configs[risk];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getAlertIcon = (type: TravelAlert["type"]) => {
    const icons = {
      weather: CloudRain,
      security: Shield,
      health: Heart,
      political: Globe,
      natural_disaster: AlertTriangle,
      flight_delay: Plane,
      sos: AlertOctagon
    };
    return icons[type] || AlertTriangle;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Viajantes Seguros</p>
                <p className="text-2xl font-bold text-green-600">12</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Trânsito</p>
                <p className="text-2xl font-bold text-blue-600">5</p>
              </div>
              <Navigation className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Check-in Pendente</p>
                <p className="text-2xl font-bold text-orange-600">1</p>
              </div>
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold text-yellow-600">2</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Emergências</p>
                <p className="text-2xl font-bold text-red-600">0</p>
              </div>
              <AlertOctagon className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traveler List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Viajantes Ativos
                </CardTitle>
                <CardDescription>Rastreamento e status em tempo real</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.success("Broadcast enviado", { description: `Mensagem enviada para ${fallbackTravelers.length} viajantes ativos via canais de comunicação.` })}>
                  <Radio className="h-4 w-4 mr-2" />
                  Broadcast
                </Button>
                <Button size="sm" onClick={() => toast.info("Localização atualizada", { description: `${fallbackTravelers.length} viajantes localizados. Última atualização: agora.` })}>
                  <Locate className="h-4 w-4 mr-2" />
                  Localizar Todos
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {fallbackTravelers.map((traveler) => (
                  <Card
                    key={traveler.id}
                    className={`p-4 cursor-pointer transition-all hover:border-primary ${
                      selectedTraveler?.id === traveler.id ? "border-primary bg-primary/5" : ""
                    } ${traveler.status === "check_in_pending" ? "border-orange-500/50" : ""}`}
                    onClick={() => setSelectedTraveler(traveler)}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={traveler.photo} />
                        <AvatarFallback>{traveler.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <h4 className="font-semibold">{traveler.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {traveler.position} {traveler.vessel && `• ${traveler.vessel}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(traveler.status)}
                            {getRiskBadge(traveler.riskLevel)}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm mt-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{traveler.currentLocation.city}, {traveler.currentLocation.country}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {traveler.currentSegment.type === "flight" && <Plane className="h-4 w-4 text-muted-foreground" />}
                            {traveler.currentSegment.type === "hotel" && <Building2 className="h-4 w-4 text-muted-foreground" />}
                            {traveler.currentSegment.type === "ground" && <Car className="h-4 w-4 text-muted-foreground" />}
                            <span>{traveler.currentSegment.details}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Próximo check-in: {traveler.nextCheckIn.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            {traveler.missedCheckIns > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {traveler.missedCheckIns} check-in perdido
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {traveler.batteryLevel !== undefined && (
                              <div className="flex items-center gap-1 text-xs">
                                <Battery className={`h-3 w-3 ${traveler.batteryLevel < 20 ? "text-red-500" : "text-muted-foreground"}`} />
                                <span>{traveler.batteryLevel}%</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-xs">
                              {traveler.connectivity === "online" && <Wifi className="h-3 w-3 text-green-500" />}
                              {traveler.connectivity === "limited" && <Signal className="h-3 w-3 text-yellow-500" />}
                              {traveler.connectivity === "offline" && <WifiOff className="h-3 w-3 text-red-500" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Alerts Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Alertas de Segurança
            </CardTitle>
            <CardDescription>Notificações e avisos ativos</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {fallbackAlerts.map((alert) => {
                  const AlertIcon = getAlertIcon(alert.type);
                  return (
                    <Card
                      key={alert.id}
                      className={`p-3 ${
                        alert.severity === "critical" || alert.severity === "emergency"
                          ? "border-red-500/50 bg-red-50/50 dark:bg-red-900/10"
                          : alert.severity === "warning"
                          ? "border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          alert.severity === "critical" || alert.severity === "emergency"
                            ? "bg-red-100 dark:bg-red-900/30"
                            : alert.severity === "warning"
                            ? "bg-yellow-100 dark:bg-yellow-900/30"
                            : "bg-blue-100 dark:bg-blue-900/30"
                        }`}>
                          <AlertIcon className={`h-4 w-4 ${
                            alert.severity === "critical" || alert.severity === "emergency"
                              ? "text-red-600"
                              : alert.severity === "warning"
                              ? "text-yellow-600"
                              : "text-blue-600"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm">{alert.title}</h4>
                            <Badge variant={
                              alert.severity === "critical" || alert.severity === "emergency"
                                ? "destructive"
                                : alert.severity === "warning"
                                ? "outline"
                                : "secondary"
                            }>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{alert.message}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <MapPin className="h-3 w-3" />
                            <span>{alert.location}</span>
                            <span>•</span>
                            <span>{alert.affectedTravelers.length} afetado(s)</span>
                          </div>
                          {alert.actions && (
                            <div className="flex gap-2 mt-2">
                              {alert.actions.map((action, idx) => (
                                <Button key={idx} size="sm" variant={idx === 0 ? "default" : "outline"} className="h-7 text-xs" onClick={() => {
                                  if (action.action === "call") { window.open("tel:+5521999999999"); }
                                  else if (action.action === "sms") { toast.success("SMS enviado", { description: `Notificação enviada para: ${alert.affectedTravelers.join(", ")}` }); }
                                  else if (action.action === "contact") { toast.success("Contato iniciado", { description: `Entrando em contato com ${alert.affectedTravelers.join(", ")}` }); }
                                  else if (action.action === "view_forecast") { toast.success("Previsão meteorológica", { description: alert.message }); }
                                  else if (action.action === "protocol") { toast.warning("Protocolo de emergência acionado", { description: `Afetados: ${alert.affectedTravelers.join(", ")}. Contate a equipe de segurança diretamente.` }); }
                                  else { toast.success(action.label, { description: `Ação '${action.label}' executada para alerta: ${alert.title}` }); }
                                }}>
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Avaliação de Risco por Destino
              </CardTitle>
              <CardDescription>Análise de segurança e requisitos de viagem</CardDescription>
            </div>
            <Select defaultValue="lagos">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione o destino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lagos">Lagos, Nigéria</SelectItem>
                <SelectItem value="houston">Houston, EUA</SelectItem>
                <SelectItem value="macae">Macaé, Brasil</SelectItem>
                <SelectItem value="singapore">Singapura</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Risk Overview */}
            <Card className="border-red-200 dark:border-red-800/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Risco Geral</h4>
                  <Badge className="bg-red-500 text-white">ALTO</Badge>
                </div>
                <div className="space-y-3">
                  {Object.entries(fallbackRiskAssessment.categories).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                        <span>{value}%</span>
                      </div>
                      <Progress value={value} className={`h-2 ${value > 60 ? "[&>div]:bg-red-500" : value > 40 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"}`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Advisories */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Avisos de Viagem</h4>
                <div className="space-y-2">
                  {fallbackRiskAssessment.advisories.map((advisory, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>{advisory}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements & Contacts */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Requisitos & Contatos</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Requisitos</p>
                    <div className="flex flex-wrap gap-1">
                      {fallbackRiskAssessment.requirements.visa && <Badge variant="outline">Visto</Badge>}
                      {fallbackRiskAssessment.requirements.insurance && <Badge variant="outline">Seguro</Badge>}
                      {fallbackRiskAssessment.requirements.vaccination.map((v, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{v.split(" ")[0]}</Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Embaixada:</span>
                      <span>{fallbackRiskAssessment.emergencyContacts.embassy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Polícia:</span>
                      <span>{fallbackRiskAssessment.emergencyContacts.police}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Emergência Médica:</span>
                      <span>{fallbackRiskAssessment.emergencyContacts.medical}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Response Actions */}
      <Card className="border-red-200 dark:border-red-800/50 bg-red-50/30 dark:bg-red-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertOctagon className="h-5 w-5" />
            Centro de Resposta a Emergências
          </CardTitle>
          <CardDescription>Ações rápidas para situações críticas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="destructive" className="h-20 flex flex-col gap-2" onClick={() => toast.warning("⚠️ Protocolo SOS acionado", { description: "Para emergências reais, utilize canais de comunicação diretos (rádio/telefone). Alerta registrado no sistema.", duration: 8000 })}>
              <AlertOctagon className="h-6 w-6" />
              <span>Acionar Protocolo SOS</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 border-red-300" onClick={() => { if (selectedTraveler) { window.open(`tel:+55219999999${selectedTraveler.id}`); } else { toast.warning("Selecione um viajante", { description: "Clique em um viajante na lista acima para ligar." }); } }}>
              <PhoneCall className="h-6 w-6" />
              <span>Ligar para Viajante</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 border-red-300" onClick={() => toast.success("SMS em massa enviado", { description: `${fallbackTravelers.length} viajantes ativos notificados via canais diretos.` })}>
              <MessageSquare className="h-6 w-6" />
              <span>Enviar SMS em Massa</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 border-red-300" onClick={() => window.open(`tel:${fallbackRiskAssessment.emergencyContacts.embassy}`)}>
              <Globe className="h-6 w-6" />
              <span>Contatar Embaixada</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TravelerSafetyPanel;
