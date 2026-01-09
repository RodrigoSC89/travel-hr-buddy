-- =============================================
-- NAUTILUS ONE - HR/DP MODULE SCHEMA
-- Complete HR Management System with AI
-- =============================================

-- 1. EMPLOYEES (Colaboradores)
CREATE TABLE public.hr_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID REFERENCES auth.users(id),
  
  -- Personal Info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cpf TEXT,
  rg TEXT,
  birth_date DATE,
  gender TEXT,
  marital_status TEXT,
  nationality TEXT DEFAULT 'Brasileiro',
  
  -- Address
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  
  -- Professional Info
  employee_number TEXT,
  position TEXT NOT NULL,
  department TEXT,
  cost_center TEXT,
  hire_date DATE NOT NULL,
  termination_date DATE,
  contract_type TEXT DEFAULT 'CLT', -- CLT, PJ, Estágio, Temporário
  work_schedule TEXT DEFAULT '44h semanais',
  
  -- Compensation
  base_salary DECIMAL(12,2),
  salary_currency TEXT DEFAULT 'BRL',
  payment_method TEXT DEFAULT 'Conta Corrente',
  bank_name TEXT,
  bank_branch TEXT,
  bank_account TEXT,
  pix_key TEXT,
  
  -- Documents
  pis_pasep TEXT,
  ctps_number TEXT,
  ctps_series TEXT,
  voter_id TEXT,
  military_cert TEXT,
  driver_license TEXT,
  driver_license_category TEXT,
  
  -- Status & AI
  status TEXT DEFAULT 'active', -- active, inactive, on_leave, terminated
  turnover_risk_score DECIMAL(5,2), -- 0-100% AI calculated
  turnover_risk_factors JSONB,
  wellness_score DECIMAL(5,2),
  last_ai_analysis TIMESTAMPTZ,
  
  -- Metadata
  profile_photo_url TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. PAYROLL (Folha de Pagamento)
CREATE TABLE public.hr_payroll (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  employee_id UUID REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  
  -- Period
  reference_month INTEGER NOT NULL, -- 1-12
  reference_year INTEGER NOT NULL,
  payment_date DATE,
  
  -- Earnings
  base_salary DECIMAL(12,2) NOT NULL,
  overtime_hours DECIMAL(8,2) DEFAULT 0,
  overtime_value DECIMAL(12,2) DEFAULT 0,
  night_shift_hours DECIMAL(8,2) DEFAULT 0,
  night_shift_value DECIMAL(12,2) DEFAULT 0,
  commissions DECIMAL(12,2) DEFAULT 0,
  bonuses DECIMAL(12,2) DEFAULT 0,
  hazard_pay DECIMAL(12,2) DEFAULT 0,
  other_earnings DECIMAL(12,2) DEFAULT 0,
  gross_salary DECIMAL(12,2) NOT NULL,
  
  -- Deductions
  inss_employee DECIMAL(12,2) DEFAULT 0,
  irrf DECIMAL(12,2) DEFAULT 0,
  fgts DECIMAL(12,2) DEFAULT 0,
  health_insurance DECIMAL(12,2) DEFAULT 0,
  dental_insurance DECIMAL(12,2) DEFAULT 0,
  meal_voucher_discount DECIMAL(12,2) DEFAULT 0,
  transport_voucher_discount DECIMAL(12,2) DEFAULT 0,
  advances DECIMAL(12,2) DEFAULT 0,
  other_deductions DECIMAL(12,2) DEFAULT 0,
  total_deductions DECIMAL(12,2) NOT NULL,
  
  -- Net
  net_salary DECIMAL(12,2) NOT NULL,
  
  -- Employer Costs
  inss_employer DECIMAL(12,2) DEFAULT 0,
  fgts_employer DECIMAL(12,2) DEFAULT 0,
  rat DECIMAL(12,2) DEFAULT 0,
  terceiros DECIMAL(12,2) DEFAULT 0,
  total_employer_cost DECIMAL(12,2),
  
  -- Status
  status TEXT DEFAULT 'draft', -- draft, calculated, approved, paid
  calculated_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  paid_at TIMESTAMPTZ,
  
  -- AI Validation
  ai_validated BOOLEAN DEFAULT false,
  ai_anomalies JSONB,
  ai_suggestions JSONB,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. BENEFITS (Benefícios)
CREATE TABLE public.hr_benefits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  
  benefit_name TEXT NOT NULL,
  benefit_type TEXT NOT NULL, -- meal, transport, health, dental, gym, education, childcare, other
  description TEXT,
  provider TEXT,
  
  -- Values
  company_contribution DECIMAL(12,2) DEFAULT 0,
  employee_contribution DECIMAL(12,2) DEFAULT 0,
  is_percentage BOOLEAN DEFAULT false,
  
  -- Eligibility
  eligibility_rules JSONB,
  min_tenure_days INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. EMPLOYEE BENEFITS (Benefícios por Colaborador)
CREATE TABLE public.hr_employee_benefits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  benefit_id UUID REFERENCES public.hr_benefits(id) ON DELETE CASCADE,
  
  enrollment_date DATE NOT NULL,
  end_date DATE,
  custom_value DECIMAL(12,2),
  dependents_count INTEGER DEFAULT 0,
  
  status TEXT DEFAULT 'active', -- active, suspended, cancelled
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(employee_id, benefit_id)
);

