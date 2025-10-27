import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { useXR } from "./XRContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Glasses, Smartphone } from "lucide-react";

interface XRRootProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  showControls?: boolean;
}

function XRScene({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 3]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Environment preset="sunset" />
      <OrbitControls enableDamping dampingFactor={0.05} />
      
      {/* Default scene content */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      
      {/* Grid helper for reference */}
      <gridHelper args={[10, 10]} />
      
      {children}
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <Activity className="h-8 w-8 animate-spin" />
    </div>
  );
}

export function XRRoot({ children, fallback, showControls = true }: XRRootProps) {
  const { isXRSupported, isXRActive, startXRSession, endXRSession, xrMode, error } = useXR();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile devices
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="w-full h-full relative">
      {/* XR Status Bar */}
      {showControls && (
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={isXRSupported ? "default" : "secondary"}>
              {isMobile ? <Smartphone className="h-3 w-3 mr-1" /> : <Glasses className="h-3 w-3 mr-1" />}
              {isXRSupported ? "XR Ready" : "Fallback Mode"}
            </Badge>
            {isXRActive && (
              <Badge variant="outline" className="animate-pulse">
                <Activity className="h-3 w-3 mr-1" />
                XR Active
              </Badge>
            )}
          </div>

          {isXRSupported && !isXRActive && (
            <Button size="sm" onClick={startXRSession}>
              Enter XR Mode
            </Button>
          )}
          
          {isXRActive && (
            <Button size="sm" variant="destructive" onClick={endXRSession}>
              Exit XR
            </Button>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <p className="text-sm text-yellow-800">{error}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3D Canvas */}
      <div ref={canvasRef} className="w-full h-full">
        <Canvas
          shadows
          gl={{
            antialias: true,
            alpha: true,
          }}
          style={{
            width: "100%",
            height: "100%",
            touchAction: "none",
          }}
        >
          <Suspense fallback={null}>
            <XRScene>{children}</XRScene>
          </Suspense>
        </Canvas>
      </div>

      {/* Fallback content if XR is not supported */}
      {!isXRSupported && fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          {fallback}
        </div>
      )}
    </div>
  );
}
