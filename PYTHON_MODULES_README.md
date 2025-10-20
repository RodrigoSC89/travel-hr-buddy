# 🐍 Python Modules - Sistema Nautilus One

## 📋 Visão Geral

O Sistema Nautilus One agora inclui módulos Python para análise preditiva de risco operacional e suporte a decisões em operações marítimas e offshore.

## 🏗️ Estrutura de Diretórios

```
travel-hr-buddy/
├── core/                           # Módulos core do sistema
│   ├── __init__.py
│   └── logger.py                   # Sistema de logging com timestamps
├── modules/                        # Módulos de análise
│   ├── __init__.py
│   ├── forecast_risk.py            # Módulo de previsão de risco
│   └── README.md                   # Documentação detalhada
├── decision_core.py                # Interface principal de decisão
├── relatorio_fmea_atual.json       # Dados de exemplo FMEA
└── asog_report.json                # Dados de exemplo ASOG
```

## 🚀 Quick Start

### 1. Executar o Decision Core

```bash
python3 decision_core.py
```

Isso iniciará o menu interativo onde você pode selecionar:
- Opção 1: Análise FMEA (em desenvolvimento)
- Opção 2: Forecast de Risco ✅
- Opção 3: Análise ASOG (em desenvolvimento)

### 2. Executar Diretamente o Módulo de Forecast

```bash
python3 -c "from modules.forecast_risk import RiskForecast; RiskForecast().analyze()"
```

### 3. Usar Programaticamente

```python
from modules.forecast_risk import RiskForecast

# Criar instância
forecast = RiskForecast()

# Executar análise completa
forecast.analyze()

# Ou apenas gerar previsão
resultado = forecast.gerar_previsao()
print(f"Risco previsto: {resultado['risco_previsto']}")
print(f"RPN médio: {resultado['rpn_medio']}")
```

## 📦 Módulos Disponíveis

### 1. `core.logger`

Sistema de logging com timestamps formatados.

**Função principal:**
- `log_event(message)`: Registra evento com timestamp no formato `[YYYY-MM-DD HH:MM:SS]`

**Exemplo:**
```python
from core.logger import log_event

log_event("Iniciando análise...")
# Output: [2025-10-20 01:12:24] Iniciando análise...
```

### 2. `modules.forecast_risk`

Módulo de previsão de risco operacional baseado em análise FMEA e ASOG.

**Classe principal:** `RiskForecast`

**Métodos públicos:**
- `analyze()`: Executa análise completa e exibe resultados
- `gerar_previsao()`: Gera relatório de previsão (retorna dict e salva JSON)
- `carregar_dados()`: Carrega dados FMEA e ASOG
- `calcular_tendencias(fmea)`: Calcula tendências de RPN
- `avaliar_conformidade_asog(asog)`: Avalia conformidade operacional
- `recomendar_acao(tendencia, status_asog)`: Gera recomendações

**Veja `modules/README.md` para documentação detalhada.**

## 📊 Arquivos de Dados

### relatorio_fmea_atual.json

Contém dados de análise FMEA (Failure Mode and Effects Analysis):

```json
[
    {
        "item": "Sistema de Propulsão Principal",
        "falha_potencial": "Falha no motor principal",
        "severidade": 8,
        "ocorrencia": 3,
        "deteccao": 4,
        "RPN": 96
    }
]
```

**Campos:**
- `item`: Nome do sistema/componente
- `falha_potencial`: Descrição da falha
- `severidade`: Severidade da falha (1-10)
- `ocorrencia`: Probabilidade de ocorrência (1-10)
- `deteccao`: Facilidade de detecção (1-10)
- `RPN`: Risk Priority Number (severidade × ocorrencia × deteccao)

### asog_report.json

Contém dados de conformidade ASOG (Assurance of Operational Compliance):

```json
{
    "timestamp": "2025-10-19T23:00:00",
    "embarcacao": "Nautilus-01",
    "tipo_operacao": "DP Class 2",
    "resultado": {
        "conformidade": true,
        "parametros_verificados": [...]
    }
}
```

**Campos principais:**
- `timestamp`: Data/hora da avaliação
- `resultado.conformidade`: Boolean indicando conformidade
- `resultado.parametros_verificados`: Lista de parâmetros verificados

## 🎯 Saída do Forecast

O módulo gera `forecast_risco.json`:

```json
{
    "timestamp": "2025-10-20T01:12:24.877831",
    "risco_previsto": "BAIXA",
    "rpn_medio": 102,
    "variabilidade": 38.78,
    "status_operacional": "conforme",
    "recomendacao": "🟢 Operação dentro dos padrões..."
}
```

## 🧪 Testando

### Criar Dados de Teste

```python
import json

# FMEA com alto risco
high_risk = [
    {"item": "System X", "falha_potencial": "Critical", 
     "severidade": 10, "ocorrencia": 8, "deteccao": 3, "RPN": 240}
]

with open('relatorio_fmea_atual.json', 'w') as f:
    json.dump(high_risk, f, indent=4)

# Executar análise
from modules.forecast_risk import RiskForecast
RiskForecast().analyze()
```

### Testar Diferentes Cenários

1. **Risco Alto** (RPN > 200): Gera recomendação crítica
2. **Risco Moderado** (150-200): Sugere intensificação de monitoramento
3. **Risco Baixo** (≤150): Manter rotina padrão
4. **ASOG Não-Conforme**: Gera alerta mesmo com RPN baixo

## 🔧 Dependências

O código Python usa apenas bibliotecas padrão:
- `json`: Manipulação de arquivos JSON
- `statistics`: Cálculos estatísticos (média, desvio padrão)
- `datetime`: Timestamps

**Não requer instalação de pacotes externos!**

## 🔮 Próximas Implementações

- [ ] Módulo de Análise FMEA completa
- [ ] Módulo de Análise ASOG detalhada
- [ ] Exportação de relatórios em PDF
- [ ] API REST para integração com frontend
- [ ] Dashboard de visualização de tendências
- [ ] Alertas automáticos por email

## 📝 Logs de Eventos

Todos os módulos usam o sistema de logging unificado:

```
[2025-10-20 01:12:24] Carregando dados históricos FMEA/ASOG...
[2025-10-20 01:12:24] Calculando tendência de RPN...
[2025-10-20 01:12:24] Gerando relatório preditivo...
[2025-10-20 01:12:24] Forecast de risco gerado com sucesso.
```

## 🤝 Integração com o Sistema Principal

Os módulos Python operam independentemente do frontend TypeScript/React, mas podem ser integrados via:

1. **Chamadas de sistema**: Executar scripts Python via Node.js child_process
2. **API REST**: Criar endpoints que chamam os módulos Python
3. **Arquivos compartilhados**: Usar JSON como formato de intercâmbio
4. **Cron jobs**: Agendar análises periódicas

## 📚 Documentação Adicional

- **Módulo Forecast**: Veja `modules/README.md`
- **Sistema Principal**: Veja `README.md` na raiz do projeto
- **Deployment**: Veja documentação de deployment específica

## 🔗 Links Úteis

- [FMEA Methodology](https://en.wikipedia.org/wiki/Failure_mode_and_effects_analysis)
- [Dynamic Positioning Operations](https://www.imca-int.com/product/imca-m-103-guidelines-for-the-design-and-operation-of-dynamically-positioned-vessels/)
- [Python Documentation](https://docs.python.org/3/)

## ⚙️ Configuração

Os módulos não requerem configuração especial, mas você pode personalizar:

### Caminhos dos Arquivos

Edite `modules/forecast_risk.py`:

```python
def __init__(self):
    self.historico_fmea = "caminho/customizado/fmea.json"
    self.historico_asog = "caminho/customizado/asog.json"
    self.relatorio_saida = "caminho/customizado/forecast.json"
```

### Thresholds de Risco

Ajuste os limites em `calcular_tendencias`:

```python
if media > 200:      # Customizável
    tendencia = "ALTA"
elif media > 150:    # Customizável
    tendencia = "MODERADA"
```

## 🐛 Troubleshooting

### Erro: Module not found

```bash
# Certifique-se de estar no diretório correto
cd /home/runner/work/travel-hr-buddy/travel-hr-buddy

# Ou adicione ao PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:/path/to/travel-hr-buddy"
```

### Erro: File not found

```bash
# Verifique se os arquivos JSON existem
ls -la *.json

# Ou crie arquivos de exemplo
python3 -c "from modules.forecast_risk import RiskForecast; print('Módulo carregado!')"
```

### KeyError em calcular_tendencias

Isso foi corrigido na versão atual. Certifique-se de ter a última versão do código.

## 📄 Licença

Este código faz parte do Sistema Nautilus One e segue a mesma licença do projeto principal.

---

**Versão:** 1.0.0  
**Data:** 2025-10-20  
**Status:** ✅ Implementado e Testado