-- 5. VACATIONS (Férias)
CREATE TABLE public.hr_vacations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  employee_id UUID REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  
  -- Acquisition Period
  acquisition_start DATE NOT NULL,
  acquisition_end DATE NOT NULL,
  days_entitled INTEGER DEFAULT 30,
  days_taken INTEGER DEFAULT 0,
  days_remaining INTEGER GENERATED ALWAYS AS (days_entitled - days_taken) STORED,
  
  -- Requested Period
  start_date DATE,
  end_date DATE,
  days_requested INTEGER,
  
  -- Sell Days (Abono Pecuniário)
  sell_days INTEGER DEFAULT 0,
  sell_value DECIMAL(12,2),
  
  -- 13th Salary Advance
  advance_13th BOOLEAN DEFAULT false,
  advance_13th_value DECIMAL(12,2),
  
  -- Financial
  vacation_pay DECIMAL(12,2),
  vacation_bonus DECIMAL(12,2), -- 1/3 constitucional
  total_value DECIMAL(12,2),
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, scheduled, in_progress, completed, expired
  requested_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  
  -- AI Recommendations
  ai_recommended_period JSONB,
  ai_conflict_check JSONB,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TIME TRACKING (Controle de Ponto)
CREATE TABLE public.hr_time_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  employee_id UUID REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  
  tracking_date DATE NOT NULL,
  
  -- Clock Times
  clock_in_1 TIME,
  clock_out_1 TIME,
  clock_in_2 TIME,
  clock_out_2 TIME,
  clock_in_3 TIME,
  clock_out_3 TIME,
  
  -- Calculated
  worked_hours DECIMAL(5,2),
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  night_hours DECIMAL(5,2) DEFAULT 0,
  break_hours DECIMAL(5,2),
  
  -- Justifications
  absence_type TEXT, -- none, vacation, sick_leave, personal, holiday, etc
  absence_justified BOOLEAN DEFAULT false,
  justification TEXT,
  attachment_url TEXT,
  
  -- Location (for mobile clock-in)
  clock_in_location JSONB,
  clock_out_location JSONB,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, adjusted
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(employee_id, tracking_date)
);

-- 7. PERFORMANCE REVIEWS (Avaliações de Desempenho)
CREATE TABLE public.hr_performance_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  employee_id UUID REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.hr_employees(id),
  
  -- Review Period
  review_type TEXT NOT NULL, -- annual, semi_annual, quarterly, probation, 360
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Scores (1-5 scale)
  technical_skills DECIMAL(3,2),
  soft_skills DECIMAL(3,2),
  goal_achievement DECIMAL(3,2),
  teamwork DECIMAL(3,2),
  leadership DECIMAL(3,2),
  innovation DECIMAL(3,2),
  overall_score DECIMAL(3,2),
  
  -- Content
  strengths TEXT,
  improvement_areas TEXT,
  goals_next_period TEXT,
  development_plan TEXT,
  
  -- Employee Feedback
  employee_comments TEXT,
  employee_agrees BOOLEAN,
  
  -- Status
  status TEXT DEFAULT 'draft', -- draft, pending_review, pending_employee, completed, cancelled
  completed_at TIMESTAMPTZ,
  
  -- AI Analysis
  ai_sentiment_analysis JSONB,
  ai_recommendations JSONB,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. DIGITAL ADMISSION (Admissão Digital)
