/**
 * System Modules Grid - Lazy Loaded Component
 * Displays all system modules in a tabbed interface
 */
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { systemModules } from "@/lib/data/system-modules";

const getStatusColor = (status: string) => {
  switch (status) {
    case "operational": return "bg-green-500";
    case "degraded": return "bg-yellow-500";
    case "offline": return "bg-red-500";
    default: return "bg-gray-500";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "operational":
      return <Badge className="gap-1"><CheckCircle className="h-3 w-3" />Operacional</Badge>;
    case "degraded":
      return <Badge variant="secondary" className="gap-1"><AlertTriangle className="h-3 w-3" />Degradado</Badge>;
    case "offline":
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Offline</Badge>;
    default:
      return <Badge variant="outline">Desconhecido</Badge>;
  }
};

const ModuleCard = ({ module }: { module: typeof systemModules[0] }) => {
  const Icon = module.icon;
  
  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{module.name}</CardTitle>
              <CardDescription className="text-xs">{module.id}</CardDescription>
            </div>
          </div>
          {getStatusBadge(module.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{module.description}</p>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Uptime</span>
            <span className="text-xs font-bold">{module.uptime}%</span>
          </div>
          <Progress value={module.uptime} className="h-2" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Funcionalidades</p>
          <div className="flex flex-wrap gap-1">
            {module.features.map((feature, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          {Object.entries(module.metrics).map(([key, value]) => (
            <div key={key} className="text-center">
              <p className="text-xs text-muted-foreground capitalize">{key}</p>
              <p className="text-sm font-bold">{value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export function SystemModulesGrid() {
  return (
    <Tabs defaultValue="all" className="space-y-4">
      <TabsList>
        <TabsTrigger value="all">Todos os Módulos</TabsTrigger>
        <TabsTrigger value="ai">IA & Automação</TabsTrigger>
        <TabsTrigger value="interop">Interoperabilidade</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemModules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="ai" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemModules
            .filter(m => ["patch-221", "patch-223", "patch-227"].includes(m.id))
            .map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
        </div>
      </TabsContent>

      <TabsContent value="interop" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemModules
            .filter(m => ["patch-216", "patch-226"].includes(m.id))
            .map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
