import React, { useState, useEffect, useCallback } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useOrganizationPermissions } from "@/hooks/use-organization-permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Trash2
} from "lucide-react";

interface OrganizationUser {
  id: string;
  email: string;
  role: string;
  status: string;
  full_name?: string;
  joined_at: string;
  last_active_at?: string;
}

export const UserManagementMultiTenant: React.FC = () => {
  const { currentOrganization, getCurrentOrganizationUsers, inviteUser, removeUser, updateUserRole } = useOrganization();
  const { canManageUsers, isAdmin, userRole } = useOrganizationPermissions();
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const { toast } = useToast();

  const loadUsers = useCallback(async () => {
    if (!currentOrganization) return;

    try {
      setIsLoading(true);
      const organizationUsers = await getCurrentOrganizationUsers();
      setUsers(organizationUsers);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários da organização",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization, getCurrentOrganizationUsers, toast]);

  useEffect(() => {
    if (currentOrganization && canManageUsers()) {
      loadUsers();
    }
  }, [currentOrganization, canManageUsers, loadUsers]);

  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteRole) return;

    try {
      await inviteUser(inviteEmail, inviteRole as "admin" | "manager" | "member");
      setInviteEmail("");
      setInviteRole("member");
      setShowInviteDialog(false);
      loadUsers();
      toast({
        title: "Convite Enviado",
        description: `Convite enviado para ${inviteEmail}`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o convite",
        variant: "destructive"
      });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole as "admin" | "manager" | "member");
      loadUsers();
      toast({
        title: "Função Atualizada",
        description: "A função do usuário foi atualizada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a função do usuário",
        variant: "destructive"
      });
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      await removeUser(userId);
      loadUsers();
      toast({
        title: "Usuário Removido",
        description: "O usuário foi removido da organização"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o usuário",
        variant: "destructive"
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
    case "owner": return "default";
    case "admin": return "secondary";
    case "manager": return "outline";
    default: return "secondary";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
    case "owner": return "Proprietário";
    case "admin": return "Administrador";
    case "manager": return "Gerente";
    default: return "Membro";
    }
  };

  if (!canManageUsers()) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Você não tem permissão para gerenciar usuários nesta organização.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Gerenciamento de Usuários
          </h2>
          <p className="text-muted-foreground">
            Gerencie os usuários da organização {currentOrganization?.name}
          </p>
        </div>
        
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Convidar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">E-mail do Usuário</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="usuario@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="role">Função na Organização</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Membro</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    {isAdmin() && <SelectItem value="admin">Administrador</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleInviteUser} className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Convite
                </Button>
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários da Organização</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando usuários...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.full_name || "Nome não informado"}</p>
                        <p className="text-sm text-muted-foreground">ID: {user.id.slice(0, 8)}...</p>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>
                        {user.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.last_active_at 
                        ? new Date(user.last_active_at).toLocaleDateString("pt-BR")
                        : "Nunca"
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {(isAdmin() || user.role !== "owner") && (
                          <>
                            <Select
                              value={user.role}
                              onValueChange={(newRole) => handleUpdateRole(user.id, newRole)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">Membro</SelectItem>
                                <SelectItem value="manager">Gerente</SelectItem>
                                {isAdmin() && <SelectItem value="admin">Admin</SelectItem>}
                              </SelectContent>
                            </Select>
                            
                            {user.role !== "owner" && userRole !== user.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};