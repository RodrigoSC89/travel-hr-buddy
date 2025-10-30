/**
 * PATCH 611 - Ops 3D Visualizer Core
 * 3D visualization engine for operational status (fleet, sensors, modules)
 * Using Three.js via React Three Fiber
 */

import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';

// Types for system state
interface ModuleNode {
  id: string;
  name: string;
  type: 'fleet' | 'sensor' | 'module';
  status: 'active' | 'inactive' | 'warning' | 'error';
  position: [number, number, number];
  data?: Record<string, any>;
}

interface SystemState {
  modules: ModuleNode[];
  connections: Array<{ from: string; to: string; strength: number }>;
  lastUpdate: Date;
}

// Performance monitor
class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;

  update(): number {
    this.frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;

    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    return this.fps;
  }

  getFPS(): number {
    return this.fps;
  }
}

// 3D Node component
function Node3D({ node }: { node: ModuleNode }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Get color based on status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return '#00ff00';
      case 'inactive':
        return '#666666';
      case 'warning':
        return '#ffaa00';
      case 'error':
        return '#ff0000';
      default:
        return '#ffffff';
    }
  };

  // Animate node
  useFrame((state) => {
    if (meshRef.current) {
      // Pulse animation for active nodes
      if (node.status === 'active') {
        const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
        meshRef.current.scale.setScalar(pulse);
      }
      
      // Rotation for hovered nodes
      if (hovered) {
        meshRef.current.rotation.y += 0.02;
      }
    }
  });

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={getStatusColor(node.status)}
          emissive={getStatusColor(node.status)}
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </mesh>
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {node.name}
      </Text>
    </group>
  );
}

// Connection line component
function Connection3D({ 
  from, 
  to, 
  strength 
}: { 
  from: [number, number, number]; 
  to: [number, number, number]; 
  strength: number;
}) {
  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial
        color="#00aaff"
        opacity={strength}
        transparent
        linewidth={2}
      />
    </line>
  );
}

// Scene component
function Scene3D({ systemState }: { systemState: SystemState }) {
  const { camera } = useThree();
  const perfMonitor = useRef(new PerformanceMonitor());
  const [fps, setFps] = useState(60);

  useFrame(() => {
    const currentFps = perfMonitor.current.update();
    setFps(currentFps);
  });

  useEffect(() => {
    logger.info(`[Ops3DCore] FPS: ${fps}`);
  }, [fps]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* Render nodes */}
      {systemState.modules.map((node) => (
        <Node3D key={node.id} node={node} />
      ))}

      {/* Render connections */}
      {systemState.connections.map((conn, idx) => {
        const fromNode = systemState.modules.find((n) => n.id === conn.from);
        const toNode = systemState.modules.find((n) => n.id === conn.to);
        
        if (fromNode && toNode) {
          return (
            <Connection3D
              key={idx}
              from={fromNode.position}
              to={toNode.position}
              strength={conn.strength}
            />
          );
        }
        return null;
      })}

      {/* Grid helper */}
      <gridHelper args={[20, 20, '#444444', '#222222']} />

      {/* FPS indicator */}
      <Text
        position={[0, 8, 0]}
        fontSize={0.3}
        color={fps >= 30 ? '#00ff00' : '#ff0000'}
        anchorX="center"
      >
        {`FPS: ${fps}`}
      </Text>
    </>
  );
}

// Main 3D Visualizer component
export function Ops3DCore() {
  const [systemState, setSystemState] = useState<SystemState>({
    modules: [],
    connections: [],
    lastUpdate: new Date(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load system state from database
  const loadSystemState = async () => {
    try {
      setIsLoading(true);
      logger.info('[Ops3DCore] Loading system state...');

      // Fetch fleet data
      const { data: fleetData, error: fleetError } = await supabase
        .from('fleet')
        .select('*')
        .limit(10);

      if (fleetError) throw fleetError;

      // Generate mock sensor and module data
      const modules: ModuleNode[] = [
        // Fleet nodes
        ...(fleetData || []).map((vessel, idx) => ({
          id: `fleet-${vessel.id}`,
          name: vessel.vessel_name || `Vessel ${idx}`,
          type: 'fleet' as const,
          status: vessel.status || 'active' as const,
          position: [
            Math.cos(idx * 0.5) * 5,
            0,
            Math.sin(idx * 0.5) * 5,
          ] as [number, number, number],
          data: vessel,
        })),
        // Sensor nodes
        ...Array.from({ length: 5 }, (_, idx) => ({
          id: `sensor-${idx}`,
          name: `Sensor ${idx + 1}`,
          type: 'sensor' as const,
          status: (Math.random() > 0.8 ? 'warning' : 'active') as const,
          position: [
            Math.cos(idx * 1.2 + Math.PI) * 3,
            2,
            Math.sin(idx * 1.2 + Math.PI) * 3,
          ] as [number, number, number],
        })),
        // Module nodes
        ...Array.from({ length: 3 }, (_, idx) => ({
          id: `module-${idx}`,
          name: `Module ${idx + 1}`,
          type: 'module' as const,
          status: 'active' as const,
          position: [0, idx * 2 - 2, 0] as [number, number, number],
        })),
      ];

      // Generate connections
      const connections = modules.slice(0, -1).map((node, idx) => ({
        from: node.id,
        to: modules[idx + 1].id,
        strength: 0.5 + Math.random() * 0.5,
      }));

      setSystemState({
        modules,
        connections,
        lastUpdate: new Date(),
      });

      logger.info(`[Ops3DCore] Loaded ${modules.length} nodes`);
      setIsLoading(false);
    } catch (err) {
      logger.error('[Ops3DCore] Failed to load system state', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
    }
  };

  // Initialize and set up real-time updates
  useEffect(() => {
    loadSystemState();

    // Refresh every 10 seconds
    const interval = setInterval(() => {
      loadSystemState();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-red-500">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">3D Visualizer Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
          <p>Loading 3D Visualization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-900">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.5}
        />
        <Suspense fallback={null}>
          <Scene3D systemState={systemState} />
        </Suspense>
      </Canvas>
      <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 p-4 rounded">
        <h3 className="font-bold mb-2">Ops 3D Visualizer</h3>
        <p>Modules: {systemState.modules.length}</p>
        <p>Connections: {systemState.connections.length}</p>
        <p>Last Update: {systemState.lastUpdate.toLocaleTimeString()}</p>
      </div>
    </div>
  );
}

export default Ops3DCore;
