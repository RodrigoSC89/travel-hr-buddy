-- Create employees table for HR management
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  phone TEXT,
  nationality TEXT,
  passport_number TEXT,
  contract_start DATE NOT NULL,
  contract_end DATE,
  vessel_assignment TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'terminated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL,
  certificate_number TEXT NOT NULL,
  issuing_authority TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expiring_soon', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vessels table
CREATE TABLE public.vessels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  imo_number TEXT UNIQUE,
  vessel_type TEXT NOT NULL,
  flag_state TEXT NOT NULL,
  current_location TEXT,
  next_port TEXT,
  eta TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'in_port', 'maintenance', 'emergency')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reservation_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create new messages table for communication
CREATE TABLE public.nautilus_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nautilus_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for employees
CREATE POLICY "Users can view employees based on role" ON public.employees
  FOR SELECT USING (
    public.get_user_role() IN ('admin', 'hr_manager') OR 
    user_id = auth.uid()
  );

CREATE POLICY "HR can manage employees" ON public.employees
  FOR ALL USING (public.get_user_role() IN ('admin', 'hr_manager'));

-- Create RLS policies for certificates
CREATE POLICY "Users can view their certificates" ON public.certificates
  FOR SELECT USING (
    public.get_user_role() IN ('admin', 'hr_manager') OR 
    employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid())
  );

CREATE POLICY "HR can manage certificates" ON public.certificates
  FOR ALL USING (public.get_user_role() IN ('admin', 'hr_manager'));

-- Create RLS policies for vessels
CREATE POLICY "Authenticated users can view vessels" ON public.vessels
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage vessels" ON public.vessels
  FOR ALL USING (public.get_user_role() = 'admin');

-- Create RLS policies for reservations
CREATE POLICY "Users can manage their reservations" ON public.reservations
  FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for messages
CREATE POLICY "Users can view their messages" ON public.nautilus_messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.nautilus_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Create triggers for automatic timestamps
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at
  BEFORE UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vessels_updated_at
  BEFORE UPDATE ON public.vessels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nautilus_messages_updated_at
  BEFORE UPDATE ON public.nautilus_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.employees (employee_id, full_name, email, position, department, nationality, contract_start, contract_end, vessel_assignment) VALUES
('EMP001', 'João Silva', 'joao.silva@nautilusone.com', 'Capitão', 'Navegação', 'Brasileiro', '2024-01-01', '2024-12-31', 'MV Ocean Pioneer'),
('EMP002', 'Maria Santos', 'maria.santos@nautilusone.com', 'Engenheira Chefe', 'Engenharia', 'Brasileira', '2024-01-01', '2024-06-30', 'MV Ocean Pioneer'),
('EMP003', 'Carlos Oliveira', 'carlos.oliveira@nautilusone.com', 'Oficial de Convés', 'Navegação', 'Brasileiro', '2024-01-15', '2024-07-15', 'MV Atlantic Star');

INSERT INTO public.vessels (name, imo_number, vessel_type, flag_state, current_location, next_port, eta, status) VALUES
('MV Ocean Pioneer', 'IMO9876543', 'Container Ship', 'Brazil', 'Santos, BR', 'Hamburg, DE', '2024-02-15T14:30:00Z', 'active'),
('MV Atlantic Star', 'IMO9876544', 'Bulk Carrier', 'Brazil', 'Rio de Janeiro, BR', 'New York, US', '2024-02-20T08:00:00Z', 'in_port'),
('MV Pacific Explorer', 'IMO9876545', 'Tanker', 'Brazil', 'Paranaguá, BR', 'Rotterdam, NL', '2024-02-25T12:00:00Z', 'active');

INSERT INTO public.certificates (employee_id, certificate_type, certificate_number, issuing_authority, issue_date, expiry_date, status) VALUES
((SELECT id FROM public.employees WHERE employee_id = 'EMP001'), 'STCW Basic Safety Training', 'BST001234', 'IMO', '2023-01-15', '2028-01-15', 'active'),
((SELECT id FROM public.employees WHERE employee_id = 'EMP001'), 'Master Mariner License', 'MML567890', 'Brazilian Navy', '2022-06-01', '2027-06-01', 'active'),
((SELECT id FROM public.employees WHERE employee_id = 'EMP002'), 'Engineer Officer License', 'EOL112233', 'Brazilian Navy', '2023-03-10', '2025-03-10', 'expiring_soon');