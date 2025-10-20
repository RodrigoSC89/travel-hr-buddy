# Audit Compliance Report Generator

## 📋 Descrição

Script Python para geração automática de relatórios de conformidade técnica em PDF, com hash SHA-256 e QR Code para rastreabilidade.

## 🎯 Objetivo

Gerar relatórios de auditoria técnica automatizados contendo:
- Status dos workflows de CI/CD
- Checklists de conformidade (IMCA M 117, NORMAM-101, PEO-DP)
- Métricas de qualidade (cobertura, acessibilidade, contraste)
- Assinatura digital (SHA-256)
- QR Code para validação

## 🚀 Uso

### Instalação de Dependências

```bash
pip install reportlab qrcode pillow
```

### Execução

```bash
python3 scripts/generate_audit_report.py
```

### Saída

O script gera dois arquivos no diretório `dist/`:

1. **`audit-report.pdf`** (≈18KB)
   - Relatório completo de conformidade técnica
   - Formato: PDF 1.4, página A4

2. **`qrcode.png`** (≈1.3KB)
   - QR Code contendo link para GitHub Actions + hash SHA-256
   - Formato: PNG, 530x530px, grayscale

## 📊 Conteúdo do Relatório

### Seção 1: Cabeçalho
- Título: Nautilus One – Relatório de Conformidade Técnica
- Data e hora de geração (UTC)
- Declaração de conformidade PEO-DP / NORMAM-101

### Seção 2: Validação
- Hash SHA-256 do arquivo `.github/workflows/build.yml`
- QR Code com link para GitHub Actions

### Seção 3: Status dos Workflows
- Build status
- Testes UI & Acessibilidade
- Cobertura de código
- Gatekeeper CI

### Seção 4: Conformidade Técnica
- IMCA M 117
- NORMAM-101
- PEO-DP

### Seção 5: Métricas e Alertas
- Contraste de cores (WCAG 2.1 AA)
- Cobertura de código (>85%)
- Testes de acessibilidade

### Seção 6: Rodapé
- Timestamp de geração
- Assinatura digital (primeiros 16 caracteres do hash)

## 🔐 Segurança

### Hash SHA-256

O script gera um hash SHA-256 do arquivo `.github/workflows/build.yml` para:
- Garantir integridade do workflow
- Rastrear versões
- Validar configuração CI/CD

Se o arquivo não existir, usa um hash padrão: `hashlib.sha256(b"nautilus-one-compliance").hexdigest()`

### QR Code

Formato do QR Code:
```
https://github.com/RodrigoSC89/travel-hr-buddy/actions | {SHA-256}
```

Permite:
- Acesso rápido aos logs de execução
- Validação da autenticidade
- Rastreamento completo

## 🔧 Personalização

### Alterar Arquivo de Hash

Para usar outro arquivo como base do hash:

```python
workflow_file = ".github/workflows/outro-arquivo.yml"
```

### Modificar Conteúdo do Relatório

O conteúdo é definido através de objetos `Paragraph` do ReportLab:

```python
content.append(Paragraph("Seu texto aqui", styles['Normal']))
```

Estilos disponíveis:
- `styles['Title']` - Título principal
- `styles['Heading2']` - Subtítulo
- `styles['Normal']` - Texto normal
- `styles['Italic']` - Texto em itálico

## 📦 Dependências

### reportlab (4.4.4)
- Geração de documentos PDF
- Layout e formatação
- Licença: BSD

### qrcode (8.2)
- Geração de QR Codes
- Licença: BSD

### pillow (12.0.0)
- Processamento de imagens
- Suporte para PNG
- Licença: HPND

## 🐛 Troubleshooting

### Erro: "ModuleNotFoundError: No module named 'reportlab'"

**Solução:**
```bash
pip install reportlab qrcode pillow
```

### Erro: "FileNotFoundError: [Errno 2] No such file or directory: 'dist/'"

**Solução:**
O script cria automaticamente o diretório `dist/`. Se o erro persistir, crie manualmente:
```bash
mkdir -p dist
```

### PDF não abre ou está corrompido

**Verificações:**
```bash
# Verificar tipo de arquivo
file dist/audit-report.pdf

# Saída esperada:
# dist/audit-report.pdf: PDF document, version 1.4, 1 page(s)
```

## 🧪 Testes

### Teste Básico

```bash
# Executar script
python3 scripts/generate_audit_report.py

# Verificar saída
ls -lh dist/

# Verificar tipos de arquivo
file dist/audit-report.pdf dist/qrcode.png
```

### Validação do Hash

```bash
# Gerar hash do build.yml
sha256sum .github/workflows/build.yml

# Comparar com o hash no relatório PDF
# (Abra o PDF e verifique a linha "SHA-256:")
```

## 📈 Integração CI/CD

Este script é executado automaticamente pelo workflow:
`.github/workflows/audit-compliance.yml`

### Trigger
- Push para branch `main`

### Artifact
- Nome: `audit-report`
- Conteúdo: `dist/audit-report.pdf`

### Acesso
1. GitHub Actions > Audit Compliance CI
2. Selecione a execução desejada
3. Download do artifact `audit-report`

## 📚 Recursos Adicionais

### ReportLab
- Documentação: https://www.reportlab.com/documentation/
- User Guide: https://www.reportlab.com/docs/reportlab-userguide.pdf

### QRCode
- Documentação: https://pypi.org/project/qrcode/
- GitHub: https://github.com/lincolnloop/python-qrcode

### Pillow
- Documentação: https://pillow.readthedocs.io/
- GitHub: https://github.com/python-pillow/Pillow

## 🔮 Melhorias Futuras

1. **Dados Dinâmicos:**
   - Integrar com GitHub API para buscar status real dos workflows
   - Obter cobertura real do Codecov
   - Coletar métricas de acessibilidade automaticamente

2. **Múltiplos Formatos:**
   - Exportar também em HTML
   - Gerar resumo executivo em Markdown
   - Criar dashboard interativo

3. **Assinatura Avançada:**
   - Implementar assinatura GPG
   - Adicionar certificado digital X.509
   - Timestamp RFC 3161

4. **Notificações:**
   - Email com relatório anexado
   - Integração Slack/Teams
   - Webhooks personalizados

---

**Versão:** 1.0.0  
**Autor:** Nautilus One Compliance Engine  
**Licença:** Conforme repositório
