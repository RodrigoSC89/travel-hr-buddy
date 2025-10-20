# Módulo Forecast de Risco - Sistema Nautilus One

## 📋 Descrição

O módulo `forecast_risk.py` realiza análise preditiva de risco operacional em operações marítimas e offshore, baseado em dados históricos de:

- **FMEA** (Failure Mode and Effects Analysis)
- **ASOG** (Assurance of Operational Compliance)

## 🎯 Funcionalidades

### 1. Análise FMEA
- Carregamento de dados históricos de análise de falhas
- Cálculo de RPN médio (Risk Priority Number = Severidade × Ocorrência × Detecção)
- Cálculo de variabilidade estatística (desvio padrão)
- Classificação automática de risco em 3 níveis:
  - 🔴 **ALTA** (RPN > 200): Requer ação imediata
  - 🟡 **MODERADA** (150-200): Intensificar monitoramento
  - 🟢 **BAIXA** (≤150): Operação normal

### 2. Avaliação ASOG
- Verificação de conformidade operacional
- Status: conforme / fora dos limites / sem dados
- Integração com análise FMEA para decisão final

### 3. Geração de Relatórios
- Formato JSON estruturado com timestamp ISO 8601
- Métricas consolidadas: RPN médio, variabilidade, status
- Recomendações automáticas contextuais

### 4. Sistema de Logging
- Eventos com timestamp `[YYYY-MM-DD HH:MM:SS]`
- Rastreabilidade completa para auditoria

## 🚀 Como Usar

### Opção 1: Menu Interativo
```bash
python3 decision_core.py
# Selecione opção 2 no menu
```

### Opção 2: Execução Direta
```bash
python3 -c "from modules.forecast_risk import RiskForecast; RiskForecast().analyze()"
```

### Opção 3: Uso Programático
```python
from modules.forecast_risk import RiskForecast

forecast = RiskForecast()
resultado = forecast.gerar_previsao()
print(f"Risco: {resultado['risco_previsto']}")
print(f"RPN médio: {resultado['rpn_medio']}")
```

## 📊 Exemplo de Saída

```
🔮 Iniciando análise preditiva de risco...
[2025-10-20 01:25:48] Carregando dados históricos FMEA/ASOG...
[2025-10-20 01:25:48] Calculando tendência de RPN...
[2025-10-20 01:25:48] Gerando relatório preditivo...
[2025-10-20 01:25:48] Forecast de risco gerado com sucesso.
📊 Forecast de Risco salvo como: forecast_risco.json

📈 Tendência de risco: BAIXA
RPN médio: 102 | Variabilidade: 38.78
Status ASOG: conforme
Recomendação: 🟢 Operação dentro dos padrões. Manter rotina de monitoramento.
```

### Relatório JSON Gerado (forecast_risco.json)
```json
{
    "timestamp": "2025-10-20T01:25:48.316921",
    "risco_previsto": "BAIXA",
    "rpn_medio": 102,
    "variabilidade": 38.78,
    "status_operacional": "conforme",
    "recomendacao": "🟢 Operação dentro dos padrões. Manter rotina de monitoramento."
}
```

## 🏗️ Arquitetura

### Estrutura de Arquivos
```
.
├── core/
│   ├── __init__.py
│   └── logger.py                    # Sistema de logging com timestamps
├── modules/
│   ├── __init__.py
│   ├── forecast_risk.py             # Módulo principal de análise
│   └── README.md                    # Esta documentação
├── decision_core.py                 # Interface interativa com menu
├── relatorio_fmea_atual.json        # Dados de exemplo FMEA (8 sistemas)
└── asog_report.json                 # Dados de exemplo ASOG
```

### Classe RiskForecast

#### Métodos Principais

**`__init__()`**
- Inicializa os caminhos dos arquivos de entrada e saída

**`carregar_dados()`**
- Carrega dados históricos FMEA e ASOG
- Trata ausência de arquivos gracefully

**`calcular_tendencias(fmea)`**
- Calcula RPN médio e desvio padrão
- Classifica risco em ALTA/MODERADA/BAIXA

**`avaliar_conformidade_asog(asog)`**
- Avalia status de conformidade operacional
- Retorna: conforme / fora dos limites / sem dados

