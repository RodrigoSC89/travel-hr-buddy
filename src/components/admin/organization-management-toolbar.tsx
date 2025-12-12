import React from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useOrganizationPermissions } from "@/hooks/use-organization-permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  Users, 
  Settings, 
  BarChart3, 
  Crown
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const OrganizationManagementToolbar: React.FC = () => {
  const { currentOrganization, userRole } = useOrganization();
  const { 
    isAdmin, 
    canManageUsers, 
    canManageSettings, 
    canViewAnalytics 
  } = useOrganizationPermissions();
  const navigate = useNavigate();

  if (!currentOrganization) {
    return null;
  }

  const quickActions = [
    {
      title: "Configurações",
      description: "Personalizar organização",
      icon: Settings,
      action: () => navigate("/organization-settings"),
      available: canManageSettings(),
      variant: "outline" as const
    },
    {
      title: "Usuários",
      description: "Gerenciar equipe",
      icon: Users,
      action: () => navigate("/users"),
      available: canManageUsers(),
      variant: "outline" as const
    },
    {
      title: "Analytics",
      description: "Relatórios da organização",
      icon: BarChart3,
      action: () => navigate("/analytics"),
      available: canViewAnalytics(),
      variant: "outline" as const
    },
    {
      title: "Super Admin",
      description: "Painel administrativo",
      icon: Crown,
      action: () => navigate("/super-admin"),
      available: isAdmin(),
      variant: "default" as const
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Gerenciamento da Organização
          <Badge variant="secondary" className="ml-auto capitalize">
            {userRole}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions
            .filter(action => action.available)
            .map((action) => (
              <Button
                key={action.title}
                variant={action.variant}
                size="sm"
                onClick={action.action}
                className="flex flex-col h-auto p-4 space-y-2"
              >
                <action.icon className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium text-xs">{action.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Button>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};