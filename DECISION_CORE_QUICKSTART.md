# ⚡ Decision Core - Quick Start Guide

Get up and running with Nautilus One Decision Core in 5 minutes!

## 🎯 Prerequisites

- Python 3.12 or higher
- Terminal/Command Line access
- Text editor (optional, for viewing logs)

## 🚀 Quick Setup (3 Steps)

### Step 1: Verify Python Installation

```bash
python3 --version
```

Expected output: `Python 3.12.x` or higher

### Step 2: Navigate to Project Directory

```bash
cd /path/to/travel-hr-buddy
```

### Step 3: Run the System

```bash
python3 main.py
```

That's it! No dependencies to install, no configuration needed. The system uses only Python's standard library.

## 🎮 First Run Tutorial

### What You'll See

When you run `python3 main.py`, you'll see:

```
🚀 Iniciando Nautilus One Decision Core...
============================================================
🔱 NAUTILUS ONE - DECISION CORE
============================================================

🔧 Deseja seguir com:
1. 📄 Exportar parecer da IA como PDF
2. 🧠 Iniciar módulo Auditoria Técnica FMEA
3. 🔗 Conectar com SGSO/Logs
4. 🧾 Migrar para outro módulo (Forecast/ASOG Review)
0. 🚪 Sair

➤ Sua escolha: 
```

### Try These Examples

#### Example 1: Export a PDF Report (Option 1)

```bash
➤ Sua escolha: 1
```

**Output:**
```
✅ PDF exportado com sucesso: relatorio_fmea_atual.pdf
   Tipo de relatório: Relatório FMEA
   Data: 2025-10-20 11:30:45

============================================================
✅ Operação concluída com sucesso!
============================================================
```

**What happened:**
- System generated a PDF report
- Logged the operation to `nautilus_logs.txt`
- Saved state to `nautilus_state.json`

#### Example 2: Run FMEA Audit (Option 2)

```bash
➤ Sua escolha: 2
```

**Output:**
```
🧠 AUDITORIA TÉCNICA FMEA
============================================================

📋 Iniciando análise de modos de falha...

   → Analisando: Sistema de Propulsão
      Status: Baixo
   → Analisando: Sistema de Navegação
      Status: Aceitável
   → Analisando: Sistema de Comunicação
      Status: Médio
   → Analisando: Sistema de Segurança
      Status: Baixo

============================================================
✅ Auditoria FMEA concluída com sucesso!
   Data: 2025-10-20 11:32:15
   Componentes analisados: 4
```

#### Example 3: Connect to SGSO (Option 3)

```bash
➤ Sua escolha: 3
```

**Output:**
```
🔗 Conectando ao SGSO...
   → Verificando credenciais...
   → Estabelecendo conexão segura...
   → Sincronizando dados...
✅ Conectado ao SGSO com sucesso!
   Timestamp: 2025-10-20 11:33:22
```

#### Example 4: Access Sub-Modules (Option 4)

```bash
➤ Sua escolha: 4
```

**Output:**
```
============================================================
🧩 Módulos Disponíveis:
============================================================
1. 📋 ASOG Review
2. 📊 Forecast de Risco
0. ⬅️  Voltar

➤ Escolha o módulo: 2
```

**Then select Risk Forecast:**
```
📊 FORECAST DE RISCO - Análise Preditiva
============================================================

🔍 Analisando fatores de risco...

📈 Fatores de Risco Identificados:
------------------------------------------------------------

   CLIMA
   ├─ Nível Atual: Moderado
   ├─ Tendência: Estável
   ├─ Previsão 7 dias: Baixo
   └─ Impacto: Médio

   [... more risk factors ...]

============================================================
✅ Forecast de Risco concluído com sucesso!
   Data da análise: 2025-10-20 11:35:10
   Período de previsão: até 2025-10-27
   Fatores analisados: 5

💡 Recomendações:
   • Manter monitoramento contínuo dos fatores operacionais
   • Revisar procedimentos de manutenção preventiva
   • Atualizar planos de contingência para condições climáticas
```

