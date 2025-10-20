# 🐍 Python Modules - Sistema Nautilus One

## Visão Geral

Este documento descreve a estrutura e uso dos módulos Python implementados no Sistema Nautilus One para análise preditiva de risco operacional em operações marítimas e offshore.

## 📁 Estrutura de Diretórios

```
nautilus-one/
├── core/                           # Utilitários centrais
│   ├── __init__.py                # Inicializador do pacote
│   └── logger.py                  # Sistema de logging
├── modules/                        # Módulos de análise
│   ├── __init__.py                # Inicializador do pacote
│   ├── forecast_risk.py           # Módulo principal de análise
│   └── README.md                  # Documentação técnica detalhada
├── decision_core.py               # Interface CLI interativa
├── relatorio_fmea_atual.json      # Dados de exemplo FMEA
├── asog_report.json               # Dados de exemplo ASOG
└── forecast_risco.json            # Saída gerada (após execução)
```

## 🚀 Começando Rápido

### Pré-requisitos

- Python 3.6 ou superior
- Nenhuma dependência externa (apenas biblioteca padrão)

### Instalação

Não é necessária instalação. O módulo usa apenas bibliotecas padrão do Python.

### Uso Básico

#### Opção 1: Interface Interativa (Recomendado)

```bash
python3 decision_core.py
```

Esta opção abre um menu interativo com as seguintes funcionalidades:
1. Visualizar dados FMEA atuais
2. Executar Análise Preditiva de Risco (Forecast)
3. Gerar Relatório ASOG
4. Ajuda sobre o sistema

#### Opção 2: Execução Direta

```bash
python3 -c "from modules.forecast_risk import RiskForecast; RiskForecast().analyze()"
```

#### Opção 3: Uso Programático

```python
from modules.forecast_risk import RiskForecast

# Criar instância
forecast = RiskForecast()

# Gerar previsão
resultado = forecast.gerar_previsao()

# Exibir resultados
print(f"Risco: {resultado['risco_previsto']}")
print(f"RPN médio: {resultado['rpn_medio']}")
print(f"Status ASOG: {resultado['status_operacional']}")
print(f"Recomendação: {resultado['recomendacao']}")

# Salvar relatório
forecast.salvar_relatorio(resultado, "forecast_risco.json")
```

## 📊 Funcionalidades

### 1. Análise FMEA (Failure Mode and Effects Analysis)

O módulo carrega e analisa dados históricos de FMEA, calculando:

- **RPN (Risk Priority Number)** para cada sistema
  - Fórmula: RPN = Severidade × Ocorrência × Detecção
  - Range: 1 a 1000
  
- **RPN Médio** do conjunto de sistemas
- **Variabilidade** (desvio padrão) dos RPNs

#### Classificação de Risco

| RPN Médio | Classificação | Ação |
|-----------|---------------|------|
| > 200 | 🔴 ALTA | Requer ação imediata |
| 150-200 | 🟡 MODERADA | Intensificar monitoramento |
| ≤ 150 | 🟢 BAIXA | Operação normal |

### 2. Avaliação ASOG (Assurance of Operational Compliance)

Verifica conformidade operacional avaliando:

- Disponibilidade de sistemas críticos
- Tempo Médio Entre Falhas (MTBF)
- Redundância de geradores
- Conformidade com manutenção preventiva

#### Status ASOG

- **Conforme**: Todos os parâmetros dentro dos limites
- **Fora dos limites**: Pelo menos um parâmetro não-conforme
- **Sem dados**: Arquivo ASOG não disponível

### 3. Geração de Relatórios

O sistema gera relatórios em formato JSON com:

```json
{
    "timestamp": "2025-10-20T11:25:48.316921",
    "risco_previsto": "BAIXA",
    "rpn_medio": 85.75,
    "variabilidade": 30.55,
    "status_operacional": "conforme",
    "recomendacao": "🟢 Operação dentro dos padrões. Manter rotina de monitoramento."
}
```

### 4. Sistema de Logging

Todos os eventos são registrados com timestamp:

```
[2025-10-20 11:25:48] Carregando dados históricos FMEA/ASOG...
[2025-10-20 11:25:48] Dados FMEA carregados: 8 sistemas
[2025-10-20 11:25:48] Dados ASOG carregados com sucesso
[2025-10-20 11:25:48] Calculando tendência de RPN...
[2025-10-20 11:25:48] Gerando relatório preditivo...
[2025-10-20 11:25:48] Forecast de risco gerado com sucesso.
```

## 🔧 Configuração

### Dados de Entrada

#### FMEA (relatorio_fmea_atual.json)

Estrutura mínima requerida:

```json
{
  "sistemas": [
    {
      "nome": "Nome do Sistema",
      "severidade": 8,
      "ocorrencia": 3,
      "deteccao": 4
    }
  ]
}
```

**Campos obrigatórios:**
- `severidade` (1-10): Gravidade do efeito da falha
- `ocorrencia` (1-10): Probabilidade de ocorrência da falha
- `deteccao` (1-10): Dificuldade de detecção da falha

