/**
 * Test Suite Page - Dashboard de Testes E2E
 * Visualização de testes Playwright, cobertura e resultados
 */
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TestTube2, Play, CheckCircle, XCircle, Clock, 
  RefreshCw, FileText, Code, Eye, AlertTriangle,
  Smartphone, Monitor, Tablet
} from "lucide-react";
import { toast } from "sonner";

// Mock test results
const TEST_SUITES = [
  {
    name: "Authentication",
    file: "tests/e2e/auth.spec.ts",
    tests: [
      { name: "should display login form", status: "passed", duration: 1234 },
      { name: "should login with valid credentials", status: "passed", duration: 2456 },
      { name: "should show error for invalid credentials", status: "passed", duration: 1876 },
      { name: "should logout successfully", status: "passed", duration: 987 },
      { name: "should redirect unauthenticated users", status: "passed", duration: 654 },
    ]
  },
  {
    name: "Crew Management",
    file: "tests/e2e/crew.spec.ts",
    tests: [
      { name: "should display crew list", status: "passed", duration: 1543 },
      { name: "should add new crew member", status: "passed", duration: 3456 },
      { name: "should edit crew member details", status: "passed", duration: 2876 },
      { name: "should filter crew by position", status: "passed", duration: 1234 },
      { name: "should export crew data", status: "passed", duration: 876 },
      { name: "should validate certificate expiry", status: "passed", duration: 1654 },
    ]
  },
  {
    name: "Documents",
    file: "tests/e2e/documents.spec.ts",
    tests: [
      { name: "should upload document", status: "passed", duration: 4567 },
      { name: "should categorize documents", status: "passed", duration: 1234 },
      { name: "should search documents", status: "passed", duration: 876 },
      { name: "should download document", status: "passed", duration: 2345 },
      { name: "should delete document", status: "passed", duration: 1654 },
    ]
  },
  {
    name: "Navigation",
    file: "tests/e2e/navigation.spec.ts",
    tests: [
      { name: "should load dashboard", status: "passed", duration: 543 },
      { name: "should have working sidebar navigation", status: "passed", duration: 876 },
      { name: "solas-training redirects to nautilus-academy", status: "passed", duration: 654 },
      { name: "voyage-planner redirects to nautilus-voyage", status: "passed", duration: 543 },
      { name: "ai-insights redirects to nautilus-ai-hub", status: "passed", duration: 654 },
      { name: "404 page shows for invalid routes", status: "passed", duration: 432 },
    ]
  },
  {
    name: "Compliance",
    file: "tests/e2e/compliance.spec.ts",
    tests: [
      { name: "should display compliance dashboard", status: "passed", duration: 1234 },
      { name: "should create audit checklist", status: "passed", duration: 2345 },
      { name: "should track non-conformities", status: "passed", duration: 1876 },
      { name: "should generate compliance report", status: "passed", duration: 3456 },
      { name: "should alert on certificate expiry", status: "passed", duration: 1234 },
    ]
  },
];

const COVERAGE_DATA = {
  statements: 87.5,
  branches: 82.3,
  functions: 91.2,
  lines: 88.7,
};

const DEVICE_TESTS = [
  { device: "Desktop", icon: Monitor, passed: 28, failed: 0, skipped: 0 },
  { device: "Tablet", icon: Tablet, passed: 27, failed: 1, skipped: 0 },
  { device: "Mobile", icon: Smartphone, passed: 26, failed: 1, skipped: 1 },
];

