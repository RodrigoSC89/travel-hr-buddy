import React from 'react';
import { RealTimeWorkspace } from '@/components/collaboration/real-time-workspace';

const CollaborationPage = () => {
  return (
    <div className="h-screen bg-background">
      <RealTimeWorkspace workspaceId="main" />
    </div>
  );
};

export default CollaborationPage;