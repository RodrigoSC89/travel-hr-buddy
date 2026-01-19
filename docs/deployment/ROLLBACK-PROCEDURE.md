# 🔄 ROLLBACK PROCEDURE - Nauti One

## Procedimento de Rollback de Emergência

### Tempo Estimado: < 5 minutos

---

## 🚨 QUANDO USAR ROLLBACK

Executar rollback se:
- Error rate > 5%
- Latência P95 > 3000ms
- CPU > 95% por 5+ minutos
- Funcionalidade crítica quebrada
- Vulnerabilidade de segurança detectada

---

## 📋 PROCEDIMENTO

### 1. DETECTAR PROBLEMA (0-1 min)
```bash
# Verificar métricas
# - Error rate elevado
# - Latência alta
# - Reclamações de usuários
```

### 2. DECLARAR INCIDENTE (1-2 min)
```bash
# Notificar equipe
# - Slack: #incident-nauti-one
# - Iniciar cronômetro
```

### 3. EXECUTAR ROLLBACK (2-5 min)

#### Opção A: Lovable Platform
1. Acesse o editor Lovable
2. Use "Version History"
3. Selecione versão estável anterior
4. Clique "Restore"
5. Publique novamente

#### Opção B: Git Revert
```bash
# Identificar commit problemático
git log --oneline -10

# Reverter para commit anterior
git revert HEAD
git push origin main

# CI/CD fará redeploy automaticamente
```

#### Opção C: Database Rollback (se necessário)
```sql
-- Verificar migrations recentes
SELECT * FROM supabase_migrations 
ORDER BY executed_at DESC 
LIMIT 5;

-- Restaurar de backup se crítico
-- Contatar suporte Supabase
```

### 4. VALIDAR ROLLBACK (5-7 min)
```bash
# Verificar que sistema está funcional
curl -I https://travel-hr-buddy.lovable.app

# Verificar métricas normalizaram
# - Error rate < 0.1%
# - Latência P95 < 500ms
```

### 5. COMUNICAR (7-10 min)
- Atualizar status page
- Notificar stakeholders
- Documentar timeline

---

## 📞 CONTATOS DE EMERGÊNCIA

| Área | Contato |
|------|---------|
| DevOps | devops@nautilus.app |
| Security | security@nautilus.app |
| Supabase | support@supabase.io |

---

## 📝 PÓS-INCIDENTE

1. **Root Cause Analysis** (24h)
2. **Post-mortem document** (48h)
3. **Prevention measures** (1 week)
4. **Team retrospective** (1 week)

---

## ✅ CHECKLIST ROLLBACK

- [ ] Problema detectado e documentado
- [ ] Equipe notificada
- [ ] Rollback executado
- [ ] Sistema validado
- [ ] Stakeholders informados
- [ ] Incidente documentado
