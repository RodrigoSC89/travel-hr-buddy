/**
 * LTI Counter Banner Component
 * Banner de dias sem LTI
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Trophy, Target } from 'lucide-react';

interface LTICounterBannerProps {
  daysWithoutLTI: number;
  goal?: number;
}

export const LTICounterBanner: React.FC<LTICounterBannerProps> = ({
  daysWithoutLTI,
  goal = 365,
}) => {
  const progress = Math.min((daysWithoutLTI / goal) * 100, 100);
  const isGoalReached = daysWithoutLTI >= goal;

  return (
    <Card className="bg-gradient-to-r from-success to-success/80 text-success-foreground border-0 overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <CardContent className="py-6 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              {isGoalReached ? (
                <Trophy className="h-8 w-8" />
              ) : (
                <Shield className="h-8 w-8" />
              )}
            </div>
            <div>
              <h2 className="text-4xl font-bold tracking-tight">{daysWithoutLTI} Dias</h2>
              <p className="text-success-foreground/80 mt-1">
                Sem Acidentes com Afastamento (LTI)
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-2">
            <Badge className="bg-white/20 text-success-foreground text-lg px-4 py-2 border-0">
              <Target className="h-4 w-4 mr-2" />
              Meta: {goal} dias
            </Badge>
            
            <div className="w-full md:w-48">
              <div className="flex justify-between text-xs text-success-foreground/80 mb-1">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress 
                value={progress} 
                className="h-2 bg-white/20 [&>div]:bg-white" 
              />
            </div>
          </div>
        </div>
        
        {isGoalReached && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-sm text-success-foreground/80 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Parabéns! Meta anual alcançada. Continue mantendo os padrões de segurança!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
