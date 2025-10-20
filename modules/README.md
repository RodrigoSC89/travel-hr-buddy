# 🔮 Módulo Forecast de Risco - Documentação Técnica

## Visão Geral

O módulo `forecast_risk.py` implementa análise preditiva de risco operacional para operações marítimas e offshore, integrando dados de FMEA (Failure Mode and Effects Analysis) e ASOG (Assurance of Operational Compliance).

## Arquitetura do Módulo

```
modules/
├── __init__.py          # Exporta RiskForecast
└── forecast_risk.py     # Módulo principal de análise
```

## Classe RiskForecast

### Inicialização

```python
from modules.forecast_risk import RiskForecast

# Usando arquivos padrão
forecast = RiskForecast()

# Especificando arquivos customizados
forecast = RiskForecast(
    fmea_file="meu_fmea.json",
    asog_file="meu_asog.json"
)
```

### Métodos Principais

#### 1. `carregar_dados_fmea() -> bool`
Carrega dados históricos de análise FMEA do arquivo JSON.

**Retorna:** `True` se bem-sucedido, `False` caso contrário

**Exemplo:**
```python
if forecast.carregar_dados_fmea():
    print(f"Carregados {len(forecast.fmea_data)} sistemas")
```

#### 2. `carregar_dados_asog() -> bool`
Carrega dados do relatório ASOG do arquivo JSON.

**Retorna:** `True` se bem-sucedido, `False` caso contrário

#### 3. `calcular_rpn(sistema: Dict) -> int`
Calcula o Risk Priority Number de um sistema.

**Fórmula:** RPN = Severidade × Ocorrência × Detecção

**Parâmetros:**
- `sistema`: Dicionário com chaves `severidade`, `ocorrencia`, `deteccao`

**Retorna:** Valor inteiro do RPN

**Exemplo:**
```python
sistema = {
    'severidade': 8,
    'ocorrencia': 3,
    'deteccao': 4
}
rpn = forecast.calcular_rpn(sistema)  # 96
```

#### 4. `calcular_tendencia_rpn() -> Dict[str, float]`
Calcula estatísticas de RPN para todos os sistemas carregados.

**Retorna:** Dicionário com:
- `rpn_medio`: Média aritmética dos RPNs
- `variabilidade`: Desvio padrão dos RPNs

**Exemplo:**
```python
tendencia = forecast.calcular_tendencia_rpn()
print(f"RPN médio: {tendencia['rpn_medio']}")
print(f"Variabilidade: {tendencia['variabilidade']}")
```

#### 5. `classificar_risco(rpn_medio: float) -> str`
Classifica o nível de risco baseado no RPN médio.

**Parâmetros:**
- `rpn_medio`: Valor do RPN médio

**Retorna:** Uma das classificações:
- `"ALTA"` - RPN > 200
- `"MODERADA"` - 150 < RPN ≤ 200
- `"BAIXA"` - RPN ≤ 150

**Exemplo:**
```python
risco = forecast.classificar_risco(180)  # "MODERADA"
```

#### 6. `avaliar_status_asog() -> str`
Avalia conformidade operacional baseada nos dados ASOG.

**Retorna:**
- `"conforme"` - Todos os parâmetros dentro dos limites
- `"fora dos limites"` - Pelo menos um parâmetro não-conforme
- `"sem dados"` - Dados ASOG não carregados

#### 7. `gerar_recomendacao(risco: str, status_asog: str) -> str`
Gera recomendação operacional contextual.

**Parâmetros:**
- `risco`: Classificação de risco ("ALTA", "MODERADA", "BAIXA")
- `status_asog`: Status de conformidade

**Retorna:** Mensagem de recomendação com emoji indicativo

#### 8. `gerar_previsao() -> Dict[str, Any]`
Executa análise completa e retorna previsão de risco.

**Retorna:** Dicionário com estrutura:
```python
{
    'timestamp': '2025-10-20T11:25:48.316921',
    'risco_previsto': 'BAIXA',
    'rpn_medio': 85.75,
    'variabilidade': 30.55,
    'status_operacional': 'conforme',
    'recomendacao': '🟢 Operação dentro dos padrões...'
}
```

**Exemplo:**
```python
resultado = forecast.gerar_previsao()
print(f"Risco: {resultado['risco_previsto']}")
```

#### 9. `salvar_relatorio(resultado: Dict, arquivo_saida: str) -> bool`
Salva o relatório de forecast em arquivo JSON.

**Parâmetros:**
- `resultado`: Dicionário retornado por `gerar_previsao()`
- `arquivo_saida`: Nome do arquivo (padrão: "forecast_risco.json")

**Retorna:** `True` se bem-sucedido, `False` caso contrário

#### 10. `analyze() -> None`
Método de conveniência que executa análise completa e exibe resultados no console.

**Exemplo:**
```python
forecast = RiskForecast()
forecast.analyze()
```

## Formato dos Dados de Entrada

### FMEA JSON (relatorio_fmea_atual.json)

```json
{
  "data_geracao": "2025-10-20T11:25:48.000Z",
  "embarcacao": "Nautilus One",
  "sistemas": [
    {
      "id": 1,
      "nome": "Sistema de Propulsão Principal",
      "modo_falha": "Perda de potência",
      "severidade": 8,
      "ocorrencia": 3,
      "deteccao": 4,
      "causa_potencial": "Falha no sistema de combustível",
      "controles_atuais": "Monitoramento contínuo"
    }
  ]
}
```

