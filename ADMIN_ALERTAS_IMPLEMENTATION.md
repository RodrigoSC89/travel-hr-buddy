# Painel de Alertas Críticos da Auditoria - Implementação Completa

## 📋 Visão Geral

Implementação de um painel de alertas críticos para administradores, que permite visualizar alertas importantes gerados a partir de auditorias IMCA e seus comentários.

## 🎯 Funcionalidades

### ✅ Implementado

- **Painel de Visualização de Alertas**: Interface para visualizar alertas críticos não resolvidos
- **Sistema de Banco de Dados**: Tabelas para comentários de auditoria e alertas críticos
- **API Segura**: Endpoint protegido apenas para administradores
- **Interface Responsiva**: Design com destaque visual para alertas críticos
- **Atualização Automática**: Busca de alertas ao carregar a página
- **Exibição de Detalhes**: Mostra ID da auditoria, ID do comentário, data e descrição completa

## 🗄️ Estrutura do Banco de Dados

### Tabela: `comentarios_auditoria`

Armazena comentários associados às auditorias IMCA.

```sql
CREATE TABLE public.comentarios_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID NOT NULL REFERENCES public.auditorias_imca(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comentario TEXT NOT NULL,
  tipo TEXT DEFAULT 'normal' CHECK (tipo IN ('normal', 'critico', 'info', 'warning')),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Campos:**
- `id`: Identificador único do comentário
- `auditoria_id`: Referência à auditoria IMCA
- `user_id`: Usuário que criou o comentário
- `comentario`: Texto do comentário
- `tipo`: Tipo de comentário (normal, critico, info, warning)
- `criado_em`: Data de criação
- `atualizado_em`: Data da última atualização

### Tabela: `alertas_criticos`

Armazena alertas críticos gerados a partir de auditorias e comentários.

```sql
CREATE TABLE public.alertas_criticos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID NOT NULL REFERENCES public.auditorias_imca(id) ON DELETE CASCADE,
  comentario_id UUID REFERENCES public.comentarios_auditoria(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  nivel TEXT DEFAULT 'critico' CHECK (nivel IN ('critico', 'alto', 'medio', 'baixo')),
  resolvido BOOLEAN DEFAULT false,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolvido_em TIMESTAMP WITH TIME ZONE,
  resolvido_por UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
```

**Campos:**
- `id`: Identificador único do alerta
- `auditoria_id`: Referência à auditoria relacionada
- `comentario_id`: Referência ao comentário que gerou o alerta (opcional)
- `descricao`: Descrição detalhada do alerta
- `nivel`: Nível de severidade (critico, alto, medio, baixo)
- `resolvido`: Status de resolução
- `criado_em`: Data de criação
- `resolvido_em`: Data de resolução
- `resolvido_por`: Usuário que resolveu o alerta

### Segurança RLS (Row Level Security)

Ambas as tabelas implementam políticas de segurança:

**Para `comentarios_auditoria`:**
- Usuários podem ver comentários de suas próprias auditorias
- Admins podem ver todos os comentários
- Usuários podem inserir comentários em suas auditorias
- Admins podem inserir comentários em qualquer auditoria

**Para `alertas_criticos`:**
- Apenas admins podem visualizar, inserir, atualizar e deletar alertas

## 🔌 API Endpoint

### GET /functions/v1/admin-alertas

Retorna lista de alertas críticos não resolvidos.

**Autenticação:** Bearer Token (obrigatório)

**Autorização:** Apenas usuários com role 'admin'

**Resposta de Sucesso (200):**
```json
[
  {
    "id": "uuid",
    "auditoria_id": "uuid",
    "comentario_id": "uuid",
    "descricao": "Descrição do alerta crítico",
    "nivel": "critico",
    "resolvido": false,
    "criado_em": "2025-10-16T16:23:45.765Z",
    "resolvido_em": null,
    "resolvido_por": null
  }
]
```

**Respostas de Erro:**
- `401`: Não autenticado
- `403`: Acesso negado (não é admin)
- `500`: Erro interno do servidor

## 🎨 Interface do Usuário

### Componente: `PainelAlertasCriticos`

Localização: `src/components/admin/PainelAlertasCriticos.tsx`

**Props:** Nenhuma

**Features:**
- Loading state com spinner animado
- Error handling com mensagens descritivas
- Empty state quando não há alertas
- Cards com destaque visual vermelho para alertas críticos
- Formatação de datas em português (pt-BR)
- Exibição de múltiplas linhas de texto com `whitespace-pre-wrap`
- Badge de nível de severidade

### Página: `/admin/alerts`

Localização: `src/pages/admin/alerts.tsx`

Página dedicada que renderiza o componente `PainelAlertasCriticos` com container responsivo.

## 📁 Estrutura de Arquivos

```
travel-hr-buddy/
├── supabase/
│   ├── migrations/
│   │   └── 20251016162400_create_alertas_criticos.sql
│   └── functions/
│       └── admin-alertas/
│           └── index.ts
└── src/
    ├── components/
    │   └── admin/
    │       └── PainelAlertasCriticos.tsx
    ├── pages/
    │   └── admin/
    │       └── alerts.tsx
    └── App.tsx (atualizado com rota)
```

## 🚀 Como Usar

### Para Desenvolvedores

1. **Aplicar a migração do banco de dados:**
   ```bash
   # A migração será aplicada automaticamente ao fazer push para Supabase
   supabase db push
   ```

2. **Fazer deploy da Edge Function:**
   ```bash
   supabase functions deploy admin-alertas
   ```

3. **Acessar o painel:**
   - Fazer login como administrador
   - Navegar para `/admin/alerts`

### Para Usuários Admin

1. Acesse o painel administrativo
2. Navegue para "Alertas" ou acesse diretamente `/admin/alerts`
3. Visualize os alertas críticos pendentes
4. Clique em um alerta para ver detalhes completos

## 🎯 Casos de Uso

### Cenário 1: Auditoria com Problemas Críticos

Quando uma auditoria IMCA identifica problemas críticos de segurança:
1. O auditor adiciona um comentário marcado como "crítico"
2. Um alerta é criado automaticamente ou manualmente na tabela `alertas_criticos`
3. O alerta aparece no painel para todos os administradores
4. Administradores podem tomar ações baseadas no alerta
5. Após resolução, o alerta pode ser marcado como resolvido

### Cenário 2: Monitoramento de Compliance

Administradores podem:
- Monitorar alertas em tempo real
- Identificar tendências de problemas
- Priorizar ações baseadas no nível de severidade
- Manter histórico de resolução de problemas

## 🔐 Segurança

### Autenticação e Autorização

- **Autenticação**: Requer token JWT válido do Supabase
- **Autorização**: Apenas usuários com `role = 'admin'` na tabela `profiles`
- **RLS**: Políticas de segurança em nível de linha no banco de dados
- **CORS**: Headers configurados para permitir apenas origens autorizadas

### Dados Sensíveis

- Alertas críticos são visíveis apenas para administradores
- Comentários de auditoria seguem políticas RLS
- Logs de auditoria mantêm rastreabilidade

## 📊 Dados de Exemplo

A migração inclui dados de exemplo para testes:
- 1 auditoria de segurança crítica
- 3 comentários de diferentes tipos
- 2 alertas críticos não resolvidos

## 🐛 Troubleshooting

### Alertas não aparecem

**Causa:** Edge Function não está deployada ou URL incorreta
**Solução:** 
```bash
supabase functions deploy admin-alertas
```

### Erro 403 (Acesso Negado)

**Causa:** Usuário não é admin
**Solução:** Verificar role na tabela `profiles`:
```sql
SELECT role FROM profiles WHERE id = auth.uid();
```

### Erro ao buscar alertas

**Causa:** Migração não aplicada
**Solução:**
```bash
supabase db reset  # Para desenvolvimento
# ou
supabase db push   # Para aplicar apenas novas migrações
```

## 🔄 Roadmap Futuro

### Funcionalidades Planejadas

- [ ] Filtros por nível de severidade
- [ ] Filtros por data de criação
- [ ] Paginação para grandes volumes de alertas
- [ ] Marcar alertas como resolvidos via UI
- [ ] Notificações push para novos alertas
- [ ] Dashboard com estatísticas de alertas
- [ ] Exportação de relatórios de alertas
- [ ] Histórico de alertas resolvidos
- [ ] Integração com sistema de tickets
- [ ] Alertas por email para admins

## 📝 Notas Técnicas

### Dependências

- React 18+
- Supabase JS Client 2.57.4+
- Radix UI componentes
- Lucide React para ícones
- TailwindCSS para estilização

### Performance

- Limite de 50 alertas por requisição
- Índices otimizados em `auditoria_id`, `comentario_id` e `criado_em`
- Queries filtradas apenas para alertas não resolvidos

### Compatibilidade

- Desktop: Chrome, Firefox, Safari, Edge (últimas 2 versões)
- Mobile: iOS Safari, Chrome Android
- Requer JavaScript habilitado

## 📚 Recursos Relacionados

- [Documentação do Supabase](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [React Query Documentation](https://tanstack.com/query/latest)

## 🤝 Contribuindo

Para contribuir com melhorias:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Adicione testes
5. Submeta um Pull Request

## 📜 Changelog

### v1.0.0 - 2025-10-16

**Adicionado:**
- Tabelas `comentarios_auditoria` e `alertas_criticos`
- Edge Function `admin-alertas`
- Componente `PainelAlertasCriticos`
- Página `/admin/alerts`
- Dados de exemplo para testes
- Documentação completa

**Segurança:**
- RLS policies implementadas
- Autorização apenas para admins
- Validação de tokens JWT

---

**Autor:** Sistema de Desenvolvimento Automatizado
**Data:** 16 de Outubro de 2025
**Versão:** 1.0.0
