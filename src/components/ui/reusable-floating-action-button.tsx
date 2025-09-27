import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  label: string;
  bgColor?: string;
  iconColor?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  isActive?: boolean;
  ariaLabel?: string;
  spinning?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon: Icon,
  onClick,
  label,
  bgColor = 'bg-gradient-to-r from-azure-600 to-azure-700 hover:from-azure-700 hover:to-azure-800',
  iconColor = 'text-azure-50',
  size = 'md',
  className,
  disabled = false,
  isActive = false,
  ariaLabel,
  spinning = false
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14', 
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel || label}
            className={cn(
              bgColor,
              iconColor,
              sizeClasses[size],
              'shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 rounded-full',
              'focus:outline-none focus:ring-4 focus:ring-azure-200 focus:ring-opacity-50',
              'dark:focus:ring-azure-800',
              isActive && 'ring-4 ring-azure-300 ring-opacity-75',
              disabled && 'opacity-50 cursor-not-allowed transform-none hover:scale-100',
              className
            )}
          >
            <Icon 
              className={cn(
                iconSizes[size],
                spinning && 'animate-spin'
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent 
          side="left" 
          className="bg-azure-800 text-azure-50 border-azure-600"
        >
          <p className="text-sm font-medium">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FloatingActionButton;