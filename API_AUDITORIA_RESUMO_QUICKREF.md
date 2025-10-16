# 🚀 API Auditoria Resumo - Guia Rápido

## Endpoint
```
GET /api/auditoria/resumo
```

## Filtros Suportados
- 📆 `start` - Data inicial (YYYY-MM-DD)
- 📆 `end` - Data final (YYYY-MM-DD)
- 👤 `user_id` - UUID do usuário

## Exemplo de Uso
```bash
/api/auditoria/resumo?start=2025-10-01&end=2025-10-31&user_id=UUID_DO_USUARIO
```

## Resposta
```json
[
  { "nome_navio": "Navio A", "total": 5 },
  { "nome_navio": "Navio B", "total": 3 }
]
```

## ✅ Features
- ✅ Filtro por data (start, end)
- ✅ Filtro por user_id
- ✅ Agregação por navio
- ✅ 48 testes automatizados
- ✅ Tratamento de erros
- ✅ Documentação completa

## 📋 Checklist de Implementação

- [x] Criar diretório `/pages/api/auditoria`
- [x] Implementar endpoint `resumo.ts`
- [x] Adicionar validação de método GET
- [x] Implementar filtros de data
- [x] Implementar filtro de usuário
- [x] Agregar resultados por navio
- [x] Criar suite de testes
- [x] Documentar API
- [x] Verificar linting
- [x] Executar todos os testes

## 🔧 Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key
```

## 📚 Documentação Completa
Ver: [API_AUDITORIA_RESUMO.md](./API_AUDITORIA_RESUMO.md)
