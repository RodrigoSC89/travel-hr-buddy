"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, ArrowLeft, History, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DocumentVersionHistory } from "@/components/documents/DocumentVersionHistory";
import { usePermissions } from "@/hooks/use-permissions";

interface Document {
  title: string;
  content: string;
  created_at: string;
  generated_by: string | null;
  author_email?: string;
  author_name?: string;
}

interface DocumentVersion {
  id: string;
  document_id: string;
  content: string;
  created_at: string;
  updated_by: string | null;
}

export default function DocumentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = usePermissions();
  const [doc, setDoc] = useState<Document | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_generated_documents")
        .select(`
          title, 
          content, 
          created_at, 
          generated_by,
          profiles:generated_by (
            email,
            full_name
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      // Transform the data to flatten the profiles object
      const transformedData = {
        ...data,
        author_email: data.profiles?.email,
        author_name: data.profiles?.full_name,
      };

      setDoc(transformedData);
    } catch (error) {
      console.error("Error loading document:", error);
      toast({
        title: "Erro ao carregar documento",
        description: "Não foi possível carregar o documento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadVersions = async () => {
    if (!id) return;
    
    setLoadingVersions(true);
    try {
      const { data, error } = await supabase
        .from("document_versions")
        .select("*")
        .eq("document_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setVersions(data || []);
      setShowVersions(true);
    } catch (error) {
      console.error("Error loading versions:", error);
      toast({
        title: "Erro ao carregar versões",
        description: "Não foi possível carregar o histórico de versões.",
        variant: "destructive",
      });
    } finally {
      setLoadingVersions(false);
    }
  };

  const restoreVersion = async (versionId: string, versionContent: string) => {
    if (!id) return;

    setRestoringVersionId(versionId);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Update the document (this will automatically create a new version via trigger)
      const { error: updateError } = await supabase
        .from("ai_generated_documents")
        .update({ content: versionContent })
        .eq("id", id);

      if (updateError) throw updateError;

      // Log the restoration
      const { error: logError } = await supabase
        .from("document_restore_logs")
        .insert({
          document_id: id,
          version_id: versionId,
          restored_by: user.id,
        });

      if (logError) {
        console.error("Error logging restoration:", logError);
        // Don't fail the operation if logging fails
      }

      toast({
        title: "Versão restaurada",
        description: "A versão anterior foi restaurada com sucesso.",
      });

      // Reload document
      await loadDocument();
      
      // Reload versions to show the new version created by restoration
      await loadVersions();
    } catch (error) {
      console.error("Error restoring version:", error);
      toast({
        title: "Erro ao restaurar versão",
        description: "Não foi possível restaurar a versão anterior.",
        variant: "destructive",
      });
    } finally {
      setRestoringVersionId(null);
    }
  };

  if (loading)
    return (
      <RoleBasedAccess roles={["admin", "hr_manager"]}>
        <div className="p-8 text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando documento...
        </div>
      </RoleBasedAccess>
    );

  if (!doc)
    return (
      <RoleBasedAccess roles={["admin", "hr_manager"]}>
        <div className="p-8 text-destructive">Documento não encontrado.</div>
      </RoleBasedAccess>
    );

  return (
    <RoleBasedAccess roles={["admin", "hr_manager"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/documents")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadVersions}
            disabled={loadingVersions}
          >
            {loadingVersions ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <History className="w-4 h-4 mr-2" />
            )}
            {showVersions ? "Atualizar Versões" : "Ver Histórico"}
          </Button>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold">📄 {doc.title}</h1>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Criado em {format(new Date(doc.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
            {userRole === "admin" && (doc.author_name || doc.author_email) && (
              <p className="text-sm text-muted-foreground">
                Autor: {doc.author_name || doc.author_email || "Desconhecido"}
              </p>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Conteúdo Atual</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-wrap">
              {doc.content}
            </CardContent>
          </Card>

          {/* Version History Component */}
          <DocumentVersionHistory 
            documentId={id!} 
            onRestore={loadDocument}
          />
        </div>

        {showVersions && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Histórico de Versões
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {versions.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhuma versão anterior encontrada. O histórico é criado quando o documento é editado.
                </p>
              ) : (
                versions.map((version, index) => (
                  <Card key={version.id} className="border">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              Versão {versions.length - index}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(version.created_at), "dd/MM/yyyy 'às' HH:mm", {
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreVersion(version.id, version.content)}
                          disabled={restoringVersionId !== null}
                        >
                          {restoringVersionId === version.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Restaurando...
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Restaurar
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="text-sm bg-muted/50 p-3 rounded-md max-h-32 overflow-y-auto">
                        <p className="whitespace-pre-wrap line-clamp-3">
                          {version.content}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </RoleBasedAccess>
  );
}
