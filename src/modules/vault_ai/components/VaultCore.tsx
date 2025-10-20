/**
 * VaultCore Component
 * Main Vault panel - integration of modules and control interface
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Search,
  Brain,
  Upload,
  Trash2,
  Database,
  BookOpen,
} from "lucide-react";
import { FileIndexer } from "../services/fileIndexer";
import { SemanticSearch } from "../services/semanticSearch";
import { VaultLLM } from "../services/vaultLLM";
import { VaultDocument, SearchResult } from "../types";
import { logger } from "@/lib/logger";

export const VaultCore: React.FC = () => {
  const [indexer] = useState(() => new FileIndexer());
  const [llm] = useState(() => new VaultLLM());
  const [documentos, setDocumentos] = useState<VaultDocument[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [caminho, setCaminho] = useState("");
  const [termoBusca, setTermoBusca] = useState("");
  const [perguntaIA, setPerguntaIA] = useState("");
  const [respostaIA, setRespostaIA] = useState("");
  const [activeTab, setActiveTab] = useState("indexar");

  useEffect(() => {
    carregarDocumentos();
  }, [indexer]);

  const carregarDocumentos = () => {
    const docs = indexer.listar();
    setDocumentos(docs);
    logger.info("Documentos carregados", { total: docs.length });
  };

  const handleIndexar = () => {
    if (caminho.trim()) {
      const sucesso = indexer.indexar(caminho);
      if (sucesso) {
        setCaminho("");
        carregarDocumentos();
      }
    }
  };

  const handleBuscar = () => {
    if (termoBusca.trim()) {
      const searcher = new SemanticSearch(documentos);
      const results = searcher.buscar(termoBusca);
      setSearchResults(results);
    }
  };

  const handleConsultarIA = () => {
    if (perguntaIA.trim()) {
      const resultado = llm.chat(perguntaIA);
      setRespostaIA(resultado.resposta);
    }
  };

  const handleRemover = (id: string) => {
    indexer.remover(id);
    carregarDocumentos();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-2xl">
            <Database className="h-8 w-8" />
            📚 Vault Técnico IA – Nautilus One
          </CardTitle>
          <CardDescription className="text-blue-100">
            Gerencia e interpreta documentos técnicos embarcados com IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-white/20 text-white">
              {documentos.length} Documentos Indexados
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">
              {llm.getTopicos().length} Tópicos IA
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="indexar">
                <Upload className="h-4 w-4 mr-2" />
                Indexar
              </TabsTrigger>
              <TabsTrigger value="buscar">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </TabsTrigger>
              <TabsTrigger value="ia">
                <Brain className="h-4 w-4 mr-2" />
                Consultar IA
              </TabsTrigger>
            </TabsList>

            {/* Indexar Tab */}
            <TabsContent value="indexar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Indexar Novos Documentos
                  </CardTitle>
                  <CardDescription>
                    Adicione documentos técnicos (PDF, DOCX, TXT) ao repositório
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Caminho ou nome do documento..."
                      value={caminho}
                      onChange={(e) => setCaminho(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleIndexar()}
                    />
                    <Button onClick={handleIndexar}>
                      <Upload className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Documentos Indexados ({documentos.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        {documentos.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">
                            Nenhum documento indexado ainda
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {documentos.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">{doc.nome}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {doc.caminho}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {doc.tipo && (
                                    <Badge variant="outline">{doc.tipo}</Badge>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemover(doc.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Buscar Tab */}
            <TabsContent value="buscar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Busca Semântica
                  </CardTitle>
                  <CardDescription>
                    Encontre documentos por palavras-chave ou termos técnicos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite termo técnico ou código..."
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleBuscar()}
                    />
                    <Button onClick={handleBuscar}>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </Button>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Resultados da Busca
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        {searchResults.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">
                            {termoBusca
                              ? "Nenhum resultado encontrado"
                              : "Digite um termo para buscar"}
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {searchResults.map((result, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-secondary rounded-lg"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      {result.documento.nome}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {result.documento.caminho}
                                    </div>
                                    {result.destaque && (
                                      <div className="text-xs text-blue-600 mt-1">
                                        {result.destaque}
                                      </div>
                                    )}
                                  </div>
                                  <Badge variant="outline">
                                    {(result.score * 100).toFixed(0)}% match
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* IA Tab */}
            <TabsContent value="ia" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Consultar IA sobre Documentos
                  </CardTitle>
                  <CardDescription>
                    Faça perguntas sobre conteúdo técnico e normas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Faça uma pergunta sobre documentação técnica..."
                      value={perguntaIA}
                      onChange={(e) => setPerguntaIA(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleConsultarIA()
                      }
                    />
                    <Button onClick={handleConsultarIA}>
                      <Brain className="h-4 w-4 mr-2" />
                      Consultar
                    </Button>
                  </div>

                  {respostaIA && (
                    <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Resposta da IA
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-line">
                          {respostaIA}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Tópicos Disponíveis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {llm.getTopicos().map((topico) => (
                          <Badge
                            key={topico}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => setPerguntaIA(topico)}
                          >
                            {topico.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
