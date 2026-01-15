# 📋 MLC Inspection Module

## Maritime Labour Convention 2006 - Sistema de Inspeção Digital

O módulo MLC Inspection oferece uma solução completa para auditorias de conformidade com a Convenção do Trabalho Marítimo (MLC 2006), incluindo as emendas de 2022.

---

## 🎯 Funcionalidades

### ✅ Checklist Completo MLC 2006
- **65 itens** de verificação baseados na convenção
- **47 itens críticos** destacados
- **5 Títulos** da convenção cobertos:
  - Título 1: Requisitos mínimos para trabalho a bordo
  - Título 2: Condições de emprego
  - Título 3: Alojamento, lazer, alimentação e serviço de mesa
  - Título 4: Proteção da saúde, cuidados médicos e bem-estar
  - Título 5: Conformidade e execução

### 🤖 IA Integrada (MLCGuard AI)
- Chat com assistente especializado em MLC
- Geração automática de evidências para não conformidades
- Sugestões de ações corretivas baseadas em regulamentação
- Suporte por voz com ElevenLabs HD

### 📄 Relatórios Profissionais
- Exportação PDF com layout ILO
- Assinaturas digitais (Inspetor + Comandante)
- Plano de ação corretiva automático
- Envio por email com PDF anexo para Armador e Flag State

### 📱 PWA Offline
- Funcionamento completo sem internet
- Sincronização automática ao reconectar
- Indicadores visuais de status online/offline

---

## 🚀 Como Usar

### 1. Iniciar Nova Inspeção

1. Acesse `/mlc-inspection`
2. Preencha os dados da embarcação:
   - **Nome da Embarcação** (obrigatório)
   - **IMO Number**
   - **Bandeira (Flag State)**
   - **Porto de Inspeção**
   - **Nome do Inspetor**
3. Clique em **"Iniciar Inspeção"**

### 2. Preencher Checklist

1. Navegue para a aba **"Checklist"**
2. Expanda cada Título para ver os itens
3. Para cada item, selecione:
   - ✅ **Conforme** - Item atende requisitos
   - ❌ **Não Conforme** - Item com deficiência
   - ➖ **N/A** - Não aplicável
4. Adicione observações quando necessário

### 3. Gerar Evidências com IA

1. Vá para aba **"Evidências"**
2. Selecione um item não conforme
3. Clique em **"Gerar Evidência com IA"**
4. O MLCGuard AI irá:
   - Analisar a não conformidade
   - Referenciar artigos da MLC 2006
   - Sugerir ações corretivas
   - Gerar texto para relatório oficial

### 4. Exportar Relatório

1. Acesse a aba **"Relatório"**
2. Adicione Resumo Executivo (opcional)
3. Capture assinaturas digitais:
   - Assinatura do Inspetor
   - Assinatura do Comandante
4. Clique em **"Baixar PDF"** ou **"Enviar por Email"**

---

## 📧 Envio por Email

O relatório pode ser enviado automaticamente para:
- **Armador/Shipowner** (obrigatório)
- **Flag State** (opcional)
- **Emails adicionais** (separados por vírgula)

O email inclui:
- Resumo visual com score de compliance
- Tabela de não conformidades
- PDF completo como anexo
- Design profissional compatível com clientes de email

---

## 🔄 Modo Offline

### Como funciona:
1. O módulo detecta automaticamente a conectividade
2. Badge **"Online"** ou **"Offline"** aparece no banner
3. Dados são salvos localmente no IndexedDB
4. Ao reconectar:
   - Badge **"Sincronizando..."** aparece
   - Dados são enviados para Supabase
   - Badge **"Sincronizado"** confirma sucesso

### Indicadores visuais:
| Badge | Significado |
|-------|-------------|
| 🟢 Online | Conexão ativa com servidor |
| 🔴 Offline | Trabalhando localmente |
| 🔄 Sincronizando | Enviando dados pendentes |
| ✅ Sincronizado | Todos dados no servidor |

---

## 📊 Métricas de Compliance

O dashboard exibe em tempo real:
- **Score** - Percentual de conformidade
- **Conforme** - Itens aprovados
- **Não Conforme** - Itens com deficiência
- **Críticos** - Itens críticos pendentes
- **Total Itens** - 65 itens da MLC 2006
- **Progresso** - % do checklist preenchido

---

## 🧪 Testes E2E

Execute os testes automatizados:

```bash
# Rodar testes MLC
npx playwright test e2e/mlc-inspection.spec.ts

# Rodar com interface visual
npx playwright test e2e/mlc-inspection.spec.ts --ui

# Gerar relatório
npx playwright test e2e/mlc-inspection.spec.ts --reporter=html
```

### Cenários testados:
1. ✅ Dashboard carrega corretamente
2. ✅ Formulário de nova inspeção funciona
3. ✅ Checklist expande e permite marcação
4. ✅ Gerador de evidências IA responde
5. ✅ Relatório PDF é gerado
6. ✅ Modo offline salva dados localmente

---

## 🔗 Integrações

| Serviço | Função |
|---------|--------|
| **Supabase** | Persistência e sync |
| **Claude AI** | Análise de conformidade |
| **ElevenLabs** | Voz HD para chat |
| **Resend** | Envio de emails |
| **jsPDF** | Geração de relatórios |

---

## 📁 Estrutura de Arquivos

```
src/
├── components/mlc/
│   ├── MLCInspectionDashboardV2.tsx  # Dashboard principal
│   ├── MLCEvidenceGenerator.tsx       # Gerador de evidências IA
│   ├── MLCVoiceChat.tsx               # Chat por voz
│   ├── MLCReportGenerator.tsx         # Exportação PDF + Email
│   └── MLCOfflineIndicator.tsx        # Indicadores offline
├── data/
│   └── mlc-2022-checklist.ts          # 65 itens MLC 2006
├── hooks/
│   └── use-mlc-offline.ts             # Hook de sincronização
├── lib/mlc/
│   └── offline-storage.ts             # IndexedDB storage
└── pages/
    └── MLCInspection.tsx              # Página principal

supabase/functions/
├── mlc-generate-evidence/             # IA para evidências
├── mlc-voice-chat/                    # Chat MLC
├── mlc-voice-tts/                     # Text-to-speech
└── send-mlc-report/                   # Email com PDF
```

---

## 📝 Changelog

### v2.0.0 (2026-01-03)
- ✨ Checklist completo com 65 itens MLC 2006
- ✨ Modo offline PWA com IndexedDB
- ✨ Email com PDF anexo via Resend
- ✨ Chat por voz com ElevenLabs HD
- ✨ Layout V2 com indicadores visuais

### v1.0.0 (2025-12-28)
- 🎉 Versão inicial do módulo MLC

---

## 📞 Suporte

Para dúvidas sobre o módulo MLC Inspection:
- 📧 Email: support@nauti-one.app
- 📚 Docs: https://docs.nauti-one.app/mlc
- 💬 Chat: Disponível no sistema

---

*Desenvolvido por Nauti One - Maritime HR Management System*
