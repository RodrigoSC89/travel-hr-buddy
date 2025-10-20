# 🚀 Phase 3: Integration Guide
## BridgeLink + Forecast Global

Este guia demonstra como integrar os módulos BridgeLink e Forecast Global com o sistema PEO-DP Inteligente.

## 📋 Visão Geral da Integração

```
┌─────────────────────────────────────────────────────────────────┐
│                    PEO-DP Inteligente                           │
│                 (Sistema de Auditoria)                          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ 1. Finaliza Auditoria
                  ▼
         ┌────────────────────┐
         │   BridgeLink       │
         │  (Comunicação)     │
         └─────┬──────────────┘
               │
               ├─── 2. Envia Relatório PDF ──────────┐
               │                                      ▼
               │                            ┌─────────────────┐
               │                            │ SGSO Petrobras  │
               │                            └─────────────────┘
               │
               └─── 3. Envia Métricas ──────────────┐
                                                     ▼
                                          ┌──────────────────┐
                                          │ Forecast Global  │
                                          │  (Análise IA)    │
                                          └─────┬────────────┘
                                                │
                                                │ 4. Avalia Risco
                                                ▼
                                        ┌────────────────┐
                                        │ Risco > 60%?   │
                                        └────┬───────────┘
                                             │ Sim
                                             ▼
                                    ┌─────────────────┐
                                    │ Smart Workflow  │
                                    │ (Ação Corretiva)│
                                    └─────────────────┘
```

## 🔧 Setup do Ambiente

### 1. Instalar Dependências Python

```bash
cd modules
pip install -r requirements.txt
```

### 2. Configurar Variáveis de Ambiente

Crie arquivo `.env` na raiz do projeto:

```bash
# BridgeLink Configuration
BRIDGE_ENDPOINT=https://sgso.petrobras.com.br/api
BRIDGE_TOKEN=seu_token_bearer_aqui
BRIDGE_API_PORT=5000
BRIDGE_API_USER=admin
BRIDGE_API_PASSWORD=sua_senha_segura
BRIDGE_SECRET_KEY=chave_secreta_jwt_longa_e_aleatoria

# Forecast Global Configuration
FORECAST_MODEL_TYPE=random_forest
FORECAST_DATA_DIR=data/forecast
FORECAST_ALERT_THRESHOLD=60.0
```

### 3. Inicializar Estrutura de Dados

```bash
mkdir -p data/forecast
mkdir -p data/training
mkdir -p models
```

## 💻 Exemplo de Integração Completa

### Arquivo: `integration_example.py`

