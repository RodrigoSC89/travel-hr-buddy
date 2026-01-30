/**
 * HR Vacation Manager Component
 * Gestão inteligente de férias com sugestões de IA
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, AlertTriangle, CheckCircle2, Clock, Brain, CalendarDays } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function HRVacationManager() {
  const [tab, setTab] = useState('pending');

  const pendingRequests = [
    { 
      id: '1', name: 'Maria Silva', position: 'Desenvolvedora', 
      period: '01-15/02/2026', days: 15, requestedAt: '2026-01-05',
      aiRecommendation: { approved: true, reason: 'Sem conflitos de projeto' }
    },
    { 
      id: '2', name: 'João Santos', position: 'Gerente de Projetos', 
      period: '20-30/02/2026', days: 10, requestedAt: '2026-01-08',
      aiRecommendation: { approved: false, reason: 'Conflito com entrega do Projeto X' }
    },
  ];

  const expiringVacations = [
    { 
      id: '1', name: 'Ana Costa', position: 'Designer', 
      daysRemaining: 30, expiryDate: '2026-02-15', daysToExpiry: 37,
      aiSuggestion: 'Período ideal: 01-28/02 (evita conflitos)'
    },
    { 
      id: '2', name: 'Carlos Oliveira', position: 'Analista', 
      daysRemaining: 25, expiryDate: '2026-03-10', daysToExpiry: 60,
      aiSuggestion: 'Período sugerido: 15/02-10/03'
    },
    { 
      id: '3', name: 'Paula Mendes', position: 'Coordenadora', 
      daysRemaining: 15, expiryDate: '2026-01-30', daysToExpiry: 12,
      aiSuggestion: '⚠️ URGENTE: Agendar imediatamente'
    },
  ];

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pendentes ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="expiring" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Vencendo ({expiringVacations.length})
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Calendário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {pendingRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar>
                      <AvatarFallback>
                        {request.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{request.name}</p>
                      <p className="text-sm text-muted-foreground">{request.position}</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{request.period}</span>
                      <Badge variant="secondary">{request.days} dias</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Solicitado em {new Date(request.requestedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className={`p-3 rounded-lg flex-1 ${
                    request.aiRecommendation.approved ? 'bg-green-500/10' : 'bg-amber-500/10'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className={`h-4 w-4 ${
                        request.aiRecommendation.approved ? 'text-green-500' : 'text-amber-500'
                      }`} />
                      <span className="text-sm font-medium">
                        {request.aiRecommendation.approved ? 'IA Recomenda Aprovar' : 'IA Alerta'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {request.aiRecommendation.reason}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Recusar</Button>
                    <Button size="sm" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Aprovar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="expiring" className="space-y-4 mt-4">
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="font-medium text-amber-500">
                  {expiringVacations.length} colaboradores com férias próximas de vencer
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Férias não gozadas resultam em multa de 100% do valor para a empresa (CLT Art. 137)
              </p>
            </CardContent>
          </Card>

          {expiringVacations.map((vacation) => (
            <Card key={vacation.id} className={
              vacation.daysToExpiry <= 30 ? 'border-red-500/30' : 
              vacation.daysToExpiry <= 60 ? 'border-amber-500/30' : ''
            }>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar>
                      <AvatarFallback>
                        {vacation.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{vacation.name}</p>
                      <p className="text-sm text-muted-foreground">{vacation.position}</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={
                        vacation.daysToExpiry <= 30 ? 'destructive' : 
                        vacation.daysToExpiry <= 60 ? 'default' : 'secondary'
                      }>
                        Vence em {vacation.daysToExpiry} dias
                      </Badge>
                    </div>
                    <p className="text-sm">
                      {vacation.daysRemaining} dias disponíveis • Vence {new Date(vacation.expiryDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-primary/10 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Sugestão IA</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {vacation.aiSuggestion}
                    </p>
                  </div>

                  <Button size="sm" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    Agendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Férias</CardTitle>
              <CardDescription>Visão mensal das férias programadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">Calendário interativo em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
