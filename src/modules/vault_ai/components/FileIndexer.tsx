/**
 * FileIndexer Component
 * Document cataloging interface for Vault AI
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FilePlus, FileText, Trash2, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { addDocument, getAllDocuments, removeDocument } from "../services/vaultStorage";
import type { VaultDocument } from "../types";

export function FileIndexer() {
  const [documents, setDocuments] = useState<VaultDocument[]>(getAllDocuments());
  const [caminho, setCaminho] = useState("");
  const [nome, setNome] = useState("");

  const handleAddDocument = () => {
    if (!caminho.trim() || !nome.trim()) {
      toast.error("Por favor, preencha o nome e o caminho do documento");
      return;
    }

    const result = addDocument({
      nome: nome.trim(),
      caminho: caminho.trim(),
      tipo: getFileExtension(caminho),
    });

    if (result) {
      setDocuments(getAllDocuments());
      setCaminho("");
      setNome("");
      toast.success(`Documento '${result.nome}' indexado com sucesso`);
    } else {
      toast.error("Erro ao indexar documento. Pode já existir no vault.");
    }
  };

  const handleRemoveDocument = (id: string, nome: string) => {
    if (removeDocument(id)) {
      setDocuments(getAllDocuments());
      toast.success(`Documento '${nome}' removido com sucesso`);
    } else {
      toast.error("Erro ao remover documento");
    }
  };

  const getFileExtension = (path: string): string => {
    const ext = path.split('.').pop()?.toUpperCase();
    return ext || "UNKNOWN";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilePlus className="h-5 w-5" />
            Adicionar Documento
          </CardTitle>
          <CardDescription>
            Indexe novos documentos técnicos no Vault
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Documento</label>
            <Input
              placeholder="Ex: Manual FMEA Rev 3.2"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddDocument()}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Caminho / URL</label>
            <Input
              placeholder="Ex: /docs/technical/fmea-manual-v3.2.pdf"
              value={caminho}
              onChange={(e) => setCaminho(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddDocument()}
            />
          </div>
          <Button onClick={handleAddDocument} className="w-full">
            <FilePlus className="h-4 w-4 mr-2" />
            Indexar Documento
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Documentos Indexados ({documents.length})
          </CardTitle>
          <CardDescription>
            Lista de documentos no Vault Técnico
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum documento indexado ainda</p>
              <p className="text-sm">Adicione documentos técnicos acima</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {documents.map((doc) => (
                  <Card key={doc.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="font-medium">{doc.nome}</span>
                          {doc.tipo && (
                            <Badge variant="outline" className="text-xs">
                              {doc.tipo}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {doc.caminho}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Indexado em: {new Date(doc.dataIndexacao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDocument(doc.id, doc.nome)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
