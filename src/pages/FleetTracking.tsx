import React from "react";
import VesselTrackingMap from "@/components/fleet/vessel-tracking-map";
import { MapPin } from "lucide-react";

const FleetTracking = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-lg bg-primary/10">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Rastreamento de Frota</h1>
          <p className="text-muted-foreground">Monitoramento em tempo real das embarcações</p>
        </div>
      </div>

      <div className="h-[calc(100vh-200px)]">
        <VesselTrackingMap />
      </div>
    </div>
  );
};

export default FleetTracking;
