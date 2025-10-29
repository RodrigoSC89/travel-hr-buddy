/**
 * PATCH 565 - Quality Dashboard Page
 * Executive quality dashboard route at /dashboard/quality
 */

import React from 'react';
import { QualityDashboard } from '@/components/quality-dashboard/QualityDashboard';

const QualityDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <QualityDashboard />
    </div>
  );
};

export default QualityDashboardPage;
