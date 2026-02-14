/**
 * Users & Profiles Tab - REAL DATA from Supabase: profiles, user_roles
 */
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Users, UserPlus, Search, MoreHorizontal, Shield, Mail, Building, TestTube, Edit, Trash2, Settings, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UsersProfilesTabProps { testMode: boolean; }

export const UsersProfilesTab: React.FC<UsersProfilesTabProps> = ({ testMode }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*, user_roles(role)").order("full_name");
      if (error) throw error;
      return (data || []).map((u: any) => ({
        id: u.id,
        name: u.full_name || u.email || "Sem nome",
        email: u.email || "",
        role: u.user_roles?.[0]?.role || "employee",
        status: "active",
        department: u.department || "N/A",
        lastLogin: u.updated_at || u.created_at,
        avatar: u.avatar_url,
      }));
    },
  });

  const roles = [
    { value: "admin", label: "Administrador", color: "bg-destructive/10 text-destructive" },
    { value: "hr_manager", label: "Gerente RH", color: "bg-info/10 text-info" },
    { value: "manager", label: "Gerente", color: "bg-primary/10 text-primary" },
    { value: "employee", label: "Funcionário", color: "bg-success/10 text-success" },
  ];

  const getRoleInfo = (role: string) => roles.find(r => r.value === role) || roles[3];

  const filteredUsers = (users || []).filter((user: any) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (isLoading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="management" className="space-y-6">
        <TabsList>
          <TabsTrigger value="management" className="flex items-center gap-2"><Users className="w-4 h-4" />Gerenciamento de Usuários</TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2"><Shield className="w-4 h-4" />Cargos e Permissões</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" />Gerenciamento de Usuários{testMode && <Badge variant="outline" className="ml-2"><TestTube className="w-3 h-3 mr-1" />Teste</Badge>}</CardTitle><CardDescription>Gerencie usuários, cargos e permissões</CardDescription></div>
                <Button className="flex items-center gap-2"><UserPlus className="w-4 h-4" />Novo Usuário</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Buscar por nome ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></div>
                <Select value={selectedRole} onValueChange={setSelectedRole}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Filtrar por cargo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os cargos</SelectItem>{roles.map(role => <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>)}</SelectContent></Select>
              </div>

              <div className="space-y-4">
                {filteredUsers.map((user: any) => {
                  const roleInfo = getRoleInfo(user.role);
                  return (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <Avatar><AvatarImage src={user.avatar} /><AvatarFallback>{user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}</AvatarFallback></Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2"><h4 className="font-medium">{user.name}</h4><Badge className="bg-success/10 text-success">Ativo</Badge></div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</span>
                            <span className="flex items-center gap-1"><Building className="w-3 h-3" />{user.department}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
                        <div className="text-xs text-muted-foreground">Último acesso: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("pt-BR") : "N/A"}</div>
                        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Editar</DropdownMenuItem>
                            <DropdownMenuItem><Shield className="w-4 h-4 mr-2" />Permissões</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Remover</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
                {filteredUsers.length === 0 && <p className="text-muted-foreground text-center py-8">Nenhum usuário encontrado</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" />Configuração de Cargos</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {roles.map((role) => (
                <div key={role.value} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3"><Badge className={role.color}>{role.label}</Badge><Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-2" />Editar</Button></div>
                  <p className="text-sm text-muted-foreground">{(users || []).filter((u: any) => u.role === role.value).length} usuários com este cargo</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
