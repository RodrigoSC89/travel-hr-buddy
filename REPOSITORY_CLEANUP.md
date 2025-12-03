# Repository Cleanup Progress 🧹

## Status: Em Progresso ✅

Este documento documenta a reorganização do repositório para facilitar a análise por desenvolvedores.

---

## ✅ Fase 1: Documentação (Concluída)

### Nova Estrutura `docs/`
```
docs/
├── README.md              # Índice geral
├── INDEX.md               # Quick links
├── STRUCTURE.md           # Guia de estrutura do repositório
├── SECURITY.md            # Práticas de segurança
├── CHANGELOG.md           # Histórico de mudanças
├── CONTRIBUTING.md        # Como contribuir
├── getting-started.md     # Guia de início rápido
├── architecture.md        # Arquitetura do sistema
├── api/
│   └── README.md          # APIs e Edge Functions
├── features/
│   ├── README.md          # Índice de funcionalidades
│   ├── ai-features.md     # IA e automação
│   ├── compliance.md      # SGSO e auditorias
│   ├── documents.md       # Sistema de documentos
│   └── collaboration.md   # Ferramentas colaborativas
├── deployment/
│   └── README.md          # Guia de deploy
└── development/
    ├── README.md          # Guia para devs
    └── design-system.md   # Sistema de design
```

### Archive Criado `archive/`
```
archive/
└── legacy-docs/           # ~400 docs antigos categorizados
    ├── ai/               # Docs de IA
    ├── api/              # Docs de APIs
    ├── admin/            # Docs de admin
    ├── audit/            # Docs de auditoria
    ├── deployment/       # Docs de deploy
    ├── system/           # Docs de sistema
    └── README.md         # Índice do archive
```

### Backend Identificado `backend/`
```
backend/
├── README.md              # Guia do backend Python
├── core/                  # Módulos core Python
└── modules/               # Módulos Python específicos
```

---

## ✅ Fase 2: Scripts de Automação

Scripts criados em `scripts/`:

| Script | Descrição |
|--------|-----------|
| `cleanup-docs.sh` | Move .md da raiz para archive |
| `archive-root-docs.sh` | Categoriza docs por tipo |
| `move-legacy-to-backend.sh` | Move Python para backend/ |
| `consolidate-folders.sh` | Analisa pastas duplicadas |

### Como Executar
```bash
# Dar permissão e executar
chmod +x scripts/*.sh
./scripts/archive-root-docs.sh
./scripts/move-legacy-to-backend.sh
```

---

## 📊 Bundle Size (Otimizado)

O `vite.config.ts` já está otimizado com:

- **Terser minification** - Compressão avançada
- **Manual chunks** - ~30 chunks separados por função
- **Tree shaking** - Remoção de código não usado
- **Lazy loading** - Carregamento sob demanda

### Chunks Principais
| Chunk | Conteúdo |
|-------|----------|
| `core-react` | React, ReactDOM |
| `core-router` | React Router |
| `core-supabase` | Supabase client |
| `charts-recharts` | Recharts |
| `ui-*` | Componentes Radix UI |
| `module-*` | Módulos da aplicação |
| `vendors` | Outros vendors |

---

## 📋 Próximos Passos

### Alta Prioridade
- [ ] Executar scripts de archive
- [ ] Mover Python para backend/
- [ ] Remover diretórios vazios

### Média Prioridade  
- [ ] Consolidar `modules/` (raiz) vs `src/modules/`
- [ ] Limpar `legacy/`, `dev/`, `patches/`
- [ ] Revisar configurações duplicadas

### Baixa Prioridade
- [ ] Consolidar testes (`tests/`, `__tests__/`, `e2e/`)
- [ ] Atualizar imports se necessário

---

## 📂 Estrutura Final Planejada

```
travel-hr-buddy/
├── src/                    # ✅ Código TypeScript/React
├── docs/                   # ✅ Documentação consolidada
├── backend/                # 🔄 Código Python
├── archive/                # ✅ Docs arquivados
├── scripts/                # ✅ Scripts de automação
├── supabase/               # ✅ Edge Functions + migrations
├── tests/                  # ✅ Testes unitários
├── e2e/                    # ✅ Testes E2E
├── public/                 # ✅ Assets estáticos
├── .github/                # ✅ CI/CD workflows
├── README.md               # ✅ README principal
└── [configs]               # ✅ Arquivos de config
```

---

## 🔗 Links Úteis

- [docs/INDEX.md](./docs/INDEX.md) - Índice da documentação
- [docs/STRUCTURE.md](./docs/STRUCTURE.md) - Estrutura do repositório
- [docs/getting-started.md](./docs/getting-started.md) - Início rápido

---

*Última atualização: Dezembro 2024*
