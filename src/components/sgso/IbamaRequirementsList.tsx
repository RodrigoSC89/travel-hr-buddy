import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useSGSOIbamaRequirements } from "@/hooks/use-sgso-ibama-requirements";
import { AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * IbamaRequirementsList Component
 * Displays the 17 official IBAMA SGSO requirements
 */
export const IbamaRequirementsList: React.FC = () => {
  const { data: requirements, isLoading, error } = useSGSOIbamaRequirements();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Requisitos SGSO - IBAMA</CardTitle>
          <CardDescription>Carregando os 17 requisitos oficiais...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar requisitos</AlertTitle>
        <AlertDescription>
          Não foi possível carregar os requisitos IBAMA. Por favor, tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Requisitos SGSO - IBAMA
            </CardTitle>
            <CardDescription>
              17 requisitos oficiais do Sistema de Gestão de Segurança Operacional
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            {requirements?.length || 0} requisitos
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {requirements?.map((requirement) => (
              <Card key={requirement.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant="outline" className="text-sm font-mono">
                        #{requirement.requirement_number}
                      </Badge>
                      <CardTitle className="text-base font-semibold">
                        {requirement.requirement_title}
                      </CardTitle>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {requirement.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
