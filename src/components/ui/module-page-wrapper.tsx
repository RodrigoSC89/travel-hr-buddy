import React from "react";
import { cn } from "@/lib/utils";

interface ModulePageWrapperProps {
  children: React.ReactNode;
  className?: string;
  gradient?: "blue" | "purple" | "green" | "orange" | "neutral";
  withBackButton?: boolean;
}

const gradientClasses = {
  blue: "from-background via-primary/5 to-blue-500/10",
  purple: "from-background via-purple-500/5 to-pink-500/10",
  green: "from-background via-green-500/5 to-emerald-500/10",
  orange: "from-background via-orange-500/5 to-amber-500/10",
  neutral: "from-background via-muted/20 to-background",
};

export const ModulePageWrapper: React.FC<ModulePageWrapperProps> = ({
  children,
  className,
  gradient = "neutral",
  withBackButton = true,
}) => {
  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br relative overflow-hidden",
        gradientClasses[gradient],
        className
      )}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl pointer-events-none animate-float-reverse" />

      {/* Content */}
      <div className="relative z-10 container mx-auto p-6 space-y-6">{children}</div>
    </div>
  );
};
