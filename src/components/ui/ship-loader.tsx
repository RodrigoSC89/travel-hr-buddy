/**
 * NAUTI ONE — Cinematic Ship Loader
 * Premium maritime loading animation with detailed vessel,
 * layered ocean waves, foam particles, and ambient glow.
 */

import React from 'react';

interface ShipLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function ShipLoader({ size = 'md', label, className = '' }: ShipLoaderProps) {
  const dims = {
    sm: { w: 120, h: 80, shipScale: 0.45, text: 'text-xs' },
    md: { w: 200, h: 120, shipScale: 0.7, text: 'text-sm' },
    lg: { w: 320, h: 180, shipScale: 1, text: 'text-base' },
  }[size];

  const id = React.useId().replace(/:/g, '');

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      data-testid="loading-state"
      role="status"
      aria-label={label || 'Carregando...'}
    >
      <div className="ship-loader-cinematic" style={{ width: dims.w, height: dims.h }}>
        <svg
          width={dims.w}
          height={dims.h}
          viewBox="0 0 320 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Ocean gradient */}
            <linearGradient id={`${id}-ocean`} x1="0" y1="100" x2="0" y2="180">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.03" />
            </linearGradient>

            {/* Ship hull gradient */}
            <linearGradient id={`${id}-hull`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
            </linearGradient>

            {/* Superstructure gradient */}
            <linearGradient id={`${id}-super`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.85" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            </linearGradient>

            {/* Glow filter */}
            <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Water reflection filter */}
            <filter id={`${id}-reflect`} x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2" />
            </filter>

            {/* Ambient glow */}
            <radialGradient id={`${id}-ambient`} cx="50%" cy="55%" r="45%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient background glow */}
          <ellipse cx="160" cy="110" rx="140" ry="60" fill={`url(#${id}-ambient)`} />

          {/* === SHIP GROUP (animated) === */}
          <g className="ship-group">
            {/* Water reflection of ship (blurred, flipped) */}
            <g className="ship-reflection" filter={`url(#${id}-reflect)`} opacity="0.15" transform="translate(160, 230) scale(1, -0.4) translate(-160, -115)">
              <path d="M120 120 L132 138 L188 138 L200 120 Z" fill="hsl(var(--primary))" />
              <rect x="145" y="108" width="30" height="12" rx="2" fill="hsl(var(--primary))" />
            </g>

            {/* Smoke/exhaust particles */}
            <circle className="smoke-p smoke-p1" cx="163" cy="68" r="4" fill="hsl(var(--muted-foreground))" opacity="0" />
            <circle className="smoke-p smoke-p2" cx="158" cy="60" r="3.5" fill="hsl(var(--muted-foreground))" opacity="0" />
            <circle className="smoke-p smoke-p3" cx="168" cy="55" r="3" fill="hsl(var(--muted-foreground))" opacity="0" />
            <circle className="smoke-p smoke-p4" cx="155" cy="50" r="2.5" fill="hsl(var(--muted-foreground))" opacity="0" />

            {/* Smokestack */}
            <rect x="157" y="72" width="6" height="16" rx="1.5" fill="hsl(var(--primary))" opacity="0.7" />
            <rect x="158.5" y="70" width="3" height="4" rx="1" fill="hsl(var(--destructive))" opacity="0.6" />

            {/* Mast */}
            <line x1="160" y1="68" x2="160" y2="56" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.5" />
            {/* Navigation light */}
            <circle className="nav-light" cx="160" cy="55" r="2" fill="hsl(var(--accent))" opacity="0.8" />

            {/* Bridge / Wheelhouse */}
            <rect x="148" y="88" width="24" height="14" rx="3" fill={`url(#${id}-super)`} />
            {/* Bridge windows */}
            <rect x="151" y="91" width="4" height="3" rx="0.8" fill="hsl(var(--primary-foreground))" opacity="0.7" />
            <rect x="158" y="91" width="4" height="3" rx="0.8" fill="hsl(var(--primary-foreground))" opacity="0.7" />
            <rect x="165" y="91" width="4" height="3" rx="0.8" fill="hsl(var(--primary-foreground))" opacity="0.7" />
            {/* Bridge roof */}
            <rect x="146" y="86" width="28" height="3" rx="1.5" fill="hsl(var(--primary))" opacity="0.5" />

            {/* Deck / Superstructure */}
            <rect x="136" y="102" width="48" height="8" rx="2" fill="hsl(var(--primary))" opacity="0.65" />
            {/* Deck details */}
            <rect x="138" y="104" width="6" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.4" />
            <rect x="177" y="104" width="6" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.4" />

            {/* Hull */}
            <path
              d="M116 112 L126 134 L130 136 L190 136 L194 134 L204 112 Z"
              fill={`url(#${id}-hull)`}
            />
            {/* Waterline stripe */}
            <path
              d="M120 128 L124 134 L130 136 L190 136 L196 134 L200 128 Z"
              fill="hsl(var(--destructive))"
              opacity="0.35"
            />
            {/* Hull highlight */}
            <path
              d="M120 112 L204 112 L200 120 L120 120 Z"
              fill="hsl(var(--primary-foreground))"
              opacity="0.08"
            />

            {/* Portholes */}
            <circle cx="138" cy="122" r="2.5" fill="hsl(var(--background))" opacity="0.3" />
            <circle className="porthole-glow" cx="138" cy="122" r="1.8" fill="hsl(var(--accent))" opacity="0.5" />
            <circle cx="150" cy="122" r="2.5" fill="hsl(var(--background))" opacity="0.3" />
            <circle className="porthole-glow" cx="150" cy="122" r="1.8" fill="hsl(var(--accent))" opacity="0.5" />
            <circle cx="162" cy="122" r="2.5" fill="hsl(var(--background))" opacity="0.3" />
            <circle className="porthole-glow" cx="162" cy="122" r="1.8" fill="hsl(var(--accent))" opacity="0.5" />
            <circle cx="174" cy="122" r="2.5" fill="hsl(var(--background))" opacity="0.3" />
            <circle className="porthole-glow" cx="174" cy="122" r="1.8" fill="hsl(var(--accent))" opacity="0.5" />
            <circle cx="186" cy="122" r="2.5" fill="hsl(var(--background))" opacity="0.3" />
            <circle className="porthole-glow" cx="186" cy="122" r="1.8" fill="hsl(var(--accent))" opacity="0.5" />

            {/* Bow spray particles */}
            <circle className="spray spray-1" cx="112" cy="130" r="1.5" fill="hsl(var(--primary-foreground))" opacity="0" />
            <circle className="spray spray-2" cx="108" cy="126" r="1" fill="hsl(var(--primary-foreground))" opacity="0" />
            <circle className="spray spray-3" cx="114" cy="124" r="1.2" fill="hsl(var(--primary-foreground))" opacity="0" />
          </g>

          {/* === OCEAN WAVES === */}
          {/* Wave layer 1 - Main wave */}
          <path
            className="wave-main"
            d="M-40 135 Q0 125, 40 135 T120 135 T200 135 T280 135 T360 135 T440 135"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />
          {/* Ocean fill below wave 1 */}
          <path
            className="wave-fill-1"
            d="M-40 135 Q0 125, 40 135 T120 135 T200 135 T280 135 T360 135 T440 135 V180 H-40 Z"
            fill={`url(#${id}-ocean)`}
            opacity="0.6"
          />

          {/* Wave layer 2 */}
          <path
            className="wave-mid"
            d="M-60 142 Q-20 134, 20 142 T100 142 T180 142 T260 142 T340 142 T420 142"
            stroke="hsl(var(--primary))"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            opacity="0.3"
          />

          {/* Wave layer 3 - subtle */}
          <path
            className="wave-back"
            d="M-30 148 Q10 142, 50 148 T130 148 T210 148 T290 148 T370 148 T450 148"
            stroke="hsl(var(--primary))"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.15"
          />

          {/* Foam dots along the waterline */}
          <circle className="foam foam-1" cx="90" cy="136" r="1" fill="hsl(var(--primary-foreground))" opacity="0" />
          <circle className="foam foam-2" cx="130" cy="134" r="0.8" fill="hsl(var(--primary-foreground))" opacity="0" />
          <circle className="foam foam-3" cx="210" cy="135" r="1.2" fill="hsl(var(--primary-foreground))" opacity="0" />
          <circle className="foam foam-4" cx="250" cy="133" r="0.7" fill="hsl(var(--primary-foreground))" opacity="0" />
          <circle className="foam foam-5" cx="60" cy="137" r="0.9" fill="hsl(var(--primary-foreground))" opacity="0" />
        </svg>
      </div>

      {label && (
        <p className={`text-muted-foreground ${dims.text} tracking-wide animate-pulse`}>
          {label}
        </p>
      )}

      <style>{`
        .ship-loader-cinematic {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Ship bob + sway */
        .ship-group {
          animation: ship-cinematic-bob 3s ease-in-out infinite;
          transform-origin: 160px 115px;
        }

        @keyframes ship-cinematic-bob {
          0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
          30% { transform: translateY(-3px) rotate(0.5deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
          70% { transform: translateY(-2px) rotate(0.8deg); }
        }

        /* Wave animations */
        .wave-main, .wave-fill-1 {
          animation: wave-cinematic-flow 3s linear infinite;
        }
        .wave-mid {
          animation: wave-cinematic-flow 4s linear infinite;
          animation-delay: -0.8s;
        }
        .wave-back {
          animation: wave-cinematic-flow 5s linear infinite;
          animation-delay: -1.5s;
        }

        @keyframes wave-cinematic-flow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-80px); }
        }

        /* Smoke */
        .smoke-p {
          animation: smoke-cinematic 3s ease-out infinite;
        }
        .smoke-p1 { animation-delay: 0s; }
        .smoke-p2 { animation-delay: 0.7s; }
        .smoke-p3 { animation-delay: 1.4s; }
        .smoke-p4 { animation-delay: 2.1s; }

        @keyframes smoke-cinematic {
          0% { opacity: 0; transform: translateY(0) translateX(0) scale(0.6); }
          15% { opacity: 0.25; }
          50% { opacity: 0.12; transform: translateY(-18px) translateX(8px) scale(1.2); }
          100% { opacity: 0; transform: translateY(-35px) translateX(15px) scale(1.8); }
        }

        /* Navigation light blink */
        .nav-light {
          animation: nav-blink 2s ease-in-out infinite;
        }
        @keyframes nav-blink {
          0%, 40%, 60%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        /* Porthole warm glow pulse */
        .porthole-glow {
          animation: porthole-pulse 4s ease-in-out infinite;
        }
        @keyframes porthole-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }

        /* Bow spray */
        .spray {
          animation: spray-burst 2.5s ease-out infinite;
        }
        .spray-1 { animation-delay: 0s; }
        .spray-2 { animation-delay: 0.6s; }
        .spray-3 { animation-delay: 1.2s; }

        @keyframes spray-burst {
          0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
          20% { opacity: 0.5; }
          60% { opacity: 0.2; transform: translate(-12px, -8px) scale(1.3); }
          100% { opacity: 0; transform: translate(-20px, -14px) scale(0.3); }
        }

        /* Foam particles */
        .foam {
          animation: foam-float 3s ease-in-out infinite;
        }
        .foam-1 { animation-delay: 0s; }
        .foam-2 { animation-delay: 0.5s; }
        .foam-3 { animation-delay: 1s; }
        .foam-4 { animation-delay: 1.5s; }
        .foam-5 { animation-delay: 2s; }

        @keyframes foam-float {
          0%, 100% { opacity: 0; transform: translateX(0); }
          30% { opacity: 0.6; }
          70% { opacity: 0.3; }
          100% { opacity: 0; transform: translateX(-30px); }
        }

        /* Ship reflection shimmer */
        .ship-reflection {
          animation: reflect-shimmer 3s ease-in-out infinite;
        }
        @keyframes reflect-shimmer {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }

        /* Reduce motion */
        @media (prefers-reduced-motion: reduce) {
          .ship-group, .wave-main, .wave-fill-1, .wave-mid, .wave-back,
          .smoke-p, .nav-light, .porthole-glow, .spray, .foam, .ship-reflection {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
