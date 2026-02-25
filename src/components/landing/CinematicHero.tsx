/**
 * CinematicHero - Extraordinary first-impact hero with 3D ocean,
 * text reveal animations, and cascading metrics
 */
import { useState, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, ArrowRight, Play, Ship, Brain, Shield,
  Users, Activity, Anchor, Globe, ChevronDown
} from "lucide-react";

const OceanScene = lazy(() =>
  import("@/components/3d/OceanScene").then(m => ({ default: m.OceanScene }))
);

const HERO_WORDS = ["Operações", "Tripulação", "Compliance", "Manutenção", "Inteligência"];

function RotatingWord() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex(i => (i + 1) % HERO_WORDS.length), 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="inline-block relative h-[1.15em] overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={HERO_WORDS[index]}
          initial={{ y: 40, opacity: 0, rotateX: -40 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: -40, opacity: 0, rotateX: 40 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-0 bg-gradient-to-r from-primary via-[hsl(190,95%,50%)] to-accent bg-clip-text text-transparent whitespace-nowrap"
        >
          {HERO_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const METRICS = [
  { value: "500+", label: "Navios Gerenciados", icon: Ship },
  { value: "15K+", label: "Tripulantes Ativos", icon: Users },
  { value: "99.9%", label: "Uptime Garantido", icon: Activity },
  { value: "10+", label: "Agentes de IA", icon: Brain },
];

const COMPLIANCE_BADGES = ["MLC 2006", "STCW", "SOLAS", "ISM", "ISPS", "MARPOL"];

export function CinematicHero() {
  const { t } = useTranslation();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Deep ocean base gradient */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #020810 0%, #040a18 20%, #0a1628 50%, #061224 80%, #020810 100%)"
      }} />

      {/* 3D Ocean Scene */}
      <Suspense fallback={null}>
        <OceanScene className="opacity-70" />
      </Suspense>

      {/* Atmospheric overlays */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, hsla(214,84%,46%,0.15) 0%, transparent 70%)"
        }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 80% 80%, hsla(190,95%,50%,0.08) 0%, transparent 70%)"
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto max-w-6xl px-4 pt-32 pb-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-6"
        >
          <Badge className="px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20 backdrop-blur-md gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Plataforma Marítima #1 do Mundo
          </Badge>
        </motion.div>

        {/* Main Headline with rotating word */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.05] tracking-tight text-white max-w-4xl"
        >
          O Futuro da{" "}
          <RotatingWord />
          <br />
          <span className="text-white/60">Marítima é Agora</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl leading-relaxed"
        >
          200+ módulos. 10+ agentes de IA. Compliance total MLC/STCW/SOLAS.
          A única plataforma que unifica toda a operação marítima em um só lugar.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <Link to="/auth?mode=signup">
            <Button
              size="lg"
              className="gap-2.5 text-base px-8 h-14 shadow-2xl shadow-primary/30 group bg-gradient-to-r from-primary to-[hsl(190,95%,45%)] hover:from-primary/90 hover:to-[hsl(190,95%,40%)] border-0 text-white font-semibold w-full sm:w-auto"
            >
              <Sparkles className="h-5 w-5" />
              Começar Gratuitamente
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/demo">
            <Button
              size="lg"
              variant="outline"
              className="gap-2.5 text-base px-8 h-14 border-white/15 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm w-full sm:w-auto"
            >
              <Play className="h-5 w-5" />
              Demo Interativa
            </Button>
          </Link>
        </motion.div>

        {/* Metrics bar with stagger animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={loaded ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12"
        >
          {METRICS.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={loaded ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ delay: 1.2 + i * 0.15, duration: 0.5 }}
              className="relative group"
            >
              <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-4 md:p-5 text-center hover:border-primary/30 hover:bg-white/[0.06] transition-all duration-500">
                <metric.icon className="h-5 w-5 text-primary/60 mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{metric.value}</div>
                <div className="text-xs text-white/40">{metric.label}</div>
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Compliance strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={loaded ? { opacity: 1 } : {}}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-2 md:gap-3"
        >
          <Shield className="h-4 w-4 text-white/30" />
          <span className="text-xs text-white/30 uppercase tracking-wider mr-2">Certificações:</span>
          {COMPLIANCE_BADGES.map((badge) => (
            <span
              key={badge}
              className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-white/40 bg-white/[0.02]"
            >
              {badge}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-white/20"
        >
          <span className="text-[10px] uppercase tracking-[0.2em]">Explorar</span>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-[5]" />
    </section>
  );
}
