import React from 'react';
import IntegratedAIAssistant from '@/components/ai/integrated-ai-assistant';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';

const AIAssistantPage = () => {
  return (
    <ModulePageWrapper gradient="purple">
      <IntegratedAIAssistant />
    </ModulePageWrapper>
  );
};

export default AIAssistantPage;