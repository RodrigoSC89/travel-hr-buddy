import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileCheck, TrendingUp, FolderOpen } from "lucide-react";
import AuditSimulator from "@/components/audit/AuditSimulator";
import PerformanceDashboard from "@/components/audit/PerformanceDashboard";
import EvidenceManager from "@/components/audit/EvidenceManager";

export default function AuditSystemPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Sistema de Auditoria e Conformidade</h1>
              <p className="text-gray-600 mt-1">
                Simulação de auditorias, performance técnica e gestão de evidências
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="simulator" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="simulator" className="flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              Simulação de Auditoria
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance por Embarcação
            </TabsTrigger>
            <TabsTrigger value="evidence" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Evidências
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simulator" className="mt-6">
            <AuditSimulator />
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <PerformanceDashboard />
          </TabsContent>

          <TabsContent value="evidence" className="mt-6">
            <EvidenceManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