## 📁 Generated Files

After running the system, you'll find these files in your directory:

### `nautilus_state.json`
Contains the current system state:
```json
{
    "ultima_acao": "Forecast de Risco",
    "timestamp": "2025-10-20T11:35:10.123456"
}
```

### `nautilus_logs.txt`
Contains operation logs:
```
[2025-10-20 11:30:45] Exportando relatório: relatorio_fmea_atual.json
[2025-10-20 11:30:45] PDF exportado com sucesso
[2025-10-20 11:30:45] Estado atualizado: Exportar PDF
[2025-10-20 11:32:15] Iniciando Auditoria Técnica FMEA
[2025-10-20 11:32:15] Auditoria FMEA concluída com sucesso
...
```

## 🔍 Viewing Your Results

### Check Logs
```bash
cat nautilus_logs.txt
# or
tail -f nautilus_logs.txt  # to follow live
```

### Check State
```bash
cat nautilus_state.json
# or
python3 -m json.tool nautilus_state.json  # pretty print
```

## 🎯 Common Use Cases

### Use Case 1: Daily Operational Check
```bash
python3 main.py
# Choose option 2 (FMEA Audit)
# Review output
# Check logs for any issues
```

### Use Case 2: Risk Assessment
```bash
python3 main.py
# Choose option 4 (Sub-modules)
# Choose option 2 (Risk Forecast)
# Review recommendations
```

### Use Case 3: Generate Reports
```bash
python3 main.py
# Choose option 1 (Export PDF)
# Share the PDF with stakeholders
```

## 🛠️ Troubleshooting

### Problem: "Module not found" error
**Solution:** Make sure you're in the project root directory:
```bash
pwd  # Should show .../travel-hr-buddy
ls   # Should show main.py, core/, modules/
```

### Problem: "Permission denied" when writing files
**Solution:** Check write permissions:
```bash
ls -la  # Check permissions
chmod u+w .  # Add write permission if needed
```

### Problem: Can't see generated files
**Solution:** List all files including hidden ones:
```bash
ls -la
```

### Problem: Want to reset the system
**Solution:** Delete generated files:
```bash
rm nautilus_state.json nautilus_logs.txt
python3 main.py  # Fresh start
```

## 📚 Next Steps

Now that you're up and running:

1. **Read the full documentation**: [DECISION_CORE_README.md](DECISION_CORE_README.md)
2. **Understand the architecture**: [DECISION_CORE_ARCHITECTURE.md](DECISION_CORE_ARCHITECTURE.md)
3. **Try all modules**: Experiment with each option
4. **Review logs**: Understand what's happening under the hood
5. **Customize**: Modify modules for your specific needs

## 💡 Pro Tips

1. **Run in verbose mode**: Check logs after each operation
2. **Keep state history**: Back up `nautilus_state.json` periodically
3. **Monitor logs**: Use `tail -f nautilus_logs.txt` in a separate terminal
4. **Automate**: Create shell scripts for common workflows
5. **Integrate**: Connect with your existing systems

## 🎓 Learning Path

**Beginner** (5 minutes):
- ✅ Complete this quick start
- ✅ Try each menu option once
- ✅ View generated files

**Intermediate** (30 minutes):
- Read full README
- Understand state management
- Review log patterns

**Advanced** (1 hour):
- Study architecture documentation
- Extend with custom modules
- Integrate with external systems

## 🚀 You're Ready!

Congratulations! You now know how to:
- ✅ Start the Decision Core
- ✅ Navigate the menu system
- ✅ Execute operational modules
- ✅ View logs and state
- ✅ Troubleshoot common issues

Ready to dive deeper? Check out the [complete documentation](DECISION_CORE_README.md)!

---

**Questions?** Open an issue on GitHub or check the documentation.

**Happy commanding!** ⚓
