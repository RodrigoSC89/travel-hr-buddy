import React from 'react';
import { MultiTenantWrapper } from './multi-tenant-wrapper';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';

interface OrganizationLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  requiresOrganization?: boolean;
}

export const OrganizationLayout: React.FC<OrganizationLayoutProps> = ({
  children,
  title,
  showBackButton = true,
  requiresOrganization = true
}) => {
  return (
    <MultiTenantWrapper requiresOrganization={requiresOrganization}>
      <div className="container mx-auto p-6 space-y-6">
        {showBackButton && <BackToDashboard />}
        {title && (
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">
              Gerencie as configurações e dados da sua organização
            </p>
          </div>
        )}
        {children}
      </div>
    </MultiTenantWrapper>
  );
};