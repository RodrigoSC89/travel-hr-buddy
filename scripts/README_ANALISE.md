# 📊 Scripts de Análise - FASE A
## Nautilus One - Travel HR Buddy

**Data:** 11 de Dezembro de 2025  
**Versão:** FASE A.0.0

---

## 📋 Visão Geral

Esta pasta contém scripts de análise automatizados para identificar problemas técnicos no sistema Nautilus One.

### Scripts Disponíveis

| Script | Descrição | Output |
|--------|-----------|--------|
| `analyze-routes.sh` | Análise de rotas e navegação | `routes-analysis.json` |
| `analyze-dead-code.sh` | Análise de código morto | `dead-code-analysis.json` |
| `analyze-bundle.sh` | Análise de bundle e performance | `bundle-analysis.json` |

---

## 🚀 Como Executar

### Pré-requisitos

```bash
# Navegar para a raiz do projeto
cd /home/ubuntu/github_repos/travel-hr-buddy

# Garantir que os scripts são executáveis
chmod +x scripts/analyze-*.sh
```

### Execução Individual

```bash
# Análise de rotas
./scripts/analyze-routes.sh

# Análise de código morto
./scripts/analyze-dead-code.sh

# Análise de bundle
./scripts/analyze-bundle.sh
```

### Execução em Lote

```bash
# Executar todos os scripts
for script in scripts/analyze-*.sh; do
  echo "Executando $script..."
  ./$script
  echo ""
done
```

---

## 📁 Outputs Gerados

Todos os outputs são salvos em `analysis-reports/`:

```
analysis-reports/
├── routes-analysis.json          # Métricas de rotas
├── dead-code-analysis.json       # Métricas de código morto
├── bundle-analysis.json          # Métricas de bundle
├── all-pages.txt                 # Lista de páginas
├── imported-pages.txt            # Páginas importadas
├── all-components.txt            # Lista de componentes
├── imported-components.txt       # Componentes importados
├── all-source-files.txt          # Arquivos fonte
├── ts-prune-output.txt           # Exports não utilizados
├── heavy-imports.txt             # Imports pesados
├── large-images.txt              # Imagens grandes
└── total-imports.txt             # Total de imports
```

---

## 🔍 analyze-routes.sh

### O que faz

- ✅ Conta rotas em App.tsx
- ✅ Conta módulos registrados
- ✅ Identifica páginas órfãs
- ✅ Verifica error boundaries
- ✅ Verifica fallbacks
- ✅ Analisa lazy loading
- ✅ Busca rotas quebradas
- ✅ Verifica redirecionamentos
- ✅ Analisa rotas dinâmicas

### Output Principal

```json
{
  "timestamp": "2025-12-11T22:24:50Z",
  "analysis": {
    "routes_in_app": 53,
    "modules_in_registry": 183,
    "page_components": 341,
    "error_boundaries": 8,
    "fallbacks": 14,
    "not_found_handlers": 3,
    "lazy_routes": 13,
    "broken_routes_markers": 0,
    "redirects": 39,
    "dynamic_routes": 0
  }
}
```

### Como Usar os Resultados

```bash
# Ver JSON formatado
cat analysis-reports/routes-analysis.json | jq '.'

# Ver páginas órfãs
cat analysis-reports/all-pages.txt

# Comparar com páginas importadas
diff analysis-reports/all-pages.txt analysis-reports/imported-pages.txt
```

---

## 💀 analyze-dead-code.sh

### O que faz

- ✅ Instala ts-prune se necessário
- ✅ Identifica exports não utilizados
- ✅ Conta arquivos TS/TSX
- ✅ Analisa imports
- ✅ Identifica componentes órfãos
- ✅ Analisa utilitários
- ✅ Analisa hooks customizados
- ✅ Identifica testes órfãos
- ✅ Calcula % de código morto

### Output Principal

```json
{
  "timestamp": "2025-12-11T22:25:43Z",
  "analysis": {
    "total_ts_files": 2962,
    "total_imports": 14063,
    "unused_exports": 0,
    "all_components": 1386,
    "imported_components": 175,
    "orphan_components": 1211,
    "util_files": 382,
    "hook_files": 130,
    "test_files": 333,
    "total_source_files": 2960,
    "dead_code_percentage": 87
  }
}
```

### Como Usar os Resultados

```bash
# Ver JSON formatado
cat analysis-reports/dead-code-analysis.json | jq '.'

# Ver componentes órfãos (não importados)
comm -23 \
  <(sort analysis-reports/all-components.txt) \
  <(sort analysis-reports/imported-components.txt)

# Contar componentes órfãos
comm -23 \
  <(sort analysis-reports/all-components.txt) \
  <(sort analysis-reports/imported-components.txt) | wc -l
```

### ⚠️ Notas Importantes

