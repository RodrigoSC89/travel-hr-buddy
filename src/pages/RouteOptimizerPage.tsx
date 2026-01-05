/**
 * Route Optimizer Page
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { RouteOptimizerDashboard } from '@/components/navigation/RouteOptimizerDashboard';

export default function RouteOptimizerPage() {
  return (
    <>
      <Helmet>
        <title>Otimização de Rotas | Nautilus One</title>
      </Helmet>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Otimização de Rotas AI</h1>
          <p className="text-muted-foreground">Rotas otimizadas com previsão meteorológica, combustível e zonas de risco</p>
        </div>
        <RouteOptimizerDashboard />
      </div>
    </>
  );
}
