/**
 * OceanScene - Cinematic 3D ocean with animated vessel silhouette
 * Uses @react-three/fiber + drei for immersive landing experience
 */
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import { DoubleSide, PlaneGeometry, type Mesh as ThreeMesh, type Group as ThreeGroup, type Points as ThreePoints } from "three";

function Ocean() {
  const meshRef = useRef<ThreeMesh>(null);
  const geo = useMemo(() => new PlaneGeometry(60, 60, 128, 128), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const pos = (meshRef.current.geometry as PlaneGeometry).attributes.position;
    const t = clock.getElapsedTime();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(
        i,
        Math.sin(x * 0.3 + t * 0.6) * 0.4 +
        Math.sin(y * 0.2 + t * 0.4) * 0.3 +
        Math.sin((x + y) * 0.15 + t * 0.3) * 0.2
      );
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} geometry={geo} rotation={[-Math.PI / 2.4, 0, 0]} position={[0, -2, -5]}>
      <meshStandardMaterial
        color="#0a3d6b"
        transparent
        opacity={0.6}
        wireframe={false}
        metalness={0.8}
        roughness={0.2}
        side={DoubleSide}
      />
    </mesh>
  );
}

function VesselSilhouette() {
  const groupRef = useRef<ThreeGroup>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.15 - 0.5;
    groupRef.current.rotation.z = Math.sin(t * 0.4) * 0.03;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.02;
  });

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} position={[2, -0.5, -3]} rotation={[0, -0.3, 0]} scale={0.5}>
        {/* Hull */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4, 0.6, 1.2]} />
          <meshStandardMaterial color="#1a4a7a" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Bridge */}
        <mesh position={[-0.8, 0.6, 0]}>
          <boxGeometry args={[1.2, 0.8, 0.9]} />
          <meshStandardMaterial color="#1e5a8a" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Funnel */}
        <mesh position={[-0.5, 1.2, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 0.5, 8]} />
          <meshStandardMaterial color="#2a6a9a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Bow */}
        <mesh position={[2.2, -0.1, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.8, 0.4, 1]} />
          <meshStandardMaterial color="#1a4a7a" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Mast */}
        <mesh position={[0.5, 1.0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.2, 6]} />
          <meshStandardMaterial color="#3a8aba" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Running light */}
        <mesh position={[2.5, 0.1, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2} />
        </mesh>
      </group>
    </Float>
  );
}

function Particles() {
  const ref = useRef<ThreePoints>(null);
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    // Deterministic particle positions using golden ratio distribution
    const PHI = 1.618033988749895;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      pos[i * 3] = ((t * PHI * 40) % 40) - 20;
      pos[i * 3 + 1] = ((t * PHI * 17 + i * 0.37) % 17) - 2;
      pos[i * 3 + 2] = ((t * PHI * 30 + i * 0.53) % 30) - 20;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#4a9eff" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

export function OceanScene({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 ${className}`} style={{ pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 3, 8], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <fog attach="fog" args={["#040a18", 8, 35]} />
        <ambientLight intensity={0.15} />
        <directionalLight position={[5, 8, 5]} intensity={0.4} color="#4a9eff" />
        <pointLight position={[-5, 3, -5]} intensity={0.3} color="#00d4ff" />
        <pointLight position={[3, 5, 3]} intensity={0.2} color="#7b68ee" />
        <Ocean />
        <VesselSilhouette />
        <Particles />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
