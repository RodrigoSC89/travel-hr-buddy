# Painel de Alertas Críticos - Guia Rápido

## 🚀 Acesso Rápido

**URL:** `/admin/alerts`
**Permissão:** Apenas Administradores

## 📦 Arquivos Criados

```
✅ supabase/migrations/20251016162400_create_alertas_criticos.sql
✅ supabase/functions/admin-alertas/index.ts
✅ src/components/admin/PainelAlertasCriticos.tsx
✅ src/pages/admin/alerts.tsx
✅ src/App.tsx (rota adicionada)
```

## 🗄️ Tabelas

### `comentarios_auditoria`
Armazena comentários das auditorias IMCA
- Tipos: normal, critico, info, warning
- RLS habilitado

### `alertas_criticos`
Armazena alertas críticos
- Níveis: critico, alto, medio, baixo
- Status: resolvido/não resolvido
- RLS habilitado

## 🔌 API

### Endpoint
```
GET /functions/v1/admin-alertas
Authorization: Bearer {token}
```

### Resposta
```json
[
  {
    "id": "uuid",
    "auditoria_id": "uuid",
    "comentario_id": "uuid",
    "descricao": "Texto do alerta",
    "nivel": "critico",
    "resolvido": false,
    "criado_em": "timestamp"
  }
]
```

## 🎨 Interface

### Componente Principal
`<PainelAlertasCriticos />`

### Features
- ⚠️ Título com emoji de alerta
- 🔴 Cards em vermelho para alertas críticos
- 📊 Exibe: Auditoria ID, Comentário ID, Data, Descrição
- 🔄 Atualização automática ao carregar
- 🎯 Badge de nível de severidade

## 💻 Deploy

### 1. Migração do Banco
```bash
supabase db push
```

### 2. Deploy da Function
```bash
supabase functions deploy admin-alertas
```

### 3. Build do Frontend
```bash
npm run build
```

## 🔐 Segurança

- ✅ RLS policies ativas
- ✅ Verificação de role admin
- ✅ Token JWT obrigatório
- ✅ CORS configurado

## 🧪 Testes Manuais

1. **Login como Admin:**
   ```
   Verificar: role = 'admin' na tabela profiles
   ```

2. **Acessar Painel:**
   ```
   Navegar para: /admin/alerts
   ```

3. **Verificar Alertas:**
   ```
   - Cards vermelhos devem aparecer
   - Dados de exemplo devem estar visíveis
   - Formatação de data em português
   ```

## 🐛 Debug Comum

### Erro 401
- Verifique se está logado
- Verifique token no localStorage

### Erro 403
- Verifique role na tabela profiles
- SQL: `SELECT * FROM profiles WHERE id = auth.uid();`

### Sem Alertas
- Verifique se há dados na tabela
- SQL: `SELECT * FROM alertas_criticos;`

### Function Erro
```bash
# Ver logs
supabase functions logs admin-alertas

# Re-deploy
supabase functions deploy admin-alertas
```

## 📊 SQL Úteis

### Ver Alertas
```sql
SELECT * FROM alertas_criticos 
WHERE resolvido = false 
ORDER BY criado_em DESC;
```

### Criar Alerta Manual
```sql
INSERT INTO alertas_criticos (auditoria_id, descricao, nivel)
VALUES ('uuid-da-auditoria', 'Descrição do alerta', 'critico');
```

### Marcar como Resolvido
```sql
UPDATE alertas_criticos 
SET resolvido = true, 
    resolvido_em = now(), 
    resolvido_por = auth.uid()
WHERE id = 'uuid-do-alerta';
```

### Ver Perfil do Usuário
```sql
SELECT * FROM profiles WHERE id = auth.uid();
```

## 🎯 Casos de Uso

### Administrador
1. Acessa `/admin/alerts`
2. Vê lista de alertas críticos
3. Revisa descrição e detalhes
4. Toma ação necessária

### Sistema
1. Auditoria gera comentário crítico
2. Alerta criado automaticamente
3. Alerta aparece no painel
4. Admin é notificado (futuro)

## 📝 Próximos Passos

- [ ] Implementar filtros
- [ ] Adicionar paginação
- [ ] Botão "Marcar como Resolvido"
- [ ] Notificações push
- [ ] Dashboard de estatísticas

## 🔗 Links Úteis

- [Documentação Completa](./ADMIN_ALERTAS_IMPLEMENTATION.md)
- [Supabase Docs](https://supabase.com/docs)
- [React Query](https://tanstack.com/query/latest)

---

**Versão:** 1.0.0 | **Data:** 2025-10-16
