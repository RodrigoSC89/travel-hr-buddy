# 🐍 Python Backend - Sistema Nautilus One

## Visão Geral

Este é o backend Python do Sistema Nautilus One, que fornece funcionalidades de consolidação de relatórios técnicos.

## Estrutura de Diretórios

```
.
├── core/                      # Módulos principais
│   ├── __init__.py
│   ├── logger.py             # Sistema de logging
│   └── pdf_exporter.py       # Exportação de PDF
├── modules/                   # Módulos funcionais
│   ├── __init__.py
│   └── auto_report.py        # Módulo Auto-Report
├── main.py                    # Ponto de entrada principal
└── requirements.txt           # Dependências Python
```

## Instalação

### Pré-requisitos

- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)

### Passos de Instalação

1. Instale as dependências Python:

```bash
pip install -r requirements.txt
```

## Uso

### Executar o Sistema

Para iniciar o Decision Core e acessar os módulos:

```bash
python main.py
```

### Menu Principal

O sistema apresentará um menu interativo com as seguintes opções:

1. 📊 Módulo FMEA (em desenvolvimento)
2. 🔍 Módulo ASOG (em desenvolvimento)
3. 📈 Módulo Forecast de Risco (em desenvolvimento)
4. 🔄 Sincronizar Dados (em desenvolvimento)
5. 🧾 Gerar Relatório Técnico Consolidado (Auto-Report) ✅
0. ❌ Sair

## Módulo Auto-Report

O módulo Auto-Report consolida dados de três fontes:

- **FMEA** (Failure Mode and Effects Analysis)
- **ASOG** (Analysis of Safety and Operational Guidelines)
- **Forecast de Risco** (Risk Forecast)

### Arquivos de Entrada Esperados

O módulo procura os seguintes arquivos JSON no diretório raiz:

- `relatorio_fmea_atual.json` - Dados do FMEA
- `asog_report.json` - Dados do ASOG
- `forecast_risco.json` - Dados de Forecast de Risco

### Arquivos de Saída

O módulo gera:

- `nautilus_full_report.json` - Relatório consolidado em JSON
- `Nautilus_Tech_Report.pdf` - Relatório técnico em PDF

### Exemplo de Uso Programático

```python
from modules.auto_report import AutoReport

# Criar instância do AutoReport
report = AutoReport()

# Gerar relatório completo
report.run()
```

## Módulos Core

### logger.py

Sistema de logging simples com timestamps.

```python
from core.logger import log_event

log_event("Mensagem de log")
```

### pdf_exporter.py

Exportador de PDF usando ReportLab.

```python
from core.pdf_exporter import export_report

data = [
    {"titulo": "Título do Relatório"},
    {"seção": "Seção 1", "dados": {"key": "value"}},
]

export_report(data, output_name="relatorio.pdf")
```

## Assinatura Digital IA

Cada relatório gerado inclui uma assinatura digital simbólica no formato:

```
NAUTILUS-IA-SIGN-YYYYMMDDHHMMSS
```

Esta assinatura garante rastreabilidade e autenticidade do relatório.

## Integração com Frontend TypeScript

Este backend Python pode ser integrado com o frontend TypeScript/React através de:

1. **API REST** - Criar endpoints Flask/FastAPI para expor funcionalidades
2. **Cron Jobs** - Executar geração de relatórios em intervalos programados
3. **CLI** - Executar via linha de comando e integrar com scripts Node.js

## Desenvolvimento Futuro

- [ ] Implementar módulos FMEA, ASOG e Forecast
- [ ] Adicionar API REST para integração com frontend
- [ ] Implementar autenticação e autorização
- [ ] Adicionar testes unitários
- [ ] Adicionar validação de dados de entrada
- [ ] Implementar cache de relatórios

## Suporte

Para questões ou suporte, entre em contato com a equipe de desenvolvimento.
