/**
 * Accessibility Settings Panel
 * WCAG AAA - User preference controls for contrast, motion, and font size
 */

import React from 'react';
import { Eye, ZoomIn, Sparkles, Monitor } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useHighContrastTheme } from '@/hooks/useHighContrastTheme';
import { cn } from '@/lib/utils';

interface AccessibilityPanelProps {
  className?: string;
}

export function AccessibilityPanel({ className }: AccessibilityPanelProps) {
  const { isHighContrast, toggleHighContrast } = useHighContrastTheme();
  const [fontSize, setFontSize] = React.useState(() => {
    const stored = localStorage.getItem('nautilus-font-size');
    return stored ? parseInt(stored, 10) : 100;
  });
  const [reducedMotion, setReducedMotion] = React.useState(() => {
    return localStorage.getItem('nautilus-reduced-motion') === 'true';
  });

  React.useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem('nautilus-font-size', String(fontSize));
  }, [fontSize]);

  React.useEffect(() => {
    if (reducedMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
    localStorage.setItem('nautilus-reduced-motion', String(reducedMotion));
  }, [reducedMotion]);

  return (
    <div
      className={cn(
        "space-y-5 p-4 rounded-xl border border-border bg-card",
        className
      )}
      role="region"
      aria-label="Configurações de acessibilidade"
    >
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Eye className="h-4 w-4" aria-hidden="true" />
        Acessibilidade
      </h3>

      {/* High Contrast */}
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="high-contrast" className="flex items-center gap-2 text-sm cursor-pointer">
          <Monitor className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Alto contraste
        </Label>
        <Switch
          id="high-contrast"
          checked={isHighContrast}
          onCheckedChange={toggleHighContrast}
          aria-describedby="hc-desc"
        />
      </div>
      <p id="hc-desc" className="text-xs text-muted-foreground -mt-3">
        Aumenta contraste para 7:1+ (WCAG AAA)
      </p>

      {/* Reduced Motion */}
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="reduced-motion" className="flex items-center gap-2 text-sm cursor-pointer">
          <Sparkles className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Reduzir animações
        </Label>
        <Switch
          id="reduced-motion"
          checked={reducedMotion}
          onCheckedChange={setReducedMotion}
          aria-describedby="rm-desc"
        />
      </div>
      <p id="rm-desc" className="text-xs text-muted-foreground -mt-3">
        Desativa animações e transições
      </p>

      {/* Font Size */}
      <div className="space-y-2">
        <Label htmlFor="font-size" className="flex items-center gap-2 text-sm">
          <ZoomIn className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Tamanho da fonte: {fontSize}%
        </Label>
        <Slider
          id="font-size"
          min={80}
          max={150}
          step={10}
          value={[fontSize]}
          onValueChange={([v]) => setFontSize(v)}
          aria-label={`Tamanho da fonte: ${fontSize}%`}
          aria-valuemin={80}
          aria-valuemax={150}
          aria-valuenow={fontSize}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground" aria-hidden="true">
          <span>80%</span>
          <span>100%</span>
          <span>150%</span>
        </div>
      </div>
    </div>
  );
}

export default AccessibilityPanel;
