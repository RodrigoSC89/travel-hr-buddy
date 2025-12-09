/**
 * PUBLIC API PAGE - PHASE 2
 * Página de gerenciamento e documentação da API pública
 */

import React from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiKeyManagement } from "@/components/api/ApiKeyManagement";
import { ApiDocumentation } from "@/components/api/ApiDocumentation";
import { Key, Book, Activity } from "lucide-react";

const PublicAPI: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>API Pública | Nautilus One</title>
        <meta name="description" content="Gerencie chaves de API e acesse a documentação para integrações externas" />
      </Helmet>
      
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">API Pública</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie integrações e acesse a documentação da API REST
          </p>
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
            <div className="grid grid-cols-1 gap-6">
              {/* Usage analytics placeholder */}
              <div className="rounded-lg border bg-card p-8 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Analytics de Uso</h3>
                <p className="text-muted-foreground mt-2">
                  Estatísticas detalhadas de uso da API em breve
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default PublicAPI;
