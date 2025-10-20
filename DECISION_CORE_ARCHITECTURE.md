# 🏗️ Decision Core - Arquitetura Técnica

## Visão Geral da Arquitetura

O Decision Core implementa uma arquitetura modular baseada em camadas, promovendo separação de responsabilidades e facilitando manutenção e extensibilidade.

## 📊 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        main.py                               │
│                    (Entry Point)                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  DecisionCore                                │
│              (Orquestrador Principal)                        │
│  • Gerenciamento de Estado                                   │
│  • Roteamento de Comandos                                    │
│  • Controle de Fluxo                                         │
└──┬──────────────┬──────────────┬──────────────┬────────────┘
   │              │              │              │
   ▼              ▼              ▼              ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│   PDF    │ │   FMEA   │ │   SGSO   │ │ Módulos  │
│ Exporter │ │ Auditor  │ │Connector │ │   Adv.   │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │            │
     │            │            │            ├─→ ASOG Review
     │            │            │            └─→ Risk Forecast
     │            │            │
     └────────────┴────────────┴──────────────┐
                                               │
                                               ▼
                                    ┌──────────────────┐
                                    │  Core Utilities  │
                                    │  • Logger        │
                                    │  • State Mgmt    │
                                    └──────────────────┘
```

## 🔧 Componentes Principais

### 1. Entry Point (`main.py`)

**Responsabilidades:**
- Inicialização do sistema
- Tratamento de exceções globais
- Controle de ciclo de vida

**Padrões de Design:**
- Singleton implícito (ponto único de entrada)
- Exception Handler

```python
def main():
    """Função principal de entrada do sistema."""
    try:
        nautilus = DecisionCore()
        nautilus.processar_decisao()
    except KeyboardInterrupt:
        # Graceful shutdown
    except Exception as e:
        # Error handling
```

### 2. Decision Core (`modules/decision_core.py`)

**Responsabilidades:**
- Orquestração de módulos operacionais
- Gerenciamento de estado persistente
- Roteamento de comandos do usuário
- Controle de fluxo de execução

**Padrões de Design:**
- Command Pattern (menu de opções)
- State Pattern (gerenciamento de estado)
- Facade Pattern (simplifica acesso aos módulos)

**Métodos Principais:**
```python
class DecisionCore:
    def __init__(self):
        """Inicializa o sistema e carrega estado."""
        
    def carregar_estado(self):
        """Carrega estado persistente do disco."""
        
    def salvar_estado(self, acao):
        """Persiste estado atual no disco."""
        
    def processar_decisao(self):
        """Processa entrada do usuário e roteia para módulo."""
        
    def menu_modulos(self):
        """Apresenta menu de submódulos."""
