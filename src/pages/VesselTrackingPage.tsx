/**
 * Vessel Tracking Page
 * Real-time AIS vessel positions with interactive map
 */

import React, { useState } from 'react';
import { VesselTrackingMap } from '@/components/fleet/VesselTrackingMap';

export default function VesselTrackingPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rastreamento de Embarcações</h1>
        <p className="text-muted-foreground mt-1">
          Posições AIS em tempo real com dados do MarineTraffic
        </p>
      </div>
      
      <VesselTrackingMap autoRefresh refreshInterval={60000} />
    </div>
  );
}
