/**
import { useCallback, useMemo, useRef, useState } from "react";;
 * PATCH: Reconhecimento Facial para Controle de Acesso
 * Sistema de identificação biométrica para áreas restritas
 */

import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ScanFace, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users,
  Camera,
  Lock,
  Unlock,
  AlertTriangle,
  History,
  Settings,
  UserPlus
} from "lucide-react";
import { toast } from "sonner";

interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  area: string;
  timestamp: Date;
  status: "granted" | "denied" | "pending";
  method: "facial" | "card" | "pin";
  confidence?: number;
}

interface RestrictedArea {
  id: string;
  name: string;
  level: "low" | "medium" | "high" | "critical";
  activeUsers: number;
  maxCapacity: number;
  requiresFacial: boolean;
}

const mockAccessLogs: AccessLog[] = [
  { id: "1", userId: "u1", userName: "Carlos Silva", area: "Praça de Máquinas", timestamp: new Date(Date.now() - 300000), status: "granted", method: "facial", confidence: 98.5 },
  { id: "2", userId: "u2", userName: "João Santos", area: "Ponte de Comando", timestamp: new Date(Date.now() - 600000), status: "granted", method: "facial", confidence: 99.2 },
  { id: "3", userId: "u3", userName: "Desconhecido", area: "Sala de Carga", timestamp: new Date(Date.now() - 900000), status: "denied", method: "facial", confidence: 45.0 },
  { id: "4", userId: "u4", userName: "Maria Oliveira", area: "Enfermaria", timestamp: new Date(Date.now() - 1200000), status: "granted", method: "card" },
  { id: "5", userId: "u5", userName: "Pedro Costa", area: "Praça de Máquinas", timestamp: new Date(Date.now() - 1500000), status: "granted", method: "facial", confidence: 97.8 },
];

const restrictedAreas: RestrictedArea[] = [
  { id: "bridge", name: "Ponte de Comando", level: "critical", activeUsers: 3, maxCapacity: 5, requiresFacial: true },
  { id: "engine", name: "Praça de Máquinas", level: "high", activeUsers: 4, maxCapacity: 8, requiresFacial: true },
  { id: "cargo", name: "Porão de Carga", level: "medium", activeUsers: 2, maxCapacity: 10, requiresFacial: false },
  { id: "medical", name: "Enfermaria", level: "medium", activeUsers: 1, maxCapacity: 4, requiresFacial: false },
  { id: "armory", name: "Paiol de Armas", level: "critical", activeUsers: 0, maxCapacity: 2, requiresFacial: true },
];

