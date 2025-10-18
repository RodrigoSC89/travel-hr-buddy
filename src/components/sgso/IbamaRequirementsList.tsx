import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, FileText } from "lucide-react";
import { useSGSOIbamaRequirements } from "@/hooks/use-sgso-ibama-requirements";
import type { SGSOIbamaRequirement } from "@/types/sgso-ibama";

/**
 * Component to display the 17 official IBAMA SGSO requirements
 * Used for reference and compliance tracking in maritime operations
 */
export function IbamaRequirementsList() {
  const { data: requirements, isLoading, error } = useSGSOIbamaRequirements();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(17)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar requisitos IBAMA: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!requirements || requirements.length === 0) {
    return (
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Nenhum requisito IBAMA encontrado. Execute as migrações do banco de dados.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Requisitos SGSO - IBAMA</h2>
          <p className="text-muted-foreground">
            17 Requisitos Oficiais do Sistema de Gestão de Segurança Operacional
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <CheckCircle className="h-4 w-4 mr-2" />
          {requirements.length} Requisitos
        </Badge>
      </div>

      <div className="grid gap-4">
        {requirements.map((requirement: SGSOIbamaRequirement) => (
          <Card key={requirement.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Badge variant="secondary" className="font-mono">
                      #{requirement.requirement_number}
                    </Badge>
                    {requirement.requirement_title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Requisito {requirement.requirement_number} de 17
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {requirement.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Compact version of IBAMA requirements list for quick reference
 */
export function IbamaRequirementsCompact() {
  const { data: requirements, isLoading } = useSGSOIbamaRequirements();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!requirements || requirements.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Requisitos IBAMA (Resumo)
        </CardTitle>
        <CardDescription>
          Sistema de Gestão de Segurança Operacional
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {requirements.map((requirement: SGSOIbamaRequirement) => (
            <div
              key={requirement.id}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Badge variant="outline" className="font-mono shrink-0">
                {requirement.requirement_number}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {requirement.requirement_title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
