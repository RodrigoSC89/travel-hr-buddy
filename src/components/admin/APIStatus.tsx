import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Loader2,
  MapPin,
  MessageSquare,
  Mic,
  Plane,
  Hotel,
  Cloud,
  Ship,
  Activity,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";

interface APIService {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "connected" | "disconnected" | "testing" | "unknown";
  lastTest?: Date;
  responseTime?: number;
}

export const APIStatus: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [services, setServices] = useState<APIService[]>([
    {
      id: "mapbox",
      name: "Mapbox",
      description: "Serviço de mapas e geolocalização",
      icon: MapPin,
      status: "connected",
      lastTest: new Date(Date.now() - 120000),
      responseTime: 145,
    },
    {
      id: "openai",
      name: "OpenAI (Chat)",
      description: "API de chat e assistente IA",
      icon: MessageSquare,
      status: "connected",
      lastTest: new Date(Date.now() - 180000),
      responseTime: 892,
    },
    {
      id: "whisper",
      name: "Whisper",
      description: "Transcrição de áudio",
      icon: Mic,
      status: "connected",
      lastTest: new Date(Date.now() - 240000),
      responseTime: 1250,
    },
    {
      id: "skyscanner",
      name: "Skyscanner",
      description: "Busca de voos",
      icon: Plane,
      status: "unknown",
      lastTest: new Date(Date.now() - 3600000),
    },
    {
      id: "booking",
      name: "Booking.com",
      description: "Reservas de hotéis",
      icon: Hotel,
      status: "unknown",
      lastTest: new Date(Date.now() - 3600000),
    },
    {
      id: "windy",
      name: "Windy",
      description: "Dados meteorológicos",
      icon: Cloud,
      status: "connected",
      lastTest: new Date(Date.now() - 300000),
      responseTime: 234,
    },
    {
      id: "marinetraffic",
      name: "Marine Traffic",
      description: "Rastreamento de navios",
      icon: Ship,
      status: "unknown",
      lastTest: new Date(Date.now() - 7200000),
    },
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1500));

    setServices(prev =>
      prev.map(service => ({
        ...service,
        lastTest: new Date(),
        status: (Math.random() > 0.2 ? "connected" : "disconnected") as
          | "connected"
          | "disconnected",
        responseTime: Math.floor(Math.random() * 1500) + 100,
      }))
    );

    setIsRefreshing(false);
  };

  const getStatusIcon = (status: APIService["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "disconnected":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "testing":
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      case "unknown":
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: APIService["status"]) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-success/20 text-success border-success/30">✅ Conectado</Badge>;
      case "disconnected":
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/30">
            ❌ Falhou
          </Badge>
        );
      case "testing":
        return <Badge className="bg-primary/20 text-primary border-primary/30">⏳ Testando</Badge>;
      case "unknown":
        return <Badge variant="outline">Não Testado</Badge>;
    }
  };

  const getResponseTimeBadge = (responseTime?: number) => {
    if (!responseTime) return null;

    let className = "bg-success/20 text-success";
    if (responseTime > 1000) className = "bg-destructive/20 text-destructive";
    else if (responseTime > 500) className = "bg-warning/20 text-warning";

    return (
      <Badge variant="outline" className={className}>
        {responseTime}ms
      </Badge>
    );
  };

  const getRelativeTime = (date?: Date) => {
    if (!date) return "Nunca testado";

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s atrás`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`;
    return `${Math.floor(seconds / 86400)}d atrás`;
  };

  const connectedCount = services.filter(s => s.status === "connected").length;
  const disconnectedCount = services.filter(s => s.status === "disconnected").length;
  const unknownCount = services.filter(s => s.status === "unknown").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Status das APIs
            </CardTitle>
            <CardDescription>Integrações externas conectadas ao Nautilus One</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Testar Todas
            </Button>
            <Link to="/admin/api-tester">
              <Button variant="default" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir API Tester
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 bg-success/10 border border-success/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-success">{connectedCount}</p>
            <p className="text-xs text-muted-foreground">Conectadas</p>
          </div>
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-destructive">{disconnectedCount}</p>
            <p className="text-xs text-muted-foreground">Desconectadas</p>
          </div>
          <div className="p-3 bg-muted border rounded-lg text-center">
            <p className="text-2xl font-bold text-muted-foreground">{unknownCount}</p>
            <p className="text-xs text-muted-foreground">Não Testadas</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {services.map(service => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-200 bg-card"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-muted rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(service.status)}
                      <h4 className="font-medium">{service.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getResponseTimeBadge(service.responseTime)}
                  {getStatusBadge(service.status)}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {getRelativeTime(service.lastTest)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
