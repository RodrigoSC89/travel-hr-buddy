# 🌍 Nautilus Global Intelligence (Phase 5)

**"Um sistema que não apenas opera — ele aprende com o mar."**

## 📋 Visão Geral

O módulo **Global Intelligence** é o cérebro centralizado da frota Nautilus. Ele coleta, processa e aprende com dados de todas as embarcações, gerando previsões de risco e conformidade em tempo real.

## 🏗️ Arquitetura

```
modules/
 └── global_intelligence/
      ├── __init__.py           # Package initialization
      ├── gi_core.py            # Orchestration & global learning
      ├── gi_sync.py            # Fleet data collection (BridgeLink)
      ├── gi_trainer.py         # AI model training & evaluation
      ├── gi_forecast.py        # Multi-vessel risk forecasting
      ├── gi_dashboard.py       # Unified corporate dashboard
      ├── gi_alerts.py          # Systemic risk detection
      ├── fleet_profiles.json   # Fleet profiles & global history
      └── README.md             # This file
```

## 🚀 Instalação

### 1. Instalar Dependências Python

```bash
# A partir da raiz do projeto
pip install -r modules/requirements.txt
```

### 2. Verificar Instalação

```bash
python3 -c "import pandas, sklearn, requests; print('✅ Dependências instaladas com sucesso!')"
```

## 💻 Uso

### Modo Básico

```python
from modules.global_intelligence.gi_core import GlobalIntelligence

# Inicializar sistema
gi = GlobalIntelligence()

# Executar ciclo completo: coleta → treino → previsão → dashboard
gi.executar()
```

### Modo Avançado - Componentes Individuais

#### 1. Coletar Dados da Frota

```python
from modules.global_intelligence.gi_sync import FleetCollector

collector = FleetCollector()
dados = collector.coletar_dados()
print(f"Coletados dados de {len(dados)} embarcações")
```

#### 2. Treinar Modelo Global

```python
from modules.global_intelligence.gi_trainer import GlobalTrainer

trainer = GlobalTrainer()
trainer.treinar(dados)
```

#### 3. Gerar Previsões

```python
from modules.global_intelligence.gi_forecast import GlobalForecaster

forecaster = GlobalForecaster()
previsoes = forecaster.prever(dados)
```

#### 4. Exibir Dashboard

```python
from modules.global_intelligence.gi_dashboard import GlobalDashboard

dashboard = GlobalDashboard()
dashboard.mostrar(previsoes)
```

#### 5. Analisar Padrões e Alertas

```python
from modules.global_intelligence.gi_alerts import GlobalAlerts

alerts = GlobalAlerts()
alerts.analisar_padroes(previsoes)
```

## 📊 Formato de Dados

### Entrada (Fleet Data)

```json
[
  {
    "embarcacao": "Nautilus Explorer",
    "score_peodp": 92.5,
    "falhas_dp": 2,
    "tempo_dp": 4320,
    "alertas_criticos": 1,
    "conformidade_ok": 1
  }
]
```

### Saída (Previsões)

```json
[
  {
    "embarcacao": "Nautilus Explorer",
    "risco": 15.32
  }
]
```

## 🔗 Integrações

| Sistema | Função | Status |
|---------|--------|--------|
| **BridgeLink** | Backbone de dados bordo ↔ costa | ✅ Configurado |
| **PEO-DP Inteligente** | Score de conformidade e eventos DP | ✅ Integrado |
| **MMI** | Dados de falhas e manutenção | ✅ Integrado |
| **Vault IA** | Armazenamento de modelos e relatórios | ✅ Ativo |
| **Control Hub** | Interface embarcada e acesso offline | 🟡 Planejado |

## 🔥 Fluxo Operacional

1. **Coleta** - BridgeLink agrega dados de todas as embarcações (PEO-DP, MMI, DP Intelligence)
2. **Consolidação** - Global Intelligence processa e normaliza os dados
3. **Treinamento** - Modelo de ML é retreinado com novos dados
4. **Previsão** - Sistema gera scores de risco para cada embarcação
5. **Alertas** - Padrões críticos disparam notificações automáticas
6. **Dashboard** - Status da frota é exibido em tempo real

## 📈 Métricas e Indicadores

### Níveis de Risco

- 🟢 **BAIXO** (0-40%): Operação normal
- 🟡 **MODERADO** (41-70%): Atenção recomendada
- 🔴 **ALTO** (71-80%): Intervenção necessária
- 🚨 **CRÍTICO** (>80%): Ação imediata requerida

### Indicadores Monitorados

- **score_peodp**: Score de conformidade PEO-DP (0-100)
- **falhas_dp**: Número de falhas no sistema DP
- **tempo_dp**: Tempo acumulado em operação DP (minutos)
- **alertas_criticos**: Quantidade de alertas críticos ativos

## 🧪 Testes

```bash
# Teste com dados de exemplo
python3 -c "
from modules.global_intelligence.gi_core import GlobalIntelligence
gi = GlobalIntelligence()
gi.executar()
"
```

## 🔐 Segurança

- Dados sensíveis são criptografados em trânsito (HTTPS)
- Modelos treinados são versionados e auditáveis
- Logs de todas as operações são mantidos
- Acesso via autenticação e RLS (Supabase)

## 📝 Logs

Os logs são armazenados em:
- Console: Saída padrão
- Arquivo: `nautilus.log` (raiz do projeto)

## 🛠️ Configuração

Edite `fleet_profiles.json` para:
- Adicionar/remover embarcações
- Ajustar endpoints de integração
- Configurar intervalos de sincronização

## 🚧 Desenvolvimento Futuro

- [ ] Dashboard web interativo
- [ ] API REST para integração externa
- [ ] Suporte a múltiplos modelos de ML
- [ ] Previsões temporais (séries temporais)
- [ ] Análise de causas raiz (RCA automatizada)
- [ ] Integração com sistemas de terceiros

## 📞 Suporte

Para questões técnicas ou sugestões, contate o time Nautilus Development.

## 📄 Licença

Propriedade de Nautilus Marine Systems © 2026-2027
