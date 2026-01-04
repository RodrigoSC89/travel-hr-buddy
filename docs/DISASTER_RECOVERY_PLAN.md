# 🛡️ Plano de Disaster Recovery (DR)
## Nautilus One v3.2.0 - Maritime HR Management System

**Versão:** 1.0  
**Data:** 03/01/2026  
**Classificação:** CONFIDENCIAL  

---

## 📋 Sumário Executivo

Este documento define os procedimentos de recuperação de desastres para o sistema Nautilus One, garantindo continuidade operacional em cenários de falha crítica.

### Objetivos de Recuperação

| Métrica | Objetivo | Justificativa |
|---------|----------|---------------|
| **RTO** (Recovery Time Objective) | ≤ 4 horas | Operações marítimas críticas |
| **RPO** (Recovery Point Objective) | ≤ 1 hora | PITR do Supabase |
| **MTTR** (Mean Time to Repair) | ≤ 2 horas | Procedimentos automatizados |

---

## 🏗️ Arquitetura de Backup

### Níveis de Backup

```
┌─────────────────────────────────────────────────────────────┐
│                    BACKUP STRATEGY                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  NÍVEL 1: Point-in-Time Recovery (PITR)                    │
│  ├── Retenção: 7 dias                                      │
│  ├── Granularidade: 1 segundo                              │
│  └── Automático: Supabase gerenciado                       │
│                                                             │
│  NÍVEL 2: Backups Diários                                  │
│  ├── Horário: 03:00 UTC                                    │
│  ├── Tipo: Full backup                                     │
│  └── Storage: Supabase Storage + S3                        │
│                                                             │
│  NÍVEL 3: Backups Incrementais                             │
│  ├── Frequência: 6/6 horas                                 │
│  ├── Tipo: Delta apenas                                    │
│  └── Storage: Edge Function + backup_logs                  │
│                                                             │
│  NÍVEL 4: Export Crítico                                   │
│  ├── Tabelas: profiles, crew_payroll, certificates         │
│  ├── Formato: JSON + CSV                                   │
│  └── Encryption: AES-256                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Tabelas Críticas (Prioridade de Recuperação)

| Prioridade | Tabela | RPO Específico | Justificativa |
|------------|--------|----------------|---------------|
| 🔴 P1 | `profiles` | 15 min | Dados de usuários |
| 🔴 P1 | `organizations` | 15 min | Multi-tenant core |
| 🔴 P1 | `crew_payroll` | 30 min | Dados financeiros |
| 🟠 P2 | `maritime_certificates` | 1 hora | Compliance legal |
| 🟠 P2 | `peotram_audits` | 1 hora | Auditorias ANP |
| 🟠 P2 | `vessels` | 1 hora | Cadastro de embarcações |
| 🟡 P3 | `ai_audit_logs` | 4 horas | Logs de IA |
| 🟡 P3 | `action_items` | 4 horas | Gestão de tarefas |

---

## 🚨 Cenários de Desastre

### Cenário 1: Falha de Região AWS

**Impacto:** Indisponibilidade total  
**Probabilidade:** Baixa  
**RTO:** 4 horas  

**Procedimento de Recuperação:**
1. Identificar falha via monitoramento (Sentry + UptimeRobot)
2. Ativar plano de comunicação (Slack #incidents)
3. Acessar Supabase Dashboard
4. Iniciar restauração PITR para último ponto saudável
5. Atualizar DNS para nova instância (se necessário)
6. Validar integridade de dados críticos
7. Notificar usuários sobre restauração

### Cenário 2: Corrupção de Dados

**Impacto:** Dados inconsistentes  
**Probabilidade:** Média  
**RTO:** 2 horas  

**Procedimento de Recuperação:**
1. Identificar escopo da corrupção (tabelas afetadas)
2. Pausar writes na aplicação (maintenance mode)
3. Usar PITR para restaurar tabelas específicas
4. Validar integridade com checksums
5. Reativar aplicação
6. Gerar relatório de incidente

### Cenário 3: Ataque de Ransomware

**Impacto:** Dados criptografados por atacante  
**Probabilidade:** Baixa  
**RTO:** 8 horas  

**Procedimento de Recuperação:**
1. Isolar ambiente imediatamente
2. Notificar equipe de segurança
3. Analisar vetor de ataque
4. Restaurar de backup anterior ao ataque
5. Aplicar patches de segurança
6. Resetar todas as credenciais
7. Reativar com monitoramento intensivo

### Cenário 4: Exclusão Acidental

**Impacto:** Perda de registros específicos  
**Probabilidade:** Alta  
**RTO:** 30 minutos  

**Procedimento de Recuperação:**
1. Identificar timestamp exato da exclusão
2. Usar PITR para restaurar para momento anterior
3. Exportar registros deletados
4. Reimportar no banco atual
5. Documentar incidente

---

## 🔧 Procedimentos Operacionais

### Verificação Diária de Backup

```bash
# Executar via Edge Function ou manualmente
curl -X POST https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/automated-backup \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"action": "status"}'
```

**Checklist Diário:**
- [ ] Verificar status do último backup no dashboard
- [ ] Confirmar PITR ativo (Supabase Settings > Backups)
- [ ] Revisar alertas de falha no Slack
- [ ] Validar integridade semanal (sextas-feiras)

### Restauração via PITR

1. Acesse: https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/settings/backups
2. Selecione "Point-in-Time Recovery"
3. Escolha timestamp desejado
4. Confirme restauração
5. Aguarde conclusão (estimativa: 15-60 minutos)

### Teste de DR Trimestral

**Frequência:** A cada 3 meses  
**Responsável:** DevOps + DBA  
**Duração:** 4 horas  

**Roteiro:**
1. Criar ambiente de teste isolado
2. Simular cenário de desastre (Cenário 1 ou 2)
3. Executar procedimento de recuperação
4. Medir RTO e RPO reais
5. Documentar desvios
6. Atualizar procedimentos se necessário

---

## 📞 Contatos de Emergência

| Papel | Nome | Contato | Disponibilidade |
|-------|------|---------|-----------------|
| DBA Principal | [Nome] | [Telefone/Slack] | 24/7 |
| DevOps Lead | [Nome] | [Telefone/Slack] | 24/7 |
| Product Owner | [Nome] | [Telefone/Slack] | Horário comercial |
| Supabase Support | N/A | support@supabase.io | 24/7 (Pro Plan) |

---

## 📊 Métricas e Monitoramento

### Dashboards

- **Supabase Dashboard:** https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb
- **Sentry:** [URL do projeto Sentry]
- **Nautilus NOC:** /noc (interno)

### Alertas Configurados

| Alerta | Threshold | Canal |
|--------|-----------|-------|
| Backup falhou | 1 falha | Slack #alerts |
| PITR desativado | Imediato | Email + Slack |
| Disco > 80% | 80% usage | Slack #infra |
| Latência DB > 500ms | 500ms avg | Slack #performance |

---

## 📝 Histórico de Revisões

| Versão | Data | Autor | Alterações |
|--------|------|-------|------------|
| 1.0 | 03/01/2026 | Sistema | Versão inicial |

---

## ✅ Aprovações

| Papel | Nome | Data | Assinatura |
|-------|------|------|------------|
| CTO | _____________ | ___/___/_____ | _____________ |
| DBA | _____________ | ___/___/_____ | _____________ |
| Security | _____________ | ___/___/_____ | _____________ |

---

*Documento gerado automaticamente por Nautilus One BCP System*
