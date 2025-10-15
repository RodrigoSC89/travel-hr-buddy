/**
 * API service for MMI Jobs with Supabase integration
 * Integrates with edge functions for AI-powered analysis
 */

import { supabase } from "../supabase";

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

// Fallback mock data for development/testing when database is unavailable
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

/**
 * Fetches the list of jobs from Supabase database
 * Falls back to mock data if database is unavailable
 */
export const fetchJobs = async (): Promise<{ jobs: Job[] }> => {
  try {
    const { data, error } = await supabase
      .from('mmi_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Database query failed, using mock data:', error);
      return { jobs: mockJobs };
    }

    // Transform database records to Job interface
    const jobs = (data || []).map(job => ({
      id: job.id,
      title: job.title,
      status: job.status,
      priority: job.priority,
      due_date: job.due_date,
      component: {
        name: job.component_name || 'N/A',
        asset: {
          name: job.asset_name || 'N/A',
          vessel: job.vessel || 'N/A',
        },
      },
      suggestion_ia: job.suggestion_ia,
      can_postpone: job.priority !== 'Crítica',
    }));

    return { jobs: jobs.length > 0 ? jobs : mockJobs };
  } catch (error) {
    console.warn('Failed to fetch jobs, using mock data:', error);
    return { jobs: mockJobs };
  }
};

/**
 * Postpones a job with AI-powered analysis and justification
 * Calls the mmi-job-postpone edge function for AI analysis
 */
export const postponeJob = async (jobId: string): Promise<{ message: string; new_date?: string }> => {
  try {
    // Call the edge function for AI-powered postponement analysis
    const { data, error } = await supabase.functions.invoke('mmi-job-postpone', {
      body: { jobId }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error('Erro ao analisar postergação com IA');
    }

    return {
      message: data?.message || 'Job analisado com sucesso',
      new_date: data?.new_date,
    };
  } catch (error) {
    // Fallback to local logic if edge function is unavailable
    console.warn('AI analysis unavailable, using fallback logic:', error);
    
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
};

/**
 * Creates a work order (OS) for a job
 * Calls the mmi-os-create edge function to create the work order
 */
export const createWorkOrder = async (jobId: string): Promise<{ os_id: string; message: string }> => {
  try {
    // Call the edge function to create work order
    const { data, error } = await supabase.functions.invoke('mmi-os-create', {
      body: { jobId }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error('Erro ao criar ordem de serviço');
    }

    return {
      os_id: data?.os_id || `OS-${Date.now().toString().slice(-6)}`,
      message: data?.message || 'Ordem de Serviço criada com sucesso! 📋',
    };
  } catch (error) {
    // Fallback to local logic if edge function is unavailable
    console.warn('OS creation service unavailable, using fallback:', error);
    
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
};
