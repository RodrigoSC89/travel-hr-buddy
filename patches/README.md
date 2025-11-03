# 📦 Patches Directory

Este diretório contém arquivos YAML de documentação para séries de patches do projeto Nautilus One.

## Arquivos Disponíveis

### nautilus-one-production-series.yaml
Documentação consolidada dos PATCHES 608-612, incluindo:
- **PATCH-608**: Travel Intelligence Module (stable)
- **PATCH-608.1**: Travel Intelligence Refinement (done)
- **PATCH-609**: ISM Audits Module (stable)
- **PATCH-610**: Pré-OVID Inspection Module (in_progress)
- **PATCH-611**: Port State Control - Pré-Inspeção (in_progress)
- **PATCH-612**: LSA & FFA Safety Inspections (in_progress)

## Uso

Os arquivos YAML neste diretório servem como:
- 📋 Base para commits no GitHub
- 🔄 Integração com CI/CD
- 📚 Documentação interna
- 🤖 Sincronização com GitHub Coding Agent
- 📊 Referência no `/admin/epics-board`
- 📝 Histórico no `/docs/changelog.md`

## Formato

Cada arquivo YAML segue a estrutura:
```yaml
patches:
  - id: PATCH-XXX
    name: Nome do Patch
    status: stable|done|in_progress|todo
    type: integration|module|refactor
    summary: Descrição do patch
    files: Lista de arquivos modificados
    tests: Lista de testes relacionados
    depends_on: Dependências (opcional)
    requires: Requisitos (opcional)
    integrations: Integrações (opcional)
    uses: Tecnologias usadas (opcional)
```

## Referências

- [CHANGELOG.md](../CHANGELOG.md) - Histórico de versões
- [Epics Board](../src/pages/admin/epics-board.tsx) - Painel administrativo de epics e patches
