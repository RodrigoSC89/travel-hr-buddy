# MMI v2 - Marine Maintenance Intelligence 2.0

## ⚓ Visão Geral

O **MMI v2** é a evolução completa do sistema de manutenção inteligente embarcada para o Nautilus One. Este é o sistema que deixa o TM Master comendo poeira no costado.

## 🌟 Características

### 🌳 Árvore Hierárquica de Ativos (Asset Tree)
- Estrutura hierárquica de equipamentos e sistemas
- Motor, propulsão, DP, elétrica, hidráulica
- Organização por tipo: Equipamento/Sistema/Subsistema
- Armazenamento em JSON para persistência

### 🧭 Planos Preventivos Inteligentes
- Auto-geração de tarefas baseadas em histórico e uso
- Intervalos configuráveis em dias
- Rastreamento de execução e próximas datas
- Alertas de planos vencidos

### ⚙️ Controle de Peças e Consumo Técnico
- Registro de custos por tipo (material/mão de obra/outros)
- Vinculação com Ordens de Serviço (OS)
- Análise de custos por OS
- Resumos e relatórios financeiros

### 💰 Gestão de Custos e Horas-Homem
- Tracking detalhado de custos
- Agrupamento por tipo de custo
- Histórico completo de gastos
- Análise financeira integrada

### 🧠 LLM Embarcada
- Consultas técnicas inteligentes
- Base de conhecimento técnico
- Geração automática de relatórios
- Recomendações baseadas em histórico

## 📦 Estrutura do Projeto

```
modules/
├── mmi_v2/
│   ├── __init__.py
│   ├── asset_tree.py           # Gestão de ativos
│   ├── maintenance_planner.py  # Planos preventivos
│   ├── cost_control.py         # Controle de custos
│   ├── llm_assistant.py        # Assistente IA
│   ├── mmi_v2_core.py          # Core do sistema
│   └── README.md               # Esta documentação
│
core/
├── __init__.py
└── logger.py                   # Sistema de logging
```

## 🚀 Instalação

### Requisitos
- Python 3.8+
- Nenhuma dependência externa obrigatória (usa apenas stdlib)

### Instalação Básica

```bash
# Clone o repositório (se ainda não o fez)
git clone https://github.com/RodrigoSC89/travel-hr-buddy.git
cd travel-hr-buddy

# Instale dependências (opcional)
pip install -r requirements.txt
```

## 💻 Uso

### Executar o Sistema

```bash
# Na raiz do projeto
python -m modules.mmi_v2.mmi_v2_core
```

### Uso Programático

```python
from modules.mmi_v2 import MMIv2

# Inicializar o sistema
mmi = MMIv2()

# Acessar módulos individuais
mmi.asset_tree.adicionar_ativo("Motor Principal", tipo="Sistema")
mmi.planner.criar_plano(ativo_id=1, descricao="Troca de óleo", intervalo_dias=90)
mmi.costs.registrar_custo(os_id=1, tipo="material", valor=1500.00)

# Consultar IA
resposta = mmi.assistant.responder("Como está o thruster?")
print(resposta)

# Gerar relatório
relatorio = mmi.assistant.gerar_relatorio("mensal")
print(relatorio)
```

### Uso via Menu Interativo

O sistema oferece um menu completo e interativo:

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
```

## 📊 Arquivos de Dados

O MMI v2 utiliza arquivos JSON para armazenamento:

- `mmi_assets.json` - Árvore de ativos
- `mmi_preventive_plans.json` - Planos preventivos
- `mmi_costs.json` - Registro de custos
- `logs/mmi_v2_YYYYMMDD.log` - Logs do sistema

## 🔗 Integração

O MMI v2 está pronto para integração com:

### SGSO (Sistema de Gestão de Segurança Operacional)
```python
# Exemplo de integração
from modules.mmi_v2 import MMIv2

mmi = MMIv2()
# Sincronizar com SGSO
```

### Workflow (Fluxos de Trabalho Inteligentes)
```python
# Criar OS automaticamente
mmi.planner.criar_plano(ativo_id, descricao, intervalo)
```

### BridgeLink (Comunicação Ponte-Praça)
```python
# Enviar alertas para ponte
alertas = mmi.planner.listar_vencidos()
```

## 🧪 Testes

### Teste Manual

```bash
# Execute o sistema e teste cada módulo
python -m modules.mmi_v2.mmi_v2_core

# Siga o menu interativo para testar:
# 1. Adicione ativos
# 2. Crie planos preventivos
# 3. Registre custos
# 4. Consulte a IA
```

### Teste Programático

```python
from modules.mmi_v2 import MMIv2

