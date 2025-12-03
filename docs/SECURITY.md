# Security Guidelines

## Overview

Este documento descreve as práticas de segurança do projeto Travel HR Buddy / Nautilus One.

## Autenticação

### Supabase Auth
- Autenticação baseada em JWT via Supabase
- Suporte a email/senha, OAuth (Google, GitHub)
- Tokens de refresh automáticos

### Row Level Security (RLS)
- Todas as tabelas têm RLS habilitado
- Políticas definidas em `supabase/migrations/`
- Acesso baseado em `auth.uid()`

## Armazenamento Seguro

### Variáveis de Ambiente
- Nunca commitar `.env` no repositório
- Usar `.env.example` como template
- Secrets gerenciados via Supabase Secrets

### API Keys
- Keys armazenadas como secrets
- Nunca expostas no frontend
- Rotação periódica recomendada

## Boas Práticas

### Input Validation
- Validação com Zod em todas as entradas
- Sanitização de dados antes de armazenar
- Prepared statements via Supabase

### CORS & Headers
- CORS configurado em edge functions
- Headers de segurança via Cloudflare/Vercel

## Reportando Vulnerabilidades

Se você encontrar uma vulnerabilidade de segurança:

1. **NÃO** abra uma issue pública
2. Envie email para a equipe de segurança
3. Aguarde resposta antes de divulgar

## Checklist de Segurança

- [ ] RLS habilitado em todas as tabelas
- [ ] Variáveis sensíveis em secrets
- [ ] Validação de input em todos os forms
- [ ] HTTPS em produção
- [ ] Logs sem dados sensíveis
- [ ] Rate limiting em APIs

## Recursos

- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [OWASP Guidelines](https://owasp.org/www-project-web-security-testing-guide/)
