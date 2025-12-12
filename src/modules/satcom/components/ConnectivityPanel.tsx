/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * PATCH 476: Enhanced SATCOM Connectivity Panel
 * Shows real-time connectivity status with ping simulation
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Satellite, Signal, Clock, Activity, RefreshCw, AlertCircle } from "lucide-react";
import { satcomPingService, type SatcomLink, type PingResult } from "../services/ping-service";
import { toast } from "sonner";

export const ConnectivityPanel: React.FC = () => {
  const [links, setLinks] = useState<SatcomLink[]>([]);
  const [pinging, setPinging] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<Date | null>(null);
  const [autoPing, setAutoPing] = useState(false);
  const [stats, setStats] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    loadLinks();
  }, []);

  useEffect(() => {
    if (autoPing) {
      const interval = setInterval(() => {
        performPingAll();
      }, 30000); // Ping every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoPing]);

  const loadLinks = async () => {
    const fetchedLinks = await satcomPingService.getLinks();
    setLinks(fetchedLinks);

    // Load statistics for each link
    const statsMap = new Map();
    for (const link of fetchedLinks) {
      const linkStats = await satcomPingService.getStatistics(link.id);
      statsMap.set(link.id, linkStats);
    }
    setStats(statsMap);
  };

  const performPingAll = async () => {
    setPinging(true);
    try {
      const results = await satcomPingService.pingAllLinks();
      setLastPingTime(new Date());
      
      const failedCount = results.filter(r => !r.success).length;
      if (failedCount > 0) {
        toast.warning(`${failedCount} link(s) failed to respond`);
      } else {
        toast.success("All links responded successfully");
      }

      await loadLinks(); // Reload to get updated status
    } catch (error) {
      console.error("Error pinging links:", error);
      toast.error("Failed to ping satellite links");
    } finally {
      setPinging(false);
    }
  };

  const getStatusColor = (status: SatcomLink["status"]) => {
    switch (status) {
    case "online":
      return "bg-green-500";
    case "degraded":
      return "bg-yellow-500";
    case "offline":
      return "bg-red-500";
    default:
      return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: SatcomLink["status"]) => {
    switch (status) {
    case "online":
      return "Online";
    case "degraded":
      return "Degradado";
    case "offline":
      return "Offline";
    default:
      return "Desconhecido";
    }
  };

  const getSignalColor = (strength: number | null) => {
    if (!strength) return "text-gray-400";
    if (strength >= 80) return "text-green-500";
    if (strength >= 50) return "text-yellow-500";
    return "text-red-500";
  });

  const formatBandwidth = (kbps: number | null) => {
    if (!kbps) return "N/A";
    if (kbps >= 1000) {
      return `${(kbps / 1000).toFixed(1)} Mbps`;
    }
    return `${kbps} Kbps`;
  });

  const getTimeSince = (timestamp: string | null) => {
    if (!timestamp) return "Nunca";
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s atrás`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Satellite className="h-5 w-5" />
                Status de Conectividade SATCOM
              </CardTitle>
              <CardDescription>
                Monitoramento em tempo real dos links de satélite
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={autoPing ? "default" : "outline"}
                size="sm"
                onClick={handleSetAutoPing}
              >
                <Activity className="h-4 w-4 mr-2" />
                {autoPing ? "Auto-Ping Ativo" : "Auto-Ping"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={performPingAll}
                disabled={pinging}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${pinging ? "animate-spin" : ""}`} />
                Ping Todos
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {lastPingTime && (
            <div className="mb-4 text-sm text-muted-foreground">
              Último ping: {lastPingTime.toLocaleTimeString()}
            </div>
          )}

          <div className="space-y-4">
            {links.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Nenhum link SATCOM configurado</p>
              </div>
            ) : (
              links.map((link) => {
                const linkStats = stats.get(link.id);
                return (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(link.status)}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{link.name}</div>
                          <Badge variant="outline">{link.provider}</Badge>
                          {link.is_primary && (
                            <Badge variant="default" className="text-xs">Primário</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {getStatusLabel(link.status)}
                          {link.failure_reason && link.status === "offline" && (
                            <span className="ml-2 text-red-500">
                              - {link.failure_reason}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 text-sm">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Sinal</div>
                        <div className={`font-medium ${getSignalColor(link.signal_strength)}`}>
                          <Signal className="h-4 w-4 inline mr-1" />
                          {link.signal_strength ? `${link.signal_strength}%` : "N/A"}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Latência</div>
                        <div className="font-medium">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {link.latency_ms ? `${link.latency_ms}ms` : "N/A"}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Banda</div>
                        <div className="font-medium">{formatBandwidth(link.bandwidth_kbps)}</div>
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <div className="text-xs text-muted-foreground">
                        Último ping: {getTimeSince(link.last_ping_at)}
                      </div>
                      {linkStats && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Uptime: {linkStats.total > 0 
                            ? `${((linkStats.successful / linkStats.total) * 100).toFixed(1)}%`
                            : "N/A"
                          }
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
