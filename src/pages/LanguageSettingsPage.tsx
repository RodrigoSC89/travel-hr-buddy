/**
 * Language Settings Page - Configurações de Idioma
 * Multi-idioma completo com PT-BR, EN-US, ES
 */
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Languages, Globe, Check, Download, RefreshCw,
  Calendar, Clock, DollarSign, Ruler
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/i18n";
import { toast } from "sonner";

const SUPPORTED_LANGUAGES = [
  { 
    code: "pt-BR", 
    name: "Português (Brasil)", 
    nativeName: "Português",
    flag: "🇧🇷",
    completion: 100 
  },
  { 
    code: "en-US", 
    name: "English (United States)", 
    nativeName: "English",
    flag: "🇺🇸",
    completion: 100 
  },
  { 
    code: "es-ES", 
    name: "Español (España)", 
    nativeName: "Español",
    flag: "🇪🇸",
    completion: 98 
  },
  { 
    code: "zh-CN", 
    name: "Chinese (Simplified)", 
    nativeName: "中文",
    flag: "🇨🇳",
    completion: 85 
  },
  { 
    code: "fr-FR", 
    name: "Français (France)", 
    nativeName: "Français",
    flag: "🇫🇷",
    completion: 90 
  },
  { 
    code: "de-DE", 
    name: "Deutsch (Deutschland)", 
    nativeName: "Deutsch",
    flag: "🇩🇪",
    completion: 88 
  },
  { 
    code: "ja-JP", 
    name: "Japanese", 
    nativeName: "日本語",
    flag: "🇯🇵",
    completion: 75 
  },
  { 
    code: "ko-KR", 
    name: "Korean", 
    nativeName: "한국어",
    flag: "🇰🇷",
    completion: 72 
  },
  { 
    code: "ar-SA", 
    name: "Arabic", 
    nativeName: "العربية",
    flag: "🇸🇦",
    completion: 65 
  },
  { 
    code: "it-IT", 
    name: "Italiano", 
    nativeName: "Italiano",
    flag: "🇮🇹",
    completion: 80 
  },
  { 
    code: "nl-NL", 
    name: "Nederlands", 
    nativeName: "Nederlands",
    flag: "🇳🇱",
    completion: 78 
  },
];

const DATE_FORMATS = [
  { value: "dd/MM/yyyy", label: "DD/MM/YYYY", example: "29/01/2026" },
  { value: "MM/dd/yyyy", label: "MM/DD/YYYY", example: "01/29/2026" },
  { value: "yyyy-MM-dd", label: "YYYY-MM-DD", example: "2026-01-29" },
  { value: "dd.MM.yyyy", label: "DD.MM.YYYY", example: "29.01.2026" },
];

const TIME_FORMATS = [
  { value: "24h", label: "24 horas", example: "14:30" },
  { value: "12h", label: "12 horas (AM/PM)", example: "2:30 PM" },
];

const CURRENCIES = [
  { value: "BRL", label: "Real Brasileiro (R$)", symbol: "R$" },
  { value: "USD", label: "US Dollar ($)", symbol: "$" },
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "GBP", label: "British Pound (£)", symbol: "£" },
];

const MEASUREMENT_SYSTEMS = [
  { value: "metric", label: "Métrico", examples: "km, kg, °C" },
  { value: "imperial", label: "Imperial", examples: "mi, lb, °F" },
  { value: "nautical", label: "Náutico", examples: "nmi, knots, fathoms" },
];

