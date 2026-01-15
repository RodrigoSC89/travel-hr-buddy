/**
 * NautiBrainButton - Brain trigger button for FloatingButtonsContainer
 * Uses the GlobalBrainProvider context to open the brain panel
 */

import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBrain } from './GlobalBrainProvider';

export function NautilusBrainButton() {
  const { openBrain, isOpen } = useBrain();

  if (isOpen) return null;

  return (
    <Button
      onClick={() => openBrain()}
      className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 shadow-lg hover:shadow-xl transition-all hover:scale-105"
      aria-label="Abrir Nauti Brain"
    >
      <Brain className="h-6 w-6 text-white" />
    </Button>
  );
}

export default NautilusBrainButton;
