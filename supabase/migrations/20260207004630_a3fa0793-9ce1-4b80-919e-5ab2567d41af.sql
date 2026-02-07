
-- Seed corrective_actions with correct column names
INSERT INTO corrective_actions (id, ncr_id, description, due_date, status, action_type, completed_date)
SELECT 
  gen_random_uuid(),
  nc.id,
  action_desc,
  (CURRENT_DATE + (days_offset || ' days')::interval),
  action_status,
  action_type,
  CASE WHEN action_status = 'completed' THEN now() ELSE NULL END
FROM non_conformities nc
CROSS JOIN LATERAL (
  VALUES 
    ('Revisar procedimentos de drill e atualizar registro no SMS', '30', 'completed', 'corrective'),
    ('Implementar checklist de verificação automática pré-operação', '45', 'in_progress', 'preventive'),
    ('Realizar treinamento de reciclagem para equipe envolvida', '60', 'pending', 'corrective')
) AS actions(action_desc, days_offset, action_status, action_type)
LIMIT 15;

-- Create storage bucket for documents if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', false, 52428800, ARRAY['application/pdf','image/png','image/jpeg','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload documents' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can upload documents"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'documents');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view documents' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can view documents"
    ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'documents');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update documents' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can update documents"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'documents');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete documents' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can delete documents"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'documents');
  END IF;
END $$;
