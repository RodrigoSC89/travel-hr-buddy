/**
 * Satellite Optimizer Page
 * Maritime satellite communication optimization
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SatelliteOptimizerDashboard } from '@/components/connectivity/SatelliteOptimizerDashboard';

export default function SatelliteOptimizerPage() {
  return (
    <>
      <Helmet>
        <title>Otimização Satélite | Nautilus One</title>
        <meta name="description" content="Otimização de comunicação via satélite para operações marítimas" />
      </Helmet>
      
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Otimização de Satélite</h1>
          <p className="text-muted-foreground">
            Compressão, delta sync e gestão de conectividade para reduzir custos de transmissão
          </p>
        </div>
        
        <SatelliteOptimizerDashboard />
      </div>
    </>
  );
}
