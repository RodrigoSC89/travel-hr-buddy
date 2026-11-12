-- Carga inicial dos novos módulos (planilha v2: 08_RISCOS, 18_DOCUMENTOS, 06_FINANCEIRO)
-- e modelos de trabalho baseados nas regras da proposta Rev7. Idempotente.

with r as (select id from public.ct_members where short_name = 'Rodrigo'),
     m as (select id from public.ct_members where short_name = 'Marcelo')
insert into public.ct_risks (code, title, scope, probability, impact, mitigation, owner_id, reviewer_id, status, evidence)
select v.code, v.title, v.scope, v.p, v.i, v.mit,
       case v.owner when 'R' then (select id from r) else (select id from m) end,
       case v.owner when 'R' then (select id from m) else (select id from r) end,
       'Aberto', v.ev
from (values
  ('R01', 'Escopo executado não coincide com contrato/OS', 'OCEANPACT / TECHNIP', 3, 3, 'Inventariar contrato, OS, anexos e aprovação de escopo', 'R', 'Sem documentos assinados verificados nesta rodada.'),
  ('R02', 'SEAGEMS sem calendário de turmas e tripulantes', 'SEAGEMS', 3, 3, 'Pedir roster e crew change; planejar janelas e exigência de aviso', 'M', 'Rev7: turmas e agendamento são responsabilidades da contratante.'),
  ('R03', 'Falta de capacidade por sobreposição de prazos', 'Todos', 3, 3, 'Medir disponibilidade semanal e projetar duas semanas antes da proposta', 'M', 'Rodrigo tem compromissos de bordo; não presumir disponibilidade.'),
  ('R04', 'Relatório enviado sem revisão independente', 'Todos', 2, 3, 'Bloqueio de encerramento por check Rodrigo + Marcelo e evidência', 'R', 'Double check obrigatório no sistema (regra no banco).'),
  ('R05', 'Faturamento ou medição sem rastreio de aceite', 'Todos', 2, 3, 'Indexar entregável, evidência, aceite e BM/NF por ID', 'M', 'Conciliar termos de faturamento por cliente.'),
  ('R06', 'Revisões de escopo não formalizadas', 'Todos', 2, 3, 'Formalizar OS/aditivo antes de aumento de horas, unidades ou marcos', 'R', 'Principal risco para margem e atraso.'),
  ('R07', 'Confusão entre trabalho embarcado e consultoria MB', 'OCEANPACT', 2, 3, 'Separar centros de custo, evidências, atribuições e comunicações', 'R', 'Não importar tarefas operacionais do comando para contrato MB.'),
  ('R08', 'Informação DP ou dados pessoais expostos entre clientes', 'Todos', 2, 3, 'Acesso por cliente, pasta segregada e revisão de destinatários', 'M', 'Verificar LGPD, sigilo e permissões.'),
  ('R09', 'Pipeline comercial supera capacidade de entrega', 'Fugro / outros', 3, 2, 'Aprovar novo serviço somente após gate de escopo, margem e capacidade', 'R', 'Propostas pontuais e recorrentes exigem recursos reservados.')
) as v(code, title, scope, p, i, mit, owner, ev)
on conflict (code) do nothing;
update public.ct_risks set contract_id = (select id from public.ct_contracts where code = 'CTR-SEA') where code = 'R02' and contract_id is null;
update public.ct_risks set contract_id = (select id from public.ct_contracts where code = 'CTR-OCP') where code = 'R07' and contract_id is null;

insert into public.ct_documents (code, contract_id, client_unit, doc_type, title, revision, origin, applicable, status, notes) values
  ('DOC-001', (select id from public.ct_contracts where code = 'CTR-SEA'), 'SEAGEMS / geral', 'Proposta', 'P-MB-SEAGEMS-025-Rev7.pdf', 'Rev7', 'MB Maritime', 'A confirmar', 'Vigente', 'Não substitui contrato assinado; verificar OS/versão definitiva.'),
  ('DOC-002', (select id from public.ct_contracts where code = 'CTR-OCP'), 'OCEANPACT', 'Instrumento contratual', 'Contrato + aditivos / OS', null, 'Cliente', 'A confirmar', 'Em revisão', 'Instrumento ainda não conferido; não presumir escopo.'),
  ('DOC-003', (select id from public.ct_contracts where code = 'CTR-TEC'), 'TECHNIP', 'Instrumento contratual', 'Contrato + aditivos / OS', null, 'Cliente', 'A confirmar', 'Em revisão', 'Instrumento ainda não conferido; não presumir escopo.')
