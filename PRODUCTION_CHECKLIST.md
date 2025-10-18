# ✅ CHECKLIST DE PRODUÇÃO - NAUTILUS ONE

## 📋 Visão Geral

Use este checklist para garantir que todos os requisitos para deploy em produção sejam atendidos.

**Status**: 🔄 Em Preparação | ✅ Pronto para Produção

---

## 🔐 SUPABASE (Back-end)

### Configuração Inicial
- [ ] Projeto criado no Supabase
- [ ] Região configurada (São Paulo ou mais próxima)
- [ ] Credenciais salvas em local seguro
- [ ] Project URL e Keys copiados

### Authentication & Authorization
- [ ] Auth habilitado no Supabase
- [ ] RLS (Row Level Security) ativo em todas as tabelas
- [ ] Políticas de acesso configuradas para `users`
- [ ] Políticas de acesso configuradas para `documents`
- [ ] Políticas de acesso configuradas para `templates`
- [ ] Políticas de acesso configuradas para `auditorias`
- [ ] Políticas de acesso configuradas para `workflows`
- [ ] Perfis de usuário (admin, user, viewer) configurados
- [ ] Email templates customizados (opcional)

### Tabelas Principais
- [ ] Tabela `users` criada e testada
- [ ] Tabela `documents` criada e testada
- [ ] Tabela `templates` criada e testada
- [ ] Tabela `auditorias` criada e testada
- [ ] Tabela `workflows` criada e testada
- [ ] Tabela `assistant_logs` criada e testada
- [ ] Tabela `metrics` criada e testada
- [ ] Tabela `notifications` criada e testada
- [ ] Índices criados para otimização
- [ ] Foreign keys configuradas corretamente

### Edge Functions
- [ ] Todas as Edge Functions deployadas
- [ ] `send-chart-report` funcionando
- [ ] `send-restore-dashboard-daily` funcionando
- [ ] `send-assistant-report` funcionando
- [ ] `daily-restore-report` funcionando
- [ ] Cron jobs configurados e testados
- [ ] Logs das functions monitorados
- [ ] Timeout adequado configurado (default: 60s)

### Storage
- [ ] Bucket `documents` criado
- [ ] Bucket `images` criado
- [ ] Bucket `avatars` criado
- [ ] Bucket `exports` criado
- [ ] Políticas de acesso configuradas
- [ ] Tamanho máximo de arquivo definido
- [ ] CORS configurado se necessário
- [ ] Upload testado em produção

### Logs e Auditoria
- [ ] Logs habilitados no Supabase
- [ ] Retenção de logs configurada
- [ ] Auditoria de mudanças no schema habilitada
- [ ] Alertas configurados para erros críticos

### RPCs e Functions
- [ ] RPCs testadas localmente
- [ ] RPCs deployadas em produção
- [ ] Permissões de execução configuradas
- [ ] Performance otimizada

### Secrets das Edge Functions
- [ ] `OPENAI_API_KEY` configurado
- [ ] `RESEND_API_KEY` configurado
- [ ] `ADMIN_EMAIL` configurado
- [ ] `EMAIL_FROM` configurado
- [ ] `MAPBOX_PUBLIC_TOKEN` configurado
- [ ] `OPENWEATHER_API_KEY` configurado
- [ ] Todos os secrets verificados com `supabase secrets list`

---

## 🌐 FRONTEND (Next.js - Vercel)

### Configuração Inicial
- [ ] Repositório conectado ao Vercel
- [ ] Projeto criado no Vercel
- [ ] Framework detectado como Vite
- [ ] Build command configurado: `npm run build`
- [ ] Output directory configurado: `dist`

