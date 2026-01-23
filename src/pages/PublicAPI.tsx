/**
 * PUBLIC API PAGE - PHASE 2
 * Página de gerenciamento e documentação da API pública
 */

import { useState } from "react";
import type { FC } from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ApiKeyManagement } from "@/components/api/ApiKeyManagement";
import { ApiDocumentation } from "@/components/api/ApiDocumentation";
import { ApiTestConsole } from "@/components/api/ApiTestConsole";
import { Key, Book, Activity, Terminal } from "lucide-react";
import { toast } from "sonner";

const PublicAPI: React.FC = () => {
  const [testConsoleOpen, setTestConsoleOpen] = useState(false);
  
  return (
    <>
      <Helmet>
        <title>API Pública | Nautilus One</title>
        <meta name="description" content="Gerencie chaves de API e acesse a documentação para integrações externas" />
      </Helmet>
      
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">API Pública</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie integrações e acesse a documentação da API REST
            </p>
          </div>
          <Button onClick={() => setTestConsoleOpen(true)} className="gap-2">
            <Terminal className="h-4 w-4" />
            Console de Testes
          </Button>
        </div>

        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="keys" className="gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="docs" className="gap-2">
              <Book className="h-4 w-4" />
              Documentação
            </TabsTrigger>
            <TabsTrigger value="usage" className="gap-2">
              <Activity className="h-4 w-4" />
              Uso
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keys">
            <ApiKeyManagement />
          </TabsContent>

          <TabsContent value="docs">
            <ApiDocumentation />
          </TabsContent>

          <TabsContent value="usage">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="rounded-lg border bg-card p-6">
                <h4 className="text-sm font-medium text-muted-foreground">Chamadas Hoje</h4>
                <p className="text-3xl font-bold mt-2">1,247</p>
                <p className="text-xs text-success mt-1">+12% vs ontem</p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <h4 className="text-sm font-medium text-muted-foreground">Latência Média</h4>
                <p className="text-3xl font-bold mt-2">89ms</p>
                <p className="text-xs text-muted-foreground mt-1">P95: 156ms</p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <h4 className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</h4>
                <p className="text-3xl font-bold mt-2">99.8%</p>
                <p className="text-xs text-success mt-1">Excelente</p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Uso por Endpoint</h3>
                <Button variant="outline" size="sm" onClick={() => toast.success("Relatório exportado com sucesso")}>Exportar</Button>
              </div>
              <div className="space-y-3">
                {[{e: '/api/vessels', c: 523}, {e: '/api/crew', c: 412}, {e: '/api/documents', c: 312}].map(item => (
                  <div key={item.e} className="flex justify-between items-center">
                    <code className="text-sm">{item.e}</code>
                    <span className="font-medium">{item.c} chamadas</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <ApiTestConsole open={testConsoleOpen} onOpenChange={setTestConsoleOpen} />
      </div>
    </>
  );
};

export default PublicAPI;
