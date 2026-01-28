/**
 * Vessel 3D Viewer Component
 * Interactive Three.js 3D model with hotspots and navigation
 */
import { useState, useRef, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  Html,
  Grid,
  Float
} from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw,
  Maximize2,
  Box,
  Eye,
  EyeOff,
  Info,
  AlertTriangle,
  CheckCircle,
  Settings,
  Anchor,
  Ship,
  Layers
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Hotspot {
  id: string;
  position: [number, number, number];
  label: string;
  description: string;
  category: "engine" | "bridge" | "deck" | "cargo" | "safety" | "navigation";
  status: "operational" | "warning" | "critical" | "maintenance";
  partId?: string;
}

interface Viewer3DProps {
  vesselId: string;
}

// Default hotspots for vessel
const defaultHotspots: Hotspot[] = [
  {
    id: "bridge",
    position: [0, 2.5, 3],
    label: "Ponte de Comando",
    description: "Centro de controle e navegação da embarcação",
    category: "bridge",
    status: "operational"
  },
  {
    id: "engine-room",
    position: [0, 0, -2],
    label: "Praça de Máquinas",
    description: "Motor principal e sistemas auxiliares",
    category: "engine",
    status: "operational"
  },
  {
    id: "cargo-hold-1",
    position: [-1.5, 0.5, 1],
    label: "Porão de Carga 1",
    description: "Capacidade: 5.000 m³",
    category: "cargo",
    status: "operational"
  },
  {
    id: "cargo-hold-2",
    position: [1.5, 0.5, 1],
    label: "Porão de Carga 2",
    description: "Capacidade: 5.000 m³",
    category: "cargo",
    status: "warning"
  },
  {
    id: "bow-thruster",
    position: [0, -0.5, 4.5],
    label: "Propulsor de Proa",
    description: "Sistema de manobra auxiliar",
    category: "navigation",
    status: "operational"
  },
  {
    id: "lifeboat-1",
    position: [-2, 1.5, 0],
    label: "Bote Salva-vidas BB",
    description: "Capacidade: 25 pessoas",
    category: "safety",
    status: "operational"
  },
  {
    id: "lifeboat-2",
    position: [2, 1.5, 0],
    label: "Bote Salva-vidas BE",
    description: "Capacidade: 25 pessoas",
    category: "safety",
    status: "maintenance"
  },
  {
    id: "radar",
    position: [0, 3.5, 2.5],
    label: "Radar de Navegação",
    description: "X-Band e S-Band ARPA",
    category: "navigation",
    status: "operational"
  },
  {
    id: "anchor-system",
    position: [0, 0.5, 5],
    label: "Sistema de Fundeio",
    description: "Âncoras e cabrestantes",
    category: "deck",
    status: "operational"
  },
  {
    id: "stern-propeller",
    position: [0, -1, -4],
    label: "Hélice Principal",
    description: "Propulsão principal de 8.000 HP",
    category: "engine",
    status: "critical"
  }
];

