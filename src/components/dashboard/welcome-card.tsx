import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserProfileBadge } from "@/components/auth/user-profile-badge";
import { RoleBasedAccess } from "@/components/auth/role-based-access";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/use-permissions";
import { Settings, Users, BarChart3, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const WelcomeCard: React.FC = () => {
  const { user } = useAuth();
  const { userRole, getRoleDisplayName } = usePermissions();
  const navigate = useNavigate();

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário";

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = "Boa noite";
    
    if (hour < 12) greeting = "Bom dia";
    else if (hour < 18) greeting = "Boa tarde";
    
    return `${greeting}, ${displayName}!`;
  };

  const getQuickActions = () => {
    const actions = [];
    
    if (userRole === "admin") {
      actions.push({
        icon: Users,
        label: "Gerenciar Usuários",
        action: () => navigate("/admin"),
        variant: "default" as const
      });
    }
    
    if (userRole === "hr_manager" || userRole === "admin") {
      actions.push({
        icon: FileText,
        label: "Relatórios de RH",
        action: () => navigate("/hr"),
        variant: "secondary" as const
      });
    }
    
    actions.push({
      icon: BarChart3,
      label: "Ver Analytics",
      action: () => navigate("/analytics"),
      variant: "default" as const
    });
    
    actions.push({
      icon: Settings,
      label: "Configurações",
      action: () => navigate("/settings"),
      variant: "outline" as const
    });
    
    return actions.slice(0, 3); // Limitar a 3 ações
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/8 via-background to-secondary/8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl text-foreground">{getWelcomeMessage()}</CardTitle>
            <CardDescription className="text-foreground/70">
              {userRole && `Você está logado como ${getRoleDisplayName(userRole)}`}
            </CardDescription>
          </div>
          <UserProfileBadge />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-foreground/80">
            Bem-vindo ao sistema corporativo. Escolha uma das ações rápidas abaixo ou navegue pelos módulos disponíveis.
          </p>
          
          <div className="flex flex-wrap gap-2">
            {getQuickActions().map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                size="sm"
                onClick={action.action}
                className="flex items-center gap-2"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </div>

          <RoleBasedAccess 
            roles={["admin", "hr_manager"]} 
            showFallback={false}
          >
            <div className="mt-4 p-3 bg-primary/20 rounded-lg border border-primary/40 shadow-sm">
              <p className="text-sm text-primary font-medium">
                💡 Como administrador/gerente, você tem acesso a recursos especiais de gestão
              </p>
            </div>
          </RoleBasedAccess>
        </div>
      </CardContent>
    </Card>
  );
};