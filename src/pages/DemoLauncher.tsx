/**
 * DemoLauncher — activates demo sandbox mode and redirects to the app
 * Also shows a quick visual tour before entering
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemoMode } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ship, Users, Shield, Brain, BarChart3, FileText,
  Wrench, GraduationCap, ArrowRight, Play, Sparkles, Anchor
} from 'lucide-react';

const TOUR_SLIDES = [
  {
    icon: Ship,
    title: 'Fleet Management',
    desc: 'Track all vessels in real-time with AIS integration and voyage P&L.',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    icon: Users,
    title: 'Crew Management',
    desc: 'Complete crew lifecycle — certifications, scheduling, payroll, MLC compliance.',
    color: 'from-emerald-500 to-teal-400',
  },
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    desc: '10+ specialized AI agents for predictions, audits, and automation.',
    color: 'from-violet-500 to-purple-400',
  },
  {
    icon: Shield,
    title: 'Maritime Compliance',
    desc: 'MLC 2006, STCW, SOLAS, ISM, ISPS — audit-ready at all times.',
    color: 'from-amber-500 to-orange-400',
  },
];

export default function DemoLauncher() {
  const navigate = useNavigate();
  const { enableDemoMode } = useDemoMode();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto-advance slides
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
        <Badge variant="secondary" className="text-[10px]">Demo</Badge>
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
            <h1 className="text-2xl font-bold mb-2">Interactive Demo</h1>
            <p className="text-sm text-muted-foreground">
              Explore the full platform with sample data — no signup required
            </p>
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
            {TOUR_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => { setAutoPlay(false); setCurrentSlide(i); }}
                className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'}`}
              />
            ))}
          </div>

          {/* Features summary */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { icon: FileText, label: 'Documents' },
              { icon: BarChart3, label: 'Analytics' },
              { icon: Wrench, label: 'Maintenance' },
              { icon: GraduationCap, label: 'Academy' },
              { icon: Sparkles, label: 'AI Agents' },
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
            Enter Demo Sandbox
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-center text-[11px] text-muted-foreground mt-3">
            Pre-loaded with sample fleet, crew, and compliance data
          </p>
        </div>
      </motion.div>
    </div>
  );
}
