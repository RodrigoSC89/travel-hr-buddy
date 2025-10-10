-- Create modules table
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('functional', 'pending', 'disabled')),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - modules are public readable
CREATE POLICY "Modules are viewable by everyone" 
ON public.modules 
FOR SELECT 
USING (true);

-- Only admins can modify modules
CREATE POLICY "Only admins can insert modules" 
ON public.modules 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'hr_manager')
  )
);

CREATE POLICY "Only admins can update modules" 
ON public.modules 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'hr_manager')
  )
);

CREATE POLICY "Only admins can delete modules" 
ON public.modules 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'hr_manager')
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_modules_updated_at
BEFORE UPDATE ON public.modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_modules_status ON public.modules(status);
CREATE INDEX idx_modules_name ON public.modules(name);

-- Insert initial module data
INSERT INTO public.modules (name, path, status, description) VALUES
  ('Dashboard', '/dashboard', 'functional', 'Painel principal de controle'),
  ('Sistema Marítimo', '/maritime', 'functional', 'Gestão de frotas e embarcações'),
  ('IA e Inovação', '/innovation', 'functional', 'Centro de IA e inovação'),
  ('Portal Funcionário', '/portal', 'functional', 'Portal de auto-atendimento'),
  ('Viagens', '/travel', 'functional', 'Gestão de viagens'),
  ('Alertas de Preços', '/price-alerts', 'functional', 'Monitoramento de preços'),
  ('Hub Integrações', '/intelligence', 'functional', 'Hub de integrações e APIs'),
  ('Reservas', '/reservations', 'functional', 'Sistema de reservas e booking'),
  ('Comunicação', '/communication', 'functional', 'Centro de comunicação'),
  ('Configurações', '/settings', 'functional', 'Configurações do sistema'),
  ('Otimização', '/optimization', 'functional', 'Otimização de performance'),
  ('Assistente de Voz', '/voice', 'functional', 'Assistente de voz'),
  ('Centro Notificações', '/notifications', 'pending', 'Centro de notificações'),
  ('Monitor Sistema', '/health-monitor', 'functional', 'Monitoramento do sistema'),
  ('Documentos', '/documents', 'pending', 'Gestão de documentos'),
  ('Colaboração', '/collaboration', 'functional', 'Ferramentas de colaboração'),
  ('Otimização Mobile', '/mobile', 'pending', 'Otimização mobile'),
  ('Checklists Inteligentes', '/checklists', 'functional', 'Checklists inteligentes'),
  ('PEOTRAM', '/peotram', 'functional', 'Excelência operacional'),
  ('PEO-DP', '/peo-dp', 'functional', 'Gestão de RH e pessoal'),
  ('SGSO', '/sgso', 'functional', 'Sistema de gestão de saúde e segurança'),
  ('Templates', '/templates', 'pending', 'Gestão de templates'),
  ('Analytics Avançado', '/analytics', 'functional', 'Analytics avançado'),
  ('Analytics Tempo Real', '/realtime', 'pending', 'Analytics em tempo real'),
  ('Monitor Avançado', '/system-monitor', 'pending', 'Monitoramento avançado'),
  ('Documentos IA', '/documents-ai', 'pending', 'Processamento de documentos com IA'),
  ('Assistente IA', '/ai-assistant', 'pending', 'Assistente inteligente'),
  ('Business Intelligence', '/bi', 'pending', 'Business Intelligence'),
  ('Smart Workflow', '/workflow', 'pending', 'Automação de workflows'),
  ('Centro de Ajuda', '/help', 'pending', 'Centro de ajuda'),
  ('Automação IA', '/automation', 'pending', 'Automação com IA'),
  ('Visão Geral', '/overview', 'pending', 'Visão geral executiva');
