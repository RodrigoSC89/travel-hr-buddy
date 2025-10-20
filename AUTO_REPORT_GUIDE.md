# 🧾 Auto-Report Module - Quick Start Guide

## Visão Geral

O módulo Auto-Report é um sistema de consolidação de relatórios técnicos que integra dados de três fontes críticas:

- 📊 **FMEA** (Failure Mode and Effects Analysis)
- 🔍 **ASOG** (Analysis of Safety and Operational Guidelines)
- 📈 **Forecast de Risco** (Risk Forecast)

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Sistema Nautilus One                     │
│                      Auto-Report Module                      │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ relatorio_   │  │ asog_report  │  │ forecast_    │
    │ fmea_atual   │  │   .json      │  │ risco.json   │
    │   .json      │  │              │  │              │
    └──────────────┘  └──────────────┘  └──────────────┘
            │                 │                 │
            └─────────────────┼─────────────────┘
                              ▼
                    ┌──────────────────┐
                    │   AutoReport     │
                    │   .consolidar()  │
                    └──────────────────┘
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
          ┌──────────────────┐  ┌──────────────────┐
          │ nautilus_full_   │  │ Nautilus_Tech_   │
          │ report.json      │  │ Report.pdf       │
          └──────────────────┘  └──────────────────┘
```

## Instalação Rápida

### 1. Instalar Dependências

```bash
pip install -r requirements.txt
```

### 2. Preparar Dados de Entrada

Crie os arquivos JSON no diretório raiz:

**relatorio_fmea_atual.json**
```json
{
  "tipo": "FMEA - Failure Mode and Effects Analysis",
  "data_geracao": "2025-10-20",
  "falhas_identificadas": 12,
  "falhas_criticas": 3
}
```

**asog_report.json**
```json
{
  "tipo": "ASOG - Analysis of Safety and Operational Guidelines",
  "status_geral": "CONFORME COM RESTRIÇÕES",
  "conformidade_percentual": 87.5
}
```

**forecast_risco.json**
```json
{
  "tipo": "Forecast de Risco",
  "nivel_risco_geral": "MÉDIO",
  "score_risco": 6.2
}
```

## Uso

### Opção 1: Menu Interativo

```bash
python main.py
```

Selecione a opção `5` para gerar o relatório consolidado.

### Opção 2: Execução Direta

```bash
python -c "from modules.auto_report import AutoReport; AutoReport().run()"
```

### Opção 3: Script Python

```python
from modules.auto_report import AutoReport

# Criar instância
report = AutoReport()

# Gerar relatório completo
report.run()

# Ou executar passo a passo
consolidado = report.consolidar()
report.exportar_pdf(consolidado)
```

### Opção 4: Teste Automatizado

```bash
python test_auto_report.py
```

## Saída do Sistema

### Console Output

```
🧾 Gerando Auto-Report consolidado...
[2025-10-20 01:11:57] Consolidando dados para Auto-Report...
[2025-10-20 01:11:57] Assinatura digital gerada: NAUTILUS-IA-SIGN-20251020011157
[2025-10-20 01:11:57] Auto-Report consolidado em JSON.
[2025-10-20 01:11:57] Gerando PDF técnico completo...
📄 PDF exportado: Nautilus_Tech_Report.pdf
[2025-10-20 01:11:57] PDF técnico final exportado com sucesso.
📘 Relatório completo gerado: Nautilus_Tech_Report.pdf
✅ Relatório técnico do Nautilus One finalizado com sucesso.
```

### Arquivos Gerados

1. **nautilus_full_report.json** - Relatório consolidado em JSON
   - Timestamp de geração
   - Dados FMEA, ASOG e Forecast
   - Assinatura digital IA

2. **Nautilus_Tech_Report.pdf** - Relatório técnico em PDF
   - Formatação profissional
   - Seções organizadas
   - Assinatura digital embarcada

## Menu Principal (main.py)

```
============================================================
🚢 SISTEMA NAUTILUS ONE - DECISION CORE
============================================================
1. 📊 Módulo FMEA
2. 🔍 Módulo ASOG
3. 📈 Módulo Forecast de Risco
4. 🔄 Sincronizar Dados
5. 🧾 Gerar Relatório Técnico Consolidado (Auto-Report)
0. ❌ Sair
============================================================
```

## Estrutura do Código

### AutoReport Class

```python
class AutoReport:
    def __init__(self):
        # Configuração de arquivos
        
    def carregar_dados(self):
        # Carrega JSONs com safe_load
        
    def consolidar(self):
        # Consolida dados + assinatura IA
        
    def gerar_assinatura(self):
        # Gera assinatura digital timestamped
        
    def exportar_pdf(self, consolidado):
        # Gera PDF técnico
        
    def run(self):
        # Executa pipeline completo
```

## Assinatura Digital IA

Cada relatório inclui uma assinatura única:

```
NAUTILUS-IA-SIGN-20251020011157
                └─────────────┘
                  Timestamp UTC
```

Formato: `NAUTILUS-IA-SIGN-YYYYMMDDHHMMSS`

## Tratamento de Erros

O sistema é robusto e lida com:

✅ Arquivos JSON ausentes (retorna "Sem dados disponíveis")  
✅ JSONs malformados (tratamento de exceção)  
✅ Erros de escrita (relatado no log)  
✅ Erros de PDF (reportlab exception handling)

## Integração com Frontend TypeScript

### Opção 1: API REST (Futuro)

```typescript
// Chamar via API
const response = await fetch('/api/auto-report/generate', {
  method: 'POST'
});
const report = await response.json();
```

### Opção 2: Cron Job

```bash
# Cron diário às 6h
0 6 * * * cd /path/to/app && python3 -c "from modules.auto_report import AutoReport; AutoReport().run()"
```

### Opção 3: Node.js Child Process

```javascript
const { exec } = require('child_process');

exec('python3 -c "from modules.auto_report import AutoReport; AutoReport().run()"', 
  (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error}`);
      return;
    }
    console.log(`Output: ${stdout}`);
  }
);
```

## Personalização

### Customizar Arquivos de Entrada

```python
report = AutoReport()
report.fmea_file = "custom_fmea.json"
report.asog_file = "custom_asog.json"
report.forecast_file = "custom_forecast.json"
report.run()
```

### Customizar Saída

```python
report = AutoReport()
report.output_json = "relatorio_customizado.json"
report.output_pdf = "Relatorio_Personalizado.pdf"
report.run()
```

## Troubleshooting

### Erro: "Arquivo não encontrado"

✅ Verifique se os arquivos JSON estão no diretório correto  
✅ Confirme os nomes dos arquivos (case-sensitive)

### Erro: "reportlab not found"

```bash
pip install reportlab
```

### PDF não gera

✅ Verifique permissões de escrita no diretório  
✅ Confirme que reportlab está instalado  
✅ Verifique logs para detalhes do erro

## Roadmap

- [ ] API REST Flask/FastAPI
- [ ] Validação de esquema JSON
- [ ] Autenticação e autorização
- [ ] Cache de relatórios
- [ ] Agendamento automático
- [ ] Envio por email
- [ ] Dashboard web
- [ ] Versionamento de relatórios
- [ ] Comparação entre relatórios
- [ ] Exportação para outros formatos (Excel, Word)

## Suporte

Para questões ou problemas, consulte:
- `PYTHON_BACKEND_README.md` - Documentação completa
- `test_auto_report.py` - Exemplos de uso
- Issues no GitHub

---

**Sistema Nautilus One** - Powered by Python & ReportLab
