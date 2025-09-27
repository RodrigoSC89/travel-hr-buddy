-- CORREÇÃO FINAL DO SISTEMA PEOTRAM - usando estrutura real das tabelas
DO $$
DECLARE
  sample_user_id uuid;
  audit_uuid uuid;
BEGIN
  -- Obter usuário existente
  SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
  
  -- 1. Criar template PEOTRAM padrão
  INSERT INTO public.peotram_templates (
    year,
    version,
    checklist_type,
    template_data,
    is_active
  ) VALUES (
    2024,
    '2024.1',
    'vessel',
    '{
      "elements": [
        {
          "number": "ELEMENT_01",
          "name": "Sistema de Gestão",
          "requirements": [
            "Política de Segurança definida",
            "Estrutura organizacional clara",
            "Responsabilidades definidas"
          ]
        },
        {
          "number": "ELEMENT_02", 
          "name": "Conformidade Legal",
          "requirements": [
            "Atendimento às NRs",
            "Conformidade com STCW",
            "Cumprimento do Código ISM"
          ]
        }
      ]
    }',
    true
  )
  ON CONFLICT DO NOTHING;
  
  -- 2. Se há usuário, criar auditorias de exemplo
  IF sample_user_id IS NOT NULL THEN
    INSERT INTO public.peotram_audits (
      audit_period,
      audit_date,
      audit_type,
      status,
      auditor_name,
      compliance_score,
      non_conformities_count,
      created_by,
      shore_location,
      metadata
    ) VALUES 
    (
      '2024-Q4',
      '2024-12-15',
      'shore',
      'concluido',
      'Auditor PEOTRAM',
      85.5,
      2,
      sample_user_id,
      'Terminal Santos',
      '{"template_version": "2024.1"}'
    ),
    (
      '2024-Q3',
      '2024-09-20',
      'vessel',
      'aprovado',
      'Auditor Senior',
      92.0,
      1,
      sample_user_id,
      'Base Rio',
      '{"template_version": "2024.1"}'
    )
    ON CONFLICT DO NOTHING;
    
    -- 3. Inserir não conformidades usando campos corretos
    SELECT id INTO audit_uuid 
    FROM public.peotram_audits 
    WHERE created_by = sample_user_id 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF audit_uuid IS NOT NULL THEN
      INSERT INTO public.peotram_non_conformities (
        audit_id,
        element_number,
        element_name,
        non_conformity_type,
        description,
        corrective_action,
        responsible_person,
        target_date,
        status,
        severity_score,
        created_by
      ) VALUES 
      (
        audit_uuid,
        'ELEMENT_01',
        'Sistema de Gestão',
        'documentation',
        'Política de segurança desatualizada',
        'Atualizar política de segurança',
        'Gestor de Segurança',
        CURRENT_DATE + INTERVAL '30 days',
        'open',
        5,
        sample_user_id
      ),
      (
        audit_uuid,
        'ELEMENT_02', 
        'Conformidade Legal',
        'certification',
        'Certificação STCW próxima ao vencimento',
        'Renovar certificação STCW',
        'Departamento de RH',
        CURRENT_DATE + INTERVAL '10 days',
        'in_progress',
        8,
        sample_user_id
      )
      ON CONFLICT DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Sistema PEOTRAM completamente configurado com dados de exemplo.';
  ELSE
    RAISE NOTICE 'Template PEOTRAM criado. Auditorias serão criadas quando houver usuários autenticados.';
  END IF;
END $$;