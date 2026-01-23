/**
 * Language Selector Component
 * Enhanced multi-language support with 5 languages
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { languages, changeLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LanguageSelectorProps {
  variant?: 'default' | 'ghost' | 'outline';
  showLabel?: boolean;
  showFlag?: boolean;
  compact?: boolean;
  className?: string;
}

export function LanguageSelector({ 
  variant = 'ghost', 
  showLabel = false, 
  showFlag = true,
  compact = false,
  className 
}: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  
  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  const handleLanguageChange = (code: string) => {
    const lang = languages.find(l => l.code === code);
    changeLanguage(code);
    if (lang) {
      toast.success(t('language.changed', `Language changed to ${lang.name}`), {
        icon: <span className="text-lg">{lang.flag}</span>,
        duration: 2000,
      });
    }
  };

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={cn("h-9 w-9", className)}>
            <span className="text-lg">{currentLanguage.flag}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                "gap-2 cursor-pointer",
                lang.code === i18n.language && "bg-accent"
              )}
            >
              <span>{lang.flag}</span>
              <span className="flex-1 text-sm">{lang.name}</span>
              {lang.code === i18n.language && <Check className="h-3 w-3" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size="sm" 
          className={cn("gap-2 transition-all hover:scale-105", className)}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={currentLanguage.code}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="text-lg"
            >
              {showFlag && currentLanguage.flag}
            </motion.span>
          </AnimatePresence>
          {showLabel && <span className="hidden sm:inline">{currentLanguage.name}</span>}
          <Languages className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground font-normal">
          <Globe className="h-3 w-3" />
          {t('language.select', 'Select Language')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((lang) => {
          const isSelected = lang.code === i18n.language;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                "gap-3 cursor-pointer transition-colors",
                isSelected && "bg-accent"
              )}
            >
              <motion.span 
                className="text-lg"
                whileHover={{ scale: 1.2 }}
              >
                {lang.flag}
              </motion.span>
              <span className="flex-1">{lang.name}</span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Check className="h-4 w-4 text-primary" />
                </motion.div>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSelector;
