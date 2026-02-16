import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, DollarSign, Target, GraduationCap } from 'lucide-react';

export const HROverviewTab: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: UserPlus, title: 'Nova Admissão', desc: 'Admissão digital em 1 dia', color: 'primary' },
          { icon: DollarSign, title: 'Processar Folha', desc: 'Cálculo automático com IA', color: 'success' },
          { icon: Target, title: 'Avaliações', desc: 'Desempenho e OKRs', color: 'accent' },
          { icon: GraduationCap, title: 'Treinamentos', desc: 'LMS e desenvolvimento', color: 'warning' },
        ].map((item) => (
          <Card key={item.title} className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className={`p-3 bg-${item.color}/10 rounded-full`}>
                <item.icon className={`h-6 w-6 text-${item.color === 'accent' ? 'accent-foreground' : item.color}`} />
              </div>
              <h3 className="font-medium">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity & Pending */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-lg">Atividades Recentes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { action: 'Admissão aprovada', employee: 'Maria Silva', time: '2h atrás', type: 'success' },
              { action: 'Férias solicitadas', employee: 'João Santos', time: '4h atrás', type: 'info' },
              { action: 'Atestado enviado', employee: 'Ana Costa', time: '1d atrás', type: 'warning' },
              { action: 'Avaliação concluída', employee: 'Carlos Oliveira', time: '2d atrás', type: 'success' },
            ].map((item) => (
              <div key={item.action} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <div className={`w-2 h-2 rounded-full ${item.type === 'success' ? 'bg-success' : item.type === 'warning' ? 'bg-warning' : 'bg-primary'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.employee}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Pendências</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: 'Aprovar férias', count: 5, priority: 'high' },
              { title: 'Documentos pendentes', count: 8, priority: 'medium' },
              { title: 'Admissões em andamento', count: 4, priority: 'high' },
              { title: 'Avaliações atrasadas', count: 3, priority: 'low' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}>{item.count}</Badge>
                <span className="text-sm">{item.title}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
