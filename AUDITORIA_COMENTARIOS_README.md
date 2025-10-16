# Sistema de Comentários de Auditoria IMCA com IA

## 📋 Visão Geral

Sistema completo de gerenciamento de comentários para auditorias IMCA com análise técnica automática por IA e exportação em PDF.

## ✨ Funcionalidades

### 1. Gerenciamento de Comentários

- **Adicionar Comentários**: Usuários podem adicionar comentários em auditorias
- **Listar Comentários**: Visualização de todos os comentários de uma auditoria
- **Ordenação**: Comentários ordenados por data (mais recentes primeiro)
- **Segurança**: Row Level Security (RLS) implementado

### 2. Análise Técnica com IA

- **Avaliação Automática**: Cada comentário é analisado automaticamente pela IA
- **Normas IMCA**: Respostas baseadas em normas técnicas IMCA
- **Detecção de Riscos**: Identificação automática de falhas críticas
- **Alertas Visuais**: Comentários críticos iniciados com "⚠️ Atenção: "

### 3. Exportação em PDF

- **Relatório Completo**: Exporta auditoria com todos os comentários
- **Formatação Profissional**: Layout limpo e organizado
- **Destaque de IA**: Comentários de IA são destacados visualmente
- **Alertas Críticos**: Warnings são destacados em vermelho
- **Metadados**: Inclui data de geração e informações da auditoria

## 🔧 Endpoints da API

### GET `/api/auditoria/[id]/comentarios`

Lista todos os comentários de uma auditoria.

**Parâmetros:**
- `id` (path): UUID da auditoria

**Resposta (200):**
```json
[
  {
    "id": "uuid-1",
    "comentario": "Texto do comentário",
    "created_at": "2025-10-16T12:00:00Z",
    "user_id": "user-uuid"
  },
  {
    "id": "uuid-2",
    "comentario": "⚠️ Atenção: Falha crítica detectada",
    "created_at": "2025-10-16T12:01:00Z",
    "user_id": "ia-auto-responder"
  }
]
```

**Erros:**
- `400`: ID inválido
- `500`: Erro ao buscar comentários

### POST `/api/auditoria/[id]/comentarios`

Adiciona um novo comentário e gera análise técnica com IA.

**Parâmetros:**
- `id` (path): UUID da auditoria
- Header `Authorization`: Bearer token do usuário

**Body:**
```json
{
  "comentario": "Texto do comentário"
}
```

**Resposta (201):**
```json
{
  "sucesso": true,
  "comentario": {
    "id": "uuid-1",
    "comentario": "Texto do comentário",
    "user_id": "user-uuid",
    "auditoria_id": "auditoria-uuid",
    "created_at": "2025-10-16T12:00:00Z"
  }
}
```

**Erros:**
- `400`: ID inválido ou comentário vazio
- `401`: Usuário não autenticado
- `500`: Erro ao inserir comentário

**Comportamento:**
1. Valida autenticação do usuário
2. Insere o comentário original
3. Envia comentário para análise IA
4. IA avalia riscos e fornece resposta técnica
5. Resposta da IA é inserida como comentário adicional

### GET `/api/auditoria/[id]/export-comentarios-pdf`

Exporta relatório da auditoria com comentários em PDF.

**Parâmetros:**
- `id` (path): UUID da auditoria

**Resposta (200):**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="auditoria-comentarios-{id}-{date}.pdf"`

**Conteúdo do PDF:**
1. Título do relatório
2. Informações da auditoria (título, descrição, data, status, pontuação)
3. Tabela de comentários com:
   - Data/Hora
   - Autor (Usuário ou IA IMCA)
   - Texto do comentário
4. Rodapé com data de geração

**Destaques Visuais:**
- Comentários de IA em azul e negrito
- Comentários críticos (⚠️) em vermelho
- Linhas alternadas para melhor legibilidade

**Erros:**
- `400`: ID inválido
- `404`: Auditoria não encontrada
- `405`: Método não permitido
- `500`: Erro ao gerar PDF

## 🗄️ Estrutura do Banco de Dados

### Tabela: `auditoria_comentarios`

```sql
CREATE TABLE auditoria_comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID NOT NULL REFERENCES auditorias_imca(id) ON DELETE CASCADE,
  comentario TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Campos:**
- `id`: Identificador único do comentário
- `auditoria_id`: Referência à auditoria (FK)
- `comentario`: Texto do comentário
- `user_id`: UUID do usuário ou "ia-auto-responder" para IA
- `created_at`: Data/hora de criação

**Índices:**
- `idx_auditoria_comentarios_auditoria_id`: Busca por auditoria
- `idx_auditoria_comentarios_created_at`: Ordenação por data
- `idx_auditoria_comentarios_user_id`: Filtro por usuário

## 🔒 Segurança (RLS)

### Políticas de Acesso

