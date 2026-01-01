/**
 * PageLayoutV2 - Layout Padronizado para Módulos V2
 * ETAPA 2: Componentes V2 - NÃO SUBSTITUI layouts existentes
 * 
 * Uso:
 * <PageLayoutV2 title="Meu Módulo" icon={Ship}>
 *   <MeuConteudo />
 * </PageLayoutV2>
 */

import React, { ReactNode } from 'react';
import { LucideIcon, ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

export interface PageLayoutV2Props {
  children: ReactNode;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  showBreadcrumbs?: boolean;
  variant?: 'default' | 'compact' | 'wide' | 'full';
}

export function PageLayoutV2({
  children,
  title,
  subtitle,
  icon: Icon,
  actions,
  breadcrumbs,
  className,
  headerClassName,
  contentClassName,
  showBreadcrumbs = true,
  variant = 'default',
}: PageLayoutV2Props) {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from path if not provided
  const autoBreadcrumbs = React.useMemo(() => {
    if (breadcrumbs) return breadcrumbs;
    
    const pathParts = location.pathname.split('/').filter(Boolean);
    return pathParts.map((part, index) => ({
      label: part.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      href: index < pathParts.length - 1 ? `/${pathParts.slice(0, index + 1).join('/')}` : undefined,
    }));
  }, [location.pathname, breadcrumbs]);

  const variantStyles = {
    default: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    compact: 'max-w-5xl mx-auto px-4 sm:px-6',
    wide: 'max-w-full px-4 sm:px-6 lg:px-8',
    full: 'w-full',
  };

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Header Section */}
      <header className={cn(
        'sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40',
        headerClassName
      )}>
        <div className={variantStyles[variant]}>
          {/* Breadcrumbs */}
          {showBreadcrumbs && autoBreadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1 py-2 text-sm text-muted-foreground overflow-x-auto">
              <Link 
                to="/central-comando" 
                className="flex items-center hover:text-foreground transition-colors"
              >
                <Home className="h-4 w-4" />
              </Link>
              {autoBreadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  {crumb.href ? (
                    <Link 
                      to={crumb.href}
                      className="hover:text-foreground transition-colors whitespace-nowrap"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium whitespace-nowrap">
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          
          {/* Title Row */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            {/* Actions */}
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn(variantStyles[variant], 'py-6', contentClassName)}>
        {children}
      </main>
    </div>
  );
}

export default PageLayoutV2;
