# Módulo: Navigation Copilot V2

## ✅ Objetivo

Sistema de copiloto de navegação alimentado por IA para assistir oficiais de náutica com análise de rotas, previsões meteorológicas, avisos de segurança e recomendações de navegação em tempo real.

## 📁 Estrutura de Arquivos

```
src/pages/admin/navigation-copilot-v2/
├── index.tsx                            # Dashboard principal
└── validation.tsx                       # Validação de rotas

src/components/navigation/
├── CopilotChat.tsx                      # Interface de chat IA
├── RouteAnalyzer.tsx                    # Análise de rotas
├── WeatherOverlay.tsx                   # Overlay meteorológico
└── SafetyAlerts.tsx                     # Alertas de segurança

tests/
└── e2e/
    └── playwright/
        └── copilot-v2.spec.ts           # E2E tests
```

## 🛢️ Tabelas Supabase

### `navigation_copilot_sessions`
Sessões de assistência de navegação.

**Campos principais:**
- `id`: UUID único
- `vessel_id`: Referência à embarcação
- `officer_id`: Oficial responsável
- `session_start`: Início da sessão
- `session_end`: Fim da sessão
- `route_data`: JSONB com dados da rota
- `ai_recommendations`: Sugestões da IA
- `weather_data`: Dados meteorológicos
- `created_at`: Timestamp

### `copilot_alerts`
Alertas e avisos gerados pelo sistema.

**Campos principais:**
- `id`: UUID único
- `session_id`: Referência à sessão
- `alert_type`: weather, collision_risk, restricted_area, etc.
- `severity`: info, warning, critical
- `message`: Mensagem do alerta
- `position`: Lat/Long do alerta
- `acknowledged`: Boolean
- `created_at`: Timestamp

### `route_validations`
Validações de rotas planejadas.

**Campos principais:**
- `id`: UUID único
- `route_id`: Referência à rota
- `validator_id`: Quem validou
- `validation_status`: approved, rejected, pending
- `ai_analysis`: Análise da IA
- `comments`: Comentários
- `created_at`: Timestamp

## 🔌 Integrações

### Supabase Auth & Realtime
- Autenticação de oficiais
- Updates em tempo real de alertas
- Sincronização de posição

### Weather API
- Previsões meteorológicas
- Avisos de tempestade
- Correntes marítimas
- API: OpenWeatherMap ou similar

### AIS Integration
- Dados de tráfego marítimo
- Detecção de colisão
- Identificação de navios próximos

### LLM para Análise
- Análise inteligente de rotas
- Geração de recomendações
- Interpretação de avisos náuticos
- API: OpenAI GPT-4

### Chart Services
- Cartas náuticas digitais
- Áreas restritas
- Profundidades

## 🧩 UI - Componentes

### CopilotChat
- Interface de chat conversacional
- Análise de contexto de navegação
- Histórico de conversas
- Comandos rápidos

### RouteAnalyzer
- Visualização de rota planejada
- Pontos de interesse
- Análise de risco
- Tempo estimado de chegada

### WeatherOverlay
- Camada meteorológica no mapa
- Previsões de 48h
- Alertas de tempestade
- Condições do mar

### SafetyAlerts
- Painel de alertas prioritários
- Notificações sonoras
- Ações recomendadas
- Registro de alertas

## 🔒 RLS Policies

```sql
-- Oficiais podem ver sessões de seus navios
CREATE POLICY "Officer can view vessel sessions"
  ON navigation_copilot_sessions
  FOR SELECT
  USING (
    vessel_id IN (
      SELECT vessel_id FROM crew_assignments
      WHERE user_id = auth.uid() AND role = 'officer'
    )
  );

-- Criar sessões para navios atribuídos
CREATE POLICY "Officer can create sessions"
  ON navigation_copilot_sessions
  FOR INSERT
  WITH CHECK (
    vessel_id IN (
      SELECT vessel_id FROM crew_assignments
      WHERE user_id = auth.uid()
    )
  );
```

## 📊 Status Atual

### ✅ Implementado
- Dashboard de navegação
- Chat IA para consultas
- Validação de rotas
- Sistema de alertas
- Integração com dados de embarcação

### ✅ Ativo no Sidebar
- Rota: `/admin/navigation-copilot-v2`
- Rota de validação: `/admin/navigation-copilot-v2/validation`

### ✅ Testes Automatizados
- E2E tests: `tests/e2e/playwright/copilot-v2.spec.ts`

### 🟢 Pronto para Produção

## 📈 Melhorias Futuras

### Fase 2
- **Predição de Deriva**: Cálculo de deriva por vento e corrente
- **Otimização de Rota**: Sugestão de rotas mais eficientes
- **Integração com Piloto Automático**: Envio direto de waypoints

### Fase 3
- **AR Navigation**: Realidade aumentada para ponte
- **Voice Commands**: Comandos de voz para mãos livres
- **Collision Avoidance AI**: IA preditiva de colisão

---

**Versão:** 2.0.0 (PATCH 634)  
**Data:** Novembro 2025  
**Status:** ✅ Implementação Completa  
**Testes:** ✅ PATCH 638 - Cobertura E2E