**Campos obrigatórios por sistema:**
- `severidade`: Escala 1-10 (gravidade do efeito da falha)
- `ocorrencia`: Escala 1-10 (probabilidade de ocorrência)
- `deteccao`: Escala 1-10 (dificuldade de detecção)

### ASOG JSON (asog_report.json)

```json
{
  "data_avaliacao": "2025-10-20T11:25:48.000Z",
  "embarcacao": "Nautilus One",
  "status_geral": "conforme",
  "parametros": [
    {
      "id": 1,
      "parametro": "Disponibilidade de Sistema DP",
      "valor_atual": 99.2,
      "valor_minimo": 95.0,
      "unidade": "%",
      "status": "conforme",
      "observacao": "Sistema operando dentro dos padrões"
    }
  ]
}
```

**Campos obrigatórios por parâmetro:**
- `status`: "conforme" ou outro valor para não-conforme

## Tratamento de Erros

O módulo implementa tratamento robusto de erros:

1. **Arquivos ausentes**: Registra warning e continua com dados vazios
2. **JSON inválido**: Registra erro e retorna `False` nos métodos de carregamento
3. **Dados vazios**: Retorna valores neutros (RPN médio = 0, variabilidade = 0)
4. **Exceções genéricas**: Capturadas e registradas via logger

## Logging

Todos os eventos são registrados via `core.logger`:

```python
from core.logger import log_info, log_error, log_warning

log_info("Operação bem-sucedida")
log_error("Falha na operação")
log_warning("Atenção necessária")
```

Formato do log: `[YYYY-MM-DD HH:MM:SS] Mensagem`

## Uso Programático

### Exemplo Completo

```python
from modules.forecast_risk import RiskForecast

# 1. Criar instância
forecast = RiskForecast()

# 2. Gerar previsão
resultado = forecast.gerar_previsao()

# 3. Acessar resultados
print(f"Risco Previsto: {resultado['risco_previsto']}")
print(f"RPN Médio: {resultado['rpn_medio']}")
print(f"Recomendação: {resultado['recomendacao']}")

# 4. Salvar relatório
forecast.salvar_relatorio(resultado, "meu_forecast.json")
```

### Integração em Pipeline

```python
# Pipeline automatizado
def analise_periodica():
    forecast = RiskForecast()
    resultado = forecast.gerar_previsao()
    
    # Enviar alerta se risco elevado
    if resultado['risco_previsto'] in ['ALTA', 'MODERADA']:
        enviar_alerta_equipe(resultado)
    
    # Salvar em banco de dados
    salvar_historico(resultado)
    
    return resultado
```

## Extensibilidade

O módulo foi projetado para fácil extensão:

### Adicionar Nova Classificação de Risco

```python
def classificar_risco(self, rpn_medio: float) -> str:
    if rpn_medio > 300:
        return "CRÍTICA"  # Nova classificação
    elif rpn_medio > 200:
        return "ALTA"
    # ... resto do código
```

### Adicionar Novos Cálculos

```python
def calcular_mtbf(self) -> float:
    """Calcula Mean Time Between Failures."""
    # Implementação customizada
    pass
```

### Integrar Outras Fontes de Dados

```python
def carregar_dados_inspeção(self, arquivo: str) -> bool:
    """Carrega dados de inspeções técnicas."""
    # Implementação customizada
    pass
```

## Performance

- **Execução:** < 1 segundo para análise completa
- **Memória:** Mínima (apenas dados JSON em memória)
- **I/O:** 2 leituras de arquivo + 1 escrita por análise

## Dependências

**Apenas biblioteca padrão Python:**
- `json` - Manipulação de JSON
- `statistics` - Cálculos estatísticos
- `datetime` - Timestamps
- `pathlib` - Manipulação de caminhos
- `typing` - Type hints

**Versão mínima:** Python 3.6+

## Compatibilidade

- ✅ Python 3.6+
- ✅ Windows, Linux, macOS
- ✅ Ambientes containerizados (Docker)
- ✅ Serverless (AWS Lambda, Google Cloud Functions)

## Boas Práticas

1. **Sempre verificar retorno dos métodos de carregamento**
   ```python
   if not forecast.carregar_dados_fmea():
       # Tratar erro apropriadamente
       pass
   ```

2. **Usar try-except em produção**
   ```python
   try:
       resultado = forecast.gerar_previsao()
   except Exception as e:
       log_error(f"Falha na análise: {e}")
   ```

3. **Validar dados de entrada**
   - Verificar estrutura JSON antes do carregamento
   - Validar ranges de valores (severidade, ocorrência, detecção: 1-10)

4. **Manter logs para auditoria**
   - Todos os eventos são automaticamente registrados
   - Usar logs para rastreabilidade e debugging

## Referências

- **FMEA:** ISO 31010, IMCA M 220
- **ASOG:** IMO Guidelines, IMCA
- **RPN Calculation:** IEC 60812

## Suporte

Para questões ou sugestões, consulte a documentação principal do projeto.
