/**
 * Vessel Digital Twin 3D Visualization
 * PATCH AUTONOMOUS: React Three Fiber based vessel visualization
 */

import { Suspense, useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Html, Float, MeshWobbleMaterial, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Thermometer,
  Activity,
  Gauge
} from 'lucide-react';
import type { VesselState, EquipmentState } from '@/lib/ai/autonomous';

// Vessel Hull Component
function VesselHull({ health = 1 }: { health?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const hullColor = useMemo(() => {
    if (health > 0.8) return '#1e40af'; // Blue - healthy
    if (health > 0.5) return '#ca8a04'; // Yellow - warning
    return '#dc2626'; // Red - critical
  }, [health]);

  return (
    <group>
      {/* Main Hull */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[8, 1.5, 2]} />
        <meshStandardMaterial color={hullColor} metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Bow (front) */}
      <mesh position={[4.5, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[1.5, 1, 2]} />
        <meshStandardMaterial color={hullColor} metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Stern (back) */}
      <mesh position={[-4, 0.25, 0]}>
        <boxGeometry args={[1, 1, 1.8]} />
        <meshStandardMaterial color={hullColor} metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

// Bridge/Superstructure Component
function Bridge({ health = 1 }: { health?: number }) {
  const bridgeColor = health > 0.7 ? '#374151' : '#991b1b';
  
  return (
    <group position={[-1, 1.5, 0]}>
      {/* Main Bridge */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 1.5, 1.5]} />
        <meshStandardMaterial color={bridgeColor} metalness={0.4} roughness={0.6} />
      </mesh>
      
      {/* Windows */}
      <mesh position={[1.01, 0.2, 0]}>
        <boxGeometry args={[0.05, 0.6, 1.2]} />
        <meshStandardMaterial color="#60a5fa" metalness={0.8} roughness={0.2} transparent opacity={0.7} />
      </mesh>
      
      {/* Radar Mast */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1.5, 8]} />
        <meshStandardMaterial color="#6b7280" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Radar Dish */}
      <mesh position={[0, 2.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Engine Room Indicator
function EngineRoom({ temperature = 75, vibration = 2 }: { temperature?: number; vibration?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Animate based on vibration
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * vibration * 2) * 0.01;
    }
  });
  
  const engineColor = useMemo(() => {
    if (temperature < 80) return '#22c55e';
    if (temperature < 95) return '#eab308';
    return '#ef4444';
  }, [temperature]);

  return (
    <group position={[-3, 0.2, 0]}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.5, 0.8, 1.2]} />
        <meshStandardMaterial color={engineColor} metalness={0.7} roughness={0.3} emissive={engineColor} emissiveIntensity={0.2} />
      </mesh>
      
      {/* Exhaust Stack */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 1, 8]} />
        <meshStandardMaterial color="#4b5563" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

// Propeller Component
function Propeller({ rpm = 850 }: { rpm?: number }) {
  const propRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (propRef.current) {
      propRef.current.rotation.x += (rpm / 10000);
    }
  });

  return (
    <group position={[-4.5, -0.5, 0]}>
      <group ref={propRef}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`prop-blade-${i}`} rotation={[0, 0, (Math.PI / 2) * i]}>
            <boxGeometry args={[0.6, 0.1, 0.2]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>
      {/* Propeller Hub */}
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Water Surface
function WaterSurface() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 - 1;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[50, 50, 32, 32]} />
      <MeshWobbleMaterial 
        color="#0369a1" 
        factor={0.1} 
        speed={2}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

// Info Label Component
function InfoLabel({ 
  position, 
  label, 
  value, 
  unit,
  visible = true 
}: { 
  position: [number, number, number]; 
  label: string; 
  value: string | number; 
  unit?: string;
  visible?: boolean;
}) {
  if (!visible) return null;
  
  return (
    <Html position={position} center>
      <div className="bg-background/90 backdrop-blur-sm border rounded-lg px-2 py-1 text-xs whitespace-nowrap shadow-lg">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-bold">{value}{unit && <span className="text-muted-foreground ml-1">{unit}</span>}</p>
      </div>
    </Html>
  );
}

// Helper function to get equipment by type
function getEquipmentByType(equipment: EquipmentState[], type: string): EquipmentState | undefined {
  return equipment.find(eq => eq.type === type || eq.id.includes(type));
}

