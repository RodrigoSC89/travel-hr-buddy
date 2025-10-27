# 🧪 PATCH 262 – Crew Wellbeing (Saúde e Apoio) Validation

## 📋 Objective
Validar o rastreamento de bem-estar e suporte psicológico da tripulação.

---

## ✅ Validation Checklist

### 1️⃣ Health Check-ins
- [ ] Check-ins de saúde são salvos corretamente?
- [ ] Dados incluem sono, humor, fadiga, estresse?
- [ ] Check-ins diários são incentivados?
- [ ] Histórico de check-ins é visível?
- [ ] Gráficos de tendências são precisos?

### 2️⃣ Automated Alerts
- [ ] Alertas são disparados em caso de risco?
- [ ] Threshold de alerta é configurável?
- [ ] Notificações chegam para usuário e supervisor?
- [ ] Alertas incluem severidade e recomendações?
- [ ] Falsos positivos são minimizados?

### 3️⃣ Psychological Support
- [ ] Sistema de apoio IA responde corretamente?
- [ ] Encaminhamento para suporte humano funciona?
- [ ] Conversas são privadas e confidenciais?
- [ ] Recursos de apoio são sugeridos apropriadamente?
- [ ] Emergências são priorizadas?

### 4️⃣ Privacy & Security
- [ ] Dados são protegidos por RLS?
- [ ] Apenas o usuário e autorizados veem dados sensíveis?
- [ ] Logs de acesso são mantidos?
- [ ] Dados anônimos são usados para estatísticas?
- [ ] LGPD/GDPR compliance está implementado?

### 5️⃣ Profile Integration
- [ ] Dados aparecem no perfil da tripulação?
- [ ] Status de bem-estar é visível para supervisores?
- [ ] Recomendações personalizadas são exibidas?
- [ ] Badges/conquistas de bem-estar funcionam?
- [ ] Histórico completo está acessível?

---

## 🗄️ Required Database Schema

### Table: `crew_wellbeing_checkins`
```sql
CREATE TABLE IF NOT EXISTS public.crew_wellbeing_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sleep_hours DECIMAL(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  fatigue_level INTEGER CHECK (fatigue_level >= 1 AND fatigue_level <= 5),
  physical_symptoms TEXT[],
  mental_health_notes TEXT,
  activities TEXT[],
  overall_wellbeing INTEGER CHECK (overall_wellbeing >= 1 AND overall_wellbeing <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, check_in_date)
);

CREATE INDEX idx_wellbeing_checkins_user ON public.crew_wellbeing_checkins(user_id);
CREATE INDEX idx_wellbeing_checkins_date ON public.crew_wellbeing_checkins(check_in_date);

ALTER TABLE public.crew_wellbeing_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own check-ins"
  ON public.crew_wellbeing_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Supervisors can view team check-ins"
  ON public.crew_wellbeing_checkins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crew_members cm
      WHERE cm.user_id = crew_wellbeing_checkins.user_id
      AND cm.supervisor_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own check-ins"
  ON public.crew_wellbeing_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-ins"
  ON public.crew_wellbeing_checkins FOR UPDATE
  USING (auth.uid() = user_id);
```

### Table: `wellbeing_alerts`
```sql
CREATE TABLE IF NOT EXISTS public.wellbeing_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT CHECK (alert_type IN ('low_sleep', 'high_stress', 'low_mood', 'fatigue', 'health_concern', 'emergency')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  recommendations TEXT[],
  triggered_by_checkin_id UUID REFERENCES public.crew_wellbeing_checkins(id),
  status TEXT CHECK (status IN ('active', 'acknowledged', 'resolved', 'escalated')) DEFAULT 'active',
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_wellbeing_alerts_user ON public.wellbeing_alerts(user_id);
CREATE INDEX idx_wellbeing_alerts_status ON public.wellbeing_alerts(status);
CREATE INDEX idx_wellbeing_alerts_severity ON public.wellbeing_alerts(severity);

ALTER TABLE public.wellbeing_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alerts"
  ON public.wellbeing_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Supervisors can view team alerts"
  ON public.wellbeing_alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crew_members cm
      WHERE cm.user_id = wellbeing_alerts.user_id
      AND cm.supervisor_id = auth.uid()
    )
  );

CREATE POLICY "System can create alerts"
  ON public.wellbeing_alerts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their alerts"
  ON public.wellbeing_alerts FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = acknowledged_by);
```

