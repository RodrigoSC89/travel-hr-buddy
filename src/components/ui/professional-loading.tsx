import React from "react";
import { motion } from "framer-motion";
import { Ship, Anchor, Waves } from "lucide-react";

interface ProfessionalLoadingProps {
  message?: string;
  variant?: "default" | "minimal" | "fullscreen";
}

export const ProfessionalLoading: React.FC<ProfessionalLoadingProps> = ({
  message = "Carregando...",
  variant = "default"
}) => {
  if (variant === "minimal") {
    return (
      <div className="flex items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Anchor className="h-6 w-6 text-primary" />
        </motion.div>
        <span className="ml-3 text-sm text-muted-foreground">{message}</span>
      </div>
    );
  }

  if (variant === "fullscreen") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
        <NautilusAnimation />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-muted-foreground"
        >
          {message}
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <NautilusAnimation size="md" />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-sm text-muted-foreground"
      >
        {message}
      </motion.p>
    </div>
  );
};

interface NautilusAnimationProps {
  size?: "sm" | "md" | "lg";
}

const NautilusAnimation: React.FC<NautilusAnimationProps> = ({ size = "lg" }) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };

  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary/20"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Middle ring */}
      <motion.div
        className="absolute inset-2 rounded-full border-2 border-primary/40"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
      />
      
      {/* Inner circle with ship */}
      <motion.div
        className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <Ship className={`${iconSizes[size]} text-primary`} />
      </motion.div>

      {/* Waves animation */}
      <motion.div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Waves className="h-4 w-4 text-primary/60" />
      </motion.div>
    </div>
  );
};

// Skeleton específico para cards KPI
export const KPISkeleton: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
        className="p-6 rounded-lg bg-card border border-border"
      >
        <div className="h-4 w-24 bg-muted rounded mb-3" />
        <div className="h-8 w-20 bg-muted rounded mb-2" />
        <div className="h-3 w-16 bg-muted rounded" />
      </motion.div>
    ))}
  </div>
);

// Skeleton para tabelas
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="rounded-lg border border-border overflow-hidden">
    {/* Header */}
    <div className="bg-muted/50 p-4 flex gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-4 bg-muted rounded flex-1" />
      ))}
    </div>
    {/* Rows */}
    {[...Array(rows)].map((_, rowIdx) => (
      <motion.div
        key={rowIdx}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: rowIdx * 0.1 }}
        className="p-4 flex gap-4 border-t border-border"
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded flex-1" />
        ))}
      </motion.div>
    ))}
  </div>
);

// Skeleton para charts
export const ChartSkeleton: React.FC = () => (
  <div className="p-6 rounded-lg border border-border">
    <div className="h-5 w-32 bg-muted rounded mb-6" />
    <div className="h-64 flex items-end justify-around gap-2">
      {[...Array(7)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ height: "20%" }}
          animate={{ height: ["20%", `${30 + Math.random() * 50}%`, "20%"] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
          className="w-full bg-gradient-to-t from-primary/20 to-primary/5 rounded-t"
        />
      ))}
    </div>
  </div>
);

export default ProfessionalLoading;
