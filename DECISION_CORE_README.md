# 🧭 Decision Core Module - Nautilus One

## 📋 Visão Geral

O **Decision Core** é o cérebro lógico do Nautilus One — um módulo central de decisão responsável por interpretar comandos do operador e executar o próximo passo lógico.

## 🎯 Objetivos do Módulo

O Decision Core:

- ✅ Interpreta comandos do operador
- ✅ Executa o módulo correspondente
- ✅ Atualiza o estado persistente (`nautilus_state.json`)
- ✅ Mantém rastreabilidade das ações no log técnico
- ✅ Permite retomada automática da última ação ao reiniciar o sistema

## 📂 Estrutura de Arquivos

```
/
├── main.py                          # Ponto de entrada principal
├── modules/
│   ├── __init__.py
│   ├── decision_core.py             # Módulo central de decisão
│   ├── audit_fmea.py                # Auditoria Técnica FMEA
│   ├── asog_review.py               # Review ASOG
│   └── forecast_risk.py             # Forecast de Risco
├── core/
│   ├── __init__.py
│   ├── logger.py                    # Sistema de logging
│   ├── pdf_exporter.py              # Exportação de PDF
│   └── sgso_connector.py            # Conexão com SGSO
└── nautilus_state.json              # Estado persistente (gerado em runtime)
```

## 🚀 Como Usar

### Iniciar o Sistema

```bash
python3 main.py
```

### Menu Interativo

Ao executar, você verá o seguinte menu:

```
🔧 Deseja seguir com:
1. 📄 Exportar parecer da IA como PDF
2. 🧠 Iniciar módulo Auditoria Técnica FMEA
3. 🔗 Conectar com SGSO/Logs
4. 🧾 Migrar para outro módulo (Forecast/ASOG Review)

Sua escolha: 
```

### Opções Disponíveis

#### Opção 1: Exportar PDF
- Exporta o parecer da IA como documento PDF
- Usa o arquivo `relatorio_fmea_atual.json` como entrada

#### Opção 2: Auditoria FMEA
- Inicia o módulo de Auditoria Técnica FMEA
- Analisa falhas e modos de operação

#### Opção 3: Conexão SGSO
- Conecta ao sistema SGSO (Sistema de Gestão de Saúde e Segurança Operacional)
- Sincroniza logs e eventos

#### Opção 4: Submenu de Módulos
- **ASOG Review**: Análise de procedimentos ASOG
- **Forecast de Risco**: Previsão de riscos operacionais

## 🔧 Componentes Principais

### DecisionCore Class

```python
from modules.decision_core import DecisionCore

nautilus = DecisionCore()
nautilus.processar_decisao()
```

**Métodos:**
- `carregar_estado()`: Carrega estado persistente do arquivo JSON
- `salvar_estado(acao)`: Salva o estado atual com timestamp
- `processar_decisao()`: Exibe menu e processa escolha do usuário
- `menu_modulos()`: Exibe submenu de módulos especializados

### Logger System

```python
from core.logger import log_event

log_event("Ação executada com sucesso")
```

Logs são salvos em `nautilus_logs.txt` com timestamp automático.

### State Management

O estado do sistema é persistido em `nautilus_state.json`:

```json
{
    "ultima_acao": "Rodar Auditoria FMEA",
    "timestamp": "2025-10-20T01:03:42.123456"
}
```

## 🧪 Testes

Execute o script de teste para validar a instalação:

```bash
python3 << 'EOF'
from modules.decision_core import DecisionCore
from core.logger import log_event

# Testar logger
log_event("Sistema inicializado")

# Testar DecisionCore
nautilus = DecisionCore()
print("✅ Módulo Decision Core funcionando corretamente!")
EOF
```

## 📊 Dependências

- Python 3.8+
- Módulos padrão: `json`, `datetime`

Não há dependências externas necessárias para a funcionalidade básica.

## 🔱 Próximos Passos

1. Implementar lógica completa nos módulos placeholder:
   - `audit_fmea.py`
   - `asog_review.py`
   - `forecast_risk.py`
   - `pdf_exporter.py`
   - `sgso_connector.py`

2. Adicionar integração com IA (GPT-4)

3. Implementar validação de entrada

4. Adicionar testes unitários completos

5. Documentar APIs de cada módulo

## 🐛 Troubleshooting

### Erro: "No module named 'modules'"

Certifique-se de executar o script do diretório raiz do projeto:

```bash
cd /caminho/para/travel-hr-buddy
python3 main.py
```

### Estado persistente não carrega

Verifique permissões de escrita no diretório:

```bash
chmod 755 .
touch nautilus_state.json
```

## 📝 Notas

- Os arquivos `nautilus_state.json` e `nautilus_logs.txt` são gerados automaticamente
- Estes arquivos estão no `.gitignore` e não são versionados
- Cada execução mantém histórico de ações no log

## 📄 Licença

MIT — © 2025 Nautilus One
