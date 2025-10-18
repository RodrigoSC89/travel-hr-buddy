import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { UserCheck, Users, Ship, Building, Plus, Edit, Trash2, Shield, Eye, Calendar, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { nullToUndefined } from "@/lib/type-helpers";

interface User {
  id: string;
  email: string;
  raw_user_meta_data?: {
    full_name?: string;
  };
}

interface UserPermission {
  id: string;
  user_id: string;
  organization_id: string;
  feature_module: string;
  permission_level: "none" | "read" | "write" | "admin";
  vessel_access: string[];
  area_access: string[];
  location_type: "vessel" | "shore" | "both";
  granted_by: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  profiles?: {
    full_name?: string;
  };
}

interface Vessel {
  id: string;
  name: string;
  imo_number?: string;
}

export const PeotramPermissionsManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [permissionForm, setPermissionForm] = useState({
    user_id: "",
    feature_module: "peotram",
    permission_level: "read" as const,
    vessel_access: [] as string[],
    area_access: [] as string[],
    location_type: "vessel" as "vessel" | "shore" | "both",
    expires_at: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUsers(),
        fetchPermissions(),
        fetchVessels()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name");

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
    }
  };

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from("user_feature_permissions")
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq("feature_module", "peotram")
        .order("granted_at", { ascending: false });

      if (error) throw error;
      
      const mappedPermissions = (data || []).map((permission: any) => ({
        ...permission,
        permission_level: permission.permission_level as "none" | "read" | "write" | "admin",
        location_type: permission.location_type as "vessel" | "shore" | "both"
      }));
      
      setPermissions(mappedPermissions);
    } catch (error) {
    }
  };

  const fetchVessels = async () => {
    try {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, imo_number")
        .order("name");

      if (error) throw error;
      const mappedVessels = (data || []).map(v => ({
        ...v,
        imo_number: nullToUndefined(v.imo_number)
      }));
      setVessels(mappedVessels);
    } catch (error) {
    }
  };

  const createPermission = async () => {
    try {
      const { data, error } = await supabase
        .from("user_feature_permissions")
        .insert([{
          ...permissionForm,
          is_active: true,
          expires_at: permissionForm.expires_at || null
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Permissão criada com sucesso!",
      });

      setIsDialogOpen(false);
      setPermissionForm({
        user_id: "",
        feature_module: "peotram",
        permission_level: "read",
        vessel_access: [],
        area_access: [],
        location_type: "both",
        expires_at: ""
      });
      fetchPermissions();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a permissão.",
        variant: "destructive",
      });
    }
  };

  const updatePermission = async (id: string, updates: Record<string, unknown>) => {
    try {
      const { error } = await supabase
        .from("user_feature_permissions")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Permissão atualizada com sucesso!",
      });

      fetchPermissions();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a permissão.",
        variant: "destructive",
      });
    }
  };

  const togglePermissionStatus = async (permission: UserPermission) => {
    await updatePermission(permission.id, { is_active: !permission.is_active });
  };

  const deletePermission = async (id: string) => {
    try {
      const { error } = await supabase
        .from("user_feature_permissions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Permissão removida com sucesso!",
      });

      fetchPermissions();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover a permissão.",
        variant: "destructive",
      });
    }
  };

  const getPermissionLevelColor = (level: string) => {
    switch (level) {
    case "admin":
      return "destructive";
    case "write":
      return "default";
    case "read":
      return "secondary";
    default:
      return "outline";
    }
  };

  const getPermissionLevelText = (level: string) => {
    switch (level) {
    case "admin":
      return "Administrador";
    case "write":
      return "Escrita";
    case "read":
      return "Leitura";
    default:
      return "Nenhuma";
    }
  };

  const filteredPermissions = permissions.filter(permission => {
    const userName = permission.profiles?.full_name || users.find(u => u.id === permission.user_id)?.email || "";
    return userName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const areas = [
    "Ponte de Comando",
    "Praça de Máquinas",
    "Convés",
    "Segurança",
    "Navegação",
    "Operações de Carga",
    "Manutenção",
    "Administração"
  ];

  const stats = {
    totalUsers: permissions.length,
    activePermissions: permissions.filter(p => p.is_active).length,
    adminUsers: permissions.filter(p => p.permission_level === "admin").length,
    expiringPermissions: permissions.filter(p => 
      p.expires_at && new Date(p.expires_at) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Permissões Ativas</p>
                <p className="text-2xl font-bold text-green-600">{stats.activePermissions}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Administradores</p>
                <p className="text-2xl font-bold text-red-600">{stats.adminUsers}</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expirando</p>
                <p className="text-2xl font-bold text-orange-600">{stats.expiringPermissions}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Permissões PEOTRAM</h2>
          <p className="text-muted-foreground">
            Configure o acesso dos usuários ao sistema PEOTRAM
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Permissão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configurar Permissão de Usuário</DialogTitle>
              <DialogDescription>
                Defina as permissões de acesso ao sistema PEOTRAM para um usuário
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Usuário</Label>
                  <Select 
                    value={permissionForm.user_id} 
                    onValueChange={(value) => setPermissionForm(prev => ({ ...prev, user_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.raw_user_meta_data?.full_name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Nível de Permissão</Label>
                  <Select 
                    value={permissionForm.permission_level} 
                    onValueChange={(value: unknown) => setPermissionForm(prev => ({ ...prev, permission_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Leitura</SelectItem>
                      <SelectItem value="write">Escrita</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Tipo de Local</Label>
                  <Select 
                    value={permissionForm.location_type} 
                    onValueChange={(value: unknown) => setPermissionForm(prev => ({ ...prev, location_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vessel">Apenas Embarcações</SelectItem>
                      <SelectItem value="shore">Apenas Base Terrestre</SelectItem>
                      <SelectItem value="both">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Data de Expiração (Opcional)</Label>
                  <Input
                    type="date"
                    value={permissionForm.expires_at}
                    onChange={(e) => setPermissionForm(prev => ({ ...prev, expires_at: e.target.value }))}
                  />
                </div>
              </div>
              
              {(permissionForm.location_type === "vessel" || permissionForm.location_type === "both") && (
                <div className="space-y-2">
                  <Label>Acesso a Embarcações</Label>
                  <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
                    <div className="space-y-2">
                      {vessels.map((vessel) => (
                        <div key={vessel.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`vessel-${vessel.id}`}
                            checked={permissionForm.vessel_access.includes(vessel.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setPermissionForm(prev => ({
                                  ...prev,
                                  vessel_access: [...prev.vessel_access, vessel.id]
                                }));
                              } else {
                                setPermissionForm(prev => ({
                                  ...prev,
                                  vessel_access: prev.vessel_access.filter(id => id !== vessel.id)
                                }));
                              }
                            }}
                          />
                          <Label 
                            htmlFor={`vessel-${vessel.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {vessel.name} {vessel.imo_number && `(IMO: ${vessel.imo_number})`}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para acesso a todas as embarcações
                  </p>
                </div>
              )}
              
              {(permissionForm.location_type === "shore" || permissionForm.location_type === "both") && (
                <div className="space-y-2">
                  <Label>Acesso a Áreas</Label>
                  <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
                    <div className="space-y-2">
                      {areas.map((area) => (
                        <div key={area} className="flex items-center space-x-2">
                          <Checkbox
                            id={`area-${area}`}
                            checked={permissionForm.area_access.includes(area)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setPermissionForm(prev => ({
                                  ...prev,
                                  area_access: [...prev.area_access, area]
                                }));
                              } else {
                                setPermissionForm(prev => ({
                                  ...prev,
                                  area_access: prev.area_access.filter(a => a !== area)
                                }));
                              }
                            }}
                          />
                          <Label 
                            htmlFor={`area-${area}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {area}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para acesso a todas as áreas
                  </p>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={createPermission}
                  disabled={!permissionForm.user_id}
                >
                  Criar Permissão
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-muted-foreground">Carregando permissões...</p>
            </div>
          </div>
        ) : filteredPermissions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Nenhuma permissão encontrada</h3>
              <p className="text-muted-foreground">
                Configure as primeiras permissões de acesso ao PEOTRAM.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPermissions.map((permission) => (
            <Card key={permission.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">
                          {permission.profiles?.full_name || users.find(u => u.id === permission.user_id)?.email}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPermissionLevelColor(permission.permission_level)}>
                            {getPermissionLevelText(permission.permission_level)}
                          </Badge>
                          <Badge variant={permission.is_active ? "outline" : "secondary"}>
                            {permission.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                          {permission.location_type === "vessel" && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Ship className="h-3 w-3" />
                              Embarcações
                            </Badge>
                          )}
                          {permission.location_type === "shore" && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              Base Terrestre
                            </Badge>
                          )}
                          {permission.location_type === "both" && (
                            <Badge variant="outline">
                              Ambos
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {permission.vessel_access.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">Embarcações:</p>
                          <div className="flex flex-wrap gap-1">
                            {permission.vessel_access.map((vesselId) => {
                              const vessel = vessels.find(v => v.id === vesselId);
                              return vessel ? (
                                <Badge key={vesselId} variant="secondary" className="text-xs">
                                  {vessel.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                      
                      {permission.area_access.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">Áreas:</p>
                          <div className="flex flex-wrap gap-1">
                            {permission.area_access.map((area) => (
                              <Badge key={area} variant="secondary" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Criado em {new Date(permission.granted_at).toLocaleDateString("pt-BR")}
                        </div>
                        
                        {permission.expires_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expira em {new Date(permission.expires_at).toLocaleDateString("pt-BR")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-start items-end gap-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePermissionStatus(permission)}
                      >
                        {permission.is_active ? "Desativar" : "Ativar"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePermission(permission.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};