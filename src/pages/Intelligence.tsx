import React from 'react';
import EnhancedAIChatbot from '@/components/intelligence/enhanced-ai-chatbot';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';

const Intelligence = () => {
  return (
    <div className="space-y-6">
      <BackToDashboard />
      <EnhancedAIChatbot />
    </div>
  );
};

export default Intelligence;