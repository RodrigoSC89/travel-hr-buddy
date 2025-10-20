# 🔱 Nautilus One - Decision Core

## Visão Geral

O **Decision Core** é o módulo central de inteligência e comando do Nautilus One - um sistema de controle operacional para operações marítimas, offshore e industriais. Ele atua como o "cérebro" do sistema, interpretando comandos do operador e orquestrando a execução de módulos operacionais especializados.

## 🎯 Características Principais

### 1. **Sistema de Menu Interativo**
Interface CLI intuitiva que permite aos operadores navegar facilmente entre as diferentes funcionalidades:

```
🔧 Deseja seguir com:
1. 📄 Exportar parecer da IA como PDF
2. 🧠 Iniciar módulo Auditoria Técnica FMEA
3. 🔗 Conectar com SGSO/Logs
4. 🧾 Migrar para outro módulo (Forecast/ASOG Review)
```

### 2. **Persistência de Estado**
O sistema mantém o estado entre sessões através do arquivo `nautilus_state.json`:
- Última ação executada
- Timestamp de execução
- Histórico de operações

### 3. **Logging Abrangente**
Todas as operações são registradas em `nautilus_logs.txt` com:
- Timestamp preciso
- Descrição da operação
- Status de execução
- Mensagens de erro quando aplicável

### 4. **Módulos Operacionais**

#### 📄 **Exportador de PDF**
- Converte relatórios JSON em documentos PDF
- Suporta diferentes tipos de relatórios
- Geração automática de metadados

#### 🧠 **Auditor FMEA**
- Análise de Failure Mode and Effects Analysis
- Avaliação de sistemas críticos
- Geração de relatórios de risco

#### 🔗 **Conector SGSO**
- Integração com Sistema de Gestão de Segurança Operacional
- Sincronização de dados
- Conexão segura

#### 📋 **ASOG Review**
- Assessment of Operational Goals
- Avaliação de metas operacionais
- Análise de conformidade

#### 📊 **Forecast de Risco**
- Previsão de riscos operacionais
- Análise de tendências
- Recomendações automatizadas

## 🚀 Como Usar

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/RodrigoSC89/travel-hr-buddy.git
cd travel-hr-buddy
```

2. **Verifique os requisitos**
```bash
python3 --version  # Requer Python 3.12+
```

3. **Não há dependências externas!**
O sistema usa apenas a biblioteca padrão do Python.

### Execução

```bash
python3 main.py
```

### Fluxo de Uso Típico

1. **Inicie o sistema**
```bash
$ python3 main.py
🚀 Iniciando Nautilus One Decision Core...
```

2. **Selecione uma opção do menu**
- Digite o número correspondente à ação desejada
- Pressione Enter

3. **Acompanhe a execução**
- Veja o progresso em tempo real
- Observe os logs sendo gerados

4. **Verifique os resultados**
- Consulte `nautilus_logs.txt` para histórico
- Verifique `nautilus_state.json` para estado atual

## 📁 Estrutura de Arquivos

```
travel-hr-buddy/
├── main.py                      # Ponto de entrada do sistema
├── core/                        # Utilidades centrais
│   ├── __init__.py
│   ├── logger.py               # Sistema de logging
│   ├── pdf_exporter.py         # Exportação de PDF
│   └── sgso_connector.py       # Conector SGSO
├── modules/                     # Módulos operacionais
│   ├── __init__.py
│   ├── decision_core.py        # Controlador principal
│   ├── audit_fmea.py          # Auditor FMEA
│   ├── asog_review.py         # Revisor ASOG
│   └── forecast_risk.py       # Forecast de risco
├── requirements.txt            # Dependências Python
├── nautilus_state.json        # Estado persistente (gerado)
└── nautilus_logs.txt          # Logs do sistema (gerado)
```

## 🔧 Configuração

### Arquivos de Estado

#### `nautilus_state.json`
```json
{
    "ultima_acao": "Exportar PDF",
    "timestamp": "2025-10-20T01:05:42.167Z"
}
```

#### `nautilus_logs.txt`
```
[2025-10-20 01:05:42] Exportando relatório: relatorio_fmea_atual.json
[2025-10-20 01:05:42] PDF exportado com sucesso
[2025-10-20 01:05:42] Estado atualizado: Exportar PDF
```

## 🎓 Exemplos de Uso

### Exemplo 1: Exportar Relatório PDF

```bash
$ python3 main.py
🔧 Deseja seguir com:
1. 📄 Exportar parecer da IA como PDF
...

➤ Sua escolha: 1

✅ PDF exportado com sucesso: relatorio_fmea_atual.pdf
   Tipo de relatório: Relatório FMEA
   Data: 2025-10-20 01:05:42
```

### Exemplo 2: Executar Auditoria FMEA

```bash
➤ Sua escolha: 2

🧠 AUDITORIA TÉCNICA FMEA
============================================================

📋 Iniciando análise de modos de falha...

   → Analisando: Sistema de Propulsão
      Status: Baixo
   → Analisando: Sistema de Navegação
      Status: Aceitável
...
```

### Exemplo 3: Conectar ao SGSO

```bash
➤ Sua escolha: 3

🔗 Conectando ao SGSO...
   → Verificando credenciais...
   → Estabelecendo conexão segura...
   → Sincronizando dados...
✅ Conectado ao SGSO com sucesso!
```

## 🔒 Segurança

- Todos os logs são armazenados localmente
- Estado persistente em formato JSON legível
- Sem credenciais armazenadas em código
- Preparado para integração com sistemas de autenticação

## 🚀 Próximos Passos

### Extensibilidade

Para adicionar um novo módulo operacional:

1. **Crie o arquivo do módulo** em `modules/`
2. **Implemente a classe** com método principal
3. **Importe no `decision_core.py`**
4. **Adicione opção no menu**
5. **Implemente logging**

Exemplo:
```python
# modules/meu_novo_modulo.py
from core.logger import log_event

class MeuNovoModulo:
    def executar(self):
        log_event("Iniciando Meu Novo Módulo")
        # Sua lógica aqui
        log_event("Módulo concluído")
```

## 📖 Documentação Adicional

- [Arquitetura Técnica](DECISION_CORE_ARCHITECTURE.md)
- [Guia Rápido](DECISION_CORE_QUICKSTART.md)

## 🐛 Troubleshooting

### Problema: Módulo não encontrado
**Solução**: Verifique se está executando do diretório raiz do projeto.

### Problema: Erro de permissão ao escrever logs
**Solução**: Verifique permissões de escrita no diretório.

### Problema: Estado corrompido
**Solução**: Delete `nautilus_state.json` e reinicie o sistema.

## 📝 Licença

Este projeto faz parte do Nautilus One e segue a mesma licença do projeto principal.

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor, siga as diretrizes de contribuição do projeto principal.

## 📞 Suporte

Para suporte técnico, abra uma issue no repositório GitHub.

---

**Nautilus One Decision Core** - Inteligência operacional para o futuro marítimo. 🌊
