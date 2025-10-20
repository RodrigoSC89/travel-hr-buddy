# Audit Compliance CI - Quick Start Guide

## 🚀 Início Rápido

Este guia permite que você comece a usar o módulo **Audit Compliance CI** em menos de 5 minutos.

---

## 📋 Pré-requisitos

✅ Python 3.11+ instalado  
✅ Acesso ao repositório GitHub  
✅ Permissões para executar workflows  

---

## ⚡ Uso Rápido

### Opção 1: Automático (Recomendado)

O workflow executa **automaticamente** após cada push no `main`:

```bash
# 1. Fazer alterações no código
git add .
git commit -m "feat: nova funcionalidade"

# 2. Push para main (ou merge PR)
git push origin main

# 3. Aguardar 30 segundos

# 4. Acessar o relatório
# GitHub → Actions → Audit Compliance CI → Última execução → Download artifact
```

**Pronto! O relatório PDF está disponível para download.**

---

### Opção 2: Manual (Desenvolvimento Local)

Para testar localmente:

```bash
# 1. Instalar dependências (uma vez)
pip install reportlab qrcode pillow

# 2. Executar o script
python3 scripts/generate_audit_report.py

# 3. Verificar output
ls -lh dist/
# Output:
# audit-report.pdf  (~18KB)
# qrcode.png        (~1.3KB)

# 4. Abrir o PDF
open dist/audit-report.pdf  # macOS
xdg-open dist/audit-report.pdf  # Linux
start dist/audit-report.pdf  # Windows
```

---

## 📦 O Que Você Recebe

### 📄 audit-report.pdf

Relatório completo contendo:

- ✅ Status dos workflows
- ✅ Conformidade técnica (PEO-DP, NORMAM-101, IMCA M 117)
- ✅ Métricas de qualidade
- ✅ Hash SHA-256 para validação
- ✅ QR Code para rastreabilidade
- ✅ Assinatura digital

### 🔲 qrcode.png

QR Code que contém:
- Link para GitHub Actions
- Hash SHA-256 do workflow

---

## 🎯 Exemplos de Uso

### Exemplo 1: Auditoria Mensal

```bash
# No final do mês, fazer merge de todas as PRs aprovadas
git checkout main
git pull origin main

# O relatório é gerado automaticamente
# Acessar GitHub Actions e baixar o artifact do último dia do mês
```

### Exemplo 2: Validação Pré-Deploy

```bash
# Antes de fazer deploy em produção
# 1. Gerar relatório localmente
python3 scripts/generate_audit_report.py

# 2. Revisar o PDF
open dist/audit-report.pdf

# 3. Verificar conformidade
# ✓ Todos os workflows passando?
# ✓ Cobertura > 85%?
# ✓ Conformidade OK?

# 4. Prosseguir com deploy
npm run deploy:vercel
```

### Exemplo 3: Certificação

```bash
# Para certificação PEO-DP / Petrobras
# 1. Coletar relatórios dos últimos 3 meses
gh run list --workflow=audit-compliance.yml --limit 90

# 2. Baixar artifacts
gh run download <run-id> -n audit-report

# 3. Compilar documentação de certificação
# (incluir os PDFs no pacote de certificação)
```

---

## 🔍 Verificação Rápida

### Verificar se o Workflow Está Ativo

```bash
# Listar workflows
gh workflow list

# Buscar "Audit Compliance CI"
# Status esperado: "active"
```

### Verificar Última Execução

```bash
# Ver últimas execuções
gh run list --workflow=audit-compliance.yml --limit 5

# Ver detalhes da última execução
gh run view --workflow=audit-compliance.yml

# Ver logs
gh run view --workflow=audit-compliance.yml --log
```

### Verificar Artifacts

```bash
# Listar artifacts da última execução
gh run list --workflow=audit-compliance.yml --limit 1
gh run view <run-id>

# Baixar artifact
gh run download <run-id> -n audit-report
```

---

## ❓ FAQ

### P: O workflow não executou após push no main. Por quê?

**R:** Verifique:
1. ✓ Push foi realmente para `main` (não `develop` ou outra branch)?
2. ✓ Workflow está ativado? (`gh workflow list`)
3. ✓ Há algum erro de sintaxe no YAML? (`gh workflow view audit-compliance.yml`)

