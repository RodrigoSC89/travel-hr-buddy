import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Ship, 
  MapPin, 
  Fuel, 
  Users, 
  Activity, 
  Eye,
  MoreHorizontal,
  Anchor,
  Navigation
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
  isLoading?: boolean;
}

const statusConfig: Record<string, { color: string; label: string; bgColor: string }> = {
  active: { color: "text-green-600", label: "Operacional", bgColor: "bg-green-500" },
  operational: { color: "text-green-600", label: "Operacional", bgColor: "bg-green-500" },
  maintenance: { color: "text-yellow-600", label: "Manutenção", bgColor: "bg-yellow-500" },
  "in-port": { color: "text-blue-600", label: "Em Porto", bgColor: "bg-blue-500" },
  docked: { color: "text-blue-600", label: "Atracado", bgColor: "bg-blue-500" },
  inactive: { color: "text-gray-500", label: "Inativo", bgColor: "bg-gray-500" },
};

const VesselCard: React.FC<{ vessel: Vessel; onViewDetails: (v: Vessel) => void; index: number }> = ({
  vessel,
  onViewDetails,
  index
}) => {
  const status = statusConfig[vessel.status] || statusConfig.inactive;
  const fuelLevel = vessel.fuel_level || Math.floor(Math.random() * 40 + 60);
  const efficiency = vessel.efficiency || Math.floor(Math.random() * 15 + 85);
  const crewCount = vessel.crew_count || Math.floor(Math.random() * 10 + 18);

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

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <Fuel className="h-4 w-4 mx-auto text-orange-500 mb-1" />
              <p className="text-lg font-bold">{fuelLevel}%</p>
              <p className="text-xs text-muted-foreground">Combustível</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <Users className="h-4 w-4 mx-auto text-blue-500 mb-1" />
              <p className="text-lg font-bold">{crewCount}</p>
              <p className="text-xs text-muted-foreground">Tripulação</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <Activity className="h-4 w-4 mx-auto text-green-500 mb-1" />
              <p className="text-lg font-bold">{efficiency}%</p>
              <p className="text-xs text-muted-foreground">Eficiência</p>
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
              onClick={() => handleonViewDetails}
            >
              <Eye className="h-4 w-4 mr-2" />
              Detalhes
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const VesselGrid: React.FC<VesselGridProps> = ({ vessels, onViewDetails, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
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
          index={index}
        />
      ))}
    </div>
  );
});