export default function FacialAccess() {
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(mockAccessLogs);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; confidence?: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      toast.success("Câmera ativada");
    } catch (error) {
      toast.error("Erro ao acessar câmera. Verifique as permissões.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  const simulateScan = () => {
    setIsScanning(true);
    setScanResult(null);

    // Simulate facial recognition process
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      const confidence = success ? 85 + Math.random() * 15 : 30 + Math.random() * 30;
      
      setScanResult({
        success,
        message: success ? "Identificação confirmada" : "Usuário não reconhecido",
        confidence
      };
      
      const newLog: AccessLog = {
        id: Date.now().toString(),
        userId: success ? "u6" : "unknown",
        userName: success ? "Usuário Atual" : "Desconhecido",
        area: "Ponte de Comando",
        timestamp: new Date(),
        status: success ? "granted" : "denied",
        method: "facial",
        confidence
      };
      
      setAccessLogs(prev => [newLog, ...prev]);
      setIsScanning(false);
      
      if (success) {
        toast.success(`Acesso liberado (${confidence.toFixed(1)}% confiança)`);
      } else {
        toast.error("Acesso negado - Usuário não identificado");
      }
    }, 2000);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
    case "critical": return "bg-red-500/20 text-red-400 border-red-500/50";
    case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/50";
    case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
    case "low": return "bg-green-500/20 text-green-400 border-green-500/50";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "granted": return <CheckCircle2 className="h-4 w-4 text-green-400" />;
    case "denied": return <XCircle className="h-4 w-4 text-red-400" />;
    default: return <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ScanFace className="h-8 w-8 text-primary" />
            Controle de Acesso Biométrico
          </h1>
          <p className="text-muted-foreground mt-1">
            Reconhecimento facial para áreas restritas
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{accessLogs.filter(l => l.status === "granted").length}</div>
            <div className="text-xs text-muted-foreground">Acessos Hoje</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{accessLogs.filter(l => l.status === "denied").length}</div>
            <div className="text-xs text-muted-foreground">Negados</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scanner Facial
            </CardTitle>
            <CardDescription>Verificação biométrica em tempo real</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
              {stream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ScanFace className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              
              {isScanning && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="w-32 h-32 border-4 border-primary rounded-full animate-pulse" />
                </div>
              )}
            </div>

            {scanResult && (
              <div className={`p-4 rounded-lg ${scanResult.success ? "bg-green-500/10 border border-green-500/50" : "bg-red-500/10 border border-red-500/50"}`}>
                <div className="flex items-center gap-2">
                  {scanResult.success ? (
                    <Unlock className="h-5 w-5 text-green-400" />
                  ) : (
                    <Lock className="h-5 w-5 text-red-400" />
                  )}
                  <span className={scanResult.success ? "text-green-400" : "text-red-400"}>
                    {scanResult.message}
                  </span>
                </div>
                {scanResult.confidence && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Confiança: {scanResult.confidence.toFixed(1)}%
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              {!stream ? (
                <Button className="flex-1" onClick={startCamera}>
                  <Camera className="h-4 w-4 mr-2" />
                  Ativar Câmera
                </Button>
              ) : (
                <>
                  <Button 
                    className="flex-1" 
                    onClick={simulateScan}
                    disabled={isScanning}
                  >
                    <ScanFace className="h-4 w-4 mr-2" />
                    {isScanning ? "Escaneando..." : "Escanear"}
                  </Button>
                  <Button variant="outline" onClick={stopCamera}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="areas" className="space-y-4">
            <TabsList>
              <TabsTrigger value="areas">Áreas Restritas</TabsTrigger>
              <TabsTrigger value="logs">Histórico de Acesso</TabsTrigger>
              <TabsTrigger value="register">Cadastrar Usuário</TabsTrigger>
            </TabsList>

            <TabsContent value="areas">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {restrictedAreas.map((area) => (
                  <Card key={area.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{area.name}</h3>
                          <Badge className={getLevelColor(area.level)}>
                            {area.level === "critical" ? "Crítico" :
                              area.level === "high" ? "Alto" :
                                area.level === "medium" ? "Médio" : "Baixo"}
                          </Badge>
                        </div>
                        {area.requiresFacial ? (
                          <ScanFace className="h-5 w-5 text-primary" />
                        ) : (
                          <Shield className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Ocupação</span>
                          <span>{area.activeUsers}/{area.maxCapacity}</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              area.activeUsers / area.maxCapacity > 0.8 ? "bg-red-500" :
                                area.activeUsers / area.maxCapacity > 0.5 ? "bg-yellow-500" : "bg-green-500"
                            }`}
                            style={{ width: `${(area.activeUsers / area.maxCapacity) * 100}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{area.activeUsers} pessoas presentes</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Registro de Acessos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {accessLogs.map((log) => (
                        <div 
                          key={log.id} 
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(log.status)}
                            <div>
                              <p className="font-medium">{log.userName}</p>
                              <p className="text-sm text-muted-foreground">{log.area}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs">
                              {log.method === "facial" ? "Facial" : log.method === "card" ? "Cartão" : "PIN"}
                            </Badge>
                            {log.confidence && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {log.confidence.toFixed(1)}%
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {log.timestamp.toLocaleTimeString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Cadastrar Novo Usuário
                  </CardTitle>
                  <CardDescription>
                    Registre dados biométricos para controle de acesso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome Completo</Label>
                      <Input placeholder="Digite o nome" />
                    </div>
                    <div className="space-y-2">
                      <Label>Cargo</Label>
                      <Input placeholder="Digite o cargo" />
                    </div>
                    <div className="space-y-2">
                      <Label>Matrícula</Label>
                      <Input placeholder="Digite a matrícula" />
                    </div>
                    <div className="space-y-2">
                      <Label>Nível de Acesso</Label>
                      <Input placeholder="Selecione o nível" />
                    </div>
                  </div>
                  
                  <div className="p-4 border border-dashed rounded-lg text-center">
                    <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Capture 3 fotos para cadastro facial
                    </p>
                    <Button variant="outline" className="mt-2" onClick={startCamera}>
                      Iniciar Captura
                    </Button>
                  </div>

                  <Button className="w-full" onClick={() => toast.success("Usuário cadastrado com sucesso!"}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Cadastrar Usuário
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
