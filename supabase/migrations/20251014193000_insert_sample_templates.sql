-- Insert sample templates for testing
DO $$
DECLARE
  sample_user_id uuid;
BEGIN
  -- Try to get an existing user
  SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
  
  IF sample_user_id IS NOT NULL THEN
    -- Insert sample templates
    INSERT INTO public.templates (
      title,
      content,
      is_favorite,
      is_private,
      created_by
    ) VALUES 
    (
      'Relatório de Reunião',
      '<h1>Relatório de Reunião</h1>
<h2>Data: [DATA]</h2>
<h2>Participantes</h2>
<ul>
<li>Nome 1</li>
<li>Nome 2</li>
<li>Nome 3</li>
</ul>
<h2>Pauta</h2>
<ol>
<li>Item 1</li>
<li>Item 2</li>
<li>Item 3</li>
</ol>
<h2>Decisões</h2>
<p>[Descrever as decisões tomadas]</p>
<h2>Próximos Passos</h2>
<p>[Listar os próximos passos]</p>',
      true,
      false,
      sample_user_id
    ),
    (
      'Memorando Interno',
      '<h1>MEMORANDO Nº [NÚMERO]</h1>
<p><strong>DE:</strong> [NOME DO REMETENTE]</p>
<p><strong>PARA:</strong> [NOME DO DESTINATÁRIO]</p>
<p><strong>DATA:</strong> [DATA]</p>
<p><strong>ASSUNTO:</strong> [ASSUNTO]</p>
<hr>
<p>[CONTEÚDO DO MEMORANDO]</p>
<p>Atenciosamente,</p>
<p>[NOME]<br>[CARGO]</p>',
      false,
      false,
      sample_user_id
    ),
    (
      'Checklist de Viagem',
      '<h1>Checklist de Viagem</h1>
<h2>Antes de Sair</h2>
<ul>
<li>☐ Passaporte válido</li>
<li>☐ Vistos necessários</li>
<li>☐ Passagens aéreas</li>
<li>☐ Reservas de hotel</li>
<li>☐ Seguro viagem</li>
<li>☐ Vacinas atualizadas</li>
</ul>
<h2>Documentos</h2>
<ul>
<li>☐ Cópias de documentos</li>
<li>☐ Cartões de crédito</li>
<li>☐ Dinheiro local</li>
</ul>
<h2>Bagagem</h2>
<ul>
<li>☐ Roupas adequadas</li>
<li>☐ Medicamentos</li>
<li>☐ Eletrônicos e carregadores</li>
<li>☐ Artigos de higiene pessoal</li>
</ul>',
      true,
      false,
      sample_user_id
    ),
    (
      'Notas Pessoais',
      '<h1>Minhas Notas</h1>
<p><strong>Data:</strong> [DATA]</p>
<h2>Tópicos</h2>
<ul>
<li>[Tópico 1]</li>
<li>[Tópico 2]</li>
<li>[Tópico 3]</li>
</ul>
<h2>Observações</h2>
<p>[Suas observações aqui]</p>',
      false,
      true,
      sample_user_id
    ),
    (
      'Solicitação de Férias',
      '<h1>Solicitação de Férias</h1>
<p><strong>Nome:</strong> [NOME DO FUNCIONÁRIO]</p>
<p><strong>Cargo:</strong> [CARGO]</p>
<p><strong>Departamento:</strong> [DEPARTAMENTO]</p>
<p><strong>Data:</strong> [DATA DA SOLICITAÇÃO]</p>
<hr>
<h2>Período Solicitado</h2>
<p><strong>Início:</strong> [DATA DE INÍCIO]</p>
<p><strong>Término:</strong> [DATA DE TÉRMINO]</p>
<p><strong>Total de Dias:</strong> [NÚMERO DE DIAS]</p>
<h2>Motivo</h2>
<p>[DESCREVER O MOTIVO]</p>
<h2>Observações</h2>
<p>[OBSERVAÇÕES ADICIONAIS]</p>
<hr>
<p><strong>Assinatura do Solicitante:</strong> _______________________</p>
<p><strong>Aprovação do Gestor:</strong> _______________________</p>',
      true,
      false,
      sample_user_id
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Sample templates created successfully.';
  ELSE
    RAISE NOTICE 'No users found. Sample templates will be created when users exist.';
  END IF;
END $$;
