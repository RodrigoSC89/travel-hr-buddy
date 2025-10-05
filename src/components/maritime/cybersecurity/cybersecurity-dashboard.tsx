import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Brain, Lock } from 'lucide-react';

export const CybersecurityDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          Cibersegurança Marítima
        </h1>
        <p className="text-muted-foreground mt-1">
          Proteção avançada com IA e monitoramento 24/7
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ameaças Bloqueadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <Badge variant="default" className="mt-2">Seguro</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Firewall Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Ativo</div>
            <Badge variant="outline" className="mt-2">Online</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Últim Backup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">Hoje 03:00</div>
            <Badge variant="default" className="mt-2">Sincronizado</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">MFA Ativo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">100%</div>
            <p className="text-xs text-muted-foreground mt-2">Usuários protegidos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            IA de Segurança Cibernética
          </CardTitle>
          <CardDescription>
            Detecção de anomalias e resposta automática
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Detecção de Anomalias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>✓ IA monitora tráfego 24/7</p>
                <p>✓ Padrões suspeitos identificados</p>
                <p>✓ Alertas em tempo real</p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Resposta Automática</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>✓ Bloqueio proativo</p>
                <p>✓ Isolamento de ameaças</p>
                <p>✓ Recovery automático</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
