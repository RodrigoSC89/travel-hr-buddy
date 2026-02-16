/**
 * UserManagementHub - User table with filters
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, MoreVertical, Shield, Trash2, Edit, UserCheck, UserX,
  UserPlus, Users, X, Filter,
} from "lucide-react";
import type { OrganizationUser } from "@/hooks/useUserManagement";

interface UserTableProps {
  filteredUsers: OrganizationUser[];
  isLoading: boolean;
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  selectedUsers: string[];
  hasActiveFilters: boolean;
  onSearchChange: (v: string) => void;
  onRoleFilterChange: (v: string) => void;
  onStatusFilterChange: (v: string) => void;
  onClearFilters: () => void;
  onToggleSelectUser: (id: string) => void;
  onToggleSelectAll: () => void;
  onBulkDelete: () => void;
  onEditUser: (user: OrganizationUser) => void;
  onDeleteUser: (id: string) => void;
  onUpdateRole: (id: string, role: "admin" | "manager" | "member" | "owner" | "viewer") => void;
  onUpdateStatus: (id: string, status: string) => void;
  onInvite: () => void;
}

const getRoleBadge = (role: string) => {
  const styles: Record<string, string> = {
    owner: "bg-accent/10 text-accent-foreground border-accent/20",
    admin: "bg-destructive/10 text-destructive border-destructive/20",
    manager: "bg-info/10 text-info border-info/20",
    member: "bg-success/10 text-success border-success/20",
    viewer: "bg-muted text-muted-foreground border-border",
  };
  const labels: Record<string, string> = {
    owner: "Proprietário", admin: "Administrador", manager: "Gerente",
    member: "Membro", viewer: "Visualizador",
  };
  return <Badge variant="outline" className={styles[role]}>{labels[role]}</Badge>;
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    active: "bg-success/10 text-success border-success/20",
    pending: "bg-warning/10 text-warning border-warning/20",
    inactive: "bg-muted text-muted-foreground border-border",
    suspended: "bg-destructive/10 text-destructive border-destructive/20",
  };
  const labels: Record<string, string> = {
    active: "Ativo", pending: "Pendente", inactive: "Inativo", suspended: "Suspenso",
  };
  return <Badge variant="outline" className={styles[status]}>{labels[status]}</Badge>;
};

const getInitials = (name: string) =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

const formatDate = (date: string | undefined) => {
  if (!date) return "Nunca";
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export const UserTable: React.FC<UserTableProps> = ({
  filteredUsers, isLoading, searchTerm, roleFilter, statusFilter,
  selectedUsers, hasActiveFilters,
  onSearchChange, onRoleFilterChange, onStatusFilterChange, onClearFilters,
  onToggleSelectUser, onToggleSelectAll, onBulkDelete,
  onEditUser, onDeleteUser, onUpdateRole, onUpdateStatus, onInvite,
}) => (
  <Card>
    <CardHeader className="pb-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <CardTitle>Usuários da Organização</CardTitle>
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedUsers.length} selecionado(s)</span>
            <Button variant="destructive" size="sm" onClick={onBulkDelete}>
              <Trash2 className="h-4 w-4 mr-1" />Excluir
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center mt-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, e-mail ou departamento..."
            value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Função" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas funções</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="manager">Gerente</SelectItem>
            <SelectItem value="member">Membro</SelectItem>
            <SelectItem value="viewer">Visualizador</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />Limpar
          </Button>
        )}
      </div>
    </CardHeader>

    <CardContent>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum usuário encontrado</p>
          <Button className="mt-4" onClick={onInvite}>
            <UserPlus className="h-4 w-4 mr-2" />Convidar Usuário
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={onToggleSelectAll} />
                </TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="group">
                  <TableCell>
                    <Checkbox checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => onToggleSelectUser(user.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{user.department || "-"}</span>
                    {user.position && <p className="text-xs text-muted-foreground">{user.position}</p>}
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{formatDate(user.last_active_at)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Mais opções" title="Mais opções">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onUpdateRole(user.id, "admin")}>
                          <Shield className="h-4 w-4 mr-2" />Promover a Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditUser(user)}>
                          <Edit className="h-4 w-4 mr-2" />Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === "active" ? (
                          <DropdownMenuItem onClick={() => onUpdateStatus(user.id, "inactive")}>
                            <UserX className="h-4 w-4 mr-2" />Desativar
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => onUpdateStatus(user.id, "active")}>
                            <UserCheck className="h-4 w-4 mr-2" />Ativar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive"
                          onClick={() => onDeleteUser(user.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </CardContent>
  </Card>
);
