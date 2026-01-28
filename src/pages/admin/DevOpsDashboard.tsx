/**
 * DevOps Dashboard - CI/CD & Multi-Environment
 * Nauti One v4.0 - Simplified Version
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  GitBranch, Play, CheckCircle, XCircle, Clock, Server, 
  RefreshCw, Rocket, Settings, Activity
} from "lucide-react";
import { toast } from "sonner";

interface PipelineStage {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  duration?: number;
}

interface Environment {
  name: string;
  url: string;
  status: 'healthy' | 'degraded' | 'down';
  version: string;
  lastDeploy: string;
}

const DevOpsDashboard = () => {
  const [activeTab, setActiveTab] = useState("pipeline");
  const [isRunning, setIsRunning] = useState(false);

  const stages: PipelineStage[] = [
    { name: "Checkout", status: "success", duration: 5 },
    { name: "Install", status: "success", duration: 45 },
    { name: "Lint & TypeCheck", status: "success", duration: 30 },
    { name: "Unit Tests", status: "success", duration: 120 },
    { name: "Build", status: "success", duration: 90 },
    { name: "Deploy", status: "pending" }
  ];

  const environments: Environment[] = [
    { name: "Development", url: "https://dev.nautione.com.br", status: "healthy", version: "4.0.1-dev", lastDeploy: "2026-01-28" },
    { name: "Staging", url: "https://staging.nautione.com.br", status: "healthy", version: "4.0.0", lastDeploy: "2026-01-27" },
    { name: "Production", url: "https://nautione.com.br", status: "healthy", version: "4.0.0", lastDeploy: "2026-01-25" }
  ];

  const handleRunPipeline = async () => {
    setIsRunning(true);
    toast.info("Iniciando pipeline CI/CD...");
    await new Promise(r => setTimeout(r, 2000));
    toast.success("Pipeline executado com sucesso!");
    setIsRunning(false);
  };

  const handleDeploy = (envName: string) => {
    toast.info(`Iniciando deploy para ${envName}...`);
    setTimeout(() => toast.success(`Deploy para ${envName} concluído!`), 1500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
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
            <GitBranch className="h-8 w-8 text-primary" />
            DevOps Dashboard
          </h1>
          <p className="text-muted-foreground">CI/CD Pipeline & Multi-Environment</p>
        </div>
        <Button onClick={handleRunPipeline} disabled={isRunning}>
          {isRunning ? (
            <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Executando...</>
          ) : (
            <><Play className="h-4 w-4 mr-2" /> Run Pipeline</>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">98.5%</div>
            <Progress value={98.5} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.2m</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Deploys Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Environments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{environments.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pipeline">🔄 CI/CD Pipeline</TabsTrigger>
          <TabsTrigger value="environments">🌐 Environments</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Stages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stages.map((stage, index) => (
                  <div key={stage.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Stage {index + 1}</span>
                      {getStatusIcon(stage.status)}
                    </div>
                    <p className="font-medium">{stage.name}</p>
                    {stage.duration && (
                      <p className="text-sm text-muted-foreground">{stage.duration}s</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {environments.map((env) => (
              <Card key={env.name}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      {env.name}
                    </span>
                    <Badge variant={env.status === 'healthy' ? 'default' : 'destructive'}>
                      {env.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{env.url}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Version</p>
                      <p className="font-medium">{env.version}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Deploy</p>
                      <p className="font-medium">{env.lastDeploy}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleDeploy(env.name)} className="flex-1">
                      <Rocket className="h-4 w-4 mr-1" /> Deploy
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DevOpsDashboard;
