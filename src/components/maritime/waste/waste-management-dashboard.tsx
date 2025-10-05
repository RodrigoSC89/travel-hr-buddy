import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Leaf, Droplet, Trash2, FileText, Brain, Download, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const WasteManagementDashboard: React.FC = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary" />
            Gerenciamento de Resíduos e MARPOL
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão ambiental com conformidade MARPOL automática
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório MARPOL
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resíduos Oleosos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">65%</div>
            <Progress value={65} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Capacidade usada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resíduos Sólidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42%</div>
            <Progress value={42} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Capacidade usada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Emissões CO2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">-12%</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
              <TrendingUp className="w-3 h-3" />
              vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conformidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">100%</div>
            <p className="text-xs text-muted-foreground mt-2">MARPOL compliance</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <Leaf className="w-4 h-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="sensors">
            <Droplet className="w-4 h-4 mr-2" />
            Sensores IoT
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="w-4 h-4 mr-2" />
            Relatórios MARPOL
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Brain className="w-4 h-4 mr-2" />
            IA Ambiental
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Resíduos</CardTitle>
              <CardDescription>
                Geração, segregação, armazenamento e descarte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplet className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold">Resíduos Oleosos</h4>
                  </div>
                  <p className="text-2xl font-bold">1,250 L</p>
                  <Progress value={65} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">65% da capacidade</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Trash2 className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold">Resíduos Sólidos</h4>
                  </div>
                  <p className="text-2xl font-bold">380 kg</p>
                  <Progress value={42} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">42% da capacidade</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplet className="w-5 h-5 text-purple-500" />
                    <h4 className="font-semibold">Resíduos Sanitários</h4>
                  </div>
                  <p className="text-2xl font-bold">920 L</p>
                  <Progress value={55} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">55% da capacidade</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integração com Sensores IoT</CardTitle>
              <CardDescription>
                Monitoramento em tempo real dos tanques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sensores IoT conectados para monitoramento automático de níveis
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios MARPOL Automáticos</CardTitle>
              <CardDescription>
                Oil Record Book, Garbage Record Book, Sewage Log
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Oil Record Book (Parte I e II)
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Garbage Record Book
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Sewage Discharge Log
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                IA para Gestão Ambiental
              </CardTitle>
              <CardDescription>
                Assistente inteligente para conformidade MARPOL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Geração de Relatórios</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>✓ MARPOL automático</p>
                    <p>✓ Conformidade IMO</p>
                    <p>✓ Auditoria ready</p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Práticas de Descarte</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>✓ Segregação correta</p>
                    <p>✓ Procedimentos otimizados</p>
                    <p>✓ Regulamentos atualizados</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