#### ASOG (asog_report.json)

Estrutura mínima requerida:

```json
{
  "parametros": [
    {
      "parametro": "Nome do Parâmetro",
      "status": "conforme"
    }
  ]
}
```

**Campos obrigatórios:**
- `status`: "conforme" para aprovado, qualquer outro valor para não-conforme

### Arquivos Customizados

Você pode usar seus próprios arquivos de dados:

```python
forecast = RiskForecast(
    fmea_file="meus_dados/fmea_customizado.json",
    asog_file="meus_dados/asog_customizado.json"
)
```

## 📖 Exemplos de Uso

### Exemplo 1: Análise Simples

```python
from modules.forecast_risk import RiskForecast

# Executar análise e exibir resultados
forecast = RiskForecast()
forecast.analyze()
```

**Saída:**
```
🔮 Iniciando análise preditiva de risco...
[2025-10-20 11:25:48] Carregando dados históricos FMEA/ASOG...
[2025-10-20 11:25:48] Dados FMEA carregados: 8 sistemas
[2025-10-20 11:25:48] Dados ASOG carregados com sucesso
[2025-10-20 11:25:48] Calculando tendência de RPN...
[2025-10-20 11:25:48] Gerando relatório preditivo...
[2025-10-20 11:25:48] Forecast de risco gerado com sucesso.
📊 Forecast de Risco salvo como: forecast_risco.json

📈 Tendência de risco: BAIXA
RPN médio: 85.75 | Variabilidade: 30.55
Status ASOG: conforme
Recomendação: 🟢 Operação dentro dos padrões. Manter rotina de monitoramento.
```

### Exemplo 2: Integração em Script

```python
from modules.forecast_risk import RiskForecast
import json

def verificar_risco():
    """Verifica risco e retorna se requer atenção."""
    forecast = RiskForecast()
    resultado = forecast.gerar_previsao()
    
    # Salvar relatório
    forecast.salvar_relatorio(resultado)
    
    # Verificar se requer ação
    if resultado['risco_previsto'] in ['ALTA', 'MODERADA']:
        print("⚠️ ATENÇÃO: Risco elevado detectado!")
        print(f"Recomendação: {resultado['recomendacao']}")
        return True
    
    print("✅ Operação dentro dos padrões.")
    return False

# Executar verificação
requer_acao = verificar_risco()
```

### Exemplo 3: Análise de Sistema Específico

```python
from modules.forecast_risk import RiskForecast

forecast = RiskForecast()
forecast.carregar_dados_fmea()

# Analisar cada sistema individualmente
for sistema in forecast.fmea_data:
    rpn = forecast.calcular_rpn(sistema)
    risco = forecast.classificar_risco(rpn)
    
    print(f"Sistema: {sistema['nome']}")
    print(f"RPN: {rpn} - Risco: {risco}")
    print()
```

### Exemplo 4: Monitoramento Contínuo

```python
import time
from modules.forecast_risk import RiskForecast

def monitorar_continuo(intervalo_segundos=3600):
    """Monitora risco a cada hora."""
    while True:
        print(f"\n{'='*60}")
        print(f"Executando análise - {time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}\n")
        
        forecast = RiskForecast()
        resultado = forecast.gerar_previsao()
        
        # Salvar com timestamp no nome
        arquivo = f"forecast_{time.strftime('%Y%m%d_%H%M%S')}.json"
        forecast.salvar_relatorio(resultado, arquivo)
        
        print(f"\nPróxima análise em {intervalo_segundos} segundos...")
        time.sleep(intervalo_segundos)

# Executar monitoramento
# monitorar_continuo()  # Descomente para usar
```

## 🔍 API Reference

### Módulo core.logger

```python
from core.logger import log_event, log_info, log_error, log_warning

log_event("Mensagem de log")      # Log básico com timestamp
log_info("Informação")            # Log informativo
log_error("Erro detectado")       # Log de erro
log_warning("Aviso importante")   # Log de aviso
```

### Módulo modules.forecast_risk

```python
from modules.forecast_risk import RiskForecast

# Inicialização
forecast = RiskForecast(
    fmea_file="relatorio_fmea_atual.json",  # Opcional
    asog_file="asog_report.json"            # Opcional
)

# Métodos de carregamento
forecast.carregar_dados_fmea()  # bool
forecast.carregar_dados_asog()  # bool

# Cálculos
rpn = forecast.calcular_rpn(sistema)              # int
tendencia = forecast.calcular_tendencia_rpn()     # dict
risco = forecast.classificar_risco(rpn_medio)     # str
status = forecast.avaliar_status_asog()           # str

# Geração de resultado
recomendacao = forecast.gerar_recomendacao(risco, status)  # str
resultado = forecast.gerar_previsao()                      # dict

# Persistência
forecast.salvar_relatorio(resultado, "arquivo.json")  # bool

# Análise completa
forecast.analyze()  # None (exibe no console)
```

## 🧪 Testes e Validação

### Teste Manual Rápido

