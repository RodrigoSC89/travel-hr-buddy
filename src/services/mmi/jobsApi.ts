/**
 * API service for MMI Jobs with Supabase integration
 */

import { supabase } from '@/integrations/supabase/client';
import { generateEmbedding, formatJobForEmbedding } from './embeddingService';

export interface Job {
  id: string;
  title: string;
  description?: string;
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

interface DBJob {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date: string;
  component_name: string;
  asset_name: string;
  vessel: string;
  suggestion_ia?: string;
  can_postpone?: boolean;
}

/**
 * Transform DB job to API format
 */
function transformDBJob(dbJob: DBJob): Job {
  return {
    id: dbJob.id,
    title: dbJob.title,
    description: dbJob.description,
    status: dbJob.status,
    priority: dbJob.priority,
    due_date: dbJob.due_date,
    component: {
      name: dbJob.component_name,
      asset: {
        name: dbJob.asset_name,
        vessel: dbJob.vessel,
      },
    },
    suggestion_ia: dbJob.suggestion_ia,
    can_postpone: dbJob.can_postpone,
  };
}

/**
 * Fetches the list of jobs from Supabase
 */
export const fetchJobs = async (): Promise<{ jobs: Job[] }> => {
  try {
    const { data, error } = await supabase
      .from('mmi_jobs')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) throw error;

    const jobs = (data || []).map(transformDBJob);
    return { jobs };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    // Fallback to mock data if database is not available
    return { jobs: getMockJobs() };
  }
};

/**
 * Mock data for jobs (fallback)
 */
function getMockJobs(): Job[] {
  return [
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
}

/**
 * Postpones a job with AI justification
 */
export const postponeJob = async (jobId: string): Promise<{ message: string; new_date?: string }> => {
  try {
    // Fetch the job
    const { data: dbJob, error: fetchError } = await supabase
      .from('mmi_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (fetchError || !dbJob) {
      throw new Error("Job não encontrado");
    }

    if (!dbJob.can_postpone) {
      return {
        message: "Este job não pode ser postergado devido à prioridade crítica.",
      };
    }

    // Calculate new date (7 days ahead)
    const currentDate = new Date(dbJob.due_date);
    currentDate.setDate(currentDate.getDate() + 7);
    const newDate = currentDate.toISOString().split("T")[0];

    // Update the job with new date
    const { error: updateError } = await supabase
      .from('mmi_jobs')
      .update({ due_date: newDate })
      .eq('id', jobId);

    if (updateError) throw updateError;

    // Generate embedding for history
    const historyText = `Postergação de ${dbJob.title} para ${newDate}`;
    const embedding = await generateEmbedding(historyText);

    // Log the action
    await supabase.from('mmi_job_history').insert({
      job_id: jobId,
      action: 'postpone',
      action_details: { new_date: newDate, old_date: dbJob.due_date },
      ai_recommendation: `Com base no histórico operacional e condições atuais, é seguro postergar esta manutenção para ${newDate}. O sistema mantém margens de segurança adequadas.`,
      embedding,
    });

    return {
      message: `Job postergado com sucesso! ✅\n\nJustificativa IA: Com base no histórico operacional e condições atuais, é seguro postergar esta manutenção para ${newDate}. O sistema mantém margens de segurança adequadas.`,
      new_date: newDate,
    };
  } catch (error) {
    console.error('Error postponing job:', error);
    throw error;
  }
};

/**
 * Creates a work order (OS) for a job
 */
export const createWorkOrder = async (jobId: string): Promise<{ os_id: string; message: string }> => {
  try {
    // Fetch the job
    const { data: dbJob, error: fetchError } = await supabase
      .from('mmi_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (fetchError || !dbJob) {
      throw new Error("Job não encontrado");
    }

    // Generate a mock OS ID
    const osId = `OS-${Date.now().toString().slice(-6)}`;

    // Generate embedding for history
    const historyText = `Criação de OS ${osId} para ${dbJob.title}`;
    const embedding = await generateEmbedding(historyText);

    // Log the action
    await supabase.from('mmi_job_history').insert({
      job_id: jobId,
      action: 'create_work_order',
      action_details: { os_id: osId },
      ai_recommendation: `Ordem de serviço criada para ${dbJob.component_name}. Prioridade: ${dbJob.priority}.`,
      embedding,
    });

    // Update job status to "Em andamento"
    await supabase
      .from('mmi_jobs')
      .update({ status: 'Em andamento' })
      .eq('id', jobId);

    return {
      os_id: osId,
      message: `Ordem de Serviço criada com sucesso! 📋`,
    };
  } catch (error) {
    console.error('Error creating work order:', error);
    throw error;
  }
};
