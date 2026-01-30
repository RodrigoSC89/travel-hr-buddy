/**
 * Global Maritime Network - UMIN
 * PATCH REVOLUTION v1.0
 * Unified Maritime Intelligence Network
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Globe, Ship, Users, TrendingUp, Fuel, Clock,
  AlertTriangle, CheckCircle, MapPin, Anchor,
  BarChart3, Zap, Shield, DollarSign, Radio
} from "lucide-react";
import { motion } from "framer-motion";

interface NetworkStats {
  totalVessels: number;
  activeNow: number;
  dataPointsToday: number;
  alertsShared: number;
  savingsGenerated: number;
}

interface PortIntelligence {
  id: string;
  portName: string;
  country: string;
  congestionLevel: "low" | "medium" | "high";
  waitingHours: number;
  fuelPrice: number;
  reportsToday: number;
  lastUpdate: string;
}

interface SharedAlert {
  id: string;
  type: "weather" | "safety" | "port" | "piracy" | "fuel";
  location: string;
  message: string;
  reportedBy: string;
  timestamp: string;
  confirmations: number;
}

const mockStats: NetworkStats = {
  totalVessels: 12847,
  activeNow: 8923,
  dataPointsToday: 2847391,
  alertsShared: 156,
  savingsGenerated: 4500000,
};

const mockPorts: PortIntelligence[] = [
  {
    id: "1",
    portName: "Singapore",
    country: "SG",
    congestionLevel: "high",
    waitingHours: 18,
    fuelPrice: 525,
    reportsToday: 45,
    lastUpdate: "5 min ago",
  },
  {
    id: "2",
    portName: "Rotterdam",
    country: "NL",
    congestionLevel: "medium",
    waitingHours: 8,
    fuelPrice: 510,
    reportsToday: 38,
    lastUpdate: "12 min ago",
  },
  {
    id: "3",
    portName: "Shanghai",
    country: "CN",
    congestionLevel: "high",
    waitingHours: 24,
    fuelPrice: 495,
    reportsToday: 62,
    lastUpdate: "3 min ago",
  },
  {
    id: "4",
    portName: "Houston",
    country: "US",
    congestionLevel: "low",
    waitingHours: 4,
    fuelPrice: 480,
    reportsToday: 28,
    lastUpdate: "8 min ago",
  },
  {
    id: "5",
    portName: "Dubai",
    country: "AE",
    congestionLevel: "low",
    waitingHours: 2,
    fuelPrice: 465,
    reportsToday: 19,
    lastUpdate: "15 min ago",
  },
];

const mockAlerts: SharedAlert[] = [
  {
    id: "1",
    type: "weather",
    location: "South China Sea",
    message: "Tropical storm developing - Category 2 expected in 48h",
    reportedBy: "MV Pacific Star",
    timestamp: "2025-01-20T14:30:00Z",
    confirmations: 23,
  },
  {
    id: "2",
    type: "port",
    location: "Singapore Strait",
    message: "Heavy traffic congestion - recommend Johor Strait alternative",
    reportedBy: "MV Ocean Pride",
    timestamp: "2025-01-20T14:15:00Z",
    confirmations: 45,
  },
  {
    id: "3",
    type: "fuel",
    location: "Colombo, Sri Lanka",
    message: "Bunker price dropped $15/ton - good opportunity",
    reportedBy: "MV Blue Wave",
    timestamp: "2025-01-20T13:45:00Z",
    confirmations: 12,
  },
  {
    id: "4",
    type: "safety",
    location: "Gulf of Aden",
    message: "Suspicious vessel spotted at 12.5°N, 44.2°E - maintain distance",
    reportedBy: "MV Atlantic Carrier",
    timestamp: "2025-01-20T12:00:00Z",
    confirmations: 67,
  },
];

const congestionColors = {
  low: "bg-green-500/10 text-green-500 border-green-500/30",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  high: "bg-red-500/10 text-red-500 border-red-500/30",
};

const alertTypeIcons = {
  weather: Globe,
  safety: Shield,
  port: Anchor,
  piracy: AlertTriangle,
  fuel: Fuel,
};

const alertTypeColors = {
  weather: "text-blue-500",
  safety: "text-red-500",
  port: "text-purple-500",
  piracy: "text-orange-500",
  fuel: "text-green-500",
};

export function GlobalMaritimeNetwork() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-500" />
            Global Maritime Network (UMIN)
          </h2>
          <p className="text-muted-foreground">
            Inteligência coletiva de {mockStats.totalVessels.toLocaleString()}+ embarcações
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
          <Radio className="h-3 w-3 mr-1 animate-pulse" />
          LIVE
        </Badge>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Ship className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{mockStats.activeNow.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Navios Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{(mockStats.dataPointsToday / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">Dados/Dia</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{mockStats.alertsShared}</p>
                <p className="text-xs text-muted-foreground">Alertas Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{mockStats.totalVessels.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Network</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">${(mockStats.savingsGenerated / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">Economia/Mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Port Intelligence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Anchor className="h-5 w-5 text-primary" />
              Port Intelligence (Crowdsourced)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockPorts.map((port, index) => (
                <motion.div
                  key={port.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium">{port.portName}</span>
                      <span className="text-xs text-muted-foreground">{port.country}</span>
                    </div>
                    <Badge variant="outline" className={congestionColors[port.congestionLevel]}>
                      {port.congestionLevel}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Wait: </span>
                      <span className="font-medium">{port.waitingHours}h</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bunker: </span>
                      <span className="font-medium">${port.fuelPrice}/ton</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reports: </span>
                      <span className="font-medium">{port.reportsToday}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Updated {port.lastUpdate}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Live Network Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAlerts.map((alert, index) => {
                const AlertIcon = alertTypeIcons[alert.type];
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-muted ${alertTypeColors[alert.type]}`}>
                        <AlertIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-muted-foreground">
                            {alert.location}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {alert.confirmations} confirmações
                          </Badge>
                        </div>
                        <p className="text-sm">{alert.message}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span>Reported by {alert.reportedBy}</span>
                          <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Benefits */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5">
        <CardContent className="pt-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Benefícios da Rede Global
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">1000x</div>
              <div className="text-sm text-muted-foreground">Mais Dados</div>
              <p className="text-xs text-muted-foreground mt-1">
                Inteligência de milhares de navios
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">50%</div>
              <div className="text-sm text-muted-foreground">Melhores Decisões</div>
              <p className="text-xs text-muted-foreground mt-1">
                Crowdsourced intelligence
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">15-20%</div>
              <div className="text-sm text-muted-foreground">Poder de Negociação</div>
              <p className="text-xs text-muted-foreground mt-1">
                Compras coletivas
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-500">$2M/ano</div>
              <div className="text-sm text-muted-foreground">Economia/Frota</div>
              <p className="text-xs text-muted-foreground mt-1">
                Para frota de 10 navios
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
