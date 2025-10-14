import React from "react";
import TemplateEditor from "@/components/templates/TemplateEditor";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TemplateEditorPage() {
  const navigate = useNavigate();

  return (
    <RoleBasedAccess allowedRoles={["admin", "hr", "manager"]}>
      <ModulePageWrapper gradient="green">
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Criar Novo Template</h1>
              <p className="text-muted-foreground">
                Crie templates reutilizáveis para documentos com o editor inteligente
              </p>
            </div>
          </div>

          <TemplateEditor />
        </div>
      </ModulePageWrapper>
    </RoleBasedAccess>
  );
}
