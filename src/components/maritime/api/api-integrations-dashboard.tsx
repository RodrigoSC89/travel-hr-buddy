import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Brain, Webhook, Key } from 'lucide-react';

export const APIIntegrationsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Code className="w-8 h-8 text-primary" />
          APIs e Integrações Avançadas
        </h1>
        <p className="text-muted-foreground mt-1">
          RESTful API, webhooks e SDK público
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Endpoints Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <Badge variant="default" className="mt-2">Online</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">API Calls (hoje)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,547</div>
            <p className="text-xs text-muted-foreground mt-2">Requisições</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <Badge variant="outline" className="mt-2">Configurados</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Integrações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <Badge variant="default" className="mt-2">Ativas</Badge>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            IA para APIs e Integrações
          </CardTitle>
          <CardDescription>
            Documentação automática e otimização de integrações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Documentação Automática</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>✓ API docs gerados</p>
                <p>✓ Exemplos de código</p>
                <p>✓ Sempre atualizados</p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Geração de SDKs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>✓ Múltiplas linguagens</p>
                <p>✓ Code snippets</p>
                <p>✓ Guias de uso</p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Monitoramento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>✓ Performance tracking</p>
                <p>✓ Alertas de erros</p>
                <p>✓ Otimizações sugeridas</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
