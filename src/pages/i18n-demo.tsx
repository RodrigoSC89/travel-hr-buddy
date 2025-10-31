/**
 * PATCH 571-575 - i18n Translation Demo
 * Demonstração do sistema de tradução multilíngue
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation, useLanguageSwitcher, useDateFormatter, useNumberFormatter } from "@/core/i18n/ui-hooks";
import { Globe, Check } from "lucide-react";

export default function I18nDemo() {
  const { t, language, isLoading } = useTranslation();
  const { switchLanguage, availableLanguages } = useLanguageSwitcher();
  const { formatDate } = useDateFormatter();
  const { formatNumber, formatCurrency } = useNumberFormatter();
  
  const [testResults, setTestResults] = useState<string[]>([]);

  const runTests = () => {
    const results = [
      `✅ Current Language: ${language}`,
      `✅ Common.welcome: ${t("common.welcome")}`,
      `✅ Common.loading: ${t("common.loading")}`,
      `✅ Common.success: ${t("common.success")}`,
      `✅ Navigation.dashboard: ${t("navigation.dashboard")}`,
      `✅ Maritime.vessel: ${t("maritime.vessel")}`,
      `✅ Date formatting: ${formatDate(new Date())}`,
      `✅ Number formatting: ${formatNumber(12345.67)}`,
      `✅ Currency formatting: ${formatCurrency(1234.56)}`,
    ];
    setTestResults(results);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="w-8 h-8" />
            i18n Translation System Demo
          </h1>
          <p className="text-muted-foreground">
            PATCH 571-575: Sistema de Tradução Multilíngue em Tempo Real
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Current: {language.toUpperCase()}
        </Badge>
      </div>

      {/* Language Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Language Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {availableLanguages.map((lang) => (
              <Button
                key={lang}
                onClick={() => switchLanguage(lang)}
                variant={language === lang ? "default" : "outline"}
                className="min-w-[100px]"
              >
                {lang === "pt" && "🇧🇷 Português"}
                {lang === "en" && "🇺🇸 English"}
                {lang === "es" && "🇪🇸 Español"}
                {lang === "fr" && "🇫🇷 Français"}
                {lang === "de" && "🇩🇪 Deutsch"}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Translation Hook */}
      <Card>
        <CardHeader>
          <CardTitle>useTranslation() Hook Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runTests} disabled={isLoading}>
            {isLoading ? t("common.loading") : "Run Translation Tests"}
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center gap-2 text-sm font-mono">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{result}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Translation Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Translation Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Common Translations</h3>
              <ul className="space-y-1 text-sm">
                <li>• {t("common.welcome")}</li>
                <li>• {t("common.loading")}</li>
                <li>• {t("common.error")}</li>
                <li>• {t("common.success")}</li>
                <li>• {t("common.save")}</li>
                <li>• {t("common.cancel")}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Navigation</h3>
              <ul className="space-y-1 text-sm">
                <li>• {t("navigation.dashboard")}</li>
                <li>• {t("navigation.reports")}</li>
                <li>• {t("navigation.settings")}</li>
                <li>• {t("navigation.profile")}</li>
                <li>• {t("navigation.help")}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Maritime</h3>
              <ul className="space-y-1 text-sm">
                <li>• {t("maritime.vessel")}</li>
                <li>• {t("maritime.fleet")}</li>
                <li>• {t("maritime.compliance")}</li>
                <li>• {t("maritime.mission_control")}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">AI & Feedback</h3>
              <ul className="space-y-1 text-sm">
                <li>• {t("ai.cognitive_feedback")}</li>
                <li>• {t("ai.weekly_report")}</li>
                <li>• {t("ai.insights")}</li>
                <li>• {t("ai.patterns")}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date & Number Formatting */}
      <Card>
        <CardHeader>
          <CardTitle>Date & Number Formatting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Date Formats</h3>
              <ul className="space-y-1 text-sm">
                <li>• Short: {formatDate(new Date(), "short")}</li>
                <li>• Long: {formatDate(new Date(), "long")}</li>
                <li>• Full: {formatDate(new Date(), "full")}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Number Formats</h3>
              <ul className="space-y-1 text-sm">
                <li>• Number: {formatNumber(12345.67)}</li>
                <li>• Currency (USD): {formatCurrency(1234.56, "USD")}</li>
                <li>• Currency (EUR): {formatCurrency(1234.56, "EUR")}</li>
                <li>• Percentage: {formatNumber(0.8567, { style: "percent" })}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>System Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5" />
              <span><strong>5 Languages:</strong> Portuguese, English, Spanish, French, German</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5" />
              <span><strong>3-Tier Cache:</strong> Memory → IndexedDB → Supabase</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5" />
              <span><strong>AI Fallback:</strong> JSON → AI Translation → Key Fallback</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5" />
              <span><strong>Auto Detection:</strong> Detects browser language automatically</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5" />
              <span><strong>Persistence:</strong> Stores user language preference</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5" />
              <span><strong>Batch Translation:</strong> Optimized for multiple keys</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5" />
              <span><strong>Localized Messages:</strong> Watchdog and alerts in multiple languages</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5" />
              <span><strong>Dashboard:</strong> Monitor usage and feedback at /dashboard/i18n</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
            {`// 1. Import the hook
import { useTranslation } from '@/core/i18n/ui-hooks';

// 2. Use in your component
function MyComponent() {
  const { t, language, setLanguage } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>Current language: {language}</p>
      <button onClick={() => setLanguage('pt')}>
        Switch to Portuguese
      </button>
    </div>
  );
}

// 3. For date/number formatting
import { useDateFormatter, useNumberFormatter } from '@/core/i18n/ui-hooks';

const { formatDate } = useDateFormatter();
const { formatCurrency } = useNumberFormatter();

console.log(formatDate(new Date()));
console.log(formatCurrency(1234.56, 'USD'));`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
