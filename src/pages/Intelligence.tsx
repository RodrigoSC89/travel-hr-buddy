import React from 'react';
import EnhancedAIChatbot from '@/components/intelligence/enhanced-ai-chatbot';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';
import { ModuleHeader } from '@/components/ui/module-header';
import { Brain, MessageSquare, Sparkles, Zap } from 'lucide-react';

const Intelligence = () => {
  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Brain}
        title="Inteligência Artificial"
        description="Sistema de IA conversacional e assistência inteligente avançada"
        gradient="purple"
        badges={[
          { icon: MessageSquare, label: 'Chatbot Avançado' },
          { icon: Sparkles, label: 'IA Contextual' },
          { icon: Zap, label: 'Respostas Instantâneas' }
        ]}
      />
      <EnhancedAIChatbot />
    </ModulePageWrapper>
  );
};

export default Intelligence;