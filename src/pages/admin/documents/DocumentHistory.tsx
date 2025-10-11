"use client";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Loader2, ArrowLeft, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DocumentVersion {
  id: string;
  version_number: number;
  title: string;
  content: string;
  created_at: string;
  edited_by: string | null;
}

interface Document {
  title: string;
  content: string;
}

export default function DocumentHistoryPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState<Document | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadDocumentAndVersions();
  }, [id]);

  async function loadDocumentAndVersions() {
    try {
      // Load main document
      const { data: docData } = await supabase
        .from("ai_generated_documents")
        .select("title, content")
        .eq("id", id)
        .single();

      if (docData) {
        setDoc(docData);
      }

      // Load all versions
      const { data: versionsData } = await supabase
        .from("document_versions")
        .select("id, version_number, title, content, created_at, edited_by")
        .eq("document_id", id)
        .order("version_number", { ascending: false });

      if (versionsData) {
        setVersions(versionsData);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading document history:", error);
      setLoading(false);
    }
  }

  function handlePreview(version: DocumentVersion) {
    setSelectedVersion(version);
    setShowPreview(true);
  }

  if (loading) {
    return (
      <div className="p-8 text-muted-foreground flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando histórico...
      </div>
    );
  }

  if (!doc) {
    return <div className="p-8 text-destructive">Documento não encontrado.</div>;
  }

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center gap-4">
        <Link to={`/admin/documents/view/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">📜 Histórico de Versões</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{doc.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Este documento possui {versions.length} versão(ões) salva(s).
          </p>

          {versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma versão anterior encontrada.</p>
              <p className="text-xs mt-2">
                As versões serão criadas quando você editar o documento.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Versão</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Editado por</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((version) => (
                  <TableRow key={version.id}>
                    <TableCell className="font-medium">
                      v{version.version_number}
                    </TableCell>
                    <TableCell>
                      {format(new Date(version.created_at), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      {version.edited_by ? `Usuário ${version.edited_by.substring(0, 8)}...` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(version)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedVersion?.title} - v{selectedVersion?.version_number}
            </DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-wrap p-4 bg-muted rounded">
            {selectedVersion?.content}
          </div>
          <div className="text-xs text-muted-foreground">
            Salvo em:{" "}
            {selectedVersion &&
              format(new Date(selectedVersion.created_at), "dd/MM/yyyy HH:mm")}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
