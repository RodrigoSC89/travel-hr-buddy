# ⚡ Daily Restore Report - Quick Reference

## 🚀 Deploy Rápido

```bash
# 1. Certifique-se de estar logado no Supabase
supabase login

# 2. Execute o script de setup
chmod +x scripts/setup-restore-cron.sh
./scripts/setup-restore-cron.sh
```

## ⚙️ Variáveis de Ambiente Essenciais

Configure no Supabase Dashboard → Project Settings → Edge Functions → Secrets:

```bash
# Obrigatórias
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
EMAIL_USER=seu@email.com
EMAIL_PASS=sua-senha-ou-app-password

# Opcionais (com defaults)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_FROM=noreply@nautilusone.com
EMAIL_TO=admin@empresa.com
VITE_APP_URL=https://seu-app.vercel.app
```

## 📁 Arquivos Criados

```
travel-hr-buddy/
├── scripts/
│   └── setup-restore-cron.sh          # Script de deploy automatizado
└── supabase/functions/
    └── daily-restore-report/
        ├── index.ts                    # Função principal
        ├── cron.yaml                   # Configuração do agendamento
        └── README.md                   # Documentação completa
```

## ⏰ Agendamento

**Horário:** 08:00 UTC (diariamente)  
**Equivalente:**
- 05:00 Brasília (horário de verão)
- 06:00 Brasília (horário normal)

**Modificar horário:**
1. Edite `cron.yaml`: `schedule: "0 9 * * *"` (para 09:00 UTC)
2. Redeploy: `supabase functions deploy daily-restore-report`
3. Re-schedule: `supabase functions schedule daily-restore-report`

## 🧪 Testes

### Invocar manualmente
```bash
supabase functions invoke daily-restore-report
```

### Testar localmente
```bash
supabase functions serve daily-restore-report
# Em outro terminal:
curl -X POST http://localhost:54321/functions/v1/daily-restore-report
```

### Ver logs
```bash
supabase functions logs daily-restore-report --follow
```

## 📊 O Que a Função Faz

1. ✅ Busca dados de restauração dos últimos 15 dias
2. ✅ Gera estatísticas (total, docs únicos, média diária)
3. ✅ Cria gráfico SVG das restaurações por dia
4. ✅ Prepara email HTML profissional com gráfico embutido
5. ✅ Retorna JSON com status da execução

## 📧 Formato do Relatório

**Email inclui:**
- 📊 Gráfico de barras (últimos 15 dias)
- 📈 3 cards de estatísticas
- 💡 Seção explicativa
- 🔗 Link para dashboard completo
- 📝 Footer com timestamp

## 🔧 Comandos Úteis

```bash
# Listar funções
supabase functions list

# Ver logs
supabase functions logs daily-restore-report

# Redeploy
supabase functions deploy daily-restore-report

# Remover agendamento
supabase functions unschedule daily-restore-report

# Deletar função
supabase functions delete daily-restore-report
```

## 🐛 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Script não encontra arquivos | Execute do diretório raiz do projeto |
| Erro de autenticação | Configure `SUPABASE_SERVICE_ROLE_KEY` |
| Email não envia | Normal - integre com SendGrid/Resend/etc |
| RPC function not found | Execute migrations do banco |
| Dados vazios | Normal se não houver restaurações recentes |

## 📚 Documentação Completa

- **Implementação:** `DAILY_RESTORE_REPORT_IMPLEMENTATION.md`
- **Função README:** `supabase/functions/daily-restore-report/README.md`
- **Dashboard:** `/admin/documents/restore-dashboard`
- **Logs:** `/admin/documents/restore-logs`

## 🎯 Próximos Passos

1. **Deploy:** Execute `./scripts/setup-restore-cron.sh`
2. **Configurar:** Adicione variáveis de ambiente no Supabase
3. **Testar:** Invoque manualmente para validar
4. **Integrar Email:** Adicione SendGrid/Resend para envio real
5. **Monitorar:** Acompanhe logs após primeira execução automática

## ✅ Status da Implementação

- [x] Edge Function criada
- [x] Cron configurado (08:00 UTC)
- [x] Geração de gráficos (SVG)
- [x] Template de email (HTML + Text)
- [x] Script de setup automatizado
- [x] Documentação completa
- [ ] Integração com provedor de email (próximo passo)

---

**Dúvidas?** Consulte `DAILY_RESTORE_REPORT_IMPLEMENTATION.md` ou `supabase/functions/daily-restore-report/README.md`
