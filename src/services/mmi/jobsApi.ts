/**
 * Mock API service for MMI Jobs
 * In a real implementation, these would be actual API calls to a backend
 */

export interface Job {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string;
  component: {
    name: string;
    asset: {
      name: string;
      vessel: string;
    };
  };
  suggestion_ia?: string;
  can_postpone?: boolean;
  resolved_history?: string[];
}

// Mock data for jobs
const mockJobs: Job[] = [
  {
    id: "JOB-001",
    title: "Manutenção preventiva do sistema hidráulico",
    status: "Pendente",
    priority: "Alta",
    due_date: "2025-10-20",
    component: {
      name: "Sistema Hidráulico Principal",
      asset: {
        name: "Bomba Hidráulica #3",
        vessel: "Navio Oceanic Explorer",
      },
    },
    suggestion_ia: "Recomenda-se realizar a manutenção durante a próxima parada programada. Histórico indica desgaste acelerado nas últimas 200h de operação.",
    can_postpone: true,
    resolved_history: [
      "OS-2024-001 (Jan/2024): Troca de vedações - Concluída",
      "OS-2024-045 (Abr/2024): Manutenção preventiva - Concluída",
      "OS-2024-089 (Jul/2024): Ajuste de pressão - Concluída",
    ],
  },
  {
    id: "JOB-002",
    title: "Inspeção de válvulas de segurança",
    status: "Em andamento",
    priority: "Crítica",
    due_date: "2025-10-16",
    component: {
      name: "Sistema de Segurança",
      asset: {
        name: "Válvulas de Alívio - Deck Principal",
        vessel: "Navio Atlantic Star",
      },
    },
    suggestion_ia: "Atenção: Válvula #2 apresenta leitura fora do padrão. Substituição recomendada antes da próxima operação.",
    can_postpone: false,
    resolved_history: [
      "OS-2024-012 (Fev/2024): Inspeção anual - Concluída",
      "OS-2024-067 (Mai/2024): Substituição de válvula #1 - Concluída",
    ],
  },
  {
    id: "JOB-003",
    title: "Troca de filtros do motor principal",
    status: "Pendente",
    priority: "Média",
    due_date: "2025-10-25",
    component: {
      name: "Motor Principal",
      asset: {
        name: "Filtros de Óleo ME-4500",
        vessel: "Navio Pacific Voyager",
      },
    },
    can_postpone: true,
  },
  {
    id: "JOB-004",
    title: "Calibração de sensores de temperatura",
    status: "Aguardando peças",
    priority: "Média",
    due_date: "2025-10-22",
    component: {
      name: "Sistema de Monitoramento",
      asset: {
        name: "Sensores Sala de Máquinas",
        vessel: "Navio Oceanic Explorer",
      },
    },
    suggestion_ia: "Sensor #7 com drift de +3°C. Calibração urgente recomendada para manter precisão do sistema.",
    can_postpone: true,
    resolved_history: [
      "OS-2024-023 (Mar/2024): Calibração semestral - Concluída",
      "OS-2024-078 (Jun/2024): Substituição sensor #3 - Concluída",
    ],
  },
];

/**
 * Fetches the list of jobs
 */
export const fetchJobs = async (): Promise<{ jobs: Job[] }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { jobs: mockJobs };
};

/**
 * Postpones a job with AI justification
 */
export const postponeJob = async (jobId: string): Promise<{ message: string; new_date?: string }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  const job = mockJobs.find((j) => j.id === jobId);
  if (!job) {
    throw new Error("Job não encontrado");
  }
  
  if (!job.can_postpone) {
    return {
      message: "Este job não pode ser postergado devido à prioridade crítica.",
    };
  }
  
  // Calculate new date (7 days ahead)
  const currentDate = new Date(job.due_date);
  currentDate.setDate(currentDate.getDate() + 7);
  const newDate = currentDate.toISOString().split("T")[0];
  
  return {
    message: `Job postergado com sucesso! ✅\n\nJustificativa IA: Com base no histórico operacional e condições atuais, é seguro postergar esta manutenção para ${newDate}. O sistema mantém margens de segurança adequadas.`,
    new_date: newDate,
  };
};

/**
 * Creates a work order (OS) for a job
 */
export const createWorkOrder = async (jobId: string): Promise<{ os_id: string; message: string }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600));
  
  const job = mockJobs.find((j) => j.id === jobId);
  if (!job) {
    throw new Error("Job não encontrado");
  }
  
  // Generate a mock OS ID
  const osId = `OS-${Date.now().toString().slice(-6)}`;
  
  return {
    os_id: osId,
    message: `Ordem de Serviço criada com sucesso! 📋`,
  };
};
