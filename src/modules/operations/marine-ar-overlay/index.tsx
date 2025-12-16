import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Info,
  Thermometer,
  AlertTriangle,
  Zap,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface MarkerData {
  id: string;
  x: number; // Percentage position
  y: number; // Percentage position
  label: string;
  component: string;
  status: "normal" | "warning" | "critical";
  temperature?: number;
  consumption?: number;
  alerts?: string[];
  description?: string;
}

const MarineAROverlay = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const { toast } = useToast();

  // Constants
  const MARKER_CLICK_TOLERANCE = 5; // Percentage tolerance for marker click detection

  // Mock sensor data - in production, this would come from real sensors
  const [markers, setMarkers] = useState<MarkerData[]>([
    {
      id: "engine-1",
      x: 30,
      y: 40,
      label: "Motor Principal",
      component: "Main Engine",
      status: "normal",
      temperature: 85,
      consumption: 120,
      description: "Motor diesel principal de 4 tempos, potência nominal de 2500HP",
    },
    {
      id: "panel-1",
      x: 70,
      y: 25,
      label: "Painel Elétrico",
      component: "Electrical Panel",
      status: "warning",
      temperature: 45,
      consumption: 85,
      alerts: ["Voltagem ligeiramente acima do normal"],
      description: "Painel de distribuição elétrica principal, 440V trifásico",
    },
    {
      id: "hydraulic-1",
      x: 50,
      y: 65,
      label: "Sistema Hidráulico",
      component: "Hydraulic System",
      status: "critical",
      temperature: 92,
      consumption: 65,
      alerts: ["Temperatura acima do limite", "Pressão irregular"],
      description: "Sistema hidráulico de guindastes e leme, pressão nominal 180 bar",
    },
    {
      id: "generator-1",
      x: 15,
      y: 75,
      label: "Gerador Auxiliar",
      component: "Auxiliary Generator",
      status: "normal",
      temperature: 78,
      consumption: 95,
      description: "Gerador diesel auxiliar, 500kW, operando em modo standby",
    },
  ]);

  useEffect(() => {
    // Simulate real-time sensor updates
    const interval = setInterval(() => {
      setMarkers(prev => prev.map(marker => ({
        ...marker,
        temperature: (marker.temperature || 0) + (Math.random() - 0.5) * 2,
        consumption: (marker.consumption || 0) + (Math.random() - 0.5) * 5,
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
        toast({
          title: "Câmera Ativada",
          description: "AR overlay pronto para uso",
        });
        drawOverlay();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Erro na Câmera",
        description: "Não foi possível acessar a câmera. Usando demo.",
        variant: "destructive",
      });
      // Use demo mode
      setIsStreamActive(true);
      drawOverlay();
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreamActive(false);
  };

  const drawOverlay = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      if (!isStreamActive) return;

      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw video frame if available
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } else {
        // Demo background
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Demo Mode - Simulação AR", canvas.width / 2, canvas.height / 2);
      }

      // Draw markers
      markers.forEach(marker => {
        const x = (marker.x / 100) * canvas.width;
        const y = (marker.y / 100) * canvas.height;

        // Marker color based on status
        const color = 
          marker.status === "critical" ? "#ef4444" :
            marker.status === "warning" ? "#f59e0b" :
              "#22c55e";

        // Draw marker point
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw pulsing ring for critical items
        if (marker.status === "critical") {
          const pulse = Math.sin(Date.now() / 200) * 5 + 10;
          ctx.beginPath();
          ctx.arc(x, y, 8 + pulse, 0, 2 * Math.PI);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Draw label
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(x - 60, y - 50, 120, 40);
        ctx.fillStyle = "#fff";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(marker.label, x, y - 32);
        
        // Draw temperature
        if (marker.temperature) {
          ctx.font = "10px sans-serif";
          ctx.fillStyle = color;
          ctx.fillText(
            `🌡️ ${marker.temperature.toFixed(1)}°C`,
            x,
            y - 18
          );
        }
      });

      requestAnimationFrame(draw);
    };

    draw();
  };

  useEffect(() => {
    if (isStreamActive) {
      drawOverlay();
    }
  }, [isStreamActive, markers]);

  const handleMarkerClick = (marker: MarkerData) => {
    setSelectedMarker(marker);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "critical":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default:
      return <Info className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Camera className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">AR Marine Overlay</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Realidade Aumentada para Monitoramento Marítimo
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {!isStreamActive ? (
                  <Button onClick={startCamera} size="lg">
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar AR
                  </Button>
                ) : (
                  <>
                    <Button onClick={stopCamera} variant="destructive" size="lg">
                      <Pause className="h-4 w-4 mr-2" />
                      Parar
                    </Button>
                    <Button onClick={drawOverlay} variant="outline" size="lg">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* AR View */}
          <Card className="lg:col-span-2">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
                {/* Video element is hidden as Canvas renders the overlay - the canvas draws the video frame */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover opacity-0"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full cursor-crosshair"
                  onClick={(e) => {
                    const rect = canvasRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    
                    // Find clicked marker
                    const clickedMarker = markers.find(m => 
                      Math.abs(m.x - x) < MARKER_CLICK_TOLERANCE && Math.abs(m.y - y) < MARKER_CLICK_TOLERANCE
                    );
                    
                    if (clickedMarker) {
                      handleMarkerClick(clickedMarker);
                    }
                  }}
                />
                
                {!isStreamActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold">AR Desativado</p>
                      <p className="text-sm opacity-75">Clique em "Iniciar AR" para começar</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Marker Info Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedMarker ? "Detalhes do Componente" : "Componentes Monitorados"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMarker ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedMarker.status)}
                    <h3 className="font-semibold">{selectedMarker.label}</h3>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">{selectedMarker.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="p-2 bg-muted rounded">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Thermometer className="h-3 w-3" />
                          Temperatura
                        </div>
                        <div className="font-semibold">
                          {selectedMarker.temperature?.toFixed(1)}°C
                        </div>
                      </div>
                      
                      <div className="p-2 bg-muted rounded">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Zap className="h-3 w-3" />
                          Consumo
                        </div>
                        <div className="font-semibold">
                          {selectedMarker.consumption?.toFixed(0)} kW
                        </div>
                      </div>
                    </div>

                    {selectedMarker.alerts && selectedMarker.alerts.length > 0 && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800">
                        <p className="font-semibold text-red-800 dark:text-red-200 text-xs mb-2">
                          ⚠️ Alertas Ativos
                        </p>
                        <ul className="space-y-1">
                          {selectedMarker.alerts.map((alert, idx) => (
                            <li key={idx} className="text-xs text-red-700 dark:text-red-300">
                              • {alert}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setSelectedMarker(null)}
                  >
                    Fechar
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {markers.map((marker) => (
                    <button
                      key={marker.id}
                      onClick={() => handleMarkerClick(marker)}
                      className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(marker.status)}
                          <span className="font-medium text-sm">{marker.label}</span>
                        </div>
                        <Badge
                          variant={
                            marker.status === "critical" ? "destructive" :
                              marker.status === "warning" ? "secondary" :
                                "default"
                          }
                        >
                          {marker.status}
                        </Badge>
                      </div>
                      {marker.temperature && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {marker.temperature.toFixed(1)}°C
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-1">📱 WebAR Capacitor</p>
                <p className="text-muted-foreground">
                  Acesso à câmera via Capacitor para sobreposição em tempo real
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">🎨 Canvas 2D Overlay</p>
                <p className="text-muted-foreground">
                  Marcadores visuais desenhados dinamicamente sobre o vídeo
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">🤖 IA Integrada</p>
                <p className="text-muted-foreground">
                  Descrições técnicas e análises geradas por IA em tempo real
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarineAROverlay;