```bash
# Teste 1: Verificar estrutura
python3 -c "from modules.forecast_risk import RiskForecast; print('✅ Módulo importado')"

# Teste 2: Carregar dados
python3 -c "from modules.forecast_risk import RiskForecast; f = RiskForecast(); f.carregar_dados_fmea() and print('✅ FMEA OK')"

# Teste 3: Gerar previsão
python3 -c "from modules.forecast_risk import RiskForecast; r = RiskForecast().gerar_previsao(); print('✅ Forecast gerado:', r['risco_previsto'])"
```

### Validação de Dados

```python
from modules.forecast_risk import RiskForecast
import json

def validar_estrutura_fmea(arquivo):
    """Valida estrutura do arquivo FMEA."""
    try:
        with open(arquivo, 'r') as f:
            data = json.load(f)
        
        # Verificar estrutura
        assert 'sistemas' in data, "Campo 'sistemas' ausente"
        
        for sistema in data['sistemas']:
            assert 'severidade' in sistema, "Campo 'severidade' ausente"
            assert 'ocorrencia' in sistema, "Campo 'ocorrencia' ausente"
            assert 'deteccao' in sistema, "Campo 'deteccao' ausente"
            
            # Verificar ranges
            assert 1 <= sistema['severidade'] <= 10, "Severidade fora do range"
            assert 1 <= sistema['ocorrencia'] <= 10, "Ocorrência fora do range"
            assert 1 <= sistema['deteccao'] <= 10, "Detecção fora do range"
        
        print("✅ Estrutura FMEA válida")
        return True
        
    except Exception as e:
        print(f"❌ Erro na validação: {e}")
        return False

# Validar
validar_estrutura_fmea("relatorio_fmea_atual.json")
```

## 🔗 Integração Futura

O módulo está preparado para integração com:

### REST API

```python
from flask import Flask, jsonify
from modules.forecast_risk import RiskForecast

app = Flask(__name__)

@app.route('/api/forecast', methods=['GET'])
def get_forecast():
    forecast = RiskForecast()
    resultado = forecast.gerar_previsao()
    return jsonify(resultado)

# app.run()
```

### Cron Jobs

```bash
# Exemplo de crontab para análise diária às 6h
0 6 * * * cd /path/to/nautilus-one && python3 -c "from modules.forecast_risk import RiskForecast; RiskForecast().analyze()"
```

### Webhooks / Alertas

```python
import requests
from modules.forecast_risk import RiskForecast

def enviar_alerta_webhook(resultado):
    """Envia alerta para webhook se risco elevado."""
    if resultado['risco_previsto'] in ['ALTA', 'MODERADA']:
        webhook_url = "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
        payload = {
            "text": f"⚠️ Risco {resultado['risco_previsto']} detectado!\n{resultado['recomendacao']}"
        }
        requests.post(webhook_url, json=payload)

# Uso
forecast = RiskForecast()
resultado = forecast.gerar_previsao()
enviar_alerta_webhook(resultado)
```

## 📈 Performance

- **Tempo de execução:** < 1 segundo para análise completa
- **Memória:** Mínima (apenas dados JSON em memória)
- **I/O:** 2 leituras + 1 escrita por análise
- **Escalabilidade:** Suporta centenas de sistemas sem degradação

## 🛡️ Segurança

- Não requer permissões especiais
- Não acessa rede
- Não modifica arquivos além da saída gerada
- Tratamento robusto de exceções

## 📝 Notas Técnicas

### Dependências Zero

O módulo usa apenas a biblioteca padrão Python:
- `json` - Manipulação JSON
- `statistics` - Cálculos estatísticos
- `datetime` - Timestamps
- `pathlib` - Caminhos de arquivos
- `typing` - Type hints (opcional, para melhor IDE support)

### Compatibilidade

- ✅ Python 3.6+
- ✅ Windows, Linux, macOS
- ✅ Ambientes containerizados
- ✅ Serverless (AWS Lambda, GCP Functions)
- ✅ Jupyter Notebooks

### Encoding

Todos os arquivos usam UTF-8 para suporte completo a caracteres especiais e acentuação em português.

## 🤝 Contribuindo

Para adicionar novos recursos ou melhorias:

1. Mantenha compatibilidade com Python 3.6+
2. Use apenas biblioteca padrão (sem deps externas)
3. Adicione logging apropriado
4. Documente com docstrings
5. Mantenha type hints

## 📚 Referências

- **FMEA:** ISO 31010, IMCA M 220
- **ASOG:** IMO Guidelines, IMCA
- **Risk Assessment:** IEC 60812
- **Maritime Operations:** IMCA standards

## 📞 Suporte

Para questões, consulte:
- Documentação técnica: `modules/README.md`
- Guia rápido: `FORECAST_QUICKREF.md`
- Resumo de implementação: `FORECAST_RISK_IMPLEMENTATION_SUMMARY.md`

---

**Versão:** 1.0.0  
**Status:** ✅ Pronto para produção  
**Última atualização:** 2025-10-20
