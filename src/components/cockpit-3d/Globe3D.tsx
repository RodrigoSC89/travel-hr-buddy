/**
 * Globe3D Component
 * Interactive 3D globe visualization for global operations
 */

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { GlobeMarker } from './types';

interface GlobeProps {
  markers: GlobeMarker[];
  onMarkerClick?: (marker: GlobeMarker) => void;
  autoRotate?: boolean;
}

function GlobeMesh({ autoRotate }: { autoRotate: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((_, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Ocean gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 256);
      gradient.addColorStop(0, '#0a1628');
      gradient.addColorStop(0.5, '#0d2847');
      gradient.addColorStop(1, '#0a1628');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 256);
      
      // Grid lines
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 512; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 256);
        ctx.stroke();
      }
      for (let i = 0; i < 256; i += 32) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.stroke();
      }
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <Sphere ref={meshRef} args={[2, 64, 64]}>
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={0.9}
        emissive="#1e3a5f"
        emissiveIntensity={0.2}
      />
    </Sphere>
  );
}

function Marker({ marker, onClick }: { marker: GlobeMarker; onClick?: () => void }) {
  const position = useMemo(() => {
    const phi = (90 - marker.lat) * (Math.PI / 180);
    const theta = (marker.lng + 180) * (Math.PI / 180);
    const x = -(2.05 * Math.sin(phi) * Math.cos(theta));
    const y = 2.05 * Math.cos(phi);
    const z = 2.05 * Math.sin(phi) * Math.sin(theta);
    return [x, y, z] as [number, number, number];
  }, [marker.lat, marker.lng]);

  const color = useMemo(() => {
    switch (marker.severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      default: return '#22c55e';
    }
  }, [marker.severity]);

  return (
    <group position={position}>
      <mesh onClick={onClick}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <Html distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs whitespace-nowrap border border-border/50">
          {marker.label}
        </div>
      </Html>
    </group>
  );
}

function Atmosphere() {
  return (
    <Sphere args={[2.1, 64, 64]}>
      <meshStandardMaterial
        color="#3b82f6"
        transparent
        opacity={0.1}
        side={THREE.BackSide}
      />
    </Sphere>
  );
}

export function Globe3D({ markers, onMarkerClick, autoRotate = true }: GlobeProps) {
  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        
        <Stars radius={100} depth={50} count={2000} factor={4} fade speed={1} />
        
        <GlobeMesh autoRotate={autoRotate} />
        <Atmosphere />
        
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            marker={marker}
            onClick={() => onMarkerClick?.(marker)}
          />
        ))}
        
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          autoRotate={false}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
