# PATCH 205.0 – Release Operations & CI/CD Validation

## 📘 Objetivo
Validar o sistema de release management, CI/CD pipelines, changelog automático e estratégia de deploy multi-ambiente.

## ✅ Checklist de Validação

### 1. Configuração de Release
- [ ] Arquivo `release.config.json` criado
- [ ] Versionamento semântico configurado
- [ ] Branches estratégicas definidas:
  - `main` → Production
  - `staging` → Staging
  - `develop` → Development
- [ ] Conventional Commits ativo
- [ ] Changelog automático habilitado

### 2. CI/CD Pipeline
- [ ] GitHub Actions configurado
- [ ] Workflow de build funcional
- [ ] Testes automáticos rodam
- [ ] Linting e type-checking integrados
- [ ] Deploy automático por branch
- [ ] Rollback strategy definida

### 3. Ambientes de Deploy
- [ ] Development: auto-deploy em `develop`
- [ ] Staging: auto-deploy em `staging`
- [ ] Production: manual approval em `main`
- [ ] Preview deploys em PRs
- [ ] Domains separados:
  - dev.nautilusone.app
  - staging.nautilusone.app
  - app.nautilusone.app

### 4. Changelog Automático
- [ ] Mensagens de commit seguem padrão
- [ ] CHANGELOG.md gerado automaticamente
- [ ] Categorias organizadas:
  - 🚀 Features
  - 🐛 Bug Fixes
  - 💥 Breaking Changes
  - 📝 Documentation
  - ♻️ Refactor
- [ ] Tags de versão criadas no Git
- [ ] Release notes publicadas no GitHub

### 5. Estratégia de Versioning
- [ ] MAJOR.MINOR.PATCH implementado
- [ ] Bump automático por tipo de commit:
  - `feat:` → MINOR
  - `fix:` → PATCH
  - `feat!:` ou `BREAKING CHANGE:` → MAJOR
- [ ] Versão sincronizada em package.json
- [ ] Tag Docker com versão correta

### 6. Deploy por Cliente (Multi-tenant)
- [ ] Subdomínios por cliente configurados
- [ ] CDN com cache estratégico
- [ ] Secrets por ambiente isolados
- [ ] Database migrations automáticas
- [ ] Health checks ativos

## 📊 Critérios de Sucesso
- ✅ CI/CD rodando sem falhas
- ✅ Changelog gerado automaticamente
- ✅ Deploys por ambiente funcionando
- ✅ Zero downtime em production
- ✅ Rollback rápido (<5min)
- ✅ Monitoramento de deploy ativo

## 🔍 Testes Recomendados

### Teste 1: Conventional Commits
1. Fazer commit seguindo padrão:
   ```bash
   git commit -m "feat: add vessel selector component"
   git commit -m "fix: resolve mobile layout issue"
   git commit -m "docs: update README with API docs"
   git commit -m "feat!: migrate to new authentication system"
   ```
2. Verificar changelog atualiza
3. Validar versão incrementa corretamente

### Teste 2: CI/CD Pipeline
1. Criar PR para `develop`
2. Verificar GitHub Actions executa:
   - ✅ Install dependencies
   - ✅ Run linting
   - ✅ Run type checking
   - ✅ Run tests
   - ✅ Build production
3. Merge PR
4. Confirmar deploy automático para dev

### Teste 3: Deploy por Ambiente
1. Push para `develop`:
   - Verifica deploy em dev.nautilusone.app
2. Merge para `staging`:
   - Verifica deploy em staging.nautilusone.app
3. Merge para `main`:
   - Aguarda aprovação manual
   - Confirma deploy em app.nautilusone.app

### Teste 4: Changelog Automático
1. Fazer 10+ commits variados
2. Executar release:
   ```bash
   npm run release
   ```
