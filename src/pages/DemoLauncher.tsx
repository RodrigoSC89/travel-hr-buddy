/**
 * DemoLauncher — ativa modo sandbox de demonstração e redireciona ao app
 * Tour visual rápido antes de entrar
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemoMode } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ship, Users, Shield, Brain, BarChart3, FileText,
  Wrench, GraduationCap, ArrowRight, Play, Sparkles, Anchor,
  Globe, Zap
} from 'lucide-react';

const TOUR_SLIDES = [
  {
    icon: Ship,
    title: 'Gestão de Frota',
    desc: 'Rastreie todos os navios em tempo real com integração AIS e P&L por viagem.',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    icon: Users,
    title: 'Gestão de Tripulação',
    desc: 'Ciclo completo — certificações, escalas, folha de pagamento, compliance MLC.',
    color: 'from-emerald-500 to-teal-400',
  },
  {
    icon: Brain,
    title: 'Inteligência Artificial',
    desc: '10+ agentes de IA especializados em predições, auditorias e automação.',
    color: 'from-violet-500 to-purple-400',
  },
  {
    icon: Shield,
    title: 'Compliance Marítimo',
    desc: 'MLC 2006, STCW, SOLAS, ISM, ISPS — sempre pronto para auditoria.',
    color: 'from-amber-500 to-orange-400',
  },
];

const STATS = [
  { value: '200+', label: 'Módulos' },
  { value: '700+', label: 'Tabelas' },
  { value: '313+', label: 'Edge Functions' },
  { value: '100%', label: 'RLS Coverage' },
];

export default function DemoLauncher() {
  const navigate = useNavigate();
  const { enableDemoMode } = useDemoMode();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TOUR_SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const enterSandbox = () => {
    enableDemoMode();
    navigate('/command');
  };

  const slide = TOUR_SLIDES[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-2 mb-8"
      >
        <Anchor className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold text-primary">Nauti One</span>
        <Badge variant="secondary" className="text-[10px]">DEMO</Badge>
      </motion.div>

      {/* Tour Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-lg"
      >
        <div className="rounded-2xl border bg-card p-8 shadow-2xl shadow-primary/5">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Demo Interativa</h1>
            <p className="text-sm text-muted-foreground">
              Explore a plataforma completa com dados de exemplo — sem necessidade de cadastro
            </p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center p-2 rounded-lg bg-primary/5">
                <div className="text-sm font-bold text-primary">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Slide */}
          <div
            className="relative h-48 rounded-xl overflow-hidden mb-6 cursor-pointer"
            onClick={() => {
              setAutoPlay(false);
              setCurrentSlide((prev) => (prev + 1) % TOUR_SLIDES.length);
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
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
                key={`slide-dot-${s.title.slice(0, 10)}-${i}`}
                onClick={() => { setAutoPlay(false); setCurrentSlide(i); }}
                className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Features summary */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { icon: FileText, label: 'Documentos' },
              { icon: BarChart3, label: 'Analytics' },
              { icon: Wrench, label: 'Manutenção' },
              { icon: GraduationCap, label: 'Academia' },
              { icon: Sparkles, label: 'Agentes IA' },
              { icon: Shield, label: 'Compliance' },
            ].map(({ icon: FIcon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground p-2 rounded-lg bg-muted/30">
                <FIcon className="h-3 w-3 text-primary" />
                {label}
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button onClick={enterSandbox} className="w-full gap-2 text-base h-12 shadow-lg shadow-primary/20 group">
            <Play className="h-4 w-4" />
            Entrar na Demo
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-center text-[11px] text-muted-foreground mt-3">
            Pré-carregado com dados de frota, tripulação e compliance
          </p>
        </div>
      </motion.div>

      {/* Bottom link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex gap-4"
      >
        <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="text-xs text-muted-foreground">
          Já tenho conta → Login
        </Button>
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-xs text-muted-foreground">
          <Globe className="h-3 w-3 mr-1" />
          Página inicial
        </Button>
      </motion.div>
    </div>
  );
}
