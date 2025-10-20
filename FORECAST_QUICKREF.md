# 🔮 Forecast de Risco - Referência Rápida

## Uso Rápido

### 🚀 Menu Interativo (Mais Fácil)
```bash
python3 decision_core.py
# Selecione opção 2 no menu
```

### ⚡ Execução Direta
```bash
python3 -c "from modules.forecast_risk import RiskForecast; RiskForecast().analyze()"
```

### 💻 Uso Programático
```python
from modules.forecast_risk import RiskForecast

forecast = RiskForecast()
resultado = forecast.gerar_previsao()
print(f"Risco: {resultado['risco_previsto']}")
```

## Classificação de Risco

| RPN Médio | Classificação | Emoji | Ação |
|-----------|---------------|-------|------|
| > 200 | ALTA | 🔴 | Ação imediata |
| 150-200 | MODERADA | 🟡 | Intensificar monitoramento |
| ≤ 150 | BAIXA | 🟢 | Operação normal |

## Estrutura de Arquivos

```
├── core/                    # Utilitários
│   ├── __init__.py
│   └── logger.py           # Logging com timestamp
├── modules/                 # Análise
│   ├── __init__.py
│   ├── forecast_risk.py    # Módulo principal
│   └── README.md           # Doc técnica
├── decision_core.py        # Interface CLI
├── relatorio_fmea_atual.json    # Dados FMEA
├── asog_report.json             # Dados ASOG
└── forecast_risco.json          # Saída (gerada)
```

## API Principal

### RiskForecast

```python
# Criar instância
forecast = RiskForecast()

# Carregar dados
forecast.carregar_dados_fmea()  # -> bool
forecast.carregar_dados_asog()  # -> bool

# Calcular RPN
rpn = forecast.calcular_rpn(sistema)  # -> int

# Calcular tendência
tendencia = forecast.calcular_tendencia_rpn()
# -> {'rpn_medio': float, 'variabilidade': float}

# Classificar risco
risco = forecast.classificar_risco(rpn_medio)  # -> str

# Avaliar ASOG
status = forecast.avaliar_status_asog()  # -> str

# Gerar previsão completa
resultado = forecast.gerar_previsao()  # -> dict

# Salvar relatório
forecast.salvar_relatorio(resultado)  # -> bool

# Análise completa (método de conveniência)
forecast.analyze()  # -> None (exibe no console)
```

## Formato de Saída

```json
{
    "timestamp": "2025-10-20T11:25:48.316921",
    "risco_previsto": "BAIXA",
    "rpn_medio": 85.75,
    "variabilidade": 30.55,
    "status_operacional": "conforme",
    "recomendacao": "🟢 Operação dentro dos padrões..."
}
```

## Dados de Entrada

### FMEA (mínimo)
```json
{
  "sistemas": [
    {
      "severidade": 8,
      "ocorrencia": 3,
      "deteccao": 4
    }
  ]
}
```

### ASOG (mínimo)
```json
{
  "parametros": [
    {
      "status": "conforme"
    }
  ]
}
```

## Cálculo de RPN

**Fórmula:** RPN = Severidade × Ocorrência × Detecção

**Escalas (1-10):**
- **Severidade:** Gravidade do efeito da falha
- **Ocorrência:** Probabilidade de ocorrência
- **Detecção:** Dificuldade de detecção

**Exemplo:**
- Sistema: Propulsão Principal
- S = 8, O = 3, D = 4
- RPN = 8 × 3 × 4 = 96

## Logging

Formato: `[YYYY-MM-DD HH:MM:SS] Mensagem`

```python
from core.logger import log_info, log_error, log_warning

log_info("Operação OK")
log_error("Falha detectada")
log_warning("Atenção necessária")
```

## Exemplos Rápidos

### Verificar Risco e Alertar
```python
from modules.forecast_risk import RiskForecast

forecast = RiskForecast()
resultado = forecast.gerar_previsao()

if resultado['risco_previsto'] in ['ALTA', 'MODERADA']:
    print(f"⚠️ ALERTA: {resultado['recomendacao']}")
```

