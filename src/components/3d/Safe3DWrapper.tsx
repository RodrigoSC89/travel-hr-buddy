/**
 * Safe 3D Wrapper with automatic fallback to 2D
 * Handles react-three-fiber compatibility issues gracefully
 */

import React, { Suspense, useState, useEffect, lazy, ComponentType } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Box, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Safe3DWrapperProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

// Error boundary for 3D components
class ThreeErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('3D rendering failed, using 2D fallback:', error.message);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Loading placeholder
const LoadingPlaceholder = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center bg-muted/20 rounded-lg ${className}`}>
    <div className="text-center text-muted-foreground">
      <Box className="h-8 w-8 mx-auto mb-2 animate-pulse" />
      <p className="text-sm">Carregando visualização 3D...</p>
    </div>
  </div>
);

// 3D unavailable placeholder
const ThreeUnavailable = ({ 
  className, 
  onRetry 
}: { 
  className?: string; 
  onRetry?: () => void;
}) => (
  <div className={`flex items-center justify-center bg-muted/10 rounded-lg border border-dashed ${className}`}>
    <div className="text-center text-muted-foreground p-4">
      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
      <p className="text-sm mb-2">Visualização 3D indisponível</p>
      <Badge variant="outline" className="text-xs">Usando modo 2D</Badge>
      {onRetry && (
        <Button variant="ghost" size="sm" className="mt-2" onClick={onRetry}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Tentar novamente
        </Button>
      )}
    </div>
  </div>
);

export const Safe3DWrapper: React.FC<Safe3DWrapperProps> = ({
  fallback,
  children,
  className = "min-h-[300px]"
}) => {
  const [use2D, setUse2D] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Check if WebGL is available
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
          setUse2D(true);
        }
      } catch (e) {
        setUse2D(true);
      }
      setChecked(true);
    };
    checkWebGL();
  }, []);

  if (!checked) {
    return <LoadingPlaceholder className={className} />;
  }

  if (use2D) {
    return <>{fallback}</>;
  }

  return (
    <ThreeErrorBoundary 
      fallback={fallback} 
      onError={() => setUse2D(true)}
    >
      <Suspense fallback={<LoadingPlaceholder className={className} />}>
        {children}
      </Suspense>
    </ThreeErrorBoundary>
  );
};

// HOC to wrap any 3D component with safe fallback
export function withSafe3D<P extends object>(
  Component3D: ComponentType<P>,
  Component2D: ComponentType<P>,
  className?: string
) {
  return function SafeComponent(props: P) {
    return (
      <Safe3DWrapper 
        fallback={<Component2D {...props} />}
        className={className}
      >
        <Component3D {...props} />
      </Safe3DWrapper>
    );
  };
}

export default Safe3DWrapper;
