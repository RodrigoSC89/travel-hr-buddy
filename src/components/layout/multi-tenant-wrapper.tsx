import React from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Loading as LoadingSpinner } from "@/components/ui/Loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface MultiTenantWrapperProps {
  children: React.ReactNode;
  requiresOrganization?: boolean;
}

export const MultiTenantWrapper: React.FC<MultiTenantWrapperProps> = ({ 
  children, 
  requiresOrganization = false // Default to false - don't block pages
}) => {
  const { currentOrganization, isLoading, error } = useOrganization();

  // Only show loading for a brief initial period, not indefinitely
  if (isLoading && requiresOrganization) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && requiresOrganization) {
    return (
      <div className="flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados da organização: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Always render children - don't block access
  return <>{children}</>;
};