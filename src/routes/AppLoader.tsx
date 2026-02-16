/**
 * AppLoader - Cinematic full-screen loading with integrated ocean scene
 * The ship and waves blend seamlessly into the page background
 */
import * as React from "react";

export const AppLoader = () => {
  const [showRetry, setShowRetry] = React.useState(false);
  const id = React.useId().replace(/:/g, '');

  React.useEffect(() => {
    const retryTimeout = setTimeout(() => setShowRetry(true), 15000);
    return () => clearTimeout(retryTimeout);
  }, []);

  const handleRetry = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
    } catch { /* ignore cleanup errors */ }
    window.location.href = window.location.origin + '/?_sw=' + Date.now();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Full-width ocean gradient that blends with bg */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, 
            hsl(var(--background)) 0%, 
            hsl(var(--background)) 45%, 
            hsl(var(--primary) / 0.06) 60%, 
            hsl(var(--primary) / 0.12) 75%, 
            hsl(var(--primary) / 0.08) 100%
          )`
        }}
      />

      {/* Ambient glow behind ship */}
      <div 
        className="absolute pointer-events-none"
        style={{
          width: '600px',
          height: '300px',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(ellipse, hsl(var(--primary) / 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Ship + Ocean Scene - full width SVG */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <svg
          className="w-full max-w-lg"
          viewBox="0 0 400 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id={`${id}-ocean`} x1="0" y1="130" x2="0" y2="220">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id={`${id}-hull`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.65" />
            </linearGradient>
            <linearGradient id={`${id}-super`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.55" />
            </linearGradient>
            <filter id={`${id}-reflect`}>
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
            <radialGradient id={`${id}-ambient`} cx="50%" cy="55%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Subtle ambient ellipse */}
          <ellipse cx="200" cy="130" rx="180" ry="70" fill={`url(#${id}-ambient)`} />

          {/* Ship group */}
          <g className="al-ship">
            {/* Reflection */}
            <g filter={`url(#${id}-reflect)`} opacity="0.12" transform="translate(200, 265) scale(1, -0.35) translate(-200, -130)">
              <path d="M155 132 L165 150 L235 150 L245 132 Z" fill="hsl(var(--primary))" />
              <rect x="182" y="120" width="36" height="12" rx="2" fill="hsl(var(--primary))" />
            </g>

            {/* Smoke */}
            <circle className="al-smoke al-s1" cx="203" cy="72" r="4" fill="hsl(var(--muted-foreground))" opacity="0" />
            <circle className="al-smoke al-s2" cx="197" cy="64" r="3.5" fill="hsl(var(--muted-foreground))" opacity="0" />
            <circle className="al-smoke al-s3" cx="208" cy="58" r="3" fill="hsl(var(--muted-foreground))" opacity="0" />

            {/* Smokestack */}
            <rect x="197" y="78" width="6" height="16" rx="1.5" fill="hsl(var(--primary))" opacity="0.7" />
            <rect x="198.5" y="76" width="3" height="4" rx="1" fill="hsl(var(--destructive))" opacity="0.5" />

            {/* Mast + nav light */}
            <line x1="200" y1="74" x2="200" y2="62" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.4" />
            <circle className="al-navlight" cx="200" cy="61" r="2" fill="hsl(var(--accent))" opacity="0.7" />

            {/* Bridge */}
            <rect x="185" y="94" width="30" height="16" rx="3" fill={`url(#${id}-super)`} />
            <rect x="188" y="98" width="5" height="3.5" rx="1" fill="hsl(var(--primary-foreground))" opacity="0.6" />
            <rect x="197" y="98" width="5" height="3.5" rx="1" fill="hsl(var(--primary-foreground))" opacity="0.6" />
            <rect x="206" y="98" width="5" height="3.5" rx="1" fill="hsl(var(--primary-foreground))" opacity="0.6" />
            <rect x="183" y="92" width="34" height="3" rx="1.5" fill="hsl(var(--primary))" opacity="0.45" />

            {/* Deck */}
            <rect x="172" y="110" width="56" height="10" rx="2" fill="hsl(var(--primary))" opacity="0.6" />

            {/* Hull */}
            <path d="M152 120 L162 146 L167 148 L233 148 L238 146 L248 120 Z" fill={`url(#${id}-hull)`} />
            <path d="M156 140 L161 146 L167 148 L233 148 L239 146 L244 140 Z" fill="hsl(var(--destructive))" opacity="0.3" />
            <path d="M156 120 L248 120 L244 128 L156 128 Z" fill="hsl(var(--primary-foreground))" opacity="0.06" />

            {/* Portholes */}
            {[174, 186, 200, 214, 226].map((cx) => (
              <React.Fragment key={cx}>
                <circle cx={cx} cy="134" r="2.5" fill="hsl(var(--background))" opacity="0.25" />
                <circle className="al-porthole" cx={cx} cy="134" r="1.8" fill="hsl(var(--accent))" opacity="0.4" />
              </React.Fragment>
            ))}

            {/* Bow spray */}
            <circle className="al-spray al-sp1" cx="148" cy="142" r="1.5" fill="hsl(var(--primary-foreground))" opacity="0" />
            <circle className="al-spray al-sp2" cx="144" cy="138" r="1" fill="hsl(var(--primary-foreground))" opacity="0" />
          </g>

          {/* Full-width waves that extend beyond viewBox */}
          <path
            className="al-wave1"
            d="M-100 148 Q-60 138, -20 148 T60 148 T140 148 T220 148 T300 148 T380 148 T460 148 T540 148"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.45"
          />
          <path
            className="al-wavefill"
            d="M-100 148 Q-60 138, -20 148 T60 148 T140 148 T220 148 T300 148 T380 148 T460 148 T540 148 V280 H-100 Z"
            fill={`url(#${id}-ocean)`}
            opacity="0.5"
          />
          <path
            className="al-wave2"
            d="M-120 155 Q-80 148, -40 155 T40 155 T120 155 T200 155 T280 155 T360 155 T440 155 T520 155"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.25"
          />
          <path
            className="al-wave3"
            d="M-80 162 Q-40 157, 0 162 T80 162 T160 162 T240 162 T320 162 T400 162 T480 162"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
            opacity="0.12"
          />

          {/* Foam */}
          {[80, 150, 250, 310, 50].map((cx, i) => (
            <circle key={cx} className={`al-foam al-f${i+1}`} cx={cx} cy={148 + (i % 3)} r={0.8 + (i % 3) * 0.2} fill="hsl(var(--primary-foreground))" opacity="0" />
          ))}
        </svg>

        {/* Text below, seamlessly placed */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-base text-muted-foreground tracking-widest animate-pulse font-medium">
            Carregando Nauti One...
          </p>
          {/* Dot indicator */}
          <div className="flex justify-center gap-1.5">
            {[0, 0.2, 0.4].map((delay, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary/50"
                style={{
                  animation: `al-dot 1.2s ease-in-out ${delay}s infinite`,
                }}
              />
            ))}
          </div>
        </div>

        {showRetry && (
          <div className="mt-6 space-y-2 text-center animate-fade-in">
            <p className="text-sm text-muted-foreground">O carregamento está demorando mais que o normal.</p>
            <button onClick={handleRetry} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors">
              Limpar cache e recarregar
            </button>
          </div>
        )}
      </div>

      <style>{`
        .al-ship {
          animation: al-bob 3.5s ease-in-out infinite;
          transform-origin: 200px 130px;
        }
        @keyframes al-bob {
          0%, 100% { transform: translateY(0) rotate(-1.2deg); }
          35% { transform: translateY(-4px) rotate(0.6deg); }
          50% { transform: translateY(-6px) rotate(1.8deg); }
          75% { transform: translateY(-2px) rotate(0.4deg); }
        }

        .al-wave1, .al-wavefill { animation: al-wflow 3.5s linear infinite; }
        .al-wave2 { animation: al-wflow 4.5s linear infinite; animation-delay: -1s; }
        .al-wave3 { animation: al-wflow 5.5s linear infinite; animation-delay: -2s; }
        @keyframes al-wflow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-80px); }
        }

        .al-smoke { animation: al-smk 3.2s ease-out infinite; }
        .al-s1 { animation-delay: 0s; }
        .al-s2 { animation-delay: 0.9s; }
        .al-s3 { animation-delay: 1.8s; }
        @keyframes al-smk {
          0% { opacity: 0; transform: translateY(0) translateX(0) scale(0.5); }
          15% { opacity: 0.2; }
          50% { opacity: 0.08; transform: translateY(-20px) translateX(10px) scale(1.3); }
          100% { opacity: 0; transform: translateY(-38px) translateX(18px) scale(2); }
        }

        .al-navlight { animation: al-blink 2.2s ease-in-out infinite; }
        @keyframes al-blink {
          0%, 40%, 60%, 100% { opacity: 0.25; }
          50% { opacity: 1; }
        }

        .al-porthole { animation: al-pglow 4s ease-in-out infinite; }
        @keyframes al-pglow {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.65; }
        }

        .al-spray { animation: al-spburst 2.8s ease-out infinite; }
        .al-sp1 { animation-delay: 0s; }
        .al-sp2 { animation-delay: 0.7s; }
        @keyframes al-spburst {
          0% { opacity: 0; transform: translate(0, 0) scale(0.4); }
          20% { opacity: 0.45; }
          60% { opacity: 0.15; transform: translate(-14px, -10px) scale(1.4); }
          100% { opacity: 0; transform: translate(-22px, -16px) scale(0.2); }
        }

        .al-foam { animation: al-fmfloat 3.5s ease-in-out infinite; }
        .al-f1 { animation-delay: 0s; }
        .al-f2 { animation-delay: 0.6s; }
        .al-f3 { animation-delay: 1.2s; }
        .al-f4 { animation-delay: 1.8s; }
        .al-f5 { animation-delay: 2.4s; }
        @keyframes al-fmfloat {
          0%, 100% { opacity: 0; transform: translateX(0); }
          30% { opacity: 0.5; }
          70% { opacity: 0.2; }
          100% { opacity: 0; transform: translateX(-35px); }
        }

        @keyframes al-dot {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        @media (prefers-reduced-motion: reduce) {
          .al-ship, .al-wave1, .al-wavefill, .al-wave2, .al-wave3,
          .al-smoke, .al-navlight, .al-porthole, .al-spray, .al-foam {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
