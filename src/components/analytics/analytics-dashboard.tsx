import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, BarChart3, Brain, Target } from "lucide-react";
import PredictiveAnalytics from "./PredictiveAnalytics";

const AnalyticsDashboard = () => {
  const [selectedPeriod] = useState("30d");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Avançado</h1>
          <p className="text-muted-foreground">
            Análise preditiva e insights inteligentes para tomada de decisão
          </p>
        </div>
      </div>

      <Tabs defaultValue="predictive" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-fit">
          <TabsTrigger value="predictive" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Preditiva
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Metas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictive">
          <PredictiveAnalytics />
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance Geral</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">94.2%</div>
                  <p className="text-xs text-muted-foreground">+2.1% vs mês anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">87.5%</div>
                  <p className="text-xs text-muted-foreground">Meta: 85%</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">4.8/5</div>
                  <p className="text-xs text-muted-foreground">+0.3 este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ROI</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">312%</div>
                  <p className="text-xs text-muted-foreground">+15% vs Q anterior</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance em Tempo Real</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Indicadores Principais</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Uptime do Sistema</span>
                        <span className="text-sm font-medium text-green-600">99.9%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Tempo de Resposta</span>
                        <span className="text-sm font-medium text-blue-600">145ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Taxa de Erro</span>
                        <span className="text-sm font-medium text-green-600">0.1%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Usuários Ativos</span>
                        <span className="text-sm font-medium text-purple-600">1,247</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Alertas e Notificações</h4>
                    <div className="space-y-2">
                      <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          Todos os sistemas operando normalmente
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Última verificação: há 2 minutos
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Pico de tráfego detectado
                        </p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          +35% acima da média
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Insights Gerados por IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                        Oportunidade de Crescimento
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Identificamos uma correlação de 87% entre treinamentos em IA e aumento de produtividade. 
                        Recomendamos expandir o programa de capacitação.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                      <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                        Otimização de Custos
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Automatizar 3 processos específicos pode reduzir custos operacionais em até 23% 
                        nos próximos 6 meses.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950">
                      <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                        Retenção de Talentos
                      </h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Funcionários com acesso a ferramentas de IA têm 34% menos probabilidade de deixar a empresa.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950">
                      <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                        Satisfação do Cliente
                      </h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Implementar chatbot inteligente pode melhorar tempo de resposta em 67% 
                        e satisfação geral em 15%.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 border rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10">
                    <h4 className="font-medium mb-3">Recomendação Estratégica</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Com base na análise de todos os dados disponíveis, recomendamos focar em três áreas principais: 
                      <strong> automatização de processos</strong>, <strong>capacitação em IA</strong> e 
                      <strong> melhoria da experiência do cliente</strong>. Esta estratégia pode resultar em um ROI de 280% 
                      nos próximos 12 meses.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Metas e Objetivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { name: "Receita Anual", current: 85, target: 100, color: "bg-blue-500" },
                    { name: "Satisfação Cliente", current: 94, target: 96, color: "bg-green-500" },
                    { name: "Eficiência Operacional", current: 87, target: 90, color: "bg-purple-500" },
                    { name: "Redução de Custos", current: 76, target: 85, color: "bg-orange-500" },
                    { name: "Inovação (IA)", current: 68, target: 80, color: "bg-pink-500" }
                  ].map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{goal.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {goal.current}% de {goal.target}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${goal.color}`}
                          style={{ width: `${(goal.current / goal.target) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Próximas Ações Recomendadas</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                      <p className="text-sm">Implementar 2 novos fluxos de automação para melhorar eficiência</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                      <p className="text-sm">Expandir programa de treinamento em IA para mais 25% da equipe</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                      <p className="text-sm">Revisar processos de atendimento ao cliente com foco em velocidade</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;