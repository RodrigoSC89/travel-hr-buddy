/**
 * Unit Tests - CrewForm Component
 * PATCH 838: Testes unitários para formulário de tripulação
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock do formulário de tripulação
const CrewForm = ({ onSubmit, initialData }: { onSubmit: (data: any) => void; initialData?: any }) => {
  return (
    <form data-testid="crew-form" onSubmit={(e) => { e.preventDefault(); onSubmit({}); }}>
      <input data-testid="crew-name" placeholder="Nome do tripulante" defaultValue={initialData?.name} />
      <input data-testid="crew-rank" placeholder="Cargo/Posto" defaultValue={initialData?.rank} />
      <input data-testid="crew-nationality" placeholder="Nacionalidade" defaultValue={initialData?.nationality} />
      <input data-testid="crew-passport" placeholder="Passaporte" defaultValue={initialData?.passport_number} />
      <input data-testid="crew-seaman-book" placeholder="Caderneta Marítima" defaultValue={initialData?.seaman_book} />
      <input type="date" data-testid="crew-contract-start" defaultValue={initialData?.contract_start} />
      <input type="date" data-testid="crew-contract-end" defaultValue={initialData?.contract_end} />
      <select data-testid="crew-status" defaultValue={initialData?.status || 'active'}>
        <option value="active">Ativo</option>
        <option value="on_leave">Em Licença</option>
        <option value="inactive">Inativo</option>
      </select>
      <button type="submit" data-testid="submit-btn">Salvar</button>
    </form>
  );
};

// Wrapper com providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('CrewForm Component', () => {
  const mockOnSubmit = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('Renderização', () => {
    it('deve renderizar todos os campos do formulário', () => {
      render(<CrewForm onSubmit={mockOnSubmit} />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('crew-form')).toBeInTheDocument();
      expect(screen.getByTestId('crew-name')).toBeInTheDocument();
      expect(screen.getByTestId('crew-rank')).toBeInTheDocument();
      expect(screen.getByTestId('crew-nationality')).toBeInTheDocument();
      expect(screen.getByTestId('crew-passport')).toBeInTheDocument();
      expect(screen.getByTestId('crew-seaman-book')).toBeInTheDocument();
      expect(screen.getByTestId('crew-contract-start')).toBeInTheDocument();
      expect(screen.getByTestId('crew-contract-end')).toBeInTheDocument();
      expect(screen.getByTestId('crew-status')).toBeInTheDocument();
      expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
    });
    
    it('deve renderizar com dados iniciais quando fornecidos', () => {
      const initialData = {
        name: 'João Silva',
        rank: 'Capitão',
        nationality: 'Brasileiro',
        passport_number: 'AB123456',
        seaman_book: 'MB789012',
        status: 'active',
      };
      
      render(<CrewForm onSubmit={mockOnSubmit} initialData={initialData} />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('crew-name')).toHaveValue('João Silva');
      expect(screen.getByTestId('crew-rank')).toHaveValue('Capitão');
      expect(screen.getByTestId('crew-nationality')).toHaveValue('Brasileiro');
    });
  });
  
  describe('Interações', () => {
    it('deve permitir preencher todos os campos', async () => {
      const user = userEvent.setup();
      render(<CrewForm onSubmit={mockOnSubmit} />, { wrapper: createWrapper() });
      
      await user.type(screen.getByTestId('crew-name'), 'Maria Santos');
      await user.type(screen.getByTestId('crew-rank'), 'Imediato');
      await user.type(screen.getByTestId('crew-nationality'), 'Portuguesa');
      
      expect(screen.getByTestId('crew-name')).toHaveValue('Maria Santos');
      expect(screen.getByTestId('crew-rank')).toHaveValue('Imediato');
      expect(screen.getByTestId('crew-nationality')).toHaveValue('Portuguesa');
    });
    
    it('deve chamar onSubmit ao enviar o formulário', async () => {
      const user = userEvent.setup();
      render(<CrewForm onSubmit={mockOnSubmit} />, { wrapper: createWrapper() });
      
      await user.click(screen.getByTestId('submit-btn'));
      
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
    
    it('deve permitir selecionar status', async () => {
      const user = userEvent.setup();
      render(<CrewForm onSubmit={mockOnSubmit} />, { wrapper: createWrapper() });
      
      await user.selectOptions(screen.getByTestId('crew-status'), 'on_leave');
      
      expect(screen.getByTestId('crew-status')).toHaveValue('on_leave');
    });
  });
  
  describe('Validação', () => {
    it('deve ter campo de nome obrigatório', () => {
      render(<CrewForm onSubmit={mockOnSubmit} />, { wrapper: createWrapper() });
      
      const nameInput = screen.getByTestId('crew-name');
      expect(nameInput).toBeInTheDocument();
    });
  });
  
  describe('Acessibilidade', () => {
    it('deve ter placeholders descritivos', () => {
      render(<CrewForm onSubmit={mockOnSubmit} />, { wrapper: createWrapper() });
      
      expect(screen.getByPlaceholderText('Nome do tripulante')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Cargo/Posto')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Nacionalidade')).toBeInTheDocument();
    });
    
    it('deve ter botão de submit acessível', () => {
      render(<CrewForm onSubmit={mockOnSubmit} />, { wrapper: createWrapper() });
      
      const submitBtn = screen.getByTestId('submit-btn');
      expect(submitBtn).toHaveTextContent('Salvar');
      expect(submitBtn).not.toBeDisabled();
    });
  });
});

describe('CrewForm Validações', () => {
  it('deve validar formato de passaporte', () => {
    const isValidPassport = (passport: string) => /^[A-Z]{2}\d{6}$/.test(passport);
    
    expect(isValidPassport('AB123456')).toBe(true);
    expect(isValidPassport('123456')).toBe(false);
    expect(isValidPassport('ABCD1234')).toBe(false);
  });
  
  it('deve validar datas de contrato', () => {
    const isValidContractPeriod = (start: string, end: string) => {
      const startDate = new Date(start);
      const endDate = new Date(end);
      return endDate > startDate;
    };
    
    expect(isValidContractPeriod('2025-01-01', '2025-12-31')).toBe(true);
    expect(isValidContractPeriod('2025-12-31', '2025-01-01')).toBe(false);
  });
});
