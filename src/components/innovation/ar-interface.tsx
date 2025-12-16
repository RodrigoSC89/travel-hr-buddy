import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Camera,
  Scan,
  Eye,
  Layers,
  Info,
  MapPin,
  Settings,
  Smartphone,
  Tablet,
  Monitor,
  QrCode,
  Navigation,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Zap,
  Anchor
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ARObject {
  id: string;
  name: string;
  type: "equipment" | "safety" | "navigation" | "maintenance" | "info";
  position: { x: number; y: number; z: number };
  description: string;
  status: "active" | "warning" | "maintenance" | "normal";
  details: string;
  actions: string[];
  qrCode?: string;
}

interface ARSession {
  id: string;
  name: string;
  type: "vessel_inspection" | "maintenance" | "training" | "navigation" | "cargo_check";
  device: "phone" | "tablet" | "hololens";
  status: "active" | "paused" | "completed";
  duration: number;
  objectsScanned: number;
  accuracy: number;
}

export const ARInterface: React.FC = () => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [selectedObject, setSelectedObject] = useState<ARObject | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);

  const [arObjects] = useState<ARObject[]>([
    {
      id: "1",
      name: "Motor Principal",
      type: "equipment",
      position: { x: 0.5, y: 0.3, z: 0.8 },
      description: "Motor diesel principal 2000HP",
      status: "active",
      details: "Temperatura: 78°C, RPM: 1200, Pressão: 12 bar",
      actions: ["Verificar Óleo", "Medir Temperatura", "Inspeção Visual"],
      qrCode: "QR_MOTOR_001"
    },
    {
      id: "2",
      name: "Extintor de Incêndio",
      type: "safety",
      position: { x: 0.2, y: 0.6, z: 0.4 },
      description: "Extintor CO2 5kg",
      status: "normal",
      details: "Última inspeção: 15/01/2024, Pressão: OK",
      actions: ["Verificar Pressão", "Testar Válvula", "Verificar Validade"],
      qrCode: "QR_EXT_002"
    },
    {
      id: "3",
      name: "Painel de Navegação",
      type: "navigation",
      position: { x: 0.7, y: 0.4, z: 0.6 },
      description: "Sistema GPS e radar",
      status: "active",
      details: "GPS: Ativo, Radar: Funcionando, Bússola: Calibrada",
      actions: ["Calibrar Bússola", "Testar GPS", "Verificar Radar"],
      qrCode: "QR_NAV_003"
    },
    {
      id: "4",
      name: "Válvula de Combustível",
      type: "maintenance",
      position: { x: 0.4, y: 0.7, z: 0.3 },
      description: "Válvula principal linha de combustível",
      status: "warning",
      details: "Possível vazamento detectado - Verificar urgente",
      actions: ["Inspeção Detalhada", "Teste de Vazamento", "Substituir Vedações"],
      qrCode: "QR_VAL_004"
    }
  ]);

  const [arSessions] = useState<ARSession[]>([
    {
      id: "1",
      name: "Inspeção Sala de Máquinas",
      type: "vessel_inspection",
      device: "tablet",
      status: "active",
      duration: 25,
      objectsScanned: 12,
      accuracy: 94
    },
    {
      id: "2",
      name: "Manutenção Preventiva Motor",
      type: "maintenance",
      device: "phone",
      status: "completed",
      duration: 45,
      objectsScanned: 8,
      accuracy: 98
    },
    {
      id: "3",
      name: "Treinamento Segurança",
      type: "training",
      device: "hololens",
      status: "paused",
      duration: 18,
      objectsScanned: 5,
      accuracy: 91
    }
  ]);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission(true);
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      setCameraPermission(false);
    }
  };

  const startARSession = async () => {
    if (!cameraPermission) {
      toast({
        title: "Permissão Necessária",
        description: "Permita o acesso à câmera para usar AR",
        variant: "destructive"
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsARActive(true);
      toast({
        title: "AR Ativado",
        description: "Aponte a câmera para objetos com QR codes",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera",
        variant: "destructive"
      });
    }
  };

  const stopARSession = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsARActive(false);
    setSelectedObject(null);
    
    toast({
      title: "AR Desativado",
      description: "Sessão AR finalizada",
    });
  };

  const simulateObjectDetection = (objectId: string) => {
    const object = arObjects.find(obj => obj.id === objectId);
    if (object) {
      setSelectedObject(object);
      toast({
        title: "Objeto Detectado",
        description: `${object.name} identificado via AR`,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "active": return "text-green-600 bg-green-100";
    case "normal": return "text-blue-600 bg-blue-100";
    case "warning": return "text-yellow-600 bg-yellow-100";
    case "maintenance": return "text-red-600 bg-red-100";
    default: return "text-muted-foreground bg-gray-100";
    }
  };

  const getObjectIcon = (type: string) => {
    switch (type) {
    case "equipment": return <Zap className="h-5 w-5" />;
    case "safety": return <AlertTriangle className="h-5 w-5" />;
    case "navigation": return <Navigation className="h-5 w-5" />;
    case "maintenance": return <Wrench className="h-5 w-5" />;
    case "info": return <Info className="h-5 w-5" />;
    default: return <Info className="h-5 w-5" />;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
    case "phone": return <Smartphone className="h-4 w-4" />;
    case "tablet": return <Tablet className="h-4 w-4" />;
    case "hololens": return <Monitor className="h-4 w-4" />;
    default: return <Smartphone className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Eye className="h-8 w-8 text-purple-500" />
            Interface de Realidade Aumentada
          </h1>
          <p className="text-muted-foreground">
            Visualização e interação com equipamentos em realidade aumentada
          </p>
        </div>
        <div className="flex items-center gap-4">
          {cameraPermission === false && (
            <Button variant="outline" onClick={checkCameraPermission}>
              <Camera className="h-4 w-4 mr-2" />
              Permitir Câmera
            </Button>
          )}
          {!isARActive ? (
            <Button onClick={startARSession} disabled={!cameraPermission}>
              <Scan className="h-4 w-4 mr-2" />
              Iniciar AR
            </Button>
          ) : (
            <Button variant="destructive" onClick={stopARSession}>
              <Eye className="h-4 w-4 mr-2" />
              Parar AR
            </Button>
          )}
        </div>
      </div>

      {/* AR Camera View */}
      {isARActive && (
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="relative w-full h-96 bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
              
              {/* AR Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Simulated AR objects */}
                {arObjects.map((object) => (
                  <div
                    key={object.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer"
                    style={{
                      left: `${object.position.x * 100}%`,
                      top: `${object.position.y * 100}%`
                    }}
                    onClick={() => simulateObjectDetection(object.id)}
                  >
                    <div className="bg-azure-100/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border">
                      <div className="flex items-center gap-2">
                        {getObjectIcon(object.type)}
                        <span className="text-sm font-medium">{object.name}</span>
                        <Badge className={getStatusColor(object.status)} variant="outline">
                          {object.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AR Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
                  <Button size="sm" variant="ghost" className="text-azure-50">
                    <QrCode className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-azure-50">
                    <Layers className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-azure-50">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Object Details */}
      {selectedObject && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getObjectIcon(selectedObject.type)}
              {selectedObject.name}
              <Badge className={getStatusColor(selectedObject.status)}>
                {selectedObject.status}
              </Badge>
            </CardTitle>
            <CardDescription>{selectedObject.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Detalhes:</h4>
              <p className="text-sm text-muted-foreground">{selectedObject.details}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Ações Disponíveis:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedObject.actions.map((action, index) => (
                  <Button key={index} variant="outline" size="sm">
                    {action}
                  </Button>
                ))}
              </div>
            </div>
            {selectedObject.qrCode && (
              <div>
                <h4 className="font-medium mb-2">QR Code:</h4>
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <QrCode className="h-4 w-4" />
                  <span className="text-sm font-mono">{selectedObject.qrCode}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="objects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="objects">Objetos AR</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="training">Treinamento</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="objects" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {arObjects.map((object) => (
              <Card key={object.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {getObjectIcon(object.type)}
                      {object.name}
                    </CardTitle>
                    <Badge className={getStatusColor(object.status)}>
                      {object.status}
                    </Badge>
                  </div>
                  <CardDescription>{object.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm font-medium">Tipo:</span>
                    <p className="text-sm text-muted-foreground capitalize">{object.type}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Posição AR:</span>
                    <p className="text-sm text-muted-foreground">
                      X: {object.position.x}, Y: {object.position.y}, Z: {object.position.z}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Detalhes:</span>
                    <p className="text-sm text-muted-foreground">{object.details}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedObject(object)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button size="sm" variant="outline">
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="space-y-4">
            {arSessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(session.device)}
                      <div>
                        <h3 className="font-semibold">{session.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {session.type.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      session.status === "active" ? "default" :
                        session.status === "paused" ? "secondary" : "outline"
                    }>
                      {session.status === "active" ? "Ativo" :
                        session.status === "paused" ? "Pausado" : "Concluído"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Duração:</span>
                      <p className="text-muted-foreground">{session.duration} min</p>
                    </div>
                    <div>
                      <span className="font-medium">Objetos:</span>
                      <p className="text-muted-foreground">{session.objectsScanned}</p>
                    </div>
                    <div>
                      <span className="font-medium">Precisão:</span>
                      <p className="text-muted-foreground">{session.accuracy}%</p>
                    </div>
                    <div>
                      <span className="font-medium">Dispositivo:</span>
                      <p className="text-muted-foreground capitalize">{session.device}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {session.status === "active" && (
                      <Button size="sm" variant="outline">
                        Pausar Sessão
                      </Button>
                    )}
                    {session.status === "paused" && (
                      <Button size="sm">
                        Continuar
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      Ver Relatório
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Módulos de Treinamento AR</CardTitle>
                <CardDescription>
                  Treinamentos interativos com realidade aumentada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Segurança Marítima Básica", duration: "30 min", level: "Iniciante" },
                  { title: "Manutenção de Motores", duration: "45 min", level: "Intermediário" },
                  { title: "Navegação Avançada", duration: "60 min", level: "Avançado" },
                  { title: "Procedimentos de Emergência", duration: "40 min", level: "Intermediário" }
                ].map((module, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{module.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {module.duration} • {module.level}
                      </div>
                    </div>
                    <Button size="sm">Iniciar</Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progresso de Treinamento</CardTitle>
                <CardDescription>
                  Seu progresso nos módulos AR
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { name: "Segurança Básica", progress: 100, status: "completed" },
                    { name: "Manutenção Motores", progress: 65, status: "in_progress" },
                    { name: "Navegação", progress: 0, status: "not_started" },
                    { name: "Emergências", progress: 25, status: "in_progress" }
                  ].map((course, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{course.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{course.progress}%</span>
                          {course.status === "completed" && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            course.status === "completed" ? "bg-green-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de AR</CardTitle>
                <CardDescription>
                  Ajustes para melhor experiência AR
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Detecção Automática</span>
                      <p className="text-sm text-muted-foreground">
                        Reconhecer objetos automaticamente
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Sobreposição de Informações</span>
                      <p className="text-sm text-muted-foreground">
                        Mostrar detalhes em tempo real
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Rastreamento de Mão</span>
                      <p className="text-sm text-muted-foreground">
                        Controles gestuais (HoloLens)
                      </p>
                    </div>
                    <input type="checkbox" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Histórico de Sessões</span>
                      <p className="text-sm text-muted-foreground">
                        Salvar dados das sessões AR
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calibração de Dispositivo</CardTitle>
                <CardDescription>
                  Ajustar precisão para seu dispositivo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Precisão de Detecção:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm">Baixa</span>
                      <input type="range" className="flex-1" defaultValue="75" />
                      <span className="text-sm">Alta</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Sensibilidade da Câmera:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm">Baixa</span>
                      <input type="range" className="flex-1" defaultValue="60" />
                      <span className="text-sm">Alta</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Distância de Rastreamento:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm">Perto</span>
                      <input type="range" className="flex-1" defaultValue="50" />
                      <span className="text-sm">Longe</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full">Executar Calibração</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};