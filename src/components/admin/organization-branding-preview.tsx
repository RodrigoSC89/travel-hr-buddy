import React from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Palette, Globe, Calendar } from "lucide-react";

export const OrganizationBrandingPreview: React.FC = () => {
  const { currentOrganization, currentBranding } = useOrganization();

  if (!currentOrganization || !currentBranding) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Preview da Organização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Nome da Empresa</span>
            </div>
            <p className="text-lg font-semibold">{currentBranding.company_name}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Plano</span>
            </div>
            <Badge variant="secondary" className="capitalize">
              {currentOrganization.plan_type}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Cores do Tema</span>
            </div>
            <div className="flex gap-2">
              <div
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: currentBranding.primary_color }}
                title="Cor Primária"
              />
              <div
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: currentBranding.secondary_color }}
                title="Cor Secundária"
              />
              <div
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: currentBranding.accent_color }}
                title="Cor de Destaque"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Idioma/Moeda</span>
            </div>
            <p className="text-sm">
              {currentBranding.default_language} • {currentBranding.default_currency}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Fuso Horário</span>
            </div>
            <p className="text-sm">{currentBranding.timezone}</p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Modo do Tema</span>
            <Badge variant="outline" className="capitalize">
              {currentBranding.theme_mode}
            </Badge>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <span className="text-sm font-medium">Módulos Habilitados</span>
            <div className="flex flex-wrap gap-1">
              {(Array.isArray(currentBranding.enabled_modules)
                ? currentBranding.enabled_modules
                : []
              ).map(module => (
                <Badge key={module} variant="secondary" className="text-xs">
                  {module}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