on conflict (code) do nothing;

insert into public.ct_invoices (code, contract_id, period, service_order, description, status, notes) values
  ('MED-SEA-01', (select id from public.ct_contracts where code = 'CTR-SEA'), 'Primeira medição a identificar', 'CTR-SEA / confirmar', 'Medição SEAGEMS', 'A medir', 'A proposta Rev7 menciona faturamento mensal e pagamento em 30 dias após NF; validar contrato.'),
  ('MED-OCP-01', (select id from public.ct_contracts where code = 'CTR-OCP'), 'A identificar', 'CTR-OCP / OS a confirmar', 'Medição OCEANPACT', 'A medir', 'Não foi localizado instrumento comercial para valores ou vencimentos.'),
  ('MED-TEC-01', (select id from public.ct_contracts where code = 'CTR-TEC'), 'A identificar', 'CTR-TEC / OS a confirmar', 'Medição TECHNIP', 'A medir', 'Não foi localizado instrumento comercial para valores ou vencimentos.')
on conflict (code) do nothing;

-- Modelos de trabalho
insert into public.ct_templates (name, service_type, description) values
  ('Auditoria de garantia de DP', 'Auditoria', 'Aviso mínimo de 15 dias, máx. 1 auditoria/mês, embarcação em porto/fundeio; relatório + plano de ação revisados e aceitos (Rev7).'),
  ('Turma de capacitação (assessment / GAP / re-assessment)', 'Treinamento', 'Turmas de 7 a 15 pessoas, até 2 sessões/semana, antecedência de 7 dias; documentos até 7 dias úteis após a sessão (Rev7).'),
  ('Revisão de CAMO / ASOG / TAMO', 'Revisão técnica', 'Revisão formal autorizada por embarcação, com controle de versão e aceite.'),
  ('Proposta comercial', 'Comercial', 'Demanda comprovada → escopo → horas → capacidade → preço/margem → double check → proposta.')
on conflict (name) do nothing;

do $$
declare
  t_aud uuid := (select id from public.ct_templates where name = 'Auditoria de garantia de DP');
  t_trn uuid := (select id from public.ct_templates where name = 'Turma de capacitação (assessment / GAP / re-assessment)');
  t_rev uuid := (select id from public.ct_templates where name = 'Revisão de CAMO / ASOG / TAMO');
  t_com uuid := (select id from public.ct_templates where name = 'Proposta comercial');
