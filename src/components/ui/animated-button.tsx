/**
 * Animated Button Component
 * PATCH 860: UX Polimento Final - Botões com feedback tátil
 */

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Button, ButtonProps } from './button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface AnimatedButtonProps extends ButtonProps {
  loading?: boolean;
  success?: boolean;
  ripple?: boolean;
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ loading, success, ripple = true, className, children, disabled, onClick, ...props }, ref) => {
    const [rippleStyle, setRippleStyle] = React.useState<{
      x: number;
      y: number;
      show: boolean;
    }>({ x: 0, y: 0, show: false });

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !disabled && !loading) {
        const rect = e.currentTarget.getBoundingClientRect();
        setRippleStyle({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          show: true,
        });
        setTimeout(() => setRippleStyle(prev => ({ ...prev, show: false })), 600);
      }
      onClick?.(e);
    };

    return (
      <motion.div
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Button
          ref={ref}
          disabled={disabled || loading}
          onClick={handleClick}
          className={cn(
            'relative overflow-hidden',
            success && 'bg-green-500 hover:bg-green-600',
            className
          )}
          {...props}
        >
          {/* Ripple effect */}
          {rippleStyle.show && (
            <span
              className="absolute rounded-full bg-white/30 animate-[ripple_0.6s_ease-out]"
              style={{
                left: rippleStyle.x - 50,
                top: rippleStyle.y - 50,
                width: 100,
                height: 100,
              }}
            />
          )}
          
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Carregando...
            </>
          ) : (
            children
          )}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

export default AnimatedButton;
