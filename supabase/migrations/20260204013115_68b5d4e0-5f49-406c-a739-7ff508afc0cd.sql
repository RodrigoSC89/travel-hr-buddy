-- ============================================
-- ENFERMARIA DIGITAL - Schema Completo
-- ============================================

-- Tabela de dispensação/retirada de medicamentos
CREATE TABLE IF NOT EXISTS public.medication_dispensations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    supply_id UUID REFERENCES public.medical_supplies(id) ON DELETE SET NULL,
    crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE SET NULL,
    medical_record_id UUID REFERENCES public.medical_records(id) ON DELETE SET NULL,
    medication_name TEXT NOT NULL,
    quantity_dispensed INTEGER NOT NULL,
    unit TEXT NOT NULL DEFAULT 'unidades',
    batch_number TEXT,
    reason TEXT,
    dispensed_by UUID REFERENCES auth.users(id),
    dispensed_by_name TEXT,
    dispensed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    organization_id UUID REFERENCES public.organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de atendimentos médicos expandida
CREATE TABLE IF NOT EXISTS public.medical_consultations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE SET NULL,
    crew_member_name TEXT NOT NULL,
    consultation_type TEXT NOT NULL DEFAULT 'consultation', -- consultation, emergency, routine, telemedicine, first_aid
    chief_complaint TEXT NOT NULL,
    symptoms JSONB DEFAULT '[]',
    vital_signs JSONB DEFAULT '{}', -- blood_pressure, heart_rate, temperature, oxygen_saturation, respiratory_rate
    diagnosis TEXT,
    treatment TEXT,
    prescribed_medications JSONB DEFAULT '[]', -- array of {name, dosage, frequency, duration}
    ai_suggestions JSONB DEFAULT '[]',
    follow_up_date DATE,
    status TEXT DEFAULT 'pending', -- pending, in_progress, resolved, referred, monitoring
    severity TEXT DEFAULT 'low', -- low, medium, high, critical
    attending_officer TEXT,
    attending_officer_id UUID REFERENCES auth.users(id),
    telemedicine_session_id TEXT,
    attachments JSONB DEFAULT '[]',
    notes TEXT,
    vessel_id UUID REFERENCES public.vessels(id),
    organization_id UUID REFERENCES public.organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar colunas extras em medical_supplies se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_supplies' AND column_name = 'supplier') THEN
        ALTER TABLE public.medical_supplies ADD COLUMN supplier TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_supplies' AND column_name = 'purchase_date') THEN
        ALTER TABLE public.medical_supplies ADD COLUMN purchase_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_supplies' AND column_name = 'cost_per_unit') THEN
        ALTER TABLE public.medical_supplies ADD COLUMN cost_per_unit DECIMAL(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_supplies' AND column_name = 'total_cost') THEN
        ALTER TABLE public.medical_supplies ADD COLUMN total_cost DECIMAL(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_supplies' AND column_name = 'storage_conditions') THEN
        ALTER TABLE public.medical_supplies ADD COLUMN storage_conditions TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_supplies' AND column_name = 'controlled_substance') THEN
        ALTER TABLE public.medical_supplies ADD COLUMN controlled_substance BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_supplies' AND column_name = 'requires_prescription') THEN
        ALTER TABLE public.medical_supplies ADD COLUMN requires_prescription BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_supplies' AND column_name = 'vessel_id') THEN
        ALTER TABLE public.medical_supplies ADD COLUMN vessel_id UUID REFERENCES public.vessels(id);
    END IF;
END $$;

-- ============================================
-- GESTÃO DE RESÍDUOS - Oil Record Book & Garbage Record Book
-- ============================================

-- Oil Record Book - MARPOL Anexo I
CREATE TABLE IF NOT EXISTS public.oil_record_book (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vessel_id UUID REFERENCES public.vessels(id),
    vessel_name TEXT NOT NULL,
    entry_date DATE NOT NULL,
    entry_time TIME,
    operation_code TEXT NOT NULL, -- A, B, C, D, E, F, G, H, I
    operation_description TEXT NOT NULL,
    tank_involved TEXT,
    quantity DECIMAL(10,3),
    unit TEXT DEFAULT 'm³',
    position_lat TEXT,
    position_lon TEXT,
    ppm_reading DECIMAL(10,2), -- For OWS operations
    officer_name TEXT NOT NULL,
    officer_rank TEXT,
    master_signature BOOLEAN DEFAULT FALSE,
    master_name TEXT,
    remarks TEXT,
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    attachments JSONB DEFAULT '[]',
    organization_id UUID REFERENCES public.organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Garbage Record Book - MARPOL Anexo V
CREATE TABLE IF NOT EXISTS public.garbage_record_book (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vessel_id UUID REFERENCES public.vessels(id),
    vessel_name TEXT NOT NULL,
    entry_date DATE NOT NULL,
    entry_time TIME,
    category_code TEXT NOT NULL, -- A through I
    category_description TEXT NOT NULL,
    estimated_quantity DECIMAL(10,3) NOT NULL,
    unit TEXT DEFAULT 'kg',
    disposal_method TEXT NOT NULL, -- discharged_to_sea, discharged_to_port, incinerated
    start_position_lat TEXT,
    start_position_lon TEXT,
    end_position_lat TEXT,
    end_position_lon TEXT,
    port_facility TEXT,
    reception_certificate TEXT,
    officer_name TEXT NOT NULL,
    officer_rank TEXT,
    master_signature BOOLEAN DEFAULT FALSE,
    master_name TEXT,
    remarks TEXT,
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    special_area BOOLEAN DEFAULT FALSE, -- Special areas have stricter rules
    organization_id UUID REFERENCES public.organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Tanques de resíduos com sensores
CREATE TABLE IF NOT EXISTS public.waste_tanks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vessel_id UUID REFERENCES public.vessels(id),
    vessel_name TEXT NOT NULL,
    tank_name TEXT NOT NULL,
    tank_type TEXT NOT NULL, -- oily_water, sewage, bilge, sludge, garbage
    capacity DECIMAL(10,2) NOT NULL,
    current_level DECIMAL(10,2) DEFAULT 0,
    unit TEXT DEFAULT 'L',
    level_percentage DECIMAL(5,2) GENERATED ALWAYS AS (CASE WHEN capacity > 0 THEN (current_level / capacity) * 100 ELSE 0 END) STORED,
    status TEXT DEFAULT 'ok', -- ok, warning, critical
    sensor_id TEXT,
    last_reading_at TIMESTAMP WITH TIME ZONE,
    last_discharge_date DATE,
    last_discharge_quantity DECIMAL(10,2),
    last_discharge_location TEXT,
    alert_threshold_percent INTEGER DEFAULT 80,
    organization_id UUID REFERENCES public.organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE public.medication_dispensations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oil_record_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garbage_record_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_tanks ENABLE ROW LEVEL SECURITY;

-- Medication Dispensations Policies
CREATE POLICY "Users can view medication dispensations" ON public.medication_dispensations FOR SELECT USING (true);
CREATE POLICY "Users can create medication dispensations" ON public.medication_dispensations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update medication dispensations" ON public.medication_dispensations FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Medical Consultations Policies
CREATE POLICY "Users can view medical consultations" ON public.medical_consultations FOR SELECT USING (true);
CREATE POLICY "Users can create medical consultations" ON public.medical_consultations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update medical consultations" ON public.medical_consultations FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Oil Record Book Policies
CREATE POLICY "Users can view oil records" ON public.oil_record_book FOR SELECT USING (true);
CREATE POLICY "Users can create oil records" ON public.oil_record_book FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update oil records" ON public.oil_record_book FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Garbage Record Book Policies
CREATE POLICY "Users can view garbage records" ON public.garbage_record_book FOR SELECT USING (true);
CREATE POLICY "Users can create garbage records" ON public.garbage_record_book FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update garbage records" ON public.garbage_record_book FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Waste Tanks Policies
CREATE POLICY "Users can view waste tanks" ON public.waste_tanks FOR SELECT USING (true);
CREATE POLICY "Users can create waste tanks" ON public.waste_tanks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update waste tanks" ON public.waste_tanks FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ============================================
-- Indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_medication_dispensations_supply_id ON public.medication_dispensations(supply_id);
CREATE INDEX IF NOT EXISTS idx_medication_dispensations_crew_member_id ON public.medication_dispensations(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_medication_dispensations_dispensed_at ON public.medication_dispensations(dispensed_at);

CREATE INDEX IF NOT EXISTS idx_medical_consultations_crew_member_id ON public.medical_consultations(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_medical_consultations_status ON public.medical_consultations(status);
CREATE INDEX IF NOT EXISTS idx_medical_consultations_created_at ON public.medical_consultations(created_at);

CREATE INDEX IF NOT EXISTS idx_oil_record_book_vessel_id ON public.oil_record_book(vessel_id);
CREATE INDEX IF NOT EXISTS idx_oil_record_book_entry_date ON public.oil_record_book(entry_date);

CREATE INDEX IF NOT EXISTS idx_garbage_record_book_vessel_id ON public.garbage_record_book(vessel_id);
CREATE INDEX IF NOT EXISTS idx_garbage_record_book_entry_date ON public.garbage_record_book(entry_date);

CREATE INDEX IF NOT EXISTS idx_waste_tanks_vessel_id ON public.waste_tanks(vessel_id);
CREATE INDEX IF NOT EXISTS idx_waste_tanks_status ON public.waste_tanks(status);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_medical_consultations_updated_at ON public.medical_consultations;
CREATE TRIGGER update_medical_consultations_updated_at
    BEFORE UPDATE ON public.medical_consultations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_waste_tanks_updated_at ON public.waste_tanks;
CREATE TRIGGER update_waste_tanks_updated_at
    BEFORE UPDATE ON public.waste_tanks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();