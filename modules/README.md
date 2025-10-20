# Módulo Forecast de Risco - Sistema Nautilus One

## 📋 Descrição

O módulo **Forecast de Risco** (`forecast_risk.py`) é responsável por analisar relatórios anteriores (FMEA e ASOG) e calcular tendências de risco operacional para operações marítimas e offshore.

## 🎯 Funcionalidades

- **Análise de FMEA**: Calcula tendências baseadas em valores de RPN (Risk Priority Number)
- **Avaliação ASOG**: Verifica conformidade com padrões operacionais
- **Previsão de Risco**: Gera relatórios preditivos de risco operacional
- **Recomendações Automáticas**: Fornece ações recomendadas baseadas no nível de risco

## 📊 Níveis de Risco

| Nível | RPN Médio | Descrição |
|-------|-----------|-----------|
| ALTA | > 200 | Risco crítico - ação imediata necessária |
| MODERADA | 150-200 | Risco moderado - intensificar monitoramento |
| BAIXA | ≤ 150 | Risco controlado - manter rotina |

## 🔧 Uso

### Uso Básico

```python
from modules.forecast_risk import RiskForecast

# Criar instância e executar análise
forecast = RiskForecast()
forecast.analyze()
```

### Uso via Decision Core

```bash
python3 decision_core.py
# Selecione a opção "2. Forecast de Risco"
```

## 📁 Arquivos Necessários

O módulo espera encontrar os seguintes arquivos JSON no diretório raiz:

### 1. `relatorio_fmea_atual.json`

Formato esperado:
```json
[
    {
        "item": "Nome do Sistema",
        "falha_potencial": "Descrição da falha",
        "severidade": 8,
        "ocorrencia": 3,
        "deteccao": 4,
        "RPN": 96
    }
]
```

### 2. `asog_report.json`

Formato esperado:
```json
{
    "timestamp": "2025-10-19T23:00:00",
    "resultado": {
        "conformidade": true
    }
}
```

## 📤 Saída

O módulo gera um arquivo `forecast_risco.json` com o seguinte formato:

```json
{
    "timestamp": "2025-10-20T01:12:24.877831",
    "risco_previsto": "BAIXA",
    "rpn_medio": 102,
    "variabilidade": 38.78,
    "status_operacional": "conforme",
    "recomendacao": "🟢 Operação dentro dos padrões. Manter rotina de monitoramento."
}
```

## 🧪 Testes

Execute os testes incluídos para verificar o funcionamento:

```bash
# Teste básico
python3 test_forecast.py

# Testes de casos extremos
python3 test_edge_cases.py

# Testes de cenários de risco
python3 test_risk_scenarios.py
```

## 📝 Recomendações por Cenário

| Cenário | Recomendação |
|---------|--------------|
| Risco ALTA ou ASOG não-conforme | ⚠️ Revisar redundâncias e planejar DP Trials adicionais |
| Risco MODERADA | 🟡 Intensificar inspeções preventivas e validar sensores críticos |
| Risco BAIXA | 🟢 Operação dentro dos padrões. Manter rotina de monitoramento |

## 🔮 Tratamento de Erros

O módulo lida graciosamente com os seguintes casos:

- **Arquivo FMEA ausente**: Retorna tendência "indeterminada" com RPN médio 0
- **Arquivo ASOG ausente**: Retorna status "sem dados"
- **Arquivos vazios**: Processa com valores padrão

## 📊 Log de Eventos

Todos os eventos são registrados com timestamps no formato:
```
[YYYY-MM-DD HH:MM:SS] Mensagem do evento
```

## 🔗 Integração

O módulo está integrado ao `decision_core.py` e pode ser chamado através da interface de menu:

```python
elif sub == "2":
    from modules.forecast_risk import RiskForecast
    RiskForecast().analyze()
```

## 🛠️ Dependências

- Python 3.x
- Módulos padrão: `json`, `statistics`, `datetime`
- Módulo interno: `core.logger`

## 📌 Notas

- Os arquivos JSON devem estar no diretório raiz do projeto
- O módulo cria automaticamente o arquivo de saída `forecast_risco.json`
- Todos os cálculos de RPN seguem a metodologia FMEA padrão
- A conformidade ASOG segue normas marítimas internacionais