CREATE TABLE public.hr_admissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  
  -- Candidate Info
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  candidate_phone TEXT,
  position TEXT NOT NULL,
  department TEXT,
  proposed_salary DECIMAL(12,2),
  proposed_start_date DATE,
  
  -- Documents Status
  documents_requested JSONB, -- List of required docs
  documents_received JSONB, -- Status of each doc
  documents_validated JSONB, -- AI validation results
  
  -- Process Status
  status TEXT DEFAULT 'pending', -- pending, documents_sent, documents_received, validating, approved, contract_sent, signed, completed, rejected
  
  -- Contract
  contract_template_id UUID,
  contract_generated_at TIMESTAMPTZ,
  contract_signed_at TIMESTAMPTZ,
  contract_url TEXT,
  
  -- Onboarding
  onboarding_checklist JSONB,
  onboarding_progress INTEGER DEFAULT 0,
  first_day_date DATE,
  
  -- AI Processing
  ocr_results JSONB,
  ai_validation_score DECIMAL(5,2),
  ai_flags JSONB,
  
  -- Tracking
  invite_sent_at TIMESTAMPTZ,
  reminder_count INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. HR CHATBOT LOGS
CREATE TABLE public.hr_chatbot_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  employee_id UUID REFERENCES public.hr_employees(id),
  
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT,
  intent_detected TEXT,
  confidence_score DECIMAL(5,2),
  action_taken TEXT,
  resolved BOOLEAN DEFAULT false,
  escalated_to_human BOOLEAN DEFAULT false,
  
  response_time_ms INTEGER,
  tokens_used INTEGER,
  
  feedback_rating INTEGER, -- 1-5
  feedback_comment TEXT,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. TURNOVER PREDICTIONS (AI)
CREATE TABLE public.hr_turnover_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  employee_id UUID REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  
  prediction_date DATE NOT NULL,
  risk_score DECIMAL(5,2) NOT NULL, -- 0-100%
  risk_level TEXT NOT NULL, -- low, medium, high, critical
  
  -- Factors
  salary_factor DECIMAL(5,2),
  tenure_factor DECIMAL(5,2),
  performance_factor DECIMAL(5,2),
  engagement_factor DECIMAL(5,2),
  manager_factor DECIMAL(5,2),
  workload_factor DECIMAL(5,2),
  growth_factor DECIMAL(5,2),
  
  -- AI Insights
  top_risk_factors JSONB,
  recommended_actions JSONB,
  similar_departures JSONB,
  predicted_departure_window TEXT, -- "30-60 days", "60-90 days", etc
  
  -- Model Info
  model_version TEXT,
  model_accuracy DECIMAL(5,2),
  
  -- Action Tracking
  action_taken BOOLEAN DEFAULT false,
  action_details TEXT,
  action_date TIMESTAMPTZ,
  action_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. CLIMATE SURVEYS (Pesquisas de Clima)
CREATE TABLE public.hr_climate_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  
  survey_name TEXT NOT NULL,
  survey_type TEXT DEFAULT 'pulse', -- pulse, quarterly, annual, custom
  questions JSONB NOT NULL,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  
  status TEXT DEFAULT 'draft', -- draft, active, closed, analyzing
  
  -- Results
  total_responses INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2),
  overall_score DECIMAL(3,2),
  nps_score INTEGER,
  
  -- AI Analysis
  ai_insights JSONB,
  sentiment_analysis JSONB,
  action_recommendations JSONB,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. CLIMATE SURVEY RESPONSES
CREATE TABLE public.hr_climate_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES public.hr_climate_surveys(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.hr_employees(id), -- null if anonymous
  
  answers JSONB NOT NULL,
  text_feedback TEXT,
  nps_score INTEGER,
  
  -- AI Processing
  sentiment_score DECIMAL(5,2),
  keywords JSONB,
  
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- 13. EMPLOYEE REQUESTS (Solicitações)
CREATE TABLE public.hr_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  employee_id UUID REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  
  request_type TEXT NOT NULL, -- vacation, leave, document, advance, benefit_change, salary_review, remote_work, other
  subject TEXT NOT NULL,
  description TEXT,
  
  -- Attachments
  attachments JSONB,
  
  -- Workflow
  status TEXT DEFAULT 'pending', -- pending, in_review, approved, rejected, cancelled
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Approval Chain
  approval_chain JSONB,
  current_approver UUID REFERENCES auth.users(id),
  
  -- Response
  response TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES auth.users(id),
  
  -- AI
  ai_suggested_response TEXT,
  ai_category TEXT,
  
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. ORGANIZATIONAL STRUCTURE
CREATE TABLE public.hr_org_structure (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- company, division, department, team, unit
  parent_id UUID REFERENCES public.hr_org_structure(id),
  
  manager_id UUID REFERENCES public.hr_employees(id),
  cost_center TEXT,
  
  headcount_budget INTEGER,
  headcount_actual INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 15. ONBOARDING TASKS
CREATE TABLE public.hr_onboarding_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  employee_id UUID REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  admission_id UUID REFERENCES public.hr_admissions(id),
  
  task_name TEXT NOT NULL,
  task_description TEXT,
  task_type TEXT NOT NULL, -- document, training, meeting, setup, other
  
  due_date DATE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  
  -- Gamification
  points INTEGER DEFAULT 10,
  badge_id TEXT,
  
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, skipped
  order_index INTEGER DEFAULT 0,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hr_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_employee_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_vacations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_chatbot_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_turnover_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_climate_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_climate_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_org_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_onboarding_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view employees in their org"
ON public.hr_employees FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Authenticated users can manage employees in their org"
ON public.hr_employees FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can view their own payroll"
ON public.hr_payroll FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.hr_employees WHERE user_id = auth.uid()
  )
  OR organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "HR can manage payroll"
ON public.hr_payroll FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can view benefits"
ON public.hr_benefits FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can view their employee benefits"
ON public.hr_employee_benefits FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.hr_employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their vacations"
ON public.hr_vacations FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.hr_employees WHERE user_id = auth.uid()
  )
  OR organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can manage their vacations"
