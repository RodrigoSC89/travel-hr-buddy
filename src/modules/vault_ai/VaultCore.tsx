/**
 * VaultCore Component
 * Painel principal do Vault – integração dos módulos e interface de controle
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Brain, Database } from "lucide-react";
import { FileIndexer } from "./FileIndexer";
import { SemanticSearch } from "./SemanticSearch";
import { VaultLLM } from "./VaultLLM";

export const VaultCore: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Database className="h-8 w-8" />
            📚 Nautilus Vault Técnico IA
          </CardTitle>
          <CardDescription className="text-white/90">
            O repositório inteligente do sistema — documentos, manuais, relatórios e pareceres técnicos com leitura semântica, busca contextual e resposta via LLM embarcada.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <FileText className="h-5 w-5" />
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {localStorage.getItem("nautilus_vault_index") 
                ? JSON.parse(localStorage.getItem("nautilus_vault_index") || "[]").length 
                : 0}
            </div>
            <p className="text-sm text-blue-100">Documentos Indexados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Search className="h-5 w-5" />
              Busca Semântica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Ativa</div>
            <p className="text-sm text-green-100">Sistema de Busca</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Brain className="h-5 w-5" />
              IA Embarcada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">GPT-4</div>
            <p className="text-sm text-purple-100">Modelo Ativo</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Módulos do Vault Técnico IA</CardTitle>
          <CardDescription>
            Gerencie e interprete documentos técnicos embarcados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">
                <Database className="h-4 w-4 mr-2" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="indexer">
                <FileText className="h-4 w-4 mr-2" />
                Indexar
              </TabsTrigger>
              <TabsTrigger value="search">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Brain className="h-4 w-4 mr-2" />
                IA
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Indexador de Documentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Catalogar e registrar documentos técnicos (PDF, DOCX, TXT)
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950 rounded">
                        <span className="text-sm">Suporte a PDF</span>
                        <Badge variant="default">Ativo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950 rounded">
                        <span className="text-sm">Suporte a DOCX</span>
                        <Badge variant="default">Ativo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950 rounded">
                        <span className="text-sm">Suporte a TXT</span>
                        <Badge variant="default">Ativo</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Search className="h-5 w-5 text-green-600" />
                      Busca Semântica
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Busca contextual com correspondência semântica
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded">
                        <span className="text-sm">Algoritmo Fuzzy</span>
                        <Badge variant="default" className="bg-green-600">Ativo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded">
                        <span className="text-sm">Base Vetorizada</span>
                        <Badge variant="default" className="bg-green-600">Ativo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded">
                        <span className="text-sm">Ranking de Relevância</span>
                        <Badge variant="default" className="bg-green-600">Ativo</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      LLM Interface
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Interface de IA embarcada para interpretação de conteúdo técnico
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-950 rounded">
                        <span className="text-sm">ASOG</span>
                        <Badge variant="secondary">Disponível</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-950 rounded">
                        <span className="text-sm">FMEA</span>
                        <Badge variant="secondary">Disponível</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-950 rounded">
                        <span className="text-sm">Manuais</span>
                        <Badge variant="secondary">Disponível</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-950 rounded">
                        <span className="text-sm">DP Logs</span>
                        <Badge variant="secondary">Disponível</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-950 rounded">
                        <span className="text-sm">SGSO</span>
                        <Badge variant="secondary">Disponível</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-950 rounded">
                        <span className="text-sm">Relatórios</span>
                        <Badge variant="secondary">Disponível</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="indexer" className="mt-4">
              <FileIndexer />
            </TabsContent>

            <TabsContent value="search" className="mt-4">
              <SemanticSearch />
            </TabsContent>

            <TabsContent value="ai" className="mt-4">
              <VaultLLM />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
