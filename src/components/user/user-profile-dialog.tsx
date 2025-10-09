import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthProfile } from "@/hooks/use-auth-profile";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Settings, Bell, Globe, Camera, LogOut } from "lucide-react";

interface UserProfileDialogProps {
  trigger?: React.ReactNode;
}

export const UserProfileDialog: React.FC<UserProfileDialogProps> = ({ trigger }) => {
  const { signOut } = useAuth();
  const { profile, isLoading, isUpdating, updateProfile, uploadAvatar } = useAuthProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    department: profile?.department || "",
    position: profile?.position || "",
  });

  const handleSave = async () => {
    const success = await updateProfile(formData);
    if (success) {
      setIsOpen(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const getRoleDisplay = (role: string) => {
    const roles = {
      admin: { label: "Administrador", variant: "destructive" as const },
      hr_manager: { label: "Gerente RH", variant: "default" as const },
      department_manager: { label: "Gerente", variant: "secondary" as const },
      employee: { label: "Funcionário", variant: "outline" as const },
    };
    return roles[role as keyof typeof roles] || roles.employee;
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      </Button>
    );
  }

  const defaultTrigger = (
    <Button variant="ghost" size="icon" className="h-9 w-9">
      <Avatar className="h-7 w-7">
        <AvatarImage src={profile?.avatar_url || ""} />
        <AvatarFallback className="text-xs">
          {profile?.full_name?.charAt(0)?.toUpperCase() || 
           profile?.email?.charAt(0)?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil do Usuário
          </DialogTitle>
          <DialogDescription>
            Gerencie suas informações pessoais e preferências
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações básicas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="text-2xl">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Camera className="h-4 w-4 mr-2" />
                          Alterar Foto
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleDisplay(profile?.role || "employee").variant}>
                        {getRoleDisplay(profile?.role || "employee").label}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile?.email || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Ex: Tecnologia"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="position">Cargo</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="Ex: Desenvolvedor Full Stack"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Preferências do Sistema
                </CardTitle>
                <CardDescription>
                  Configure como você interage com o sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Tema</Label>
                      <div className="text-sm text-muted-foreground">
                        Escolha como o sistema deve aparecer
                      </div>
                    </div>
                    <Select
                      value={profile?.preferences?.theme || "system"}
                      onValueChange={(value) => updateProfile({
                        preferences: { ...profile?.preferences, theme: value as any }
                      })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Escuro</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notificações
                      </Label>
                      <div className="text-sm text-muted-foreground">
                        Receber notificações push e por email
                      </div>
                    </div>
                    <Switch
                      checked={profile?.preferences?.notifications || false}
                      onCheckedChange={(checked) => updateProfile({
                        preferences: { ...profile?.preferences, notifications: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Idioma
                      </Label>
                      <div className="text-sm text-muted-foreground">
                        Idioma da interface do sistema
                      </div>
                    </div>
                    <Select
                      value={profile?.preferences?.language || "pt"}
                      onValueChange={(value) => updateProfile({
                        preferences: { ...profile?.preferences, language: value as any }
                      })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt">Português</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Segurança</CardTitle>
                <CardDescription>
                  Gerencie sua conta e sair do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-border rounded-lg bg-muted/30">
                  <h4 className="font-medium mb-2">Informações da Conta</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Email: {profile?.email}</p>
                    <p>ID: {profile?.id}</p>
                    <p>Função: {getRoleDisplay(profile?.role || "employee").label}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button 
                    variant="destructive" 
                    onClick={handleSignOut}
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair do Sistema
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};