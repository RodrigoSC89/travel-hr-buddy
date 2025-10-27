# 🔵 PATCH 250 – Trust Compliance com ML + Agentes Reais

**Data:** 2025-10-27  
**Status:** PENDENTE  
**Prioridade:** AVANÇADA 🔵  
**Módulo:** Trust & Compliance / AI Agents

---

## 📋 Objetivo

Ativar lógica real para agentes e trust compliance, substituindo trust score simulado por modelo ML básico, criar agentes reais funcionais e integrá-los via Agent Swarm Bridge.

---

## 🎯 Resultados Esperados

- ✅ Trust score calculado por modelo ML
- ✅ Agente Real 1: Route Analyzer funcional
- ✅ Agent Swarm Bridge implementado
- ✅ Communication protocol entre agentes
- ✅ Cenários de teste com rotas reais
- ✅ Dashboard de trust metrics
- ✅ Compliance rules engine
- ✅ Audit trail completo

---

## 🗄️ Estrutura de Dados

```sql
-- trust_scores (ML-generated)
CREATE TABLE trust_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('user', 'vessel', 'route', 'agent')),
  entity_id UUID NOT NULL,
  score DECIMAL(5,4) NOT NULL CHECK (score >= 0 AND score <= 1),
  confidence DECIMAL(5,4) NOT NULL,
  factors JSONB NOT NULL,
  model_version TEXT NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_trust_scores_entity ON trust_scores(entity_type, entity_id);
CREATE INDEX idx_trust_scores_calculated ON trust_scores(calculated_at DESC);

-- agents (AI agents registry)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('analyzer', 'optimizer', 'monitor', 'executor')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  capabilities JSONB NOT NULL,
  trust_score DECIMAL(5,4),
  version TEXT NOT NULL,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- agent_communications (message bus)
CREATE TABLE agent_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_agent_id UUID REFERENCES agents(id),
  to_agent_id UUID REFERENCES agents(id),
  message_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'received', 'processed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- compliance_rules
CREATE TABLE compliance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('validation', 'threshold', 'pattern', 'ml')),
  rule_definition JSONB NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- compliance_violations
CREATE TABLE compliance_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES compliance_rules(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  violation_details JSONB NOT NULL,
  severity TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Insert default agents
INSERT INTO agents (name, type, capabilities, version) VALUES
('route_analyzer', 'analyzer', '{"skills": ["route_optimization", "risk_assessment", "weather_analysis"], "languages": ["en", "pt"]}', '1.0.0'),
('fuel_optimizer', 'optimizer', '{"skills": ["fuel_calculation", "route_optimization"], "languages": ["en"]}', '1.0.0'),
('safety_monitor', 'monitor', '{"skills": ["safety_checks", "compliance_monitoring"], "languages": ["en", "pt"]}', '1.0.0');
```

---

## 🤖 ML Trust Score Model

### Simple ML Model Implementation

**Arquivo:** `src/services/ml/trustScoreModel.ts`

