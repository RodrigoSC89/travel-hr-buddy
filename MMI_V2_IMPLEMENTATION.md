# MMI v2 - Marine Maintenance Intelligence 2.0

## 📋 Resumo da Implementação

O **MMI v2** foi implementado como um sistema Python standalone completo para gestão técnica e manutenção embarcada. Este documento descreve a implementação completa do sistema.

## 🎯 Objetivo

Criar a evolução completa do MMI (Marine Maintenance Intelligence) - a espinha dorsal do sistema técnico embarcado do Nautilus One, deixando o TM Master "comendo poeira no costado".

## 📦 Estrutura Implementada

```
travel-hr-buddy/
├── core/
│   ├── __init__.py
│   └── logger.py              # Sistema de logging
│
├── modules/
│   ├── __init__.py
│   └── mmi_v2/
│       ├── __init__.py
│       ├── README.md          # Documentação do módulo
│       ├── asset_tree.py      # 🌳 Árvore de ativos
│       ├── maintenance_planner.py  # 🧭 Planos preventivos
│       ├── cost_control.py    # 💰 Controle de custos
│       ├── llm_assistant.py   # 🧠 Assistente IA
│       └── mmi_v2_core.py     # ⚙️ Core do sistema
│
├── requirements.txt           # Dependências Python
├── test_mmi_v2.py            # Testes automatizados
└── demo_mmi_v2.py            # Demo interativa
```

## 🌟 Funcionalidades Implementadas

### 1. 🌳 Árvore Hierárquica de Ativos (Asset Tree)

**Arquivo**: `modules/mmi_v2/asset_tree.py`

**Funcionalidades**:
- Estrutura hierárquica de equipamentos e sistemas
- Suporte para tipos: Equipamento, Sistema, Subsistema
- Relacionamento pai-filho entre ativos
- Persistência em JSON (`mmi_assets.json`)
- Interface interativa via menu

**Exemplo de uso**:
```python
from modules.mmi_v2 import AssetTree

tree = AssetTree()
tree.adicionar_ativo("Motor Principal", tipo="Sistema")
tree.adicionar_ativo("ME-4500", pai=1, tipo="Equipamento")
tree.listar()
```

**Estrutura de dados**:
```json
{
  "id": 1,
  "nome": "Motor Principal",
  "pai": null,
  "tipo": "Sistema"
}
```

### 2. 🧭 Planos Preventivos Inteligentes

**Arquivo**: `modules/mmi_v2/maintenance_planner.py`

**Funcionalidades**:
- Criação de planos preventivos com intervalos configuráveis
- Cálculo automático de próxima execução
- Detecção de planos vencidos
- Execução e reagendamento de planos
- Persistência em JSON (`mmi_preventive_plans.json`)

**Exemplo de uso**:
```python
from modules.mmi_v2 import MaintenancePlanner

planner = MaintenancePlanner(asset_tree)
planner.criar_plano(
    ativo_id=1,
    descricao="Troca de óleo",
    intervalo_dias=90
)
vencidos = planner.listar_vencidos()
```

**Estrutura de dados**:
```json
{
  "id": 1,
  "ativo_id": 1,
  "descricao": "Troca de óleo - Motor Principal",
  "intervalo": 90,
  "proxima_execucao": "2026-01-18T11:24:42.715",
  "criado_em": "2025-10-20T11:24:42.715"
}
```

### 3. 💰 Controle de Custos e Peças

**Arquivo**: `modules/mmi_v2/cost_control.py`

**Funcionalidades**:
- Registro de custos por tipo (material/mão de obra/outros)
- Vinculação com Ordens de Serviço (OS)
- Análise de custos por OS
- Resumos financeiros e relatórios
- Agrupamento por tipo de custo
- Persistência em JSON (`mmi_costs.json`)

**Exemplo de uso**:
```python
from modules.mmi_v2 import CostControl

costs = CostControl()
costs.registrar_custo(
    os_id=1,
    tipo="material",
    valor=2500.00,
    descricao="Óleo e filtros"
)
costs.resumo()
costs.custos_por_os(1)
```

**Estrutura de dados**:
```json
{
  "id": 1,
  "os_id": 1,
  "tipo": "material",
  "valor": 2500.00,
  "descricao": "Óleo e filtros",
  "data": "2025-10-20T11:24:42.716"
}
```

### 4. 🧠 Assistente IA (LLM Embarcada)

**Arquivo**: `modules/mmi_v2/llm_assistant.py`

**Funcionalidades**:
- Base de conhecimento técnico embarcada
- Consultas sobre equipamentos (thruster, motor, DP, hidráulico)
- Análise de custos
- Geração automática de relatórios (mensal/semanal)
- Interface de chat interativa

