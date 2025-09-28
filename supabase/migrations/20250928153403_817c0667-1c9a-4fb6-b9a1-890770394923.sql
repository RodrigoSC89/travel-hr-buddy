-- Criar apenas bucket de storage e funções auxiliares para checklists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('checklist-evidence', 'checklist-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o bucket de evidências
CREATE POLICY "Users can upload evidence to their organization"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'checklist-evidence' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] IN (
      SELECT organization_id::text 
      FROM organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can view evidence from their organization"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'checklist-evidence' AND
    (storage.foldername(name))[1] IN (
      SELECT organization_id::text 
      FROM organization_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Função para gerar próximas datas de checklist
CREATE OR REPLACE FUNCTION public.generate_next_checklist_date(
  frequency TEXT,
  last_date TIMESTAMP WITH TIME ZONE DEFAULT now()
)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  CASE frequency
    WHEN 'daily' THEN
      RETURN last_date + INTERVAL '1 day';
    WHEN 'weekly' THEN
      RETURN last_date + INTERVAL '1 week';
    WHEN 'monthly' THEN
      RETURN last_date + INTERVAL '1 month';
    WHEN 'quarterly' THEN
      RETURN last_date + INTERVAL '3 months';
    WHEN 'annually' THEN
      RETURN last_date + INTERVAL '1 year';
    ELSE
      RETURN last_date + INTERVAL '1 day';
  END CASE;
END;
$$;

-- Função para calcular compliance score
CREATE OR REPLACE FUNCTION public.calculate_checklist_compliance_score(checklist_items JSONB)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  total_required INTEGER := 0;
  completed_required INTEGER := 0;
  item JSONB;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(checklist_items)
  LOOP
    IF (item->>'required')::BOOLEAN = true THEN
      total_required := total_required + 1;
      IF (item->>'status') = 'completed' THEN
        completed_required := completed_required + 1;
      END IF;
    END IF;
  END LOOP;
  
  IF total_required = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((completed_required::NUMERIC / total_required::NUMERIC) * 100, 2);
END;
$$;