```typescript
interface TrustFactors {
  historicalPerformance: number // 0-1
  complianceRecord: number // 0-1
  incidentRate: number // 0-1 (inverted)
  certificationStatus: number // 0-1
  peerRatings: number // 0-1
}

interface TrustScore {
  score: number
  confidence: number
  factors: TrustFactors
  breakdown: Record<string, number>
}

export class TrustScoreModel {
  private weights = {
    historicalPerformance: 0.25,
    complianceRecord: 0.30,
    incidentRate: 0.20,
    certificationStatus: 0.15,
    peerRatings: 0.10
  }
  
  private modelVersion = '1.0.0'
  
  async calculateTrustScore(
    entityType: string,
    entityId: string
  ): Promise<TrustScore> {
    // Gather factors from database
    const factors = await this.gatherFactors(entityType, entityId)
    
    // Calculate weighted score
    const score = this.calculateWeightedScore(factors)
    
    // Calculate confidence based on data completeness
    const confidence = this.calculateConfidence(factors)
    
    // Generate breakdown
    const breakdown = this.generateBreakdown(factors)
    
    // Save to database
    await this.saveTrustScore(entityType, entityId, score, confidence, factors)
    
    return {
      score,
      confidence,
      factors,
      breakdown
    }
  }
  
  private async gatherFactors(
    entityType: string,
    entityId: string
  ): Promise<TrustFactors> {
    switch (entityType) {
      case 'user':
        return this.gatherUserFactors(entityId)
      case 'vessel':
        return this.gatherVesselFactors(entityId)
      case 'route':
        return this.gatherRouteFactors(entityId)
      default:
        throw new Error(`Unknown entity type: ${entityType}`)
    }
  }
  
  private async gatherVesselFactors(vesselId: string): Promise<TrustFactors> {
    // Historical performance: maintenance completion rate
    const { data: maintenance } = await supabase
      .from('maintenance_records')
      .select('status')
      .eq('vessel_id', vesselId)
    
    const completedMaintenance = maintenance?.filter(m => m.status === 'completed').length || 0
    const totalMaintenance = maintenance?.length || 1
    const historicalPerformance = completedMaintenance / totalMaintenance
    
    // Compliance record: violations
    const { data: violations } = await supabase
      .from('compliance_violations')
      .select('*')
      .eq('entity_type', 'vessel')
      .eq('entity_id', vesselId)
      .eq('status', 'open')
    
    const complianceRecord = Math.max(0, 1 - (violations?.length || 0) * 0.1)
    
    // Incident rate
    const { data: incidents } = await supabase
      .from('incidents')
      .select('*')
      .eq('vessel_id', vesselId)
      .gte('created_at', subMonths(new Date(), 6).toISOString())
    
    const incidentRate = Math.max(0, 1 - (incidents?.length || 0) * 0.2)
    
    // Certification status
    const { data: certifications } = await supabase
      .from('vessel_certifications')
      .select('*')
      .eq('vessel_id', vesselId)
      .gte('expires_at', new Date().toISOString())
    
    const requiredCerts = 5
    const certificationStatus = Math.min(1, (certifications?.length || 0) / requiredCerts)
    
    // Peer ratings
    const { data: ratings } = await supabase
      .from('vessel_ratings')
      .select('rating')
      .eq('vessel_id', vesselId)
    
    const avgRating = ratings?.length 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length / 5
      : 0.5
    
    return {
      historicalPerformance,
      complianceRecord,
      incidentRate,
      certificationStatus,
      peerRatings: avgRating
    }
  }
  
  private calculateWeightedScore(factors: TrustFactors): number {
    let score = 0
    
    for (const [factor, value] of Object.entries(factors)) {
      const weight = this.weights[factor as keyof typeof this.weights]
      score += value * weight
    }
    
    return Math.max(0, Math.min(1, score))
  }
  
  private calculateConfidence(factors: TrustFactors): number {
    // Confidence based on how many factors are non-zero
    const nonZeroFactors = Object.values(factors).filter(v => v > 0).length
    const totalFactors = Object.keys(factors).length
    
    return nonZeroFactors / totalFactors
  }
  
  private generateBreakdown(factors: TrustFactors): Record<string, number> {
    const breakdown: Record<string, number> = {}
    
    for (const [factor, value] of Object.entries(factors)) {
      const weight = this.weights[factor as keyof typeof this.weights]
      breakdown[factor] = value * weight
    }
    
    return breakdown
  }
  
  private async saveTrustScore(
    entityType: string,
    entityId: string,
    score: number,
    confidence: number,
    factors: TrustFactors
  ) {
    await supabase.from('trust_scores').insert({
      entity_type: entityType,
      entity_id: entityId,
      score,
      confidence,
      factors,
      model_version: this.modelVersion
    })
  }
}
```

---

## 🤖 Agent 1: Route Analyzer

**Arquivo:** `src/services/agents/RouteAnalyzer.ts`

