import React from "react";
import { DropdownTestCenter } from "@/components/ui/dropdown-test-center";
import { SEOHead } from "@/components/seo/seo-head";

const DropdownTests: React.FC = () => {
  return (
    <>
      <SEOHead 
        title="Testes de Dropdowns - Nautilus One"
        description="Centro de testes para todos os componentes suspensos do sistema, verificando funcionalidade e contraste visual."
        keywords="dropdown, menu, teste, UI, contraste, acessibilidade"
      />
      <div className="min-h-screen bg-background">
        <DropdownTestCenter />
      </div>
    </>
  );
};

export default DropdownTests;