/**
 * 🚢 Operations Dashboard 3D - Interactive Maritime Visualization
 * NAUTILUS ONE v5.0 - Revolutionary Maritime Operations
 * 
 * 3D visualization of fleet operations with real-time vessel tracking,
 * weather overlays, and risk zone highlighting
 */

import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere, Box, Plane, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Ship, Navigation, Cloud, AlertTriangle, Activity, MapPin, Fuel,
  Clock, TrendingUp, Anchor, Wind, Waves, Eye, RefreshCw, Maximize2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { operationalIntelligenceEngine, type VoyageOptimization } from '../ai/OperationalIntelligenceEngine';
import * as THREE from 'three';

// Convert lat/lng to 3D coordinates
function latLngTo3D(lat: number, lng: number, radius: number = 50): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  ];
}

// Ocean component
function Ocean() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.1) * 0.02;
    }
  });

  return (
    <Plane ref={meshRef} args={[200, 200, 64, 64]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <meshStandardMaterial 
        color="#1a4b8c" 
        transparent 
        opacity={0.8}
        metalness={0.3}
        roughness={0.7}
      />
    </Plane>
  );
}

// Vessel 3D Component
function Vessel3D({ 
  position, 
  name, 
  status, 
  heading = 0,
  speed = 0,
  isSelected = false,
  onClick 
}: { 
  position: [number, number, number];
  name: string;
  status: 'sailing' | 'port' | 'maintenance' | 'emergency';
  heading?: number;
  speed?: number;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Slight bobbing motion
      meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 2) * 0.1;
    }
  });

  const statusColor = {
    sailing: '#22c55e',
    port: '#3b82f6',
    maintenance: '#f59e0b',
    emergency: '#ef4444'
  }[status];

  return (
    <group 
      ref={meshRef}
      position={position}
      rotation={[0, heading * Math.PI / 180, 0]}
      onClick={onClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Vessel body */}
      <Box args={[2, 0.8, 0.6]} scale={hovered || isSelected ? 1.2 : 1}>
        <meshStandardMaterial color={statusColor} />
      </Box>
      
      {/* Bridge */}
      <Box args={[0.5, 0.5, 0.5]} position={[0.5, 0.5, 0]}>
        <meshStandardMaterial color="#333" />
      </Box>

      {/* Selection ring */}
      {(isSelected || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <ringGeometry args={[1.5, 1.8, 32]} />
          <meshBasicMaterial color={isSelected ? '#fbbf24' : '#fff'} transparent opacity={0.5} />
        </mesh>
      )}

      {/* Vessel info on hover */}
      {(hovered || isSelected) && (
        <Html position={[0, 2, 0]} center>
          <div className="bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border min-w-[150px]">
            <p className="font-bold text-sm">{name}</p>
            <p className="text-xs text-muted-foreground capitalize">{status}</p>
            <p className="text-xs">Speed: {speed} kn</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// Route line component
function RouteLine({ 
  waypoints, 
  color = '#ffffff' 
}: { 
  waypoints: { lat: number; lng: number }[];
  color?: string;
}) {
  const points = waypoints.map(wp => 
    new THREE.Vector3(...latLngTo3D(wp.lat, wp.lng, 0))
  );

  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      dashed
      dashSize={0.5}
      gapSize={0.2}
    />
  );
}

// Weather overlay
function WeatherOverlay({ severity }: { severity: 'good' | 'moderate' | 'poor' | 'severe' }) {
  if (severity === 'good') return null;

  const color = {
    moderate: '#fbbf24',
    poor: '#f97316',
    severe: '#ef4444'
  }[severity] || '#fbbf24';

  return (
    <group>
      {/* Storm cloud representation */}
      <Sphere args={[5, 16, 16]} position={[20, 10, 20]}>
        <meshStandardMaterial color={color} transparent opacity={0.3} />
      </Sphere>
      <Sphere args={[4, 16, 16]} position={[25, 12, 22]}>
        <meshStandardMaterial color={color} transparent opacity={0.3} />
      </Sphere>
    </group>
  );
}

// Port marker
function PortMarker({ 
  position, 
  name, 
  type 
}: { 
  position: [number, number, number];
  name: string;
  type: 'origin' | 'destination' | 'waypoint';
}) {
  const [hovered, setHovered] = useState(false);
  
  const color = type === 'origin' ? '#22c55e' : type === 'destination' ? '#3b82f6' : '#fbbf24';

  return (
    <group 
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <Sphere args={[0.5, 16, 16]}>
        <meshStandardMaterial color={color} />
      </Sphere>
      
      {/* Pin */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {hovered && (
        <Html position={[0, 2.5, 0]} center>
          <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded shadow-lg border">
            <p className="text-xs font-medium">{name}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// Stats card component
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  trend,
  className 
}: { 
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}) {
  return (
    <Card className={cn("bg-background/50 backdrop-blur-sm", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold">{value}</p>
              {trend && (
                <TrendingUp className={cn(
                  "h-4 w-4",
                  trend === 'up' && "text-green-500",
                  trend === 'down' && "text-red-500 rotate-180",
                  trend === 'neutral' && "text-muted-foreground"
                )} />
              )}
            </div>
            {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Dashboard Component
export function OperationsDashboard3D() {
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch voyage optimization
  const { data: optimization, isLoading, refetch } = useQuery<VoyageOptimization>({
    queryKey: ['voyage-optimization'],
    queryFn: async () => operationalIntelligenceEngine.optimizeVoyage('demo-voyage-001'),
    staleTime: 5 * 60 * 1000
  });

  // Mock fleet data
  const fleetData = [
    { id: 'v1', name: 'MV Nautilus One', status: 'sailing' as const, position: { lat: 10, lng: -30 }, heading: 45, speed: 16 },
    { id: 'v2', name: 'MV Ocean Star', status: 'port' as const, position: { lat: -23.95, lng: -46.31 }, heading: 0, speed: 0 },
    { id: 'v3', name: 'MV Atlantic Dream', status: 'sailing' as const, position: { lat: 35, lng: -15 }, heading: 60, speed: 14 },
    { id: 'v4', name: 'MV Nordic Wind', status: 'maintenance' as const, position: { lat: 51.9, lng: 4.5 }, heading: 180, speed: 0 }
  ];

  const weatherSeverity = optimization?.route.weather.severity as any || 'moderate';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Ship className="h-8 w-8 text-primary" />
            Operations Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time fleet visualization and AI-powered voyage optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            <Maximize2 className="h-4 w-4 mr-2" />
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard icon={Ship} label="Active Vessels" value="4" subValue="3 sailing, 1 port" />
        <StatCard icon={Navigation} label="Voyages Today" value="12" trend="up" />
        <StatCard icon={Fuel} label="Fuel Savings" value={`${optimization?.savings.fuelSavingsPercent || 15}%`} trend="up" />
        <StatCard icon={Clock} label="Avg ETA Accuracy" value="98%" />
        <StatCard icon={AlertTriangle} label="Active Alerts" value="2" trend="neutral" />
        <StatCard icon={Activity} label="System Health" value="100%" trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Visualization */}
        <Card className={cn(
          "lg:col-span-2",
          isFullscreen && "fixed inset-4 z-50"
        )}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Fleet Operations 3D
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={weatherSeverity === 'good' ? 'default' : 'destructive'}>
                  <Cloud className="h-3 w-3 mr-1" />
                  Weather: {weatherSeverity}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className={cn(
              "relative",
              isFullscreen ? "h-[calc(100vh-8rem)]" : "h-[500px]"
            )}>
              <Canvas camera={{ position: [0, 50, 100], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[100, 100, 100]} intensity={1} />
                <directionalLight position={[-50, 50, 50]} intensity={0.5} />
                
                <Suspense fallback={null}>
                  {/* Ocean plane */}
                  <Ocean />

                  {/* Vessels */}
                  {fleetData.map(vessel => (
                    <Vessel3D
                      key={vessel.id}
                      position={[
                        (vessel.position.lng + 46) * 0.8,
                        0,
                        -(vessel.position.lat + 24) * 0.8
                      ]}
                      name={vessel.name}
                      status={vessel.status}
                      heading={vessel.heading}
                      speed={vessel.speed}
                      isSelected={selectedVessel === vessel.id}
                      onClick={() => setSelectedVessel(vessel.id)}
                    />
                  ))}

                  {/* Route waypoints */}
                  {optimization?.route.waypoints && (
                    <RouteLine 
                      waypoints={optimization.route.waypoints.map(wp => wp.position)}
                      color="#3b82f6"
                    />
                  )}

                  {/* Ports */}
                  <PortMarker 
                    position={[0, 0, 0]} 
                    name="Santos, Brazil" 
                    type="origin"
                  />
                  <PortMarker 
                    position={[40, 0, -60]} 
                    name="Rotterdam, NL" 
                    type="destination"
                  />

                  {/* Weather overlay */}
                  <WeatherOverlay severity={weatherSeverity} />
                </Suspense>

                <OrbitControls 
                  enableZoom={true}
                  minDistance={20}
                  maxDistance={200}
                  maxPolarAngle={Math.PI / 2.2}
                />
              </Canvas>

              {/* Legend overlay */}
              <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm p-3 rounded-lg text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Sailing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>In Port</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Maintenance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Emergency</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voyage Details Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Voyage Optimization</CardTitle>
            <CardDescription>AI-powered route analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="route" className="space-y-4">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="route">Route</TabsTrigger>
                <TabsTrigger value="risks">Risks</TabsTrigger>
                <TabsTrigger value="savings">Savings</TabsTrigger>
              </TabsList>

              <TabsContent value="route">
                <ScrollArea className="h-[350px]">
                  <div className="space-y-4">
                    {optimization ? (
                      <>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium">Total Distance</p>
                          <p className="text-2xl font-bold">{optimization.route.totalDistance} nm</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium">Estimated Duration</p>
                          <p className="text-2xl font-bold">{optimization.route.estimatedDuration} hrs</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium">Fuel Required</p>
                          <p className="text-2xl font-bold">{optimization.route.fuelRequired} tons</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium">Weather Windows</p>
                          {optimization.route.weather.windows.map((w, i) => (
                            <Badge key={i} variant="outline" className="mr-1 mt-1">{w}</Badge>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">Loading...</p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="risks">
                <ScrollArea className="h-[350px]">
                  <div className="space-y-3">
                    {optimization?.risks.map((risk, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={cn(
                          "p-3 rounded-lg border",
                          risk.severity === 'critical' && "border-red-500 bg-red-500/10",
                          risk.severity === 'high' && "border-orange-500 bg-orange-500/10",
                          risk.severity === 'medium' && "border-yellow-500 bg-yellow-500/10",
                          risk.severity === 'low' && "border-green-500 bg-green-500/10"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{risk.category}</span>
                          <Badge variant="outline" className="text-xs">{risk.probability}%</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{risk.timing}</p>
                        <p className="text-xs">{risk.mitigation}</p>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="savings">
                <div className="space-y-4">
                  {optimization?.savings && (
                    <>
                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Fuel className="h-5 w-5 text-green-500" />
                          <span className="font-medium">Fuel Savings</span>
                        </div>
                        <p className="text-3xl font-bold text-green-500">
                          {optimization.savings.fuelSavingsPercent}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {optimization.savings.fuelSavingsTons} tons saved
                        </p>
                      </div>

                      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-5 w-5 text-blue-500" />
                          <span className="font-medium">Time Optimization</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-500">
                          {optimization.savings.timeOptimizationHours}h
                        </p>
                        <p className="text-sm text-muted-foreground">
                          vs. standard route
                        </p>
                      </div>

                      <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <span className="font-medium">Cost Reduction</span>
                        </div>
                        <p className="text-3xl font-bold text-primary">
                          ${optimization.savings.costReductionUSD.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          estimated savings
                        </p>
                      </div>

                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">AI Confidence</p>
                        <p className="text-lg font-bold">{optimization.confidence.toFixed(0)}%</p>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OperationsDashboard3D;
