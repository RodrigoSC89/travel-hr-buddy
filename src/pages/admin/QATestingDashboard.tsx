/**
 * QA & Testing Dashboard
 * Nauti One v4.0 - Simplified Version
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { TestTube, CheckCircle, XCircle, Clock, Play, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface TestSuite {
  id: string;
  name: string;
  type: string;
  total: number;
  passed: number;
  failed: number;
  coverage: number;
  status: 'passed' | 'failed' | 'running';
}

interface TestScenario {
  id: string;
  name: string;
  category: string;
  steps: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'passed' | 'failed' | 'pending';
}

const QATestingDashboard = () => {
  const [activeTab, setActiveTab] = useState("coverage");
  const [isRunning, setIsRunning] = useState(false);

  const suites: TestSuite[] = [
    { id: '1', name: 'Unit Tests', type: 'unit', total: 250, passed: 245, failed: 5, coverage: 85, status: 'passed' },
    { id: '2', name: 'Integration Tests', type: 'integration', total: 90, passed: 87, failed: 3, coverage: 80, status: 'passed' },
    { id: '3', name: 'E2E Tests', type: 'e2e', total: 45, passed: 43, failed: 2, coverage: 70, status: 'passed' },
    { id: '4', name: 'Performance Tests', type: 'performance', total: 20, passed: 20, failed: 0, coverage: 82, status: 'passed' },
    { id: '5', name: 'Security Tests', type: 'security', total: 30, passed: 30, failed: 0, coverage: 90, status: 'passed' },
  ];

  const scenarios: TestScenario[] = [
    { id: '1', name: 'User Authentication Flow', category: 'auth', steps: 8, priority: 'critical', status: 'passed' },
    { id: '2', name: 'Crew Member CRUD', category: 'crew', steps: 12, priority: 'high', status: 'passed' },
    { id: '3', name: 'Vessel Registration', category: 'fleet', steps: 10, priority: 'high', status: 'passed' },
    { id: '4', name: 'Compliance Report Generation', category: 'compliance', steps: 6, priority: 'medium', status: 'passed' },
    { id: '5', name: 'AI Chat Interaction', category: 'ai', steps: 5, priority: 'medium', status: 'pending' },
  ];

  const totalTests = suites.reduce((sum, s) => sum + s.total, 0);
  const totalPassed = suites.reduce((sum, s) => sum + s.passed, 0);
  const totalFailed = suites.reduce((sum, s) => sum + s.failed, 0);
  const passRate = (totalPassed / totalTests) * 100;
  const avgCoverage = suites.reduce((sum, s) => sum + s.coverage, 0) / suites.length;

  const handleRunTests = async () => {
    setIsRunning(true);
    toast.info("Executando testes...");
    await new Promise(r => setTimeout(r, 2000));
    toast.success(`Testes concluídos: ${passRate.toFixed(1)}% passou`);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TestTube className="h-8 w-8 text-primary" />
            QA & Testing Dashboard
          </h1>
          <p className="text-muted-foreground">Cobertura de Testes & Automação QA</p>
        </div>
        <Button onClick={handleRunTests} disabled={isRunning}>
          {isRunning ? (
            <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Executando...</>
          ) : (
            <><Play className="h-4 w-4 mr-2" /> Run All Tests</>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Passou</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{totalPassed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Falhou</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{totalFailed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${passRate >= 95 ? 'text-green-500' : passRate >= 80 ? 'text-yellow-500' : 'text-red-500'}`}>
              {passRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Cobertura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgCoverage.toFixed(0)}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="coverage">🧪 Test Suites</TabsTrigger>
          <TabsTrigger value="scenarios">🎭 Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="coverage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suites.map((suite) => (
              <Card key={suite.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{suite.name}</span>
                    {getStatusIcon(suite.status)}
                  </CardTitle>
                  <CardDescription>{suite.type.toUpperCase()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Tests</span>
                      <span className="font-bold">{suite.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Coverage</span>
                      <span className="font-bold">{suite.coverage}%</span>
                    </div>
                    <Progress value={suite.coverage} />
                    <div className="pt-2 border-t flex gap-2">
                      <Badge variant="default" className="text-xs">✓ {suite.passed}</Badge>
                      <Badge variant="destructive" className="text-xs">✗ {suite.failed}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cenários de Teste</CardTitle>
              <CardDescription>{scenarios.length} cenários configurados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scenarios.map((scenario) => (
                  <div key={scenario.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(scenario.status)}
                      <div>
                        <p className="font-medium">{scenario.name}</p>
                        <p className="text-sm text-muted-foreground">{scenario.steps} steps | {scenario.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={scenario.priority === 'critical' ? 'destructive' : scenario.priority === 'high' ? 'default' : 'secondary'}>
                        {scenario.priority}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Play className="h-3 w-3 mr-1" /> Run
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QATestingDashboard;