// Hotspot marker component
function HotspotMarker({ 
  hotspot, 
  isSelected, 
  onClick,
  showLabels
}: { 
  hotspot: Hotspot; 
  isSelected: boolean;
  onClick: () => void;
  showLabels: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(
        isSelected ? 1.3 : hovered ? 1.1 : 1
      );
      // Pulse animation for critical status
      if (hotspot.status === "critical") {
        meshRef.current.scale.multiplyScalar(
          1 + Math.sin(state.clock.elapsedTime * 4) * 0.1
        );
      }
    }
  });

  const statusColor = {
    operational: "#22c55e",
    warning: "#f59e0b",
    critical: "#ef4444",
    maintenance: "#3b82f6"
  }[hotspot.status];

  return (
    <group position={hotspot.position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color={statusColor} 
          emissive={statusColor}
          emissiveIntensity={isSelected || hovered ? 0.8 : 0.4}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Ring indicator */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.25, 32]} />
        <meshBasicMaterial 
          color={statusColor} 
          transparent 
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Label */}
      {(showLabels || hovered || isSelected) && (
        <Html
          position={[0, 0.4, 0]}
          center
          style={{
            pointerEvents: "none",
            transition: "opacity 0.2s",
            opacity: showLabels || hovered || isSelected ? 1 : 0
          }}
        >
          <div className="bg-background/90 backdrop-blur-sm border rounded-lg px-3 py-1.5 shadow-lg whitespace-nowrap">
            <span className="text-sm font-medium">{hotspot.label}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

// Simple vessel model (placeholder - would load GLTF in production)
function VesselModel() {
  return (
    <group>
      {/* Hull */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4, 1.5, 10]} />
        <meshStandardMaterial color="hsl(var(--muted-foreground))" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Bow */}
      <mesh position={[0, 0, 5.5]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[2.8, 3, 4]} />
        <meshStandardMaterial color="hsl(var(--muted-foreground))" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Superstructure */}
      <mesh position={[0, 1.5, 2]}>
        <boxGeometry args={[3, 2, 3]} />
        <meshStandardMaterial color="hsl(var(--muted))" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Bridge */}
      <mesh position={[0, 3, 2.5]}>
        <boxGeometry args={[2.5, 1, 2]} />
        <meshStandardMaterial color="hsl(var(--secondary))" metalness={0.4} roughness={0.6} />
      </mesh>
      
      {/* Windows */}
      <mesh position={[0, 3.2, 3.55]}>
        <boxGeometry args={[2.2, 0.6, 0.1]} />
        <meshStandardMaterial color="hsl(var(--primary))" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Funnel */}
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 2, 16]} />
        <meshStandardMaterial color="hsl(var(--destructive))" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Mast */}
      <mesh position={[0, 4.5, 2.5]}>
        <cylinderGeometry args={[0.08, 0.08, 3, 8]} />
        <meshStandardMaterial color="hsl(var(--border))" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Radar */}
      <mesh position={[0, 5.8, 2.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshStandardMaterial color="hsl(var(--border))" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Deck details */}
      <mesh position={[0, 0.8, -2]}>
        <boxGeometry args={[3.5, 0.3, 3]} />
        <meshStandardMaterial color="hsl(var(--muted))" metalness={0.4} roughness={0.6} />
      </mesh>
      
      {/* Crane */}
      <mesh position={[-1, 1.5, -1]}>
        <boxGeometry args={[0.2, 2, 0.2]} />
        <meshStandardMaterial color="hsl(var(--accent))" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[-1, 2.5, 0]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.1, 3, 0.1]} />
        <meshStandardMaterial color="hsl(var(--accent))" metalness={0.3} roughness={0.6} />
      </mesh>
    </group>
  );
}

