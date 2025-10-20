# Forecast Risk - Quick Reference

## 🚀 Comandos Rápidos

### Execução Básica

```bash
# Menu interativo
python3 decision_core.py

# Execução direta
python3 -c "from modules.forecast_risk import RiskForecast; RiskForecast().analyze()"

# Script customizado
python3 << EOF
from modules.forecast_risk import RiskForecast
forecast = RiskForecast()
resultado = forecast.gerar_previsao()
print(f"Risco: {resultado['risco_previsto']}")
EOF
```

## 📁 Estrutura de Arquivos

```
├── core/logger.py              # Logging
├── modules/forecast_risk.py    # Módulo principal
├── decision_core.py            # Menu CLI
├── relatorio_fmea_atual.json   # Input FMEA
├── asog_report.json            # Input ASOG
└── forecast_risco.json         # Output gerado
```

## 📊 Entrada e Saída

### Input: FMEA
```json
[{"sistema": "...", "RPN": 96}]
```

### Input: ASOG
```json
{"resultado": {"conformidade": true}}
```

### Output: Forecast
```json
{
    "risco_previsto": "BAIXA",
    "rpn_medio": 85.75,
    "recomendacao": "🟢 ..."
}
```

## 🎯 Classificação de Risco

| Risco | RPN | Emoji |
|-------|-----|-------|
| BAIXA | ≤ 150 | 🟢 |
| MODERADA | 151-200 | 🟡 |
| ALTA | > 200 | 🔴 |

## 🔧 API Python

```python
from modules.forecast_risk import RiskForecast

# Criar instância
forecast = RiskForecast()

# Gerar relatório
resultado = forecast.gerar_previsao()

# Acessar dados
print(resultado['risco_previsto'])  # "BAIXA"
print(resultado['rpn_medio'])       # 85.75
print(resultado['status_operacional'])  # "conforme"
```

## 📝 Logging

```python
from core.logger import log_event

log_event("Iniciando processamento")
# [2025-10-20 11:25:48] Iniciando processamento
```

## 🧪 Testes Rápidos

```bash
# Teste básico
python3 -c "from modules.forecast_risk import RiskForecast; RiskForecast().analyze()"

# Teste sem arquivos (deve funcionar)
mv *.json /tmp/ && python3 -c "from modules.forecast_risk import RiskForecast; RiskForecast().analyze()" && mv /tmp/*.json .

# Validar JSON
python3 -m json.tool relatorio_fmea_atual.json
python3 -m json.tool asog_report.json
```

## 🔍 Troubleshooting

### Erro: Module not found
```bash
# Execute do diretório raiz
cd /path/to/project
python3 decision_core.py
```

### Erro: File not found
```bash
# Os arquivos JSON devem estar no mesmo diretório
ls -la *.json
```

### Erro: JSON inválido
```bash
# Valide o JSON
python3 -m json.tool arquivo.json
```

## 📦 Integração

### Cron Job
```bash
# crontab -e
0 6 * * * cd /path/to/project && python3 -c "from modules.forecast_risk import RiskForecast; RiskForecast().gerar_previsao()"
```

### API REST (Exemplo)
```python
from flask import Flask, jsonify
from modules.forecast_risk import RiskForecast

app = Flask(__name__)

@app.route('/api/forecast')
def forecast():
    return jsonify(RiskForecast().gerar_previsao())
```

## 🎨 Personalização

### Alterar arquivos de entrada
```python
forecast = RiskForecast()
forecast.historico_fmea = "meu_fmea.json"
forecast.historico_asog = "meu_asog.json"
resultado = forecast.gerar_previsao()
```

### Alterar arquivo de saída
```python
forecast = RiskForecast()
forecast.relatorio_saida = "meu_forecast.json"
resultado = forecast.gerar_previsao()
```

## 📊 Exemplo de Uso Completo

```python
#!/usr/bin/env python3
"""
Script de análise preditiva de risco
"""
from modules.forecast_risk import RiskForecast
from core.logger import log_event

def main():
    log_event("Iniciando análise diária")
    
    # Criar forecast
    forecast = RiskForecast()
    
    # Gerar previsão
    resultado = forecast.gerar_previsao()
    
    # Processar resultado
    if resultado['risco_previsto'] == 'ALTA':
        log_event("ALERTA: Risco alto detectado!")
        # Enviar email, criar ticket, etc.
    
    log_event("Análise concluída")
    return resultado

if __name__ == "__main__":
    main()
```

## 🔗 Links Úteis

- **Documentação Completa:** `PYTHON_MODULES_README.md`
- **Detalhes Técnicos:** `modules/README.md`
- **Resumo de Implementação:** `FORECAST_RISK_IMPLEMENTATION_SUMMARY.md`

## 📋 Checklist Rápido

- [ ] Python 3.6+ instalado
- [ ] Arquivos JSON no diretório correto
- [ ] Estrutura de pastas `core/` e `modules/`
- [ ] Permissões de execução OK
- [ ] Teste básico executado com sucesso

## 📞 Comandos Úteis

```bash
# Ver versão do Python
python3 --version

# Verificar estrutura
tree -L 2

# Listar arquivos
ls -lh *.py *.json

# Ver saída do forecast
cat forecast_risco.json | python3 -m json.tool

# Executar e salvar log
python3 decision_core.py 2>&1 | tee execution.log
```

---

**Versão:** 1.0.0  
**Última atualização:** 2025-10-20