// Main Vessel Scene
function VesselScene({ 
  vesselState, 
  showLabels = true,
  showWater = true 
}: { 
  vesselState?: VesselState | null; 
  showLabels?: boolean;
  showWater?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Get equipment data safely
  const mainEngine = vesselState?.equipment ? getEquipmentByType(vesselState.equipment, 'engine') : undefined;
  
  // Default values if no vessel state
  const health = mainEngine?.health ? mainEngine.health / 100 : 0.95;
  const temperature = mainEngine?.temperature || 78;
  const rpm = 850; // RPM would need to be added to EquipmentState if needed
  const speed = vesselState?.speed || 12.5;
  const heading = vesselState?.heading || 45;
  const vibration = mainEngine?.vibration || 2;
  
  // Gentle vessel motion
  useFrame((state) => {
    if (groupRef.current) {
      // Roll motion
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
      // Pitch motion
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, 5, -5]} intensity={0.3} />
      
      {/* Environment */}
      <Environment preset="sunset" />
      
      {/* Water */}
      {showWater && <WaterSurface />}
      
      {/* Vessel Group */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <group ref={groupRef}>
          <VesselHull health={health} />
          <Bridge health={health} />
          <EngineRoom temperature={temperature} vibration={vibration} />
          <Propeller rpm={rpm} />
          
          {/* Info Labels */}
          <InfoLabel 
            position={[-3, 2, 0]} 
            label="Motor Principal" 
            value={temperature.toFixed(0)} 
            unit="°C"
            visible={showLabels}
          />
          <InfoLabel 
            position={[-1, 3, 0]} 
            label="Ponte" 
            value={`${speed.toFixed(1)}`} 
            unit="nós"
            visible={showLabels}
          />
          <InfoLabel 
            position={[3, 1.5, 0]} 
            label="Proa" 
            value={`${heading.toFixed(0)}°`}
            visible={showLabels}
          />
          <InfoLabel 
            position={[-4.5, 0.5, 0]} 
            label="Propulsor" 
            value={rpm} 
            unit="RPM"
            visible={showLabels}
          />
        </group>
      </Float>
      
      {/* Camera Controls */}
      <OrbitControls 
        makeDefault
        minDistance={5}
        maxDistance={30}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

// Loading Fallback
function LoadingFallback() {
  return (
    <Html center>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Carregando Digital Twin...</p>
      </div>
    </Html>
  );
}

// Main Component
interface VesselDigitalTwin3DProps {
  vesselState?: VesselState | null;
  className?: string;
}

export function VesselDigitalTwin3D({ vesselState, className }: VesselDigitalTwin3DProps) {
  const [showLabels, setShowLabels] = useState(true);
  const [showWater, setShowWater] = useState(true);
  
  // Get equipment health safely
  const mainEngine = vesselState?.equipment ? getEquipmentByType(vesselState.equipment, 'engine') : undefined;
  const generator = vesselState?.equipment ? getEquipmentByType(vesselState.equipment, 'generator') : undefined;
  const radar = vesselState?.equipment ? getEquipmentByType(vesselState.equipment, 'radar') : undefined;
  
  const engineHealth = mainEngine?.health ? mainEngine.health / 100 : 0.95;
  const generatorHealth = generator?.health ? generator.health / 100 : 0.92;
  const radarHealth = radar?.health ? radar.health / 100 : 0.98;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Digital Twin 3D
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={engineHealth > 0.8 ? 'default' : 'destructive'}>
              Saúde: {(engineHealth * 100).toFixed(0)}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Switch 
              id="labels" 
              checked={showLabels} 
              onCheckedChange={setShowLabels}
            />
            <Label htmlFor="labels" className="cursor-pointer">Labels</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch 
              id="water" 
              checked={showWater} 
              onCheckedChange={setShowWater}
            />
            <Label htmlFor="water" className="cursor-pointer">Água</Label>
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="h-[400px] w-full rounded-lg overflow-hidden bg-gradient-to-b from-sky-400 to-sky-600 relative">
          <Canvas shadows>
            <PerspectiveCamera makeDefault position={[10, 5, 10]} fov={50} />
            <Suspense fallback={<LoadingFallback />}>
              <VesselScene 
                vesselState={vesselState} 
                showLabels={showLabels}
                showWater={showWater}
              />
            </Suspense>
          </Canvas>
          
          {/* Overlay Controls */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <Button size="sm" variant="secondary" className="backdrop-blur-sm">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary" className="backdrop-blur-sm">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary" className="backdrop-blur-sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Legend */}
          <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-2 text-xs space-y-1">
            <p className="font-medium">Legenda de Cores</p>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span>Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Atenção</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span>Crítico</span>
            </div>
          </div>
        </div>

        {/* Equipment Status */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Thermometer className="h-4 w-4 text-warning" />
            <div>
              <p className="text-muted-foreground">Motor</p>
              <p className="font-medium">{(engineHealth * 100).toFixed(0)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Activity className="h-4 w-4 text-primary" />
            <div>
              <p className="text-muted-foreground">Gerador</p>
              <p className="font-medium">{(generatorHealth * 100).toFixed(0)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Gauge className="h-4 w-4 text-success" />
            <div>
              <p className="text-muted-foreground">Radar</p>
              <p className="font-medium">{(radarHealth * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default VesselDigitalTwin3D;
