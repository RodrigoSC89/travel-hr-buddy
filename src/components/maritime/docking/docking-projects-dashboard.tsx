import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Anchor, Brain, Calendar, DollarSign } from 'lucide-react';

export const DockingProjectsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Anchor className="w-8 h-8 text-primary" />
          Gestão de Projetos de Docagem
        </h1>
        <p className="text-muted-foreground mt-1">
          Maindeck integration e tendering automatizado
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            IA para Gestão de Docagem
          </CardTitle>
          <CardDescription>
            Análise de propostas e otimização de cronogramas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Análise de Propostas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>✓ Avaliação automática</p>
                <p>✓ Melhores fornecedores</p>
                <p>✓ Cost-benefit analysis</p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Documentação Técnica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>✓ Geração automática</p>
                <p>✓ Contratos e specs</p>
                <p>✓ Relatórios detalhados</p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Otimização de Cronograma</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>✓ Baseado em histórico</p>
                <p>✓ Predição de riscos</p>
                <p>✓ Mitigações sugeridas</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
