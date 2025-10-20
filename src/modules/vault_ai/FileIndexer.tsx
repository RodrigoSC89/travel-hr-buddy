/**
 * FileIndexer Component
 * Responsável por catalogar e registrar documentos (PDF, DOCX, TXT)
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, List } from "lucide-react";
import { logger } from "@/lib/logger";
import { DocumentIndex } from "./types";

const STORAGE_KEY = "nautilus_vault_index";

export const FileIndexer: React.FC = () => {
  const [index, setIndex] = useState<DocumentIndex[]>([]);
  const [caminho, setCaminho] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Carregar índice do localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setIndex(JSON.parse(stored));
      } catch (error) {
        logger.error("Erro ao carregar índice de documentos", error);
      }
    }
  }, []);

  const salvar = (newIndex: DocumentIndex[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newIndex));
    setIndex(newIndex);
  };

  const indexar = () => {
    if (!caminho.trim()) {
      logger.warn("Caminho do arquivo não fornecido");
      return;
    }

    const nome = caminho.split("/").pop() || caminho;
    const extensao = nome.split(".").pop()?.toUpperCase() || "outros";
    const tipo = ["PDF", "DOCX", "TXT"].includes(extensao) 
      ? (extensao as "PDF" | "DOCX" | "TXT") 
      : "outros";

    const registro: DocumentIndex = {
      id: `doc_${Date.now()}`,
      nome,
      caminho,
      tipo,
      dataIndexacao: new Date().toISOString(),
    };

    const newIndex = [...index, registro];
    salvar(newIndex);
    logger.info(`Documento indexado: ${nome}`);
    
    setCaminho("");
    setShowAddForm(false);
  };

  const removerDocumento = (id: string) => {
    const newIndex = index.filter(doc => doc.id !== id);
    salvar(newIndex);
    logger.info("Documento removido do índice");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            📂 Indexador de Documentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              variant={showAddForm ? "secondary" : "default"}
            >
              <Plus className="h-4 w-4 mr-2" />
              {showAddForm ? "Cancelar" : "Adicionar Documento"}
            </Button>
          </div>

          {showAddForm && (
            <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Input
                placeholder="Caminho do arquivo (ex: /docs/manual-tecnico.pdf)"
                value={caminho}
                onChange={(e) => setCaminho(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && indexar()}
              />
              <Button onClick={indexar} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Indexar Documento
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <List className="h-4 w-4" />
              <h3 className="font-semibold">📋 Documentos Indexados ({index.length})</h3>
            </div>
            
            {index.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhum documento indexado ainda
              </p>
            ) : (
              <div className="space-y-2">
                {index.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{doc.nome}</span>
                        <Badge variant="secondary">{doc.tipo}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {doc.caminho}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Indexado em: {new Date(doc.dataIndexacao).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removerDocumento(doc.id)}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
