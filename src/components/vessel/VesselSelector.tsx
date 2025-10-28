/**
 * PATCH 204.0 - Vessel Selector Component
 * Dropdown selector for switching between vessels in the header
 */

import React from "react";
import { Ship, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useVessel, type Vessel } from "@/lib/vesselContext";
import { cn } from "@/lib/utils";

interface VesselSelectorProps {
  className?: string;
  showIcon?: boolean;
}

export const VesselSelector: React.FC<VesselSelectorProps> = ({ 
  className,
  showIcon = true,
}) => {
  const { currentVessel, allVessels, setCurrentVessel, loading } = useVessel();

  const getStatusBadgeVariant = (status: Vessel["status"]): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
    case "active":
      return "default";
    case "maintenance":
      return "secondary";
    case "inactive":
      return "outline";
    default:
      return "outline";
    }
  };

  const getStatusColor = (status: Vessel["status"]): string => {
    switch (status) {
    case "active":
      return "text-green-500";
    case "maintenance":
      return "text-yellow-500";
    case "inactive":
      return "text-gray-500";
    default:
      return "text-gray-500";
    }
  };

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-8 w-8 bg-muted rounded"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (allVessels.length === 0) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        {showIcon && <Ship className="h-4 w-4" />}
        <span className="text-sm">No vessels available</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center gap-2 min-w-[200px] justify-between",
            className
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {showIcon && <Ship className="h-4 w-4 flex-shrink-0" />}
            <div className="flex flex-col items-start min-w-0">
              <span className="text-sm font-medium truncate max-w-[150px]">
                {currentVessel?.name || "Select Vessel"}
              </span>
              {currentVessel && (
                <span className={cn("text-xs", getStatusColor(currentVessel.status))}>
                  {currentVessel.status}
                </span>
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Select Vessel</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allVessels.map((vessel) => (
          <DropdownMenuItem
            key={vessel.id}
            onClick={() => setCurrentVessel(vessel)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Ship className="h-4 w-4 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">
                  {vessel.name}
                </span>
                {vessel.imo_number && (
                  <span className="text-xs text-muted-foreground">
                    IMO: {vessel.imo_number}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <Badge variant={getStatusBadgeVariant(vessel.status)} className="text-xs">
                {vessel.status}
              </Badge>
              {currentVessel?.id === vessel.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
        {allVessels.length === 0 && (
          <DropdownMenuItem disabled>
            No vessels available
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default VesselSelector;
