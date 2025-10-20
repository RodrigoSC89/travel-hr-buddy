# Módulo Forecast de Risco - Documentação Técnica

## 📋 Visão Geral

O módulo `forecast_risk.py` implementa um sistema de análise preditiva de risco operacional para operações marítimas e offshore, utilizando dados históricos de FMEA (Failure Mode and Effects Analysis) e ASOG (Assurance of Operational Compliance).

**Versão:** 1.0.0  
**Compatibilidade:** Python 3.6+  
**Dependências:** Apenas bibliotecas padrão do Python (json, statistics, datetime)

---

## 🏗️ Arquitetura

```
nautilus-one/
├── core/
│   ├── __init__.py          # Inicializador do pacote core
│   └── logger.py            # Sistema de logging com timestamps
├── modules/
│   ├── __init__.py          # Inicializador do pacote modules
│   └── forecast_risk.py     # Módulo principal de análise
├── relatorio_fmea_atual.json  # Dados FMEA de exemplo
├── asog_report.json           # Dados ASOG de exemplo
└── decision_core.py           # Interface CLI interativa
```

---

## 🔧 Classe RiskForecast

### Inicialização

```python
from modules.forecast_risk import RiskForecast

forecast = RiskForecast(
    fmea_file="relatorio_fmea_atual.json",  # Opcional
    asog_file="asog_report.json"            # Opcional
)
```

### Métodos Principais

#### `carregar_dados()`
Carrega dados históricos FMEA e ASOG dos arquivos JSON.

**Retorno:** `bool` - True se carregamento bem-sucedido

**Exemplo:**
```python
if forecast.carregar_dados():
    print("Dados carregados com sucesso")
```

#### `calcular_rpn_medio()`
Calcula o RPN (Risk Priority Number) médio de todos os sistemas analisados.

**Fórmula RPN:** Severidade × Ocorrência × Detecção

**Retorno:** `float` - RPN médio ou 0 se não houver dados

**Exemplo:**
```python
rpn_medio = forecast.calcular_rpn_medio()
print(f"RPN médio: {rpn_medio}")
```

#### `calcular_variabilidade()`
Calcula o desvio padrão dos valores RPN para medir variabilidade estatística.

**Retorno:** `float` - Desvio padrão ou 0 se dados insuficientes

**Exemplo:**
```python
variabilidade = forecast.calcular_variabilidade()
print(f"Desvio padrão: {variabilidade}")
```

#### `classificar_risco(rpn_medio)`
Classifica o nível de risco com base no RPN médio.

**Critérios de Classificação:**
- **ALTA**: RPN > 200 → Requer ação imediata
- **MODERADA**: 150 < RPN ≤ 200 → Intensificar monitoramento
- **BAIXA**: RPN ≤ 150 → Operação normal

**Parâmetros:**
- `rpn_medio` (float): Valor do RPN médio

**Retorno:** `str` - Nível de risco ("ALTA", "MODERADA" ou "BAIXA")

**Exemplo:**
```python
risco = forecast.classificar_risco(85.75)
print(f"Risco: {risco}")  # Output: BAIXA
```

#### `verificar_status_asog()`
Verifica o status de conformidade operacional ASOG.

**Retorno:** `str` - Status ("conforme", "fora dos limites", "sem dados")

**Exemplo:**
```python
status = forecast.verificar_status_asog()
print(f"Status ASOG: {status}")
```

#### `gerar_recomendacao(risco, status_asog)`
Gera recomendação automática contextual baseada no risco e status ASOG.

**Parâmetros:**
- `risco` (str): Nível de risco
- `status_asog` (str): Status ASOG

**Retorno:** `str` - Recomendação contextual

**Exemplo:**
```python
recomendacao = forecast.gerar_recomendacao("BAIXA", "conforme")
print(recomendacao)
```

#### `gerar_previsao()`
Gera forecast completo de risco com todas as métricas.

**Retorno:** `dict` - Relatório completo com:
- `timestamp`: Timestamp ISO 8601
- `risco_previsto`: Nível de risco
- `rpn_medio`: RPN médio calculado
- `variabilidade`: Desvio padrão
- `status_operacional`: Status ASOG
- `recomendacao`: Recomendação automática

**Exemplo:**
```python
resultado = forecast.gerar_previsao()
print(f"Risco: {resultado['risco_previsto']}")
print(f"RPN médio: {resultado['rpn_medio']}")
```

#### `salvar_relatorio(relatorio, arquivo_saida)`
Salva o relatório de forecast em arquivo JSON.

**Parâmetros:**
- `relatorio` (dict): Dados do relatório
- `arquivo_saida` (str): Nome do arquivo (default: "forecast_risco.json")

**Retorno:** `bool` - True se salvamento bem-sucedido

**Exemplo:**
```python
resultado = forecast.gerar_previsao()
forecast.salvar_relatorio(resultado, "meu_forecast.json")
```

#### `analyze()`
Executa análise completa e exibe resultados no console.  
Método de conveniência para execução standalone.

**Exemplo:**
```python
forecast.analyze()
```

---

## 📊 Formato dos Dados

