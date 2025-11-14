import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Box, Sphere, Cylinder, Cone } from "@react-three/drei";
let THREE: any = null;
const loadTHREE = async () => {
  if (!THREE) {
    THREE = await import("three");
  }
  return THREE;
};
import { supabase } from "@/integrations/supabase/client";

interface AIAction {
  id: string;
  timestamp: string;
  action: string;
  target: string;
  result: string;
  confidence: number;
}

interface Scenario3DProps {
  onAIAction?: (action: AIAction) => void;
  autoSimulate?: boolean;
}

/**
 * Ship Model Component
 */
function ShipModel({ position }: { position: [number, number, number] }) {
  const shipRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (shipRef.current) {
      // Gentle rocking motion
      shipRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      shipRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.01;
    }
  });

  return (
    <group ref={shipRef} position={position}>
      {/* Ship Hull */}
      <Box args={[4, 1, 8]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#2C3E50" metalness={0.6} roughness={0.4} />
      </Box>
      
      {/* Ship Deck */}
      <Box args={[3.8, 0.2, 7.8]} position={[0, 0.6, 0]}>
        <meshStandardMaterial color="#34495E" />
      </Box>
      
      {/* Bridge */}
      <Box args={[2, 1.5, 2]} position={[0, 1.5, -2]}>
        <meshStandardMaterial color="#1A252F" />
      </Box>
      
      {/* Bridge Windows */}
      <Box args={[1.8, 0.8, 0.1]} position={[0, 1.6, -0.95]}>
        <meshStandardMaterial color="#4A90E2" emissive="#4A90E2" emissiveIntensity={0.3} />
      </Box>
      
      {/* Mast */}
      <Cylinder args={[0.1, 0.1, 3, 8]} position={[0, 2.5, 1]}>
        <meshStandardMaterial color="#7F8C8D" metalness={0.8} />
      </Cylinder>
    </group>
  );
}

/**
 * Drone Model Component
 */
function DroneModel({ 
  position, 
  isActive = false 
}: { 
  position: [number, number, number];
  isActive?: boolean;
}) {
  const droneRef = useRef<THREE.Group>(null);
  const [hovering, setHovering] = useState(false);

  useFrame((state) => {
    if (droneRef.current) {
      // Hovering motion
      droneRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // Rotate propellers
      droneRef.current.children.forEach((child, index) => {
        if (child.name === "propeller") {
          child.rotation.y += isActive ? 0.5 : 0.1;
        }
      });
    }
  });

  return (
    <group 
      ref={droneRef} 
      position={position}
      onPointerOver={() => setHovering(true)}
      onPointerOut={() => setHovering(false)}
    >
      {/* Drone Body */}
      <Sphere args={[0.3, 16, 16]}>
        <meshStandardMaterial 
          color={isActive ? "#E74C3C" : "#95A5A6"} 
          emissive={isActive ? "#E74C3C" : "#000000"}
          emissiveIntensity={isActive ? 0.5 : 0}
        />
      </Sphere>
      
      {/* Drone Arms */}
      {[0, 90, 180, 270].map((angle, index) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <group key={index}>
            <Cylinder 
              args={[0.05, 0.05, 0.8, 8]} 
              position={[Math.cos(rad) * 0.4, 0, Math.sin(rad) * 0.4]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <meshStandardMaterial color="#7F8C8D" />
            </Cylinder>
            
            {/* Propeller */}
            <Cylinder 
              name="propeller"
              args={[0.2, 0.2, 0.02, 8]} 
              position={[Math.cos(rad) * 0.8, 0.1, Math.sin(rad) * 0.8]}
            >
              <meshStandardMaterial color="#3498DB" transparent opacity={0.7} />
            </Cylinder>
          </group>
        );
      })}
      
      {/* Status Indicator */}
      {hovering && (
        <Sphere args={[0.1, 8, 8]} position={[0, 0.5, 0]}>
          <meshBasicMaterial color="#2ECC71" />
        </Sphere>
      )}
    </group>
  );
}

