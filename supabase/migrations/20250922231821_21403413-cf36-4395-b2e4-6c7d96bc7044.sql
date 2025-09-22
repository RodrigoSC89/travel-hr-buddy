-- Criar bucket para certificados
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', false);

-- Criar tabela de certificados
CREATE TABLE public.employee_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  certificate_name TEXT NOT NULL,
  certificate_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  issuer TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'expiring_soon')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.employee_certificates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para certificados
CREATE POLICY "Anyone can view certificates" 
ON public.employee_certificates 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert certificates" 
ON public.employee_certificates 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update certificates" 
ON public.employee_certificates 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete certificates" 
ON public.employee_certificates 
FOR DELETE 
USING (true);

-- Políticas de storage para certificados
CREATE POLICY "Authenticated users can upload certificates" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Authenticated users can view certificates" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'certificates');

CREATE POLICY "Authenticated users can update certificates" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'certificates');

CREATE POLICY "Authenticated users can delete certificates" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'certificates');

-- Função para atualizar updated_at
CREATE TRIGGER update_employee_certificates_updated_at
BEFORE UPDATE ON public.employee_certificates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para atualizar status baseado na data de expiração
CREATE OR REPLACE FUNCTION public.update_certificate_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Atualizar status baseado na data de expiração
  IF NEW.expiry_date <= CURRENT_DATE THEN
    NEW.status = 'expired';
  ELSIF NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
    NEW.status = 'expiring_soon';
  ELSE
    NEW.status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para atualizar status automaticamente
CREATE TRIGGER update_certificate_status_trigger
BEFORE INSERT OR UPDATE ON public.employee_certificates
FOR EACH ROW
EXECUTE FUNCTION public.update_certificate_status();

-- Tabela de alertas de certificados
CREATE TABLE public.certificate_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_id UUID NOT NULL REFERENCES public.employee_certificates(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('expiring_soon', 'expired')),
  alert_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para alertas
ALTER TABLE public.certificate_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para alertas
CREATE POLICY "Anyone can view certificate alerts" 
ON public.certificate_alerts 
FOR SELECT 
USING (true);

CREATE POLICY "System can insert certificate alerts" 
ON public.certificate_alerts 
FOR INSERT 
WITH CHECK (true);