# Módulo: MLC Inspection

## ✅ Objetivo

Gerenciar inspeções de conformidade com a Maritime Labour Convention (MLC), com checklist oficial, IA explicativa e exportação de evidências para garantir a conformidade com os direitos dos marítimos e condições de trabalho a bordo.

## 📁 Estrutura de Arquivos

```
src/modules/compliance/mlc-inspection/
├── MLCInspectionDashboard.tsx          # Dashboard principal
├── components/
│   ├── EvidenceUploader.tsx            # Upload de evidências
│   ├── InspectionsList.tsx             # Lista de inspeções
│   ├── CreateInspectionDialog.tsx      # Diálogo de criação
│   ├── InspectorChatbot.tsx            # Assistente IA
│   └── ChecklistInterface.tsx          # Interface do checklist
├── index.ts                             # Exportações
└── lib/
    └── mlc-schema.ts                    # Schema MLC oficial

tests/
├── mlc-inspection.test.ts               # Unit tests
└── e2e/
    └── playwright/
        └── mlc-inspection.spec.ts       # E2E tests

services/
└── mlc-inspection.service.ts            # Serviços de API
```

## 🛢️ Tabelas Supabase

### `mlc_checklist_items`
Itens oficiais do checklist MLC 2006.

**Campos principais:**
- `id`: UUID único
- `title`: Título MLC (Title 1-5)
- `regulation`: Número da regulamentação
- `category`: Categoria (Minimum Age, Medical Certification, etc.)
- `description`: Descrição completa
- `inspection_type`: Tipo de inspeção

### `mlc_inspection_sessions`
Sessões de inspeção realizadas.

**Campos principais:**
- `id`: UUID único
- `vessel_id`: Referência à embarcação
- `inspector_id`: Inspetor responsável
- `inspector_name`: Nome do inspetor
- `inspection_date`: Data da inspeção
- `inspection_type`: initial, renewal, intermediate
- `status`: draft, in_progress, submitted, reviewed
- `created_at`: Timestamp de criação
- `updated_at`: Timestamp de atualização

### `mlc_findings`
Achados e não conformidades identificados.

**Campos principais:**
- `id`: UUID único
- `inspection_id`: Referência à inspeção
- `mlc_title`: Título MLC
- `mlc_regulation`: Regulamentação específica
- `category`: Categoria do achado
- `description`: Descrição detalhada
- `compliance`: boolean de conformidade
- `severity`: minor, major, critical
- `evidence_attached`: boolean de evidência
- `created_at`: Timestamp

### `mlc_evidence_uploads`
Evidências fotográficas e documentais.

**Campos principais:**
- `id`: UUID único
- `inspection_id`: Referência à inspeção
- `finding_id`: Referência ao achado (opcional)
- `file_url`: URL no Supabase Storage
- `file_type`: Tipo de arquivo
- `uploaded_by`: UUID do usuário
- `description`: Descrição da evidência
- `created_at`: Timestamp

## 🔌 Integrações

### Supabase Auth
- Autenticação de inspetores
- Controle de acesso baseado em roles
- Tracking de ações de usuário

### Supabase Storage
- Upload de fotos e documentos
- Armazenamento seguro de evidências
- URLs públicas com autenticação

### LLM para Explicações
- Explicações contextuais de itens MLC complexos
- Sugestões de ações corretivas
- Geração de relatórios de síntese
- API: OpenAI GPT-4 ou similar

### Exportação PDF/JSON
- Geração de relatórios oficiais MLC
- Exportação de dados para auditoria
- Formato compatível com autoridades portuárias

## 🧩 UI - Componentes

### MLCInspectionDashboard
Painel principal com:
- Estatísticas de inspeções
- Lista de inspeções recentes
- Filtros por status e data
- Ações rápidas (Nova inspeção, Relatórios)

### ChecklistInterface
- Accordion reativo por categoria MLC
- Checkboxes para cada item
- Botões de conformidade (Compliant/Non-Compliant/N/A)
- Campo de observações por item
- Progresso visual de conclusão

