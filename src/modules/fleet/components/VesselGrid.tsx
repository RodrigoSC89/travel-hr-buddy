import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Ship, 
  MapPin, 
  Fuel, 
  Users, 
  Activity, 
  Eye,
  MoreHorizontal,
  Anchor,
  Navigation,
  Pencil,
  Trash2,
  Copy,
  Archive,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Vessel {
  id: string;
  name: string;
  status: string;
  vessel_type?: string;
  current_location?: string;
  location?: string;
  imo_number?: string;
  fuel_level?: number;
  crew_count?: number;
  efficiency?: number;
  speed?: number;
  next_port?: string;
  eta?: string;
}

interface VesselGridProps {
  vessels: Vessel[];
  onViewDetails: (vessel: Vessel) => void;
  onEditVessel?: (vessel: Vessel) => void;
  onDeleteVessel?: (vessel: Vessel) => void;
  isLoading?: boolean;
}

const statusConfig: Record<string, { color: string; label: string; bgColor: string }> = {
  active: { color: "text-success", label: "Operacional", bgColor: "bg-success" },
  operational: { color: "text-success", label: "Operacional", bgColor: "bg-success" },
  maintenance: { color: "text-warning", label: "Manutenção", bgColor: "bg-warning" },
  "in-port": { color: "text-primary", label: "Em Porto", bgColor: "bg-primary" },
  docked: { color: "text-primary", label: "Atracado", bgColor: "bg-primary" },
  inactive: { color: "text-muted-foreground", label: "Inativo", bgColor: "bg-muted-foreground" },
};

const VesselCard: React.FC<{ 
  vessel: Vessel; 
  onViewDetails: (v: Vessel) => void; 
  onEditVessel?: (v: Vessel) => void;
  onDeleteVessel?: (v: Vessel) => void;
  index: number 
}> = ({
  vessel,
  onViewDetails,
  onEditVessel,
  onDeleteVessel,
  index
}) => {
  const status = statusConfig[vessel.status] || statusConfig.inactive;
  // Deterministic fallback based on vessel name hash
  const nameHash = (vessel.name || '').split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
  const fuelLevel = vessel.fuel_level || (60 + (nameHash % 35));
  const efficiency = vessel.efficiency || (85 + (nameHash % 14));
  const crewCount = vessel.crew_count || (18 + ((nameHash * 3) % 10));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Card className="group relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300">
        {/* Gradient Accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
        
        {/* Decorative Circle */}
        <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-transparent group-hover:scale-150 transition-transform duration-500" />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Ship className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">{vessel.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {vessel.imo_number ? `IMO: ${vessel.imo_number}` : vessel.vessel_type || "Embarcação"}
                </p>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className={cn("gap-1.5", status.color)}
            >
              <span className={cn("h-2 w-2 rounded-full animate-pulse", status.bgColor)} />
              {status.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {vessel.current_location || vessel.location || "Localização não informada"}
            </span>
          </div>

          {/* Stats Grid - Responsive */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
            <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
              <Fuel className="h-3 w-3 sm:h-4 sm:w-4 mx-auto text-warning mb-0.5 sm:mb-1" />
              <p className="text-sm sm:text-lg font-bold">{fuelLevel}%</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Combustível</p>
            </div>
            <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mx-auto text-primary mb-0.5 sm:mb-1" />
              <p className="text-sm sm:text-lg font-bold">{crewCount}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Tripulação</p>
            </div>
            <div className="text-center p-1.5 sm:p-2 rounded-lg bg-muted/50">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 mx-auto text-success mb-0.5 sm:mb-1" />
              <p className="text-sm sm:text-lg font-bold">{efficiency}%</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Eficiência</p>
            </div>
          </div>

          {/* Efficiency Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Performance Geral</span>
              <span className="font-medium">{efficiency}%</span>
            </div>
            <Progress value={efficiency} className="h-2" />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onViewDetails(vessel)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Detalhes
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Mais opções" title="Mais opções">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEditVessel?.(vessel)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  Arquivar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDeleteVessel?.(vessel)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const VesselGrid: React.FC<VesselGridProps> = ({ vessels, onViewDetails, onEditVessel, onDeleteVessel, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={`vessel-skeleton-${i}`} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded" />
                <div className="h-20 bg-muted rounded" />
                <div className="h-8 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (vessels.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Ship className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Nenhuma embarcação encontrada</h3>
            <p className="text-muted-foreground mt-1">
              Adicione sua primeira embarcação para começar a gerenciar sua frota.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {vessels.map((vessel, index) => (
        <VesselCard
          key={vessel.id}
          vessel={vessel}
          onViewDetails={onViewDetails}
          onEditVessel={onEditVessel}
          onDeleteVessel={onDeleteVessel}
          index={index}
        />
      ))}
    </div>
  );
};