1. **SELECT - Usuários**: Veem comentários de suas próprias auditorias
2. **SELECT - Admins**: Veem todos os comentários
3. **INSERT - Usuários**: Podem adicionar comentários em suas auditorias
4. **INSERT - Sistema**: Pode inserir comentários de IA

## 🤖 Integração com OpenAI

### Configuração

Requer variável de ambiente:
```bash
OPENAI_API_KEY=sk-...
```

### Modelo Utilizado

- **Modelo**: GPT-4
- **Papel**: Engenheiro auditor da IMCA
- **Especialização**: Normas técnicas IMCA

### Prompt de Análise

```
Você é um auditor técnico baseado nas normas IMCA. Dado o seguinte comentário:
"{comentario}"
1. Responda tecnicamente.
2. Avalie se há algum risco ou falha crítica mencionada.
3. Se houver falha crítica, comece a resposta com: "⚠️ Atenção: "
```

### Tratamento de Erros

- Falhas na IA não impedem a criação do comentário original
- Erros são logados mas não propagados ao usuário
- Sistema continua funcionando mesmo sem resposta IA

## 📦 Dependências

### Backend
- `@supabase/supabase-js`: Cliente Supabase
- `openai`: Cliente OpenAI GPT-4
- `next`: API Routes
- `jspdf`: Geração de PDF
- `jspdf-autotable`: Tabelas em PDF
- `date-fns`: Formatação de datas

### Testing
- `vitest`: Framework de testes
- 146 testes unitários cobrindo:
  - Endpoints da API
  - Integração com IA
  - Geração de PDF
  - Segurança e validação

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Apenas comentários
npm test auditoria-comentarios-api.test.ts

# Apenas PDF export
npm test auditoria-export-pdf.test.ts
```

### Cobertura de Testes

- ✅ 67 testes para API de comentários
- ✅ 79 testes para exportação PDF
- ✅ 146 testes no total
- ✅ 100% dos testes passando

## 🚀 Uso

### Adicionar Comentário

```typescript
const response = await fetch(`/api/auditoria/${auditoriaId}/comentarios`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    comentario: 'Sistema de segurança apresentou falha'
  })
});

const result = await response.json();
// Comentário original inserido
// IA analisa e responde automaticamente
```

### Listar Comentários

```typescript
const response = await fetch(`/api/auditoria/${auditoriaId}/comentarios`);
const comentarios = await response.json();

// Comentários ordenados por data (mais recentes primeiro)
comentarios.forEach(c => {
  if (c.user_id === 'ia-auto-responder') {
    console.log('IA:', c.comentario);
  } else {
    console.log('Usuário:', c.comentario);
  }
});
```

### Exportar PDF

```typescript
// Link direto
window.open(`/api/auditoria/${auditoriaId}/export-comentarios-pdf`);

// Ou com fetch para controle adicional
const response = await fetch(
  `/api/auditoria/${auditoriaId}/export-comentarios-pdf`
);
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `auditoria-${auditoriaId}.pdf`;
a.click();
```

## 📝 Exemplo de Fluxo

1. **Usuário adiciona comentário**: "Detectado vazamento no sistema hidráulico"
2. **Sistema salva comentário** no banco de dados
3. **IA analisa o comentário** usando GPT-4
4. **IA responde**: "⚠️ Atenção: Vazamento no sistema hidráulico constitui falha crítica segundo norma IMCA M-220. Recomenda-se: 1) Isolamento imediato do sistema, 2) Inspeção completa das conexões, 3) Teste de pressão antes da reoperação."
5. **Resposta da IA é salva** como comentário adicional
6. **Usuário pode exportar** relatório em PDF com ambos os comentários

## 🎨 Características Visuais do PDF

- **Header**: Título profissional com logo
- **Metadados**: Informações completas da auditoria
- **Tabela**: Formatação em colunas organizadas
- **Cores**: 
  - Headers: Slate-900 (escuro)
  - Rows alternadas: Slate-50 (claro)
  - IA: Blue-600 (azul)
  - Warnings: Red-50 background, Red-900 text
- **Footer**: Timestamp de geração

## 🔍 Monitoramento

### Logs

```javascript
// Erros de IA são logados
console.error("Erro ao gerar resposta IA:", error);

// Erros de PDF são logados
console.error("Erro ao gerar PDF:", error);
```

### Métricas Sugeridas

- Tempo de resposta da IA
- Taxa de sucesso da análise IA
- Número de comentários críticos detectados
- Frequência de exportação de PDFs

## 📚 Referências

- [IMCA Standards](https://www.imca-int.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

## 🎯 Roadmap Futuro

- [ ] Suporte a anexos em comentários
- [ ] Notificações para comentários críticos
- [ ] Dashboard de análise de comentários
- [ ] Exportação em outros formatos (Word, Excel)
- [ ] Templates customizáveis de PDF
- [ ] Histórico de revisões de comentários
- [ ] Sistema de aprovação de comentários críticos
- [ ] Integração com outros sistemas de auditoria