export default function LanguageSettingsPage() {
  const { i18n, t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = React.useState(i18n.language || "pt-BR");
  const [dateFormat, setDateFormat] = React.useState("dd/MM/yyyy");
  const [timeFormat, setTimeFormat] = React.useState("24h");
  const [currency, setCurrency] = React.useState("BRL");
  const [measurementSystem, setMeasurementSystem] = React.useState("metric");
  const [autoDetect, setAutoDetect] = React.useState(true);
  const [offlineLanguages, setOfflineLanguages] = React.useState<string[]>(["pt-BR", "en-US"]);

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    i18n.changeLanguage(langCode);
    localStorage.setItem("preferredLanguage", langCode);
    toast.success(`Idioma alterado para ${SUPPORTED_LANGUAGES.find(l => l.code === langCode)?.nativeName}`);
  };

  const handleDownloadLanguage = (langCode: string) => {
    // Mock download
    setOfflineLanguages([...offlineLanguages, langCode]);
    toast.success(`Pacote de idioma ${langCode} baixado para uso offline`);
  };

  const handleRemoveLanguage = (langCode: string) => {
    if (langCode === "pt-BR" || langCode === "en-US") {
      toast.error("Idiomas base não podem ser removidos");
      return;
    }
    setOfflineLanguages(offlineLanguages.filter(l => l !== langCode));
    toast.success(`Pacote de idioma ${langCode} removido`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Languages className="h-8 w-8 text-primary" />
            Idioma e Regionalização
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure idioma, formato de data, moeda e unidades de medida
          </p>
        </div>
        <LanguageSwitcher />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Selection */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Idioma do Sistema
            </CardTitle>
            <CardDescription>
              Selecione o idioma principal da interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label>Detecção Automática</Label>
                <p className="text-sm text-muted-foreground">
                  Detectar idioma do navegador automaticamente
                </p>
              </div>
              <Switch checked={autoDetect} onCheckedChange={setAutoDetect} />
            </div>
            
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`
                    relative p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${selectedLanguage === lang.code 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="flex-1">
                      <p className="font-medium">{lang.nativeName}</p>
                      <p className="text-xs text-muted-foreground">{lang.name}</p>
                    </div>
                    {selectedLanguage === lang.code && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-16 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${lang.completion}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{lang.completion}%</span>
                    </div>
                    
                    {offlineLanguages.includes(lang.code) ? (
                      <Badge variant="secondary" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Offline
                      </Badge>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadLanguage(lang.code);
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Date & Time Format */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Formato de Data e Hora
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Formato de Data</Label>
              <RadioGroup value={dateFormat} onValueChange={setDateFormat}>
                {DATE_FORMATS.map((format) => (
                  <div key={format.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={format.value} id={format.value} />
                      <Label htmlFor={format.value}>{format.label}</Label>
                    </div>
                    <span className="text-sm text-muted-foreground">{format.example}</span>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Formato de Hora</Label>
              <RadioGroup value={timeFormat} onValueChange={setTimeFormat}>
                {TIME_FORMATS.map((format) => (
                  <div key={format.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={format.value} id={`time-${format.value}`} />
                      <Label htmlFor={`time-${format.value}`}>{format.label}</Label>
                    </div>
                    <span className="text-sm text-muted-foreground">{format.example}</span>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Currency & Measurement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Moeda e Unidades
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Moeda Padrão</Label>
              <RadioGroup value={currency} onValueChange={setCurrency}>
                {CURRENCIES.map((curr) => (
                  <div key={curr.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={curr.value} id={curr.value} />
                      <Label htmlFor={curr.value}>{curr.label}</Label>
                    </div>
                    <span className="font-mono text-muted-foreground">{curr.symbol}</span>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Sistema de Medidas
              </Label>
              <RadioGroup value={measurementSystem} onValueChange={setMeasurementSystem}>
                {MEASUREMENT_SYSTEMS.map((system) => (
                  <div key={system.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={system.value} id={`measure-${system.value}`} />
                      <Label htmlFor={`measure-${system.value}`}>{system.label}</Label>
                    </div>
                    <span className="text-sm text-muted-foreground">{system.examples}</span>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Pré-visualização</CardTitle>
          <CardDescription>Veja como suas configurações serão aplicadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Data</p>
              <p className="font-medium">
                {dateFormat === "dd/MM/yyyy" ? "29/01/2026" :
                 dateFormat === "MM/dd/yyyy" ? "01/29/2026" :
                 dateFormat === "yyyy-MM-dd" ? "2026-01-29" : "29.01.2026"}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Hora</p>
              <p className="font-medium">
                {timeFormat === "24h" ? "14:30" : "2:30 PM"}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Moeda</p>
              <p className="font-medium">
                {currency === "BRL" ? "R$ 1.234,56" :
                 currency === "USD" ? "$1,234.56" :
                 currency === "EUR" ? "€1.234,56" : "£1,234.56"}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Distância</p>
              <p className="font-medium">
                {measurementSystem === "metric" ? "100 km" :
                 measurementSystem === "imperial" ? "62.14 mi" : "54 nmi"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancelar</Button>
        <Button onClick={() => toast.success("Configurações salvas com sucesso!")}>
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
