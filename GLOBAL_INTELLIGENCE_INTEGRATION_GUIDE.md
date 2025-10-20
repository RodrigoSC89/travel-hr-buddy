# 🔌 Nautilus Global Intelligence - Integration Guide

**Phase 5**: TypeScript/React Integration Patterns | **Version**: 1.0.0

## 📋 Table of Contents

1. [Overview](#overview)
2. [TypeScript Integration](#typescript-integration)
3. [React Components](#react-components)
4. [API Endpoints](#api-endpoints)
5. [State Management](#state-management)
6. [Real-time Updates](#real-time-updates)
7. [Error Handling](#error-handling)
8. [Testing](#testing)

## Overview

This guide demonstrates how to integrate the Python-based Global Intelligence system with the existing TypeScript/React application in Nautilus One Pro.

### Integration Approaches

1. **Direct Execution**: Run Python scripts from Node.js
2. **REST API**: Wrap Python in Flask/FastAPI
3. **WebSocket**: Real-time data streaming
4. **Scheduled Tasks**: Cron-based execution

## TypeScript Integration

### 1. Direct Python Execution

Create a service to execute Python scripts from TypeScript:

```typescript
// src/services/globalIntelligence.ts

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface RiskPrediction {
  embarcacao: string;
  risco: number;
  nivel: 'CRÍTICO' | 'ALTO' | 'MODERADO' | 'BAIXO';
}

export interface GlobalIntelligenceResult {
  success: boolean;
  predictions?: RiskPrediction[];
  error?: string;
  executionTime?: number;
}

export class GlobalIntelligenceService {
  private pythonPath = 'python3';
  private scriptPath = 'modules/global_intelligence/demo.py';

  /**
   * Execute Global Intelligence workflow
   */
  async run(): Promise<GlobalIntelligenceResult> {
    const startTime = Date.now();

    try {
      const { stdout, stderr } = await execAsync(
        `${this.pythonPath} ${this.scriptPath}`
      );

      if (stderr && !stderr.includes('warning')) {
        console.error('Global Intelligence stderr:', stderr);
      }

      const executionTime = Date.now() - startTime;
      const predictions = this.parseOutput(stdout);

      return {
        success: true,
        predictions,
        executionTime
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Parse Python script output to extract predictions
   */
  private parseOutput(output: string): RiskPrediction[] {
    const predictions: RiskPrediction[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      // Match pattern: " - Vessel Name: risco XX.X% 🟢 BAIXO"
      const match = line.match(/- (.+): risco (\d+\.?\d*)% (.+) (.+)$/);
      if (match) {
        const [, embarcacao, risco, , nivel] = match;
        predictions.push({
          embarcacao: embarcacao.trim(),
          risco: parseFloat(risco),
          nivel: this.parseNivel(nivel.trim())
        });
      }
    }

    return predictions;
  }

  /**
   * Convert status text to enum
   */
  private parseNivel(nivel: string): RiskPrediction['nivel'] {
    if (nivel.includes('CRÍTICO')) return 'CRÍTICO';
    if (nivel.includes('ALTO')) return 'ALTO';
    if (nivel.includes('MODERADO')) return 'MODERADO';
    return 'BAIXO';
  }

  /**
   * Get cached predictions (from previous run)
   */
  async getCachedPredictions(): Promise<RiskPrediction[]> {
    // TODO: Implement caching mechanism
    // Could read from a JSON file or database
    return [];
  }
}

// Export singleton instance
export const globalIntelligence = new GlobalIntelligenceService();
```

### 2. Type Definitions

```typescript
// src/types/globalIntelligence.ts

export interface FleetVessel {
  embarcacao: string;
  score_peodp: number;
  falhas_dp: number;
  tempo_dp: number;
  alertas_criticos: number;
  ultima_atualizacao?: string;
}

export interface RiskClassification {
  level: 'CRÍTICO' | 'ALTO' | 'MODERADO' | 'BAIXO';
  color: string;
  icon: string;
  threshold: [number, number];
}

export const RISK_CLASSIFICATIONS: Record<string, RiskClassification> = {
  CRÍTICO: {
    level: 'CRÍTICO',
    color: '#DC2626', // red-600
    icon: '🚨',
    threshold: [81, 100]
  },
  ALTO: {
    level: 'ALTO',
    color: '#EF4444', // red-500
    icon: '🔴',
    threshold: [71, 80]
  },
  MODERADO: {
    level: 'MODERADO',
    color: '#F59E0B', // amber-500
    icon: '🟡',
    threshold: [41, 70]
  },
  BAIXO: {
    level: 'BAIXO',
    color: '#10B981', // green-500
    icon: '🟢',
    threshold: [0, 40]
  }
};

export function getRiskClassification(risco: number): RiskClassification {
  if (risco >= 81) return RISK_CLASSIFICATIONS.CRÍTICO;
  if (risco >= 71) return RISK_CLASSIFICATIONS.ALTO;
  if (risco >= 41) return RISK_CLASSIFICATIONS.MODERADO;
  return RISK_CLASSIFICATIONS.BAIXO;
}
```

## React Components

### 1. Fleet Risk Dashboard Component

```tsx
// src/components/GlobalIntelligence/FleetRiskDashboard.tsx

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { globalIntelligence, RiskPrediction } from '@/services/globalIntelligence';
import { getRiskClassification } from '@/types/globalIntelligence';

export function FleetRiskDashboard() {
  const [predictions, setPredictions] = useState<RiskPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await globalIntelligence.run();

      if (result.success && result.predictions) {
        setPredictions(result.predictions);
        setLastUpdate(new Date());
      } else {
        setError(result.error || 'Falha ao executar análise');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  const criticalCount = predictions.filter(p => p.nivel === 'CRÍTICO').length;
  const highCount = predictions.filter(p => p.nivel === 'ALTO').length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">
            🌍 Global Intelligence - Risco da Frota
          </CardTitle>
          <Button
            onClick={runAnalysis}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Atualizar</span>
          </Button>
        </div>
        {lastUpdate && (
          <p className="text-sm text-muted-foreground">
            Última atualização: {lastUpdate.toLocaleString('pt-BR')}
          </p>
        )}
      </CardHeader>

      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-4">
            <p className="font-semibold">Erro:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Fleet Summary */}
        {predictions.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <SummaryCard
              title="Total"
              value={predictions.length}
              icon="🚢"
              color="bg-blue-100 text-blue-800"
            />
            <SummaryCard
              title="Crítico"
              value={criticalCount}
              icon="🚨"
              color="bg-red-100 text-red-800"
            />
            <SummaryCard
              title="Alto"
              value={highCount}
              icon="🔴"
              color="bg-orange-100 text-orange-800"
            />
            <SummaryCard
              title="Normal"
              value={predictions.length - criticalCount - highCount}
              icon="🟢"
              color="bg-green-100 text-green-800"
            />
          </div>
        )}

        {/* Vessel List */}
        <div className="space-y-3">
          {predictions.map((prediction) => (
            <VesselRiskCard key={prediction.embarcacao} prediction={prediction} />
          ))}
        </div>

        {predictions.length === 0 && !loading && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum dado disponível</p>
            <p className="text-sm">Clique em "Atualizar" para executar análise</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Summary Card Component
interface SummaryCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
}

function SummaryCard({ title, value, icon, color }: SummaryCardProps) {
  return (
    <div className={`p-4 rounded-lg ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

// Vessel Risk Card Component
interface VesselRiskCardProps {
  prediction: RiskPrediction;
}

function VesselRiskCard({ prediction }: VesselRiskCardProps) {
  const classification = getRiskClassification(prediction.risco);

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{classification.icon}</span>
          <div>
            <h3 className="font-semibold">{prediction.embarcacao}</h3>
            <p className="text-sm text-muted-foreground">
              Nível: {prediction.nivel}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p
            className="text-2xl font-bold"
            style={{ color: classification.color }}
          >
            {prediction.risco.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Risk Bar */}
      <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${prediction.risco}%`,
            backgroundColor: classification.color
          }}
        />
      </div>
    </div>
  );
}
```

### 2. Admin Page Integration

```tsx
// src/pages/admin/global-intelligence.tsx

import { FleetRiskDashboard } from '@/components/GlobalIntelligence/FleetRiskDashboard';

export default function GlobalIntelligencePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          🌍 Nautilus Global Intelligence
        </h1>
        <p className="text-muted-foreground">
          Sistema de aprendizado de IA em toda a frota
        </p>
      </div>

      <FleetRiskDashboard />
    </div>
  );
}
```

## API Endpoints

### REST API with Express (Future Enhancement)

```typescript
// src/api/routes/globalIntelligence.ts

import { Router } from 'express';
import { globalIntelligence } from '@/services/globalIntelligence';

const router = Router();

/**
 * POST /api/global-intelligence/run
 * Execute Global Intelligence analysis
 */
router.post('/run', async (req, res) => {
  try {
    const result = await globalIntelligence.run();

    if (result.success) {
      res.json({
        success: true,
        data: result.predictions,
        executionTime: result.executionTime
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/global-intelligence/predictions
 * Get cached predictions
 */
router.get('/predictions', async (req, res) => {
  try {
    const predictions = await globalIntelligence.getCachedPredictions();
    res.json({ success: true, data: predictions });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
```

## State Management

### Zustand Store (Recommended)

```typescript
// src/stores/globalIntelligence.ts

import { create } from 'zustand';
import { RiskPrediction } from '@/types/globalIntelligence';
import { globalIntelligence } from '@/services/globalIntelligence';

interface GlobalIntelligenceState {
  predictions: RiskPrediction[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  runAnalysis: () => Promise<void>;
  clearError: () => void;
}

export const useGlobalIntelligence = create<GlobalIntelligenceState>((set) => ({
  predictions: [],
  loading: false,
  error: null,
  lastUpdate: null,

  runAnalysis: async () => {
    set({ loading: true, error: null });

    try {
      const result = await globalIntelligence.run();

      if (result.success && result.predictions) {
        set({
          predictions: result.predictions,
          lastUpdate: new Date(),
          loading: false
        });
      } else {
        set({
          error: result.error || 'Falha ao executar análise',
          loading: false
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false
      });
    }
  },

  clearError: () => set({ error: null })
}));
```

## Real-time Updates

### Polling Implementation

```typescript
// src/hooks/useGlobalIntelligencePolling.ts

import { useEffect, useRef } from 'react';
import { useGlobalIntelligence } from '@/stores/globalIntelligence';

export function useGlobalIntelligencePolling(intervalMs: number = 300000) { // 5 min
  const runAnalysis = useGlobalIntelligence((state) => state.runAnalysis);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Run immediately
    runAnalysis();

    // Set up polling
    intervalRef.current = setInterval(() => {
      runAnalysis();
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [intervalMs, runAnalysis]);
}
```

## Error Handling

### Error Boundary Component

```tsx
// src/components/GlobalIntelligence/ErrorBoundary.tsx

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GlobalIntelligenceErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro no Global Intelligence</AlertTitle>
          <AlertDescription>
            {this.state.error?.message || 'Erro desconhecido'}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

## Testing

### Unit Tests

```typescript
// src/services/globalIntelligence.test.ts

import { describe, it, expect, vi } from 'vitest';
import { GlobalIntelligenceService } from './globalIntelligence';

describe('GlobalIntelligenceService', () => {
  it('should parse output correctly', async () => {
    const service = new GlobalIntelligenceService();
    const mockOutput = `
📈 Painel Global de Risco e Conformidade:
 - Nautilus Explorer: risco 95.8% 🚨 CRÍTICO
 - Nautilus Endeavor: risco 12.3% 🟢 BAIXO
    `;

    const predictions = (service as any).parseOutput(mockOutput);

    expect(predictions).toHaveLength(2);
    expect(predictions[0]).toEqual({
      embarcacao: 'Nautilus Explorer',
      risco: 95.8,
      nivel: 'CRÍTICO'
    });
  });

  it('should handle execution errors', async () => {
    const service = new GlobalIntelligenceService();
    vi.spyOn(service as any, 'execAsync').mockRejectedValue(
      new Error('Python not found')
    );

    const result = await service.run();

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// src/components/GlobalIntelligence/FleetRiskDashboard.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import { FleetRiskDashboard } from './FleetRiskDashboard';
import { globalIntelligence } from '@/services/globalIntelligence';
import { vi } from 'vitest';

vi.mock('@/services/globalIntelligence');

describe('FleetRiskDashboard', () => {
  it('should render predictions', async () => {
    vi.mocked(globalIntelligence.run).mockResolvedValue({
      success: true,
      predictions: [
        { embarcacao: 'Test Vessel', risco: 75, nivel: 'ALTO' }
      ]
    });

    render(<FleetRiskDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Test Vessel')).toBeInTheDocument();
      expect(screen.getByText('75.0%')).toBeInTheDocument();
    });
  });
});
```

## Summary

This integration guide provides multiple patterns for connecting the Python-based Global Intelligence system with the TypeScript/React frontend. Choose the approach that best fits your architecture:

- **Direct execution** for simple deployments
- **REST API** for scalability
- **State management** for complex UIs
- **Real-time polling** for live updates

---

**Navigation**: [← Index](GLOBAL_INTELLIGENCE_INDEX.md) | [Implementation →](GLOBAL_INTELLIGENCE_IMPLEMENTATION.md) | [Summary →](PHASE_5_COMPLETION_SUMMARY.md)