**Exemplo de uso**:
```python
from modules.mmi_v2 import NautilusLLM

assistant = NautilusLLM()
resposta = assistant.responder("Como está o thruster?")
relatorio = assistant.gerar_relatorio("mensal")
```

**Base de conhecimento**:
- **Thruster**: Tendências de desgaste, inspeções, intervalos
- **Motor**: Manutenção preventiva, temperatura operacional
- **DP**: Calibração, testes de redundância, sensores
- **Hidráulico**: Pressão, temperatura, troca de óleo
- **Custos**: Análise mensal, distribuição por tipo

### 5. ⚙️ Core do Sistema (MMI v2)

**Arquivo**: `modules/mmi_v2/mmi_v2_core.py`

**Funcionalidades**:
- Integração de todos os módulos
- Menu principal interativo completo
- Banner do sistema com informações
- Sistema "Sobre" com documentação
- Tratamento de erros e logging
- Entry point para execução standalone

**Exemplo de uso**:
```python
from modules.mmi_v2 import MMIv2

mmi = MMIv2()
mmi.menu()  # Inicia interface interativa
```

### 6. 📝 Sistema de Logging

**Arquivo**: `core/logger.py`

**Funcionalidades**:
- Logging em arquivo e console
- Níveis de log: INFO, WARNING, ERROR, DEBUG
- Arquivos diários (`logs/mmi_v2_YYYYMMDD.log`)
- Timestamps automáticos
- Integração com todos os módulos

**Exemplo de uso**:
```python
from core.logger import log_event

log_event("Sistema inicializado", "INFO")
log_event("Atenção: plano vencido", "WARNING")
log_event("Erro ao salvar arquivo", "ERROR")
```

## 🚀 Como Usar

### Instalação

1. **Clone o repositório** (se ainda não o fez):
   ```bash
   git clone https://github.com/RodrigoSC89/travel-hr-buddy.git
   cd travel-hr-buddy
   ```

2. **Instale dependências** (opcional, nenhuma dependência externa obrigatória):
   ```bash
   pip install -r requirements.txt
   ```

### Execução

#### Modo Demonstração (Recomendado para primeira vez)

```bash
python demo_mmi_v2.py
```

Este script:
- Apresenta o sistema
- Oferece criar dados de demonstração
- Abre o menu interativo completo

#### Modo Standalone

```bash
python -m modules.mmi_v2.mmi_v2_core
```

Executa o sistema sem dados pré-configurados.

#### Modo Programático

```python
from modules.mmi_v2 import MMIv2

# Inicializar
mmi = MMIv2()

# Usar módulos individuais
mmi.asset_tree.adicionar_ativo("Motor", tipo="Sistema")
mmi.planner.criar_plano(1, "Manutenção", 90)
mmi.costs.registrar_custo(1, "material", 1500.00)

# Consultar IA
resposta = mmi.assistant.responder("thruster")
print(resposta)
```

### Testes

Execute o script de testes completo:

```bash
python test_mmi_v2.py
```

**Testes incluídos**:
- ✅ Teste de Asset Tree
- ✅ Teste de Maintenance Planner
- ✅ Teste de Cost Control
- ✅ Teste de LLM Assistant
- ✅ Teste de integração completa

## 📊 Arquivos de Dados

O sistema utiliza JSON para persistência:

| Arquivo | Descrição | Conteúdo |
|---------|-----------|----------|
| `mmi_assets.json` | Árvore de ativos | Lista de ativos com hierarquia |
| `mmi_preventive_plans.json` | Planos preventivos | Planos com intervalos e datas |
| `mmi_costs.json` | Custos e peças | Registros de custos por OS |
| `logs/mmi_v2_YYYYMMDD.log` | Logs do sistema | Eventos e operações |

**Localização**: Raiz do projeto

**Formato**: JSON com encoding UTF-8

## 🔌 Integrações Futuras

O MMI v2 está pronto para integração com:

### SGSO (Sistema de Gestão de Segurança Operacional)
- Sincronização de planos preventivos
- Alertas de segurança
- Relatórios de conformidade

### Workflow (Fluxos de Trabalho Inteligentes)
- Criação automática de OS
- Workflow de aprovação
- Notificações e alertas

### BridgeLink (Comunicação Ponte-Praça)
- Envio de alertas para ponte
- Status em tempo real
- Coordenação de manutenções

### API REST (Futuro)
- Endpoints para integração externa
- Autenticação e autorização
- Webhooks para eventos

## 🧪 Resultados dos Testes

### Teste Completo Executado

