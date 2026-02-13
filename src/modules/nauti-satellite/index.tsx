/**
 * Nautilus Satellite - Módulo Unificado de Satélite
 * PATCH UNIFY-3.0 - Fusão dos módulos de Satélite/Tracking
 */

import React from "react";
import { Satellite } from "lucide-react";

const NautilusSatellite = () => (
  <div className="p-6 text-center space-y-4">
    <Satellite className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
    <h2 className="text-xl font-semibold">Nautilus Satellite</h2>
    <p className="text-muted-foreground">Módulo de rastreamento por satélite.</p>
  </div>
);

export default NautilusSatellite;
