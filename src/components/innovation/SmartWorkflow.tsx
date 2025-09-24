// Smart Workflow Component - versão concisa
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, CheckCircle, Clock } from 'lucide-react';

export const SmartWorkflow = () => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="text-3xl font-bold gradient-text mb-2">Automações Inteligentes</h2>
      <p className="text-muted-foreground">Workflows automatizados em desenvolvimento</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            Automações Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-warning">12</p>
          <p className="text-sm text-muted-foreground">Processos automatizados</p>
        </CardContent>
      </Card>
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Taxa de Sucesso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-success">99.2%</p>
          <p className="text-sm text-muted-foreground">Execuções bem-sucedidas</p>
        </CardContent>
      </Card>
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Tempo Economizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-primary">847h</p>
          <p className="text-sm text-muted-foreground">Economizadas este mês</p>
        </CardContent>
      </Card>
    </div>
  </div>
);