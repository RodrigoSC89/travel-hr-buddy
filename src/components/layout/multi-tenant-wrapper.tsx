import React from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface MultiTenantWrapperProps {
  children: React.ReactNode;
  requiresOrganization?: boolean;
}

export const MultiTenantWrapper: React.FC<MultiTenantWrapperProps> = ({ 
  children, 
  requiresOrganization = true 
}) => {
  const { currentOrganization, isLoading, error } = useOrganization();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados da organização: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (requiresOrganization && !currentOrganization) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Você precisa estar associado a uma organização para acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};