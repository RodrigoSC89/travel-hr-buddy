import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, ChevronDown, Plus, Crown, Zap, Users, Check } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";

export const TenantSwitcher: React.FC = () => {
  const { currentTenant, currentBranding, availableTenants, switchTenant, isLoading } = useTenant();

  const getPlanBadgeVariant = (planType: string) => {
    switch (planType) {
      case "enterprise":
        return "default";
      case "professional":
        return "secondary";
      case "starter":
        return "outline";
      case "trial":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case "enterprise":
        return Crown;
      case "professional":
        return Zap;
      case "starter":
        return Users;
      default:
        return Building2;
    }
  };

  if (!currentTenant) {
    return null;
  }

  const PlanIcon = getPlanIcon(currentTenant.plan_type);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-auto p-3 space-y-1"
          disabled={isLoading}
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentBranding?.logo_url} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {currentBranding?.company_name?.substring(0, 2).toUpperCase() || "NT"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="font-medium text-sm">
                {currentBranding?.company_name || currentTenant.name}
              </span>
              <div className="flex items-center space-x-1">
                <PlanIcon className="h-3 w-3" />
                <span className="text-xs text-muted-foreground capitalize">
                  {currentTenant.plan_type}
                </span>
              </div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Suas Organizações
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {availableTenants.map(tenant => {
          const TenantPlanIcon = getPlanIcon(tenant.plan_type);
          const isSelected = tenant.id === currentTenant.id;

          return (
            <DropdownMenuItem
              key={tenant.id}
              onClick={() => switchTenant(tenant.id)}
              className="p-3 cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {tenant.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{tenant.name}</span>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={getPlanBadgeVariant(tenant.plan_type)}
                        className="h-5 px-2 text-xs"
                      >
                        <TenantPlanIcon className="h-3 w-3 mr-1" />
                        {tenant.plan_type.charAt(0).toUpperCase() + tenant.plan_type.slice(1)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {tenant.subdomain}.nautilus.app
                      </span>
                    </div>
                  </div>
                </div>
                {isSelected && <Check className="h-4 w-4 text-primary" />}
              </div>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem className="p-3 cursor-pointer">
          <div className="flex items-center space-x-3 w-full">
            <div className="h-8 w-8 rounded-md border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">Criar Nova Organização</span>
              <span className="text-xs text-muted-foreground">Configure uma nova empresa</span>
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
