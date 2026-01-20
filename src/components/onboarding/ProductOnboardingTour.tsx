import React, { useEffect, useState } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Rocket, 
  Ship, 
  Users, 
  FileText, 
  Shield, 
  BarChart3,
  MessageSquare,
  Settings
} from 'lucide-react';

interface OnboardingTourProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export const ProductOnboardingTour: React.FC<OnboardingTourProps> = ({ 
  onComplete, 
  forceShow = false 
}) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    const tourSeen = localStorage.getItem('nauti-onboarding-complete');
    setHasSeenTour(!!tourSeen);
    
    if (!tourSeen || forceShow) {
      // Small delay to ensure DOM is ready
      setTimeout(() => setShowWelcome(true), 500);
    }
  }, [forceShow]);

  const tourSteps: DriveStep[] = [
    {
      element: '[data-tour="dashboard"]',
      popover: {
        title: '📊 Dashboard Principal',
        description: 'Visão geral de toda sua operação marítima em tempo real. KPIs, alertas e status da frota.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="fleet"]',
      popover: {
        title: '🚢 Gestão de Frota',
        description: 'Acompanhe todas as embarcações, posições em tempo real via AIS e status operacional.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '[data-tour="crew"]',
      popover: {
        title: '👥 Gestão de Tripulação',
        description: 'Controle completo de tripulantes: certificações, escalas, documentos e compliance MLC 2006.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '[data-tour="documents"]',
      popover: {
        title: '📄 Documentos',
        description: 'Central de documentos com OCR inteligente, versionamento e alertas de vencimento.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '[data-tour="compliance"]',
      popover: {
        title: '✅ Compliance & SGSO',
        description: 'Auditorias, checklists e conformidade com normas marítimas (ISM, ISPS, MLC).',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '[data-tour="ai-assistant"]',
      popover: {
        title: '🤖 Assistente IA',
        description: 'Pergunte qualquer coisa! O Nauti Brain está pronto para ajudar com análises, relatórios e decisões.',
        side: 'left',
        align: 'start'
      }
    },
    {
      element: '[data-tour="analytics"]',
      popover: {
        title: '📈 Analytics',
        description: 'Relatórios avançados, previsões e insights baseados em IA para otimizar sua operação.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '[data-tour="settings"]',
      popover: {
        title: '⚙️ Configurações',
        description: 'Personalize o sistema, gerencie usuários e configure integrações.',
        side: 'left',
        align: 'end'
      }
    }
  ];

  const startTour = () => {
    setShowWelcome(false);
    
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      steps: tourSteps,
      nextBtnText: 'Próximo →',
      prevBtnText: '← Anterior',
      doneBtnText: 'Concluir ✓',
      progressText: '{{current}} de {{total}}',
      onDestroyStarted: () => {
        localStorage.setItem('nauti-onboarding-complete', 'true');
        setHasSeenTour(true);
        onComplete?.();
        driverObj.destroy();
      }
    });

    driverObj.drive();
  };

  const skipTour = () => {
    setShowWelcome(false);
    localStorage.setItem('nauti-onboarding-complete', 'true');
    setHasSeenTour(true);
    onComplete?.();
  };

  if (hasSeenTour && !forceShow) return null;

  return (
    <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Bem-vindo ao Nauti One!</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Sua plataforma completa de gestão marítima está pronta. Vamos fazer um tour rápido?
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 my-4">
          <FeatureCard icon={<Ship />} title="Frota" desc="Rastreamento AIS" />
          <FeatureCard icon={<Users />} title="Tripulação" desc="Gestão completa" />
          <FeatureCard icon={<FileText />} title="Documentos" desc="OCR inteligente" />
          <FeatureCard icon={<Shield />} title="Compliance" desc="MLC, ISM, ISPS" />
          <FeatureCard icon={<BarChart3 />} title="Analytics" desc="IA preditiva" />
          <FeatureCard icon={<MessageSquare />} title="IA Assistant" desc="24/7 disponível" />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={skipTour}>
            Pular por agora
          </Button>
          <Button onClick={startTour}>
            <Rocket className="h-4 w-4 mr-2" />
            Iniciar Tour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ 
  icon, 
  title, 
  desc 
}) => (
  <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
    <div className="text-primary">{icon}</div>
    <div>
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  </div>
);

export default ProductOnboardingTour;