O script tenta instalar `ts-prune` automaticamente. Se falhar:

```bash
# Instalar manualmente
npm install -g ts-prune

# Executar manualmente
ts-prune --project tsconfig.json > analysis-reports/ts-prune-output.txt
```

---

## 📦 analyze-bundle.sh

### O que faz

- ✅ Verifica configuração do Vite
- ✅ Analisa imports de bibliotecas pesadas
- ✅ Verifica lazy loading
- ✅ Analisa code splitting
- ✅ Identifica assets não otimizados
- ✅ Verifica fontes customizadas
- ✅ Analisa compressão
- ✅ Verifica lazy-loaders
- ✅ Analisa tree-shaking
- ✅ Verifica Critical Rendering Path

### Output Principal

```json
{
  "timestamp": "2025-12-11T22:27:13Z",
  "analysis": {
    "heavy_imports": 16,
    "lazy_imports": 153,
    "dynamic_imports": 578,
    "total_lazy": 731,
    "images": 8,
    "large_images": 3,
    "fonts": 0,
    "lazy_loaders": 7,
    "named_imports": 13703,
    "default_imports": 1469,
    "wildcard_imports": 86,
    "treeshake_score": 99,
    "blocking_scripts": 6,
    "blocking_styles": 0
  },
  "recommendations": [
    "Implementar lazy loading para bibliotecas pesadas",
    "Otimizar imagens grandes",
    "Reduzir wildcard imports",
    "Adicionar defer/async aos scripts",
    "Configurar compressão Gzip/Brotli"
  ]
}
```

### Como Usar os Resultados

```bash
# Ver JSON formatado
cat analysis-reports/bundle-analysis.json | jq '.'

# Ver bibliotecas pesadas importadas
cat analysis-reports/heavy-imports.txt

# Ver imagens grandes
cat analysis-reports/large-images.txt

# Calcular tamanho total de imagens grandes
awk '{print $1}' analysis-reports/large-images.txt | \
  sed 's/M/*1024*1024/;s/K/*1024/' | bc | \
  awk '{sum+=$1} END {print sum/1024/1024 " MB"}'
```

---

## 📊 Interpretando os Resultados

### Métricas Críticas

| Métrica | Bom | Ruim | Crítico |
|---------|-----|------|---------|
| **Código morto (%)** | < 10% | 10-30% | > 30% |
| **Rotas conectadas (%)** | > 90% | 60-90% | < 60% |
| **Error boundaries (%)** | 100% | 80-100% | < 80% |
| **Lazy loading (%)** | 100% | 70-100% | < 70% |
| **Tree-shake score (%)** | > 95% | 85-95% | < 85% |
| **Bundle size (KB)** | < 500 | 500-1000 | > 1000 |
| **Imagens grandes (#)** | 0 | 1-2 | > 2 |

### Priorização de Ações

**P0 - Crítico (Imediato):**
- Código morto > 50%
- Rotas conectadas < 50%
- Error boundaries < 50%

**P1 - Alto (1-2 semanas):**
- Lazy loading < 70%
- Imagens grandes > 2
- Bundle size > 1MB

**P2 - Médio (1 mês):**
- Tree-shake score < 95%
- Compressão não configurada
- Wildcard imports > 100

---

## 🔧 Troubleshooting

### Script não executa

```bash
# Verificar permissões
ls -la scripts/analyze-*.sh

# Adicionar permissão de execução
chmod +x scripts/analyze-*.sh
```

### ts-prune não instala

```bash
# Instalar manualmente
npm install -g ts-prune

# Verificar instalação
ts-prune --version

# Executar manualmente
cd /home/ubuntu/github_repos/travel-hr-buddy
ts-prune --project tsconfig.json
```

### Pasta analysis-reports não é criada

```bash
# Criar manualmente
mkdir -p analysis-reports

# Verificar permissões
ls -la analysis-reports/
```

### Erros de "command not found"

```bash
# Verificar se comandos estão disponíveis
which find
which grep
which sed
which awk
which jq

# Instalar jq se necessário
sudo apt-get install jq
```

---

## 📈 Próximos Passos

Após executar os scripts:

1. **Revisar relatórios JSON**
   ```bash
   cat analysis-reports/*.json | jq '.'
   ```

2. **Ler relatório completo**
   ```bash
   cat ANALISE_TECNICA_FASE_A.md
   ```

3. **Priorizar ações**
   - Seguir recomendações P0, P1, P2

4. **Executar correções**
   - Começar por FASE A1 (Semana 1)

---

## 🆘 Suporte

**DeepAgent (Abacus.AI)**  
📅 Data: 11 de Dezembro de 2025  
🌊 Projeto: Nautilus One

Para dúvidas ou problemas, consulte o relatório principal:
`ANALISE_TECNICA_FASE_A.md`

---

**FIM DO README**