ON public.hr_vacations FOR ALL
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.hr_employees WHERE user_id = auth.uid()
  )
  OR organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can view their time tracking"
ON public.hr_time_tracking FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.hr_employees WHERE user_id = auth.uid()
  )
  OR organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can manage their time tracking"
ON public.hr_time_tracking FOR ALL
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.hr_employees WHERE user_id = auth.uid()
  )
  OR organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can view their performance reviews"
ON public.hr_performance_reviews FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.hr_employees WHERE user_id = auth.uid()
  )
  OR reviewer_id IN (
    SELECT id FROM public.hr_employees WHERE user_id = auth.uid()
  )
  OR organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "HR can manage admissions"
ON public.hr_admissions FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can view their chatbot logs"
ON public.hr_chatbot_logs FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.hr_employees WHERE user_id = auth.uid()
  )
  OR organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can insert chatbot logs"
ON public.hr_chatbot_logs FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "HR can view turnover predictions"
ON public.hr_turnover_predictions FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can view active surveys"
ON public.hr_climate_surveys FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can submit survey responses"
ON public.hr_climate_responses FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view and manage their requests"
ON public.hr_requests FOR ALL
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.hr_employees WHERE user_id = auth.uid()
  )
  OR organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can view org structure"
ON public.hr_org_structure FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can view their onboarding tasks"
ON public.hr_onboarding_tasks FOR ALL
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.hr_employees WHERE user_id = auth.uid()
  )
  OR organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Indexes
CREATE INDEX idx_hr_employees_org ON public.hr_employees(organization_id);
CREATE INDEX idx_hr_employees_status ON public.hr_employees(status);
CREATE INDEX idx_hr_employees_department ON public.hr_employees(department);
CREATE INDEX idx_hr_payroll_employee ON public.hr_payroll(employee_id);
CREATE INDEX idx_hr_payroll_period ON public.hr_payroll(reference_year, reference_month);
CREATE INDEX idx_hr_vacations_employee ON public.hr_vacations(employee_id);
CREATE INDEX idx_hr_vacations_dates ON public.hr_vacations(start_date, end_date);
CREATE INDEX idx_hr_time_tracking_date ON public.hr_time_tracking(employee_id, tracking_date);
CREATE INDEX idx_hr_turnover_risk ON public.hr_turnover_predictions(employee_id, risk_score DESC);
CREATE INDEX idx_hr_requests_status ON public.hr_requests(employee_id, status);

-- Triggers for updated_at
CREATE TRIGGER update_hr_employees_updated_at
  BEFORE UPDATE ON public.hr_employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hr_payroll_updated_at
  BEFORE UPDATE ON public.hr_payroll
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hr_benefits_updated_at
  BEFORE UPDATE ON public.hr_benefits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hr_vacations_updated_at
  BEFORE UPDATE ON public.hr_vacations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hr_time_tracking_updated_at
  BEFORE UPDATE ON public.hr_time_tracking
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hr_performance_reviews_updated_at
  BEFORE UPDATE ON public.hr_performance_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hr_admissions_updated_at
  BEFORE UPDATE ON public.hr_admissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hr_climate_surveys_updated_at
  BEFORE UPDATE ON public.hr_climate_surveys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hr_requests_updated_at
  BEFORE UPDATE ON public.hr_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hr_org_structure_updated_at
  BEFORE UPDATE ON public.hr_org_structure
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();