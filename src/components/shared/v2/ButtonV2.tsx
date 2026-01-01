/**
 * ButtonV2 - Botões Padronizados V2
 * ETAPA 2: Componentes V2 - NÃO SUBSTITUI botões existentes
 */

import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';

export interface ButtonV2Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning' | 'ai';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  // Toast feedback
  feedbackOnClick?: boolean;
  feedbackMessage?: string;
  feedbackType?: 'success' | 'info' | 'warning' | 'error';
}

export const ButtonV2 = forwardRef<HTMLButtonElement, ButtonV2Props>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      loading = false,
      loadingText,
      fullWidth = false,
      feedbackOnClick = false,
      feedbackMessage,
      feedbackType = 'info',
      className,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10',
    };

    const variantStyles = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      success: 'bg-green-600 text-white hover:bg-green-700',
      warning: 'bg-yellow-500 text-black hover:bg-yellow-600',
      ai: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700',
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (feedbackOnClick && feedbackMessage) {
        const toastFn = {
          success: toast.success,
          info: toast.info,
          warning: toast.warning,
          error: toast.error,
        }[feedbackType];
        toastFn(feedbackMessage);
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md font-medium',
          'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          sizeStyles[size],
          variantStyles[variant],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText || 'Carregando...'}
          </>
        ) : (
          <>
            {Icon && iconPosition === 'left' && <Icon className="h-4 w-4" />}
            {children}
            {Icon && iconPosition === 'right' && <Icon className="h-4 w-4" />}
          </>
        )}
      </button>
    );
  }
);

ButtonV2.displayName = 'ButtonV2';

// ============= Icon Button V2 =============
export interface IconButtonV2Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const IconButtonV2 = forwardRef<HTMLButtonElement, IconButtonV2Props>(
  ({ icon: Icon, label, variant = 'ghost', size = 'md', loading, className, ...props }, ref) => {
    const sizeStyles = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
    };

    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={cn(
          'inline-flex items-center justify-center rounded-md',
          'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'hover:bg-accent hover:text-accent-foreground',
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
        ) : (
          <Icon className={iconSizes[size]} />
        )}
      </button>
    );
  }
);

IconButtonV2.displayName = 'IconButtonV2';

export default ButtonV2;
