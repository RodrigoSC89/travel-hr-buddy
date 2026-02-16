/**
 * LanguageSelector v2 — compact dropdown with persistence feedback
 * Uses the unified i18n config from src/i18n/index.ts
 */
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { languages } from '@/i18n';

interface LanguageSelectorProps {
  variant?: 'ghost' | 'outline';
  size?: 'sm' | 'icon';
}

export function LanguageSelector({ variant = 'ghost', size = 'sm' }: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const current = languages.find((l) => l.code === i18n.language) || languages[0];

  const handleChange = (code: string) => {
    if (code === i18n.language) return;
    const lang = languages.find(l => l.code === code);
    i18n.changeLanguage(code);
    if (lang) {
      toast.success(`${lang.flag} ${lang.name}`, { description: 'Language updated', duration: 2000 });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-1.5 text-xs h-9 cursor-pointer">
          <Globe className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{current.flag} {current.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px] max-h-[360px] overflow-y-auto">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={`cursor-pointer ${i18n.language === lang.code ? 'bg-accent font-medium' : ''}`}
          >
            <span className="mr-2 text-base">{lang.flag}</span>
            <span className="flex-1">{lang.name}</span>
            {i18n.language === lang.code && <Check className="h-3.5 w-3.5 text-primary ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
