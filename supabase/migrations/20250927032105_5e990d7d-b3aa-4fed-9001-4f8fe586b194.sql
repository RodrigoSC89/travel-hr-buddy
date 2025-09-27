-- Inserir dados PEOTRAM finais com colunas corretas
DO $$
DECLARE
  sample_user_id uuid;
  audit_uuid uuid;
BEGIN
  -- Tentar obter um usuário existente
  SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
  
  IF sample_user_id IS NOT NULL THEN
    -- Inserir auditorias de exemplo
    INSERT INTO public.peotram_audits (
      organization_id,
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
      NULL,
      '2024-Q4',
      '2024-12-15',
      'shore',
      'concluido',
      'Auditor PEOTRAM Teste',
      85.5,
      2,
      sample_user_id,
      'Terminal de Santos',
      '{"template_version": "2024.1", "audit_duration_hours": 8}'
    ),
    (
      NULL,
      '2024-Q3',
      '2024-09-20',
      'vessel',
      'aprovado',
      'Auditor Senior PEOTRAM',
      92.0,
      1,
      sample_user_id,
      'Base Operacional Rio',
      '{"template_version": "2024.1", "audit_duration_hours": 12}'
    )
    ON CONFLICT DO NOTHING;
    
    -- Obter auditoria para inserir não conformidades
    SELECT id INTO audit_uuid 
    FROM public.peotram_audits 
    WHERE created_by = sample_user_id 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF audit_uuid IS NOT NULL THEN
      -- Inserir não conformidades usando colunas que existem
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
        area_department,
        severity_score,
        created_by
      ) VALUES 
      (
        audit_uuid,
        'ELEMENT_01',
        'Sistema de Gestão',
        'documentation',
        'Política de segurança desatualizada - documento datado de 2022',
        'Atualizar política de segurança conforme normas vigentes',
        'Gestor de Segurança',
        CURRENT_DATE + INTERVAL '30 days',
        'open',
        'Segurança',
        6, -- severity_score médio
        sample_user_id
      ),
      (
        audit_uuid,
        'ELEMENT_02',
        'Conformidade Legal',
        'certification',
        'Certificação STCW de tripulante próxima ao vencimento em 15 dias',
        'Renovar certificação STCW antes do vencimento',
        'Departamento de RH',
        CURRENT_DATE + INTERVAL '10 days',
        'in_progress',
        'Recursos Humanos',
        8, -- severity_score alto
        sample_user_id
      )
      ON CONFLICT DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Dados de exemplo PEOTRAM inseridos com sucesso.';
  END IF;
  
  -- Inserir template PEOTRAM
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
            "Política de Segurança definida e comunicada",
            "Estrutura organizacional clara e definida",
            "Responsabilidades e autoridades definidas",
            "Controles internos implementados"
          ]
        },
        {
          "number": "ELEMENT_02", 
          "name": "Conformidade Legal",
          "requirements": [
            "Atendimento às NRs aplicáveis",
            "Conformidade com STCW",
            "Cumprimento do Código ISM",
            "Licenças e certificações válidas"
          ]
        },
        {
          "number": "ELEMENT_03",
          "name": "Gestão de Riscos",
          "requirements": [
            "Identificação de perigos operacionais",
            "Avaliação de riscos documentada",
            "Medidas de controle implementadas",
            "Monitoramento contínuo de riscos"
          ]
        }
      ]
    }',
    true
  )
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Sistema PEOTRAM completamente configurado.';
END $$;