begin
  if not exists (select 1 from public.ct_template_items where template_id = t_aud) then
    insert into public.ct_template_items (template_id, position, title, priority, offset_days, duration_days, hours_executor, hours_reviewer, swap_roles, checklist) values
      (t_aud, 1, 'Confirmar janela e enviar aviso formal (≥15 dias)', 'P1', 0, 2, 1, 0.5, true,
        array['Embarcação em porto/fundeio confirmada', 'Aviso enviado com ≥15 dias de antecedência', 'Limite de 1 auditoria no mês respeitado', 'Convite registrado na Agenda']),
      (t_aud, 2, 'Preparar auditoria: documentos, FMEA, ASOG/CAMO vigentes', 'P1', 3, 7, 6, 2, false,
        array['Versões vigentes de FMEA, CAMO/ASOG e manual DP recebidas', 'Checklist de auditoria preparado', 'Logística de embarque definida']),
      (t_aud, 3, 'Executar auditoria a bordo', 'P1', 15, 2, 16, 0, false,
        array['Evidências fotográficas e registros coletados', 'Reunião de encerramento realizada', 'Constatações preliminares registradas']),
      (t_aud, 4, 'Elaborar relatório + plano de ação', 'P1', 17, 5, 10, 4, false,
        array['Constatações classificadas e rastreáveis às evidências', 'Plano de ação com responsáveis e prazos', 'Revisão independente concluída', 'Nomenclatura MB-[CLIENTE]-[CONTRATO]-[OS]-[UNIDADE]-[ENTREGA]-REV[##]']),
      (t_aud, 5, 'Enviar relatório e obter aceite do cliente', 'P1', 22, 5, 1, 0.5, true,
        array['Relatório enviado ao destinatário correto', 'Aceite do cliente registrado', 'Lote liberado em Entregáveis']);
  end if;
  if not exists (select 1 from public.ct_template_items where template_id = t_trn) then
    insert into public.ct_template_items (template_id, position, title, priority, offset_days, duration_days, hours_executor, hours_reviewer, swap_roles, checklist) values
      (t_trn, 1, 'Receber lista da turma e confirmar sessão (≥7 dias)', 'P1', 0, 2, 1, 0.5, true,
        array['Lista com 7 a 15 participantes recebida', 'Antecedência mínima de 7 dias', 'Máx. 2 sessões na semana', 'IDs internos (sem CPF ou dados sensíveis)']),
      (t_trn, 2, 'Preparar material e avaliação', 'P2', 2, 4, 4, 1, false,
        array['Material na versão vigente', 'Avaliação e gabarito revisados']),
      (t_trn, 3, 'Conduzir sessão', 'P1', 7, 1, 8, 0, false,
        array['Lista de presença assinada', 'Avaliações coletadas']),
      (t_trn, 4, 'Emitir relatórios/certificados individuais (≤7 dias úteis)', 'P1', 8, 7, 6, 3, false,
        array['Um documento por participante, com ID único', 'Revisão independente', 'Prazo de 7 dias úteis respeitado']),
      (t_trn, 5, 'Enviar documentos e registrar aceite', 'P1', 15, 2, 1, 0.5, true,
        array['Documentos enviados', 'Aceite registrado', 'Quantidade liberada em lote no entregável']);
  end if;
  if not exists (select 1 from public.ct_template_items where template_id = t_rev) then
    insert into public.ct_template_items (template_id, position, title, priority, offset_days, duration_days, hours_executor, hours_reviewer, swap_roles, checklist) values
      (t_rev, 1, 'Receber documento vigente e autorização de revisão (OS)', 'P1', 0, 2, 0.5, 0.5, true,
        array['Versão vigente identificada', 'OS/autorização registrada', 'Dentro do limite contratual do mês']),
      (t_rev, 2, 'Revisão técnica', 'P1', 2, 5, 6, 0, false,
        array['Análise de riscos DP', 'Comentários rastreáveis por seção']),
      (t_rev, 3, 'Revisão de consistência e controle documental', 'P1', 7, 2, 0, 3, true,
        array['Versão e histórico de revisões atualizados', 'Consistência entre CAMO/ASOG/TAMO', 'Registro em Documentos']),
      (t_rev, 4, 'Enviar e obter aceite', 'P1', 9, 3, 0.5, 0.5, false,
        array['Documento enviado', 'Aceite registrado']);
  end if;
  if not exists (select 1 from public.ct_template_items where template_id = t_com) then
    insert into public.ct_template_items (template_id, position, title, priority, offset_days, duration_days, hours_executor, hours_reviewer, swap_roles, checklist) values
      (t_com, 1, 'Qualificar demanda e escopo', 'P3', 0, 3, 2, 0.5, false,
        array['Demanda comprovada (não presumida)', 'Embarcação, classe DP, datas e escopo levantados', 'Interlocutor confirmado']),
      (t_com, 2, 'Estimar horas e checar capacidade', 'P3', 3, 2, 1, 1, false,
        array['Horas estimadas por etapa', 'Capacidade das próximas semanas verificada', 'Capacidade marcada como "Sim" na oportunidade']),
      (t_com, 3, 'Precificar e revisar proposta (double check)', 'P3', 5, 3, 2, 2, false,
        array['Margem calculada', 'Exclusões e premissas explícitas', 'Revisão independente de cláusulas e preço']),
      (t_com, 4, 'Enviar proposta e definir follow-up', 'P3', 8, 1, 0.5, 0, true,
        array['Proposta enviada com versão registrada', 'Data de follow-up definida na oportunidade']);
  end if;
end $$;
