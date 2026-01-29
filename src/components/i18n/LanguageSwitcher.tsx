/**
 * Language Switcher Component
 * Allows users to change the application language
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { languages, changeLanguage, getCurrentLanguage } from '@/i18n';

interface LanguageSwitcherProps {
  variant?: 'icon' | 'full';
  className?: string;
}

export function LanguageSwitcher({ variant = 'icon', className = '' }: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const currentLang = getCurrentLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={variant === 'icon' ? 'icon' : 'sm'} className={className}>
          {variant === 'icon' ? (
            <span className="text-lg">{currentLang.flag}</span>
          ) : (
            <>
              <span className="text-lg mr-2">{currentLang.flag}</span>
              <span className="hidden sm:inline">{currentLang.name}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`flex items-center gap-2 ${
              currentLang.code === lang.code ? 'bg-accent' : ''
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
            {currentLang.code === lang.code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;
