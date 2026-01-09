import React from 'react';
import { MLCCrewScheduling } from '@/components/scheduling/MLCCrewScheduling';

const MLCSchedulingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">MLC Crew Scheduling</h1>
          <p className="text-muted-foreground">MLC 2006 compliant crew rotation and rest hours management</p>
        </div>
        <MLCCrewScheduling />
      </div>
    </div>
  );
};

export default MLCSchedulingPage;