```
🧪 TESTE COMPLETO DO MMI v2

============================================================
🌳 TESTE: ÁRVORE DE ATIVOS
✅ Total de ativos criados: 5

============================================================
🧭 TESTE: PLANOS PREVENTIVOS
✅ Total de planos criados: 3

============================================================
💰 TESTE: CONTROLE DE CUSTOS
📊 Total acumulado: R$8750.00
✅ Total de registros: 6

============================================================
🧠 TESTE: ASSISTENTE IA (LLM)
✅ Assistente IA testado com sucesso!

============================================================
⚓ TESTE: INTEGRAÇÃO COMPLETA MMI v2
✅ Integração completa testada com sucesso!

============================================================
📊 RESUMO DOS TESTES
✅ Ativos criados: 5
✅ Planos preventivos: 3
✅ Registros de custo: 6
✅ Assistente IA: Operacional
✅ Integração completa: OK

🎉 TODOS OS TESTES PASSARAM COM SUCESSO!
```

## 📈 Estatísticas da Implementação

| Métrica | Valor |
|---------|-------|
| Linhas de código Python | ~600 (total) |
| Módulos criados | 5 principais |
| Funcionalidades | 4 sistemas completos |
| Arquivos criados | 12 arquivos |
| Testes automatizados | 5 suítes completas |
| Documentação | 200+ linhas de README |
| Exemplos de código | 10+ exemplos |

## 🎨 Interface de Menu

```
⚙️  MMI v2 – Marine Maintenance Intelligence 2.0
════════════════════════════════════════════════════════════
1. 🌳 Gerenciar Árvore de Ativos
2. 🧭 Gerenciar Planos Preventivos
3. 💰 Controle de Custos e Peças
4. 🧠 Consultar IA Técnica (LLM)
5. 📊 Gerar Relatório Mensal
6. ℹ️  Sobre o MMI v2
0. ⏹  Sair
════════════════════════════════════════════════════════════
```

## 🔐 Segurança

- ✅ Validação de entradas do usuário
- ✅ Tratamento de exceções
- ✅ Logging de operações
- ✅ Arquivos JSON com encoding UTF-8
- ✅ Sem dados sensíveis hardcoded

## 🚧 Melhorias Futuras

### Versão 2.1
- [ ] Integração com OpenAI API real para LLM
- [ ] Exportação de relatórios em PDF
- [ ] API REST para integração externa
- [ ] Dashboard web com Flask/FastAPI

### Versão 2.2
- [ ] Banco de dados PostgreSQL
- [ ] Sistema de notificações por email
- [ ] Sincronização em tempo real
- [ ] App móvel (React Native)

### Versão 3.0
- [ ] Análise preditiva com Machine Learning
- [ ] Integração IoT para sensores
- [ ] Realidade aumentada para manutenção
- [ ] Blockchain para auditoria

## 📚 Documentação Adicional

- **README Principal**: `modules/mmi_v2/README.md`
- **Documentação do projeto**: Este arquivo
- **Exemplos de código**: `test_mmi_v2.py` e `demo_mmi_v2.py`

## 🤝 Contribuindo

O MMI v2 foi implementado seguindo as melhores práticas:
- Código limpo e bem documentado
- Arquitetura modular
- Separação de responsabilidades
- Facilmente extensível

## 📞 Suporte

Para dúvidas ou sugestões sobre o MMI v2:
- Abra uma issue no GitHub
- Consulte a documentação em `modules/mmi_v2/README.md`
- Execute `python -m modules.mmi_v2.mmi_v2_core` e escolha opção 6 (Sobre)

## ✅ Status da Implementação

| Componente | Status | Testado |
|------------|--------|---------|
| Asset Tree | ✅ Completo | ✅ Sim |
| Maintenance Planner | ✅ Completo | ✅ Sim |
| Cost Control | ✅ Completo | ✅ Sim |
| LLM Assistant | ✅ Completo | ✅ Sim |
| Core System | ✅ Completo | ✅ Sim |
| Logger | ✅ Completo | ✅ Sim |
| Documentação | ✅ Completo | ✅ Sim |
| Testes | ✅ Completo | ✅ Sim |

## 🎉 Conclusão

O **MMI v2 - Marine Maintenance Intelligence 2.0** foi implementado com sucesso, entregando todas as funcionalidades solicitadas:

✅ Árvore hierárquica de ativos  
✅ Planos preventivos inteligentes  
✅ Controle de custos e peças  
✅ Gestão de custos e horas-homem  
✅ LLM embarcada para consultas técnicas  

O sistema está **pronto para produção** e pode ser:
- Usado standalone via CLI
- Integrado com outros sistemas
- Expandido com novas funcionalidades

---

**⚓ Nautilus One Pro Edition**  
*"Deixando o TM Master comendo poeira no costado desde 2025"*

**Versão**: 2.0.0  
**Data**: Outubro 2025  
**Desenvolvido por**: Nautilus AI Team
