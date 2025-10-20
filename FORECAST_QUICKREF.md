# 📋 Forecast de Risco - Referência Rápida

Guia rápido para uso do módulo Python de análise preditiva de risco.

---

## ⚡ Quick Start

```bash
# Execução rápida
python3 decision_core.py

# One-liner
python3 -c "from modules.forecast_risk import RiskForecast; RiskForecast().analyze()"
```

---

## 🎯 Comandos Principais

### CLI Interativo
```bash
python3 decision_core.py
# Opção 2: Executar Forecast de Risco Preditivo
```

### Standalone
```bash
python3 modules/forecast_risk.py
```

### Programático
```python
from modules.forecast_risk import RiskForecast

forecast = RiskForecast()
resultado = forecast.gerar_previsao()
print(resultado['risco_previsto'])  # BAIXA, MODERADA ou ALTA
```

---

## 📊 Classificação de Risco

| RPN Médio | Risco | Emoji | Ação |
|-----------|-------|-------|------|
| > 200 | ALTA | 🔴 | Ação imediata |
| 150-200 | MODERADA | 🟡 | Intensificar monitoramento |
| ≤ 150 | BAIXA | 🟢 | Operação normal |

**Fórmula RPN:** Severidade × Ocorrência × Detecção

---

## 📁 Arquivos Principais

| Arquivo | Descrição | Tamanho |
|---------|-----------|---------|
| `core/logger.py` | Sistema de logging | 382 B |
| `modules/forecast_risk.py` | Módulo principal | 8 KB |
| `decision_core.py` | Interface CLI | 5.4 KB |
| `relatorio_fmea_atual.json` | Dados FMEA | 2.5 KB |
| `asog_report.json` | Dados ASOG | 1 KB |
| `forecast_risco.json` | Saída (gerado) | ~300 B |

---

## 🔧 API Rápida

### Métodos Principais

```python
forecast = RiskForecast()

# Carregar dados
forecast.carregar_dados()  # → bool

# Calcular métricas
forecast.calcular_rpn_medio()  # → float
forecast.calcular_variabilidade()  # → float

# Classificar
forecast.classificar_risco(rpn)  # → "ALTA"|"MODERADA"|"BAIXA"
forecast.verificar_status_asog()  # → "conforme"|"fora dos limites"

# Gerar
forecast.gerar_previsao()  # → dict
forecast.salvar_relatorio(dict)  # → bool

# Executar tudo
forecast.analyze()  # → None (exibe no console)
```

---

## 📤 Formato de Saída

```json
{
  "timestamp": "2025-10-20T11:25:48.316921",
  "risco_previsto": "BAIXA",
  "rpn_medio": 73.50,
  "variabilidade": 28.84,
  "status_operacional": "conforme",
  "recomendacao": "🟢 Operação dentro dos padrões..."
}
```

---

## 🎨 Menu CLI

```
🔱 NAUTILUS ONE - Sistema de Análise de Risco
============================================================

Módulos Disponíveis:
  1. Visualizar dados FMEA
  2. Executar Forecast de Risco Preditivo
  3. Verificar Status ASOG
  4. Gerar Relatório Completo
  0. Sair
```

---

## 📊 Dados FMEA

8 sistemas críticos marítimos:
1. Propulsão (RPN: 108)
2. Posicionamento Dinâmico (RPN: 40)
3. Geração de Energia (RPN: 80)
4. Controle de Lastro (RPN: 84)
5. Navegação (RPN: 48)
6. Comunicação (RPN: 36)
7. Hidráulico (RPN: 108)
8. Ancoragem (RPN: 84)

**Média:** 73.5 (BAIXA)

---

## 📊 Dados ASOG

4 parâmetros de conformidade:
- DP Disponibilidade: 99.2% ✅
- Redundância: 100% ✅
- Tripulação Certificada: 95% ✅
- Horas sem Incidentes: 2450h ✅

**Status:** CONFORME

---

## 🔍 Logs de Exemplo

```
[2025-10-20 11:25:48] Carregando dados históricos FMEA/ASOG...
[2025-10-20 11:25:48] Calculando tendência de RPN...
[2025-10-20 11:25:48] Gerando relatório preditivo...
[2025-10-20 11:25:48] Forecast de risco gerado com sucesso.
```

---

## ⚙️ Requisitos

- **Python:** 3.6+
- **Dependências:** Nenhuma (stdlib only)
- **SO:** Linux, macOS, Windows
- **RAM:** 64 MB
- **Disco:** 50 KB

---

## 🧪 Teste Rápido

```bash
# Teste 1: Importação
python3 -c "from modules.forecast_risk import RiskForecast; print('OK')"

# Teste 2: Execução
python3 -c "from modules.forecast_risk import RiskForecast; RiskForecast().analyze()"

# Teste 3: Verificar saída
cat forecast_risco.json
```

---

## 🐛 Troubleshooting

### Erro: "No module named 'modules'"
```bash
# Certifique-se de estar no diretório raiz do projeto
cd /caminho/para/nautilus-one
python3 decision_core.py
```

### Erro: "FileNotFoundError"
```bash
# Verifique se os arquivos de dados existem
ls relatorio_fmea_atual.json asog_report.json
```

### Python < 3.6
```bash
# Atualize o Python
python3 --version  # Deve ser 3.6+
```

---

## 📚 Documentação Completa

- **Guia Completo:** [PYTHON_MODULES_README.md](PYTHON_MODULES_README.md)
- **Doc Técnica:** [modules/README.md](modules/README.md)
- **Implementação:** [FORECAST_RISK_IMPLEMENTATION_SUMMARY.md](FORECAST_RISK_IMPLEMENTATION_SUMMARY.md)
- **Sumário Executivo:** [IMPLEMENTATION_COMPLETE_FORECAST_RISK.md](IMPLEMENTATION_COMPLETE_FORECAST_RISK.md)

---

## 🚀 Próximos Passos

1. ✅ Execute o forecast: `python3 decision_core.py`
2. ✅ Revise o relatório: `cat forecast_risco.json`
3. 🔜 Integre com sua aplicação
4. 🔜 Automatize com cron jobs
5. 🔜 Adicione alertas por email

---

**Versão:** 1.0.0 | **Status:** ✅ Produção | **Licença:** MIT
