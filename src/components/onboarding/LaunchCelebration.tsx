/**
 * Launch Celebration Component
 * Celebratory animation for Nauti One official launch
 */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Rocket, 
  Sparkles, 
  Ship, 
  Brain, 
  CheckCircle2,
  PartyPopper,
  Zap,
  Globe
} from "lucide-react";

const LAUNCH_CELEBRATION_KEY = "nautilus_launch_celebrated";

interface LaunchFeature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const LAUNCH_FEATURES: LaunchFeature[] = [
  {
    icon: Brain,
    title: "IA Integrada",
    description: "Claude Sonnet 4.5 e Gemini Pro"
  },
  {
    icon: Ship,
    title: "Gestão Marítima",
    description: "Frota, tripulação e compliance"
  },
  {
    icon: Zap,
    title: "Performance",
    description: "Carregamento < 2s, PWA ready"
  },
  {
    icon: Globe,
    title: "Multi-tenant",
    description: "Segurança enterprise grade"
  }
];

export const LaunchCelebration: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    const celebrated = localStorage.getItem(LAUNCH_CELEBRATION_KEY);
    if (!celebrated) {
      setIsVisible(true);
      // Generate confetti particles
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: (i * 37 + 13) % 100,
        delay: (i * 0.04) % 2
      }));
      setConfetti(particles);
    }
  }, []);

  // Keyboard support for ESC and DEL to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isVisible && (event.key === 'Escape' || event.key === 'Delete')) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const handleClose = () => {
    localStorage.setItem(LAUNCH_CELEBRATION_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-background/98 backdrop-blur-md overflow-hidden"
      >
        {/* Confetti */}
        {confetti.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ y: -20, x: `${particle.x}vw`, opacity: 1 }}
            animate={{ 
              y: "100vh", 
              rotate: 720,
              opacity: 0 
            }}
            transition={{ 
              duration: 4, 
              delay: particle.delay,
              ease: "easeOut" 
            }}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: `hsl(${(particle.id * 47) % 360}, 70%, 60%)`
            }}
          />
        ))}

        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="w-full max-w-2xl mx-4 relative z-10"
        >
          <Card className="border-2 border-primary/30 shadow-2xl overflow-hidden bg-gradient-to-br from-background via-primary/5 to-cyan-500/5">
            {/* Animated Header */}
            <div className="h-3 bg-gradient-to-r from-primary via-cyan-500 to-purple-500" />
            
            <CardContent className="p-8 text-center">
              {/* Logo Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 150 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <div className="p-6 rounded-full bg-gradient-to-br from-primary to-cyan-500 shadow-xl">
                    <Rocket className="h-16 w-16 text-white" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-2 -right-2"
                  >
                    <PartyPopper className="h-8 w-8 text-warning" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-cyan-500 to-purple-500 bg-clip-text text-transparent"
              >
                🎉 Nauti One Inaugurado!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-muted-foreground mb-8 max-w-md mx-auto"
              >
                Seu sistema de gestão marítima com IA está pronto para uso.
                Explore todos os recursos e transforme sua operação.
              </motion.p>

              {/* Features Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              >
                {LAUNCH_FEATURES.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="p-4 rounded-xl bg-muted/50 border border-border/50"
                  >
                    <feature.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* AI Welcome Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-cyan-500/10 border border-primary/20 mb-6"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-sm text-primary">Nautilus Copilot</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      "Olá! Sou seu assistente de IA. Estou aqui para ajudar com análises, 
                      relatórios, previsões e qualquer dúvida sobre o sistema. 
                      Clique no ícone <Sparkles className="h-3 w-3 inline text-primary" /> 
                      no canto inferior direito para conversar comigo a qualquer momento!"
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <Button 
                  onClick={handleClose}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 text-white shadow-lg"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Começar a Usar
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook to reset launch celebration (for testing)
export const useResetLaunchCelebration = () => {
  return () => {
    localStorage.removeItem(LAUNCH_CELEBRATION_KEY);
    // SPA-safe: force re-render without full page reload
    window.dispatchEvent(new CustomEvent('celebration-reset'));
  };
};

export default LaunchCelebration;