```

### 3. Core Utilities (`core/`)

#### 3.1 Logger (`core/logger.py`)

**Responsabilidades:**
- Registro de eventos do sistema
- Auditoria de operações
- Debug e troubleshooting

**Características:**
- Append-only logs
- Timestamps automáticos
- Thread-safe (para futuras melhorias)

```python
def log_event(msg: str) -> None:
    """Registra evento com timestamp."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open("nautilus_logs.txt", "a", encoding="utf-8") as log:
        log.write(f"[{timestamp}] {msg}\n")
```

#### 3.2 PDF Exporter (`core/pdf_exporter.py`)

**Responsabilidades:**
- Conversão de relatórios JSON para PDF
- Formatação de documentos
- Geração de metadados

**Extensibilidade:**
- Preparado para integração com reportlab/weasyprint
- Suporta diferentes tipos de relatórios
- Geração de nomes de arquivo automática

#### 3.3 SGSO Connector (`core/sgso_connector.py`)

**Responsabilidades:**
- Integração com Sistema de Gestão de Segurança Operacional
- Sincronização de dados
- Gerenciamento de conexão

**Padrões de Design:**
- Adapter Pattern (adapta interface SGSO)
- Connection Pool (preparado para futuro)

### 4. Operational Modules (`modules/`)

#### 4.1 FMEA Auditor (`modules/audit_fmea.py`)

**Tipo:** Módulo de Análise
**Função:** Failure Mode and Effects Analysis

**Componentes Analisados:**
- Sistema de Propulsão
- Sistema de Navegação
- Sistema de Comunicação
- Sistema de Segurança

**Output:**
- Níveis de risco por componente
- Relatório consolidado
- Timestamp de análise

#### 4.2 ASOG Review (`modules/asog_review.py`)

**Tipo:** Módulo de Avaliação
**Função:** Assessment of Operational Goals

**Metas Avaliadas:**
- Eficiência Operacional
- Segurança de Tripulação
- Conformidade Regulatória
- Disponibilidade de Equipamentos

**Métricas:**
- Target vs. Current
- Status de progresso
- Recomendações

#### 4.3 Risk Forecast (`modules/forecast_risk.py`)

**Tipo:** Módulo Preditivo
**Função:** Previsão de Riscos Operacionais

**Fatores Analisados:**
- Clima
- Equipamentos
- Fatores Humanos
- Conformidade
- Operacional

**Output:**
- Nível de risco atual
- Tendências
- Previsão de 7 dias
- Recomendações

## 🔄 Fluxo de Dados

### Estado Persistente

```
┌──────────────┐
│   Usuário    │
└──────┬───────┘
       │ (comando)
       ▼
┌──────────────┐      ┌─────────────────┐
│DecisionCore  │─────→│nautilus_state   │
│              │←─────│    .json        │
└──────┬───────┘      └─────────────────┘
       │ (executa)
       ▼
┌──────────────┐
│   Módulo     │
│ Operacional  │
└──────┬───────┘
       │ (log)
       ▼
┌──────────────┐
│nautilus_logs │
│    .txt      │
└──────────────┘
```

### Ciclo de Vida de uma Operação

1. **Inicialização**
   ```
   main.py → DecisionCore.__init__() → carregar_estado()
   ```

2. **Processamento**
   ```
   processar_decisao() → input do usuário → roteamento
   ```

3. **Execução**
   ```
   módulo.executar() → log_event() → retorno
   ```

4. **Persistência**
   ```
   salvar_estado() → JSON write → confirmação
   ```

## 🎨 Padrões de Design Utilizados

### 1. **Facade Pattern**
- `DecisionCore` fornece interface simplificada para sistema complexo
- Esconde complexidade dos módulos internos

### 2. **Command Pattern**
- Menu de opções representa comandos diferentes
- Cada opção encapsula uma ação completa

### 3. **State Pattern**
- Sistema mantém estado entre execuções
- Estado influencia comportamento

### 4. **Template Method Pattern**
- Módulos operacionais seguem estrutura comum
- Cada módulo implementa sua lógica específica

### 5. **Adapter Pattern**
- SGSO Connector adapta interface externa
- Preparado para diferentes backends

## 🔐 Considerações de Segurança

### Atual
- Logs locais (sem exposição externa)
- Estado em JSON legível (facilita debug)
- Sem credenciais hardcoded

### Futuro
- Criptografia de estado sensível
- Autenticação de usuários
- Audit trail completo
- Rate limiting

## 📈 Escalabilidade

### Horizontal
- Módulos independentes podem ser distribuídos
- Estado centralizado permite múltiplas instâncias

### Vertical
- Arquitetura modular facilita otimizações
- Cache pode ser adicionado facilmente

## 🔌 Pontos de Extensão

### 1. Adicionar Novo Módulo Operacional

```python
# modules/meu_modulo.py
from core.logger import log_event

class MeuModulo:
    def executar(self):
        log_event("Iniciando módulo")
        # Lógica do módulo
        log_event("Módulo concluído")
```

### 2. Integrar Novo Serviço Externo

```python
# core/meu_servico.py
from core.logger import log_event

class MeuServicoClient:
    def conectar(self):
        log_event("Conectando ao serviço")
        # Lógica de conexão
```

### 3. Adicionar Nova Opção de Menu

```python
# Em decision_core.py
def processar_decisao(self):
    print("5. 🆕 Minha Nova Funcionalidade")
    # ...
    elif escolha == "5":
        from modules.meu_modulo import MeuModulo
        MeuModulo().executar()
        self.salvar_estado("Minha Nova Funcionalidade")
```

## 🧪 Testabilidade

### Estrutura Testável
- Módulos independentes
- Dependências injetáveis
- Estado externalizado

### Tipos de Teste Recomendados

1. **Unit Tests**
   - Testar cada módulo isoladamente
   - Mock de dependências externas

2. **Integration Tests**
   - Testar fluxo completo
   - Verificar persistência de estado

3. **End-to-End Tests**
   - Simular uso real
   - Validar outputs

## 📊 Métricas e Monitoramento

### Métricas Atuais
- Logs textuais em arquivo
- Estado persistente em JSON

### Métricas Futuras
- Tempo de execução por módulo
- Taxa de sucesso/erro
- Uso de recursos
- Latência de operações

## 🔄 Ciclo de Desenvolvimento

### Workflow Recomendado

1. **Desenvolvimento**
   ```bash
   git checkout -b feature/nova-funcionalidade
   # Implementar mudanças
   python3 main.py  # Testar
   git commit -m "Adiciona nova funcionalidade"
   ```

2. **Teste**
   ```bash
   # Executar testes manuais
   python3 main.py
   # Verificar logs
   cat nautilus_logs.txt
   ```

3. **Deploy**
   ```bash
   git push origin feature/nova-funcionalidade
   # Criar PR
   ```

## 📚 Referências Técnicas

- **Python 3.12+**: Recursos de linguagem utilizados
- **JSON**: Formato de estado persistente
- **UTF-8**: Encoding padrão para internacionalização

## 🚀 Roadmap Técnico

### Curto Prazo
- [ ] Adicionar testes unitários
- [ ] Implementar geração real de PDF
- [ ] Conectar com API SGSO real

### Médio Prazo
- [ ] Interface web (integração com React)
- [ ] Sistema de autenticação
- [ ] Métricas e dashboards

### Longo Prazo
- [ ] Distribuição de módulos
- [ ] Machine Learning para predições
- [ ] Integração com sistemas externos

---

**Decision Core Architecture** - Construído para escalar, projetado para durar. 🏗️
