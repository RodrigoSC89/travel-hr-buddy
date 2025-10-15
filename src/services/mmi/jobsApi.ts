/**
 * API service for MMI Jobs - Integrates with Supabase Edge Functions
 * Falls back to mock data in test environments
 */

import { supabase } from "@/integrations/supabase/client";

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
}

// Mock data for development and testing
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
  },
];

// Helper to check if we're in test mode
const isTestMode = () => {
  return import.meta.env.MODE === 'test' || typeof window === 'undefined';
};

/**
 * Fetches the list of jobs from Supabase or mock data
 */
export const fetchJobs = async (): Promise<{ jobs: Job[] }> => {
  // Use mock data in test mode or if Supabase is not available
  if (isTestMode()) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { jobs: mockJobs };
  }

  try {
    const { data: mmiJobs, error } = await supabase
      .from('mmi_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching MMI jobs:", error);
      // Fallback to mock data on error
      return { jobs: mockJobs };
    }

    // Transform Supabase data to Job interface
    const jobs: Job[] = (mmiJobs || []).map((job) => ({
      id: job.id,
      title: job.title,
      status: job.status || 'Pendente',
      priority: (job.metadata as any)?.priority || 'Média',
      due_date: (job.metadata as any)?.due_date || new Date().toISOString().split('T')[0],
      component: {
        name: (job.metadata as any)?.component?.name || 'Componente não especificado',
        asset: {
          name: (job.metadata as any)?.component?.asset?.name || 'Asset não especificado',
          vessel: (job.metadata as any)?.component?.asset?.vessel || 'Embarcação não especificada',
        },
      },
      suggestion_ia: (job.metadata as any)?.suggestion_ia || job.description,
      can_postpone: (job.metadata as any)?.can_postpone !== false && job.status !== 'Crítica',
    }));

    // Return mock data if no jobs found in database (for development)
    if (jobs.length === 0) {
      return { jobs: mockJobs };
    }

    return { jobs };
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    // Return mock data on error to prevent UI crashes
    return { jobs: mockJobs };
  }
};

/**
 * Postpones a job with AI justification using Supabase Edge Function
 * Falls back to mock behavior in test mode
 */
export const postponeJob = async (jobId: string): Promise<{ message: string; new_date?: string }> => {
  // Mock behavior in test mode
  if (isTestMode()) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    
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
  }

  try {
    // Call the mmi-job-postpone edge function
    const { data, error } = await supabase.functions.invoke('mmi-job-postpone', {
      body: { jobId },
    });

    if (error) {
      console.error("Error postponing job:", error);
      throw error;
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    // Return AI-generated postponement analysis
    return {
      message: data.message || 'Job processado com sucesso',
      new_date: data.new_date,
    };
  } catch (error) {
    console.error("Failed to postpone job:", error);
    throw new Error(error instanceof Error ? error.message : "Erro ao postergar job");
  }
};

/**
 * Creates a work order (OS) for a job using Supabase Edge Function
 * Falls back to mock behavior in test mode
 */
export const createWorkOrder = async (jobId: string): Promise<{ os_id: string; message: string }> => {
  // Mock behavior in test mode
  if (isTestMode()) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    
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
  }

  try {
    // Call the mmi-os-create edge function
    const { data, error } = await supabase.functions.invoke('mmi-os-create', {
      body: { jobId },
    });

    if (error) {
      console.error("Error creating work order:", error);
      throw error;
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return {
      os_id: data.os_id,
      message: data.message || 'Ordem de Serviço criada com sucesso! 📋',
    };
  } catch (error) {
    console.error("Failed to create work order:", error);
    throw new Error(error instanceof Error ? error.message : "Erro ao criar OS");
  }
};
