/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * Micro-Interactions Components
 * Visual feedback components for better UX
 */

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, AlertCircle, Loader2, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Success Animation - Checkmark with pulse
 */
interface SuccessAnimationProps {
  show: boolean;
  size?: "sm" | "md" | "lg";
  onComplete?: () => void;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  show,
  size = "md",
  onComplete
}) => {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16"
  };

  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.2, 1] }}
            transition={{ duration: 0.4, times: [0, 0.6, 1] }}
            className={cn(
              "rounded-full bg-green-500/10 p-2 ring-2 ring-green-500/20",
              sizes[size]
            )}
          >
            <Check className="h-full w-full text-green-500" strokeWidth={3} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Ripple Effect Button Wrapper
 */
interface RippleProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const Ripple: React.FC<RippleProps> = ({ children, className, disabled }) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
  };

  return (
    <div 
      className={cn("relative overflow-hidden", className)} 
      onClick={handleClick}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: "translate(-50%, -50%)"
          }}
        />
      ))}
    </div>
  );
};

/**
 * Pulse Dot - Activity indicator
 */
interface PulseDotProps {
  color?: "green" | "red" | "yellow" | "blue";
  size?: "sm" | "md" | "lg";
}

export const PulseDot: React.FC<PulseDotProps> = ({ 
  color = "green",
  size = "md"
}) => {
  const colors = {
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    blue: "bg-blue-500"
  };

  const sizes = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4"
  };

  return (
    <span className="relative flex">
      <span className={cn(
        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
        colors[color]
      )} />
      <span className={cn(
        "relative inline-flex rounded-full",
        colors[color],
        sizes[size]
      )} />
    </span>
  );
};

/**
 * Status Indicator with animation
 */
interface StatusIndicatorProps {
  status: "online" | "offline" | "busy" | "away";
  showLabel?: boolean;
  size?: "sm" | "md";
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  showLabel = false,
  size = "md"
}) => {
  const config = {
    online: { color: "green", label: "Online", pulse: true },
    offline: { color: "gray", label: "Offline", pulse: false },
    busy: { color: "red", label: "Ocupado", pulse: true },
    away: { color: "yellow", label: "Ausente", pulse: false }
  };

  const { color, label, pulse } = config[status];

  return (
    <div className="flex items-center gap-2">
      {pulse ? (
        <PulseDot color={color as "green" | "red" | "yellow"} size={size} />
      ) : (
        <span className={cn(
          "rounded-full",
          size === "sm" ? "h-2 w-2" : "h-3 w-3",
          color === "gray" ? "bg-gray-400" : `bg-${color}-500`
        )} />
      )}
      {showLabel && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
    </div>
  );
};

/**
 * Notification Badge with bounce animation
 */
interface NotificationBadgeProps {
  count: number;
  max?: number;
  animate?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  max = 99,
  animate = true
}) => {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <motion.span
      initial={animate ? { scale: 0 } : false}
      animate={{ scale: 1 }}
      className={cn(
        "absolute -top-1 -right-1 flex items-center justify-center",
        "min-w-[18px] h-[18px] px-1 rounded-full",
        "bg-destructive text-destructive-foreground",
        "text-[10px] font-bold"
      )}
    >
      {displayCount}
    </motion.span>
  );
};

/**
 * Loading Dots Animation
 */
export const LoadingDots: React.FC<{ className?: string }> = ({ className }) => (
  <span className={cn("inline-flex items-center gap-1", className)}>
    {[0, 1, 2].map(i => (
      <motion.span
        key={i}
        className="h-1.5 w-1.5 rounded-full bg-current"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: i * 0.2
        }}
      />
    ))}
  </span>
);

/**
 * Typing Indicator
 */
export const TypingIndicator: React.FC<{ name?: string }> = ({ name }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    {name && <span>{name}</span>}
    <span>está digitando</span>
    <LoadingDots />
  </div>
);

/**
 * Progress Ring
 */
interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 48,
  strokeWidth = 4,
  showPercentage = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          className="text-muted"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          className="text-primary"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          strokeDasharray={circumference}
          strokeLinecap="round"
        />
      </svg>
      {showPercentage && (
        <span className="absolute text-xs font-medium">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};
