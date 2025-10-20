/**
 * VaultCore Component
 * Main dashboard with menu interface for Vault AI
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, BrainCircuit, Database, ArrowLeft } from "lucide-react";
import { FileIndexer } from "./FileIndexer";
import { SemanticSearch } from "./SemanticSearch";
import { LLMInterface } from "./LLMInterface";
import { getVaultStats } from "../services/vaultStorage";
import type { MenuOption } from "../types";

export function VaultCore() {
  const [activeMenu, setActiveMenu] = useState<MenuOption>(null);
  const stats = getVaultStats();

  if (activeMenu === "indexer") {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setActiveMenu(null)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Menu
        </Button>
        <FileIndexer />
      </div>
    );
  }

  if (activeMenu === "search") {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setActiveMenu(null)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Menu
        </Button>
        <SemanticSearch />
      </div>
    );
  }

  if (activeMenu === "llm") {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setActiveMenu(null)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Menu
        </Button>
        <LLMInterface />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Database className="h-6 w-6" />
                Vault Técnico IA – Nautilus One
              </CardTitle>
              <CardDescription className="mt-2">
                Repositório inteligente de documentos técnicos com busca semântica e interpretação via IA
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {stats.totalDocuments} docs
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <p>Última atualização: {new Date(stats.lastUpdated).toLocaleString('pt-BR')}</p>
            <p>Versão: {stats.version}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card 
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveMenu("indexer")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Indexar Documentos
            </CardTitle>
            <CardDescription>
              Cadastre e gerencie documentos técnicos no vault
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Acessar Indexador
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveMenu("search")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-green-500" />
              Buscar Documentos
            </CardTitle>
            <CardDescription>
              Pesquisa semântica com correspondência contextual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Iniciar Busca
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setActiveMenu("llm")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-500" />
              Consultar IA
            </CardTitle>
            <CardDescription>
              Interpretação inteligente de conteúdo técnico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Chat com IA
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contextos Técnicos Suportados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">ASOG</Badge>
              <span className="text-sm text-muted-foreground">Diretrizes de Operação</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">FMEA</Badge>
              <span className="text-sm text-muted-foreground">Análise de Falhas</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">IMCA</Badge>
              <span className="text-sm text-muted-foreground">Padrões Marítimos</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">SGSO</Badge>
              <span className="text-sm text-muted-foreground">Gestão de Segurança</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">MTS</Badge>
              <span className="text-sm text-muted-foreground">Manuais Técnicos</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