```typescript
export class RouteAnalyzerAgent {
  private agentId: string
  private trustModel: TrustScoreModel
  
  constructor() {
    this.trustModel = new TrustScoreModel()
  }
  
  async initialize() {
    // Register agent
    const { data } = await supabase
      .from('agents')
      .select('id')
      .eq('name', 'route_analyzer')
      .single()
    
    this.agentId = data.id
    await this.updateStatus('active')
  }
  
  async analyzeRoute(routeId: string): Promise<RouteAnalysis> {
    console.log(`[RouteAnalyzer] Analyzing route ${routeId}`)
    
    // Get route data
    const { data: route } = await supabase
      .from('routes')
      .select(`
        *,
        waypoints(*),
        vessel:vessels(*)
      `)
      .eq('id', routeId)
      .single()
    
    if (!route) throw new Error('Route not found')
    
    // Analyze different aspects
    const weatherRisk = await this.analyzeWeatherRisk(route)
    const fuelEfficiency = await this.analyzeFuelEfficiency(route)
    const safetyScore = await this.analyzeSafety(route)
    const complianceCheck = await this.checkCompliance(route)
    
    // Calculate trust score for route
    const trustScore = await this.trustModel.calculateTrustScore('route', routeId)
    
    // Generate recommendations
    const recommendations = this.generateRecommendations({
      weatherRisk,
      fuelEfficiency,
      safetyScore,
      complianceCheck,
      trustScore
    })
    
    const analysis: RouteAnalysis = {
      routeId,
      weatherRisk,
      fuelEfficiency,
      safetyScore,
      complianceCheck,
      trustScore: trustScore.score,
      recommendations,
      analyzedAt: new Date().toISOString()
    }
    
    // Send to other agents if needed
    if (weatherRisk.level === 'high') {
      await this.notifyAgent('safety_monitor', {
        type: 'high_weather_risk',
        routeId,
        weatherRisk
      })
    }
    
    // Log analysis
    await this.logAnalysis(analysis)
    
    return analysis
  }
  
  private async analyzeWeatherRisk(route: any): Promise<WeatherRiskAnalysis> {
    // Get weather forecasts for waypoints
    const weatherData = await Promise.all(
      route.waypoints.map((wp: any) => 
        weatherService.getForecast(wp.latitude, wp.longitude)
      )
    )
    
    // Analyze risks
    const risks = weatherData.map(w => ({
      windSpeed: w.windSpeed,
      waveHeight: w.waveHeight,
      visibility: w.visibility,
      riskLevel: this.calculateWeatherRiskLevel(w)
    }))
    
    const maxRisk = Math.max(...risks.map(r => r.riskLevel))
    
    return {
      level: maxRisk > 0.7 ? 'high' : maxRisk > 0.4 ? 'medium' : 'low',
      details: risks,
      recommendation: maxRisk > 0.7 ? 'Consider alternative route' : 'Route acceptable'
    }
  }
  
  private async analyzeFuelEfficiency(route: any): Promise<number> {
    const distance = this.calculateTotalDistance(route.waypoints)
    const vesselFuelRate = route.vessel.fuel_consumption_rate || 50 // L/hour
    const averageSpeed = route.vessel.cruise_speed || 12 // knots
    
    const estimatedTime = distance / averageSpeed
    const estimatedFuel = estimatedTime * vesselFuelRate
    
    // Calculate efficiency score (0-1, higher is better)
    const optimalFuel = distance * 30 // Optimal consumption
    const efficiency = Math.max(0, Math.min(1, optimalFuel / estimatedFuel))
    
    return efficiency
  }
  
  private async analyzeSafety(route: any): Promise<number> {
    // Check for known hazards along route
    const hazards = await this.checkRouteHazards(route.waypoints)
    
    // Check vessel safety certifications
    const { data: certs } = await supabase
      .from('vessel_certifications')
      .select('*')
      .eq('vessel_id', route.vessel_id)
      .gte('expires_at', new Date().toISOString())
    
    const hazardScore = Math.max(0, 1 - hazards.length * 0.1)
    const certScore = Math.min(1, (certs?.length || 0) / 5)
    
    return (hazardScore + certScore) / 2
  }
  
  private async checkCompliance(route: any): Promise<ComplianceCheck> {
    const { data: rules } = await supabase
      .from('compliance_rules')
      .select('*')
      .eq('is_active', true)
    
    const violations: any[] = []
    
    for (const rule of rules || []) {
      const violation = await this.checkRule(rule, route)
      if (violation) {
        violations.push(violation)
        
        // Log violation
        await supabase.from('compliance_violations').insert({
          rule_id: rule.id,
          entity_type: 'route',
          entity_id: route.id,
          violation_details: violation,
          severity: rule.severity
        })
      }
    }
    
    return {
      compliant: violations.length === 0,
      violations,
      score: Math.max(0, 1 - violations.length * 0.2)
    }
  }
  
  private generateRecommendations(analysis: any): string[] {
    const recs: string[] = []
    
    if (analysis.weatherRisk.level === 'high') {
      recs.push('High weather risk detected. Consider delaying departure.')
    }
    
    if (analysis.fuelEfficiency < 0.6) {
      recs.push('Route is not fuel-efficient. Optimize waypoints.')
    }
    
    if (analysis.safetyScore < 0.7) {
      recs.push('Safety concerns identified. Review vessel certifications.')
    }
    
    if (!analysis.complianceCheck.compliant) {
      recs.push(`${analysis.complianceCheck.violations.length} compliance violations found.`)
    }
    
    if (analysis.trustScore < 0.5) {
      recs.push('Low trust score. Manual review recommended.')
    }
    
    return recs
  }
  
  private async notifyAgent(agentName: string, payload: any) {
    const { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('name', agentName)
      .single()
    
    if (agent) {
      await supabase.from('agent_communications').insert({
        from_agent_id: this.agentId,
        to_agent_id: agent.id,
        message_type: payload.type,
        payload
      })
    }
  }
  
  private async updateStatus(status: string) {
    await supabase
      .from('agents')
      .update({ 
        status,
        last_active_at: new Date().toISOString()
      })
      .eq('id', this.agentId)
  }
  
  private async logAnalysis(analysis: RouteAnalysis) {
    await supabase.from('agent_actions').insert({
      agent_id: this.agentId,
      action_type: 'route_analysis',
      entity_type: 'route',
      entity_id: analysis.routeId,
      result: analysis
    })
  }
}
```