### FMEA (relatorio_fmea_atual.json)

```json
{
  "sistema": "Análise FMEA - Sistemas Críticos Marítimos",
  "data_analise": "2025-10-20",
  "sistemas_analisados": [
    {
      "id": 1,
      "nome": "Sistema de Propulsão Principal",
      "falha_modo": "Perda de potência do motor principal",
      "severidade": 9,
      "ocorrencia": 4,
      "deteccao": 3,
      "rpn": 108,
      "acoes_recomendadas": "Manutenção preventiva trimestral..."
    }
  ]
}
```

### ASOG (asog_report.json)

```json
{
  "relatorio": "ASOG - Assurance of Operational Compliance",
  "data_verificacao": "2025-10-20",
  "embarcacao": "PSV Nautilus One",
  "parametros_operacionais": [
    {
      "parametro": "Posicionamento Dinâmico - Disponibilidade",
      "valor_atual": 99.2,
      "limite_minimo": 98.0,
      "unidade": "%",
      "status": "conforme"
    }
  ]
}
```

---

## 🚀 Modos de Uso

### 1. Execução Direta do Módulo

```bash
python3 modules/forecast_risk.py
```

### 2. Interface CLI Interativa

```bash
python3 decision_core.py
```

Menu com opções:
1. Visualizar dados FMEA
2. Executar Forecast de Risco Preditivo
3. Verificar Status ASOG
4. Gerar Relatório Completo

### 3. Uso Programático

```python
from modules.forecast_risk import RiskForecast

# Criar instância
forecast = RiskForecast()

# Gerar previsão
resultado = forecast.gerar_previsao()

# Usar resultados
print(f"Risco: {resultado['risco_previsto']}")
print(f"RPN médio: {resultado['rpn_medio']}")
print(f"Recomendação: {resultado['recomendacao']}")

# Salvar relatório
forecast.salvar_relatorio(resultado)
```

### 4. One-liner

```bash
python3 -c "from modules.forecast_risk import RiskForecast; RiskForecast().analyze()"
```

---

## 📈 Exemplo de Saída

```
🔮 Iniciando análise preditiva de risco...
[2025-10-20 11:25:48] Carregando dados históricos FMEA/ASOG...
[2025-10-20 11:25:48] Calculando tendência de RPN...
[2025-10-20 11:25:48] Gerando relatório preditivo...
[2025-10-20 11:25:48] Forecast de risco gerado com sucesso.

📊 Forecast de Risco salvo como: forecast_risco.json

📈 Tendência de risco: BAIXA
RPN médio: 85.75 | Variabilidade: 30.55
Status ASOG: conforme
Recomendação: 🟢 Operação dentro dos padrões. Manter rotina de monitoramento.
```

**Relatório JSON gerado:**

```json
{
  "timestamp": "2025-10-20T11:25:48.316921",
  "risco_previsto": "BAIXA",
  "rpn_medio": 85.75,
  "variabilidade": 30.55,
  "status_operacional": "conforme",
  "recomendacao": "🟢 Operação dentro dos padrões. Manter rotina de monitoramento."
}
```

---

## 🧪 Tratamento de Erros

O módulo possui tratamento robusto para:

- **Arquivos ausentes**: Retorna erro estruturado
- **JSON inválido**: Captura e registra no log
- **Dados vazios**: Retorna valores padrão (0 ou "sem dados")
- **Divisão por zero**: Protegido com verificações de lista vazia
- **Dados incompletos**: Valida estrutura antes de processar

---

## 🔒 Segurança e Confiabilidade

- ✅ Zero dependências externas (somente stdlib)
- ✅ Validação de dados em cada etapa
- ✅ Logging com timestamps para auditoria
- ✅ Tratamento de exceções em todas as operações críticas
- ✅ Isolamento de erros (falhas não propagam)

---

## 📝 Notas Técnicas

### Performance
- Execução instantânea (<1s)
- Processamento em memória
- Não utiliza recursos de rede ou disco intensivos

### Portabilidade
- Python 3.6+ em qualquer plataforma (Linux, macOS, Windows)
- Codificação UTF-8 para suporte internacional
- Paths relativos para máxima portabilidade

### Extensibilidade
Arquitetura modular permite fácil adição de:
- Novos métodos de cálculo
- Algoritmos de ML/IA
- Integração com APIs externas
- Dashboards web
- Alertas automatizados

---

## 🔗 Integração Futura

O módulo está preparado para:

- ✅ **REST API endpoints** (FastAPI/Flask)
- ✅ **Cron jobs** para análises periódicas
- ✅ **Email/SMS alerts** via Resend/Twilio
- ✅ **Dashboard web** com visualizações
- ✅ **Machine Learning** para previsões avançadas
- ✅ **Banco de dados** para histórico de forecasts

---

## 📞 Suporte

Para questões técnicas, consulte:
- [PYTHON_MODULES_README.md](PYTHON_MODULES_README.md) - Guia completo
- [FORECAST_QUICKREF.md](FORECAST_QUICKREF.md) - Referência rápida

**Versão:** 1.0.0  
**Status:** ✅ Pronto para produção  
**Licença:** MIT
