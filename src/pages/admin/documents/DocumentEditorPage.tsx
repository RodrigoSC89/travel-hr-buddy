import React from "react";
import { DocumentEditor } from "@/components/documents/DocumentEditor";
import { RoleBasedAccess } from "@/components/auth/role-based-access";

export default function DocumentEditorPage() {
  const handleSave = (documentId: string) => {
    console.log("Document saved with ID:", documentId);
  };

  return (
    <RoleBasedAccess allowedRoles={["admin", "manager"]}>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Editor de Documentos</h1>
            <p className="text-muted-foreground">
              Crie e edite documentos com auto-salvamento e histórico de versões
            </p>
          </div>

          <DocumentEditor onSave={handleSave} />
        </div>
      </div>
    </RoleBasedAccess>
  );
}
