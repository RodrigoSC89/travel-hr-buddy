/**
 * Maritime Connectivity Page - Conectividade Marítima
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, Wifi, Satellite, Signal, Globe, Activity } from "lucide-react";

const connections = [
  { id: 1, name: "VSAT Principal", type: "satellite", status: "online", signal: 95, bandwidth: "50 Mbps" },
  { id: 2, name: "4G/LTE Backup", type: "cellular", status: "standby", signal: 78, bandwidth: "20 Mbps" },
  { id: 3, name: "Inmarsat Fleet", type: "satellite", status: "online", signal: 88, bandwidth: "5 Mbps" },
  { id: 4, name: "Wi-Fi Local", type: "wifi", status: "online", signal: 100, bandwidth: "100 Mbps" },
];

export default function MaritimeConnectivityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Radio className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Conectividade Marítima</h2>
          <p className="text-muted-foreground">Status de comunicações e conexões</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Conexões Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-green-500">
              {connections.filter(c => c.status === "online").length}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Banda Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">175 Mbps</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Signal className="h-4 w-4" />
              Sinal Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">90%</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-green-500">99.9%</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connections.map((conn) => (
          <Card key={conn.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {conn.type === "satellite" ? <Satellite className="h-5 w-5" /> : 
                   conn.type === "cellular" ? <Signal className="h-5 w-5" /> : 
                   <Wifi className="h-5 w-5" />}
                  {conn.name}
                </CardTitle>
                <Badge variant={conn.status === "online" ? "default" : "secondary"}>
                  {conn.status === "online" ? "Online" : "Standby"}
                </Badge>
              </div>
              <CardDescription>{conn.type.toUpperCase()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Signal className="h-4 w-4 text-muted-foreground" />
                  <span>Sinal: {conn.signal}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span>{conn.bandwidth}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
