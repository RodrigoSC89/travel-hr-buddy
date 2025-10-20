# 🧭 Nautilus One - Módulos Python

Sistema modular de operações marítimas para análise e auditoria de condições operacionais.

## 📦 Módulos Disponíveis

### ASOG Review Module
Módulo responsável por auditar as condições operacionais da embarcação e verificar aderência às diretrizes específicas de operação (ASOG - Annual Survey of Operational Guidelines).

**Características:**
- Coleta de parâmetros operacionais DP e ambientais
- Validação de conformidade com limites ASOG
- Geração de relatórios JSON detalhados
- Sistema de logging com timestamps

**Limites ASOG padrão:**
- Velocidade do vento máxima: 35 nós
- Tolerância de perda de thrusters: 1 unidade
- Nível de alerta DP: Green

## 🚀 Uso

### Uso Direto

```python
from modules.asog_review import ASOGModule

# Criar instância do módulo
module = ASOGModule()

# Executar verificação completa
module.start()
```

### Uso via Decision Core

```python
from modules.decision_core import DecisionCore

# Criar núcleo de decisão
core = DecisionCore()

# Listar módulos disponíveis
core.list_modules()

# Executar módulo ASOG Review
core.run_module('asog_review')
```

## 📄 Arquivos Gerados

- **nautilus_logs.txt**: Arquivo de log com timestamps de todas as operações
- **asog_report.json**: Relatório detalhado da última verificação ASOG

Exemplo de saída do log:
```
[2025-10-20 01:09:37] Coletando parâmetros operacionais DP e ambientais...
[2025-10-20 01:09:37] Dados coletados: {...}
[2025-10-20 01:09:37] Validando aderência ao ASOG...
[2025-10-20 01:09:37] Status: CONFORME ao ASOG ✅
[2025-10-20 01:09:37] Relatório ASOG gerado com sucesso.
```

## 🔧 Estrutura do Projeto

```
.
├── core/
│   ├── __init__.py
│   └── logger.py          # Sistema de logging centralizado
├── modules/
│   ├── __init__.py
│   ├── asog_review.py     # Módulo ASOG Review
│   ├── decision_core.py   # Núcleo de decisão do sistema
│   └── README.md          # Esta documentação
```

## 📊 Exemplo de Relatório JSON

```json
{
    "timestamp": "2025-10-20T01:09:37.157175",
    "dados_operacionais": {
        "wind_speed": 28,
        "thrusters_operacionais": 3,
        "dp_status": "Green",
        "timestamp": "2025-10-20T01:09:37.156919"
    },
    "resultado": {
        "conformidade": true,
        "alertas": []
    }
}
```

## ⚠️ Alertas de Não Conformidade

Quando os parâmetros operacionais excedem os limites ASOG, o sistema gera alertas:

- **⚠️ Velocidade do vento acima do limite ASOG**: Wind speed > 35 nós
- **⚠️ Número de thrusters inoperantes excede limite ASOG**: Mais de 1 thruster perdido
- **⚠️ Sistema DP fora do nível de alerta ASOG**: DP status diferente de "Green"

## 🧪 Testes

Para testar o módulo:

```bash
# Teste básico
python3 -c "from modules.asog_review import ASOGModule; ASOGModule().start()"

# Teste via decision core
python3 -c "from modules.decision_core import DecisionCore; DecisionCore().run_module('asog_review')"
```

## 📝 Notas

- Os arquivos `nautilus_logs.txt` e `asog_report.json` são gerados no diretório de execução
- Ambos os arquivos estão incluídos no `.gitignore` para evitar commits acidentais
- Os dados operacionais são simulados e devem ser substituídos por APIs reais em produção
