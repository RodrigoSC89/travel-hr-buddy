/**
 * AI Assistant Page - Página do Assistente de IA
 * Wrapper para o NavigationAssistant com integração completa
 */

import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { MessageSquare, Bot, Sparkles, Zap } from "lucide-react";
import NavigationAssistant from "./NavigationAssistant";

const AIAssistantPage: React.FC = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={MessageSquare}
        title="Assistente de IA"
        description="Assistente inteligente conversacional com IA avançada"
        gradient="blue"
        badges={[
          { icon: Bot, label: "Copilot Ativo" },
          { icon: Sparkles, label: "98.7% Precisão" },
          { icon: Zap, label: "Resposta Rápida" }
        ]}
      />
      <NavigationAssistant />
    </ModulePageWrapper>
  );
};

export default AIAssistantPage;
