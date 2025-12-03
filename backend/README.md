# Backend Python Modules

Este diretório contém módulos Python legados/backend que foram consolidados da raiz do repositório.

## Estrutura

```
backend/
├── core/           # Módulos core Python (logger, pdf_exporter, sgso_connector)
├── modules/        # Módulos Python específicos (audit, forecast, decision)
└── pages/          # APIs Python (se aplicável)
```

## Migração

Estes arquivos foram movidos de:
- `/core/` → `/backend/core/`
- `/modules/*.py` → `/backend/modules/`
- `/pages/api/` → `/backend/pages/api/`

## Dependências

Ver `requirements.txt` em cada subdiretório para dependências Python.

## Nota

O código principal do frontend está em `/src/`. Este diretório contém apenas código backend/legado Python.
