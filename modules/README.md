# 🐍 Python Modules - Phase 3

Módulos Python para a Fase 3 do sistema PEO-DP Inteligente: **BridgeLink** e **Forecast Global**.

## 📦 Módulos

### 🌉 BridgeLink
Sistema de comunicação segura entre bordo e costa para transmissão de relatórios e eventos críticos ao SGSO Petrobras.

**Componentes:**
- `bridge_core.py` - Comunicação segura HTTP
- `bridge_api.py` - API REST local
- `bridge_sync.py` - Sincronização offline/online

**[📖 Documentação Completa](./bridge_link/README.md)**

### 🔮 Forecast Global
Motor de previsão baseado em aprendizado coletivo de frota usando Machine Learning.

**Componentes:**
- `forecast_engine.py` - Motor de ML para previsão de riscos
- `forecast_trainer.py` - Sistema de treinamento contínuo
- `forecast_dashboard.py` - Visualização e alertas

**[📖 Documentação Completa](./forecast_global/README.md)**

## 🚀 Quick Start

### 1. Instalação

```bash
cd modules
./setup.sh
```

Ou manualmente:

```bash
# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt
```

### 2. Configuração

Copie e edite o arquivo de configuração:

```bash
cp .env.phase3 ../.env
# Edite .env com suas credenciais
```

Variáveis obrigatórias:
```bash
BRIDGE_ENDPOINT=https://sgso.petrobras.com.br/api
BRIDGE_TOKEN=seu_token_bearer
FORECAST_MODEL_TYPE=random_forest
```

### 3. Uso Básico

```python
# BridgeLink - Enviar relatório
from bridge_link import BridgeCore

bridge = BridgeCore(
    endpoint="https://sgso.petrobras.com.br/api",
    token="seu_token"
)
bridge.enviar_relatorio("relatorio.pdf")

# Forecast Global - Prever risco
from forecast_global import ForecastEngine

engine = ForecastEngine()
engine.treinar("dataset.csv")
resultado = engine.prever([2400, 3, 1, 85])
print(f"Risco: {resultado['risco_percentual']}%")
```

## 📚 Documentação

- **[BridgeLink README](./bridge_link/README.md)** - Comunicação bordo-costa
- **[Forecast Global README](./forecast_global/README.md)** - Previsão com IA
- **[Integration Guide](./PHASE3_INTEGRATION_GUIDE.md)** - Guia de integração completo

## 🏗️ Arquitetura

```
modules/
├── bridge_link/              # Módulo de comunicação
│   ├── bridge_core.py        # Comunicação HTTP segura
│   ├── bridge_api.py         # API REST local
│   ├── bridge_sync.py        # Sincronização offline
│   ├── __init__.py
│   └── README.md
├── forecast_global/          # Módulo de previsão IA
│   ├── forecast_engine.py    # Motor de ML
│   ├── forecast_trainer.py   # Treinamento contínuo
│   ├── forecast_dashboard.py # Dashboard e alertas
│   ├── __init__.py
│   └── README.md
├── requirements.txt          # Dependências Python
├── setup.sh                  # Script de instalação
├── PHASE3_INTEGRATION_GUIDE.md
└── README.md                 # Este arquivo
```

## 🔄 Fluxo Integrado

```
PEO-DP Inteligente
       ↓
   [Auditoria Finalizada]
       ↓
   BridgeLink
       ↓
    ┌──────┴──────┐
    ↓             ↓
SGSO Petrobras  Forecast Global
                   ↓
              [Análise de Risco]
                   ↓
              [Risco > 60%?]
                   ↓
            Smart Workflow
            (Ação Corretiva)
```

## 🧪 Testes

```bash
# Executar todos os testes
pytest tests/ -v

# Com cobertura
pytest tests/ --cov=. --cov-report=html

# Testes específicos
pytest tests/test_bridge_link.py -v
pytest tests/test_forecast_global.py -v
```

## 📊 Exemplos

### Exemplo 1: Envio Simples

```python
from bridge_link import BridgeCore

bridge = BridgeCore(endpoint="...", token="...")

# Verificar conexão
if bridge.verificar_conexao():
    # Enviar relatório
    resultado = bridge.enviar_relatorio("relatorio.pdf")
    print(resultado)
```

### Exemplo 2: Com Sincronização Offline

