/**
 * FileIndexer Component
 * Document cataloging and management interface
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { addDocument, getAllDocuments, removeDocument, getStatistics } from "../services/vaultStorage";
import type { VaultDocument, VaultStatistics } from "../types";

interface FileIndexerProps {
  onBack: () => void;
}

export default function FileIndexer({ onBack }: FileIndexerProps) {
  const [nome, setNome] = useState("");
  const [caminho, setCaminho] = useState("");
  const [tipo, setTipo] = useState("");
  const [tags, setTags] = useState("");
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [statistics, setStatistics] = useState<VaultStatistics | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    const docs = getAllDocuments();
    const stats = getStatistics();
    setDocuments(docs);
    setStatistics(stats);
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || !caminho.trim()) {
      toast.error("Nome e caminho são obrigatórios");
      return;
    }

    try {
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      addDocument(nome, caminho, tipo || undefined, tagArray.length > 0 ? tagArray : undefined);

      toast.success(`✅ Documento '${nome}' indexado com sucesso`);

      // Clear form
      setNome("");
      setCaminho("");
      setTipo("");
      setTags("");

      loadDocuments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao indexar documento");
    }
  };

  const handleRemoveDocument = (id: string, docNome: string) => {
    if (removeDocument(id)) {
      toast.success(`Documento '${docNome}' removido`);
      loadDocuments();
    } else {
      toast.error("Erro ao remover documento");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Add Document Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Indexar Novo Documento
            </CardTitle>
            <CardDescription>Adicionar documento técnico ao vault</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDocument} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Documento *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Manual ASOG v2.1"
                />
              </div>

              <div>
                <Label htmlFor="caminho">Caminho / URL *</Label>
                <Input
                  id="caminho"
                  value={caminho}
                  onChange={(e) => setCaminho(e.target.value)}
                  placeholder="Ex: /docs/asog/manual_v2.1.pdf"
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo (opcional)</Label>
                <Input
                  id="tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  placeholder="Ex: PDF, Word, etc. (auto-detectado)"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Ex: ASOG, manual, operação"
                />
              </div>

              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Indexar Documento
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Estatísticas do Vault</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total de Documentos</p>
              <p className="text-2xl font-bold">{statistics?.totalDocuments || 0}</p>
            </div>

            {statistics && statistics.totalDocuments > 0 && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Documentos por Tipo</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statistics.documentsByType).map(([type, count]) => (
                      <Badge key={type} variant="secondary">
                        {type}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>

                {statistics.mostRecentDocument && (
                  <div>
                    <p className="text-sm text-muted-foreground">Documento Mais Recente</p>
                    <p className="text-sm font-medium">{statistics.mostRecentDocument.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(statistics.mostRecentDocument.dataIndexacao).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            📘 Documentos Indexados ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum documento indexado. Adicione seu primeiro documento acima.
            </p>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{doc.nome}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{doc.caminho}</p>
                        <div className="flex gap-2 mt-2">
                          {doc.tipo && <Badge variant="outline">{doc.tipo}</Badge>}
                          {doc.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Indexado em: {new Date(doc.dataIndexacao).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDocument(doc.id, doc.nome)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
