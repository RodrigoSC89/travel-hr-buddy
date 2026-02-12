import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Globe, 
  Clock, 
  Palette, 
  Calendar,
  TestTube,
  InfoIcon
} from "lucide-react";

interface GeneralSettings {
  companyName: string;
  defaultLanguage: string;
  timezone: string;
  systemTheme: string;
  dateTimeFormat: string;
}

interface GeneralSettingsTabProps {
  settings: GeneralSettings;
  onUpdate: (updates: Partial<GeneralSettings>) => void;
  testMode: boolean;
}

export const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({
  settings,
  onUpdate,
  testMode
}) => {
  const timezones = [
    { value: "America/Sao_Paulo", label: "São Paulo (UTC-3)" },
    { value: "America/New_York", label: "Nova York (UTC-5)" },
    { value: "Europe/London", label: "Londres (UTC+0)" },
    { value: "Asia/Tokyo", label: "Tóquio (UTC+9)" },
    { value: "Australia/Sydney", label: "Sydney (UTC+10)" },
  ];

  const languages = [
    { value: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷" },
    { value: "en-US", label: "English (United States)", flag: "🇺🇸" },
    { value: "es-ES", label: "Español (España)", flag: "🇪🇸" },
    { value: "fr-FR", label: "Français (France)", flag: "🇫🇷" },
  ];

  const themes = [
    { value: "system", label: "Automático (Sistema)", icon: "🔄" },
    { value: "light", label: "Modo Claro", icon: "☀️" },
    { value: "dark", label: "Modo Escuro", icon: "🌙" },
  ];

  const dateFormats = [
    { value: "DD/MM/YYYY HH:mm", label: "31/12/2024 14:30" },
    { value: "MM/DD/YYYY HH:mm", label: "12/31/2024 2:30 PM" },
    { value: "YYYY-MM-DD HH:mm", label: "2024-12-31 14:30" },
    { value: "DD.MM.YYYY HH:mm", label: "31.12.2024 14:30" },
  ];

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Informações da Empresa
            {testMode && <Badge variant="outline" className="ml-2"><TestTube className="w-3 h-3 mr-1" />Teste</Badge>}
          </CardTitle>
          <CardDescription>
            Configure as informações básicas da sua organização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nome da Empresa</Label>
            <Input
              id="companyName"
              value={settings.companyName}
              onChange={(e) => onUpdate({ companyName: e.target.value })}
              placeholder="Digite o nome da sua empresa"
              className="text-lg font-medium"
            />
            <p className="text-xs text-muted-foreground">
              Este nome aparecerá em relatórios, documentos e na interface do sistema
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Language and Region */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Idioma e Localização
          </CardTitle>
          <CardDescription>
            Configure o idioma padrão e configurações regionais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="language">Idioma Padrão</Label>
              <Select 
                value={settings.defaultLanguage} 
                onValueChange={(value) => onUpdate({ defaultLanguage: value })}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Idioma padrão para novos usuários e interface do sistema
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select 
                value={settings.timezone} 
                onValueChange={(value) => onUpdate({ timezone: value })}
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Fuso horário para timestamps e agendamentos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance and Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Aparência e Exibição
          </CardTitle>
          <CardDescription>
            Configure a aparência e formato de exibição de dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="theme">Tema do Sistema</Label>
              <Select 
                value={settings.systemTheme} 
                onValueChange={(value) => onUpdate({ systemTheme: value })}
              >
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      <div className="flex items-center gap-2">
                        <span>{theme.icon}</span>
                        <span>{theme.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Tema padrão aplicado a todos os usuários
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Formato de Data/Hora</Label>
              <Select 
                value={settings.dateTimeFormat} 
                onValueChange={(value) => onUpdate({ dateTimeFormat: value })}
              >
                <SelectTrigger id="dateFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{format.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Formato padrão para exibição de datas e horários
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <InfoIcon className="w-5 h-5 text-primary" />
            Informações do Sistema
          </CardTitle>
          <CardDescription>
            Informações sobre a versão e status do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Versão</Label>
              <div className="text-lg font-semibold">2.1.4</div>
              <Badge variant="outline" className="text-xs">
                Nautilus One
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Última Atualização</Label>
              <div className="text-lg font-semibold">29/09/2024</div>
              <Badge variant="outline" className="text-xs text-success border-success/30">
                Atualizado
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <div className="text-lg font-semibold text-success">Operacional</div>
              <Badge className="text-xs bg-success/10 text-success hover:bg-success/10">
                Sistema Estável
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};