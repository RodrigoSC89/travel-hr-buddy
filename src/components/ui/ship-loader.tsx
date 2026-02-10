/**
 * NAUTI ONE — Ship Loader Animation
 * Animated ship sailing on waves, replacing the default spinner.
 * Sizes: sm (inline), md (sections), lg (full-page)
 */

import React from 'react';

interface ShipLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function ShipLoader({ size = 'md', label, className = '' }: ShipLoaderProps) {
  const dims = {
    sm: { ship: 24, wave: 60, container: 'py-2' },
    md: { ship: 40, wave: 100, container: 'py-8' },
    lg: { ship: 56, wave: 140, container: 'py-12' },
  }[size];

  return (
    <div 
      className={`flex flex-col items-center justify-center gap-2 ${dims.container} ${className}`}
      data-testid="loading-state"
      role="status"
      aria-label={label || 'Carregando...'}
    >
      <div className="ship-loader" style={{ width: dims.wave, height: dims.ship + 16 }}>
        {/* Ship SVG */}
        <svg
          className="ship-sailing"
          width={dims.ship}
          height={dims.ship}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'relative', zIndex: 2 }}
        >
          {/* Hull */}
          <path
            d="M8 42 L16 54 L48 54 L56 42 Z"
            fill="hsl(var(--primary))"
            opacity="0.9"
          />
          {/* Deck */}
          <rect x="20" y="36" width="24" height="6" rx="1" fill="hsl(var(--primary))" opacity="0.7" />
          {/* Bridge */}
          <rect x="26" y="28" width="12" height="8" rx="1" fill="hsl(var(--primary))" opacity="0.8" />
          {/* Smokestack */}
          <rect x="30" y="18" width="4" height="10" rx="1" fill="hsl(var(--primary))" opacity="0.6" />
          {/* Smoke puffs */}
          <circle className="smoke smoke-1" cx="32" cy="14" r="3" fill="hsl(var(--muted-foreground))" opacity="0.3" />
          <circle className="smoke smoke-2" cx="28" cy="10" r="2.5" fill="hsl(var(--muted-foreground))" opacity="0.2" />
          <circle className="smoke smoke-3" cx="35" cy="8" r="2" fill="hsl(var(--muted-foreground))" opacity="0.15" />
          {/* Port windows */}
          <circle cx="24" cy="46" r="2" fill="hsl(var(--primary-foreground))" opacity="0.6" />
          <circle cx="32" cy="46" r="2" fill="hsl(var(--primary-foreground))" opacity="0.6" />
          <circle cx="40" cy="46" r="2" fill="hsl(var(--primary-foreground))" opacity="0.6" />
        </svg>

        {/* Waves */}
        <svg
          className="ocean-waves"
          width={dims.wave}
          height="16"
          viewBox={`0 0 ${dims.wave} 16`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'relative', zIndex: 1, marginTop: -10 }}
        >
          <path
            className="wave wave-1"
            d={`M0 8 Q${dims.wave * 0.125} 2, ${dims.wave * 0.25} 8 T${dims.wave * 0.5} 8 T${dims.wave * 0.75} 8 T${dims.wave} 8 T${dims.wave * 1.25} 8 T${dims.wave * 1.5} 8`}
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />
          <path
            className="wave wave-2"
            d={`M0 12 Q${dims.wave * 0.125} 6, ${dims.wave * 0.25} 12 T${dims.wave * 0.5} 12 T${dims.wave * 0.75} 12 T${dims.wave} 12 T${dims.wave * 1.25} 12 T${dims.wave * 1.5} 12`}
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.3"
          />
        </svg>
      </div>

      {label && (
        <p className={`text-muted-foreground ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
          {label}
        </p>
      )}

      <style>{`
        .ship-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow: hidden;
        }

        .ship-sailing {
          animation: ship-bob 2s ease-in-out infinite, ship-sail 6s linear infinite;
        }

        @keyframes ship-bob {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-4px) rotate(2deg); }
        }

        @keyframes ship-sail {
          0% { transform: translateX(-10px) translateY(0) rotate(-2deg); }
          25% { transform: translateX(0px) translateY(-4px) rotate(2deg); }
          50% { transform: translateX(10px) translateY(0) rotate(-2deg); }
          75% { transform: translateX(0px) translateY(-4px) rotate(2deg); }
          100% { transform: translateX(-10px) translateY(0) rotate(-2deg); }
        }

        .wave {
          animation: wave-flow 2s linear infinite;
        }

        .wave-2 {
          animation-delay: -0.5s;
          animation-duration: 2.5s;
        }

        @keyframes wave-flow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33%); }
        }

        .smoke {
          animation: smoke-rise 2.5s ease-out infinite;
        }

        .smoke-1 { animation-delay: 0s; }
        .smoke-2 { animation-delay: 0.8s; }
        .smoke-3 { animation-delay: 1.6s; }

        @keyframes smoke-rise {
          0% { opacity: 0.3; transform: translateY(0) scale(1); }
          50% { opacity: 0.15; }
          100% { opacity: 0; transform: translateY(-12px) scale(1.5); }
        }
      `}</style>
    </div>
  );
}
