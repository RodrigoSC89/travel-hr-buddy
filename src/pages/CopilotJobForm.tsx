import React from "react";
import { JobFormWithExamples } from "@/components/copilot";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Bot, FileText, Sparkles, Zap } from "lucide-react";

const CopilotJobFormPage = () => {
  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Bot}
        title="Criar Job com IA"
        description="Crie jobs de manutenção com assistência inteligente e exemplos históricos similares"
        gradient="purple"
        badges={[
          { icon: Sparkles, label: "IA Integrada" },
          { icon: FileText, label: "Exemplos Históricos" },
          { icon: Zap, label: "Preenchimento Automático" }
        ]}
      />
      <div className="container mx-auto px-4 py-8">
        <JobFormWithExamples />
      </div>
    </ModulePageWrapper>
  );
};

export default CopilotJobFormPage;
