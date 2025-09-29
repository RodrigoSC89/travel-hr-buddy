-- Atualizar políticas existentes para evitar recursão infinita e melhorar a estrutura da tabela reservations
DROP POLICY IF EXISTS "HR managers can view all reservations" ON public.reservations;

-- Corrigir estrutura da tabela reservations se necessário
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS contact_info TEXT;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS confirmation_number TEXT;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS supplier_url TEXT;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS room_type TEXT;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL';
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS attachments TEXT[];

-- Atualizar check constraints se necessário
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reservations_status_check_updated') THEN
    ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_status_check;
    ALTER TABLE public.reservations ADD CONSTRAINT reservations_status_check_updated 
      CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reservations_type_check_updated') THEN
    ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_reservation_type_check;
    ALTER TABLE public.reservations ADD CONSTRAINT reservations_type_check_updated 
      CHECK (reservation_type IN ('hotel', 'transport', 'embarkation', 'flight', 'other'));
  END IF;
END $$;

-- Política melhorada para HR managers sem recursão
CREATE POLICY "HR managers can view all reservations" 
ON public.reservations 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'hr_manager')
  )
);

-- Criar função para detecção de conflitos
CREATE OR REPLACE FUNCTION public.detect_reservation_conflicts(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS TABLE (
  conflicting_reservation_id UUID,
  conflicting_title TEXT,
  conflicting_start_date TIMESTAMPTZ,
  conflicting_end_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.start_date,
    r.end_date
  FROM public.reservations r
  WHERE r.user_id = p_user_id
    AND r.status != 'cancelled'
    AND (p_exclude_id IS NULL OR r.id != p_exclude_id)
    AND r.start_date < p_end_date
    AND r.end_date > p_start_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para estatísticas de reservas
CREATE OR REPLACE FUNCTION public.get_reservation_stats(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_reservations BIGINT,
  confirmed_reservations BIGINT,
  pending_reservations BIGINT,
  cancelled_reservations BIGINT,
  completed_reservations BIGINT,
  total_amount DECIMAL(10,2),
  conflicts_count BIGINT
) AS $$
DECLARE
  target_user_id UUID;
BEGIN
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  RETURN QUERY
  SELECT 
    COUNT(*) as total_reservations,
    COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_reservations,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_reservations,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_reservations,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_reservations,
    COALESCE(SUM(total_amount) FILTER (WHERE status != 'cancelled'), 0::DECIMAL(10,2)) as total_amount,
    0::BIGINT as conflicts_count
  FROM public.reservations
  WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar tabela para templates de reservas
CREATE TABLE IF NOT EXISTS public.reservation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_type TEXT NOT NULL,
  template_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for templates
ALTER TABLE public.reservation_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for templates
CREATE POLICY "Users can view public templates and their own" 
ON public.reservation_templates 
FOR SELECT 
USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create their own templates" 
ON public.reservation_templates 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own templates" 
ON public.reservation_templates 
FOR UPDATE 
USING (created_by = auth.uid());

-- Criar tabela para anexos de reservas
CREATE TABLE IF NOT EXISTS public.reservation_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for attachments
ALTER TABLE public.reservation_attachments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for attachments
CREATE POLICY "Users can view attachments of their reservations" 
ON public.reservation_attachments 
FOR SELECT 
USING (
  reservation_id IN (
    SELECT id FROM public.reservations WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create attachments for their reservations" 
ON public.reservation_attachments 
FOR INSERT 
WITH CHECK (
  reservation_id IN (
    SELECT id FROM public.reservations WHERE user_id = auth.uid()
  )
);

-- Criar indexes para melhor performance
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_start_date ON public.reservations(start_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_type ON public.reservations(reservation_type);
CREATE INDEX IF NOT EXISTS idx_reservation_attachments_reservation_id ON public.reservation_attachments(reservation_id);