### Table: `support_sessions`
```sql
CREATE TABLE IF NOT EXISTS public.support_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT CHECK (session_type IN ('ai_chat', 'human_counselor', 'peer_support', 'emergency')),
  status TEXT CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')) DEFAULT 'scheduled',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  counselor_id UUID REFERENCES auth.users(id),
  session_notes TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  is_confidential BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_support_sessions_user ON public.support_sessions(user_id);
CREATE INDEX idx_support_sessions_status ON public.support_sessions(status);

ALTER TABLE public.support_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON public.support_sessions FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = counselor_id);

CREATE POLICY "Users can create sessions"
  ON public.support_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Table: `support_messages`
```sql
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.support_sessions(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  sender_type TEXT CHECK (sender_type IN ('user', 'ai', 'counselor', 'system')),
  message_content TEXT NOT NULL,
  is_encrypted BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_support_messages_session ON public.support_messages(session_id);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their sessions"
  ON public.support_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_sessions ss
      WHERE ss.id = support_messages.session_id
      AND (ss.user_id = auth.uid() OR ss.counselor_id = auth.uid())
    )
  );

CREATE POLICY "Users can create messages in their sessions"
  ON public.support_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_sessions ss
      WHERE ss.id = support_messages.session_id
      AND (ss.user_id = auth.uid() OR ss.counselor_id = auth.uid())
    )
  );
```

### Table: `wellbeing_resources`
```sql
CREATE TABLE IF NOT EXISTS public.wellbeing_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('mental_health', 'physical_health', 'stress_management', 'sleep', 'nutrition', 'emergency')),
  resource_type TEXT CHECK (resource_type IN ('article', 'video', 'exercise', 'meditation', 'hotline', 'contact')),
  content_url TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.wellbeing_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view resources"
  ON public.wellbeing_resources FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);
```

---

## 🔧 Implementation Status

### ✅ Implemented
- Crew Management module exists
- Basic profile structure

### ⚠️ Partial
- Health check-in UI may be incomplete
- Alert system may not be implemented
- Support chat may be basic

### ❌ Missing
- Wellbeing check-in system
- Automated alert triggers
- AI support chat integration
- Resource library
- Supervisor dashboard

---

## 🧪 Test Scenarios

### Scenario 1: Daily Check-in
1. Navigate to crew wellbeing module
2. Click "Daily Check-in"
3. Fill in: sleep hours (6), mood (3/5), stress (4/5), fatigue (4/5)
4. Add note: "Feeling tired after long shift"
5. Submit
6. **Expected**: 
   - Check-in saved to database
   - Trend chart updated
   - Alert triggered if thresholds exceeded

### Scenario 2: High Stress Alert
1. Complete check-in with stress level 5/5
2. **Expected**:
   - Alert created in `wellbeing_alerts`
   - Notification sent to user
   - Notification sent to supervisor
   - Recommended resources shown
   - Alert severity: "high"

### Scenario 3: Request Support
1. From wellbeing dashboard, click "Get Support"
2. Select "Talk to AI Counselor"
3. Start conversation
4. **Expected**:
   - Session created in `support_sessions`
   - AI responds with empathetic message
   - Messages saved to `support_messages`
   - Option to escalate to human counselor shown

### Scenario 4: Emergency Situation
1. Complete check-in indicating emergency
2. **Expected**:
   - Critical alert created immediately
   - Emergency contacts notified
   - Session type automatically set to "emergency"
   - Priority routing to available counselor

### Scenario 5: Privacy Validation
1. User A completes check-in
2. User B (not supervisor) tries to access User A's data
3. **Expected**: RLS blocks access, data not visible

### Scenario 6: Supervisor View
1. Login as supervisor
2. Navigate to team wellbeing dashboard
3. **Expected**:
   - See anonymized team statistics
   - See active alerts for team members
   - See trends and patterns
   - Cannot see detailed private notes

---

## 📊 Wellbeing Metrics

| Metric | Range | Alert Threshold | Status |
|--------|-------|----------------|--------|
| Sleep Hours | 0-24 | <5 hours | ⚠️ |
| Sleep Quality | 1-5 | <2 | ⚠️ |
| Mood Score | 1-5 | <2 for 3+ days | ⚠️ |
| Stress Level | 1-5 | >4 for 2+ days | ⚠️ |
| Fatigue Level | 1-5 | >4 | ⚠️ |
| Overall Wellbeing | 1-10 | <4 | ⚠️ |

---

## 🚀 Next Steps

1. **Check-in System**
   - Create check-in UI components
   - Implement form validation
   - Add trend visualization
   - Support daily reminders

2. **Alert Engine**
   - Create threshold monitoring
   - Implement alert triggers
   - Add notification system
   - Support escalation rules

3. **Support System**
   - Integrate AI counselor (OpenAI/similar)
   - Create chat interface
   - Add session scheduling
   - Implement emergency routing

4. **Privacy & Security**
   - Encrypt sensitive data
   - Implement access logs
   - Add data anonymization
   - Ensure compliance

5. **Testing**
   - Test all check-in scenarios
   - Validate alert triggers
   - Test privacy controls
   - Load test support system

---

**Status**: 🔴 Not Implemented  
**Priority**: 🔴 Critical (crew safety)  
**Estimated Completion**: 10-14 hours
