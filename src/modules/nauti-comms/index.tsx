/**
 * Nautilus Comms - Módulo Unificado de Comunicações
 * PATCH UNIFY-3.0 - Fusão dos módulos de Comunicação
 */

import React from "react";
import { Radio } from "lucide-react";

const NautilusComms = () => (
  <div className="p-6 text-center space-y-4">
    <Radio className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
    <h2 className="text-xl font-semibold">Nautilus Comms</h2>
    <p className="text-muted-foreground">Centro de comunicações marítimas unificado.</p>
  </div>
);

export default NautilusComms;