### EvidenceUploader
- Drag & drop de arquivos
- Preview de imagens
- Upload para Supabase Storage
- Associação com itens específicos

### InspectorChatbot
- Chat IA para assistência em tempo real
- Explicações de regulamentações MLC
- Sugestões baseadas no contexto da inspeção
- Histórico de perguntas

### CreateInspectionDialog
- Formulário de criação
- Seleção de embarcação
- Tipo de inspeção
- Data e inspetor

## 🔒 RLS Policies

### Políticas Implementadas

```sql
-- Inspetores podem ver suas próprias inspeções
CREATE POLICY "Inspector can view own inspections"
  ON mlc_inspection_sessions
  FOR SELECT
  USING (inspector_id = auth.uid());

-- Inspetores podem criar inspeções
CREATE POLICY "Inspector can create inspections"
  ON mlc_inspection_sessions
  FOR INSERT
  WITH CHECK (inspector_id = auth.uid());

-- Inspetores podem atualizar suas inspeções draft
CREATE POLICY "Inspector can update draft inspections"
  ON mlc_inspection_sessions
  FOR UPDATE
  USING (inspector_id = auth.uid() AND status = 'draft');

-- Administradores têm acesso total
CREATE POLICY "Admin full access"
  ON mlc_inspection_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Restrições por tenant_id (se multi-tenant)
CREATE POLICY "Tenant isolation"
  ON mlc_inspection_sessions
  FOR ALL
  USING (tenant_id = current_tenant_id());
```

## 📊 Status Atual

### ✅ Implementado
- Dashboard completo
- Sistema de checklist MLC oficial
- Upload de evidências
- Criação e edição de inspeções
- Lista de inspeções com filtros
- Chatbot IA para assistência
- Cálculo automático de conformidade

### ✅ Ativo no Sidebar
- Rota: `/compliance/mlc-inspection`
- Navegação integrada
- Ícone e label configurados

### ✅ Testes Automatizados Ativos
- Unit tests: `tests/mlc-inspection.test.ts`
- E2E tests: `tests/e2e/playwright/mlc-inspection.spec.ts`
- Cobertura de serviços e componentes

### 🟢 Pronto para Produção
- Validações implementadas
- RLS configurado
- Testes passando
- Documentação completa

## 📈 Melhorias Futuras

### Fase 2
- **Histórico Comparativo**: Comparação entre sessões de inspeção do mesmo navio
- **Chat LLM Contextual**: Chat com contexto de toda a inspeção em tempo real
- **Assinaturas Digitais**: Captura de assinatura do inspetor e capitão
- **Notificações**: Alertas de não conformidades críticas

### Fase 3
- **Checklist Offline (PWA)**: Modo offline para inspeções em áreas sem conectividade
- **OCR de Documentos**: Digitalização automática de certificados
- **Timeline de Ações Corretivas**: Acompanhamento de correções ao longo do tempo
- **Integração SIRE**: Conexão com OCIMF SIRE database

### Fase 4
- **Dashboard Analytics**: Visualizações avançadas de tendências
- **Benchmarking de Frota**: Comparação entre embarcações
- **API Pública**: Endpoints para integração com sistemas externos
- **Mobile App**: Aplicativo nativo iOS/Android

## 🔗 Referências

### MLC 2006 Compliance
- Title 1: Minimum requirements for seafarers to work on a ship
- Title 2: Conditions of employment
- Title 3: Accommodation, recreational facilities, food and catering
- Title 4: Health protection, medical care, welfare and social security protection
- Title 5: Compliance and enforcement

### Documentação Técnica
- [MLC Convention](https://www.ilo.org/global/standards/maritime-labour-convention/lang--en/index.htm)
- [Supabase Documentation](https://supabase.com/docs)
- [Playwright Testing](https://playwright.dev)

---

**Versão:** 1.0.0 (PATCH 633)  
**Data:** Novembro 2025  
**Status:** ✅ Implementação Completa  
**Testes:** ✅ PATCH 638 - Cobertura E2E e Unit
