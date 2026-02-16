import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Clock, AlertTriangle, CheckCircle2, Calendar, Brain, Moon, Bell, Target, Zap,
} from 'lucide-react';
import { CrewMember, MLCViolation, getRiskBadgeColor } from './types';

interface FatigueTabsProps {
  crew: CrewMember[];
  violations: MLCViolation[];
}

export const FatigueTabs: React.FC<FatigueTabsProps> = ({ crew, violations }) => {
  return (
    <Tabs defaultValue="crew">
      <TabsList>
        <TabsTrigger value="crew">Tripulação</TabsTrigger>
        <TabsTrigger value="violations">Violações MLC ({violations.length})</TabsTrigger>
        <TabsTrigger value="predictions">Predições IA</TabsTrigger>
        <TabsTrigger value="schedule">Otimização de Escala</TabsTrigger>
      </TabsList>

      <TabsContent value="crew" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crew.map((member) => (
            <motion.div key={member.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={cn(
                "border-2",
                member.riskLevel === 'critical' && "border-destructive/50 bg-destructive/5",
                member.riskLevel === 'high' && "border-warning/30"
              )}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">{member.rank} • {member.department}</p>
                        </div>
                        <Badge variant="outline" className={getRiskBadgeColor(member.riskLevel)}>
                          {member.riskLevel === 'critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {member.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Índice de Fadiga</span>
                          <span className="font-medium">{member.fatigueScore}%</span>
                        </div>
                        <Progress value={member.fatigueScore} className={cn(
                          "h-2",
                          member.fatigueScore > 70 && "[&>div]:bg-destructive",
                          member.fatigueScore > 50 && member.fatigueScore <= 70 && "[&>div]:bg-warning",
                          member.fatigueScore <= 50 && "[&>div]:bg-success"
                        )} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="p-2 bg-muted/50 rounded">
                          <div className="flex items-center gap-1 text-muted-foreground mb-1"><Clock className="h-3 w-3" />Hoje</div>
                          <span className="font-medium">{member.workHoursToday}h</span>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <div className="flex items-center gap-1 text-muted-foreground mb-1"><Calendar className="h-3 w-3" />Semana</div>
                          <span className={cn("font-medium", member.workHoursWeek > 60 && "text-destructive")}>{member.workHoursWeek}h</span>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <div className="flex items-center gap-1 text-muted-foreground mb-1"><Moon className="h-3 w-3" />Descanso 24h</div>
                          <span className={cn("font-medium", member.restHoursLast24h < 6 && "text-destructive")}>{member.restHoursLast24h}h</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2">
                          {member.mlcCompliant ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
                          <span className="text-xs">MLC 2006: {member.mlcCompliant ? 'Conforme' : 'Não Conforme'}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Último intervalo: {member.lastBreak}</span>
                      </div>
                      {member.riskLevel !== 'low' && (
                        <div className={cn("mt-3 p-2 rounded text-xs", member.riskLevel === 'critical' ? 'bg-destructive/20' : 'bg-warning/10')}>
                          <div className="flex items-center gap-1 font-medium mb-1"><Brain className="h-3 w-3" />Predição IA:</div>
                          <p className="text-muted-foreground">{member.predictions.recommendation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="violations">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" />Violações MLC 2006</CardTitle>
            <CardDescription>Registro de não conformidades com regulamentos de trabalho marítimo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {violations.map((violation) => (
                <motion.div key={violation.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <div className={cn("flex items-start gap-4 p-4 border rounded-lg", violation.severity === 'violation' ? 'border-destructive/30 bg-destructive/5' : 'border-warning/30 bg-warning/5')}>
                    <div className={cn("p-2 rounded-full", violation.severity === 'violation' ? 'bg-destructive/20' : 'bg-warning/20')}>
                      {violation.severity === 'violation' ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <Bell className="h-4 w-4 text-warning" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{violation.type}</h4>
                        <Badge variant={violation.severity === 'violation' ? 'destructive' : 'secondary'}>
                          {violation.severity === 'violation' ? 'Violação' : 'Alerta'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{violation.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Tripulante: {violation.crewName}</span>
                        <span>{violation.date}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="predictions">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" />Predições de Fadiga com Machine Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Brain className="h-16 w-16 mx-auto text-primary/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">Modelo ML Ativo</h3>
              <p className="text-muted-foreground mb-4">Analisando padrões de trabalho, descanso e performance para predizer picos de fadiga</p>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="p-3 bg-muted rounded-lg"><p className="text-2xl font-bold">94%</p><p className="text-xs text-muted-foreground">Precisão</p></div>
                <div className="p-3 bg-muted rounded-lg"><p className="text-2xl font-bold">6h</p><p className="text-xs text-muted-foreground">Antecedência</p></div>
                <div className="p-3 bg-muted rounded-lg"><p className="text-2xl font-bold">1.2k</p><p className="text-xs text-muted-foreground">Dados analisados</p></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="schedule">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Otimização de Escala</CardTitle>
            <CardDescription>Sugestões de escala para minimizar fadiga e maximizar compliance MLC</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Target className="h-16 w-16 mx-auto text-primary/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">Otimizador de Escala</h3>
              <p className="text-muted-foreground mb-4">A IA está analisando as melhores combinações de turnos para sua tripulação</p>
              <Button><Zap className="h-4 w-4 mr-2" />Gerar Escala Otimizada</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
