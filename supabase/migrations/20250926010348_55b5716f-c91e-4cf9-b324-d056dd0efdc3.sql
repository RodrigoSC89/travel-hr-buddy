-- Create error logs table for production monitoring
CREATE TABLE public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  component_stack TEXT,
  user_agent TEXT,
  url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all error logs" 
ON public.error_logs 
FOR SELECT 
USING (get_user_role() = 'admin'::user_role);

CREATE POLICY "System can create error logs" 
ON public.error_logs 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_error_logs_timestamp ON public.error_logs(timestamp DESC);
CREATE INDEX idx_error_logs_resolved ON public.error_logs(resolved);
CREATE INDEX idx_error_logs_user_id ON public.error_logs(user_id);

-- Create system status table
CREATE TABLE public.system_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('operational', 'degraded', 'down', 'maintenance')),
  description TEXT,
  last_check TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response_time INTEGER, -- in milliseconds
  uptime_percentage NUMERIC(5,2),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_status ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view system status" 
ON public.system_status 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage status" 
ON public.system_status 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_system_status_updated_at
BEFORE UPDATE ON public.system_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial system services
INSERT INTO public.system_status (service_name, status, description, uptime_percentage) VALUES
('web_app', 'operational', 'Aplicação web principal', 99.9),
('database', 'operational', 'Banco de dados PostgreSQL', 99.8),
('api', 'operational', 'APIs REST', 99.7),
('authentication', 'operational', 'Sistema de autenticação', 99.9),
('storage', 'operational', 'Armazenamento de arquivos', 99.5);

-- Create user feedback table
CREATE TABLE public.user_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'improvement', 'complaint', 'compliment')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  page_url TEXT,
  browser_info TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own feedback" 
ON public.user_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" 
ON public.user_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback" 
ON public.user_feedback 
FOR SELECT 
USING (get_user_role() = 'admin'::user_role);

CREATE POLICY "Admins can update feedback" 
ON public.user_feedback 
FOR UPDATE 
USING (get_user_role() = 'admin'::user_role);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_feedback_updated_at
BEFORE UPDATE ON public.user_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();