/**
 * VaultCore Component
 * Main dashboard with menu navigation for the Vault AI module
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Search, Brain, Database } from "lucide-react";
import FileIndexer from "./FileIndexer";
import SemanticSearch from "./SemanticSearch";
import LLMInterface from "./LLMInterface";

type MenuOption = "indexer" | "search" | "llm" | null;

export default function VaultCore() {
  const [activeMenu, setActiveMenu] = useState<MenuOption>(null);

  if (activeMenu === "indexer") {
    return <FileIndexer onBack={() => setActiveMenu(null)} />;
  }

  if (activeMenu === "search") {
    return <SemanticSearch onBack={() => setActiveMenu(null)} />;
  }

  if (activeMenu === "llm") {
    return <LLMInterface onBack={() => setActiveMenu(null)} />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            📚 Vault Técnico IA – Nautilus One
          </CardTitle>
          <CardDescription>
            Repositório inteligente de documentos técnicos com busca semântica e interpretação via IA
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveMenu("indexer")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                📂 Indexar Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Catalogar e registrar documentos técnicos no sistema
              </p>
              <Button className="mt-4 w-full" variant="outline">
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveMenu("search")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="h-5 w-5" />
                🔎 Buscar Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Busca semântica com correspondência fuzzy e ranking de relevância
              </p>
              <Button className="mt-4 w-full" variant="outline">
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveMenu("llm")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5" />
                🧠 Consultar IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Assistente IA para interpretação contextual de documentos técnicos
              </p>
              <Button className="mt-4 w-full" variant="outline">
                Acessar
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