3. Verificar CHANGELOG.md atualizado:
   ```markdown
   ## [2.1.0] - 2025-01-26
   
   ### 🚀 Features
   - Add vessel selector component
   - Implement real-time sync
   
   ### 🐛 Bug Fixes
   - Resolve mobile layout issue
   - Fix timezone conversion
   
   ### 💥 Breaking Changes
   - Migrate to new authentication system
   ```

### Teste 5: Rollback
1. Deploy versão com bug
2. Identificar problema
3. Executar rollback:
   ```bash
   git revert HEAD
   git push origin main
   ```
4. Verificar deploy anterior restaurado
5. Medir tempo total de rollback (<5min)

## 🚨 Cenários de Erro

### CI/CD Falha
- [ ] Testes não passam
- [ ] Build quebrado
- [ ] Linting com erros
- [ ] Secrets faltando
- [ ] Timeout de deploy

### Changelog Incorreto
- [ ] Commits não seguem padrão
- [ ] Versão não incrementa
- [ ] Categorias erradas
- [ ] Tag Git não criada

### Deploy Falha
- [ ] Environment variables faltando
- [ ] Database migration erro
- [ ] Health check falha
- [ ] Domain não resolve

## 📁 Arquivos a Verificar
- [ ] `release.config.json` ⭐
- [ ] `.github/workflows/ci.yml`
- [ ] `.github/workflows/deploy-dev.yml`
- [ ] `.github/workflows/deploy-staging.yml`
- [ ] `.github/workflows/deploy-prod.yml`
- [ ] `CHANGELOG.md`
- [ ] `package.json` (version)
- [ ] `scripts/deploy.sh`

## 📊 release.config.json

```json
{
  "branches": [
    "main",
    {
      "name": "staging",
      "prerelease": "beta"
    },
    {
      "name": "develop",
      "prerelease": "alpha"
    }
  ],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        "assets": ["CHANGELOG.md", "package.json"],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ]
  ]
}
```

## 📊 GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [develop, staging, main]
  pull_request:
    branches: [develop, staging, main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build

  deploy-dev:
    if: github.ref == 'refs/heads/develop'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - run: npm run deploy:dev

  deploy-staging:
    if: github.ref == 'refs/heads/staging'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - run: npm run deploy:staging

  deploy-prod:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.nautilusone.app
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - run: npm run deploy:prod
```

## 📊 Métricas
- [ ] Deploys por dia: _____
- [ ] Taxa de sucesso CI/CD: _____%
- [ ] Tempo médio de build: _____min
- [ ] Tempo médio de deploy: _____min
- [ ] Downtime total: _____min
- [ ] Rollbacks necessários: _____

## 🧪 Validação Automatizada
```bash
# Verificar configuração de release
npm run release:check

# Validar conventional commits
npm run commitlint

# Testar build production
npm run build

# Simular deploy
npm run deploy:dry-run

# Gerar changelog local
npm run changelog:generate
```

## 📝 Ambientes e URLs
- [ ] **Development**: https://dev.nautilusone.app
- [ ] **Staging**: https://staging.nautilusone.app
- [ ] **Production**: https://app.nautilusone.app
- [ ] **Cliente A**: https://cliente-a.nautilusone.app
- [ ] **Cliente B**: https://cliente-b.nautilusone.app

## 📝 Notas de Validação
- **Data**: _____________
- **Validador**: _____________
- **Deploys testados**: _____
- **Ambientes validados**: _____
- **Ambiente**: [ ] Dev [ ] Staging [ ] Production
- **Status**: [ ] ✅ Aprovado [ ] ❌ Reprovado [ ] 🔄 Em Revisão

## 🎯 Checklist de Go-Live
- [ ] CI/CD rodando sem falhas
- [ ] Changelog automático funcionando
- [ ] Deploys por ambiente OK
- [ ] Rollback testado e rápido
- [ ] Monitoramento ativo
- [ ] Documentação completa

## 📋 Observações Adicionais
_____________________________________________
_____________________________________________
_____________________________________________
