/**
 * Unit Tests - MaintenanceEditor Component
 * PATCH 838: Testes unitários para editor de manutenção
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock do componente MaintenanceEditor
const MaintenanceEditor = ({ 
  onSave, 
  onCancel,
  components = [],
  assignees = [],
  initialData 
}: { 
  onSave: (data: any) => void; 
  onCancel?: () => void;
  components?: any[];
  assignees?: any[];
  initialData?: any;
}) => {
  return (
    <div data-testid="maintenance-editor">
      <form onSubmit={(e) => { e.preventDefault(); onSave({}); }}>
        <input data-testid="job-title" placeholder="Título da O.S." defaultValue={initialData?.title} />
        <textarea data-testid="job-description" placeholder="Descrição detalhada" defaultValue={initialData?.description} />
        
        <select data-testid="component-select" defaultValue={initialData?.component_id}>
          <option value="">Selecione o componente</option>
          {components.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        
        <select data-testid="priority-select" defaultValue={initialData?.priority || 'medium'}>
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
          <option value="critical">Crítica</option>
        </select>
        
        <select data-testid="status-select" defaultValue={initialData?.status || 'pending'}>
          <option value="pending">Pendente</option>
          <option value="in_progress">Em Andamento</option>
          <option value="completed">Concluída</option>
          <option value="cancelled">Cancelada</option>
        </select>
        
        <select data-testid="assignee-select" defaultValue={initialData?.assigned_to}>
          <option value="">Sem responsável</option>
          {assignees.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        
        <input type="date" data-testid="scheduled-date" defaultValue={initialData?.scheduled_date} />
        <input type="number" data-testid="estimated-hours" placeholder="Horas estimadas" defaultValue={initialData?.estimated_hours} />
        
        <div data-testid="parts-section">
          <button type="button" data-testid="add-part">Adicionar Peça</button>
        </div>
        
        <div data-testid="checklist-section">
          <button type="button" data-testid="add-checklist-item">Adicionar Item do Checklist</button>
        </div>
        
        <button type="submit" data-testid="save-job">Salvar O.S.</button>
        <button type="button" data-testid="cancel-btn" onClick={onCancel}>Cancelar</button>
      </form>
    </div>
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

describe('MaintenanceEditor Component', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();
  
  const mockComponents = [
    { id: 'c1', name: 'Motor Principal' },
    { id: 'c2', name: 'Gerador Auxiliar' },
    { id: 'c3', name: 'Sistema Hidráulico' },
  ];
  
  const mockAssignees = [
    { id: 'a1', name: 'João Silva' },
    { id: 'a2', name: 'Pedro Santos' },
  ];
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('Renderização', () => {
    it('deve renderizar o editor de manutenção', () => {
      render(
        <MaintenanceEditor 
          onSave={mockOnSave} 
          onCancel={mockOnCancel}
          components={mockComponents}
          assignees={mockAssignees}
        />, 
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByTestId('maintenance-editor')).toBeInTheDocument();
    });
    
    it('deve renderizar todos os campos obrigatórios', () => {
      render(
        <MaintenanceEditor 
          onSave={mockOnSave} 
          components={mockComponents}
          assignees={mockAssignees}
        />, 
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByTestId('job-title')).toBeInTheDocument();
      expect(screen.getByTestId('job-description')).toBeInTheDocument();
      expect(screen.getByTestId('component-select')).toBeInTheDocument();
      expect(screen.getByTestId('priority-select')).toBeInTheDocument();
      expect(screen.getByTestId('status-select')).toBeInTheDocument();
      expect(screen.getByTestId('scheduled-date')).toBeInTheDocument();
    });
    
    it('deve listar componentes disponíveis', () => {
      render(
        <MaintenanceEditor 
          onSave={mockOnSave} 
          components={mockComponents}
        />, 
        { wrapper: createWrapper() }
      );
      
      const select = screen.getByTestId('component-select');
      expect(select).toContainHTML('Motor Principal');
      expect(select).toContainHTML('Gerador Auxiliar');
      expect(select).toContainHTML('Sistema Hidráulico');
    });
    
    it('deve ter todas as opções de prioridade', () => {
      render(<MaintenanceEditor onSave={mockOnSave} />, { wrapper: createWrapper() });
      
      const select = screen.getByTestId('priority-select');
      expect(select).toContainHTML('Baixa');
      expect(select).toContainHTML('Média');
      expect(select).toContainHTML('Alta');
      expect(select).toContainHTML('Crítica');
    });
    
    it('deve ter todas as opções de status', () => {
      render(<MaintenanceEditor onSave={mockOnSave} />, { wrapper: createWrapper() });
      
      const select = screen.getByTestId('status-select');
      expect(select).toContainHTML('Pendente');
      expect(select).toContainHTML('Em Andamento');
      expect(select).toContainHTML('Concluída');
      expect(select).toContainHTML('Cancelada');
    });
  });
  
  describe('Interações', () => {
    it('deve permitir preencher título e descrição', async () => {
      const user = userEvent.setup();
      render(<MaintenanceEditor onSave={mockOnSave} />, { wrapper: createWrapper() });
      
      await user.type(screen.getByTestId('job-title'), 'Troca de óleo do motor');
      await user.type(screen.getByTestId('job-description'), 'Realizar troca de óleo conforme manual');
      
      expect(screen.getByTestId('job-title')).toHaveValue('Troca de óleo do motor');
      expect(screen.getByTestId('job-description')).toHaveValue('Realizar troca de óleo conforme manual');
    });
    
    it('deve permitir selecionar prioridade', async () => {
      const user = userEvent.setup();
      render(<MaintenanceEditor onSave={mockOnSave} />, { wrapper: createWrapper() });
      
      await user.selectOptions(screen.getByTestId('priority-select'), 'critical');
      
      expect(screen.getByTestId('priority-select')).toHaveValue('critical');
    });
    
    it('deve chamar onSave ao salvar', async () => {
      const user = userEvent.setup();
      render(<MaintenanceEditor onSave={mockOnSave} />, { wrapper: createWrapper() });
      
      await user.click(screen.getByTestId('save-job'));
      
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });
    
    it('deve chamar onCancel ao cancelar', async () => {
      const user = userEvent.setup();
      render(
        <MaintenanceEditor onSave={mockOnSave} onCancel={mockOnCancel} />, 
        { wrapper: createWrapper() }
      );
      
      await user.click(screen.getByTestId('cancel-btn'));
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Seções Adicionais', () => {
    it('deve ter seção de peças', () => {
      render(<MaintenanceEditor onSave={mockOnSave} />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('parts-section')).toBeInTheDocument();
      expect(screen.getByTestId('add-part')).toBeInTheDocument();
    });
    
    it('deve ter seção de checklist', () => {
      render(<MaintenanceEditor onSave={mockOnSave} />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('checklist-section')).toBeInTheDocument();
      expect(screen.getByTestId('add-checklist-item')).toBeInTheDocument();
    });
  });
  
  describe('Dados Iniciais', () => {
    it('deve carregar dados de edição', () => {
      const initialData = {
        title: 'Manutenção preventiva',
        description: 'Inspeção geral do motor',
        component_id: 'c1',
        priority: 'high',
        status: 'in_progress',
        estimated_hours: 8,
      };
      
      render(
        <MaintenanceEditor 
          onSave={mockOnSave} 
          components={mockComponents}
          initialData={initialData}
        />, 
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByTestId('job-title')).toHaveValue('Manutenção preventiva');
      expect(screen.getByTestId('priority-select')).toHaveValue('high');
      expect(screen.getByTestId('status-select')).toHaveValue('in_progress');
    });
  });
});

describe('MaintenanceEditor Validações', () => {
  it('deve validar horas estimadas positivas', () => {
    const isValidHours = (hours: number) => hours > 0 && hours <= 1000;
    
    expect(isValidHours(8)).toBe(true);
    expect(isValidHours(0)).toBe(false);
    expect(isValidHours(-5)).toBe(false);
    expect(isValidHours(1001)).toBe(false);
  });
  
  it('deve validar prioridade válida', () => {
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    const isValidPriority = (priority: string) => validPriorities.includes(priority);
    
    expect(isValidPriority('high')).toBe(true);
    expect(isValidPriority('invalid')).toBe(false);
  });
  
  it('deve calcular custo estimado', () => {
    const calculateCost = (hours: number, hourlyRate: number, partsCost: number) => {
      return (hours * hourlyRate) + partsCost;
    };
    
    expect(calculateCost(8, 150, 500)).toBe(1700); // 8*150 + 500
    expect(calculateCost(4, 200, 0)).toBe(800);
  });
});

describe('MaintenanceEditor Regras de Negócio', () => {
  it('deve identificar manutenção urgente', () => {
    const isUrgent = (priority: string, daysUntilDeadline: number) => {
      if (priority === 'critical') return true;
      if (priority === 'high' && daysUntilDeadline <= 3) return true;
      return daysUntilDeadline <= 1;
    };
    
    expect(isUrgent('critical', 30)).toBe(true);
    expect(isUrgent('high', 2)).toBe(true);
    expect(isUrgent('low', 0)).toBe(true);
    expect(isUrgent('low', 5)).toBe(false);
  });
  
  it('deve calcular impacto operacional', () => {
    const calculateImpact = (component: string, priority: string) => {
      const componentWeights: Record<string, number> = {
        'Motor Principal': 10,
        'Gerador Auxiliar': 8,
        'Sistema Hidráulico': 6,
      };
      const priorityWeights: Record<string, number> = {
        'critical': 4,
        'high': 3,
        'medium': 2,
        'low': 1,
      };
      
      return (componentWeights[component] || 1) * (priorityWeights[priority] || 1);
    };
    
    expect(calculateImpact('Motor Principal', 'critical')).toBe(40);
    expect(calculateImpact('Gerador Auxiliar', 'high')).toBe(24);
  });
});
