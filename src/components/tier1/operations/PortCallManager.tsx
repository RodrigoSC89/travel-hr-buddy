/**
 * Port Call Manager - Tier-1 Operations Component
 * Based on: Veson IMOS, Danaos, MarineTraffic
 * Features: Port rotations, berth scheduling, agent coordination, NOR management
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Anchor, Ship, Calendar, Clock, MapPin, FileText, Users, 
  CheckCircle2, AlertTriangle, Navigation, ArrowRight, Fuel,
  Package, DollarSign, Phone, Mail, Plus, Search, Filter,
  BarChart3, TrendingUp
} from "lucide-react";

// Types
interface PortCall {
  id: string;
  vesselName: string;
  vesselImo: string;
  port: string;
  portCode: string;
  terminal: string;
  berth: string;
  eta: Date;
  etd: Date;
  ata?: Date;
  atd?: Date;
  status: "scheduled" | "arrived" | "berthed" | "operations" | "departed" | "cancelled";
  purpose: "loading" | "discharge" | "bunkering" | "repairs" | "crew_change" | "provisions";
  cargo?: {
    type: string;
    quantity: number;
    unit: string;
  };
  agent: {
    name: string;
    phone: string;
    email: string;
  };
  norTendered?: Date;
  norAccepted?: Date;
  laytimeStart?: Date;
  documents: string[];
  costs: {
    portDues: number;
    pilotage: number;
    towage: number;
    agency: number;
    other: number;
    total: number;
  };
}

// Sample data
const portCalls: PortCall[] = [
  {
    id: "PC001",
    vesselName: "MV Atlantic Explorer",
    vesselImo: "9876543",
    port: "Rotterdam",
    portCode: "NLRTM",
    terminal: "Europoort",
    berth: "B-12",
    eta: new Date("2025-02-06T08:00:00"),
    etd: new Date("2025-02-08T16:00:00"),
    status: "scheduled",
    purpose: "loading",
    cargo: { type: "Crude Oil", quantity: 150000, unit: "MT" },
    agent: { name: "Van Ommeren Agency", phone: "+31 10 4567890", email: "ops@vanommeren.nl" },
    documents: ["Pre-arrival", "Cargo plan", "Stowage plan"],
    costs: { portDues: 45000, pilotage: 12000, towage: 8000, agency: 5000, other: 3000, total: 73000 }
  },
  {
    id: "PC002",
    vesselName: "MV Pacific Voyager",
    vesselImo: "9654321",
    port: "Singapore",
    portCode: "SGSIN",
    terminal: "Jurong",
    berth: "J-05",
    eta: new Date("2025-02-05T14:00:00"),
    ata: new Date("2025-02-05T14:30:00"),
    etd: new Date("2025-02-07T20:00:00"),
    status: "berthed",
    purpose: "bunkering",
    cargo: { type: "VLSFO", quantity: 3500, unit: "MT" },
    agent: { name: "Pacific Shipping Agency", phone: "+65 6789 0123", email: "ops@pacificagency.sg" },
    norTendered: new Date("2025-02-05T14:35:00"),
    norAccepted: new Date("2025-02-05T15:00:00"),
    laytimeStart: new Date("2025-02-05T21:00:00"),
    documents: ["NOR", "SOF", "Bunker receipt"],
    costs: { portDues: 25000, pilotage: 8000, towage: 5000, agency: 4000, other: 2000, total: 44000 }
  },
  {
    id: "PC003",
    vesselName: "MV Nordic Star",
    vesselImo: "9123456",
    port: "Houston",
    portCode: "USHOU",
    terminal: "Houston Fuel Oil Terminal",
    berth: "T-3",
    eta: new Date("2025-02-04T06:00:00"),
    ata: new Date("2025-02-04T06:15:00"),
    etd: new Date("2025-02-06T10:00:00"),
    atd: new Date("2025-02-06T09:45:00"),
    status: "departed",
    purpose: "discharge",
    cargo: { type: "Fuel Oil", quantity: 85000, unit: "MT" },
    agent: { name: "Gulf Agency Company", phone: "+1 713 555 0199", email: "houston@gac.com" },
    norTendered: new Date("2025-02-04T06:20:00"),
    norAccepted: new Date("2025-02-04T07:00:00"),
    laytimeStart: new Date("2025-02-04T13:00:00"),
    documents: ["NOR", "SOF", "B/L", "Discharge survey"],
    costs: { portDues: 35000, pilotage: 10000, towage: 6000, agency: 4500, other: 2500, total: 58000 }
  }
];

const portCallStats = {
  scheduled: 5,
  inProgress: 3,
  completed: 47,
  avgPortTime: 42.5,
  totalCosts: 1250000,
  onTimePerformance: 94.2
};

export function PortCallManager() {
  const [activeTab, setActiveTab] = useState("timeline");
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className: string }> = {
      scheduled: { variant: "outline", label: "Scheduled", className: "border-blue-500 text-blue-600" },
      arrived: { variant: "secondary", label: "Arrived", className: "bg-amber-100 text-amber-700" },
      berthed: { variant: "secondary", label: "Berthed", className: "bg-purple-100 text-purple-700" },
      operations: { variant: "secondary", label: "Operations", className: "bg-cyan-100 text-cyan-700" },
      departed: { variant: "secondary", label: "Departed", className: "bg-emerald-100 text-emerald-700" },
      cancelled: { variant: "destructive", label: "Cancelled", className: "" }
    };
    const config = statusMap[status] || statusMap.scheduled;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getPurposeIcon = (purpose: string) => {
    switch (purpose) {
      case "loading": return <Package className="h-4 w-4 text-blue-500" />;
      case "discharge": return <Package className="h-4 w-4 text-orange-500" />;
      case "bunkering": return <Fuel className="h-4 w-4 text-amber-500" />;
      case "repairs": return <Ship className="h-4 w-4 text-red-500" />;
      case "crew_change": return <Users className="h-4 w-4 text-purple-500" />;
      default: return <Anchor className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Anchor className="h-6 w-6 text-primary" />
            Port Call Manager
          </h2>
          <p className="text-muted-foreground">
            Manage port rotations, berth scheduling, and agent coordination
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Port Call
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{portCallStats.scheduled}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">In Progress</p>
                <p className="text-2xl font-bold text-amber-600">{portCallStats.inProgress}</p>
              </div>
              <Ship className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Completed</p>
                <p className="text-2xl font-bold text-emerald-600">{portCallStats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Avg Port Time</p>
                <p className="text-2xl font-bold">{portCallStats.avgPortTime}h</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Total Costs</p>
                <p className="text-2xl font-bold">${(portCallStats.totalCosts / 1000000).toFixed(2)}M</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">On-Time</p>
                <p className="text-2xl font-bold text-primary">{portCallStats.onTimePerformance}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by vessel, port, or agent..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="list">Port Calls</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Port Call Timeline
              </CardTitle>
              <CardDescription>Visual timeline of upcoming and ongoing port calls</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {portCalls.map((call, index) => (
                    <div 
                      key={call.id}
                      className="relative pl-8 pb-4 border-l-2 border-muted last:border-l-transparent"
                    >
                      {/* Timeline dot */}
                      <div className={`absolute -left-2.5 top-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        call.status === "departed" ? "bg-emerald-500" :
                        call.status === "berthed" || call.status === "operations" ? "bg-amber-500" :
                        "bg-blue-500"
                      }`}>
                        {call.status === "departed" ? (
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        ) : (
                          <Ship className="h-3 w-3 text-white" />
                        )}
                      </div>

                      {/* Port call card */}
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{call.vesselName}</h4>
                                {getStatusBadge(call.status)}
                                <Badge variant="outline" className="text-xs">
                                  IMO {call.vesselImo}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">{call.port}</p>
                                    <p className="text-xs text-muted-foreground">{call.terminal} - {call.berth}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">ETA: {formatDate(call.eta)}</p>
                                    <p className="text-xs text-muted-foreground">ETD: {formatDate(call.etd)}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {getPurposeIcon(call.purpose)}
                                  <div>
                                    <p className="font-medium capitalize">{call.purpose.replace("_", " ")}</p>
                                    {call.cargo && (
                                      <p className="text-xs text-muted-foreground">
                                        {call.cargo.quantity.toLocaleString()} {call.cargo.unit} {call.cargo.type}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">{call.agent.name}</p>
                                    <p className="text-xs text-muted-foreground">{call.agent.phone}</p>
                                  </div>
                                </div>
                              </div>

                              {/* NOR Status */}
                              {(call.norTendered || call.norAccepted) && (
                                <div className="mt-3 pt-3 border-t flex items-center gap-4 text-xs">
                                  {call.norTendered && (
                                    <Badge variant="outline" className="bg-blue-50">
                                      <FileText className="h-3 w-3 mr-1" />
                                      NOR Tendered: {formatDate(call.norTendered)}
                                    </Badge>
                                  )}
                                  {call.norAccepted && (
                                    <Badge variant="outline" className="bg-emerald-50">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      NOR Accepted: {formatDate(call.norAccepted)}
                                    </Badge>
                                  )}
                                  {call.laytimeStart && (
                                    <Badge variant="outline" className="bg-amber-50">
                                      <Clock className="h-3 w-3 mr-1" />
                                      Laytime Start: {formatDate(call.laytimeStart)}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Costs */}
                            <div className="text-right">
                              <p className="text-lg font-bold">${call.costs.total.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Port costs</p>
                              <Button variant="ghost" size="sm" className="mt-2">
                                View Details
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Port Calls</CardTitle>
              <CardDescription>Complete list of port calls with filtering options</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Detailed port call table with advanced filtering coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Port Agents Directory
              </CardTitle>
              <CardDescription>Manage port agent contacts and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {portCalls.map((call) => (
                  <Card key={call.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{call.agent.name}</h4>
                          <p className="text-sm text-muted-foreground">{call.port}</p>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <Phone className="h-3 w-3" />
                              {call.agent.phone}
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <Mail className="h-3 w-3" />
                              {call.agent.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Port Call Analytics
              </CardTitle>
              <CardDescription>Performance metrics and cost analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Cost Breakdown by Category</h4>
                  <div className="space-y-3">
                    {[
                      { label: "Port Dues", value: 105000, percent: 45 },
                      { label: "Pilotage", value: 30000, percent: 17 },
                      { label: "Towage", value: 19000, percent: 11 },
                      { label: "Agency Fees", value: 13500, percent: 8 },
                      { label: "Other", value: 7500, percent: 4 }
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.label}</span>
                          <span className="font-medium">${item.value.toLocaleString()}</span>
                        </div>
                        <Progress value={item.percent} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Port Performance</h4>
                  <div className="space-y-4">
                    {[
                      { port: "Rotterdam", calls: 12, avgTime: 38, onTime: 95 },
                      { port: "Singapore", calls: 8, avgTime: 24, onTime: 92 },
                      { port: "Houston", calls: 6, avgTime: 52, onTime: 88 }
                    ].map((port) => (
                      <div key={port.port} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{port.port}</p>
                          <p className="text-xs text-muted-foreground">{port.calls} calls this year</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{port.avgTime}h avg</p>
                          <p className="text-xs text-emerald-600">{port.onTime}% on-time</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
