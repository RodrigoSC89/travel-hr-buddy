/**
 * Vessel Access Management Page
 * Manage user access to vessels - multi-tenant isolation
 */

import React from "react";
import { VesselAccessManager } from "@/components/admin/VesselAccessManager";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Ship, Users, AlertTriangle } from "lucide-react";

export default function VesselAccessManagementPage() {
  return (
    <RoleBasedAccess 
      roles={["admin", "hr_manager"]} 
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">Acesso Restrito</h3>
              <p className="text-muted-foreground">
                Esta área é restrita a administradores e gestores de RH.
              </p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Acesso por Embarcação</h1>
            <p className="text-muted-foreground">
              Controle quais usuários têm acesso a cada embarcação da frota
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Ship className="h-4 w-4 text-blue-500" />
                Isolamento por Embarcação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Cada usuário só vê dados das embarcações que tem acesso autorizado
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                Acesso Global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                RH, Jurídico, Financeiro, Compras e Admins têm acesso automático a todas as embarcações
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-500" />
                RLS Ativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Políticas de segurança em nível de linha garantem isolamento total dos dados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Manager Component */}
        <VesselAccessManager />
      </div>
    </RoleBasedAccess>
  );
}