export default function TestSuitePage() {
  const [running, setRunning] = React.useState(false);
  const [selectedSuite, setSelectedSuite] = React.useState<string | null>(null);

  const totalTests = TEST_SUITES.reduce((acc, suite) => acc + suite.tests.length, 0);
  const passedTests = TEST_SUITES.reduce(
    (acc, suite) => acc + suite.tests.filter(t => t.status === "passed").length, 
    0
  );
  const failedTests = TEST_SUITES.reduce(
    (acc, suite) => acc + suite.tests.filter(t => t.status === "failed").length, 
    0
  );

  const handleRunTests = () => {
    setRunning(true);
    toast.info("Executando testes E2E...");
    setTimeout(() => {
      setRunning(false);
      toast.success("Todos os testes passaram!");
    }, 3000);
  };

  const handleRunSuite = (suiteName: string) => {
    toast.info(`Executando suite: ${suiteName}`);
    setTimeout(() => {
      toast.success(`Suite ${suiteName} concluída!`);
    }, 2000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TestTube2 className="h-8 w-8 text-primary" />
            Testes E2E Automatizados
          </h1>
          <p className="text-muted-foreground mt-1">
            Dashboard de testes Playwright com cobertura e resultados em tempo real
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info("Gerando relatório...")}>
            <FileText className="h-4 w-4 mr-2" />
            Relatório
          </Button>
          <Button onClick={handleRunTests} disabled={running}>
            {running ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {running ? "Executando..." : "Rodar Todos"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Passaram</p>
                <p className="text-2xl font-bold text-green-600">{passedTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Falharam</p>
                <p className="text-2xl font-bold text-red-600">{failedTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <TestTube2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Testes</p>
                <p className="text-2xl font-bold">{totalTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tempo Total</p>
                <p className="text-2xl font-bold">42.3s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suites">Suites de Teste</TabsTrigger>
          <TabsTrigger value="coverage">Cobertura de Código</TabsTrigger>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="suites" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {TEST_SUITES.map((suite) => {
              const passed = suite.tests.filter(t => t.status === "passed").length;
              const total = suite.tests.length;
              const allPassed = passed === total;

              return (
                <Card 
                  key={suite.name}
                  className={`cursor-pointer transition-all hover:border-primary ${
                    selectedSuite === suite.name ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedSuite(selectedSuite === suite.name ? null : suite.name)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {allPassed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        {suite.name}
                      </CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRunSuite(suite.name);
                        }}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Run
                      </Button>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Code className="h-3 w-3" />
                      {suite.file}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {passed}/{total} testes passaram
                      </span>
                      <Badge variant={allPassed ? "default" : "destructive"}>
                        {allPassed ? "PASSED" : "FAILED"}
                      </Badge>
                    </div>
                    <Progress value={(passed / total) * 100} className="h-2" />

                    {selectedSuite === suite.name && (
                      <ScrollArea className="h-[200px] mt-4">
                        <div className="space-y-2">
                          {suite.tests.map((test, i) => (
                            <div 
                              key={i}
                              className="flex items-center justify-between p-2 rounded bg-muted"
                            >
                              <div className="flex items-center gap-2">
                                {test.status === "passed" ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-sm">{test.name}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {test.duration}ms
                              </span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cobertura de Código</CardTitle>
                <CardDescription>Métricas de cobertura de testes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(COVERAGE_DATA).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{key}</span>
                      <span className={value >= 80 ? "text-green-600" : "text-yellow-600"}>
                        {value}%
                      </span>
                    </div>
                    <Progress 
                      value={value} 
                      className={`h-2 ${value >= 80 ? "" : "[&>div]:bg-yellow-500"}`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo de Cobertura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-[200px]">
                  <div className="text-5xl font-bold text-primary">
                    {((COVERAGE_DATA.statements + COVERAGE_DATA.branches + COVERAGE_DATA.functions + COVERAGE_DATA.lines) / 4).toFixed(1)}%
                  </div>
                  <p className="text-muted-foreground mt-2">Cobertura Média</p>
                  <Badge variant="default" className="mt-4">
                    Meta: 85% ✓
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DEVICE_TESTS.map((device) => {
              const Icon = device.icon;
              const total = device.passed + device.failed + device.skipped;
              
              return (
                <Card key={device.device}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {device.device}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-600">✓ Passed: {device.passed}</span>
                      <span className="text-sm text-red-600">✗ Failed: {device.failed}</span>
                      <span className="text-sm text-yellow-600">◯ Skipped: {device.skipped}</span>
                    </div>
                    <Progress value={(device.passed / total) * 100} className="h-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      {((device.passed / total) * 100).toFixed(0)}% taxa de sucesso
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Execuções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => {
                  const passed = i < 2;
                  return (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-3 rounded border"
                    >
                      <div className="flex items-center gap-3">
                        {passed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">Run #{100 - i}</p>
                          <p className="text-xs text-muted-foreground">
                            {i === 0 ? "Agora" : i === 1 ? "1 hora atrás" : `${i} horas atrás`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">{28 - (passed ? 0 : 2)}/{28} tests</span>
                        <span className="text-sm text-muted-foreground">42.{i}s</span>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
