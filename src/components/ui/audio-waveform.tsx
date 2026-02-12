import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  isActive: boolean;
  type: 'input' | 'output';
  className?: string;
  barCount?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isActive,
  type,
  className,
  barCount = 5
}) => {
  const bars = Array.from({ length: barCount }, (_, i) => i);
  
  // Different animation delays for each bar to create wave effect
  const getAnimationDelay = (index: number) => {
    const center = Math.floor(barCount / 2);
    const distance = Math.abs(index - center);
    return `${distance * 0.1}s`;
  };

  // Different max heights for center-focused wave effect
  const getMaxHeight = (index: number) => {
    const center = Math.floor(barCount / 2);
    const distance = Math.abs(index - center);
    const heights = [100, 80, 60, 40, 30];
    return heights[Math.min(distance, heights.length - 1)];
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-center gap-1 h-8",
        className
      )}
      role="status"
      aria-label={isActive ? `${type === 'input' ? 'Capturing' : 'Playing'} audio` : 'Audio inactive'}
    >
      {bars.map((_, index) => (
        <div
          key={index}
          className={cn(
            "w-1 rounded-full transition-all duration-150",
            type === 'input' 
              ? 'bg-primary' 
              : 'bg-success',
            isActive ? 'opacity-100' : 'opacity-30'
          )}
          style={{
            height: isActive ? `${((Math.sin(Date.now() / 200 + index * 1.3) + 1) / 2) * getMaxHeight(index)}%` : '20%',
            animationDelay: getAnimationDelay(index),
            minHeight: '4px',
          }}
        />
      ))}
    </div>
  );
};

// Animated waveform with CSS animations
export const AnimatedAudioWaveform: React.FC<AudioWaveformProps> = ({
  isActive,
  type,
  className,
  barCount = 7
}) => {
  const bars = Array.from({ length: barCount }, (_, i) => i);

  return (
    <div 
      className={cn(
        "flex items-center justify-center gap-0.5 h-10",
        className
      )}
    >
      {bars.map((_, index) => {
        const delay = index * 0.1;
        const baseHeight = type === 'input' ? 40 : 50;
        
        return (
          <div
            key={index}
            className={cn(
              "w-1 rounded-full transition-opacity",
              type === 'input' 
                ? 'bg-gradient-to-t from-primary/50 to-primary' 
                : 'bg-gradient-to-t from-success/50 to-success',
              isActive ? 'opacity-100' : 'opacity-20'
            )}
            style={{
              height: isActive ? `${baseHeight}%` : '15%',
              animation: isActive 
                ? `waveform 0.8s ease-in-out ${delay}s infinite alternate` 
                : 'none',
              minHeight: '4px',
            }}
          />
        );
      })}
      
      <style>{`
        @keyframes waveform {
          0% { height: 20%; }
          50% { height: 80%; }
          100% { height: 40%; }
        }
      `}</style>
    </div>
  );
};

// Real-time waveform using canvas
interface CanvasWaveformProps {
  isActive: boolean;
  type: 'input' | 'output';
  className?: string;
  analyserNode?: AnalyserNode | null;
}

export const CanvasWaveform: React.FC<CanvasWaveformProps> = ({
  isActive,
  type,
  className,
  analyserNode
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (!isActive) {
        // Draw flat line when inactive
        ctx.beginPath();
        ctx.strokeStyle = type === 'input' ? 'hsl(var(--primary))' : '#22c55e';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }

      // Draw simulated waveform
      ctx.beginPath();
      ctx.strokeStyle = type === 'input' ? 'hsl(var(--primary))' : '#22c55e';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 1;

      const sliceWidth = width / 50;
      let x = 0;

      for (let i = 0; i < 50; i++) {
        const amplitude = (Math.sin(Date.now() / 100 + i * 0.5) * 0.3 + 0.5) * height * 0.4;
        const y = height / 2 + (Math.sin(Date.now() / 80 + i * 0.8) - 0.5) * amplitude;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    if (isActive) {
      draw();
    } else {
      draw(); // Draw once for inactive state
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, type, analyserNode]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={40}
      className={cn("rounded-lg", className)}
    />
  );
};

// Circular pulsing indicator
interface PulseIndicatorProps {
  isActive: boolean;
  type: 'input' | 'output';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PulseIndicator: React.FC<PulseIndicatorProps> = ({
  isActive,
  type,
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  const pulseClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Pulse rings */}
      {isActive && (
        <>
          <div 
            className={cn(
              "absolute rounded-full animate-ping",
              pulseClasses[size],
              type === 'input' ? 'bg-primary/30' : 'bg-success/30'
            )}
          />
          <div 
            className={cn(
              "absolute rounded-full animate-pulse",
              pulseClasses[size],
              type === 'input' ? 'bg-primary/20' : 'bg-success/20'
            )}
            style={{ animationDelay: '0.2s' }}
          />
        </>
      )}
      
      {/* Core indicator */}
      <div 
        className={cn(
          "rounded-full z-10 transition-colors",
          sizeClasses[size],
          isActive
            ? type === 'input' ? 'bg-primary' : 'bg-success'
            : 'bg-muted-foreground/30'
        )}
      />
    </div>
  );
};
