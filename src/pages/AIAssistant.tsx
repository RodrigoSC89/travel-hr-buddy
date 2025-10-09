import React from "react";
import IntegratedAIAssistant from "@/components/ai/integrated-ai-assistant";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Bot, Brain, MessageSquare, Sparkles } from "lucide-react";

const AIAssistantPage = () => {
  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Bot}
        title="Assistente IA"
        description="Assistente inteligente conversacional com IA avançada para suporte e automação"
        gradient="purple"
        badges={[
          { icon: Brain, label: "IA Avançada" },
          { icon: MessageSquare, label: "Conversacional" },
          { icon: Sparkles, label: "98.7% Precisão" }
        ]}
      />
      <IntegratedAIAssistant />
    </ModulePageWrapper>
  );
};

export default AIAssistantPage;