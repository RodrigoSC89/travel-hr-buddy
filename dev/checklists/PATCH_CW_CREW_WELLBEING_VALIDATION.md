# 💚 Crew Wellbeing – Validation Checklist

**Module:** `crew-wellbeing`  
**Priority:** High (Tier 2)  
**Status:** ⚠️ Partially Implemented  
**Last Updated:** 2025-01-27

---

## ✅ Validation Checklist

### 1. Daily Health Records Active and Persisted
- [ ] **Registro diário de saúde da tripulação ativo e persistido**
  - UI de registro diário funcional (mobile-friendly)
  - Campos: bem-estar mental, físico, fadiga, stress
  - Dados salvos em `crew_health_records`
  - Histórico acessível e visualizável

### 2. AI Suggests Preventive Actions Based on Health Data
- [ ] **IA sugere ações preventivas com base nos dados de saúde**
  - Algoritmo de análise de padrões implementado
  - Detecção de tendências negativas (fadiga, stress)
  - Sugestões personalizadas geradas
  - Alertas enviados ao tripulante e gestor

### 3. Mobile-Responsive UI for Wellbeing
- [ ] **UI acessível e responsiva em mobile para bem-estar**
  - Design mobile-first
  - Formulários otimizados para touch
  - Acesso offline (PWA)
  - Gráficos de histórico legíveis em mobile

### 4. Database Tables Created and Operational
- [ ] **Tabelas `crew_health_records`, `wellbeing_alerts` criadas e operacionais**
  - Schema completo implementado
  - RLS policies configuradas
  - Integração com `crew_members`
  - Dados reais (não mocks)

---

## 📊 Database Schema Requirements

### Tables Needed:
```sql
-- Crew Health Records
CREATE TABLE crew_health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  physical_health_score INTEGER CHECK (physical_health_score BETWEEN 1 AND 10),
  mental_health_score INTEGER CHECK (mental_health_score BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  fatigue_level INTEGER CHECK (fatigue_level BETWEEN 1 AND 10),
  sleep_hours DECIMAL(4,2),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  mood TEXT, -- 'excellent', 'good', 'neutral', 'poor', 'critical'
  symptoms TEXT[], -- array of symptoms
  medications TEXT[],
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id),
  location TEXT, -- 'onshore', 'offshore', 'vessel'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(crew_member_id, record_date)
);

-- Wellbeing Alerts
CREATE TABLE wellbeing_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'fatigue', 'stress', 'health_decline', 'emergency'
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  ai_generated BOOLEAN DEFAULT false,
  ai_rationale TEXT,
  recommended_actions TEXT[],
  status TEXT DEFAULT 'open', -- 'open', 'acknowledged', 'resolved', 'dismissed'
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  triggered_by_data JSONB, -- reference to health records that triggered alert
  notified_users UUID[], -- array of user IDs notified
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Wellbeing Metrics (aggregated data)
CREATE TABLE crew_wellbeing_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  avg_physical_health DECIMAL(4,2),
  avg_mental_health DECIMAL(4,2),
  avg_stress_level DECIMAL(4,2),
  avg_fatigue_level DECIMAL(4,2),
  avg_sleep_hours DECIMAL(4,2),
  total_alerts INTEGER DEFAULT 0,
  critical_alerts INTEGER DEFAULT 0,
  overall_wellbeing_score DECIMAL(5,2), -- calculated composite score
  trend TEXT, -- 'improving', 'stable', 'declining'
  risk_level TEXT DEFAULT 'low', -- 'low', 'medium', 'high'
  calculated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(crew_member_id, period_start, period_end)
);

-- Wellbeing Recommendations (AI-generated)
CREATE TABLE wellbeing_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL, -- 'rest', 'exercise', 'counseling', 'medical', 'schedule_change'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  reasoning TEXT, -- AI explanation
  suggested_actions JSONB, -- structured action plan
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'completed'
  due_date DATE,
  completed_at TIMESTAMPTZ,
  feedback TEXT, -- crew member feedback
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_health_records_crew_member ON crew_health_records(crew_member_id);
CREATE INDEX idx_health_records_date ON crew_health_records(record_date DESC);
CREATE INDEX idx_wellbeing_alerts_crew_member ON wellbeing_alerts(crew_member_id);
CREATE INDEX idx_wellbeing_alerts_status ON wellbeing_alerts(status);
CREATE INDEX idx_wellbeing_alerts_severity ON wellbeing_alerts(severity);

-- RLS Policies
ALTER TABLE crew_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellbeing_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_wellbeing_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellbeing_recommendations ENABLE ROW LEVEL SECURITY;

-- Crew members can view their own health records
CREATE POLICY "Crew can view own health records"
  ON crew_health_records FOR SELECT
  USING (
    crew_member_id IN (
      SELECT id FROM crew_members WHERE user_id = auth.uid()
    )
  );

-- HR and managers can view all health records
CREATE POLICY "HR and managers can view all health records"
  ON crew_health_records FOR SELECT
  USING (
    has_permission('crew_management', 'read')
  );

-- Crew members can insert their own records
CREATE POLICY "Crew can insert own health records"
  ON crew_health_records FOR INSERT
  WITH CHECK (
    crew_member_id IN (
      SELECT id FROM crew_members WHERE user_id = auth.uid()
    )
  );

-- Similar policies for other tables...
```

