# IMCA Audit Module - Quick Start Guide

## 🚀 Quick Access

**URL**: `/admin/auditoria-imca`

## ⚡ 3-Step Usage

### 1. Enter Ship Name
```
Example: Aurora Explorer
```

### 2. Describe Operational Context
```
Example: 
Durante operação de DSV, detectamos falha intermitente no 
sensor GPS-2 e perda de redundância no sistema DP. O navio 
manteve posição com DP Auto, mas houve 3 alarmes de low-low 
no controle de propulsão. Equipe técnica realizou checagem 
manual dos thrusters. Necessário auditoria completa dos 
sistemas de posicionamento dinâmico.
```

### 3. Generate Report
Click **"Gerar Auditoria IMCA"** and wait ~10-30 seconds.

## 📋 What You'll Get

A comprehensive audit report with:

1. ✅ **Executive Summary** - Overview of findings
2. ✅ **Systems Evaluation** - Technical assessment
3. ✅ **IMCA Compliance** - Standards check
4. ✅ **Personnel Analysis** - Qualification review
5. ✅ **Documentation Review** - Records audit
6. ✅ **Risk Analysis** - Failures & mitigations
7. ✅ **Action Plan** - Prioritized next steps

## 🛠️ Setup Requirements

### Environment Variable
```bash
VITE_OPENAI_API_KEY=sk-your-key-here
```

Set this in:
- `.env` file for local development
- Environment variables in production

## 📚 IMCA Standards Covered

- **IMCA M103** - DP system design
- **IMCA M117** - Personnel qualification
- **IMCA M190** - Annual trials
- **IMCA M166** - FMEA analysis
- **IMCA M109** - Documentation
- **IMCA M220** - Operations planning
- **IMCA M140** - Capability plots
- **MSF 182** - OSV operations
- **IMO MSC.1/Circ.1580** - Guidelines

## ⚠️ Error Messages

### "API key not configured"
**Solution**: Set `VITE_OPENAI_API_KEY` environment variable

### "Por favor, informe o nome do navio"
**Solution**: Enter ship name in the first field

### "Por favor, descreva o contexto da operação"
**Solution**: Enter operational context in the text area

## 💡 Tips

1. **Be Specific**: More details = better audit reports
2. **Include Issues**: Mention all failures, alarms, and concerns
3. **Context Matters**: Describe operational conditions
4. **Save Reports**: Copy report to clipboard or save to file
5. **Regular Audits**: Run periodic audits for compliance

## 🔗 Related Documentation

- Full docs: `IMCA_AUDIT_MODULE_README.md`
- Technical details: `IMCA_AUDIT_IMPLEMENTATION_SUMMARY.md`

## 🎯 Example Use Cases

### 1. Post-Incident Audit
After a DP incident, document what happened and generate compliance report.

### 2. Pre-Operation Check
Before critical operations, verify all systems meet IMCA standards.

### 3. Annual Compliance
Generate yearly audit reports for regulatory compliance.

### 4. Training Tool
Use for training DP operators on IMCA standards and best practices.

### 5. Vessel Evaluation
Assess new vessels before charter or purchase.

## ⏱️ Performance

- **Report Generation**: 10-30 seconds
- **API Provider**: OpenAI GPT-4
- **Max Report Length**: ~4000 tokens
- **Concurrent Users**: Supported

## 🔒 Security

- API keys stored in environment variables
- No data stored on servers (unless you save it)
- HTTPS encryption for API calls
- Multi-tenant architecture support

## 📱 Access Levels

Module available to:
- ✅ Administrators
- ✅ Super Users
- ✅ Users with admin permissions

---

**Need Help?** Check the full documentation or contact support.

**Ready to Start?** Navigate to `/admin/auditoria-imca` and begin your first audit! 🚢