---

## 🌉 Agent Swarm Bridge

**Arquivo:** `src/services/agents/AgentSwarmBridge.ts`

```typescript
export class AgentSwarmBridge {
  private agents: Map<string, any> = new Map()
  private messageQueue: any[] = []
  
  async initialize() {
    // Load all active agents
    const { data: agents } = await supabase
      .from('agents')
      .select('*')
      .eq('status', 'active')
    
    // Initialize agent instances
    for (const agentData of agents || []) {
      const agent = await this.createAgentInstance(agentData)
      this.agents.set(agentData.name, agent)
    }
    
    // Start message processing
    this.startMessageProcessing()
  }
  
  private async createAgentInstance(agentData: any) {
    switch (agentData.name) {
      case 'route_analyzer':
        return new RouteAnalyzerAgent()
      case 'fuel_optimizer':
        return new FuelOptimizerAgent()
      case 'safety_monitor':
        return new SafetyMonitorAgent()
      default:
        throw new Error(`Unknown agent type: ${agentData.name}`)
    }
  }
  
  private startMessageProcessing() {
    // Poll for new messages every 5 seconds
    setInterval(async () => {
      const { data: messages } = await supabase
        .from('agent_communications')
        .select(`
          *,
          from_agent:agents!from_agent_id(name),
          to_agent:agents!to_agent_id(name)
        `)
        .eq('status', 'sent')
        .order('created_at', { ascending: true })
        .limit(10)
      
      for (const message of messages || []) {
        await this.processMessage(message)
      }
    }, 5000)
  }
  
  private async processMessage(message: any) {
    const targetAgent = this.agents.get(message.to_agent.name)
    
    if (!targetAgent) {
      console.error(`Agent not found: ${message.to_agent.name}`)
      return
    }
    
    try {
      // Route message to appropriate handler
      await targetAgent.handleMessage(message.message_type, message.payload)
      
      // Mark as processed
      await supabase
        .from('agent_communications')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString()
        })
        .eq('id', message.id)
    } catch (error) {
      console.error('Failed to process message:', error)
      
      await supabase
        .from('agent_communications')
        .update({ status: 'failed' })
        .eq('id', message.id)
    }
  }
  
  async sendMessage(fromAgent: string, toAgent: string, messageType: string, payload: any) {
    const { data: from } = await supabase
      .from('agents')
      .select('id')
      .eq('name', fromAgent)
      .single()
    
    const { data: to } = await supabase
      .from('agents')
      .select('id')
      .eq('name', toAgent)
      .single()
    
    if (!from || !to) {
      throw new Error('Agent not found')
    }
    
    await supabase.from('agent_communications').insert({
      from_agent_id: from.id,
      to_agent_id: to.id,
      message_type: messageType,
      payload
    })
  }
}

// Global bridge instance
export const agentBridge = new AgentSwarmBridge()
```

---

## ✅ Checklist de Validação

### Trust Score ML
- [ ] Model implementado
- [ ] Factors calculados corretamente
- [ ] Scores salvos no banco
- [ ] Confidence metrics calculados

### Route Analyzer Agent
- [ ] Agent registrado
- [ ] Route analysis funcional
- [ ] Weather risk assessment
- [ ] Fuel efficiency calculation
- [ ] Safety scoring
- [ ] Compliance checking

### Agent Swarm Bridge
- [ ] Message bus funcional
- [ ] Agents comunicando
- [ ] Message processing
- [ ] Error handling

### Integration
- [ ] Cenários de teste funcionando
- [ ] Agents trabalhando em conjunto
- [ ] Trust scores atualizando
- [ ] Dashboard mostrando métricas

---

**STATUS:** 🔵 AGUARDANDO IMPLEMENTAÇÃO  
**FASE COMPLETA:** PATCHES 241-250 ✅
