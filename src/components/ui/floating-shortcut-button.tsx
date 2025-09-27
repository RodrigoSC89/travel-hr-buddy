import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingShortcutButtonProps {
  icon: LucideIcon | React.ReactNode;
  onClick: () => void;
  label: string;
  bgColor?: string; // Tailwind classes from design system
  iconColor?: string; // Tailwind classes from design system
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  spinning?: boolean;
  tabIndex?: number;
  style?: React.CSSProperties;
}

export const FloatingShortcutButton: React.FC<FloatingShortcutButtonProps> = ({
  icon,
  onClick,
  label,
  bgColor = 'bg-azure-800 hover:bg-azure-900',
  iconColor = 'text-azure-50',
  size = 'lg',
  className,
  disabled = false,
  ariaLabel,
  spinning = false,
  tabIndex = 0,
  style
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  } as const;


  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  } as const;

  // Allow both Tailwind utility classes and raw colors (hex/rgb/hsl)
  const isRawColor = (v?: string) => !!v && (/^#|^rgb\(|^hsl\(|^var\(/i.test(v));

  const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) onClick();
    }
  };

  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement, {
        className: cn(iconSizes[size], spinning && 'animate-spin')
      });
    }
    const IconComp = icon as LucideIcon;
    return <IconComp className={cn(iconSizes[size], spinning && 'animate-spin')} />;
  };

  const mergedButtonStyle: React.CSSProperties = {
    ...style,
    ...(isRawColor(bgColor) ? { backgroundColor: bgColor as string } : {}),
  };

  const iconSpanStyle: React.CSSProperties | undefined = isRawColor(iconColor)
    ? { color: iconColor as string }
    : undefined;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            role="button"
            onClick={onClick}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-label={ariaLabel || label}
            tabIndex={tabIndex}
            style={mergedButtonStyle}
            className={cn(
              'pointer-events-auto cursor-pointer z-[9999]',
              sizeClasses[size],
              !isRawColor(bgColor) && bgColor,
              'rounded-full transition-transform duration-200',
              'shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95',
              'focus:outline-none focus:ring-4 focus:ring-azure-200 dark:focus:ring-azure-800',
              disabled && 'opacity-50 cursor-not-allowed transform-none hover:scale-100',
              className
            )}
          >
            <span className={cn(!isRawColor(iconColor) && iconColor)} style={iconSpanStyle}>{renderIcon()}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-azure-800 text-azure-50 border-azure-600">
          <p className="text-sm font-medium">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FloatingShortcutButton;
