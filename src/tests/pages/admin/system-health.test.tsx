import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SystemHealth from '@/pages/admin/SystemHealth';
import * as systemHealthLib from '@/lib/systemHealth';

// Mock the systemHealth library
vi.mock('@/lib/systemHealth', () => ({
  runAutomatedTests: vi.fn(),
}));

const mockRunAutomatedTests = systemHealthLib.runAutomatedTests as ReturnType<typeof vi.fn>;

describe('SystemHealth Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockRunAutomatedTests.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <BrowserRouter>
        <SystemHealth />
      </BrowserRouter>
    );

    expect(screen.getByText(/Carregando validação/i)).toBeInTheDocument();
  });

  it('should display test results when all tests pass', async () => {
    mockRunAutomatedTests.mockResolvedValue({
      success: true,
      total: 1597,
      failed: 0,
      lastRun: '2025-10-15T18:22:00.000Z',
    });

    render(
      <BrowserRouter>
        <SystemHealth />
      </BrowserRouter>
    );

    await waitFor(() => {
      const passedElements = screen.getAllByText('100% Passed');
      expect(passedElements.length).toBeGreaterThan(0);
    });

    const totalElements = screen.getAllByText('1597');
    expect(totalElements.length).toBeGreaterThan(0);
  });

  it('should display failure status when tests fail', async () => {
    mockRunAutomatedTests.mockResolvedValue({
      success: false,
      total: 1597,
      failed: 5,
      lastRun: '2025-10-15T18:22:00.000Z',
    });

    render(
      <BrowserRouter>
        <SystemHealth />
      </BrowserRouter>
    );

    await waitFor(() => {
      const failureElements = screen.getAllByText(/5 Falhas/i);
      expect(failureElements.length).toBeGreaterThan(0);
    });

    const totalElements = screen.getAllByText('1597');
    expect(totalElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/Failed/)).toBeInTheDocument();
  });

  it('should render page title and description', () => {
    mockRunAutomatedTests.mockResolvedValue({
      success: true,
      total: 1597,
      failed: 0,
      lastRun: '2025-10-15T18:22:00.000Z',
    });

    render(
      <BrowserRouter>
        <SystemHealth />
      </BrowserRouter>
    );

    expect(screen.getByText('Validação do Sistema')).toBeInTheDocument();
    expect(
      screen.getByText(/Status dos testes automatizados/i)
    ).toBeInTheDocument();
  });

  it('should display detailed information section', async () => {
    mockRunAutomatedTests.mockResolvedValue({
      success: true,
      total: 1597,
      failed: 0,
      lastRun: '2025-10-15T18:22:00.000Z',
    });

    render(
      <BrowserRouter>
        <SystemHealth />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Detalhes da Validação')).toBeInTheDocument();
    });

    expect(screen.getByText(/✅ Testes Automatizados:/)).toBeInTheDocument();
    expect(screen.getByText(/🧪 Total de Testes:/)).toBeInTheDocument();
    expect(screen.getByText(/⏱️ Último Teste:/)).toBeInTheDocument();
    expect(screen.getByText(/🔁 Resultado:/)).toBeInTheDocument();
  });
});
