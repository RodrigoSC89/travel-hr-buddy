import React from "react";
import { MMIReportDemo } from "@/components/mmi";

/**
 * Page showcasing the MMI Report Template functionality
 * Demonstrates intelligent maintenance reporting with AI suggestions
 */
const MMIReportPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">
          ⚙️ Sistema MMI - Manutenção com IA
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Sistema de relatórios inteligentes de manutenção com sugestões de IA embarcada.
          Exportável em PDF com um único clique.
        </p>
      </div>

      <div className="flex justify-center">
        <MMIReportDemo />
      </div>

      <div className="mt-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              💬 Copilot de Manutenção com IA
            </h3>
            <p className="text-sm text-muted-foreground">
              Sugestões inteligentes baseadas em análise de dados e padrões de manutenção.
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              ⏱️ Leitura de Horímetro (IoT Simulado)
            </h3>
            <p className="text-sm text-muted-foreground">
              Monitoramento contínuo de horas de operação dos equipamentos.
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              📧 Alertas Automáticos
            </h3>
            <p className="text-sm text-muted-foreground">
              Notificações automáticas para jobs críticos e prazos próximos.
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              📄 Relatório PDF com Insights
            </h3>
            <p className="text-sm text-muted-foreground">
              Relatórios profissionais com análises técnicas e recomendações da IA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MMIReportPage;
