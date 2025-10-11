"use client";

import { useParams, useNavigate } from "react-router-dom";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, History } from "lucide-react";
import { useDocument } from "@/hooks/useDocument";
import { DocumentContent } from "@/components/documents/DocumentContent";
import { VersionHistory } from "@/components/documents/VersionHistory";

export default function DocumentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    doc,
    versions,
    loading,
    loadingVersions,
    showVersions,
    restoringVersionId,
    loadVersions,
    restoreVersion,
  } = useDocument(id);

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

        <DocumentContent document={doc} />

        {showVersions && (
          <VersionHistory
            versions={versions}
            onRestore={restoreVersion}
            restoringVersionId={restoringVersionId}
          />
        )}
      </div>
    </RoleBasedAccess>
  );
}