### Analisar Sistema Individual
```python
sistema = {
    'severidade': 8,
    'ocorrencia': 3,
    'deteccao': 4
}

rpn = forecast.calcular_rpn(sistema)
risco = forecast.classificar_risco(rpn)
print(f"RPN: {rpn} - Risco: {risco}")
```

### Loop de Monitoramento
```python
import time

while True:
    forecast = RiskForecast()
    resultado = forecast.gerar_previsao()
    forecast.salvar_relatorio(resultado)
    time.sleep(3600)  # A cada hora
```

## Status ASOG

| Status | Significado |
|--------|-------------|
| conforme | Todos os parâmetros OK |
| fora dos limites | Pelo menos 1 parâmetro não-conforme |
| sem dados | Arquivo ASOG não encontrado |

## Recomendações Automáticas

- **Risco ALTA:** 🔴 Requer ação imediata
- **Risco MODERADA:** 🟡 Intensificar monitoramento
- **ASOG não-conforme:** 🟡 Verificar conformidade
- **Risco BAIXA + ASOG OK:** 🟢 Manter rotina

## Testes Rápidos

```bash
# Teste 1: Importação
python3 -c "from modules.forecast_risk import RiskForecast; print('✅ OK')"

# Teste 2: Carregamento
python3 -c "from modules.forecast_risk import RiskForecast; f=RiskForecast(); f.carregar_dados_fmea() and print('✅ OK')"

# Teste 3: Análise
python3 -c "from modules.forecast_risk import RiskForecast; RiskForecast().analyze()"
```

## Troubleshooting

### Erro: Arquivo não encontrado
```
[2025-10-20 11:25:48] AVISO: Arquivo FMEA não encontrado
```
**Solução:** Verificar se `relatorio_fmea_atual.json` existe no diretório

### Erro: JSON inválido
```
[2025-10-20 11:25:48] ERRO: Erro ao decodificar JSON FMEA
```
**Solução:** Validar estrutura JSON com `python3 -m json.tool arquivo.json`

### RPN médio zerado
```
rpn_medio: 0, variabilidade: 0
```
**Solução:** Verificar se dados FMEA foram carregados corretamente

## Requisitos

- Python 3.6+
- Sem dependências externas
- Sistema operacional: Windows/Linux/macOS

## Arquivos Customizados

```python
forecast = RiskForecast(
    fmea_file="caminho/para/meu_fmea.json",
    asog_file="caminho/para/meu_asog.json"
)
```

## Performance

- Execução: < 1 segundo
- Memória: Mínima
- I/O: 2 leituras + 1 escrita

## Integração

### REST API (Flask)
```python
from flask import Flask, jsonify
from modules.forecast_risk import RiskForecast

app = Flask(__name__)

@app.route('/forecast')
def forecast():
    f = RiskForecast()
    return jsonify(f.gerar_previsao())
```

### Cron Job
```bash
# Diário às 6h
0 6 * * * cd /path && python3 -c "from modules.forecast_risk import RiskForecast; RiskForecast().analyze()"
```

## Comandos Úteis

```bash
# Executar análise
python3 decision_core.py

# Análise direta
python3 modules/forecast_risk.py

# Ver relatório gerado
cat forecast_risco.json | python3 -m json.tool

# Validar JSON
python3 -m json.tool relatorio_fmea_atual.json

# Ver logs em tempo real
python3 decision_core.py 2>&1 | tee analise.log
```

## Referências Rápidas

- **ISO 31010:** Risk assessment techniques
- **IMCA M 220:** Marine FMEA guidelines
- **IEC 60812:** Failure modes and effects analysis

## Suporte

📖 Documentação completa: `PYTHON_MODULES_README.md`  
🔧 Doc técnica: `modules/README.md`  
📝 Implementação: `FORECAST_RISK_IMPLEMENTATION_SUMMARY.md`

---

**Versão:** 1.0.0 | **Status:** ✅ Produção | **Python:** 3.6+