### P: Como baixar o artifact sem usar gh CLI?

**R:** Via interface web:
1. GitHub.com → Seu repositório
2. Actions → Audit Compliance CI
3. Clicar na execução desejada
4. Rolar até "Artifacts"
5. Clicar em "audit-report" para download

### P: O PDF está em branco ou corrompido?

**R:** Verifique:
```bash
# Validar arquivo
file dist/audit-report.pdf
# Esperado: "PDF document, version 1.4"

# Se corrompido, remover e regenerar
rm -rf dist/
python3 scripts/generate_audit_report.py
```

### P: Como validar o hash SHA-256?

**R:**
```bash
# Gerar hash do workflow
sha256sum .github/workflows/build.yml

# Comparar com o hash no PDF
# Devem ser idênticos
```

### P: Posso customizar o conteúdo do relatório?

**R:** Sim! Edite `scripts/generate_audit_report.py`:
- Linhas 51-55: Status dos workflows
- Linhas 58-62: Conformidade técnica
- Linhas 65-69: Métricas e alertas

---

## 🎨 Personalização Rápida

### Alterar Título do Relatório

```python
# scripts/generate_audit_report.py, linha ~43
content.append(Paragraph(
    "<b>Seu Título Customizado</b>", 
    styles['Title']
))
```

### Alterar Arquivo Base do Hash

```python
# scripts/generate_audit_report.py, linha ~30
workflow_file = ".github/workflows/outro-arquivo.yml"
```

### Adicionar Nova Seção

```python
# scripts/generate_audit_report.py, após linha ~69
content.append(Spacer(1, 20))
content.append(Paragraph("<b>Nova Seção</b>", styles['Heading2']))
content.append(Paragraph("Conteúdo da nova seção", styles['Normal']))
```

---

## 📚 Documentação Completa

Para informações detalhadas, consulte:

- 📖 **Documentação Técnica:** `AUDIT_COMPLIANCE_CI_DOCUMENTATION.md`
- 🔧 **Documentação do Script:** `scripts/README_AUDIT_COMPLIANCE.md`
- 📊 **Resumo Visual:** `AUDIT_COMPLIANCE_CI_VISUAL_SUMMARY.md`

---

## 🆘 Suporte

### Problemas Comuns

| Problema | Solução Rápida |
|----------|----------------|
| `ModuleNotFoundError: reportlab` | `pip install reportlab qrcode pillow` |
| `dist/` não existe | Script cria automaticamente; verificar permissões |
| Workflow não aparece em Actions | Fazer push para `main` para ativar |
| PDF não abre | Verificar com `file dist/audit-report.pdf` |

### Comandos de Debug

```bash
# Verificar Python
python3 --version
# Esperado: Python 3.11+

# Verificar dependências
pip list | grep -E "(reportlab|qrcode|pillow)"

# Testar script com debug
python3 -v scripts/generate_audit_report.py

# Verificar logs do workflow
gh run view --log --workflow=audit-compliance.yml
```

---

## ✅ Checklist de Verificação

Use este checklist para garantir que tudo está funcionando:

- [ ] Python 3.11+ instalado
- [ ] Dependências instaladas (`pip install reportlab qrcode pillow`)
- [ ] Script executa sem erros (`python3 scripts/generate_audit_report.py`)
- [ ] PDF gerado com sucesso (`ls dist/audit-report.pdf`)
- [ ] QR Code gerado (`ls dist/qrcode.png`)
- [ ] Workflow ativo no GitHub Actions
- [ ] Push no `main` ativa o workflow
- [ ] Artifact disponível para download
- [ ] PDF pode ser aberto e lido
- [ ] Hash SHA-256 está correto

---

## 🎉 Pronto!

Você está pronto para usar o **Audit Compliance CI**!

**Próximos passos:**
1. Fazer merge deste PR para `main`
2. Aguardar primeira execução automática
3. Baixar o primeiro relatório
4. Começar a usar em seus processos de auditoria

---

**Tempo estimado:** 2 minutos  
**Nível de dificuldade:** ⭐ Básico  
**Última atualização:** 2025-10-20
