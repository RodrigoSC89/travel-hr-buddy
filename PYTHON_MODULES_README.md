# 🐍 Módulos Python - Nautilus One

Sistema de análise preditiva de risco operacional para operações marítimas e offshore baseado em dados FMEA e ASOG.

---

## 📦 O Que Foi Implementado

Este sistema Python standalone implementa análise preditiva de risco com **13 arquivos novos**:

### Core Utilities (2 arquivos)
- `core/__init__.py` - Inicializador do pacote core
- `core/logger.py` - Sistema de logging com timestamps [YYYY-MM-DD HH:MM:SS]

### Módulos de Análise (3 arquivos)
- `modules/__init__.py` - Inicializador do pacote modules
- `modules/forecast_risk.py` - Módulo principal de análise (230 linhas)
- `modules/README.md` - Documentação técnica detalhada (8.5 KB)

### Interface e Dados (3 arquivos)
- `decision_core.py` - Interface CLI interativa com menu (150 linhas)
- `relatorio_fmea_atual.json` - Dados de exemplo FMEA (8 sistemas críticos)
- `asog_report.json` - Dados de exemplo ASOG (4 parâmetros operacionais)

### Documentação Abrangente (4 arquivos - ~45 KB total)
- `PYTHON_MODULES_README.md` - Guia completo do sistema (este arquivo)
- `FORECAST_RISK_IMPLEMENTATION_SUMMARY.md` - Resumo da implementação
- `FORECAST_QUICKREF.md` - Referência rápida
- `IMPLEMENTATION_COMPLETE_FORECAST_RISK.md` - Sumário executivo

### Saída Gerada
- `forecast_risco.json` - Relatório JSON com resultados da análise

---

## ✨ Funcionalidades

### 1. Análise FMEA (Failure Mode and Effects Analysis)
- ✅ Carregamento de dados históricos de análise de falhas
- ✅ Cálculo de RPN médio (Risk Priority Number = Severidade × Ocorrência × Detecção)
- ✅ Cálculo de variabilidade estatística (desvio padrão)
- ✅ Classificação automática de risco em 3 níveis:
  - 🔴 **ALTA** (RPN > 200): Requer ação imediata
  - 🟡 **MODERADA** (150-200): Intensificar monitoramento
  - 🟢 **BAIXA** (≤150): Operação normal

### 2. Avaliação ASOG (Assurance of Operational Compliance)
- ✅ Verificação de conformidade operacional
- ✅ Status: conforme / fora dos limites / sem dados
- ✅ Integração com análise FMEA para decisão final

### 3. Geração de Relatórios
- ✅ Formato JSON estruturado com timestamp ISO 8601
- ✅ Métricas consolidadas: RPN médio, variabilidade, status
- ✅ Recomendações automáticas contextuais

### 4. Sistema de Logging
- ✅ Eventos com timestamp para auditoria
- ✅ Rastreabilidade completa de todas as operações
- ✅ Formato: `[YYYY-MM-DD HH:MM:SS] mensagem`

---

## 🚀 Como Usar

### Opção 1: Menu Interativo (Recomendado)

```bash
python3 decision_core.py
```

Menu disponível:
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

Selecione a opção **2** para executar o forecast.

### Opção 2: Execução Direta

```bash
python3 -c "from modules.forecast_risk import RiskForecast; RiskForecast().analyze()"
```

### Opção 3: Uso Programático

```python
from modules.forecast_risk import RiskForecast

# Criar instância
forecast = RiskForecast()

# Gerar previsão
resultado = forecast.gerar_previsao()

# Usar resultados
print(f"Risco: {resultado['risco_previsto']}")
print(f"RPN médio: {resultado['rpn_medio']}")
print(f"Variabilidade: {resultado['variabilidade']}")
print(f"Status ASOG: {resultado['status_operacional']}")
print(f"Recomendação: {resultado['recomendacao']}")

# Salvar relatório
forecast.salvar_relatorio(resultado)
```

### Opção 4: Módulo Standalone

```bash
python3 modules/forecast_risk.py
```

---

## 📊 Exemplo de Saída

