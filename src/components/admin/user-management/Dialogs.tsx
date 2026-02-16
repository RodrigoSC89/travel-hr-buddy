/**
 * UserManagementHub - Sub-components for dialogs
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Mail } from "lucide-react";
import type { UserInvite } from "@/hooks/useUserManagement";

/* ─── Invite Dialog ─── */
interface InviteDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  inviteData: UserInvite;
  setInviteData: React.Dispatch<React.SetStateAction<UserInvite>>;
  onInvite: () => void;
}

export const InviteDialog: React.FC<InviteDialogProps> = ({
  open, onOpenChange, inviteData, setInviteData, onInvite,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Convidar Novo Usuário</DialogTitle>
        <DialogDescription>Envie um convite para adicionar um novo membro à organização</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail *</Label>
          <Input id="email" type="email" placeholder="usuario@exemplo.com"
            value={inviteData.email}
            onChange={(e) => setInviteData(p => ({ ...p, email: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Função</Label>
            <Select value={inviteData.role} onValueChange={(v) => setInviteData(p => ({ ...p, role: v as typeof p.role }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="member">Membro</SelectItem>
                <SelectItem value="viewer">Visualizador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Departamento</Label>
            <Input placeholder="Ex: TI, RH, Operações"
              value={inviteData.department}
              onChange={(e) => setInviteData(p => ({ ...p, department: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Mensagem (opcional)</Label>
          <Textarea placeholder="Adicione uma mensagem personalizada ao convite..."
            value={inviteData.message}
            onChange={(e) => setInviteData(p => ({ ...p, message: e.target.value }))} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
        <Button onClick={onInvite}><Mail className="h-4 w-4 mr-2" />Enviar Convite</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

/* ─── Delete Confirmation ─── */
interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  isSingle: boolean;
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open, onOpenChange, isSingle, selectedCount, onConfirm, onCancel,
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
        <AlertDialogDescription>
          {isSingle
            ? "Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita."
            : `Tem certeza que deseja remover ${selectedCount} usuário(s)? Esta ação não pode ser desfeita.`
          }
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
          Excluir
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

/* ─── Settings Dialog ─── */
interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Configurações</DialogTitle>
        <DialogDescription>Configure as preferências do módulo de gestão de usuários</DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div><p className="font-medium">Notificações por e-mail</p><p className="text-sm text-muted-foreground">Receber alertas de novos usuários</p></div>
          <Checkbox defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div><p className="font-medium">Aprovação manual</p><p className="text-sm text-muted-foreground">Requer aprovação para novos convites</p></div>
          <Checkbox defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div><p className="font-medium">Logs de atividade</p><p className="text-sm text-muted-foreground">Registrar ações dos usuários</p></div>
          <Checkbox defaultChecked />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => onOpenChange(false)}>Fechar</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

/* ─── Edit User Dialog ─── */
interface EditDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editData: { full_name: string; department: string; position: string; role: string };
  setEditData: React.Dispatch<React.SetStateAction<{ full_name: string; department: string; position: string; role: string }>>;
  onSave: () => void;
}

export const EditUserDialog: React.FC<EditDialogProps> = ({
  open, onOpenChange, editData, setEditData, onSave,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Editar Usuário</DialogTitle>
        <DialogDescription>Atualize as informações do usuário</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label>Nome Completo</Label>
          <Input value={editData.full_name} onChange={(e) => setEditData(p => ({ ...p, full_name: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Departamento</Label>
            <Input value={editData.department} onChange={(e) => setEditData(p => ({ ...p, department: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Cargo</Label>
            <Input value={editData.position} onChange={(e) => setEditData(p => ({ ...p, position: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Função</Label>
          <Select value={editData.role} onValueChange={(v) => setEditData(p => ({ ...p, role: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="manager">Gerente</SelectItem>
              <SelectItem value="member">Membro</SelectItem>
              <SelectItem value="viewer">Visualizador</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
        <Button onClick={onSave}>Salvar Alterações</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
