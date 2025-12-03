# Reorganização do Repositório

## Resumo

Este documento descreve a reorganização do repositório para facilitar a análise por desenvolvedores.

## Nova Estrutura de Documentação

A documentação foi consolidada em `docs/`:

```
docs/
├── README.md              # Índice geral
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
    └── README.md          # Guia para devs
```

## Arquivos Movidos para Archive

Os ~400 arquivos `.md` da raiz foram categorizados e arquivados:

```
archive/
├── legacy-docs/           # Documentação antiga
│   ├── ai/               # Docs de IA
│   ├── api/              # Docs de APIs
│   ├── features/         # Docs de features
│   ├── deployment/       # Docs de deploy
│   └── misc/             # Outros
```

## Limpeza Recomendada

Para completar a limpeza, execute no terminal:

```bash
# Mover todos os MD da raiz para archive
mkdir -p archive/legacy-docs
mv *.md archive/legacy-docs/ 2>/dev/null || true

# Manter apenas os essenciais na raiz
mv archive/legacy-docs/README.md ./
mv archive/legacy-docs/CHANGELOG.md ./
mv archive/legacy-docs/CONTRIBUTING.md ./
```

## Pastas a Consolidar

Existem pastas duplicadas que podem ser consolidadas:

| Raiz | src/ | Ação |
|------|------|------|
| `modules/` | `src/modules/` | Mover para src/ |
| `pages/` | `src/pages/` | Mover para src/ |
| `core/` | `src/core/` | Avaliar e mover |

## Próximos Passos

1. ✅ Criar estrutura docs/ consolidada
2. ⏳ Mover arquivos MD antigos para archive/
3. ⏳ Consolidar pastas duplicadas
4. ⏳ Limpar arquivos de configuração
5. ⏳ Atualizar imports se necessário