```python
"""
Exemplo completo de integração Phase 3
BridgeLink + Forecast Global + PEO-DP
"""

import os
import json
from datetime import datetime
from pathlib import Path

# Importar módulos Phase 3
from bridge_link import BridgeCore, BridgeSync, MessageType, MessagePriority
from forecast_global import ForecastEngine, ForecastTrainer, ForecastDashboard


class Phase3Integration:
    """Integração completa dos módulos Phase 3."""
    
    def __init__(self):
        """Inicializa todos os componentes."""
        
        # 1. Inicializar BridgeLink
        print("🌉 Inicializando BridgeLink...")
        self.bridge = BridgeCore(
            endpoint=os.getenv('BRIDGE_ENDPOINT'),
            token=os.getenv('BRIDGE_TOKEN')
        )
        
        self.bridge_sync = BridgeSync(
            bridge_core=self.bridge,
            sync_interval=60
        )
        
        # Iniciar sincronização em background
        self.bridge_sync.start()
        print("✅ BridgeLink inicializado")
        
        # 2. Inicializar Forecast Global
        print("🔮 Inicializando Forecast Global...")
        self.forecast_engine = ForecastEngine(
            model_type=os.getenv('FORECAST_MODEL_TYPE', 'random_forest')
        )
        
        self.forecast_trainer = ForecastTrainer(
            engine=self.forecast_engine,
            data_dir=os.getenv('FORECAST_DATA_DIR', 'data/training')
        )
        
        self.forecast_dashboard = ForecastDashboard(
            engine=self.forecast_engine,
            alert_threshold=float(os.getenv('FORECAST_ALERT_THRESHOLD', '60.0'))
        )
        
        # Tentar carregar modelo existente
        try:
            self.forecast_engine._load_model()
            print("✅ Modelo existente carregado")
        except FileNotFoundError:
            print("⚠️ Nenhum modelo treinado encontrado")
            print("   Execute primeiro o treinamento inicial")
        
        print("✅ Forecast Global inicializado")
    
    def processar_auditoria_peodp(self, auditoria_data: dict) -> dict:
        """
        Processa uma auditoria PEO-DP completa.
        
        Fluxo:
        1. Envia relatório PDF ao SGSO via BridgeLink
        2. Analisa métricas com Forecast Global
        3. Gera alertas se necessário
        4. Retorna recomendações
        
        Args:
            auditoria_data: Dados da auditoria
                {
                    "embarcacao": "FPSO-123",
                    "data": "2025-01-15",
                    "relatorio_pdf": "/path/to/relatorio.pdf",
                    "metricas": {
                        "horas_dp": 2400,
                        "falhas_mensais": 3,
                        "eventos_asog": 1,
                        "score_peodp": 85
                    },
                    "teve_nao_conformidade": false
                }
        
        Returns:
            Dicionário com resultados do processamento
        """
        print(f"\n{'='*60}")
        print(f"📋 Processando Auditoria PEO-DP")
        print(f"   Embarcação: {auditoria_data['embarcacao']}")
        print(f"   Data: {auditoria_data['data']}")
        print(f"{'='*60}\n")
        
        resultado = {
            "embarcacao": auditoria_data["embarcacao"],
            "timestamp": datetime.now().isoformat(),
            "etapas": {}
        }
        
        # ETAPA 1: Enviar relatório ao SGSO
        print("1️⃣ Enviando relatório ao SGSO Petrobras...")
        try:
            relatorio_resultado = self.bridge.enviar_relatorio(
                arquivo_pdf=auditoria_data["relatorio_pdf"],
                metadata={
                    "embarcacao": auditoria_data["embarcacao"],
                    "data": auditoria_data["data"],
                    "tipo": "auditoria_peodp"
                }
            )
            
            if relatorio_resultado["status"] == "success":
                print("   ✅ Relatório enviado com sucesso")
                resultado["etapas"]["envio_relatorio"] = "success"
            else:
                print(f"   ⚠️ Falha no envio: {relatorio_resultado.get('error')}")
                print("   📥 Adicionando à fila de sincronização...")
                
                # Adicionar à fila para envio posterior
                self.bridge_sync.add_to_queue(
                    message_type=MessageType.REPORT,
                    data={
                        "arquivo_pdf": auditoria_data["relatorio_pdf"],
                        "metadata": {
                            "embarcacao": auditoria_data["embarcacao"],
                            "data": auditoria_data["data"]
                        }
                    },
                    priority=MessagePriority.MEDIUM
                )
                resultado["etapas"]["envio_relatorio"] = "queued"
        
        except Exception as e:
            print(f"   ❌ Erro: {str(e)}")
            resultado["etapas"]["envio_relatorio"] = "error"
        
        # ETAPA 2: Adicionar dados ao sistema de treinamento
        print("\n2️⃣ Alimentando sistema de treinamento contínuo...")
        try:
            relatorio_ml = {
                "embarcacao": auditoria_data["embarcacao"],
                "horas_dp": auditoria_data["metricas"]["horas_dp"],
                "falhas_mensais": auditoria_data["metricas"]["falhas_mensais"],
                "eventos_asog": auditoria_data["metricas"]["eventos_asog"],
                "score_peodp": auditoria_data["metricas"]["score_peodp"],
                "teve_nao_conformidade": auditoria_data.get("teve_nao_conformidade", False)
            }
            
            trainer_resultado = self.forecast_trainer.adicionar_dados_de_relatorio(relatorio_ml)
            print(f"   ✅ {trainer_resultado['records_added']} registros adicionados")
            
            # Verificar se precisa retreinar
            if trainer_resultado.get("retraining_recommended"):
                print("   🔄 Retreinamento recomendado")
                resultado["etapas"]["retraining_recommended"] = True
            
            resultado["etapas"]["adicionar_dados"] = "success"
        
        except Exception as e:
            print(f"   ⚠️ Erro ao adicionar dados: {str(e)}")
            resultado["etapas"]["adicionar_dados"] = "error"
        
        # ETAPA 3: Prever risco com Forecast Global
        print("\n3️⃣ Analisando risco com IA (Forecast Global)...")
        try:
            entrada = [
                auditoria_data["metricas"]["horas_dp"],
                auditoria_data["metricas"]["falhas_mensais"],
                auditoria_data["metricas"]["eventos_asog"],
                auditoria_data["metricas"]["score_peodp"]
            ]
            
            predicao = self.forecast_engine.prever(entrada)
            
            print(f"   📊 Risco Previsto: {predicao['risco_percentual']}%")
            print(f"   📈 Nível de Risco: {predicao['nivel_risco'].upper()}")
            
            # Registrar no dashboard
            self.forecast_dashboard.registrar_predicao(
                embarcacao=auditoria_data["embarcacao"],
                predicao=predicao
            )
            
            resultado["etapas"]["predicao"] = {
                "risco_percentual": predicao['risco_percentual'],
                "nivel_risco": predicao['nivel_risco']
            }
            
            # Verificar se há recomendação
            if "recomendacao" in predicao:
                print(f"   {predicao['recomendacao']}")
                resultado["recomendacao"] = predicao['recomendacao']
        
        except Exception as e:
            print(f"   ⚠️ Erro na predição: {str(e)}")
            resultado["etapas"]["predicao"] = "error"
        
        # ETAPA 4: Gerar ação corretiva se risco > 60%
        if resultado["etapas"].get("predicao", {}).get("risco_percentual", 0) > 60:
            print("\n4️⃣ 🚨 RISCO ELEVADO DETECTADO!")
            print("   Criando ação corretiva via Smart Workflow...")
            
            # Aqui integraria com Smart Workflow
            acao_corretiva = {
                "tipo": "risco_conformidade",
                "embarcacao": auditoria_data["embarcacao"],
                "risco_percentual": resultado["etapas"]["predicao"]["risco_percentual"],
                "descricao": f"Risco elevado de não-conformidade detectado ({resultado['etapas']['predicao']['risco_percentual']}%)",
                "prioridade": "alta" if resultado["etapas"]["predicao"]["risco_percentual"] > 80 else "media",
                "prazo": "7 dias"
            }
            
            # Enviar evento ao SGSO
            self.bridge.enviar_evento({
                "tipo": "alerta_risco",
                "embarcacao": auditoria_data["embarcacao"],
                "severidade": "alta",
                "descricao": f"Risco de conformidade: {resultado['etapas']['predicao']['risco_percentual']}%",
                "dados_adicionais": acao_corretiva
            })
            
            resultado["acao_corretiva"] = acao_corretiva
            print("   ✅ Ação corretiva criada")
        
        print(f"\n{'='*60}")
        print("✅ Processamento concluído")
        print(f"{'='*60}\n")
        
        return resultado
    
    def gerar_relatorio_frota(self) -> dict:
        """Gera relatório consolidado de toda a frota."""
        print("\n📊 Gerando Relatório da Frota...")
        
        relatorio = self.forecast_dashboard.gerar_relatorio_resumo()
        
        print(f"\n{'='*60}")
        print("📈 RELATÓRIO DA FROTA")
        print(f"{'='*60}")
        print(f"\n📍 Status Geral:")
        print(f"   Total de embarcações: {relatorio['status_frota']['total_embarcacoes']}")
        print(f"   Risco médio: {relatorio['status_frota']['risco_medio_frota']}%")
        print(f"   Em situação de risco: {relatorio['status_frota']['percentual_em_risco']}%")
        
        print(f"\n📊 Distribuição por Nível:")
        for nivel, count in relatorio['status_frota']['distribuicao'].items():
            print(f"   {nivel.capitalize()}: {count}")
        
        print(f"\n📈 Tendência (7 dias):")
        print(f"   {relatorio['tendencia_7_dias']['emoji']} {relatorio['tendencia_7_dias']['tendencia'].upper()}")
        if relatorio['tendencia_7_dias']['tendencia'] != 'indefinida':
            print(f"   Variação: {relatorio['tendencia_7_dias']['percentual_mudanca']:+.1f}%")
        
        print(f"\n🚨 Alertas (24h): {relatorio['alertas_24h']}")
        
        print(f"\n💡 Recomendações:")
        for rec in relatorio['recomendacoes']:
            print(f"   {rec}")
        
        print(f"\n{'='*60}\n")
        
        return relatorio
    
    def shutdown(self):
        """Encerra graciosamente todos os componentes."""
        print("\n🛑 Encerrando sistema...")
        self.bridge_sync.stop()
        print("✅ Sistema encerrado")


# ============================================================================
# EXEMPLO DE USO
# ============================================================================

if __name__ == "__main__":
    print("🚀 Phase 3 Integration - Exemplo de Uso")
    print("="*60)
    
    # Inicializar integração
    integration = Phase3Integration()
    
    # Exemplo 1: Processar auditoria PEO-DP
    print("\n📋 EXEMPLO 1: Processar Auditoria PEO-DP")
    print("-"*60)
    
    auditoria_exemplo = {
        "embarcacao": "FPSO-123",
        "data": "2025-01-15",
        "relatorio_pdf": "/tmp/relatorio_exemplo.pdf",
        "metricas": {
            "horas_dp": 2400,
            "falhas_mensais": 3,
            "eventos_asog": 1,
            "score_peodp": 85
        },
        "teve_nao_conformidade": False
    }
    
    # Criar arquivo PDF de exemplo
    Path(auditoria_exemplo["relatorio_pdf"]).touch()
    
    # Processar auditoria
    resultado = integration.processar_auditoria_peodp(auditoria_exemplo)
    
    # Exemplo 2: Gerar relatório da frota
    print("\n📊 EXEMPLO 2: Relatório da Frota")
    print("-"*60)
    relatorio_frota = integration.gerar_relatorio_frota()
    
    # Exemplo 3: Verificar estatísticas de sincronização
    print("\n🔄 EXEMPLO 3: Estatísticas de Sincronização")
    print("-"*60)
    stats = integration.bridge_sync.get_statistics()
    print(f"Mensagens pendentes: {stats['pending']}")
    print(f"Mensagens processadas: {stats['processed']}")
    print(f"Mensagens com falha: {stats['failed']}")
    
    # Encerrar
    print("\n")
    integration.shutdown()
    
    print("\n✅ Exemplo concluído com sucesso!")
    print("="*60)
```

