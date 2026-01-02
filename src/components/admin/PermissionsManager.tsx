import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, Users, Settings, Lock, Unlock, Search, 
  Save, RefreshCw, AlertTriangle, CheckCircle2, Eye,
  Edit, Trash2, Plus, FileText, Database, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  userCount: number;
  color: string;
}

interface Permission {
  id: string;
  module: string;
  action: string;
  description: string;
}

interface RolePermission {
  roleId: string;
  permissionId: string;
  enabled: boolean;
}

const roles: Role[] = [
  { id: 'admin', name: 'admin', displayName: 'Administrador', description: 'Acesso total ao sistema', userCount: 3, color: 'bg-destructive/20 text-destructive' },
  { id: 'hr_manager', name: 'hr_manager', displayName: 'Gerente de RH', description: 'Gestão de pessoas e tripulação', userCount: 5, color: 'bg-purple-500/20 text-purple-400' },
  { id: 'operations', name: 'operations', displayName: 'Operações', description: 'Gestão operacional de embarcações', userCount: 12, color: 'bg-blue-500/20 text-blue-400' },
  { id: 'compliance', name: 'compliance', displayName: 'Compliance', description: 'Auditorias e conformidade', userCount: 4, color: 'bg-amber-500/20 text-amber-400' },
  { id: 'employee', name: 'employee', displayName: 'Funcionário', description: 'Acesso básico', userCount: 45, color: 'bg-muted text-muted-foreground' },
];

const modules = [
  { id: 'dashboard', name: 'Dashboard', icon: Zap },
  { id: 'vessels', name: 'Embarcações', icon: FileText },
  { id: 'crew', name: 'Tripulação', icon: Users },
  { id: 'compliance', name: 'Compliance', icon: Shield },
  { id: 'documents', name: 'Documentos', icon: FileText },
  { id: 'reports', name: 'Relatórios', icon: Database },
  { id: 'settings', name: 'Configurações', icon: Settings },
];

const actions = ['view', 'create', 'edit', 'delete', 'export', 'admin'];

const actionLabels: Record<string, string> = {
  view: 'Visualizar',
  create: 'Criar',
  edit: 'Editar',
  delete: 'Excluir',
  export: 'Exportar',
  admin: 'Administrar'
};

export function PermissionsManager() {
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [searchTerm, setSearchTerm] = useState('');
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>(() => {
    const initial: Record<string, Record<string, boolean>> = {};
    roles.forEach(role => {
      initial[role.id] = {};
      modules.forEach(mod => {
        actions.forEach(action => {
          const key = `${mod.id}.${action}`;
          // Admin has all permissions
          if (role.id === 'admin') {
            initial[role.id][key] = true;
          } else if (role.id === 'hr_manager') {
            initial[role.id][key] = ['crew', 'documents'].includes(mod.id) || action === 'view';
          } else if (role.id === 'operations') {
            initial[role.id][key] = ['vessels', 'dashboard'].includes(mod.id) || action === 'view';
          } else if (role.id === 'compliance') {
            initial[role.id][key] = ['compliance', 'reports', 'documents'].includes(mod.id) || action === 'view';
          } else {
            initial[role.id][key] = action === 'view';
          }
        });
      });
    });
    return initial;
  });
  const [hasChanges, setHasChanges] = useState(false);

  const handlePermissionChange = (moduleId: string, action: string, enabled: boolean) => {
    const key = `${moduleId}.${action}`;
    setPermissions(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [key]: enabled
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    toast.success('Permissões salvas com sucesso!');
    setHasChanges(false);
  };

  const handleReset = () => {
    toast.success('Permissões resetadas para padrão');
    setHasChanges(false);
  };

  const filteredModules = modules.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentRole = roles.find(r => r.id === selectedRole);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Gerenciamento de Permissões
          </h2>
          <p className="text-muted-foreground">Configure permissões por role e módulo do sistema</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <>
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Roles Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {roles.map(role => (
          <Card 
            key={role.id}
            className={cn(
              "cursor-pointer transition-all",
              selectedRole === role.id 
                ? "border-primary ring-2 ring-primary/20" 
                : "hover:border-primary/50"
            )}
            onClick={() => setSelectedRole(role.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={role.color}>{role.displayName}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{role.description}</p>
              <p className="text-sm font-medium">{role.userCount} usuários</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Permissões: {currentRole?.displayName}
              </CardTitle>
              <CardDescription>{currentRole?.description}</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar módulo..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Módulo</th>
                  {actions.map(action => (
                    <th key={action} className="text-center p-3 font-medium text-muted-foreground">
                      {actionLabels[action]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredModules.map(mod => {
                  const ModIcon = mod.icon;
                  return (
                    <tr key={mod.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <ModIcon className="h-4 w-4 text-primary" />
                          <span className="font-medium">{mod.name}</span>
                        </div>
                      </td>
                      {actions.map(action => {
                        const key = `${mod.id}.${action}`;
                        const enabled = permissions[selectedRole]?.[key] ?? false;
                        const isAdmin = selectedRole === 'admin';
                        
                        return (
                          <td key={action} className="p-3 text-center">
                            <Switch
                              checked={enabled}
                              onCheckedChange={(checked) => handlePermissionChange(mod.id, action, checked)}
                              disabled={isAdmin}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {selectedRole === 'admin' && (
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <p className="text-sm text-amber-400">
                Administradores possuem acesso total. Permissões não podem ser alteradas.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 cursor-pointer hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-medium">Conceder Todas</h4>
              <p className="text-xs text-muted-foreground">Habilitar todas as permissões</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 cursor-pointer hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Eye className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-medium">Somente Leitura</h4>
              <p className="text-xs text-muted-foreground">Apenas visualização</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 cursor-pointer hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <Lock className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h4 className="font-medium">Revogar Todas</h4>
              <p className="text-xs text-muted-foreground">Remover todas as permissões</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
