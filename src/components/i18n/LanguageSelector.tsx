/**
 * PATCH 839: Language Selector Component
 * Easy language switching for global users
 */

import React from "react";
import { motion } from "framer-motion";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslation, SupportedLanguage } from "@/lib/i18n/translation-manager";
import { cn } from "@/lib/utils";

const languageFlags: Record<SupportedLanguage, string> = {
  "pt-BR": "🇧🇷",
  "en-US": "🇺🇸",
  "es-ES": "🇪🇸",
  "fr-FR": "🇫🇷",
  "zh-CN": "🇨🇳",
};

interface LanguageSelectorProps {
  variant?: "icon" | "full";
  className?: string;
}

export const LanguageSelector = memo(function({ variant = "icon", className }: LanguageSelectorProps) {
  const { language, changeLanguage, languages } = useTranslation();

  const currentLang = languages.find(l => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={variant === "icon" ? "icon" : "sm"}
          className={cn(
            "gap-2",
            variant === "full" && "min-w-[140px] justify-start",
            className
          )}
        >
          <Globe className="w-4 h-4" />
          {variant === "full" && (
            <>
              <span className="text-lg">{languageFlags[language]}</span>
              <span className="text-sm">{currentLang?.name}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handlechangeLanguage}
            className="flex items-center gap-3 cursor-pointer"
          >
            <span className="text-xl">{languageFlags[lang.code]}</span>
            <span className="flex-1">{lang.name}</span>
            {language === lang.code && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Check className="w-4 h-4 text-primary" />
              </motion.div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for mobile
export const LanguageSelectorCompact = memo(function() {
  const { language, changeLanguage, languages } = useTranslation();

  return (
    <div className="flex gap-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handlechangeLanguage}
          className={cn(
            "p-2 rounded-lg transition-colors text-lg",
            language === lang.code
              ? "bg-primary/10 ring-2 ring-primary"
              : "hover:bg-muted"
          )}
          title={lang.name}
        >
          {languageFlags[lang.code]}
        </button>
      ))}
    </div>
  );
}
