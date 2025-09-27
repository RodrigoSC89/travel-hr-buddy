-- Corrigir inserção de dados de exemplo para PEOTRAM
-- Primeiro inserir template padrão
INSERT INTO public.peotram_templates (
  id,
  year,
  version,
  checklist_type,
  template_data,
  is_active
) VALUES (
  gen_random_uuid(),
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
          "Estrutura organizacional clara",
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
          "Monitoramento contínuo"
        ]
      }
    ]
  }',
  true
)
ON CONFLICT DO NOTHING;

-- Criar função para inserir dados de exemplo quando usuário está logado
CREATE OR REPLACE FUNCTION public.create_sample_peotram_audit()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  audit_uuid uuid;
BEGIN
  -- Verificar se usuário está autenticado
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário deve estar logado para criar auditoria de exemplo';
  END IF;
  
  -- Inserir auditoria de exemplo
  INSERT INTO public.peotram_audits (
    id,
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
  ) VALUES (
    gen_random_uuid(),
    public.get_current_organization_id(),
    '2024-Q4',
    '2024-12-15',
    'shore',
    'completed',
    'Auditor PEOTRAM Sistema',
    85.5,
    0,
    auth.uid(),
    'Terminal de Santos - Exemplo',
    '{"template_version": "2024.1", "audit_duration_hours": 8, "sample_data": true}'
  ) RETURNING id INTO audit_uuid;
  
  -- Inserir não conformidades de exemplo
  INSERT INTO public.peotram_non_conformities (
    audit_id,
    element_number,
    element_name,
    requirement_code,
    description,
    severity,
    category,
    evidence,
    corrective_action,
    responsible,
    deadline,
    status
  ) VALUES 
  (
    audit_uuid,
    'ELEMENT_01',
    'Sistema de Gestão',
    'REQ_01_01',
    'Política de segurança precisa de atualização conforme últimas revisões normativas',
    'medium',
    'documentation',
    'Documento de política datado de 2022',
    'Atualizar política conforme normas vigentes',
    'Gestor de Segurança',
    CURRENT_DATE + INTERVAL '30 days',
    'open'
  ),
  (
    audit_uuid,
    'ELEMENT_02',
    'Conformidade Legal',
    'REQ_02_03',
    'Certificação STCW de tripulante próxima ao vencimento',
    'high',
    'certification',
    'Certificado vence em 15 dias',
    'Renovar certificação antes do vencimento',
    'Departamento de RH',
    CURRENT_DATE + INTERVAL '10 days',
    'in_progress'
  );
  
  RETURN audit_uuid;
END;
$$;