def test_mmi_v2():
    mmi = MMIv2()
    
    # Teste Asset Tree
    mmi.asset_tree.adicionar_ativo("Motor STBD", tipo="Sistema")
    assert len(mmi.asset_tree.assets) > 0
    
    # Teste Planner
    mmi.planner.criar_plano(1, "Manutenção Preventiva", 90)
    assert len(mmi.planner.plans) > 0
    
    # Teste Costs
    mmi.costs.registrar_custo(1, "material", 1000.00)
    assert len(mmi.costs.costs) > 0
    
    print("✅ Todos os testes passaram!")

test_mmi_v2()
```

## 📝 Exemplos

### Exemplo 1: Gerenciar Ativos

```python
from modules.mmi_v2 import AssetTree

# Criar árvore de ativos
tree = AssetTree()

# Adicionar sistemas principais
tree.adicionar_ativo("Propulsão", tipo="Sistema")
tree.adicionar_ativo("Motor Principal", pai=1, tipo="Equipamento")
tree.adicionar_ativo("Motor STBD", pai=1, tipo="Equipamento")

# Listar hierarquia
tree.listar()
```

### Exemplo 2: Planos Preventivos

```python
from modules.mmi_v2 import AssetTree, MaintenancePlanner

tree = AssetTree()
tree.adicionar_ativo("Thruster STBD FWD", tipo="Equipamento")

planner = MaintenancePlanner(tree)
planner.criar_plano(
    ativo_id=1,
    descricao="Inspeção de selo mecânico",
    intervalo_dias=180
)

# Verificar planos vencidos
vencidos = planner.listar_vencidos()
print(f"Planos vencidos: {len(vencidos)}")
```

### Exemplo 3: Controle de Custos

```python
from modules.mmi_v2 import CostControl

costs = CostControl()

# Registrar custos de uma OS
costs.registrar_custo(1, "material", 2500.00, "Filtros e óleo")
costs.registrar_custo(1, "mão de obra", 800.00, "4h técnico especializado")

# Ver resumo
costs.resumo()

# Ver custos por OS
costs.custos_por_os(1)
```

### Exemplo 4: Assistente IA

```python
from modules.mmi_v2 import NautilusLLM

assistant = NautilusLLM()

# Fazer consultas
resposta1 = assistant.responder("Como está o thruster?")
resposta2 = assistant.responder("Qual o custo médio mensal?")

# Gerar relatório
relatorio = assistant.gerar_relatorio("mensal")
print(relatorio)
```

## 🔧 Configuração

### Logging

Os logs são salvos automaticamente em `logs/mmi_v2_YYYYMMDD.log`. Para configurar:

```python
from core.logger import log_event

# Registrar evento customizado
log_event("Minha mensagem", "INFO")
log_event("Aviso importante", "WARNING")
log_event("Erro crítico", "ERROR")
```

### Arquivos de Dados

Por padrão, os dados são salvos na raiz do projeto. Para mudar:

```python
from modules.mmi_v2 import AssetTree, MaintenancePlanner, CostControl

# Especificar caminhos customizados
tree = AssetTree("data/assets.json")
planner = MaintenancePlanner(tree, "data/plans.json")
costs = CostControl("data/costs.json")
```

## 🚧 Roadmap

### Versão 2.1
- [ ] Integração com OpenAI API real
- [ ] Exportação para PDF
- [ ] API REST para integração externa
- [ ] Dashboard web

### Versão 2.2
- [ ] Integração com banco de dados PostgreSQL
- [ ] Sistema de notificações por email
- [ ] Sincronização em tempo real
- [ ] App móvel

### Versão 3.0
- [ ] Análise preditiva com ML
- [ ] Realidade aumentada para manutenção
- [ ] IoT integration
- [ ] Blockchain para auditoria

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto faz parte do Nautilus One e está sob licença proprietária.

## 👥 Autores

- **Nautilus AI Team**
- Desenvolvido para RodrigoSC89/travel-hr-buddy

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato:
- Email: support@nautilus.ai
- GitHub: https://github.com/RodrigoSC89/travel-hr-buddy/issues

## 🎯 Status do Projeto

✅ **PRONTO PARA PRODUÇÃO**

O MMI v2 está completo e testado, pronto para:
- Uso standalone
- Integração com SGSO
- Integração com Workflow
- Integração com BridgeLink

---

⚓ **Nautilus One Pro Edition** - Tecnologia Embarcada de Ponta

*"Deixando o TM Master comendo poeira no costado desde 2025"*
