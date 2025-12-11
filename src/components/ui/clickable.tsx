/**
 * Clickable Component - Elemento clicável acessível
 * Adiciona suporte automático a navegação por teclado
 * 
 * @author DeepAgent - Abacus.AI
 * @date 2025-12-11
 * @phase FASE 3.2
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ClickableProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Handler de click
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => void;
  
  /**
   * Label para screen readers (obrigatório se não houver texto visível)
   */
  'aria-label'?: string;
  
  /**
   * Desabilitar o elemento
   */
  disabled?: boolean;
  
  /**
   * Elemento HTML a ser renderizado (padrão: div)
   */
  as?: 'div' | 'span' | 'section' | 'article';
  
  /**
   * Role ARIA (padrão: button)
   */
  role?: string;
  
  /**
   * Children
   */
  children?: React.ReactNode;
}

/**
 * Componente Clickable - Torna qualquer elemento acessível por teclado
 * 
 * @example
 * ```tsx
 * <Clickable onClick={handleClick} aria-label="Abrir menu">
 *   <MenuIcon />
 * </Clickable>
 * ```
 */
export const Clickable = React.forwardRef<HTMLDivElement, ClickableProps>(
  (
    {
      onClick,
      'aria-label': ariaLabel,
      disabled = false,
      as: Component = 'div',
      role = 'button',
      className,
      children,
      tabIndex,
      ...props
    },
    ref
  ) => {
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      onClick?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      
      // Enter ou Espaço ativam o elemento
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick?.(event);
      }
    };

    return React.createElement(
      Component,
      {
        ref,
        role,
        tabIndex: disabled ? -1 : (tabIndex ?? 0),
        'aria-label': ariaLabel,
        'aria-disabled': disabled ? true : undefined,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        className: cn(
          'cursor-pointer select-none',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
          'transition-opacity',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        ),
        ...props,
      },
      children
    );
  }
);

Clickable.displayName = 'Clickable';

/**
 * ClickableCard - Card clicável acessível
 */
interface ClickableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  onClick?: (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => void;
  'aria-label'?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  hover?: boolean;
}

export const ClickableCard = React.forwardRef<HTMLDivElement, ClickableCardProps>(
  ({ hover = true, className, ...props }, ref) => {
    return (
      <Clickable
        ref={ref}
        role="button"
        className={cn(
          'rounded-lg border bg-card text-card-foreground shadow-sm',
          hover && 'hover:bg-accent hover:text-accent-foreground',
          'transition-all duration-200',
          className
        )}
        {...props}
      />
    );
  }
);

ClickableCard.displayName = 'ClickableCard';

/**
 * ClickableIcon - Ícone clicável acessível
 */
interface ClickableIconProps extends React.HTMLAttributes<HTMLButtonElement> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  'aria-label': string; // Obrigatório para ícones
  disabled?: boolean;
  children?: React.ReactNode;
}

export const ClickableIcon = React.forwardRef<HTMLButtonElement, ClickableIconProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'inline-flex items-center justify-center',
          'rounded-md p-2',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
          'transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ClickableIcon.displayName = 'ClickableIcon';

/**
 * ClickableListItem - Item de lista clicável acessível
 */
interface ClickableListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  onClick?: (event: React.MouseEvent<HTMLLIElement> | React.KeyboardEvent<HTMLLIElement>) => void;
  'aria-label'?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  selected?: boolean;
}

export const ClickableListItem = React.forwardRef<HTMLLIElement, ClickableListItemProps>(
  ({ onClick, disabled, selected, className, children, 'aria-label': ariaLabel, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLLIElement>) => {
      if (disabled) return;
      onClick?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>) => {
      if (disabled) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick?.(event);
      }
    };

    return (
      <li
        ref={ref}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel}
        aria-disabled={disabled}
        aria-selected={selected}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'cursor-pointer select-none',
          'px-4 py-2',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
          'transition-colors',
          selected && 'bg-accent text-accent-foreground',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </li>
    );
  }
);

ClickableListItem.displayName = 'ClickableListItem';

export default Clickable;
