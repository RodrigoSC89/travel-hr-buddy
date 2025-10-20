/**
 * FileIndexer Component
 * Responsável por catalogar e registrar documentos (PDF, DOCX, TXT)
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileUp, List, Trash2, FileText } from "lucide-react";
import { VaultStorage } from "../services/vaultStorage";
import { VaultDocument } from "../types";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface FileIndexerProps {
  onVoltar?: () => void;
}

export default function FileIndexer({ onVoltar }: FileIndexerProps) {
  const [documentos, setDocumentos] = useState<VaultDocument[]>(
    VaultStorage.carregarIndice()
  );
  const [caminhoArquivo, setCaminhoArquivo] = useState("");
  const [nomeArquivo, setNomeArquivo] = useState("");

  const listarDocumentos = () => {
    const docs = VaultStorage.carregarIndice();
    setDocumentos(docs);
  };

  const indexarDocumento = () => {
    if (!nomeArquivo.trim()) {
      toast.error("❌ Por favor, forneça um nome para o documento");
      return;
    }

    const novoDocumento: VaultDocument = {
      id: crypto.randomUUID(),
      nome: nomeArquivo.trim(),
      caminho: caminhoArquivo.trim() || `/vault/${nomeArquivo}`,
      tipo: nomeArquivo.split(".").pop()?.toUpperCase() || "UNKNOWN",
      dataIndexacao: new Date().toISOString(),
    };

    try {
      VaultStorage.adicionarDocumento(novoDocumento);
      logger.info(`Documento indexado: ${novoDocumento.nome}`);
      toast.success(`✅ Documento '${novoDocumento.nome}' indexado com sucesso!`);
      
      setCaminhoArquivo("");
      setNomeArquivo("");
      listarDocumentos();
    } catch (error) {
      logger.error("Erro ao indexar documento", error);
      toast.error("❌ Erro ao indexar documento");
    }
  };

  const removerDocumento = (id: string, nome: string) => {
    try {
      VaultStorage.removerDocumento(id);
      toast.success(`🗑️ Documento '${nome}' removido`);
      listarDocumentos();
    } catch (error) {
      logger.error("Erro ao remover documento", error);
      toast.error("❌ Erro ao remover documento");
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            📂 Indexador de Documentos
          </h2>
          <p className="text-muted-foreground mt-1">
            Adicione e gerencie documentos técnicos no Vault
          </p>
        </div>
        {onVoltar && (
          <Button variant="outline" onClick={onVoltar}>
            ⏹ Voltar
          </Button>
        )}
      </div>

      {/* Add Document Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            Adicionar Novo Documento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Documento *</label>
            <Input
              placeholder="Ex: Manual_FMEA_2024.pdf"
              value={nomeArquivo}
              onChange={(e) => setNomeArquivo(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && indexarDocumento()}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Caminho/URL (opcional)</label>
            <Input
              placeholder="Ex: /documentos/manuais/fmea.pdf"
              value={caminhoArquivo}
              onChange={(e) => setCaminhoArquivo(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && indexarDocumento()}
            />
          </div>
          <Button onClick={indexarDocumento} className="w-full">
            <FileUp className="mr-2 h-4 w-4" />
            Indexar Documento
          </Button>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Documentos Indexados ({documentos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum documento indexado ainda</p>
              <p className="text-sm">Adicione documentos usando o formulário acima</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {documentos.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-medium">{doc.nome}</span>
                        {doc.tipo && (
                          <Badge variant="secondary" className="text-xs">
                            {doc.tipo}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        📁 {doc.caminho}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        🕐 Indexado em: {formatarData(doc.dataIndexacao)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removerDocumento(doc.id, doc.nome)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