// Camera controls component
function CameraController({ 
  resetView 
}: { 
  resetView: boolean;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (resetView && controlsRef.current) {
      camera.position.lerp(new THREE.Vector3(10, 8, 10), 0.05);
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={5}
      maxDistance={30}
      maxPolarAngle={Math.PI / 2}
    />
  );
}

// Main 3D Scene
function Scene({ 
  hotspots, 
  selectedHotspot, 
  onHotspotClick,
  showLabels,
  showGrid,
  resetView,
}: {
  hotspots: Hotspot[];
  selectedHotspot: string | null;
  onHotspotClick: (id: string) => void;
  showLabels: boolean;
  showGrid: boolean;
  resetView: boolean;
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[10, 8, 10]} fov={50} />
      <CameraController resetView={resetView} />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
      
      {/* Environment */}
      <Environment preset="city" />
      
      {/* Water plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#0c4a6e" 
          metalness={0.9} 
          roughness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Grid */}
      {showGrid && (
        <Grid 
          position={[0, -0.99, 0]}
          args={[50, 50]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#1e40af"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#1e3a8a"
          fadeDistance={50}
          fadeStrength={1}
          followCamera={false}
        />
      )}
      
      {/* Vessel */}
      <Float
        speed={1}
        rotationIntensity={0.1}
        floatIntensity={0.3}
      >
        <VesselModel />
        
        {/* Hotspots */}
        {hotspots.map((hotspot) => (
          <HotspotMarker
            key={hotspot.id}
            hotspot={hotspot}
            isSelected={selectedHotspot === hotspot.id}
            onClick={() => onHotspotClick(hotspot.id)}
            showLabels={showLabels}
          />
        ))}
      </Float>
    </>
  );
}

export default function Viewer3D({ vesselId }: Viewer3DProps) {
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [resetView, setResetView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hotspots = defaultHotspots;

  const handleHotspotClick = useCallback((id: string) => {
    setSelectedHotspot(prev => prev === id ? null : id);
  }, []);

  const handleResetView = useCallback(() => {
    setResetView(true);
    setTimeout(() => setResetView(false), 1000);
    setSelectedHotspot(null);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const selectedHotspotData = hotspots.find(h => h.id === selectedHotspot);

  const statusIcon = {
    operational: <CheckCircle className="h-4 w-4 text-green-500" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    critical: <AlertTriangle className="h-4 w-4 text-red-500" />,
    maintenance: <Settings className="h-4 w-4 text-blue-500" />
  };

  const categoryIcon = {
    engine: <Settings className="h-4 w-4" />,
    bridge: <Ship className="h-4 w-4" />,
    deck: <Anchor className="h-4 w-4" />,
    cargo: <Box className="h-4 w-4" />,
    safety: <AlertTriangle className="h-4 w-4" />,
    navigation: <Ship className="h-4 w-4" />
  };

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 3D Viewer */}
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5" />
                Modelo 3D da Embarcação
              </CardTitle>
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setShowLabels(!showLabels)}
                      >
                        {showLabels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {showLabels ? "Ocultar Labels" : "Mostrar Labels"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setShowGrid(!showGrid)}
                      >
                        <Layers className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {showGrid ? "Ocultar Grid" : "Mostrar Grid"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={handleResetView}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Resetar Vista</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={toggleFullscreen}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Tela Cheia</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className={`relative ${isFullscreen ? 'h-screen' : 'h-[500px]'} rounded-b-lg overflow-hidden bg-gradient-to-b from-sky-900 to-blue-950`}>
              <Canvas shadows>
                <Suspense fallback={null}>
                  <Scene
                    hotspots={hotspots}
                    selectedHotspot={selectedHotspot}
                    onHotspotClick={handleHotspotClick}
                    showLabels={showLabels}
                    showGrid={showGrid}
                    resetView={resetView}
                  />
                </Suspense>
              </Canvas>
              
              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border">
                <p className="text-xs font-medium mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs">Operacional</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-xs">Atenção</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-xs">Crítico</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-xs">Manutenção</span>
                  </div>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 border">
                <p className="text-xs text-muted-foreground">
                  🖱️ Arraste para rotacionar • Scroll para zoom • Clique nos pontos para detalhes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Hotspots Panel */}
        <Card className="w-full lg:w-80">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4" />
              Pontos de Interesse
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[460px]">
              <div className="p-4 space-y-2">
                {hotspots.map((hotspot) => (
                  <button
                    key={hotspot.id}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedHotspot === hotspot.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleHotspotClick(hotspot.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {categoryIcon[hotspot.category]}
                        </span>
                        <div>
                          <p className="font-medium text-sm">{hotspot.label}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {hotspot.description}
                          </p>
                        </div>
                      </div>
                      {statusIcon[hotspot.status]}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      {/* Selected Hotspot Details */}
      {selectedHotspotData && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {categoryIcon[selectedHotspotData.category]}
                {selectedHotspotData.label}
              </CardTitle>
              <Badge variant={
                selectedHotspotData.status === "operational" ? "default" :
                selectedHotspotData.status === "warning" ? "secondary" :
                selectedHotspotData.status === "critical" ? "destructive" : "outline"
              }>
                {statusIcon[selectedHotspotData.status]}
                <span className="ml-1 capitalize">{selectedHotspotData.status}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{selectedHotspotData.description}</p>
            <div className="flex gap-2">
              <Button size="sm">
                <Info className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manutenção
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
