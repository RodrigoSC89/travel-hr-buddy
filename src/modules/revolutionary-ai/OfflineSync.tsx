/**
import { useEffect, useState, useCallback } from "react";;
 * Offline Sync Module
 * Sincronização inteligente para operação offline
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Wifi, WifiOff, Cloud, CloudOff, 
  RefreshCw, Database, HardDrive,
  CheckCircle, AlertTriangle, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SyncItem {
  id: string;
  module: string;
  type: "pending" | "syncing" | "synced" | "error";
  priority: "critical" | "high" | "normal";
  timestamp: Date;
  size: number;
  description: string;
}

export const OfflineSync = memo(function() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [localStorageUsed, setLocalStorageUsed] = useState(0);
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([
    {
      id: "1",
      module: "Manutenções",
      type: "pending",
      priority: "critical",
      timestamp: new Date(Date.now() - 3600000),
      size: 2.4,
      description: "Ordem de serviço #4521 - Motor principal"
    },
    {
      id: "2",
      module: "Estoque",
      type: "pending",
      priority: "high",
      timestamp: new Date(Date.now() - 7200000),
      size: 1.2,
      description: "Baixa de 15 itens - Navio Sirius"
    },
    {
      id: "3",
      module: "Certificados",
      type: "synced",
      priority: "normal",
      timestamp: new Date(Date.now() - 1800000),
      size: 0.8,
      description: "Upload certificado ANTAQ"
    },
    {
      id: "4",
      module: "Incidentes",
      type: "error",
      priority: "critical",
      timestamp: new Date(Date.now() - 900000),
      size: 3.1,
      description: "Relatório de incidente #892"
    }
  ]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Simulate local storage usage
    try {
      const used = JSON.stringify(localStorage).length / 1024 / 1024;
      setLocalStorageUsed(used);
    } catch {
      setLocalStorageUsed(0);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    });
  }, []);

  const handleSync = async () => {
    if (!isOnline) return;
    
    setIsSyncing(true);
    setSyncProgress(0);

    // Simulate sync progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setSyncProgress(i);
    }

    setSyncQueue(prev => prev.map(item => ({
      ...item,
      type: item.type === "pending" ? "synced" : item.type
    })));

    setIsSyncing(false);
  });

  const pendingCount = syncQueue.filter(i => i.type === "pending").length;
  const errorCount = syncQueue.filter(i => i.type === "error").length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical": return "bg-destructive text-destructive-foreground";
    case "high": return "bg-warning text-warning-foreground";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
    case "synced": return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "error": return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case "syncing": return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
    default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ scale: isOnline ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.5, repeat: isOnline ? 0 : Infinity }}
          >
            {isOnline ? (
              <div className="flex items-center gap-2 text-green-500">
                <Wifi className="h-6 w-6" />
                <span className="font-medium">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-destructive">
                <WifiOff className="h-6 w-6" />
                <span className="font-medium">Offline</span>
              </div>
            )}
          </motion.div>
          
          <Badge variant="outline">
            {pendingCount} pendentes
          </Badge>
          {errorCount > 0 && (
            <Badge variant="destructive">
              {errorCount} com erro
            </Badge>
          )}
        </div>

        <Button 
          onClick={handleSync} 
          disabled={!isOnline || isSyncing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Sincronizando..." : "Sincronizar Agora"}
        </Button>
      </div>

      {/* Sync Progress */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso da sincronização</span>
                    <span>{syncProgress}%</span>
                  </div>
                  <Progress value={syncProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dados Locais</p>
                <p className="text-2xl font-bold">{localStorageUsed.toFixed(2)} MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <Cloud className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Última Sincronização</p>
                <p className="text-2xl font-bold">Há 5 min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-warning/10">
                <HardDrive className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capacidade Offline</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudOff className="h-5 w-5" />
            Fila de Sincronização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {syncQueue.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(item.type)}
                  <div>
                    <p className="font-medium text-sm">{item.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.module} • {item.size} MB • {item.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(item.priority)}>
                    {item.priority}
                  </Badge>
                  {item.type === "error" && (
                    <Button size="sm" variant="outline">
                      Retry
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
