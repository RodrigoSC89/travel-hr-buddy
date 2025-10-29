import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Patch521Validation from '@/modules/route-planner/validation/Patch521Validation';
import Patch522Validation from '@/modules/price-predictor/validation/Patch522Validation';
import Patch523Validation from '@/modules/travel-system/validation/Patch523Validation';
import Patch524Validation from '@/modules/task-automation/validation/Patch524Validation';
import Patch525Validation from '@/modules/forecast-engine/validation/Patch525Validation';
import Patch535Validation from '@/modules/security-validation/Patch535Validation';
import Patch536Validation from '@/modules/testing/validation/Patch536Validation';
import Patch537Validation from '@/modules/audit/validation/Patch537Validation';
import Patch538Validation from '@/modules/adaptive-ui/validation/Patch538Validation';
import Patch539Validation from '@/modules/ai-logging/validation/Patch539Validation';
import Patch540Validation from '@/modules/system-status/validation/Patch540Validation';

export default function MasterValidationDashboard() {
  const patches = [
    { id: 521, name: 'AI Route Planner', status: 'pending', category: 'AI Features' },
    { id: 522, name: 'Price Predictor', status: 'pending', category: 'AI Features' },
    { id: 523, name: 'Travel System + Forecast', status: 'pending', category: 'Core Features' },
    { id: 524, name: 'Task Automation Rules', status: 'pending', category: 'Automation' },
    { id: 525, name: 'Forecast AI Engine v2', status: 'pending', category: 'AI Features' },
    { id: 535, name: 'Security Audit (Lovable)', status: 'active', category: 'Security' },
    { id: 536, name: 'Automated Testing', status: 'pending', category: 'Quality' },
    { id: 537, name: 'Audit Dashboard', status: 'active', category: 'Security' },
    { id: 538, name: 'Adaptive UI Engine', status: 'pending', category: 'UI/UX' },
    { id: 539, name: 'AI Logging', status: 'active', category: 'Security' },
    { id: 540, name: 'System Status Panel', status: 'pending', category: 'Operations' },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold">🧪 Master Validation Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Validação completa de todos os patches (521-525, 535-540)
        </p>
      </div>

      {/* Overview Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total de Patches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{patches.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Em Validação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {patches.filter(p => p.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground">
              {patches.filter(p => p.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patches Overview */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Status dos Patches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {patches.map(patch => (
              <div
                key={patch.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  {patch.status === 'active' ? (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">PATCH {patch.id} - {patch.name}</p>
                    <p className="text-xs text-muted-foreground">{patch.category}</p>
                  </div>
                </div>
                <Badge variant={patch.status === 'active' ? 'default' : 'secondary'}>
                  {patch.status === 'active' ? 'Em Validação' : 'Pendente'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Validations */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Validações Detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="535">
            <TabsList className="grid grid-cols-6 lg:grid-cols-11">
              <TabsTrigger value="521">521</TabsTrigger>
              <TabsTrigger value="522">522</TabsTrigger>
              <TabsTrigger value="523">523</TabsTrigger>
              <TabsTrigger value="524">524</TabsTrigger>
              <TabsTrigger value="525">525</TabsTrigger>
              <TabsTrigger value="535">535</TabsTrigger>
              <TabsTrigger value="536">536</TabsTrigger>
              <TabsTrigger value="537">537</TabsTrigger>
              <TabsTrigger value="538">538</TabsTrigger>
              <TabsTrigger value="539">539</TabsTrigger>
              <TabsTrigger value="540">540</TabsTrigger>
            </TabsList>

            <TabsContent value="521"><Patch521Validation /></TabsContent>
            <TabsContent value="522"><Patch522Validation /></TabsContent>
            <TabsContent value="523"><Patch523Validation /></TabsContent>
            <TabsContent value="524"><Patch524Validation /></TabsContent>
            <TabsContent value="525"><Patch525Validation /></TabsContent>
            <TabsContent value="535"><Patch535Validation /></TabsContent>
            <TabsContent value="536"><Patch536Validation /></TabsContent>
            <TabsContent value="537"><Patch537Validation /></TabsContent>
            <TabsContent value="538"><Patch538Validation /></TabsContent>
            <TabsContent value="539"><Patch539Validation /></TabsContent>
            <TabsContent value="540"><Patch540Validation /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Recomendações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <p className="font-medium">Segurança (PATCH 535)</p>
                <p className="text-sm text-muted-foreground">
                  Tabelas ai_logs e ai_commands criadas com RLS ativa. Integrar logging nos serviços.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-1" />
              <div>
                <p className="font-medium">AI Features (PATCHES 521, 522, 525)</p>
                <p className="text-sm text-muted-foreground">
                  Implementar validações de interface e integração com dados reais.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-1" />
              <div>
                <p className="font-medium">Testing (PATCH 536)</p>
                <p className="text-sm text-muted-foreground">
                  Criar testes unitários e E2E para cobertura mínima de 80%.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