**`gerar_previsao()`**
- Gera relatório completo em JSON
- Retorna objeto Python com resultados

**`recomendar_acao(tendencia, status_asog)`**
- Gera recomendações contextuais baseadas no risco

**`analyze()`**
- Interface de alto nível para análise completa
- Exibe resultados formatados no console

## 📁 Dados de Entrada

### relatorio_fmea_atual.json
Estrutura esperada:
```json
[
    {
        "sistema": "Nome do Sistema",
        "modo_falha": "Descrição da Falha",
        "Severidade": 1-10,
        "Ocorrencia": 1-10,
        "Deteccao": 1-10,
        "RPN": Severidade × Ocorrência × Detecção
    }
]
```

### asog_report.json
Estrutura esperada:
```json
{
    "timestamp": "ISO-8601 timestamp",
    "resultado": {
        "conformidade": true/false,
        "parametros": {
            "posicao_dp": "status",
            "redundancia_sensores": "status",
            "backup_energia": "status",
            "comunicacao": "status"
        }
    },
    "recomendacoes": ["recomendação 1", "recomendação 2"]
}
```

## 🔧 Requisitos

- **Python**: 3.6+
- **Dependências**: Apenas biblioteca padrão Python
  - `json`
  - `statistics`
  - `datetime`

## 🧪 Testes

### Testes Funcionais
1. ✅ Importação do módulo
2. ✅ Carregamento de dados FMEA
3. ✅ Carregamento de dados ASOG
4. ✅ Cálculo de RPN médio
5. ✅ Cálculo de variabilidade
6. ✅ Classificação de risco
7. ✅ Geração de relatório JSON

### Testes de Casos Extremos
1. ✅ Arquivos ausentes
2. ✅ Dados vazios
3. ✅ JSON inválido
4. ✅ Valores extremos de RPN

### Testes de Cenários
1. ✅ Risco ALTO (RPN > 200)
2. ✅ Risco MODERADO (150 < RPN ≤ 200)
3. ✅ Risco BAIXO (RPN ≤ 150)
4. ✅ ASOG não-conforme

## 🔗 Integração

### Implementado
- ✅ Execução standalone
- ✅ API programática
- ✅ Menu interativo (decision_core.py)

### Futuro
- 🔜 REST API endpoints
- 🔜 Cron jobs para análises periódicas
- 🔜 Alertas automáticos por email
- 🔜 Dashboard web integrado

## 📝 Notas Técnicas

### Performance
- Execução instantânea (<1s)
- Sem dependências externas
- Footprint mínimo de memória

### Portabilidade
- Python 3.6+ em qualquer plataforma
- Zero configuração necessária
- Arquivos de dados no mesmo diretório

### Confiabilidade
- Tratamento robusto de erros
- Logging completo de operações
- Validação de dados de entrada

### Manutenibilidade
- Código limpo e bem documentado
- Docstrings em todos os métodos
- Separação clara de responsabilidades

### Extensibilidade
- Arquitetura modular
- Fácil adição de novos tipos de análise
- Configuração via atributos da classe

## 📚 Referências

- **FMEA**: Análise de Modos e Efeitos de Falha
- **ASOG**: Assurance of Operational Compliance
- **RPN**: Risk Priority Number (Número de Prioridade de Risco)
- **DP**: Dynamic Positioning (Posicionamento Dinâmico)

## 🆘 Troubleshooting

### Erro: Arquivo não encontrado
- Verifique se `relatorio_fmea_atual.json` e `asog_report.json` estão no diretório correto
- O módulo funciona sem os arquivos, retornando dados padrão

### Erro: Módulo não encontrado
- Execute o script do diretório raiz do projeto
- Verifique se a estrutura de diretórios está correta

### Erro: JSON inválido
- Valide o formato dos arquivos JSON
- Use um validador JSON online se necessário

## 📄 Licença

Parte do Sistema Nautilus One - Todos os direitos reservados

## ✍️ Autor

Sistema Nautilus One - Módulo Python v1.0.0

## 📅 Versão

**v1.0.0** - 2025-10-20
- Implementação inicial
- Análise FMEA completa
- Integração ASOG
- Sistema de logging
- Documentação completa