### Variáveis de Ambiente
#### Obrigatórias
- [ ] `VITE_SUPABASE_URL` configurada
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` configurada
- [ ] `VITE_SUPABASE_PROJECT_ID` configurada
- [ ] `VITE_SENTRY_DSN` configurada
- [ ] `VITE_APP_URL` configurada

#### Opcionais (Recursos Avançados)
- [ ] `VITE_OPENAI_API_KEY` configurada
- [ ] `VITE_MAPBOX_ACCESS_TOKEN` configurada
- [ ] `VITE_OPENWEATHER_API_KEY` configurada
- [ ] `VITE_AMADEUS_API_KEY` configurada
- [ ] `VITE_ELEVENLABS_API_KEY` configurada
- [ ] `VITE_EMBED_ACCESS_TOKEN` configurada

### Roteamento
- [ ] App router funcional
- [ ] Rotas públicas acessíveis
- [ ] Rotas protegidas com autenticação
- [ ] Redirecionamento de não autenticados funciona
- [ ] 404 page configurada
- [ ] Error boundaries implementadas

### Módulos Principais
- [ ] **Templates**: Visualizar, criar, aplicar templates
- [ ] **Forecast**: Previsões e análises funcionando
- [ ] **Auditoria**: IMCA, checklists, relatórios PDF
- [ ] **MMI**: Jobs, manutenção, similaridade com IA
- [ ] **Assistente IA**: Chat, histórico, relatórios
- [ ] **Documentos**: Upload, visualização, compartilhamento
- [ ] **Dashboard Admin**: Métricas, status, logs
- [ ] **Analytics**: BI, gráficos, exportação

### Painel Admin
- [ ] `/admin/system-health` validando serviços
- [ ] Métricas em tempo real funcionando
- [ ] Status do Supabase exibido corretamente
- [ ] Status das Edge Functions visível
- [ ] Logs acessíveis e filtráveis
- [ ] Alertas configurados

### Qualidade de Código
- [ ] TypeScript strict mode ativo
- [ ] Tipagem correta (null vs undefined)
- [ ] Sem `any` tipos desnecessários
- [ ] Sem console.log em produção
- [ ] ESLint passando
- [ ] Prettier formatação consistente

### Build & Tests
- [ ] `npm run build` ✅ sucesso
- [ ] Build size < 10MB
- [ ] `npm run test` ✅ todos testes passando
- [ ] Coverage > 80% (se aplicável)
- [ ] Sem warnings críticos no build
- [ ] Source maps desabilitados em prod

### Performance
- [ ] Lazy loading de componentes pesados
- [ ] Code splitting configurado
- [ ] Imagens otimizadas (WebP)
- [ ] Fonts otimizadas
- [ ] Bundle size analisado
- [ ] Lighthouse score > 80

---

## 🤖 GITHUB ACTIONS (CI/CD)

### Secrets Configurados
- [ ] `VERCEL_TOKEN` adicionado
- [ ] `VERCEL_ORG_ID` adicionado
- [ ] `VERCEL_PROJECT_ID` adicionado
- [ ] Outros secrets necessários adicionados

### Workflows
- [ ] `.github/workflows/run-tests.yml` funcionando
- [ ] `.github/workflows/code-quality-check.yml` funcionando
- [ ] `.github/workflows/deploy-vercel.yml` criado
- [ ] Deploy automático no push para `main` configurado
- [ ] Notificações de deploy configuradas

### Validação CI
- [ ] Tests rodam automaticamente em PRs
- [ ] Build validado antes do merge
- [ ] Code quality verificado
- [ ] Security scan executado
- [ ] Coverage report gerado

---

## 🔒 SEGURANÇA

### SSL/HTTPS
- [ ] SSL ativo no Vercel (automático)
- [ ] Certificado válido
- [ ] Redirect HTTP → HTTPS configurado
- [ ] HSTS configurado

### Headers de Segurança
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Referrer-Policy` configurado
- [ ] `Permissions-Policy` configurado
- [ ] CSP (Content Security Policy) configurado

### Secrets & API Keys
- [ ] Nenhuma credencial hardcoded no código
- [ ] `.env` no `.gitignore`
- [ ] Service role keys apenas no backend
- [ ] API keys rotacionadas se necessário
- [ ] Acesso a secrets restrito

### RLS & Permissões
- [ ] RLS ativo em todas as tabelas
- [ ] Usuários só veem seus próprios dados
- [ ] Admin tem permissões adequadas
- [ ] Políticas testadas com diferentes perfis

---

## 📊 MONITORAMENTO

### Sentry
- [ ] Projeto criado no Sentry
- [ ] `VITE_SENTRY_DSN` configurado
- [ ] Source maps enviados (opcional)
- [ ] Alertas configurados
- [ ] Erros sendo capturados

### Vercel Analytics
- [ ] Analytics habilitado no Vercel
- [ ] Métricas de performance visíveis
- [ ] Web Vitals monitorados
- [ ] Alertas configurados

### Supabase Monitoring
- [ ] Dashboard de métricas acessível
- [ ] Logs de queries monitorados
- [ ] Alertas de performance configurados
- [ ] Backup automático habilitado

### Custom Monitoring
- [ ] `/admin/system-health` funcionando
- [ ] Métricas customizadas sendo coletadas
- [ ] Dashboard interno atualizado
- [ ] Alertas críticos configurados

---

## 🚀 DEPLOYMENT

### Pré-Deploy
- [ ] Todos os testes passando
- [ ] Build bem-sucedido localmente
- [ ] Variáveis de ambiente verificadas
- [ ] Documentação atualizada
- [ ] Changelog atualizado

