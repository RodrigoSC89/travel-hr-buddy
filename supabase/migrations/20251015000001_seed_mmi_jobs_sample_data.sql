-- Sample data for testing MMI Jobs similarity search
-- This file provides example jobs with diverse descriptions for testing

-- Note: In production, embeddings should be generated via OpenAI API
-- These are placeholder NULL embeddings that will be replaced

-- Sample Job 1: Hydraulic System Maintenance
INSERT INTO public.mmi_jobs (
    title, 
    description, 
    status, 
    priority, 
    due_date, 
    component_name, 
    asset_name, 
    vessel,
    suggestion_ia,
    can_postpone
) VALUES (
    'Manutenção preventiva do sistema hidráulico',
    'Realizar manutenção preventiva completa do sistema hidráulico principal. Incluir verificação de pressão, inspeção de mangueiras, troca de filtros e teste de válvulas de segurança.',
    'pending',
    'high',
    CURRENT_DATE + INTERVAL '5 days',
    'Sistema Hidráulico Principal',
    'Bomba Hidráulica #3',
    'Navio Oceanic Explorer',
    'Recomenda-se realizar a manutenção durante a próxima parada programada. Histórico indica desgaste acelerado nas últimas 200h de operação.',
    true
);

-- Sample Job 2: Valve Safety Inspection
INSERT INTO public.mmi_jobs (
    title, 
    description, 
    status, 
    priority, 
    due_date, 
    component_name, 
    asset_name, 
    vessel,
    suggestion_ia,
    can_postpone
) VALUES (
    'Inspeção de válvulas de segurança',
    'Inspeção obrigatória das válvulas de alívio do deck principal. Verificar calibração, testar resposta e documentar todas as leituras de pressão.',
    'in_progress',
    'critical',
    CURRENT_DATE + INTERVAL '1 day',
    'Sistema de Segurança',
    'Válvulas de Alívio - Deck Principal',
    'Navio Atlantic Star',
    'Atenção: Válvula #2 apresenta leitura fora do padrão. Substituição recomendada antes da próxima operação.',
    false
);

-- Sample Job 3: Motor Filter Replacement
INSERT INTO public.mmi_jobs (
    title, 
    description, 
    status, 
    priority, 
    due_date, 
    component_name, 
    asset_name, 
    vessel,
    can_postpone
) VALUES (
    'Troca de filtros do motor principal',
    'Substituição programada dos filtros de óleo do motor principal. Incluir análise de óleo usado e verificação de partículas metálicas.',
    'pending',
    'medium',
    CURRENT_DATE + INTERVAL '10 days',
    'Motor Principal',
    'Filtros de Óleo ME-4500',
    'Navio Pacific Voyager',
    true
);

-- Sample Job 4: Temperature Sensor Calibration
INSERT INTO public.mmi_jobs (
    title, 
    description, 
    status, 
    priority, 
    due_date, 
    component_name, 
    asset_name, 
    vessel,
    suggestion_ia,
    can_postpone
) VALUES (
    'Calibração de sensores de temperatura',
    'Calibração de todos os sensores de temperatura da sala de máquinas. Ajustar drift e validar precisão contra padrões de referência.',
    'awaiting_parts',
    'medium',
    CURRENT_DATE + INTERVAL '7 days',
    'Sistema de Monitoramento',
    'Sensores Sala de Máquinas',
    'Navio Oceanic Explorer',
    'Sensor #7 com drift de +3°C. Calibração urgente recomendada para manter precisão do sistema.',
    true
);

-- Sample Job 5: Pump Overhaul
INSERT INTO public.mmi_jobs (
    title, 
    description, 
    status, 
    priority, 
    due_date, 
    component_name, 
    asset_name, 
    vessel,
    suggestion_ia,
    can_postpone
) VALUES (
    'Revisão geral da bomba de transferência',
    'Desmontagem completa e revisão da bomba de transferência de combustível. Substituir selos mecânicos, rolamentos e verificar eixo.',
    'pending',
    'high',
    CURRENT_DATE + INTERVAL '3 days',
    'Sistema de Combustível',
    'Bomba Transferência #1',
    'Navio Atlantic Star',
    'Vibração detectada acima do normal. Análise de vibração sugere desgaste de rolamentos. Intervenção recomendada antes de 100 horas de operação.',
    true
);

-- Sample Job 6: Electrical Panel Inspection
INSERT INTO public.mmi_jobs (
    title, 
    description, 
    status, 
    priority, 
    due_date, 
    component_name, 
    asset_name, 
    vessel,
    can_postpone
) VALUES (
    'Inspeção termográfica de painéis elétricos',
    'Realizar inspeção termográfica de todos os painéis elétricos principais. Identificar pontos quentes, conexões frouxas e verificar aperto de terminais.',
    'completed',
    'high',
    CURRENT_DATE - INTERVAL '2 days',
    'Sistema Elétrico',
    'Painéis Elétricos Principais',
    'Navio Pacific Voyager',
    false
);

-- Sample Job 7: Cooling System Check
INSERT INTO public.mmi_jobs (
    title, 
    description, 
    status, 
    priority, 
    due_date, 
    component_name, 
    asset_name, 
    vessel,
    suggestion_ia,
    can_postpone
) VALUES (
    'Verificação do sistema de resfriamento',
    'Inspeção completa do sistema de água de resfriamento. Verificar níveis, testar trocadores de calor, limpar filtros e verificar bombas.',
    'pending',
    'medium',
    CURRENT_DATE + INTERVAL '14 days',
    'Sistema de Resfriamento',
    'Trocador de Calor Principal',
    'Navio Oceanic Explorer',
    'Temperatura de saída 2°C acima do normal. Possível incrustação em trocador de calor. Limpeza recomendada.',
    true
);

-- Sample Job 8: Emergency Generator Test
INSERT INTO public.mmi_jobs (
    title, 
    description, 
    status, 
    priority, 
    due_date, 
    component_name, 
    asset_name, 
    vessel,
    can_postpone
) VALUES (
    'Teste mensal do gerador de emergência',
    'Teste operacional completo do gerador de emergência. Verificar partida automática, transição de carga e todos os sistemas de proteção.',
    'pending',
    'critical',
    CURRENT_DATE + INTERVAL '2 days',
    'Gerador de Emergência',
    'DG Emergency #1',
    'Navio Atlantic Star',
    false
);

-- Note: To generate embeddings for these jobs, use the OpenAI API:
-- 
-- Example script:
-- ```typescript
-- const text = `${job.title}. ${job.description}`;
-- const response = await fetch('https://api.openai.com/v1/embeddings', {
--   method: 'POST',
--   headers: {
--     'Authorization': `Bearer ${OPENAI_API_KEY}`,
--     'Content-Type': 'application/json',
--   },
--   body: JSON.stringify({
--     model: 'text-embedding-ada-002',
--     input: text,
--   }),
-- });
-- const { data } = await response.json();
-- const embedding = data[0].embedding;
-- 
-- await supabase
--   .from('mmi_jobs')
--   .update({ embedding })
--   .eq('id', job.id);
-- ```
