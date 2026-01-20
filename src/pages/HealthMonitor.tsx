import React from 'react';
import { Helmet } from 'react-helmet-async';
import ProductionHealthDashboard from '@/components/monitoring/ProductionHealthDashboard';

const HealthMonitor: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Health Monitor | Nauti One</title>
        <meta name="description" content="Production health monitoring dashboard" />
      </Helmet>
      
      <div className="container mx-auto py-6 px-4">
        <ProductionHealthDashboard />
      </div>
    </>
  );
};

export default HealthMonitor;
