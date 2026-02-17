/**
 * ClockInWidget - Widget de registro de ponto para colaboradores
 * PWA-ready, com geolocalização e feedback visual
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Coffee, 
  Play,
  MapPin,
  CheckCircle,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimeTracking, ClockType } from '@/hooks/useTimeTracking';
import { cn } from '@/lib/utils';

interface ClockInWidgetProps {
  compact?: boolean;
  className?: string;
}

export const ClockInWidget: React.FC<ClockInWidgetProps> = ({ 
  compact = false,
  className 
}) => {
  const {
    todayRecord,
    isClocking,
    currentLocation,
    clockIn,
    getNextClockType,
    getLocation,
  } = useTimeTracking();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true); // PATCH v18: Sempre online - navigator.onLine não confiável no iOS PWA

  // Atualizar relógio
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // PATCH v20: Monitoramento de conexão REMOVIDO - navigator.onLine não confiável no iOS PWA
  // isOnline sempre true, erros de rede tratados pela camada Supabase/Fetch

  const nextClockType = getNextClockType();

  const clockButtons: { type: ClockType; label: string; icon: React.ReactNode; variant: 'entry' | 'exit' | 'break'; }[] = [
    { type: 'entry', label: 'Entrada', icon: <LogIn className="h-5 w-5" />, variant: 'entry' },
    { type: 'lunch_start', label: 'Saída Almoço', icon: <Coffee className="h-5 w-5" />, variant: 'break' },
    { type: 'lunch_end', label: 'Retorno', icon: <Play className="h-5 w-5" />, variant: 'break' },
    { type: 'exit', label: 'Saída', icon: <LogOut className="h-5 w-5" />, variant: 'exit' },
  ];

  const getButtonClasses = (variant: string, isActive: boolean, isDisabled: boolean) => {
    if (isDisabled) return 'opacity-50 cursor-not-allowed';
    
    const baseClasses = 'transition-all duration-200';
    
    if (isActive) {
      switch (variant) {
        case 'entry':
          return cn(baseClasses, 'bg-success hover:bg-success/90 text-success-foreground ring-2 ring-success/50');
        case 'exit':
          return cn(baseClasses, 'bg-destructive hover:bg-destructive/90 text-destructive-foreground ring-2 ring-destructive/50');
        case 'break':
          return cn(baseClasses, 'bg-warning hover:bg-warning/90 text-warning-foreground ring-2 ring-warning/50');
      }
    }
    
    return cn(baseClasses, 'border-2 border-dashed hover:border-solid');
  };

  const handleClock = async (type: ClockType) => {
    await clockIn(type);
  };

  if (compact) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold tabular-nums">
                  {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {nextClockType ? 'Próximo: ' + clockButtons.find(b => b.type === nextClockType)?.label : 'Dia completo ✓'}
                </p>
              </div>
            </div>
            
            {nextClockType && (
              <Button
                size="sm"
                onClick={() => handleClock(nextClockType)}
                disabled={isClocking}
                className={getButtonClasses(
                  clockButtons.find(b => b.type === nextClockType)?.variant || 'entry',
                  true,
                  isClocking
                )}
              >
                {isClocking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  clockButtons.find(b => b.type === nextClockType)?.icon
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          {isOnline ? (
            <Badge variant="outline" className="gap-1 text-success border-success/20 bg-success/10">
              <Wifi className="h-3 w-3" />
              Online
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-warning border-warning/20 bg-warning/10">
              <WifiOff className="h-3 w-3" />
              Offline
            </Badge>
          )}
          {currentLocation && (
            <Badge variant="outline" className="gap-1">
              <MapPin className="h-3 w-3" />
              GPS Ativo
            </Badge>
          )}
        </div>
        <CardTitle>Registro de Ponto</CardTitle>
        <CardDescription>
          {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Relógio Digital */}
        <motion.div 
          className="text-center py-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <p className="text-5xl md:text-6xl font-bold tabular-nums text-primary">
            {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </motion.div>

        {/* Status do Dia */}
        {todayRecord && (
          <div className="grid grid-cols-4 gap-2 p-3 bg-muted/50 rounded-lg text-center text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Entrada</p>
              <p className={cn('font-medium', todayRecord.clock_in ? 'text-success' : 'text-muted-foreground')}>
                {todayRecord.clock_in || '--:--'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Almoço</p>
              <p className={cn('font-medium', todayRecord.lunch_out ? 'text-warning' : 'text-muted-foreground')}>
                {todayRecord.lunch_out || '--:--'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Retorno</p>
              <p className={cn('font-medium', todayRecord.lunch_in ? 'text-warning' : 'text-muted-foreground')}>
                {todayRecord.lunch_in || '--:--'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Saída</p>
              <p className={cn('font-medium', todayRecord.clock_out ? 'text-destructive' : 'text-muted-foreground')}>
                {todayRecord.clock_out || '--:--'}
              </p>
            </div>
          </div>
        )}

        {/* Botões de Registro */}
        <div className="grid grid-cols-2 gap-3">
          {clockButtons.map((btn) => {
            const isNext = nextClockType === btn.type;
            const isCompleted = todayRecord && (
              (btn.type === 'entry' && todayRecord.clock_in) ||
              (btn.type === 'lunch_start' && todayRecord.lunch_out) ||
              (btn.type === 'lunch_end' && todayRecord.lunch_in) ||
              (btn.type === 'exit' && todayRecord.clock_out)
            );
            const isDisabled = !isNext || isClocking;

            return (
              <motion.div
                key={btn.type}
                whileHover={!isDisabled ? { scale: 1.02 } : undefined}
                whileTap={!isDisabled ? { scale: 0.98 } : undefined}
              >
                <Button
                  size="lg"
                  variant={isNext ? 'default' : 'outline'}
                  className={cn(
                    'w-full h-16 flex-col gap-1',
                    getButtonClasses(btn.variant, isNext, isDisabled)
                  )}
                  disabled={isDisabled}
                  onClick={() => handleClock(btn.type)}
                >
                  <AnimatePresence mode="wait">
                    {isClocking && isNext ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </motion.div>
                    ) : isCompleted ? (
                      <motion.div
                        key="completed"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <CheckCircle className="h-5 w-5 text-success" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="icon"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {btn.icon}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="text-xs">{btn.label}</span>
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Localização */}
        {currentLocation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-xs text-muted-foreground p-2 bg-muted/30 rounded-lg"
          >
            <MapPin className="h-3 w-3 inline mr-1" />
            {currentLocation.address?.split(',').slice(0, 2).join(', ') || 
              `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`}
          </motion.div>
        )}

        {/* Botão para obter localização */}
        {!currentLocation && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={getLocation}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Ativar localização
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ClockInWidget;
