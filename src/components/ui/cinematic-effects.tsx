/**
 * Cinematic Effects - World-class visual effects
 * Particle systems, wave animations, glassmorphism cards
 */
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

// ============================================
// OCEAN WAVE CANVAS - Animated background
// ============================================
export function OceanWaveBackground({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduce = useReducedMotion();
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (shouldReduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio > 1 ? 1.5 : 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio > 1 ? 1.5 : 1);
    };
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    const draw = () => {
      t += 0.008;
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      // Draw 3 wave layers
      const waves = [
        { amplitude: h * 0.04, frequency: 0.008, speed: 1, alpha: 0.08 },
        { amplitude: h * 0.03, frequency: 0.012, speed: 1.3, alpha: 0.05 },
        { amplitude: h * 0.02, frequency: 0.018, speed: 0.7, alpha: 0.03 },
      ];

      waves.forEach(wave => {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 3) {
          const y = h * 0.65 + Math.sin(x * wave.frequency + t * wave.speed) * wave.amplitude
            + Math.sin(x * wave.frequency * 0.5 + t * wave.speed * 0.7) * wave.amplitude * 0.5;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = `hsla(200, 80%, 60%, ${wave.alpha})`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [shouldReduce]);

  if (shouldReduce) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: 0.6 }}
    />
  );
}

// ============================================
// PARTICLE FIELD - Floating particles
// ============================================
export function ParticleField({
  count = 30,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const shouldReduce = useReducedMotion();
  if (shouldReduce) return null;

  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// GLASS MORPHISM CARD - Premium card effect
// ============================================
export function GlassMorphCard({
  children,
  className = "",
  glowColor = "hsl(var(--primary))",
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  hover?: boolean;
}) {
  return (
    <motion.div
      className={`
        relative rounded-2xl overflow-hidden
        bg-card/60 backdrop-blur-xl
        border border-border/30
        shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.15)]
        ${className}
      `}
      whileHover={hover ? {
        y: -2,
        boxShadow: `0 16px 48px -12px ${glowColor}30`,
        borderColor: `${glowColor}40`,
      } : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// PULSE RING - Status indicator with pulse
// ============================================
export function PulseRing({
  status = "operational",
  size = "md",
}: {
  status?: "operational" | "warning" | "critical";
  size?: "sm" | "md" | "lg";
}) {
  const colors = {
    operational: "bg-success",
    warning: "bg-warning",
    critical: "bg-destructive",
  };

  const sizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <span className="relative inline-flex">
      <span className={`${sizes[size]} rounded-full ${colors[status]}`} />
      <span className={`absolute inline-flex h-full w-full rounded-full ${colors[status]} opacity-50 animate-ping`} />
    </span>
  );
}

// ============================================
// ANIMATED GRADIENT TEXT
// ============================================
export function GradientText({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[gradient-shift_3s_ease-in-out_infinite] ${className}`}
    >
      {children}
    </span>
  );
}

// ============================================
// LOADING BEAM - Premium loading indicator
// ============================================
export function LoadingBeam({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-0.5 w-full overflow-hidden rounded-full bg-muted ${className}`}>
      <motion.div
        className="absolute h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"
        animate={{ x: ["-100%", "400%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// ============================================
// METRIC SPARKLINE - Mini inline chart
// ============================================
export function MetricSparkline({
  data,
  color = "hsl(var(--primary))",
  className = "",
}: {
  data: number[];
  color?: string;
  className?: string;
}) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className={className} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