---

## 🔧 Implementation Status

### ✅ Completed
- Basic wellbeing dashboard UI (crew-wellbeing-dashboard.tsx)
- Health record form structure
- Display of health metrics

### 🚧 In Progress
- Database schema implementation
- AI recommendation engine
- Mobile optimization
- Historical trends visualization

### ❌ Not Started
- Offline data entry (PWA)
- Integration with wearable devices
- Emergency alert system
- Anonymous mental health surveys
- Counseling resource directory

---

## 🎯 Next Steps

1. **Immediate (Sprint 1)**
   - Create all database tables
   - Implement daily health record form (mobile-first)
   - Build AI analysis engine for pattern detection

2. **Short-term (Sprint 2)**
   - Develop alert generation system
   - Create manager dashboard for wellbeing overview
   - Implement notification integration

3. **Medium-term (Sprint 3)**
   - Add wearable device integration (Fitbit/Apple Health)
   - Build anonymous survey system
   - Create wellbeing resource library
   - Implement predictive analytics

---

## 🧪 Testing Criteria

- [ ] Crew member submits daily health record on mobile
- [ ] Health score calculated correctly
- [ ] AI detects declining mental health trend
- [ ] Alert generated and sent to manager
- [ ] Crew views historical wellbeing trends
- [ ] Manager views team wellbeing dashboard
- [ ] Recommendations appear for at-risk crew
- [ ] Offline mode works (PWA)
- [ ] Data syncs when connection restored

---

## 📦 Dependencies

- **Modules:** Crew Management, Notifications Center
- **Database:** `crew_members`, `auth.users`
- **External Services:** 
  - AI/ML service (optional - for advanced analytics)
  - Wearable APIs (future enhancement)
- **Mobile:** PWA capabilities, offline storage

---

## 🤖 AI Logic Examples

### Pattern Detection:
```typescript
// Detect fatigue trend
const analyzeFatigueTrend = (records: HealthRecord[]) => {
  const recentRecords = records.slice(-7); // last 7 days
  const avgFatigue = recentRecords.reduce((sum, r) => sum + r.fatigue_level, 0) / 7;
  
  if (avgFatigue >= 7) {
    return {
      alert: true,
      severity: 'high',
      message: 'High fatigue levels detected over 7 days',
      recommendations: [
        'Schedule rest period',
        'Reduce night shifts',
        'Consult medical team'
      ]
    };
  }
};

// Stress pattern
const detectStressPattern = (records: HealthRecord[]) => {
  const stressIncreasing = records.every((r, i, arr) => 
    i === 0 || r.stress_level >= arr[i-1].stress_level
  );
  
  if (stressIncreasing && records.length >= 3) {
    return {
      alert: true,
      type: 'stress_escalation',
      recommendation: 'Offer mental health resources'
    };
  }
};
```

---

## 🚨 Known Issues

1. No data anonymization for aggregate reports
2. UI not fully mobile-optimized
3. No integration with external health monitoring devices
4. Alert threshold logic is hardcoded
5. No emergency contact system for critical alerts

---

## 🎨 UI Components Needed

- `DailyHealthForm.tsx` - mobile-optimized health entry
- `WellbeingTrendsChart.tsx` - historical visualization
- `AlertsPanel.tsx` - active alerts and recommendations
- `ManagerWellbeingDashboard.tsx` - team overview
- `ResourceLibrary.tsx` - mental health resources

---

**Validation Owner:** HR / Medical Team  
**Target Completion:** Week 6 (Tier 2 Priority)
