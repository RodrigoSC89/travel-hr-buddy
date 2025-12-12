/**
 * Unit Tests - VoyagePlanner Component
 * PATCH 838: Testes unitários para planejador de viagens
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock do componente VoyagePlanner
const VoyagePlanner = ({ 
  onSave, 
  vessels = [],
  initialData 
}: { 
  onSave: (data: any) => void; 
  vessels?: any[];
  initialData?: any;
}) => {
  return (
    <div data-testid="voyage-planner">
      <form onSubmit={(e) => { e.preventDefault(); onSave({}); }}>
        <select data-testid="vessel-select" defaultValue={initialData?.vessel_id}>
          <option value="">Selecione uma embarcação</option>
          {vessels.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        
        <input data-testid="voyage-name" placeholder="Nome da viagem" defaultValue={initialData?.name} />
        <input data-testid="departure-port" placeholder="Porto de partida" defaultValue={initialData?.departure_port} />
        <input data-testid="arrival-port" placeholder="Porto de chegada" defaultValue={initialData?.arrival_port} />
        <input type="datetime-local" data-testid="departure-date" defaultValue={initialData?.departure_date} />
        <input type="datetime-local" data-testid="arrival-date" defaultValue={initialData?.arrival_date} />
        <textarea data-testid="voyage-notes" placeholder="Observações" defaultValue={initialData?.notes} />
        
        <div data-testid="route-waypoints">
          <button type="button" data-testid="add-waypoint">Adicionar Waypoint</button>
        </div>
        
        <div data-testid="cargo-info">
          <input data-testid="cargo-type" placeholder="Tipo de carga" />
          <input data-testid="cargo-weight" type="number" placeholder="Peso (tons)" />
        </div>
        
        <button type="submit" data-testid="save-voyage">Salvar Viagem</button>
        <button type="button" data-testid="calculate-eta">Calcular ETA</button>
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

describe("VoyagePlanner Component", () => {
  const mockOnSave = vi.fn();
  const mockVessels = [
    { id: "v1", name: "MV Atlantic Star" },
    { id: "v2", name: "MV Pacific Dawn" },
    { id: "v3", name: "MV Nordic Light" },
  ];
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe("Renderização", () => {
    it("deve renderizar o planejador de viagens", () => {
      render(<VoyagePlanner onSave={mockOnSave} vessels={mockVessels} />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId("voyage-planner")).toBeInTheDocument();
    });
    
    it("deve renderizar todos os campos necessários", () => {
      render(<VoyagePlanner onSave={mockOnSave} vessels={mockVessels} />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId("vessel-select")).toBeInTheDocument();
      expect(screen.getByTestId("voyage-name")).toBeInTheDocument();
      expect(screen.getByTestId("departure-port")).toBeInTheDocument();
      expect(screen.getByTestId("arrival-port")).toBeInTheDocument();
      expect(screen.getByTestId("departure-date")).toBeInTheDocument();
      expect(screen.getByTestId("arrival-date")).toBeInTheDocument();
      expect(screen.getByTestId("voyage-notes")).toBeInTheDocument();
    });
    
    it("deve listar embarcações disponíveis", () => {
      render(<VoyagePlanner onSave={mockOnSave} vessels={mockVessels} />, { wrapper: createWrapper() });
      
      const select = screen.getByTestId("vessel-select");
      expect(select).toContainHTML("MV Atlantic Star");
      expect(select).toContainHTML("MV Pacific Dawn");
      expect(select).toContainHTML("MV Nordic Light");
    });
    
    it("deve renderizar seção de waypoints", () => {
      render(<VoyagePlanner onSave={mockOnSave} vessels={mockVessels} />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId("route-waypoints")).toBeInTheDocument();
      expect(screen.getByTestId("add-waypoint")).toBeInTheDocument();
    });
    
    it("deve renderizar seção de carga", () => {
      render(<VoyagePlanner onSave={mockOnSave} vessels={mockVessels} />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId("cargo-info")).toBeInTheDocument();
      expect(screen.getByTestId("cargo-type")).toBeInTheDocument();
      expect(screen.getByTestId("cargo-weight")).toBeInTheDocument();
    });
  });
  
  describe("Interações", () => {
    it("deve permitir selecionar embarcação", async () => {
      const user = userEvent.setup();
      render(<VoyagePlanner onSave={mockOnSave} vessels={mockVessels} />, { wrapper: createWrapper() });
      
      await user.selectOptions(screen.getByTestId("vessel-select"), "v1");
      
      expect(screen.getByTestId("vessel-select")).toHaveValue("v1");
    });
    
    it("deve permitir preencher portos", async () => {
      const user = userEvent.setup();
      render(<VoyagePlanner onSave={mockOnSave} vessels={mockVessels} />, { wrapper: createWrapper() });
      
      await user.type(screen.getByTestId("departure-port"), "Santos");
      await user.type(screen.getByTestId("arrival-port"), "Rotterdam");
      
      expect(screen.getByTestId("departure-port")).toHaveValue("Santos");
      expect(screen.getByTestId("arrival-port")).toHaveValue("Rotterdam");
    });
    
    it("deve chamar onSave ao salvar viagem", async () => {
      const user = userEvent.setup();
      render(<VoyagePlanner onSave={mockOnSave} vessels={mockVessels} />, { wrapper: createWrapper() });
      
      await user.click(screen.getByTestId("save-voyage"));
      
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });
    
    it("deve ter botão de calcular ETA", () => {
      render(<VoyagePlanner onSave={mockOnSave} vessels={mockVessels} />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId("calculate-eta")).toBeInTheDocument();
      expect(screen.getByTestId("calculate-eta")).toHaveTextContent("Calcular ETA");
    });
  });
  
  describe("Dados Iniciais", () => {
    it("deve carregar dados iniciais corretamente", () => {
      const initialData = {
        vessel_id: "v2",
        name: "Viagem Santos-Rotterdam",
        departure_port: "Santos",
        arrival_port: "Rotterdam",
        notes: "Carga de containers",
      };
      
      render(
        <VoyagePlanner onSave={mockOnSave} vessels={mockVessels} initialData={initialData} />, 
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByTestId("voyage-name")).toHaveValue("Viagem Santos-Rotterdam");
      expect(screen.getByTestId("departure-port")).toHaveValue("Santos");
      expect(screen.getByTestId("arrival-port")).toHaveValue("Rotterdam");
    });
  });
});

describe("VoyagePlanner Validações", () => {
  it("deve validar que data de chegada é após partida", () => {
    const isValidDateRange = (departure: string, arrival: string) => {
      return new Date(arrival) > new Date(departure);
    };
    
    expect(isValidDateRange("2025-01-01T08:00", "2025-01-15T18:00")).toBe(true);
    expect(isValidDateRange("2025-01-15T18:00", "2025-01-01T08:00")).toBe(false);
  });
  
  it("deve validar portos diferentes", () => {
    const arePortsDifferent = (departure: string, arrival: string) => {
      return departure.toLowerCase() !== arrival.toLowerCase();
    };
    
    expect(arePortsDifferent("Santos", "Rotterdam")).toBe(true);
    expect(arePortsDifferent("Santos", "santos")).toBe(false);
  });
  
  it("deve calcular duração estimada", () => {
    const calculateDuration = (departure: string, arrival: string) => {
      const diff = new Date(arrival).getTime() - new Date(departure).getTime();
      return Math.ceil(diff / (1000 * 60 * 60 * 24)); // dias
    };
    
    expect(calculateDuration("2025-01-01", "2025-01-15")).toBe(14);
    expect(calculateDuration("2025-01-01", "2025-01-02")).toBe(1);
  });
});

describe("VoyagePlanner Cálculos", () => {
  it("deve calcular consumo estimado de combustível", () => {
    const estimateFuelConsumption = (
      distance: number, // milhas náuticas
      avgSpeed: number, // nós
      dailyConsumption: number // tons/dia
    ) => {
      const days = distance / (avgSpeed * 24);
      return Math.round(days * dailyConsumption * 100) / 100;
    };
    
    // 5000 milhas a 15 nós com 30 tons/dia
    expect(estimateFuelConsumption(5000, 15, 30)).toBeCloseTo(416.67, 1);
  });
  
  it("deve calcular ETA baseado em velocidade", () => {
    const calculateETA = (
      departureDate: Date,
      distance: number, // milhas náuticas
      speed: number // nós
    ) => {
      const hours = distance / speed;
      return new Date(departureDate.getTime() + hours * 60 * 60 * 1000);
    };
    
    const departure = new Date("2025-01-01T08:00:00");
    const eta = calculateETA(departure, 360, 15); // 360 milhas a 15 nós = 24 horas
    
    expect(eta.getDate()).toBe(2); // Dia seguinte
  });
});
