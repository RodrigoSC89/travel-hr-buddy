/**
 * Skip Link Component - Navegação por Teclado
 * WCAG 2.1 AA Compliance
 */

import { Button } from "@/components/ui/button";

interface SkipLinkProps {
  targetId?: string;
  label?: string;
}

export function SkipLink({ 
  targetId = "main-content", 
  label = "Pular para o conteúdo principal" 
}: SkipLinkProps) {
  const handleClick = () => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Button
      onClick={handleClick}
      className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
      aria-label={label}
    >
      {label}
    </Button>
  );
}

export default SkipLink;
