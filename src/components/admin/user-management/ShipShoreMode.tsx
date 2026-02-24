/**
 * Ship-Shore Mode - Differentiated permissions based on location context
 * (Gap: TM Master — office-only permission management)
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Ship, Building2, Wifi, WifiOff, Shield, Eye, Edit,
  Trash2, Lock, Settings2, Globe, Anchor, Smartphone,
  Laptop, Satellite, CloudOff, Save, RotateCcw, Signal,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations/motion-variants";

interface ShipShorePolicy {
  module: string;
  moduleLabel: string;
  icon: React.ElementType;
  shore: { read: boolean; write: boolean; delete: boolean; manage: boolean };
  ship: { read: boolean; write: boolean; delete: boolean; manage: boolean };
  offlineSync: boolean;
  bandwidthOptimized: boolean;
}

const POLICIES: ShipShorePolicy[] = [
  {
    module: "command", moduleLabel: "Command Center", icon: Globe,
    shore: { read: true, write: true, delete: true, manage: true },
    ship: { read: true, write: true, delete: false, manage: false },
    offlineSync: true, bandwidthOptimized: true,
  },
  {
    module: "fleet", moduleLabel: "Fleet Management", icon: Anchor,
    shore: { read: true, write: true, delete: true, manage: true },
    ship: { read: true, write: true, delete: false, manage: false },
    offlineSync: true, bandwidthOptimized: true,
  },
  {
    module: "maintenance", moduleLabel: "Manutenção", icon: Settings2,
    shore: { read: true, write: true, delete: true, manage: true },
    ship: { read: true, write: true, delete: false, manage: false },
    offlineSync: true, bandwidthOptimized: true,
  },
  {
    module: "compliance", moduleLabel: "Compliance", icon: Shield,
    shore: { read: true, write: true, delete: true, manage: true },
    ship: { read: true, write: false, delete: false, manage: false },
    offlineSync: true, bandwidthOptimized: false,
  },
  {
    module: "finance", moduleLabel: "Financeiro", icon: Building2,
    shore: { read: true, write: true, delete: true, manage: true },
    ship: { read: true, write: false, delete: false, manage: false },
    offlineSync: false, bandwidthOptimized: false,
  },
  {
    module: "people", moduleLabel: "People & HR", icon: Building2,
    shore: { read: true, write: true, delete: true, manage: true },
    ship: { read: true, write: false, delete: false, manage: false },
    offlineSync: true, bandwidthOptimized: true,
  },
  {
    module: "ai", moduleLabel: "AI Hub", icon: Globe,
    shore: { read: true, write: true, delete: true, manage: true },
    ship: { read: true, write: false, delete: false, manage: false },
    offlineSync: false, bandwidthOptimized: true,
  },
  {
    module: "system", moduleLabel: "System Settings", icon: Lock,
    shore: { read: true, write: true, delete: true, manage: true },
    ship: { read: false, write: false, delete: false, manage: false },
    offlineSync: false, bandwidthOptimized: false,
  },
];

const CONNECTED_DEVICES = [
  { name: "MV Santos — Bridge", type: "ship", status: "online", bandwidth: "1.8 Mbps", lastSync: "2min atrás", icon: Ship },
  { name: "MV Paranaguá — Engine Room", type: "ship", status: "online", bandwidth: "0.9 Mbps", lastSync: "5min atrás", icon: Ship },
  { name: "Escritório SP — Admin", type: "shore", status: "online", bandwidth: "100 Mbps", lastSync: "Tempo real", icon: Building2 },
  { name: "MV Atlantic Star — Bridge", type: "ship", status: "offline", bandwidth: "—", lastSync: "2h atrás", icon: Ship },
  { name: "Escritório RJ — Ops", type: "shore", status: "online", bandwidth: "50 Mbps", lastSync: "Tempo real", icon: Building2 },
];

const PermDot: React.FC<{ active: boolean; type: string }> = ({ active, type }) => {
  const icons = { read: Eye, write: Edit, delete: Trash2, manage: Shield };
  const Icon = icons[type as keyof typeof icons] || Eye;
  return (
    <div className={`p-1 rounded ${active ? "text-emerald-600 bg-emerald-500/10" : "text-muted-foreground/20"}`}>
      <Icon className="h-3 w-3" />
    </div>
  );
};

export const ShipShoreMode: React.FC = () => {
  const [policies, setPolicies] = useState(POLICIES);
  const [hasChanges, setHasChanges] = useState(false);

  const togglePolicy = (idx: number, context: "shore" | "ship", perm: string) => {
    setPolicies(prev => {
      const next = [...prev];
      const policy = { ...next[idx] };
      policy[context] = { ...policy[context], [perm]: !policy[context][perm as keyof typeof policy.shore] };
      next[idx] = policy;
      return next;
    });
    setHasChanges(true);
  };

  const toggleSync = (idx: number) => {
    setPolicies(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], offlineSync: !next[idx].offlineSync };
      return next;
    });
    setHasChanges(true);
  };

  const toggleBandwidth = (idx: number) => {
    setPolicies(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], bandwidthOptimized: !next[idx].bandwidthOptimized };
      return next;
    });
    setHasChanges(true);
  };

  const onlineShips = CONNECTED_DEVICES.filter(d => d.type === "ship" && d.status === "online").length;
  const totalShips = CONNECTED_DEVICES.filter(d => d.type === "ship").length;

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Navios Online", value: `${onlineShips}/${totalShips}`, icon: Ship, color: "text-blue-600", bg: "bg-blue-500/5 border-blue-500/20" },
          { label: "Escritórios Online", value: CONNECTED_DEVICES.filter(d => d.type === "shore" && d.status === "online").length.toString(), icon: Building2, color: "text-emerald-600", bg: "bg-emerald-500/5 border-emerald-500/20" },
          { label: "Sync Pendente", value: "3", icon: CloudOff, color: "text-amber-600", bg: "bg-amber-500/5 border-amber-500/20" },
          { label: "Banda Média", value: "1.4 Mbps", icon: Signal, color: "text-violet-600", bg: "bg-violet-500/5 border-violet-500/20" },
        ].map(stat => (
          <Card key={stat.label} className={stat.bg}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Connected Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            Dispositivos Conectados
          </CardTitle>
          <CardDescription>Status de conexão Ship-Shore em tempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {CONNECTED_DEVICES.map(device => {
              const DevIcon = device.icon;
              const isOnline = device.status === "online";
              return (
                <div key={device.name} className={`flex items-center gap-3 p-3 rounded-xl border ${isOnline ? "border-emerald-500/20 bg-emerald-500/5" : "border-muted bg-muted/30"}`}>
                  <div className={`p-2 rounded-lg ${isOnline ? "bg-emerald-500/10" : "bg-muted"}`}>
                    <DevIcon className={`h-4 w-4 ${isOnline ? "text-emerald-600" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{device.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {isOnline ? <Wifi className="h-3 w-3 text-emerald-600" /> : <WifiOff className="h-3 w-3 text-muted-foreground" />}
                      <span>{device.bandwidth}</span>
                      <span>•</span>
                      <span>{device.lastSync}</span>
                    </div>
                  </div>
                  <Badge variant={isOnline ? "default" : "secondary"} className="text-[10px]">
                    {isOnline ? "Online" : "Offline"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ship-Shore Permission Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Matriz de Permissões Ship-Shore
              </CardTitle>
              <CardDescription>
                Permissões diferenciadas por contexto (bordo vs. escritório) — superando a limitação do TM Master
              </CardDescription>
            </div>
            {hasChanges && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setPolicies(POLICIES); setHasChanges(false); }}>
                  <RotateCcw className="h-4 w-4 mr-1" />Reverter
                </Button>
                <Button size="sm" onClick={() => setHasChanges(false)}>
                  <Save className="h-4 w-4 mr-1" />Salvar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[160px]">Módulo</TableHead>
                  <TableHead className="text-center" colSpan={1}>
                    <div className="flex items-center justify-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />Shore
                    </div>
                  </TableHead>
                  <TableHead className="text-center" colSpan={1}>
                    <div className="flex items-center justify-center gap-1">
                      <Ship className="h-3.5 w-3.5" />Ship
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Offline Sync</TableHead>
                  <TableHead className="text-center">Low BW</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy, idx) => {
                  const ModIcon = policy.icon;
                  return (
                    <TableRow key={policy.module}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ModIcon className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{policy.moduleLabel}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-0.5">
                          {(["read", "write", "delete", "manage"] as const).map(p => (
                            <button key={p} onClick={() => togglePolicy(idx, "shore", p)} className="hover:scale-110 transition-transform">
                              <PermDot active={policy.shore[p]} type={p} />
                            </button>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-0.5">
                          {(["read", "write", "delete", "manage"] as const).map(p => (
                            <button key={p} onClick={() => togglePolicy(idx, "ship", p)} className="hover:scale-110 transition-transform">
                              <PermDot active={policy.ship[p]} type={p} />
                            </button>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch checked={policy.offlineSync} onCheckedChange={() => toggleSync(idx)} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch checked={policy.bandwidthOptimized} onCheckedChange={() => toggleBandwidth(idx)} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />Ler</span>
            <span className="flex items-center gap-1"><Edit className="h-3 w-3" />Escrever</span>
            <span className="flex items-center gap-1"><Trash2 className="h-3 w-3" />Excluir</span>
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" />Gerenciar</span>
            <Separator orientation="vertical" className="h-4" />
            <span className="flex items-center gap-1"><CloudOff className="h-3 w-3" />Sync offline via IndexedDB/Dexie</span>
            <span className="flex items-center gap-1"><Signal className="h-3 w-3" />Otimizado para &lt;2 Mbps</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
