# 🧭 Nautilus One - Decision Core Module

## Visão Geral

O **Decision Core** é o cérebro lógico do Nautilus One — um sistema modular de decisão para operações marítimas, offshore e industriais. Ele interpreta comandos do operador, executa módulos correspondentes, e mantém rastreabilidade completa das ações.

## 🏗️ Arquitetura

```
nautilus-one/
├── core/                          # Módulos fundamentais
│   ├── __init__.py
│   ├── logger.py                  # Sistema de logs com timestamp
│   ├── pdf_exporter.py            # Exportação de relatórios em PDF
│   └── sgso_connector.py          # Conector SGSO/Logs
│
├── modules/                       # Módulos de análise
│   ├── __init__.py
│   ├── decision_core.py           # Motor central de decisão
│   ├── audit_fmea.py              # Auditoria Técnica FMEA
│   ├── asog_review.py             # Revisão ASOG
│   └── forecast_risk.py           # Previsão de Risco
│
├── main.py                        # Ponto de entrada do sistema
├── test_decision_core.py          # Suite de testes
├── requirements.txt               # Dependências Python
└── relatorio_fmea_atual.json      # Exemplo de relatório
```

## 🚀 Instalação

```bash
# Clone o repositório
git clone https://github.com/RodrigoSC89/travel-hr-buddy.git
cd travel-hr-buddy

# Instale dependências (opcional, módulos usam stdlib)
pip install -r requirements.txt

# Execute o sistema
python3 main.py
```

## 🔧 Uso

### Execução Interativa

```bash
python3 main.py
```

O sistema apresentará um menu interativo:

```
🧭 NAUTILUS ONE - Decision Core
================================================================================

🔧 Deseja seguir com:
1. 📄 Exportar parecer da IA como PDF
2. 🧠 Iniciar módulo Auditoria Técnica FMEA
3. 🔗 Conectar com SGSO/Logs
4. 🧾 Migrar para outro módulo (Forecast/ASOG Review)
5. 🚪 Sair

Sua escolha:
```

### Testes Automatizados

```bash
python3 test_decision_core.py
```

Executa todos os testes dos módulos sem necessidade de interação.

## 📦 Módulos

### 1. **Decision Core** (`modules/decision_core.py`)

Motor central que:
- Interpreta comandos do operador
- Gerencia fluxo de execução
- Mantém estado persistente (`nautilus_state.json`)
- Registra todas as ações no log

**Principais métodos:**
- `processar_decisao()` - Menu principal
- `menu_modulos()` - Submenu de módulos
- `carregar_estado()` - Carrega estado do sistema
- `salvar_estado(acao)` - Salva estado atual

### 2. **FMEA Auditor** (`modules/audit_fmea.py`)

Realiza auditoria técnica usando metodologia FMEA:
- Identifica modos de falha
- Calcula RPN (Risk Priority Number)
- Gera recomendações priorizadas

**Cálculo RPN:** `Severidade × Ocorrência × Detecção`

### 3. **ASOG Review** (`modules/asog_review.py`)

Análise de Segurança Operacional Geral:
- Revisa procedimentos operacionais
- Valida protocolos de segurança
- Verifica conformidade de treinamentos

### 4. **Risk Forecast** (`modules/forecast_risk.py`)

Previsão e análise preditiva de riscos:
- Analisa dados históricos
- Prevê riscos futuros
- Gera matriz de prioridade
- Fornece recomendações estratégicas

### 5. **Logger** (`core/logger.py`)

Sistema de logging com timestamp:
- Registra eventos em `nautilus_logs.txt`
- Timestamp automático
- Rastreabilidade completa

### 6. **PDF Exporter** (`core/pdf_exporter.py`)

Exporta relatórios para PDF:
- Lê dados de JSON
- Gera documento formatado
- Adiciona timestamp e metadados

### 7. **SGSO Connector** (`core/sgso_connector.py`)

Conector para Sistema de Gestão de Segurança Operacional:
- Estabelece conexão com SGSO
- Recupera status do sistema
- Acessa logs operacionais

## 🔄 Fluxo de Execução

```
┌─────────────────┐
│   main.py       │
│   Ponto de      │
│   Entrada       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Decision Core   │◄──────── Estado persistente
│ Menu Principal  │          (nautilus_state.json)
└────────┬────────┘
         │
         ├──► 1. Exportar PDF ──────► pdf_exporter.py
         │
         ├──► 2. FMEA Audit ────────► audit_fmea.py
         │
         ├──► 3. SGSO Connect ──────► sgso_connector.py
         │
         └──► 4. Submenu
              │
              ├──► ASOG Review ─────► asog_review.py
              │
              └──► Forecast ────────► forecast_risk.py
```

## 📊 Estado do Sistema

O sistema mantém estado persistente em `nautilus_state.json`:

```json
{
    "ultima_acao": "Rodar Auditoria FMEA",
    "timestamp": "2025-10-20T01:10:43.123456"
}
```

Isso permite:
- Rastreabilidade de ações
- Retomada de contexto
- Auditoria de operações

## 📝 Logs

Todos os eventos são registrados em `nautilus_logs.txt`:

```
[2025-10-20 01:10:43.123456] Novo estado do Nautilus inicializado.
[2025-10-20 01:10:45.234567] Iniciando auditoria FMEA
[2025-10-20 01:10:47.345678] Auditoria FMEA concluída
[2025-10-20 01:10:47.456789] Estado atualizado: Rodar Auditoria FMEA
```

## 🧪 Testes

Execute a suite de testes:

```bash
python3 test_decision_core.py
```

Testes cobrem:
- ✅ Logger Module
- ✅ FMEA Auditor Module
- ✅ ASOG Review Module
- ✅ Risk Forecast Module
- ✅ SGSO Connector Module
- ✅ PDF Exporter Module
- ✅ Decision Core Module

## 🔐 Segurança e Conformidade

- **Rastreabilidade**: Todos os eventos são logados
- **Auditoria**: Estado persistente para revisão
- **Conformidade**: Módulos seguem normas IMCA, MTS, IMO
- **Integridade**: Validação de dados em todas as operações

## 🚧 Roadmap

- [ ] Integração com API REST
- [ ] Dashboard web para visualização
- [ ] Exportação PDF completa (usando reportlab)
- [ ] Integração real com SGSO
- [ ] Análise de IA com OpenAI GPT-4
- [ ] Notificações por email
- [ ] Interface gráfica (GUI)

## 📄 Dependências

Atualmente, o sistema usa apenas **Python Standard Library** (sem dependências externas).

Para funcionalidades futuras, instale:

```bash
pip install reportlab requests python-dotenv
```

## 🤝 Integração com Frontend

O Decision Core pode ser integrado com o frontend React/TypeScript do Nautilus One através de:

1. **API REST**: Expor endpoints para o frontend
2. **WebSockets**: Comunicação real-time
3. **Supabase Edge Functions**: Executar módulos Python no backend

## 📞 Suporte

Para questões ou suporte:
- **Repository**: https://github.com/RodrigoSC89/travel-hr-buddy
- **Issues**: https://github.com/RodrigoSC89/travel-hr-buddy/issues

## 📄 Licença

MIT — © 2025 Nautilus One

---

**Desenvolvido com IA** para operações marítimas, offshore e industriais 🚢
