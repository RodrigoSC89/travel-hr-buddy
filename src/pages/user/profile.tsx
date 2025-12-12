/**
 * PATCH 510: User Profile Page with Session Management
 * Displays user profile and active session information
 */

import { useEffect, useState, useCallback } from "react";;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActiveSessionDisplay } from "@/components/auth/ActiveSessionDisplay";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Shield, 
  Settings, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  Bell,
  Moon,
  Globe,
  Save,
  Loader2
} from "lucide-react";

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  avatar_url: string;
}

interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  darkMode: boolean;
  language: string;
}

export default function UserProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    email: "",
    phone: "",
    department: "",
    role: "",
    avatar_url: ""
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
    language: "pt-BR"
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || user.user_metadata?.full_name || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
          department: data.department || "",
          role: "user",
          avatar_url: data.avatar_url || user.user_metadata?.avatar_url || ""
        });
      } else {
        setProfile({
          full_name: user.user_metadata?.full_name || "",
          email: user.email || "",
          phone: "",
          department: "",
          role: "user",
          avatar_url: user.user_metadata?.avatar_url || ""
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          department: profile.department,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso"
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o perfil",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border-4 border-primary/20">
          <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
            {getInitials(profile.full_name || profile.email)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações e configurações de conta</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="session">
            <Shield className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="w-4 h-4 mr-2" />
            Preferências
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>Atualize suas informações de perfil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={profile.full_name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="+55 (11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="department"
                      value={profile.department}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Seu departamento"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Membro desde {formatDate(user?.created_at)}</span>
                </div>
                <Button onClick={saveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="session" className="space-y-4">
          <ActiveSessionDisplay />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>Configure como você deseja receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizações importantes por email
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, emailNotifications: checked })
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações em tempo real no navegador
                  </p>
                </div>
                <Switch
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, pushNotifications: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Aparência e Idioma
              </CardTitle>
              <CardDescription>Personalize sua experiência visual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  <div>
                    <Label>Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Usar tema escuro automaticamente
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, darkMode: checked })
                  }
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <select
                  id="language"
                  value={preferences.language}
                  onChange={handleChange})}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