## 🔄 Workflow Automatizado

### Script de Cron para Processamento Diário

```python
# cron_daily_processing.py

import schedule
import time
from integration_example import Phase3Integration

def processar_auditorias_pendentes():
    """Processa auditorias pendentes do dia."""
    print(f"[{datetime.now()}] Iniciando processamento diário...")
    
    integration = Phase3Integration()
    
    # Buscar auditorias pendentes no banco
    # auditorias = database.get_auditorias_pendentes()
    
    # for auditoria in auditorias:
    #     integration.processar_auditoria_peodp(auditoria)
    
    # Gerar relatório diário
    integration.gerar_relatorio_frota()
    
    integration.shutdown()
    print(f"[{datetime.now()}] Processamento diário concluído")

# Agendar para executar todo dia às 03:00
schedule.every().day.at("03:00").do(processar_auditorias_pendentes)

print("⏰ Cron job agendado: Processamento diário às 03:00")
print("Pressione Ctrl+C para parar")

while True:
    schedule.run_pending()
    time.sleep(60)
```

## 🧪 Testes de Integração

```python
# test_integration.py

import pytest
from integration_example import Phase3Integration

def test_bridge_connection():
    """Testa conexão com SGSO."""
    integration = Phase3Integration()
    assert integration.bridge.verificar_conexao() == True

def test_forecast_prediction():
    """Testa predição do Forecast."""
    integration = Phase3Integration()
    entrada = [2400, 3, 1, 85]
    resultado = integration.forecast_engine.prever(entrada)
    assert 'risco_percentual' in resultado
    assert 0 <= resultado['risco_percentual'] <= 100

def test_full_workflow():
    """Testa workflow completo."""
    integration = Phase3Integration()
    
    auditoria = {
        "embarcacao": "TEST-001",
        "data": "2025-01-15",
        "relatorio_pdf": "/tmp/test.pdf",
        "metricas": {
            "horas_dp": 2000,
            "falhas_mensais": 2,
            "eventos_asog": 0,
            "score_peodp": 90
        },
        "teve_nao_conformidade": False
    }
    
    resultado = integration.processar_auditoria_peodp(auditoria)
    assert resultado["embarcacao"] == "TEST-001"
    assert "etapas" in resultado
    
    integration.shutdown()
```