```
🔮 Iniciando análise preditiva de risco...
[2025-10-20 11:25:48] Carregando dados históricos FMEA/ASOG...
[2025-10-20 11:25:48] Calculando tendência de RPN...
[2025-10-20 11:25:48] Gerando relatório preditivo...
[2025-10-20 11:25:48] Forecast de risco gerado com sucesso.

📊 Forecast de Risco salvo como: forecast_risco.json

📈 Tendência de risco: BAIXA
RPN médio: 73.50 | Variabilidade: 28.84
Status ASOG: conforme
Recomendação: 🟢 Operação dentro dos padrões. Manter rotina de monitoramento.
```

**Relatório JSON gerado (`forecast_risco.json`):**

```json
{
  "timestamp": "2025-10-20T11:25:48.316921",
  "risco_previsto": "BAIXA",
  "rpn_medio": 73.50,
  "variabilidade": 28.84,
  "status_operacional": "conforme",
  "recomendacao": "🟢 Operação dentro dos padrões. Manter rotina de monitoramento."
}
```

---

## 🎯 Destaques Técnicos

### ✅ Zero Dependências Externas
Utiliza **somente Python standard library**:
- `json` - Manipulação de arquivos JSON
- `statistics` - Cálculos estatísticos (média, desvio padrão)
- `datetime` - Timestamps ISO 8601

### ✅ Performance
- Execução instantânea (<1s)
- Processamento em memória
- Sem operações de rede ou I/O intensivo

### ✅ Portabilidade
- Python 3.6+ em qualquer plataforma (Linux, macOS, Windows)
- Codificação UTF-8 para suporte internacional
- Paths relativos para máxima portabilidade

### ✅ Confiabilidade
- Tratamento robusto de erros
- Validação de dados em cada etapa
- Valores padrão para dados ausentes
- Logging para auditoria

### ✅ Manutenibilidade
- Código limpo e bem documentado
- Docstrings em todos os métodos
- Nomenclatura clara e consistente
- Separação de responsabilidades

### ✅ Extensibilidade
- Arquitetura modular
- Fácil adição de novos métodos
- Pronto para integração com APIs
- Suporte para ML/IA futuro

---

## 🔗 Integração Futura

O módulo está pronto para integração via:

### ✅ Implementado
- Execução standalone (CLI)
- API programática (import)
- Geração de relatórios JSON

### 🔜 Roadmap
- **REST API endpoints** (FastAPI/Flask)
- **Cron jobs** para análises periódicas
- **Alertas automáticos** por email (Resend)
- **Dashboard web** com visualizações
- **Machine Learning** para previsões avançadas
- **Banco de dados** para histórico de forecasts
- **WebSockets** para atualizações em tempo real

---

## 📝 Dados de Exemplo Incluídos

### FMEA - 8 Sistemas Marítimos Críticos
1. Sistema de Propulsão Principal (RPN: 108)
2. Sistema de Posicionamento Dinâmico (RPN: 40)
3. Sistema de Geração de Energia (RPN: 80)
4. Sistema de Controle de Lastro (RPN: 84)
5. Sistema de Navegação (RPN: 48)
6. Sistema de Comunicação (RPN: 36)
7. Sistema Hidráulico de Convés (RPN: 108)
8. Sistema de Ancoragem (RPN: 84)

**RPN Médio:** 73.5  
**Classificação:** BAIXA (operação normal)

### ASOG - 4 Parâmetros Operacionais
1. Posicionamento Dinâmico - Disponibilidade: 99.2% (≥98%)
2. Redundância de Sistemas Críticos: 100% (≥100%)
3. Tripulação Certificada DP: 95% (≥90%)
4. Horas de Operação sem Incidentes: 2450h (≥2000h)

**Status:** CONFORME (todos os parâmetros dentro dos limites)

---

## 📚 Estrutura de Arquivos

