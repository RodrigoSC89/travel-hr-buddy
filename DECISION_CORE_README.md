# 🧭 Decision Core - Nautilus One

Módulo central de decisão do Nautilus One, responsável por interpretar o contexto e executar o próximo passo lógico.

## 📦 Estrutura do Projeto

```
travel-hr-buddy/
├── core/                          # Módulos centrais
│   ├── __init__.py
│   ├── logger.py                  # Sistema de logs
│   ├── pdf_exporter.py            # Exportador de PDFs
│   └── sgso_connector.py          # Conector SGSO
├── modules/                       # Módulos funcionais
│   ├── __init__.py
│   ├── decision_core.py           # Módulo principal de decisão
│   ├── audit_fmea.py              # Auditoria FMEA
│   ├── asog_review.py             # Revisão ASOG
│   └── forecast_risk.py           # Previsão de risco
├── main.py                        # Ponto de entrada
├── requirements.txt               # Dependências Python
├── nautilus_state.json            # Estado persistente (gerado)
└── nautilus_logs.txt              # Logs do sistema (gerado)
```

## 🚀 Como Usar

### Instalação

1. Certifique-se de ter Python 3.12+ instalado:
```bash
python3 --version
```

2. Instale as dependências (se houver):
```bash
pip install -r requirements.txt
```

### Executando o Sistema

```bash
python3 main.py
```

### Menu Principal

Ao executar o sistema, você verá o menu principal:

```
🔧 Deseja seguir com:
1. 📄 Exportar parecer da IA como PDF
2. 🧠 Iniciar módulo Auditoria Técnica FMEA
3. 🔗 Conectar com SGSO/Logs
4. 🧾 Migrar para outro módulo (Forecast/ASOG Review)

Sua escolha:
```

### Funcionalidades

#### 1. Exportar PDF
Exporta relatórios em formato PDF baseado em arquivos JSON.

#### 2. Auditoria FMEA
Executa o módulo de Auditoria Técnica FMEA (Failure Mode and Effects Analysis).

#### 3. Conexão SGSO
Estabelece conexão com o Sistema de Gestão de Segurança Operacional.

#### 4. Módulos Adicionais
Acessa submódulos:
- **ASOG Review**: Revisão de ASOG (Assessment of Operational Goals)
- **Forecast de Risco**: Análise e previsão de riscos

## 🔩 Funcionalidades Técnicas

### Sistema de Estado Persistente

O sistema mantém estado entre execuções através do arquivo `nautilus_state.json`:

```json
{
    "ultima_acao": "Exportar PDF",
    "timestamp": "2025-10-20T01:05:42.167Z"
}
```

### Sistema de Logs

Todos os eventos são registrados em `nautilus_logs.txt`:

```
[2025-10-20 01:05:42.167890] Novo estado do Nautilus inicializado.
[2025-10-20 01:05:45.234567] Exportando relatório: relatorio_fmea_atual.json
[2025-10-20 01:05:45.345678] PDF exportado com sucesso
[2025-10-20 01:05:45.456789] Estado atualizado: Exportar PDF
```

### Arquitetura Modular

O Decision Core segue uma arquitetura modular que permite:

- ✅ Extensibilidade fácil de novos módulos
- ✅ Rastreabilidade completa de ações
- ✅ Estado persistente entre execuções
- ✅ Logs auditáveis
- ✅ Separação de responsabilidades

## 🧩 Desenvolvimento

### Adicionando Novos Módulos

1. Crie um novo arquivo em `modules/`:
```python
from core.logger import log_event

class NovoModulo:
    def executar(self):
        log_event("Iniciando Novo Módulo")
        print("🚀 Executando novo módulo...")
        # Sua lógica aqui
        log_event("Novo Módulo concluído")
```

2. Importe e use no `decision_core.py`:
```python
from modules.novo_modulo import NovoModulo

# No menu ou processar_decisao:
NovoModulo().executar()
self.salvar_estado("Novo Módulo")
```

### Estrutura de Classes

#### DecisionCore
- `__init__()`: Inicializa e carrega estado
- `carregar_estado()`: Carrega estado do JSON
- `salvar_estado(acao)`: Salva estado atual
- `processar_decisao()`: Menu principal
- `menu_modulos()`: Submenu de módulos

## 🔱 Git Workflow

Para adicionar ao repositório:

```bash
git add modules/ core/ main.py requirements.txt .gitignore
git commit -m "Adicionado módulo Decision Core ao Nautilus One"
git push origin feature/decision-core
```

## 📋 Arquivos Ignorados

Os seguintes arquivos são gerados durante a execução e não devem ser commitados:

- `nautilus_state.json` - Estado do sistema
- `nautilus_logs.txt` - Logs de execução
- `__pycache__/` - Cache Python
- `*.pyc` - Bytecode Python

## 🎯 Objetivo do Módulo

O Decision Core é o cérebro lógico do Nautilus One:

✅ Interpreta comandos do operador  
✅ Executa o módulo correspondente  
✅ Atualiza o estado persistente  
✅ Mantém rastreabilidade das ações  
✅ Permite retomada automática da última ação ao reiniciar

## 📝 Licença

Este módulo faz parte do projeto Nautilus One.
