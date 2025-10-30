/**
 * System Architecture Section - Lazy Loaded Component
 */
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Globe, Brain, Network, Shield } from "lucide-react";

export function SystemArchitecture() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Arquitetura do Sistema
        </CardTitle>
        <CardDescription>
          Visão geral da arquitetura distribuída e módulos integrados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Inteligência Artificial
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• Cognitive Clone Core</li>
              <li>• Edge AI Operations</li>
              <li>• Decision Simulation</li>
              <li>• Predictive Analytics</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Network className="h-4 w-4 text-primary" />
              Conectividade
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• Context Mesh Network</li>
              <li>• Real-time Sync</li>
              <li>• Mirror Instances</li>
              <li>• Offline Capability</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Segurança
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• Blockchain Integration</li>
              <li>• Certificate Management</li>
              <li>• Access Control</li>
              <li>• Audit Trail</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