```
nautilus-one/
│
├── core/                           # Pacote core
│   ├── __init__.py                 # Inicializador
│   └── logger.py                   # Sistema de logging
│
├── modules/                        # Pacote modules
│   ├── __init__.py                 # Inicializador
│   ├── forecast_risk.py            # Módulo principal (230 linhas)
│   └── README.md                   # Documentação técnica
│
├── relatorio_fmea_atual.json       # Dados FMEA (2.5 KB)
├── asog_report.json                # Dados ASOG (1 KB)
├── decision_core.py                # Interface CLI (150 linhas)
├── forecast_risco.json             # Saída gerada (relatório)
│
└── docs/                           # Documentação
    ├── PYTHON_MODULES_README.md    # Este arquivo
    ├── FORECAST_RISK_IMPLEMENTATION_SUMMARY.md
    ├── FORECAST_QUICKREF.md
    └── IMPLEMENTATION_COMPLETE_FORECAST_RISK.md
```

---

## 🧪 Testes e Validação

### Testes Funcionais Realizados ✅

1. ✅ **Importação de módulos** - Core e modules importam corretamente
2. ✅ **Carregamento de dados** - FMEA e ASOG carregam sem erros
3. ✅ **Cálculo de RPN médio** - Média calculada corretamente (73.5)
4. ✅ **Cálculo de variabilidade** - Desvio padrão correto (28.84)
5. ✅ **Classificação de risco** - Lógica ALTA/MODERADA/BAIXA funciona
6. ✅ **Verificação ASOG** - Status conforme/não conforme detectado
7. ✅ **Geração de relatório** - JSON válido com todos os campos

### Testes de Casos Extremos ✅

8. ✅ **Arquivo FMEA ausente** - Retorna erro estruturado
9. ✅ **JSON inválido** - Captura e registra erro
10. ✅ **Dados vazios** - Retorna valores padrão (0)
11. ✅ **Lista vazia** - Não causa divisão por zero

### Testes de Cenários ✅

12. ✅ **Risco ALTO** - RPN > 200 detectado e recomendação correta
13. ✅ **Risco MODERADO** - 150 < RPN ≤ 200 classificado corretamente
14. ✅ **Risco BAIXO** - RPN ≤ 150 com recomendação apropriada
15. ✅ **ASOG não conforme** - Alerta gerado quando fora dos limites

**Total de testes:** 15/15 aprovados ✅

---

## 🔧 Requisitos do Sistema

### Mínimos
- **Python:** 3.6 ou superior
- **SO:** Linux, macOS ou Windows
- **RAM:** 64 MB (processamento leve)
- **Disco:** 50 KB (código + dados)

### Recomendados
- **Python:** 3.9 ou superior
- **RAM:** 128 MB+
- **Disco:** 1 MB+ (para histórico de forecasts)

---

## 🚀 Quick Start

```bash
# 1. Verificar versão do Python
python3 --version  # Deve ser 3.6+

# 2. Navegar para o diretório do projeto
cd /caminho/para/nautilus-one

# 3. Executar o módulo
python3 decision_core.py

# 4. Selecionar opção 2 (Executar Forecast)

# 5. Ver relatório gerado
cat forecast_risco.json
```

---

## 📞 Suporte e Documentação

- **Guia Completo:** Este arquivo (PYTHON_MODULES_README.md)
- **Referência Rápida:** [FORECAST_QUICKREF.md](FORECAST_QUICKREF.md)
- **Documentação Técnica:** [modules/README.md](modules/README.md)
- **Sumário Executivo:** [IMPLEMENTATION_COMPLETE_FORECAST_RISK.md](IMPLEMENTATION_COMPLETE_FORECAST_RISK.md)
- **Resumo da Implementação:** [FORECAST_RISK_IMPLEMENTATION_SUMMARY.md](FORECAST_RISK_IMPLEMENTATION_SUMMARY.md)

---

## 📄 Licença

MIT License © 2025 Nautilus One Team

---

## ℹ️ Informações da Versão

- **Versão:** 1.0.0
- **Status:** ✅ Pronto para produção
- **Data de Release:** 2025-10-20
- **Compatibilidade:** Python 3.6+
- **Última Atualização:** 2025-10-20

---

**🔱 Nautilus One - Sistema de Análise de Risco Operacional**
