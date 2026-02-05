/**
 * FASE 4 - Tracking Hub
 * SATCOM Dashboard com failover alerts (benchmark: Inmarsat FleetBroadband)
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Satellite, Signal, SignalHigh, SignalLow, SignalZero,
  Wifi, WifiOff, Phone, Mail, Globe, AlertTriangle,
  CheckCircle, Clock, ArrowUpDown, Activity, Radio
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SatcomLink {
  id: string;
  vessel: string;
  provider: string;
  type: "VSAT" | "FleetBroadband" | "Iridium" | "Inmarsat-C";
  status: "online" | "degraded" | "offline";
  signalStrength: number;
  bandwidth: { upload: number; download: number };
  latency: number;
  lastContact: Date;
}

const satcomLinks: SatcomLink[] = [
  {
    id: "1",
    vessel: "MV Atlântico Sul",
    provider: "Inmarsat",
    type: "VSAT",
    status: "online",
    signalStrength: 92,
    bandwidth: { upload: 2.4, download: 8.5 },
    latency: 580,
    lastContact: new Date()
  },
  {
    id: "2",
    vessel: "PSV Oceano Azul",
    provider: "KVH",
    type: "VSAT",
    status: "online",
    signalStrength: 88,
    bandwidth: { upload: 2.1, download: 6.2 },
    latency: 620,
    lastContact: new Date()
  },
  {
    id: "3",
    vessel: "AHTS Maré Alta",
    provider: "Iridium",
    type: "Iridium",
    status: "degraded",
    signalStrength: 45,
    bandwidth: { upload: 0.128, download: 0.128 },
    latency: 1200,
    lastContact: new Date(Date.now() - 300000)
  },
  {
    id: "4",
    vessel: "Supply Boat SB-07",
    provider: "Inmarsat",
    type: "FleetBroadband",
    status: "offline",
    signalStrength: 0,
    bandwidth: { upload: 0, download: 0 },
    latency: 0,
    lastContact: new Date(Date.now() - 1800000)
  },
];

const bandwidthHistory = [
  { time: "00:00", upload: 1.8, download: 6.2 },
  { time: "04:00", upload: 2.1, download: 7.5 },
  { time: "08:00", upload: 2.4, download: 8.1 },
  { time: "12:00", upload: 2.2, download: 7.8 },
  { time: "16:00", upload: 2.5, download: 8.5 },
  { time: "20:00", upload: 2.3, download: 7.9 },
];

const getSignalIcon = (strength: number) => {
  if (strength >= 80) return <SignalHigh className="h-5 w-5 text-success" />;
  if (strength >= 40) return <SignalLow className="h-5 w-5 text-warning" />;
  if (strength > 0) return <Signal className="h-5 w-5 text-destructive" />;
  return <SignalZero className="h-5 w-5 text-muted-foreground" />;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "online": return "bg-success";
    case "degraded": return "bg-warning";
    case "offline": return "bg-destructive";
    default: return "bg-muted";
  }
};

export default function SATCOMDashboard() {
  const [selectedLink, setSelectedLink] = useState<SatcomLink | null>(null);

  const onlineCount = satcomLinks.filter(l => l.status === "online").length;
  const degradedCount = satcomLinks.filter(l => l.status === "degraded").length;
  const offlineCount = satcomLinks.filter(l => l.status === "offline").length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-success">{onlineCount}</p>
              </div>
              <Wifi className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Degradado</p>
                <p className="text-2xl font-bold text-warning">{degradedCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-destructive">{offlineCount}</p>
              </div>
              <WifiOff className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Links</p>
                <p className="text-2xl font-bold">{satcomLinks.length}</p>
              </div>
              <Satellite className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Links List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5" />
                Status de Comunicação por Embarcação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {satcomLinks.map((link) => (
                <div 
                  key={link.id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedLink?.id === link.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedLink(link)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${getStatusColor(link.status)}`} />
                      <div>
                        <h4 className="font-semibold">{link.vessel}</h4>
                        <p className="text-sm text-muted-foreground">{link.provider} - {link.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getSignalIcon(link.signalStrength)}
                      <Badge variant={
                        link.status === "online" ? "default" :
                        link.status === "degraded" ? "secondary" : "destructive"
                      }>
                        {link.status}
                      </Badge>
                    </div>
                  </div>

                  {link.status !== "offline" && (
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Sinal</p>
                        <p className="font-medium">{link.signalStrength}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Upload</p>
                        <p className="font-medium">{link.bandwidth.upload} Mbps</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Download</p>
                        <p className="font-medium">{link.bandwidth.download} Mbps</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Latência</p>
                        <p className="font-medium">{link.latency} ms</p>
                      </div>
                    </div>
                  )}

                  {link.status === "offline" && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Último contato: {link.lastContact.toLocaleTimeString()}</span>
                      <Button variant="outline" size="sm" className="ml-auto">
                        Iniciar Failover
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Bandwidth Chart & Services */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5" />
                Uso de Banda (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={bandwidthHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Line type="monotone" dataKey="upload" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Upload" />
                  <Line type="monotone" dataKey="download" stroke="hsl(var(--success))" strokeWidth={2} dot={false} name="Download" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Serviços Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "VoIP", icon: Phone, status: "online", usage: "12 chamadas/dia" },
                { name: "Email", icon: Mail, status: "online", usage: "256 emails/dia" },
                { name: "Internet", icon: Globe, status: "online", usage: "2.4 GB/dia" },
                { name: "Distress", icon: AlertTriangle, status: "standby", usage: "Ready" },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <service.icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">{service.usage}</p>
                    </div>
                  </div>
                  <Badge variant={service.status === "online" ? "default" : "secondary"}>
                    {service.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
