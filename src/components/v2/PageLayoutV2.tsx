/**
 * PageLayoutV2 - Layout V2 Padronizado
 * Estrutura modular para todos os módulos elevados
 */

import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BackToDashboard } from "@/components/ui/back-to-dashboard";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles } from "lucide-react";

interface PageLayoutV2Props {
  children: ReactNode;
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: "blue" | "purple" | "green" | "orange" | "yellow" | "red" | "indigo" | "cyan" | "teal";
  badges?: Array<{
    icon: LucideIcon;
    label: string;
  }>;
  aiEnabled?: boolean;
  className?: string;
}

const gradientBgClasses = {
  blue: "from-background via-primary/5 to-info/10",
  purple: "from-background via-secondary/5 to-accent/10",
  green: "from-background via-success/5 to-success/10",
  orange: "from-background via-warning/5 to-warning/10",
  yellow: "from-background via-warning/5 to-warning/10",
  red: "from-background via-destructive/5 to-destructive/10",
  indigo: "from-background via-primary/5 to-secondary/10",
  cyan: "from-background via-info/5 to-info/10",
  teal: "from-background via-success/5 to-success/10",
};

const gradientHeaderClasses = {
  blue: "from-primary via-primary/90 to-primary/80",
  purple: "from-secondary via-secondary/90 to-secondary/80",
  green: "from-success via-success/90 to-success/80",
  orange: "from-warning via-warning/90 to-warning/80",
  yellow: "from-warning via-warning/90 to-warning/80",
  red: "from-destructive via-destructive/90 to-destructive/80",
  indigo: "from-primary via-primary/90 to-secondary/80",
  cyan: "from-info via-info/90 to-info/80",
  teal: "from-success via-success/90 to-success/80",
};

export function PageLayoutV2({
  children,
  icon: Icon,
  title,
  description,
  gradient = "blue",
  badges = [],
  aiEnabled = true,
  className,
}: PageLayoutV2Props) {
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br relative overflow-hidden",
      gradientBgClasses[gradient],
      className
    )}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl pointer-events-none animate-float-reverse" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto p-6 space-y-6">
        <BackToDashboard />
        
        {/* Header */}
        <div className={cn(
          "relative overflow-hidden rounded-2xl p-8 text-white",
          "bg-gradient-to-br shadow-lg",
          gradientHeaderClasses[gradient],
        )}>
          <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold mb-2">{title}</h1>
                  {aiEnabled && (
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                      <Sparkles className="h-3 w-3 mr-1" />
                      IA Integrada
                    </Badge>
                  )}
                </div>
                <p className="text-lg opacity-95">{description}</p>
              </div>
            </div>
            
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-6">
                {badges.map((badge) => {
                  const BadgeIcon = badge.icon;
                  return (
                    <div
                      key={badge.label}
                      className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <BadgeIcon className="h-4 w-4" />
                      <span className="font-medium text-sm">{badge.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Main Content */}
        {children}
      </div>
    </div>
  );
}

export default PageLayoutV2;
