import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { JobFormWithExamples } from "@/components/copilot";
import { Sparkles, Wrench, Search, Bot } from "lucide-react";

const CopilotJobForm = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Sparkles}
        title="Copilot - Criação de Jobs"
        description="Crie jobs de manutenção com assistência de IA e exemplos similares"
        gradient="blue"
        badges={[
          { icon: Bot, label: "IA Integrada" },
          { icon: Search, label: "Busca Inteligente" },
          { icon: Wrench, label: "Manutenção" }
        ]}
      />
      <div className="container mx-auto p-6">
        <JobFormWithExamples />
      </div>
    </ModulePageWrapper>
  );
};

export default CopilotJobForm;
