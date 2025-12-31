/**
 * Advanced Search Page - Global AI-powered search
 */
import React from "react";
import { Search, Brain, Filter, Sparkles } from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { safeLazyImport } from "@/utils/safeLazyImport";

const AdvancedSearch = safeLazyImport(
  () => import("@/components/search/AdvancedSearch").then(m => ({ default: m.AdvancedSearch })),
  "Advanced Search"
);

const AdvancedSearchPage: React.FC = () => {
  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Search}
        title="Busca Avançada com IA"
        description="Busca global inteligente com sugestões da IA e filtros avançados"
        gradient="purple"
        badges={[
          { icon: Brain, label: "IA Sugestiva" },
          { icon: Filter, label: "Filtros" },
          { icon: Sparkles, label: "Semântica" }
        ]}
      />
      <AdvancedSearch />
    </ModulePageWrapper>
  );
};

export default AdvancedSearchPage;
