import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Pill, 
  FileText, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Users,
  Shield,
  Brain,
  Download,
  Plus,
  Clipboard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const MedicalHealthDashboard: React.FC = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('inventory');

  const medications = [
    { id: '1', name: 'Paracetamol 500mg', quantity: 150, minStock: 50, expiry: '2025-12-31', status: 'ok' },
    { id: '2', name: 'Antibiótico Amoxicilina', quantity: 30, minStock: 20, expiry: '2025-06-30', status: 'warning' },
    { id: '3', name: 'Anti-inflamatório Ibuprofeno', quantity: 80, minStock: 40, expiry: '2025-03-15', status: 'alert' },
    { id: '4', name: 'Antialérgico Loratadina', quantity: 45, minStock: 30, expiry: '2025-09-20', status: 'ok' },
  ];

  const consultations = [
    { id: '1', crewName: 'Carlos Silva', date: '2025-01-15', diagnosis: 'Gripe', medication: 'Paracetamol', status: 'completed' },
    { id: '2', crewName: 'Ana Costa', date: '2025-01-14', diagnosis: 'Dor muscular', medication: 'Ibuprofeno', status: 'completed' },
    { id: '3', crewName: 'João Santos', date: '2025-01-13', diagnosis: 'Alergia', medication: 'Loratadina', status: 'follow-up' },
  ];

  const suggestRestock = () => {
    toast({
      title: "🤖 Reposição IA Sugerida",
      description: "Lista de medicamentos a repor foi gerada automaticamente",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            Enfermaria, Saúde e Medicamentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão completa de saúde marítima com IA integrada
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={suggestRestock}>
            <Brain className="w-4 h-4 mr-2" />
            IA: Sugerir Reposição
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Estoque Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground mt-2">Itens cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vencendo em 90 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">12</div>
            <p className="text-xs text-muted-foreground mt-2">Requer atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
              <TrendingUp className="w-3 h-3" />
              -15% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conformidade MLC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">100%</div>
            <p className="text-xs text-muted-foreground mt-2">Todos itens ok</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="inventory">
            <Pill className="w-4 h-4 mr-2" />
            Estoque
          </TabsTrigger>
          <TabsTrigger value="consultations">
            <Clipboard className="w-4 h-4 mr-2" />
            Atendimentos
          </TabsTrigger>
          <TabsTrigger value="records">
            <FileText className="w-4 h-4 mr-2" />
            Fichas Médicas
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Brain className="w-4 h-4 mr-2" />
            IA Médica
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Estoque Médico</CardTitle>
              <CardDescription>
                Gestão de medicamentos com alertas automáticos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications.map((med) => (
                  <div key={med.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{med.name}</h4>
                      <p className="text-sm text-muted-foreground">Validade: {med.expiry}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm font-semibold">{med.quantity}</div>
                        <div className="text-xs text-muted-foreground">Estoque</div>
                      </div>
                      <Badge variant={
                        med.status === 'ok' ? 'default' :
                        med.status === 'warning' ? 'outline' : 'destructive'
                      }>
                        {med.status === 'ok' ? 'OK' :
                         med.status === 'warning' ? 'Atenção' : 'Crítico'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Atendimentos</CardTitle>
              <CardDescription>
                Histórico de consultas e tratamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consultations.map((consult) => (
                  <div key={consult.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{consult.crewName}</h4>
                      <p className="text-sm text-muted-foreground">{consult.diagnosis}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Medicação: {consult.medication}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{consult.date}</div>
                      <Badge variant="outline" className="mt-1">
                        {consult.status === 'completed' ? 'Concluído' : 'Follow-up'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fichas Médicas Digitais</CardTitle>
              <CardDescription>
                Registros confidenciais integrados com RH
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                      Dados Protegidos
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Todas as fichas médicas são criptografadas e protegidas conforme LGPD e MLC.
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Acessar Fichas Médicas
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Assistente Médico Virtual
              </CardTitle>
              <CardDescription>
                IA para primeiros socorros e suporte médico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Primeiros Socorros</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>✓ Triagem inteligente de sintomas</p>
                    <p>✓ Protocolo de emergência</p>
                    <p>✓ Instruções passo a passo</p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Interações Medicamentosas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>✓ Verificação automática</p>
                    <p>✓ Alertas de contraindicações</p>
                    <p>✓ Dosagem recomendada</p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Reposição Automática</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>✓ Análise de consumo médio</p>
                    <p>✓ Previsão de necessidades</p>
                    <p>✓ Lista de compras otimizada</p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Relatórios MLC</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>✓ Geração automática</p>
                    <p>✓ Conformidade garantida</p>
                    <p>✓ Port State Control ready</p>
                  </CardContent>
                </Card>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full">
                  <Brain className="w-4 h-4 mr-2" />
                  Consultar IA Médica
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
