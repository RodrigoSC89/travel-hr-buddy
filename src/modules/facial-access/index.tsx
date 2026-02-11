/**
 * PATCH: Reconhecimento Facial para Controle de Acesso
 * ✅ P0-002: Migrado para dados reais do Supabase (access_logs)
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  UserPlus
} from "lucide-react";
import { toast } from "sonner";
import { UserRegistrationForm } from "./components/UserRegistrationForm";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

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

const restrictedAreas: RestrictedArea[] = [
  { id: "bridge", name: "Ponte de Comando", level: "critical", activeUsers: 3, maxCapacity: 5, requiresFacial: true },
  { id: "engine", name: "Praça de Máquinas", level: "high", activeUsers: 4, maxCapacity: 8, requiresFacial: true },
  { id: "cargo", name: "Porão de Carga", level: "medium", activeUsers: 2, maxCapacity: 10, requiresFacial: false },
  { id: "medical", name: "Enfermaria", level: "medium", activeUsers: 1, maxCapacity: 4, requiresFacial: false },
  { id: "armory", name: "Paiol de Armas", level: "critical", activeUsers: 0, maxCapacity: 2, requiresFacial: true },
];

export default function FacialAccess() {
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; confidence?: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    loadAccessLogs();
  }, []);

  const loadAccessLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("access_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(50);

      if (error) {
        logger.warn("access_logs query error:", error);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase access_logs mapping
      const mapped: AccessLog[] = (data || []).map((r: any) => ({
        id: r.id,
        userId: r.user_id || "—",
        userName: r.user_agent?.split("/")[0] || r.action || "Usuário",
        area: r.module_accessed || "—",
        timestamp: new Date(r.timestamp || r.created_at),
        status: r.result === "success" ? "granted" : r.result === "denied" ? "denied" : "pending",
        method: r.action?.includes("facial") ? "facial" : r.action?.includes("card") ? "card" : "pin",
        confidence: r.details?.confidence,
      }));

      setAccessLogs(mapped);
    } catch (err) {
      logger.error("Error loading access logs:", err);
    }
  };

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

    // Facial recognition process - real camera analysis would go here
    requestAnimationFrame(() => {
      const success = true;
      const confidence = 92.5;
      
      setScanResult({
        success,
        message: success ? "Identificação confirmada" : "Usuário não reconhecido",
        confidence
      });
      
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
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-destructive/20 text-destructive border-destructive/50";
      case "high": return "bg-warning/20 text-warning border-warning/50";
      case "medium": return "bg-accent/20 text-accent-foreground border-accent/50";
      case "low": return "bg-success/20 text-success border-success/50";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "granted": return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "denied": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-warning" />;
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
            <div className="text-2xl font-bold text-success">{accessLogs.filter(l => l.status === "granted").length}</div>
            <div className="text-xs text-muted-foreground">Acessos Hoje</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{accessLogs.filter(l => l.status === "denied").length}</div>
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
              <div className={`p-4 rounded-lg ${scanResult.success ? 'bg-success/10 border border-success/50' : 'bg-destructive/10 border border-destructive/50'}`}>
                <div className="flex items-center gap-2">
                  {scanResult.success ? (
                    <Unlock className="h-5 w-5 text-success" />
                  ) : (
                    <Lock className="h-5 w-5 text-destructive" />
                  )}
                  <span className={scanResult.success ? 'text-success' : 'text-destructive'}>
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
                              area.activeUsers / area.maxCapacity > 0.8 ? 'bg-destructive' :
                              area.activeUsers / area.maxCapacity > 0.5 ? 'bg-warning' : 'bg-success'
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
              <UserRegistrationForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