```python
from bridge_link import BridgeCore, BridgeSync, MessageType

bridge = BridgeCore(endpoint="...", token="...")
sync = BridgeSync(bridge_core=bridge)

# Adicionar à fila (funciona offline)
sync.add_to_queue(
    message_type=MessageType.REPORT,
    data={"arquivo_pdf": "relatorio.pdf"},
    priority=MessagePriority.HIGH
)

# Iniciar sincronização automática
sync.start()
```

### Exemplo 3: Previsão com Dashboard

```python
from forecast_global import ForecastEngine, ForecastDashboard

engine = ForecastEngine()
engine.treinar("dataset.csv")

dashboard = ForecastDashboard(engine)

# Fazer predição
predicao = engine.prever([2400, 3, 1, 85])
dashboard.registrar_predicao("FPSO-123", predicao)

# Ver métricas
metricas = dashboard.get_metricas_frota()
print(f"Risco médio da frota: {metricas['risco_medio']}%")
```

### Exemplo 4: Integração Completa

Ver arquivo completo: [`PHASE3_INTEGRATION_GUIDE.md`](./PHASE3_INTEGRATION_GUIDE.md)

## 🔒 Segurança

- ✅ Autenticação via Bearer Token
- ✅ JWT para API local
- ✅ Rate limiting
- ✅ Validação de entrada
- ✅ HTTPS obrigatório em produção
- ✅ Logs auditáveis

## ⚙️ Configuração Avançada

### BridgeLink

```python
# Configurar retry
sync = BridgeSync(
    bridge_core=bridge,
    max_retries=5,
    sync_interval=60
)

# Configurar timeout
bridge = BridgeCore(
    endpoint="...",
    token="...",
    timeout=30  # segundos
)
```

### Forecast Global

```python
# Escolher modelo
engine = ForecastEngine(model_type="gradient_boosting")

# Configurar threshold de alerta
dashboard = ForecastDashboard(
    engine=engine,
    alert_threshold=70.0  # alertar quando > 70%
)

# Agendar retreinamento automático
trainer.agendar_retreinamento_automatico(
    intervalo_dias=7,
    hora="03:00"
)
```

## 🐛 Troubleshooting

### Erro de Import

```bash
# Ativar ambiente virtual
source venv/bin/activate

# Reinstalar dependências
pip install -r requirements.txt
```

### Erro de Conexão

```python
# Verificar conectividade
if not bridge.verificar_conexao():
    print("Verifique:")
    print("- URL do endpoint")
    print("- Token de autenticação")
    print("- Conectividade de rede")
```

### Modelo não Treinado

```python
# Treinar modelo inicial
engine.treinar("dataset.csv")

# Ou carregar modelo existente
engine._load_model()
```

## 📈 Performance

### BridgeLink
- Suporta até 1000 msgs/hora
- Queue persistente em SQLite
- Retry automático com backoff

### Forecast Global
- Treinamento: ~5s para 1000 registros
- Predição: <10ms por registro
- Suporta predição em lote

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Changelog

### v1.0.0 (2025-01-20)
- ✅ Implementação inicial BridgeLink
- ✅ Implementação inicial Forecast Global
- ✅ Sistema de sincronização offline
- ✅ Dashboard com alertas
- ✅ Treinamento contínuo
- ✅ Documentação completa

## 📞 Suporte

- 📚 Documentação: READMEs dos módulos
- 🐛 Issues: [GitHub Issues](https://github.com/RodrigoSC89/travel-hr-buddy/issues)
- 💬 Discussões: [GitHub Discussions](https://github.com/RodrigoSC89/travel-hr-buddy/discussions)

## 📄 Licença

MIT License - © 2025 Nautilus One

## 🎯 Próximos Passos

### Fase 3.4: Control Hub
- [ ] Interface web para visualização
- [ ] Painel de controle embarcado
- [ ] Monitoramento em tempo real
- [ ] Mobile app para comandantes

### Melhorias Futuras
- [ ] Suporte a XGBoost e LightGBM
- [ ] API GraphQL
- [ ] WebSocket para updates em tempo real
- [ ] Clustering de embarcações similares
- [ ] Detecção de anomalias
- [ ] Exportação para PowerBI/Tableau

---

**Fase 3 Completa** ✅  
*BridgeLink + Forecast Global integrados ao PEO-DP Inteligente*
