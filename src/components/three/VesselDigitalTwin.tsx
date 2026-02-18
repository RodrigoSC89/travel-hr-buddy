/**
 * Vessel Digital Twin - 3D Interactive Vessel Visualization
 * Uses Three.js for real-time vessel status monitoring
 */
import React, { Suspense, useRef, useState, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship, Thermometer, Gauge, Droplets, AlertTriangle, CheckCircle2, Wifi } from "lucide-react";

// ============ Types ============
interface VesselSensor {
  id: string;
  name: string;
  position: [number, number, number];
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  type: "temperature" | "pressure" | "fuel" | "speed" | "rpm";
}

interface VesselTwinProps {
  vesselName?: string;
  vesselType?: string;
  sensors?: VesselSensor[];
  status?: "operational" | "maintenance" | "docked" | "alert";
  heading?: number;
  speed?: number;
}

// ============ 3D Hull Component ============
function VesselHull({ status, heading }: { status: string; heading: number }) {
  const meshRef = useRef<THREE.Group>(null);
  
  const hullColor = useMemo(() => {
    switch (status) {
      case "operational": return "#1e40af";
      case "maintenance": return "#d97706";
      case "alert": return "#dc2626";
      default: return "#475569";
    }
  }, [status]);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle ocean rocking motion
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.015;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
    }
  });

  return (
    <group ref={meshRef} rotation={[0, THREE.MathUtils.degToRad(heading), 0]}>
      {/* Main Hull */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.2, 0.4, 4]} />
        <meshStandardMaterial color={hullColor} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Bow (pointed front) */}
      <mesh position={[0, 0, 2.3]} castShadow>
        <coneGeometry args={[0.6, 1, 4]} />
        <meshStandardMaterial color={hullColor} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Stern */}
      <mesh position={[0, 0, -2.2]} castShadow>
        <boxGeometry args={[1.0, 0.35, 0.5]} />
        <meshStandardMaterial color={hullColor} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Bridge/Superstructure */}
      <mesh position={[0, 0.6, -0.5]} castShadow>
        <boxGeometry args={[0.8, 0.8, 1.2]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Bridge Windows */}
      <mesh position={[0, 0.7, 0.12]}>
        <boxGeometry args={[0.82, 0.3, 0.02]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.8} roughness={0.1} emissive="#38bdf8" emissiveIntensity={0.3} />
      </mesh>
      {/* Funnel */}
      <mesh position={[0, 1.2, -0.8]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.6, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Mast */}
      <mesh position={[0, 1.6, 0.5]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 6]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Deck */}
      <mesh position={[0, 0.21, 0]}>
        <boxGeometry args={[1.18, 0.02, 3.98]} />
        <meshStandardMaterial color="#64748b" metalness={0.2} roughness={0.7} />
      </mesh>
      {/* Cargo holds */}
      {[-0.8, 0.2, 1.2].map((z) => (
        <mesh key={`cargo-${z}`} position={[0, 0.35, z]}>
          <boxGeometry args={[0.6, 0.25, 0.5]} />
          <meshStandardMaterial color="#475569" metalness={0.3} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// ============ Sensor Marker 3D ============
function SensorMarker({ sensor, onClick }: { sensor: VesselSensor; onClick: (s: VesselSensor) => void }) {
  const markerRef = useRef<THREE.Mesh>(null);
  const color = sensor.status === "normal" ? "#22c55e" : sensor.status === "warning" ? "#eab308" : "#ef4444";
  
  useFrame((state) => {
    if (markerRef.current) {
      markerRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.15);
    }
  });

  return (
    <Float speed={2} floatIntensity={0.3}>
      <mesh
        ref={markerRef}
        position={sensor.position}
        onClick={(e) => { e.stopPropagation(); onClick(sensor); }}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
    </Float>
  );
}

// ============ Water Plane ============
function WaterPlane() {
  const waterRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (waterRef.current) {
      (waterRef.current.material as THREE.MeshStandardMaterial).opacity = 0.4 + Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  return (
    <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]} receiveShadow>
      <planeGeometry args={[30, 30, 32, 32]} />
      <meshStandardMaterial 
        color="#0c4a6e" 
        transparent 
        opacity={0.4} 
        metalness={0.9} 
        roughness={0.1}
      />
    </mesh>
  );
}

// ============ Default sensors ============
const defaultSensors: VesselSensor[] = [
  { id: "s1", name: "Engine Temp", position: [0, 0.3, -1.5], value: 85, unit: "°C", status: "normal", type: "temperature" },
  { id: "s2", name: "Fuel Level", position: [0.4, 0.3, 0], value: 72, unit: "%", status: "normal", type: "fuel" },
  { id: "s3", name: "Hull Pressure", position: [-0.4, 0.1, 1], value: 1.2, unit: "bar", status: "warning", type: "pressure" },
  { id: "s4", name: "Speed", position: [0, 0.5, 2], value: 14.5, unit: "kn", status: "normal", type: "speed" },
  { id: "s5", name: "Main RPM", position: [0, 0.3, -0.8], value: 120, unit: "RPM", status: "normal", type: "rpm" },
];

// ============ Main Component ============
export const VesselDigitalTwin: React.FC<VesselTwinProps> = ({
  vesselName = "MV Atlantic Pioneer",
  vesselType = "Bulk Carrier",
  sensors = defaultSensors,
  status = "operational",
  heading = 0,
  speed = 14.5,
}) => {
  const [selectedSensor, setSelectedSensor] = useState<VesselSensor | null>(null);

  const sensorIcon = useCallback((type: VesselSensor["type"]) => {
    switch (type) {
      case "temperature": return <Thermometer className="h-4 w-4" />;
      case "pressure": return <Gauge className="h-4 w-4" />;
      case "fuel": return <Droplets className="h-4 w-4" />;
      default: return <Gauge className="h-4 w-4" />;
    }
  }, []);

  const statusConfig = useMemo(() => ({
    operational: { label: "Operacional", color: "bg-success", icon: <CheckCircle2 className="h-4 w-4" /> },
    maintenance: { label: "Manutenção", color: "bg-warning", icon: <AlertTriangle className="h-4 w-4" /> },
    docked: { label: "Atracado", color: "bg-info", icon: <Ship className="h-4 w-4" /> },
    alert: { label: "Alerta", color: "bg-destructive", icon: <AlertTriangle className="h-4 w-4" /> },
  }), []);

  const warnings = sensors.filter(s => s.status !== "normal").length;

  return (
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Ship className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{vesselName}</CardTitle>
              <p className="text-xs text-muted-foreground">{vesselType} • Digital Twin 3D</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Wifi className="h-3 w-3 text-success" /> Live
            </Badge>
            <Badge variant={warnings > 0 ? "destructive" : "secondary"} className="gap-1">
              {statusConfig[status].icon}
              {statusConfig[status].label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[400px] w-full bg-gradient-to-b from-slate-900/50 to-slate-800/50 rounded-b-lg overflow-hidden">
          <Canvas
            shadows
            camera={{ position: [4, 3, 6], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
            <pointLight position={[-3, 5, -3]} intensity={0.5} color="#38bdf8" />
            
            <VesselHull status={status} heading={heading} />
            <WaterPlane />
            
            {sensors.map(sensor => (
              <SensorMarker key={sensor.id} sensor={sensor} onClick={setSelectedSensor} />
            ))}
            
            <OrbitControls 
              enablePan={false} 
              minDistance={4} 
              maxDistance={15} 
              maxPolarAngle={Math.PI / 2.2}
              autoRotate 
              autoRotateSpeed={0.5}
            />
            <Environment preset="night" />
          </Canvas>

          {/* Speed overlay */}
          <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md rounded-lg px-3 py-2 text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Velocidade:</span>
              <span className="font-bold text-primary">{speed} kn</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Rumo:</span>
              <span className="font-bold">{heading}°</span>
            </div>
          </div>

          {/* Sensor count overlay */}
          <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md rounded-lg px-3 py-2 text-xs">
            <span className="text-muted-foreground">{sensors.length} sensores</span>
            {warnings > 0 && (
              <span className="ml-2 text-warning font-medium">{warnings} alertas</span>
            )}
          </div>

          {/* Selected sensor panel */}
          <AnimatePresence>
            {selectedSensor && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-3 left-3 right-3 bg-background/90 backdrop-blur-md rounded-lg p-4 border border-border/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {sensorIcon(selectedSensor.type)}
                    <span className="font-medium text-sm">{selectedSensor.name}</span>
                    <Badge variant={selectedSensor.status === "normal" ? "secondary" : "destructive"} className="text-xs">
                      {selectedSensor.status}
                    </Badge>
                  </div>
                  <button 
                    onClick={() => setSelectedSensor(null)}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-primary">{selectedSensor.value}</span>
                  <span className="text-sm text-muted-foreground">{selectedSensor.unit}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};
