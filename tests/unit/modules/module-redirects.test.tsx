/**
 * Module Redirects Test Suite
 * Verifica se todos os módulos legados redirecionam corretamente para módulos unificados
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock Navigate component to capture redirect destination
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to, replace }: { to: string; replace?: boolean }) => {
      mockNavigate(to, replace);
      return null;
    },
  };
});

// Import redirects
import SolasTrainingRedirect from '@/modules/solas-training/redirect';
import TrainingSimulationRedirect from '@/modules/training-simulation/redirect';
import AutoSubRedirect from '@/modules/auto-sub/redirect';
import DeepRiskAIRedirect from '@/modules/deep-risk-ai/redirect';
import SonarAIRedirect from '@/modules/sonar-ai/redirect';
import VoyagePlannerRedirect from '@/modules/voyage-planner/redirect';
import DocumentHubRedirect from '@/modules/document-hub/redirect';
import SatelliteRedirect from '@/modules/satellite/redirect';
import WorkflowVisualRedirect from '@/modules/workflow-visual/redirect';
import MaintenancePlannerRedirect from '@/modules/maintenance-planner/redirect';
import AssistantRedirect from '@/modules/assistant/redirect';

describe('Module Redirects', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const testRedirect = (Component: React.ComponentType, expectedPath: string, name: string) => {
    it(`${name} redirects to ${expectedPath}`, () => {
      render(
        <MemoryRouter>
          <Component />
        </MemoryRouter>
      );
      expect(mockNavigate).toHaveBeenCalledWith(expectedPath, true);
    });
  };

  describe('Training Modules → Nautilus Academy', () => {
    testRedirect(SolasTrainingRedirect, '/nautilus-academy', 'solas-training');
    testRedirect(TrainingSimulationRedirect, '/nautilus-academy', 'training-simulation');
  });

  describe('Subsea Modules → Subsea Operations', () => {
    testRedirect(AutoSubRedirect, '/subsea-operations', 'auto-sub');
    testRedirect(DeepRiskAIRedirect, '/subsea-operations', 'deep-risk-ai');
    testRedirect(SonarAIRedirect, '/subsea-operations', 'sonar-ai');
  });

  describe('Voyage Modules → Nautilus Voyage', () => {
    testRedirect(VoyagePlannerRedirect, '/nautilus-voyage', 'voyage-planner');
  });

  describe('Document Modules → Nautilus Documents', () => {
    testRedirect(DocumentHubRedirect, '/nautilus-documents', 'document-hub');
  });

  describe('Satellite Modules → Nautilus Satellite', () => {
    testRedirect(SatelliteRedirect, '/nautilus-satellite', 'satellite');
  });

  describe('Automation Modules → Nautilus Automation', () => {
    testRedirect(WorkflowVisualRedirect, '/nautilus-automation', 'workflow-visual');
  });

  describe('Maintenance Modules → Nautilus Maintenance', () => {
    testRedirect(MaintenancePlannerRedirect, '/nautilus-maintenance', 'maintenance-planner');
  });

  describe('Assistant Modules → Nautilus Assistant', () => {
    testRedirect(AssistantRedirect, '/nautilus-assistant', 'assistant');
  });
});
