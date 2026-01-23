/**
 * AI Settings Dialog Component
 * PATCH: Feature Implementation - AI Assistant Settings
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Brain, Thermometer, Languages, Volume2 } from "lucide-react";
import { toast } from "sonner";

interface AISettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings?: AISettings;
  onSave?: (settings: AISettings) => void;
}

export interface AISettings {
  model: string;
  temperature: number;
  language: string;
  voiceEnabled: boolean;
  autoSuggestions: boolean;
  contextMemory: boolean;
  maxTokens: number;
}

const DEFAULT_SETTINGS: AISettings = {
  model: "gemini-2.5-flash",
  temperature: 0.7,
  language: "pt-BR",
  voiceEnabled: false,
  autoSuggestions: true,
  contextMemory: true,
  maxTokens: 2048,
};

const AI_MODELS = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", description: "Rápido e eficiente" },
  { value: "gpt-4o", label: "GPT-4o", description: "Alta qualidade" },
  { value: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet", description: "Análises complexas" },
];

const LANGUAGES = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Español" },
  { value: "zh-CN", label: "中文" },
];

export function AISettingsDialog({
  open,
  onOpenChange,
  settings = DEFAULT_SETTINGS,
  onSave,
}: AISettingsDialogProps) {
  const [currentSettings, setCurrentSettings] = useState<AISettings>(settings);

  const handleSave = () => {
    onSave?.(currentSettings);
    localStorage.setItem("ai_settings", JSON.stringify(currentSettings));
    toast.success("Configurações salvas com sucesso!");
    onOpenChange(false);
  };

  const handleReset = () => {
    setCurrentSettings(DEFAULT_SETTINGS);
    toast.info("Configurações restauradas para o padrão");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações do Assistente IA
          </DialogTitle>
          <DialogDescription>
            Ajuste o comportamento e preferências do assistente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Model Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Modelo de IA
            </Label>
            <Select
              value={currentSettings.model}
              onValueChange={(value) =>
                setCurrentSettings((prev) => ({ ...prev, model: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o modelo" />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    <div>
                      <div className="font-medium">{model.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {model.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              Temperatura: {currentSettings.temperature.toFixed(1)}
            </Label>
            <Slider
              value={[currentSettings.temperature]}
              onValueChange={([value]) =>
                setCurrentSettings((prev) => ({ ...prev, temperature: value }))
              }
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Preciso</span>
              <span>Criativo</span>
            </div>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Languages className="w-4 h-4" />
              Idioma
            </Label>
            <Select
              value={currentSettings.language}
              onValueChange={(value) =>
                setCurrentSettings((prev) => ({ ...prev, language: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Voz habilitada
              </Label>
              <Switch
                checked={currentSettings.voiceEnabled}
                onCheckedChange={(checked) =>
                  setCurrentSettings((prev) => ({ ...prev, voiceEnabled: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Sugestões automáticas</Label>
              <Switch
                checked={currentSettings.autoSuggestions}
                onCheckedChange={(checked) =>
                  setCurrentSettings((prev) => ({
                    ...prev,
                    autoSuggestions: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Memória de contexto</Label>
              <Switch
                checked={currentSettings.contextMemory}
                onCheckedChange={(checked) =>
                  setCurrentSettings((prev) => ({
                    ...prev,
                    contextMemory: checked,
                  }))
                }
              />
            </div>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <Label>Tokens máximos: {currentSettings.maxTokens}</Label>
            <Slider
              value={[currentSettings.maxTokens]}
              onValueChange={([value]) =>
                setCurrentSettings((prev) => ({ ...prev, maxTokens: value }))
              }
              min={256}
              max={4096}
              step={256}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            Restaurar Padrão
          </Button>
          <Button onClick={handleSave}>Salvar Configurações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AISettingsDialog;
