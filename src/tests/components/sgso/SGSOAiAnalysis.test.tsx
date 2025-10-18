import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SGSOAiAnalysis } from '@/components/sgso/SGSOAiAnalysis';

describe('SGSOAiAnalysis', () => {
  it('should render AI analysis placeholder', () => {
    render(<SGSOAiAnalysis />);

    expect(screen.getByText('Análise com IA')).toBeInTheDocument();
    expect(screen.getByText('Análise inteligente de incidentes usando IA')).toBeInTheDocument();
  });

  it('should show "Em Breve" badge', () => {
    render(<SGSOAiAnalysis />);

    expect(screen.getByText('Em Breve')).toBeInTheDocument();
  });

  it('should display AI analysis features list', () => {
    render(<SGSOAiAnalysis />);

    expect(screen.getByText(/Identificação automática de padrões/)).toBeInTheDocument();
    expect(screen.getByText(/Análise de tendências e causas raiz/)).toBeInTheDocument();
    expect(screen.getByText(/Sugestões de ações corretivas/)).toBeInTheDocument();
    expect(screen.getByText(/Previsão de riscos potenciais/)).toBeInTheDocument();
    expect(screen.getByText(/Recomendações para melhorias/)).toBeInTheDocument();
  });

  it('should have disabled AI analysis button', () => {
    render(<SGSOAiAnalysis />);

    const button = screen.getByRole('button', { name: /Analisar com IA/i });
    expect(button).toBeDisabled();
  });

  it('should show future availability message', () => {
    render(<SGSOAiAnalysis />);

    expect(screen.getByText(/Esta funcionalidade estará disponível em uma versão futura/)).toBeInTheDocument();
  });
});
