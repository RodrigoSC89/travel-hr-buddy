# ⚡ Forecast Risk Module - Quick Reference

## 🚀 Quick Start (30 seconds)

```bash
# Execute o módulo
python3 decision_core.py

# Selecione opção 2 no menu
# Ou execute diretamente:
python3 -c "from modules.forecast_risk import RiskForecast; RiskForecast().analyze()"
```

## 📁 Arquivos Principais

| Arquivo | Descrição |
|---------|-----------|
| `modules/forecast_risk.py` | Módulo principal |
| `decision_core.py` | Interface interativa |
| `relatorio_fmea_atual.json` | Dados FMEA (entrada) |
| `asog_report.json` | Dados ASOG (entrada) |
| `forecast_risco.json` | Relatório gerado (saída) |

## 🎯 Comandos Essenciais

### Executar Análise
```python
from modules.forecast_risk import RiskForecast

forecast = RiskForecast()
resultado = forecast.analyze()
```

### Apenas Gerar Previsão
```python
forecast = RiskForecast()
resultado = forecast.gerar_previsao()
print(resultado['risco_previsto'])  # ALTA/MODERADA/BAIXA
```

### Carregar Dados
```python
forecast = RiskForecast()
fmea, asog = forecast.carregar_dados()
```

## 📊 Níveis de Risco

| Nível | RPN | Emoji |
|-------|-----|-------|
| ALTA | > 200 | 🔴 ⚠️ |
| MODERADA | 150-200 | 🟡 |
| BAIXA | ≤ 150 | 🟢 |

## 📝 Formato FMEA

```json
[
  {
    "item": "Nome do Sistema",
    "falha_potencial": "Descrição",
    "severidade": 8,
    "ocorrencia": 3,
    "deteccao": 4,
    "RPN": 96
  }
]
```

**RPN = Severidade × Ocorrência × Detecção**

## 📋 Formato ASOG

```json
{
  "resultado": {
    "conformidade": true
  }
}
```

## 🔍 Estrutura da Saída

```json
{
  "timestamp": "2025-10-20T01:20:15",
  "risco_previsto": "BAIXA",
  "rpn_medio": 102,
  "variabilidade": 38.78,
  "status_operacional": "conforme",
  "recomendacao": "🟢 Operação dentro..."
}
```

## 🛠️ Customização Rápida

### Alterar Caminhos dos Arquivos
```python
forecast = RiskForecast()
forecast.historico_fmea = "meu_fmea.json"
forecast.historico_asog = "meu_asog.json"
forecast.relatorio_saida = "meu_forecast.json"
```

### Alterar Thresholds de Risco
Edite `modules/forecast_risk.py`:
```python
# Linha 46-52
if media > 200:      # Seu threshold
    tendencia = "ALTA"
elif media > 150:    # Seu threshold
    tendencia = "MODERADA"
```

## 🧪 Testar Diferentes Cenários

### Risco Alto
```python
import json
data = [{"item": "X", "falha_potencial": "Y", 
         "severidade": 10, "ocorrencia": 8, 
         "deteccao": 3, "RPN": 240}]
with open('relatorio_fmea_atual.json', 'w') as f:
    json.dump(data, f)
```

### Risco Moderado
```python
data = [{"item": "X", "falha_potencial": "Y",
         "severidade": 8, "ocorrencia": 6,
         "deteccao": 3, "RPN": 144}]
```

### Risco Baixo
```python
data = [{"item": "X", "falha_potencial": "Y",
         "severidade": 5, "ocorrencia": 4,
         "deteccao": 3, "RPN": 60}]
```

## 🐛 Troubleshooting

| Erro | Solução |
|------|---------|
| `ModuleNotFoundError` | Execute do diretório raiz |
| `FileNotFoundError` | Crie os arquivos JSON de entrada |
| `KeyError: 'RPN'` | Verifique formato do JSON FMEA |
| Imports não funcionam | Verifique PYTHONPATH |

## 📚 Documentação Completa

- **Detalhada:** `modules/README.md`
- **Guia Python:** `PYTHON_MODULES_README.md`
- **Resumo Implementação:** `FORECAST_RISK_IMPLEMENTATION_SUMMARY.md`

## 💡 Dicas

1. ✅ Use dados reais para análises precisas
2. ✅ Execute análises periódicas (cron)
3. ✅ Monitore tendências ao longo do tempo
4. ✅ Archive relatórios históricos
5. ✅ Integre com alertas automáticos

## 🔗 Integração com Node.js

```javascript
const { exec } = require('child_process');

exec('python3 -c "from modules.forecast_risk import RiskForecast; import json; print(json.dumps(RiskForecast().gerar_previsao()))"',
  (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error}`);
      return;
    }
    const resultado = JSON.parse(stdout);
    console.log(resultado.risco_previsto);
  }
);
```

## 📞 Suporte

- Issues: GitHub Issues
- Docs: README files neste repo
- Code: Well commented and documented

---

**Versão:** 1.0.0  
**Status:** ✅ Production Ready  
**Última Atualização:** 2025-10-20
