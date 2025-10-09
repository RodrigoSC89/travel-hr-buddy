import React, { useState, useEffect, useCallback } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  role: string;
}

export const OrganizationSelector: React.FC = () => {
  const { user } = useAuth();
  const { currentOrganization, switchOrganization } = useOrganization();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadUserOrganizations = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("organization_users")
        .select(
          `
          role,
          organization:organizations(id, name)
        `
        )
        .eq("user_id", user?.id)
        .eq("status", "active");

      if (error) throw error;

      const orgs = (data || []).map((item: any) => ({
        id: item.organization.id,
        name: item.organization.name,
        role: item.role,
      }));

      setOrganizations(orgs);
    } catch (error) {
      console.error("Erro ao carregar organizações:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserOrganizations();
    }
  }, [user, loadUserOrganizations]);

  const handleOrganizationChange = async (orgId: string) => {
    try {
      await switchOrganization(orgId);
    } catch (error) {
      console.error("Erro ao trocar organização:", error);
    }
  };

  if (organizations.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Building2 className="h-4 w-4 text-foreground/70" />
      <Select
        value={currentOrganization?.id || ""}
        onValueChange={handleOrganizationChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[200px] border-border hover:border-ring">
          <SelectValue
            placeholder="Selecionar organização"
            className="text-foreground placeholder:text-muted-foreground"
          />
        </SelectTrigger>
        <SelectContent align="start" className="min-w-[240px]">
          {organizations.map(org => (
            <SelectItem key={org.id} value={org.id} className="cursor-pointer">
              <div className="flex flex-col py-1">
                <span className="text-foreground font-medium">{org.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{org.role}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
