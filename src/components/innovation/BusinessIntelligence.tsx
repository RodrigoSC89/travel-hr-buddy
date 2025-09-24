// Business Intelligence Component - versão concisa
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, Download } from 'lucide-react';

export const BusinessIntelligence = () => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="text-3xl font-bold gradient-text mb-2">Business Intelligence Avançado</h2>
      <p className="text-muted-foreground">Dashboards inteligentes em desenvolvimento</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            KPIs Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-success">+23%</p>
          <p className="text-sm text-muted-foreground">Eficiência operacional</p>
        </CardContent>
      </Card>
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Analytics Preditivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-primary">94.7%</p>
          <p className="text-sm text-muted-foreground">Precisão das previsões</p>
        </CardContent>
      </Card>
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-warning" />
            Relatórios Automáticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-warning">247</p>
          <p className="text-sm text-muted-foreground">Relatórios gerados este mês</p>
        </CardContent>
      </Card>
    </div>
  </div>
);