/**
 * Role Configurator Component
 * PATCH 122.0 - RBAC Configuration UI
 * 
 * Allows admins to configure role-based permissions for modules
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Save, 
  AlertCircle,
  CheckCircle,
  Eye,
  Edit,
  Trash,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RoleGuard } from "./RoleGuard";

interface ModulePermission {
  id: string;
  module_name: string;
  role: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
  can_admin: boolean;
}

const AVAILABLE_ROLES = [
  { value: 'admin', label: 'Administrador', color: 'bg-red-500' },
  { value: 'hr_manager', label: 'Gerente RH', color: 'bg-purple-500' },
  { value: 'manager', label: 'Gerente', color: 'bg-blue-500' },
  { value: 'operator', label: 'Operador', color: 'bg-green-500' },
  { value: 'auditor', label: 'Auditor', color: 'bg-yellow-500' },
  { value: 'viewer', label: 'Visualizador', color: 'bg-gray-500' },
];

const AVAILABLE_MODULES = [
  'fleet-control',
  'document-hub',
  'performance-intel',
  'system-watchdog',
  'maintenance-planner',
  'compliance-hub',
  'crew-management',
  'route-optimizer',
];

export const RoleConfigurator: React.FC = () => {
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>(AVAILABLE_MODULES[0]);
  const { toast } = useToast();

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('module_permissions')
        .select('*')
        .order('module_name', { ascending: true })
        .order('role', { ascending: true });

      if (error) {
        console.error("Error loading permissions:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as permissões.",
          variant: "destructive",
        });
        return;
      }

      setPermissions(data || []);
    } catch (error) {
      console.error("Error loading permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = async (
    permissionId: string,
    field: keyof Pick<ModulePermission, 'can_read' | 'can_write' | 'can_delete' | 'can_admin'>,
    value: boolean
  ) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('module_permissions')
        .update({ [field]: value })
        .eq('id', permissionId);

      if (error) {
        console.error("Error updating permission:", error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a permissão.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setPermissions(prev =>
        prev.map(p =>
          p.id === permissionId ? { ...p, [field]: value } : p
        )
      );

      toast({
        title: "Permissão Atualizada",
        description: "A permissão foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error("Error updating permission:", error);
    } finally {
      setSaving(false);
    }
  };

  const createPermissionForModule = async (moduleName: string, role: string) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('module_permissions')
        .insert({
          module_name: moduleName,
          role: role,
          can_read: true,
          can_write: false,
          can_delete: false,
          can_admin: false,
        });

      if (error) {
        console.error("Error creating permission:", error);
        toast({
          title: "Erro",
          description: "Não foi possível criar a permissão.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Permissão Criada",
        description: "A permissão foi criada com sucesso.",
      });

      loadPermissions();
    } catch (error) {
      console.error("Error creating permission:", error);
    } finally {
      setSaving(false);
    }
  };

  const getPermissionForModuleAndRole = (moduleName: string, role: string) => {
    return permissions.find(p => p.module_name === moduleName && p.role === role);
  };

  const getRoleInfo = (roleValue: string) => {
    return AVAILABLE_ROLES.find(r => r.value === roleValue) || AVAILABLE_ROLES[AVAILABLE_ROLES.length - 1];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <RoleGuard requiredRoles={['admin']}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <CardTitle>Configurador de Permissões</CardTitle>
            </div>
            <CardDescription>
              Configure permissões baseadas em função (RBAC) para cada módulo do sistema.
              Defina quem pode visualizar, editar, excluir ou administrar cada módulo.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Module Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selecione o Módulo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {AVAILABLE_MODULES.map((module) => (
                <Button
                  key={module}
                  variant={selectedModule === module ? "default" : "outline"}
                  onClick={() => setSelectedModule(module)}
                  className="justify-start"
                >
                  {module}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Permissões: {selectedModule}
            </CardTitle>
            <CardDescription>
              Configure as permissões para cada função de usuário neste módulo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {AVAILABLE_ROLES.map((role) => {
                const permission = getPermissionForModuleAndRole(selectedModule, role.value);

                return (
                  <Card key={role.value} className="border-2">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${role.color}`} />
                            <h4 className="font-semibold">{role.label}</h4>
                            <Badge variant="outline">{role.value}</Badge>
                          </div>
                          {!permission && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => createPermissionForModule(selectedModule, role.value)}
                              disabled={saving}
                            >
                              Criar Permissão
                            </Button>
                          )}
                        </div>

                        {permission && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`read-${permission.id}`}
                                checked={permission.can_read}
                                onCheckedChange={(checked) =>
                                  updatePermission(permission.id, 'can_read', checked)
                                }
                                disabled={saving}
                              />
                              <Label htmlFor={`read-${permission.id}`} className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                Visualizar
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`write-${permission.id}`}
                                checked={permission.can_write}
                                onCheckedChange={(checked) =>
                                  updatePermission(permission.id, 'can_write', checked)
                                }
                                disabled={saving}
                              />
                              <Label htmlFor={`write-${permission.id}`} className="flex items-center gap-2">
                                <Edit className="w-4 h-4" />
                                Editar
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`delete-${permission.id}`}
                                checked={permission.can_delete}
                                onCheckedChange={(checked) =>
                                  updatePermission(permission.id, 'can_delete', checked)
                                }
                                disabled={saving}
                              />
                              <Label htmlFor={`delete-${permission.id}`} className="flex items-center gap-2">
                                <Trash className="w-4 h-4" />
                                Excluir
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`admin-${permission.id}`}
                                checked={permission.can_admin}
                                onCheckedChange={(checked) =>
                                  updatePermission(permission.id, 'can_admin', checked)
                                }
                                disabled={saving}
                              />
                              <Label htmlFor={`admin-${permission.id}`} className="flex items-center gap-2">
                                <Settings className="w-4 h-4" />
                                Administrar
                              </Label>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Nota:</strong> Alterações nas permissões entram em vigor imediatamente. 
            Usuários afetados precisarão fazer login novamente para que as mudanças sejam aplicadas.
          </AlertDescription>
        </Alert>
      </div>
    </RoleGuard>
  );
};
