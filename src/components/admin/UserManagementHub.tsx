import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, UserPlus, Download, RefreshCw, Settings, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserManagement, type OrganizationUser, type UserInvite } from "@/hooks/useUserManagement";

import { StatsCards } from "./user-management/StatsCards";
import { UserTable } from "./user-management/UserTable";
import { InviteDialog, DeleteDialog, SettingsDialog, EditUserDialog } from "./user-management/Dialogs";

export const UserManagementHub: React.FC = () => {
  const { toast } = useToast();
  const {
    users, isLoading, stats, fetchUsers,
    inviteUser, updateUserRole, updateUserStatus, deleteUser, bulkDelete, exportUsers,
  } = useUserManagement();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [userToEdit, setUserToEdit] = useState<OrganizationUser | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  const [inviteData, setInviteData] = useState<UserInvite>({
    email: "", role: "member", department: "", message: "",
  });
  const [editData, setEditData] = useState({ full_name: "", department: "", position: "", role: "member" });

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Handlers
  const handleInvite = useCallback(async () => {
    if (!inviteData.email) {
      toast({ title: "Erro", description: "E-mail é obrigatório", variant: "destructive" });
      return;
    }
    await inviteUser(inviteData);
    setShowInviteDialog(false);
    setInviteData({ email: "", role: "member", department: "", message: "" });
  }, [inviteData, inviteUser, toast]);

  const handleDelete = useCallback(async () => {
    if (userToDelete) {
      await deleteUser(userToDelete);
      setUserToDelete(null);
    }
    setShowDeleteDialog(false);
  }, [userToDelete, deleteUser]);

  const handleBulkDelete = useCallback(async () => {
    await bulkDelete(selectedUsers);
    setSelectedUsers([]);
  }, [selectedUsers, bulkDelete]);

  const toggleSelectUser = useCallback((userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedUsers(prev =>
      prev.length === filteredUsers.length ? [] : filteredUsers.map(u => u.id)
    );
  }, [filteredUsers]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setUnreadNotifications(0);
    toast({ title: "Notificações", description: "Todas marcadas como lidas" });
  }, [toast]);

  const handleEditUser = useCallback((user: OrganizationUser) => {
    setUserToEdit(user);
    setEditData({
      full_name: user.full_name, department: user.department || "",
      position: user.position || "", role: user.role,
    });
    setShowEditDialog(true);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!userToEdit) return;
    await updateUserRole(userToEdit.id, editData.role as "admin" | "manager" | "member" | "owner" | "viewer");
    toast({ title: "Usuário atualizado", description: "As alterações foram salvas com sucesso" });
    setShowEditDialog(false);
    setUserToEdit(null);
  }, [userToEdit, editData, updateUserRole, toast]);

  const hasActiveFilters = !!(searchTerm || roleFilter !== "all" || statusFilter !== "all");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />Gestão de Usuários
          </h2>
          <p className="text-muted-foreground">Gerencie as configurações e dados da sua organização</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative" aria-label="Notificações" title="Notificações">
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-sm font-medium">Notificações</span>
                <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto py-1 px-2 text-xs">
                  Marcar todas como lidas
                </Button>
              </div>
              <DropdownMenuSeparator />
              {unreadNotifications === 0 ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">Nenhuma notificação pendente</div>
              ) : (
                <>
                  <DropdownMenuItem>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm">Novo usuário pendente</span>
                      <span className="text-xs text-muted-foreground">Ana Costa aguarda aprovação</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm">Convite aceito</span>
                      <span className="text-xs text-muted-foreground">João Oliveira aceitou o convite</span>
                    </div>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" onClick={() => setShowSettingsDialog(true)} aria-label="Configurações" title="Configurações">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={fetchUsers} disabled={isLoading} aria-label="Atualizar lista" title="Atualizar lista">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2" />Exportar
          </Button>
          <Button onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />Convidar Usuário
          </Button>
        </div>
      </div>

      <StatsCards stats={stats} />

      <UserTable
        filteredUsers={filteredUsers}
        isLoading={isLoading}
        searchTerm={searchTerm}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        selectedUsers={selectedUsers}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearchTerm}
        onRoleFilterChange={setRoleFilter}
        onStatusFilterChange={setStatusFilter}
        onClearFilters={clearFilters}
        onToggleSelectUser={toggleSelectUser}
        onToggleSelectAll={toggleSelectAll}
        onBulkDelete={() => setShowDeleteDialog(true)}
        onEditUser={handleEditUser}
        onDeleteUser={(id) => { setUserToDelete(id); setShowDeleteDialog(true); }}
        onUpdateRole={updateUserRole}
        onUpdateStatus={updateUserStatus}
        onInvite={() => setShowInviteDialog(true)}
      />

      {/* Dialogs */}
      <InviteDialog open={showInviteDialog} onOpenChange={setShowInviteDialog}
        inviteData={inviteData} setInviteData={setInviteData} onInvite={handleInvite} />
      <DeleteDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}
        isSingle={!!userToDelete} selectedCount={selectedUsers.length}
        onConfirm={userToDelete ? handleDelete : handleBulkDelete}
        onCancel={() => setUserToDelete(null)} />
      <SettingsDialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog} />
      <EditUserDialog open={showEditDialog} onOpenChange={setShowEditDialog}
        editData={editData} setEditData={setEditData} onSave={handleSaveEdit} />
    </div>
  );
};
