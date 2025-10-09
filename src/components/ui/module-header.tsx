import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BackToDashboard } from "./back-to-dashboard";

interface ModuleHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: "blue" | "purple" | "green" | "orange" | "yellow" | "red" | "indigo";
  badges?: Array<{
    icon: LucideIcon;
    label: string;
  }>;
  withBackButton?: boolean;
  className?: string;
}

const gradientClasses = {
  blue: "from-blue-600 via-blue-600/90 to-blue-700",
  purple: "from-purple-600 via-purple-600/90 to-purple-700",
  green: "from-green-600 via-green-600/90 to-green-700",
  orange: "from-orange-600 via-orange-600/90 to-orange-700",
  yellow: "from-yellow-600 via-yellow-600/90 to-yellow-700",
  red: "from-red-600 via-red-600/90 to-red-700",
  indigo: "from-indigo-600 via-indigo-600/90 to-indigo-700",
};

export const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  icon: Icon,
  title,
  description,
  gradient = "blue",
  badges = [],
  withBackButton = true,
  className,
}) => {
  return (
    <>
      {withBackButton && <BackToDashboard />}
      
      <div className={cn(
        "relative overflow-hidden rounded-2xl p-8 text-white",
        "bg-gradient-to-br",
        gradientClasses[gradient],
        "shadow-lg",
        className
      )}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Icon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <p className="text-lg opacity-95">{description}</p>
            </div>
          </div>
          
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-6">
              {badges.map((badge, index) => {
                const BadgeIcon = badge.icon;
                return (
                  <div
                    key={index}
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
    </>
  );
};
