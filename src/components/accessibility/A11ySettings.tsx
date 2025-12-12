/**
 * PATCH 838: Accessibility Settings Panel
 * User-friendly accessibility configuration
 */

import React from "react";
import { motion } from "framer-motion";
import { 
  Accessibility, 
  Eye, 
  Type, 
  Zap, 
  Palette,
  MousePointer,
  Volume2,
  Check
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useA11y } from "@/lib/accessibility/a11y-manager";
import { cn } from "@/lib/utils";

interface A11ySettingsProps {
  compact?: boolean;
}

export const A11ySettings = memo(function({ compact = false }: A11ySettingsProps) {
  const { settings, updateSetting, reset } = useA11y();

  const settingsGroups = [
    {
      title: "Visão",
      icon: <Eye className="w-4 h-4" />,
      settings: [
        {
          key: "highContrast" as const,
          label: "Alto contraste",
          description: "Aumenta o contraste das cores",
        },
        {
          key: "largeText" as const,
          label: "Texto grande",
          description: "Aumenta o tamanho da fonte",
        },
        {
          key: "dyslexiaFont" as const,
          label: "Fonte para dislexia",
          description: "Usa fonte otimizada para dislexia",
        },
      ],
    },
    {
      title: "Movimento",
      icon: <Zap className="w-4 h-4" />,
      settings: [
        {
          key: "reducedMotion" as const,
          label: "Reduzir movimento",
          description: "Minimiza animações e transições",
        },
      ],
    },
    {
      title: "Navegação",
      icon: <MousePointer className="w-4 h-4" />,
      settings: [
        {
          key: "keyboardNavigation" as const,
          label: "Navegação por teclado",
          description: "Habilita atalhos de teclado",
        },
        {
          key: "focusIndicators" as const,
          label: "Indicadores de foco",
          description: "Mostra elementos focados",
        },
      ],
    },
  ];

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Accessibility className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Acessibilidade</span>
          </div>
          <Button variant="ghost" size="sm" onClick={reset}>
            Resetar
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <QuickToggle
            active={settings.highContrast}
            onClick={() => handleupdateSetting}
            icon={<Eye className="w-4 h-4" />}
            label="Contraste"
          />
          <QuickToggle
            active={settings.largeText}
            onClick={() => handleupdateSetting}
            icon={<Type className="w-4 h-4" />}
            label="Texto grande"
          />
          <QuickToggle
            active={settings.reducedMotion}
            onClick={() => handleupdateSetting}
            icon={<Zap className="w-4 h-4" />}
            label="Sem animação"
          />
          <QuickToggle
            active={settings.screenReaderMode}
            onClick={() => handleupdateSetting}
            icon={<Volume2 className="w-4 h-4" />}
            label="Leitor de tela"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Accessibility className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Acessibilidade</h3>
          <p className="text-sm text-muted-foreground">
            Configure sua experiência de uso
          </p>
        </div>
      </div>

      {settingsGroups.map((group) => (
        <div key={group.title} className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            {group.icon}
            <span className="text-sm font-medium">{group.title}</span>
          </div>

          <div className="space-y-3 pl-6">
            {group.settings.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor={setting.key}>{setting.label}</Label>
                  <p className="text-xs text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
                <Switch
                  id={setting.key}
                  checked={settings[setting.key] as boolean}
                  onCheckedChange={(checked) => updateSetting(setting.key, checked}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Text spacing */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Type className="w-4 h-4" />
          <span className="text-sm font-medium">Espaçamento do texto</span>
        </div>

        <div className="pl-6">
          <Select
            value={settings.textSpacing}
            onValueChange={(value: "normal" | "wide" | "wider") => 
              updateSetting("textSpacing", value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="wide">Ampliado</SelectItem>
              <SelectItem value="wider">Muito ampliado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Color blind mode */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Palette className="w-4 h-4" />
          <span className="text-sm font-medium">Modo daltônico</span>
        </div>

        <div className="pl-6">
          <Select
            value={settings.colorBlindMode}
            onValueChange={(value: unknown) => updateSetting("colorBlindMode", value}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              <SelectItem value="protanopia">Protanopia (vermelho)</SelectItem>
              <SelectItem value="deuteranopia">Deuteranopia (verde)</SelectItem>
              <SelectItem value="tritanopia">Tritanopia (azul)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reset button */}
      <div className="pt-4 border-t border-border">
        <Button variant="outline" onClick={reset} className="w-full">
          Restaurar padrões
        </Button>
      </div>
    </div>
  );
}

interface QuickToggleProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function QuickToggle({ active, onClick, icon, label }: QuickToggleProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg border transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
      {active && <Check className="w-3 h-3 ml-auto" />}
    </motion.button>
  );
}
