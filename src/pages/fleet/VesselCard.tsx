import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Ship, MapPin, Gauge, Fuel, Users } from "lucide-react";
import { EnrichedVessel, STATUS_CONFIG } from "./types";

export const VesselCard = ({ vessel, onClick }: { vessel: EnrichedVessel; onClick: () => void }) => {
  const config = STATUS_CONFIG[vessel.status] || STATUS_CONFIG.operational;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{vessel.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {vessel.current_location || vessel.location || "Posição não informada"}
              </div>
            </div>
            <Badge variant={config.variant} className="gap-1">
              <div className={`h-2 w-2 rounded-full ${config.color} animate-pulse`} />
              {config.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Gauge className="h-3 w-3" />
                Velocidade
              </div>
              <p className="text-xl font-bold font-mono">{vessel.speed || 0} <span className="text-sm text-muted-foreground">kn</span></p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Fuel className="h-3 w-3" />
                Combustível
              </div>
              <p className="text-xl font-bold font-mono">{vessel.fuel || 85}<span className="text-sm text-muted-foreground">%</span></p>
            </div>
          </div>

          {vessel.efficiency && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Eficiência</span>
                <span className="text-xs font-bold font-mono">{vessel.efficiency}%</span>
              </div>
              <Progress value={vessel.efficiency} className="h-1.5" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2 border-t text-sm">
            <div className="flex items-center gap-2">
              <Ship className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{vessel.vessel_type || "Cargo"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{vessel.crew_count || 0} tripulantes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
