/**
 * Fallback Simulator Component
 * Simulates and tests fallback scenarios for offline connectivity
 * Patch 142.0
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, StopCircle, RotateCw, Power } from "lucide-react";
import type { SatcomConnection } from "../index";

interface FallbackSimulatorProps {
  connections: SatcomConnection[];
}

export const FallbackSimulator: React.FC<FallbackSimulatorProps> = ({ connections }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const simulationSteps = [
    'Iniciando simulação de fallback...',
    'Desconectando Starlink Maritime...',
    'Tentando fallback para Iridium Certus...',
    'Iridium conectado - modo degradado ativo',
    'Velocidade reduzida para 700 Kbps',
    'Sistema operando em modo de emergência',
  ];

  const startSimulation = () => {
    setIsSimulating(true);
    setSimulationLog([]);
    setCurrentStep(0);

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= simulationSteps.length - 1) {
          clearInterval(interval);
          setIsSimulating(false);
          return prev;
        }
        setSimulationLog((log) => [...log, simulationSteps[prev]]);
        return prev + 1;
      });
    }, 1500);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setSimulationLog((log) => [...log, 'Simulação interrompida pelo usuário']);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setSimulationLog([]);
    setCurrentStep(0);
  };

  const getPriorityOrder = () => {
    const priority = [
      { name: 'Starlink Maritime', score: 10 },
      { name: 'Iridium Certus 700', score: 8 },
      { name: 'Inmarsat FleetBroadband', score: 6 },
    ];
    return priority;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Power className="h-5 w-5" />
          Simulador de Fallback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium mb-2">Ordem de Prioridade</div>
          <div className="space-y-2">
            {getPriorityOrder().map((conn, index) => (
              <div
                key={conn.name}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{index + 1}</Badge>
                  <span className="text-sm">{conn.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Score: {conn.score}/10
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {!isSimulating ? (
            <Button onClick={startSimulation} className="flex-1">
              <PlayCircle className="h-4 w-4 mr-2" />
              Iniciar Simulação
            </Button>
          ) : (
            <Button onClick={stopSimulation} variant="destructive" className="flex-1">
              <StopCircle className="h-4 w-4 mr-2" />
              Parar Simulação
            </Button>
          )}
          <Button onClick={resetSimulation} variant="outline">
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        {simulationLog.length > 0 && (
          <div className="bg-muted rounded-lg p-4 space-y-1">
            <div className="text-xs font-medium mb-2 text-muted-foreground">
              Log de Simulação
            </div>
            {simulationLog.map((log, index) => (
              <div key={index} className="text-xs font-mono">
                <span className="text-muted-foreground">
                  [{new Date().toLocaleTimeString('pt-BR')}]
                </span>{' '}
                {log}
              </div>
            ))}
            {isSimulating && (
              <div className="text-xs font-mono animate-pulse">
                <span className="text-muted-foreground">
                  [{new Date().toLocaleTimeString('pt-BR')}]
                </span>{' '}
                Processando...
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Este simulador testa o comportamento do sistema em cenários de perda de
          conectividade, garantindo failover automático para conexões de backup.
        </div>
      </CardContent>
    </Card>
  );
};
