# 🌐 BridgeLink Module - Nautilus One

## Visão Geral

O **BridgeLink** é um módulo Python do Sistema Nautilus One responsável por estabelecer comunicação segura com o SGSO (Sistema de Gestão de Segurança Operacional), enviando relatórios críticos para o servidor remoto.

## 🔧 Módulos Disponíveis

| Módulo | Função |
|--------|---------|
| FMEA Auditor | Diagnóstico e análise de falhas |
| ASOG Review | Verificação operacional |
| Forecast de Risco | Previsão preditiva |
| Auto-Report | Consolidação e geração de relatório |
| **BridgeLink** | **Comunicação segura com o SGSO** |

## 📦 Instalação

### Requisitos
- Python 3.8+
- pip

### Setup

```bash
# Instalar dependências
pip install -r requirements.txt

# Configurar credenciais (opcional)
# Editar config.json com endpoint e token reais
```

## 🚀 Uso

### Modo Interativo (Menu)

```bash
python main.py
```

Selecione a opção **6** no menu para executar o BridgeLink:

```
🔱 NAUTILUS ONE - DECISION CORE
============================================================
1. 🔍 FMEA Auditor - Diagnóstico e análise de falhas
2. ✅ ASOG Review - Verificação operacional
3. 📊 Forecast de Risco - Previsão preditiva
4. 📝 Auto-Report - Consolidação e geração de relatório
5. 🎯 Executar todos os módulos
6. 🌐 Transmitir relatórios ao SGSO (BridgeLink)
0. ❌ Sair
============================================================

➤ Escolha uma opção: 6
```

### Modo Programático

```python
from modules.bridge_link import BridgeLink

# Criar instância e sincronizar
bridge = BridgeLink()
bridge.sincronizar()
```

## 📊 Relatórios Enviados

O BridgeLink processa e envia os seguintes relatórios:

1. **FMEA** (`relatorio_fmea_atual.json`)
   - Análise de modos de falha e efeitos
   - Componentes críticos
   - RPN (Risk Priority Number)

2. **ASOG** (`asog_report.json`)
   - Auditoria de segurança operacional
   - Conformidade com procedimentos
   - Pontuação de segurança

3. **FORECAST** (`forecast_risco.json`)
   - Previsão de riscos operacionais
   - Análise meteorológica
   - Recomendações de IA

4. **AUTO_REPORT** (`nautilus_full_report.json`)
   - Relatório consolidado do sistema
   - Métricas operacionais
   - Status geral da embarcação

## 🔐 Configuração

### Arquivo config.json

```json
{
  "endpoint": "https://api.sgso.nautilus.one/upload",
  "auth_token": "Bearer SEU_TOKEN_REAL_AQUI"
}
```

### Variáveis Configuráveis

- `endpoint`: URL do servidor SGSO
- `auth_token`: Token de autenticação Bearer

## 📘 Logs

Os logs são armazenados em:
- **Arquivo**: `nautilus_system.log`
- **Console**: Saída padrão

### Formato de Log

```
[2025-10-20 00:05:44] BridgeLink iniciado.
[2025-10-20 00:05:44] Relatório FMEA enviado com sucesso.
[2025-10-20 00:05:45] Relatório ASOG enviado com sucesso.
[2025-10-20 00:05:45] Relatório FORECAST enviado com sucesso.
[2025-10-20 00:05:46] Relatório AUTO_REPORT enviado com sucesso.
[2025-10-20 00:05:46] Transmissão concluída.
```

## 🛡️ Segurança

- ✅ Autenticação via Bearer Token
- ✅ Timeout de 15 segundos em requisições
- ✅ Logging de todas as operações
- ✅ Tratamento de erros de conexão
- ✅ Validação de arquivos JSON

## 🧪 Teste Manual

Para testar o módulo com os arquivos de exemplo fornecidos:

```bash
# 1. Verificar arquivos de relatório
ls -la *.json

# 2. Executar o sistema
python main.py

# 3. Selecionar opção 6 (BridgeLink)

# 4. Verificar logs
cat nautilus_system.log
```

## 📁 Estrutura de Arquivos

```
.
├── main.py                          # Decision Core (menu principal)
├── requirements.txt                 # Dependências Python
├── config.json                      # Configuração do sistema
├── core/
│   ├── __init__.py
│   └── logger.py                    # Módulo de logging
├── modules/
│   ├── __init__.py
│   └── bridge_link.py              # Módulo BridgeLink
├── relatorio_fmea_atual.json       # Exemplo FMEA
├── asog_report.json                # Exemplo ASOG
├── forecast_risco.json             # Exemplo Forecast
└── nautilus_full_report.json       # Exemplo Auto-Report
```

## 🔄 Integração com Git

### Commit e Push

```bash
# Criar branch
git checkout -b feature/bridge-link-module

# Adicionar arquivos
git add modules/bridge_link.py main.py core/ requirements.txt config.json

# Commit
git commit -m "Implementação do módulo BridgeLink com envio seguro de relatórios ao SGSO"

# Push
git push origin feature/bridge-link-module
```

## 🚨 Tratamento de Erros

O módulo trata os seguintes cenários:

1. **Arquivo não encontrado**: Log e alerta ao usuário
2. **Erro de JSON inválido**: Log e pula para próximo arquivo
3. **Falha de conexão**: Log e continua tentando outros relatórios
4. **Timeout**: Falha após 15 segundos
5. **Status HTTP diferente de 200**: Log e marca como falha

## 📞 Suporte

Para questões ou problemas relacionados ao BridgeLink:
- Verificar logs em `nautilus_system.log`
- Validar configuração em `config.json`
- Testar conectividade com o endpoint SGSO
- Verificar validade do token de autenticação

## 📄 Licença

MIT — © 2025 Nautilus One