### Deploy Inicial
- [ ] Primeira deploy para staging (se houver)
- [ ] Testes em staging bem-sucedidos
- [ ] Deploy para produção executado
- [ ] URL de produção acessível
- [ ] Verificação pós-deploy realizada

### Verificação Pós-Deploy
- [ ] Site acessível via URL de produção
- [ ] Login/autenticação funcionando
- [ ] Database conectado
- [ ] Edge Functions operacionais
- [ ] Storage funcionando
- [ ] APIs externas respondendo
- [ ] Performance aceitável (Lighthouse > 80)
- [ ] Sem erros críticos no Sentry

### Testes Manuais
- [ ] Login com email/senha
- [ ] Criar novo usuário
- [ ] Upload de documento
- [ ] Criar template
- [ ] Iniciar auditoria
- [ ] Usar assistente IA
- [ ] Visualizar dashboard admin
- [ ] Exportar relatório PDF
- [ ] Receber notificações

---

## 📱 DOMÍNIO (Opcional)

- [ ] Domínio customizado adquirido
- [ ] DNS configurado no provedor
- [ ] CNAME apontando para Vercel
- [ ] SSL automático ativo
- [ ] Redirect de domínios antigos (se aplicável)
- [ ] Verificação do domínio concluída

---

## 📚 DOCUMENTAÇÃO

### Documentação Técnica
- [ ] README.md atualizado
- [ ] PRODUCTION_DEPLOYMENT_GUIDE.md criado
- [ ] PRODUCTION_CHECKLIST.md (este arquivo)
- [ ] API documentation atualizada
- [ ] Changelog mantido

### Documentação de Usuário
- [ ] Guia de uso básico (se aplicável)
- [ ] FAQ criado (se aplicável)
- [ ] Tutoriais em vídeo (se aplicável)
- [ ] Documentação inline adequada

---

## 🎓 TREINAMENTO (Opcional)

- [ ] Equipe técnica treinada
- [ ] Gestores treinados nos módulos
- [ ] Usuários finais têm acesso a documentação
- [ ] Suporte técnico configurado
- [ ] Canais de comunicação estabelecidos

---

## 🔄 BACKUP & RECUPERAÇÃO

### Backup
- [ ] Backups automáticos do Supabase habilitados
- [ ] Retenção de backup configurada
- [ ] Backup manual testado
- [ ] Procedimento de backup documentado

### Recuperação
- [ ] Procedimento de rollback documentado
- [ ] Rollback testado em staging
- [ ] Recovery point objective (RPO) definido
- [ ] Recovery time objective (RTO) definido

---

## 📈 GO-TO-MARKET (Opcional)

### Lançamento
- [ ] Usuários piloto identificados
- [ ] Convites enviados
- [ ] Feedback inicial coletado
- [ ] Ajustes pós-feedback realizados

### Marketing
- [ ] Anúncio interno preparado
- [ ] Comunicação aos stakeholders enviada
- [ ] Treinamentos agendados
- [ ] Suporte preparado para aumento de demanda

---

## ✅ APROVAÇÃO FINAL

### Sign-off
- [ ] **Tech Lead**: _____________________ Data: _______
- [ ] **Product Owner**: _________________ Data: _______
- [ ] **QA**: ___________________________ Data: _______
- [ ] **Security**: ______________________ Data: _______

### Go/No-Go Decision
- [ ] **🟢 GO**: Aprovado para produção
- [ ] **🔴 NO-GO**: Requer mais trabalho

---

## 📝 NOTAS ADICIONAIS

```
Data de preparação: _______________________
Data do deploy: ___________________________
URL de produção: __________________________
Versão deployada: _________________________

Observações:
_____________________________________________
_____________________________________________
_____________________________________________
```

---

## 🆘 CONTATOS DE EMERGÊNCIA

```
Tech Lead: _________________________________
DevOps: ____________________________________
DBA: _______________________________________
Product Owner: _____________________________
Suporte 24/7: ______________________________
```

---

**Última atualização**: 2025-10-18
**Versão**: 1.0.0

---

## 🎉 CONCLUSÃO

Ao completar todos os itens deste checklist, o sistema Nautilus One estará **PRONTO PARA PRODUÇÃO** com:

✅ Backend robusto e seguro (Supabase)
✅ Frontend performático e escalável (Vercel)
✅ CI/CD automatizado (GitHub Actions)
✅ Monitoramento completo (Sentry + Analytics)
✅ Segurança em todas as camadas
✅ Documentação completa
✅ Backup e recuperação configurados

**Boa sorte com o lançamento! 🚀**
