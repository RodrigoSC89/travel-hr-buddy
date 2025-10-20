/**
 * VaultCore Component
 * Painel principal do Vault — integração dos módulos e interface de controle
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileUp, Search, BrainCircuit, Database, ArrowLeft } from "lucide-react";
import FileIndexer from "./FileIndexer";
import SemanticSearch from "./SemanticSearch";
import LLMInterface from "./LLMInterface";

type ViewType = "menu" | "indexer" | "search" | "llm";

export default function VaultCore() {
  const [currentView, setCurrentView] = useState<ViewType>("menu");

  const menuOptions = [
    {
      id: "indexer",
      titulo: "📂 Indexar novos documentos",
      descricao: "Catalogar e registrar documentos técnicos (PDF, DOCX, TXT)",
      icon: FileUp,
      color: "text-blue-500",
    },
    {
      id: "search",
      titulo: "🔎 Buscar documentos",
      descricao: "Busca semântica e contextual no vault de documentos",
      icon: Search,
      color: "text-green-500",
    },
    {
      id: "llm",
      titulo: "🧠 Consultar IA sobre documentos",
      descricao: "Assistente IA para interpretação de conteúdo técnico",
      icon: BrainCircuit,
      color: "text-purple-500",
    },
  ];

  const renderView = () => {
    switch (currentView) {
      case "indexer":
        return <FileIndexer onVoltar={() => setCurrentView("menu")} />;
      case "search":
        return <SemanticSearch onVoltar={() => setCurrentView("menu")} />;
      case "llm":
        return <LLMInterface onVoltar={() => setCurrentView("menu")} />;
      default:
        return renderMenu();
    }
  };

  const renderMenu = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Database className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            📚 Vault Técnico IA
          </h1>
          <p className="text-xl text-muted-foreground">Nautilus One</p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Repositório inteligente do sistema — documentos, manuais, relatórios
            e pareceres técnicos com leitura semântica, busca contextual e
            resposta via LLM embarcada
          </p>
        </div>

        {/* Menu Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {menuOptions.map((opcao, index) => {
            const Icon = opcao.icon;
            return (
              <motion.div
                key={opcao.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="h-full hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary">
                  <CardContent
                    className="p-6 flex flex-col items-center text-center space-y-4"
                    onClick={() => setCurrentView(opcao.id as ViewType)}
                  >
                    <div className={`p-4 rounded-full bg-primary/10 ${opcao.color}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{opcao.titulo}</h3>
                      <p className="text-sm text-muted-foreground">
                        {opcao.descricao}
                      </p>
                    </div>
                    <Button variant="outline" className="w-full">
                      Acessar
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info Cards */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">✨ Recursos Principais</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Indexação de documentos técnicos</li>
                <li>• Busca semântica inteligente</li>
                <li>• Análise de conteúdo via IA</li>
                <li>• Suporte a múltiplos formatos</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">📋 Documentos Suportados</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• ASOG (Aviation Safety Operations)</li>
                <li>• FMEA (Failure Mode Analysis)</li>
                <li>• Manuais Técnicos</li>
                <li>• IMCA, SGSO, MTS Standards</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        {currentView !== "menu" && (
          <Button
            variant="ghost"
            onClick={() => setCurrentView("menu")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Menu Principal
          </Button>
        )}
        {renderView()}
      </div>
    </div>
  );
}
