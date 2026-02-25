/**
 * DemoLauncher v2 — Cinematic immersive sandbox entry
 * 3D ocean background + cascading stats + premium glassmorphism
 */
import { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemoMode } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ship, Users, Shield, Brain, BarChart3, FileText,
  Wrench, GraduationCap, ArrowRight, Play, Sparkles, Anchor,
  Globe, Activity, Zap, ChevronRight
} from 'lucide-react';

const OceanScene = lazy(() =>
  import("@/components/3d/OceanScene").then(m => ({ default: m.OceanScene }))
);

const TOUR_SLIDES = [
  { icon: Ship, title: 'Gestão de Frota', desc: 'Rastreie todos os navios em tempo real com integração AIS e P&L por viagem.', color: 'from-[hsl(200,80%,50%)] to-[hsl(190,90%,45%)]' },
  { icon: Users, title: 'Gestão de Tripulação', desc: 'Ciclo completo — certificações, escalas, folha de pagamento, compliance MLC.', color: 'from-[hsl(160,70%,45%)] to-[hsl(170,80%,40%)]' },
  { icon: Brain, title: 'Inteligência Artificial', desc: '10+ agentes de IA especializados em predições, auditorias e automação.', color: 'from-[hsl(270,70%,55%)] to-[hsl(280,65%,50%)]' },
  { icon: Shield, title: 'Compliance Marítimo', desc: 'MLC 2006, STCW, SOLAS, ISM, ISPS — sempre pronto para auditoria.', color: 'from-[hsl(35,85%,55%)] to-[hsl(25,90%,50%)]' },
];

const STATS = [
  { value: '200+', label: 'Módulos', icon: Zap },
  { value: '700+', label: 'Tabelas', icon: BarChart3 },
  { value: '313+', label: 'Edge Functions', icon: Activity },
  { value: '100%', label: 'RLS Coverage', icon: Shield },
];

export default function DemoLauncher() {
  const navigate = useNavigate();
  const { enableDemoMode } = useDemoMode();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % TOUR_SLIDES.length), 3000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const enterSandbox = () => {
    enableDemoMode();
    navigate('/command');
  };

  const slide = TOUR_SLIDES[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen min-h-dvh relative flex flex-col items-center justify-center p-4 overflow-hidden" style={{ background: '#020810' }}>
      {/* 3D Ocean Background */}
      <Suspense fallback={null}>
        <OceanScene className="opacity-50" />
      </Suspense>

      {/* Atmospheric gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 50% at 50% 30%, hsla(214,84%,46%,0.12) 0%, transparent 70%)"
      }} />

      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={entered ? { y: 0, opacity: 1 } : {}}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative z-10 flex items-center gap-2 mb-8"
      >
        <Anchor className="h-7 w-7 text-primary" />
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-[hsl(190,95%,50%)] bg-clip-text text-transparent">Nauti One</span>
        <Badge variant="secondary" className="text-[10px] bg-white/5 border-white/10 text-white/50">DEMO</Badge>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={entered ? { scale: 1, opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl shadow-primary/5">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Demo Interativa</h1>
            <p className="text-sm text-white/40">
              Explore a plataforma completa com dados de exemplo — sem necessidade de cadastro
            </p>
          </div>

          {/* Stats bar with cascade */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={entered ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.4 }}
                className="text-center p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-primary/20 transition-colors"
              >
                <stat.icon className="h-3 w-3 text-primary/50 mx-auto mb-1" />
                <div className="text-sm font-bold text-primary">{stat.value}</div>
                <div className="text-[9px] text-white/30">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Slide */}
          <div
            className="relative h-48 rounded-xl overflow-hidden mb-6 cursor-pointer border border-white/[0.06]"
            onClick={() => { setAutoPlay(false); setCurrentSlide((prev) => (prev + 1) % TOUR_SLIDES.length); }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
                className={`absolute inset-0 bg-gradient-to-br ${slide.color} flex flex-col items-center justify-center text-white p-6`}
              >
                <Icon className="h-12 w-12 mb-3 drop-shadow-lg" />
                <h3 className="text-lg font-bold mb-1">{slide.title}</h3>
                <p className="text-sm text-white/80 text-center max-w-xs">{slide.desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {TOUR_SLIDES.map((s, i) => (
              <button
                key={`dot-${i}`}
                onClick={() => { setAutoPlay(false); setCurrentSlide(i); }}
                className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-6 bg-primary' : 'w-2 bg-white/20'}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { icon: FileText, label: 'Documentos' },
              { icon: BarChart3, label: 'Analytics' },
              { icon: Wrench, label: 'Manutenção' },
              { icon: GraduationCap, label: 'Academia' },
              { icon: Sparkles, label: 'Agentes IA' },
              { icon: Shield, label: 'Compliance' },
            ].map(({ icon: FIcon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-white/40 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <FIcon className="h-3 w-3 text-primary/60" />
                {label}
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            onClick={enterSandbox}
            className="w-full gap-2 text-base h-13 shadow-2xl shadow-primary/25 group bg-gradient-to-r from-primary to-[hsl(190,95%,45%)] border-0 text-white font-semibold"
            size="lg"
          >
            <Play className="h-5 w-5" />
            Entrar na Demo
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-center text-[11px] text-white/25 mt-3">
            Pré-carregado com dados de frota, tripulação e compliance
          </p>
        </div>
      </motion.div>

      {/* Bottom links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={entered ? { opacity: 1 } : {}}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="relative z-10 mt-6 flex gap-4"
      >
        <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="text-xs text-white/30 hover:text-white/60 hover:bg-white/5">
          Já tenho conta → Login
        </Button>
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-xs text-white/30 hover:text-white/60 hover:bg-white/5">
          <Globe className="h-3 w-3 mr-1" />
          Página inicial
        </Button>
      </motion.div>
    </div>
  );
}
