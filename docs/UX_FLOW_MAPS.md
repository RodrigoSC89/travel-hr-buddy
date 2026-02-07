# 🗺️ UX FLOW MAPS — NAUTI ONE v8.2

> **Mapeamento completo dos fluxos de usuário**
> Data: 2026-02-07

---

## 1️⃣ FLUXO: PRIMEIRO ACESSO (Onboarding)

```
Landing Page → Login/Registro → Auth Callback
    ↓
Onboarding Tour (3 passos)
    ↓
Command Center (Dashboard Principal)
    ↓
Command Palette (Ctrl+K) → Qualquer módulo
```

**Critérios UX:**
- ✅ Tour interativo guia o usuário
- ✅ Dashboard mostra status geral imediato
- ✅ Command Palette permite descoberta de qualquer módulo

---

## 2️⃣ FLUXO: GESTÃO DE EMBARCAÇÃO (CRUD Completo)

```
Command Center → Ops Hub → Fleet Tab
    ↓
Lista de Embarcações (DataGrid)
    ├─ [+ Adicionar] → Formulário → Validação real-time → Toast sucesso
    ├─ [Editar] → Formulário preenchido → Salvar → Toast sucesso  
    ├─ [Deletar] → ConfirmDialog → Confirmar → Toast sucesso
    └─ [Exportar] → CSV download → Toast "Exportado"
```

**Critérios UX:**
- ✅ CTA primário visível (botão "Adicionar")
- ✅ Feedback para todas as ações (toasts)
- ✅ ConfirmDialog para deleção
- ✅ Skeleton loading durante carregamento
- ✅ Empty state se lista vazia

---

## 3️⃣ FLUXO: CRIAR VIAGEM

```
Ops Hub → Voyage Tab → [+ Nova Viagem]
    ↓
Dialog com formulário:
  - Número da viagem (auto-gerado)
  - Porto de origem (input)
  - Porto de destino (input)
  - Embarcação (select com dados reais)
  - Datas (date picker)
    ↓
[Criar] → Mutation Supabase → Toast sucesso → Lista atualizada
[Cancelar] → Fecha dialog → Sem side effects
```

**Critérios UX:**
- ✅ Formulário com labels claros
- ✅ Validação em tempo real
- ✅ Loading state no botão durante submissão
- ✅ Toast de erro se falhar

---

## 4️⃣ FLUXO: ORDEM DE SERVIÇO (Manutenção)

```
Maintenance Hub → Overview → [+ Nova OS]
    ↓
OS criada automaticamente com ID único
    ↓
Toast "Ordem de serviço criada"
    ↓
Workflow: Solicitação → Planejamento → Aprovação → Execução → Verificação
    ↓
WorkflowStatusBar atualiza dinamicamente
```

**Critérios UX:**
- ✅ Ação em 1 clique
- ✅ Feedback imediato
- ✅ Workflow visual mostra progresso
- ✅ Dados reais do Supabase

---

## 5️⃣ FLUXO: AUDITORIA MARÍTIMA

```
Compliance Hub → Selecionar Auditoria (12 opções)
    ↓
Página de Auditoria (ex: Pre-SIRE 2.0)
  - Checklist com itens verificáveis
  - Status por seção
  - Score de compliance
    ↓
[Criar Checklist] → CRUD Supabase → Toast
[Exportar Relatório] → CSV/PDF → Download
[AI Assistant] → Chat contextual → Sugestões
```

**Critérios UX:**
- ✅ 12 auditorias visíveis e acessíveis
- ✅ Score visual (badges coloridos)
- ✅ Export funcional
- ✅ AI contextual via Edge Function

---

## 6️⃣ FLUXO: GESTÃO DE TRIPULAÇÃO

```
Workbench → People → People Hub
    ↓
Lista de Tripulantes (DataGrid)
    ├─ [+ Adicionar] → Formulário completo
    ├─ [Ver Perfil] → Detalhes + certificados + histórico
    ├─ [Escala] → Crew Scheduler Gantt
    └─ [STCW/MLC] → Compliance de certificações
```

**Critérios UX:**
- ✅ Lifecycle completo visível
- ✅ Gantt visual para escalas
- ✅ Alertas de certificados expirando
- ✅ Export CSV funcional

---

## 7️⃣ FLUXO: AI CHAT

```
AI Hub → Chat Tab → Input de mensagem
    ↓
Enviar mensagem → Edge Function (ai-chat)
    ↓
Streaming de resposta → Markdown renderizado
    ↓
Agentes especializados disponíveis:
  - nauti-brain (geral)
  - mlc-assistant (compliance MLC)
  - safety-officer (segurança)
  - engineer-chief (manutenção)
```

**Critérios UX:**
- ✅ Input claro com placeholder
- ✅ Loading indicator durante geração
- ✅ Resposta formatada em markdown
- ✅ Seleção de agente especializado

---

## 8️⃣ FLUXO: BUSCA GLOBAL

```
Qualquer tela → Ctrl+K (ou ícone no header)
    ↓
Command Palette abre
    ↓
Digitar nome do módulo → Resultados filtrados (205+ módulos)
    ↓
[Enter] → Navega para o módulo
    ↓
Módulo abre com PageShell (título + ações + conteúdo)
```

**Critérios UX:**
- ✅ Acessível de qualquer tela
- ✅ Busca por nome legado e canônico
- ✅ Resultados instantâneos
- ✅ Atalho de teclado visível

---

## 9️⃣ FLUXO: EXPORTAÇÃO DE DADOS

```
Qualquer módulo com dados → Botão "Exportar" no ActionBar
    ↓
[Exportar CSV] → Gera arquivo → Download automático → Toast "Exportado com sucesso"
[Exportar JSON] → Gera arquivo → Download automático → Toast
    ↓
Se sem dados: Toast.error("Nenhum dado para exportar")
```

---

## 🔟 FLUXO: MÓDULO EM DEMO (IntegrationGuard)

```
Qualquer módulo sem backend → Rota ativa
    ↓
IntegrationGuard exibe:
  - Badge "DEMO" visível
  - Mensagem "Modo Demonstração"
  - Integração necessária (ex: "API Inmarsat")
  - [Configurar Integração] → /integrations
  - [Documentação] → Link externo
    ↓
Conteúdo do módulo continua navegável abaixo
```

---

## 📊 FLUXOS POR TIPO

| Tipo de Fluxo | Quantidade | Cobertura |
|---------------|-----------|-----------|
| CRUD completo | 15+ | ✅ 100% com feedback |
| Navegação | 415+ rotas | ✅ Zero 404s |
| Exportação | Todos os módulos | ✅ CSV/JSON funcional |
| Busca | 205+ módulos | ✅ Command Palette |
| Auditoria | 12 standards | ✅ 12/12 completas |
| AI assistida | 25+ agentes | ✅ Edge Function ativa |
| Demo/Guard | 5+ módulos | ✅ IntegrationGuard |

---

*Flow Maps — NAUTI ONE v8.2*
*Data: 2026-02-07*
