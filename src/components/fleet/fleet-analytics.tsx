import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Activity, Fuel } from 'lucide-react';

const FleetAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Analytics da Frota
          </CardTitle>
          <CardDescription>
            Análises avançadas e relatórios de performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-success" />
              <div className="text-2xl font-bold">94.2%</div>
              <div className="text-sm text-muted-foreground">Eficiência Geral</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Fuel className="h-8 w-8 mx-auto mb-2 text-warning" />
              <div className="text-2xl font-bold">112 L/h</div>
              <div className="text-sm text-muted-foreground">Consumo Médio</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Activity className="h-8 w-8 mx-auto mb-2 text-info" />
              <div className="text-2xl font-bold">18.7h</div>
              <div className="text-sm text-muted-foreground">Tempo Médio</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FleetAnalytics;