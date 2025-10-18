import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SGSOIncidentForm } from '@/components/sgso/SGSOIncidentForm';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('SGSOIncidentForm', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should render form with create mode', () => {
    render(
      <SGSOIncidentForm
        open={true}
        onOpenChange={mockOnOpenChange}
        incident={null}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Novo Incidente SGSO')).toBeInTheDocument();
    expect(screen.getByText('Registre um novo incidente de segurança operacional')).toBeInTheDocument();
  });

  it('should render form with edit mode', () => {
    const incident = {
      id: '1',
      type: 'Falha de sistema',
      description: 'Test description',
      severity: 'Alta',
      status: 'open',
      reported_at: '2025-01-01T10:00:00Z',
      corrective_action: 'Test action',
    };

    render(
      <SGSOIncidentForm
        open={true}
        onOpenChange={mockOnOpenChange}
        incident={incident}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Editar Incidente')).toBeInTheDocument();
    expect(screen.getByText('Atualize as informações do incidente')).toBeInTheDocument();
  });

  it('should have required fields marked', () => {
    render(
      <SGSOIncidentForm
        open={true}
        onOpenChange={mockOnOpenChange}
        incident={null}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByLabelText(/Tipo de Incidente/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Severidade/)).toBeInTheDocument();
  });

  it('should call onOpenChange when cancel button is clicked', () => {
    render(
      <SGSOIncidentForm
        open={true}
        onOpenChange={mockOnOpenChange}
        incident={null}
        onSave={mockOnSave}
      />
    );

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should have create button in new mode', async () => {
    render(
      <SGSOIncidentForm
        open={true}
        onOpenChange={mockOnOpenChange}
        incident={null}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Criar')).toBeInTheDocument();
  });

  it('should have update button in edit mode', async () => {
    const incident = {
      id: '1',
      type: 'Falha de sistema',
      description: 'Test description',
      severity: 'Alta',
      status: 'open',
      reported_at: '2025-01-01T10:00:00Z',
    };

    render(
      <SGSOIncidentForm
        open={true}
        onOpenChange={mockOnOpenChange}
        incident={incident}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Atualizar')).toBeInTheDocument();
  });

  it('should have all form fields available', () => {
    render(
      <SGSOIncidentForm
        open={true}
        onOpenChange={mockOnOpenChange}
        incident={null}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByLabelText(/Tipo de Incidente/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Severidade/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Data e Hora do Incidente/)).toBeInTheDocument();
  });
});