Execute os testes:

```bash
pytest test_integration.py -v
```

## 📚 Próximos Passos

### Fase 3.1: Camada de Sincronização Offline ✅
- [x] BridgeSync implementado
- [x] Fila persistente com SQLite
- [x] Retry automático

### Fase 3.2: Forecast Trainer (Aprendizado Contínuo) ✅
- [x] Treinamento incremental
- [x] Retreinamento agendado
- [x] Validação automática

### Fase 3.3: Dashboard Global ✅
- [x] Métricas de frota
- [x] Alertas automáticos
- [x] Exportação de relatórios

### Fase 3.4: Integração Control Hub (Próximo)
- [ ] Interface web para visualização
- [ ] Painel de controle embarcado
- [ ] Monitoramento em tempo real
- [ ] Mobile app para comandantes

## 🔒 Segurança e Compliance

- ✅ Autenticação Bearer Token
- ✅ HTTPS obrigatório em produção
- ✅ Rate limiting
- ✅ Logs auditáveis
- ✅ Conformidade NORMAM-101
- ✅ Conformidade IMCA M 117

## 📞 Suporte

Para dúvidas ou problemas:
- Consultar READMEs dos módulos individuais
- Abrir issue no repositório
- Contatar equipe de desenvolvimento

---

**Fase 3 Concluída** ✅  
*Sistema PEO-DP Inteligente + BridgeLink + Forecast Global*

MIT License - © 2025 Nautilus One
