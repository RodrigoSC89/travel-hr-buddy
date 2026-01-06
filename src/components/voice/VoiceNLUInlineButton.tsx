/**
 * Voice NLU Button Component (Inline version for FloatingButtonsContainer)
 * Voice commands with NLU - without fixed positioning
 */

import { useState } from 'react';
import { Mic, MicOff, Loader2, HelpCircle } from 'lucide-react';
import { useVoiceNLU } from '@/hooks/useVoiceNLU';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface VoiceNLUInlineButtonProps {
  className?: string;
}

export function VoiceNLUInlineButton({ className }: VoiceNLUInlineButtonProps) {
  const [showHelp, setShowHelp] = useState(false);
  const {
    isListening,
    isProcessing,
    transcript,
    lastResult,
    error,
    toggleListening,
  } = useVoiceNLU({ language: 'pt', autoNavigate: true, speakResponses: true });

  const helpCommands = [
    { command: 'Ir para dashboard', description: 'Navega para o painel principal' },
    { command: 'Status do navio', description: 'Verifica status da frota' },
    { command: 'Criar non-conformidade', description: 'Registra nova observação' },
    { command: 'Tirar foto', description: 'Abre câmera para evidência' },
    { command: 'Gerar relatório', description: 'Cria relatório de compliance' },
    { command: 'Status combustível', description: 'Verifica bunker/ROB' },
    { command: 'Tripulação', description: 'Gestão de crew' },
    { command: 'Alertas', description: 'Lista alertas pendentes' },
  ];

  return (
    <div className={cn('flex flex-col items-end gap-2', className)}>
      {/* Transcript popup */}
      {(isListening || transcript) && (
        <div className="bg-background/95 backdrop-blur border rounded-lg p-3 shadow-lg max-w-xs animate-in fade-in slide-in-from-bottom-2">
          {isListening && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Ouvindo...
            </div>
          )}
          {transcript && <p className="text-sm mt-1">"{transcript}"</p>}
          {lastResult && (
            <Badge variant={lastResult.success ? 'default' : 'destructive'} className="mt-2">
              {lastResult.action}
            </Badge>
          )}
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
      )}

      {/* Buttons row */}
      <div className="flex items-center gap-2">
        {/* Help */}
        <Sheet open={showHelp} onOpenChange={setShowHelp}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full shadow-lg">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Comandos de Voz NLU</SheetTitle>
              <SheetDescription>Fale naturalmente - o sistema entende variações</SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-200px)] mt-4">
              <div className="space-y-4">
                {helpCommands.map((cmd, i) => (
                  <div key={i} className="border-b pb-3">
                    <p className="font-medium text-sm">"{cmd.command}"</p>
                    <p className="text-xs text-muted-foreground mt-1">{cmd.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Main voice button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                onClick={toggleListening}
                disabled={isProcessing}
                className={cn(
                  'h-14 w-14 rounded-full shadow-lg transition-all duration-300',
                  isListening && 'bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-500/30',
                  isProcessing && 'bg-blue-500'
                )}
              >
                {isProcessing ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : isListening ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isListening ? 'Parar' : 'Comando de Voz NLU'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export default VoiceNLUInlineButton;