/**
 * Bridge Console Component
 */
function BridgeConsole({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Console Base */}
      <Box args={[1.5, 0.8, 0.5]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#2C3E50" />
      </Box>
      
      {/* Screens */}
      <Box args={[0.6, 0.4, 0.05]} position={[-0.4, 0.6, -0.2]}>
        <meshStandardMaterial 
          color="#1ABC9C" 
          emissive="#1ABC9C" 
          emissiveIntensity={0.5}
        />
      </Box>
      <Box args={[0.6, 0.4, 0.05]} position={[0.4, 0.6, -0.2]}>
        <meshStandardMaterial 
          color="#3498DB" 
          emissive="#3498DB" 
          emissiveIntensity={0.5}
        />
      </Box>
    </group>
  );
}

/**
 * Main Scenario3D Component
 */
export function Scenario3D({ onAIAction, autoSimulate = false }: Scenario3DProps) {
  const [aiLogs, setAiLogs] = useState<AIAction[]>([]);
  const [activeDrone, setActiveDrone] = useState<number | null>(null);
  const simulationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoSimulate) {
      startAutoSimulation();
    }
    
    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, [autoSimulate]);

  const startAutoSimulation = () => {
    // Simulate AI actions every 5 seconds
    simulationInterval.current = setInterval(() => {
      simulateAIAction();
    }, 5000);
  };

  const simulateAIAction = async () => {
    const actions = [
      {
        action: "scan_environment",
        target: "drone_1",
        result: "Environment scanned successfully",
        confidence: 0.95,
      },
      {
        action: "analyze_vessel_status",
        target: "ship",
        result: "All systems normal",
        confidence: 0.92,
      },
      {
        action: "monitor_crew_activity",
        target: "bridge",
        result: "Crew activity within normal parameters",
        confidence: 0.88,
      },
      {
        action: "check_navigation",
        target: "navigation_system",
        result: "Course optimal",
        confidence: 0.90,
      },
    ];

    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    const aiAction: AIAction = {
      id: `action_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...randomAction,
    };

    // Update local state
    setAiLogs(prev => [aiAction, ...prev.slice(0, 9)]);
    
    // Activate corresponding drone
    if (randomAction.target.includes("drone")) {
      setActiveDrone(parseInt(randomAction.target.split("_")[1]));
      setTimeout(() => setActiveDrone(null), 2000);
    }

    // Call callback
    if (onAIAction) {
      onAIAction(aiAction);
    }

    // Log to database
    await logAIAction(aiAction);
  };

  const logAIAction = async (action: AIAction) => {
    try {
      await (supabase as any).from("ia_performance_log").insert({
        module_name: "scenario_simulator",
        operation_type: "simulated_action",
        precision_score: action.confidence,
        recall_score: action.confidence,
        response_time_ms: Math.random() * 100 + 50,
        decision_accepted: true,
        context: {
          action: action.action,
          target: action.target,
          result: action.result,
        },
      });
    } catch (error) {
      console.error("Failed to log AI action:", error);
    }
  };

  return (
    <group>
      {/* Ocean Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#16A085" roughness={0.8} />
      </mesh>

      {/* Ship */}
      <ShipModel position={[0, -1, 0]} />

      {/* Bridge Console */}
      <BridgeConsole position={[0, 0.5, -2]} />

      {/* Drones */}
      <DroneModel position={[-3, 2, -1]} isActive={activeDrone === 1} />
      <DroneModel position={[3, 2.5, -1]} isActive={activeDrone === 2} />
      <DroneModel position={[0, 3, 2]} isActive={activeDrone === 3} />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#3498DB" />

      {/* Water effect simulation */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40, 32, 32]} />
        <meshStandardMaterial 
          color="#2980B9" 
          transparent 
          opacity={0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}
