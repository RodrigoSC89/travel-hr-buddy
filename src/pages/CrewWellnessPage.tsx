/**
 * Crew Wellness Page
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CrewWellnessDashboard } from '@/components/crew/CrewWellnessDashboard';

export default function CrewWellnessPage() {
  return (
    <>
      <Helmet>
        <title>Bem-Estar da Tripulação | Nauti One</title>
      </Helmet>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bem-Estar da Tripulação</h1>
          <p className="text-muted-foreground">IA para monitoramento de saúde mental e prevenção de burnout</p>
        </div>
        <CrewWellnessDashboard />
      </div>
    </>
  );
}
