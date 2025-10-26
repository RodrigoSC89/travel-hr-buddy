# PATCH 195.0 – Module Sync Validation

## 📘 Objetivo
Validar sincronização completa entre registry de módulos, rotas e arquivos físicos, garantindo que não existam rotas órfãs ou módulos não mapeados.

## ✅ Checklist de Validação

### 1. Registry Atualizado
- [ ] `modules-registry.json` contém todos os módulos ativos
- [ ] Status correto para cada módulo (active/deprecated)
- [ ] Paths físicos corretos
- [ ] Rotas mapeadas corretamente
- [ ] Versões atualizadas
- [ ] Metadados completos (category, description)
- [ ] Statistics refletem realidade

### 2. Rotas Sem Módulo Removidas
- [ ] Nenhuma rota órfã em `router.tsx`
- [ ] Todas as rotas têm componente válido
- [ ] Lazy loading configurado corretamente
- [ ] Imports verificados e funcionais
- [ ] Redirecionamentos mapeados
- [ ] Rotas deprecated com redirect

### 3. Consistência Router ↔ Registry
- [ ] Toda rota em `router.tsx` está no registry
- [ ] Todo módulo ativo tem rota configurada
- [ ] Paths batem entre router e registry
- [ ] Rotas deprecated não aparecem no router principal
- [ ] Fallback 404 configurado
- [ ] Root route (`/`) funcional

### 4. Menu Config Sincronizado
- [ ] `menu-config.json` só lista módulos ativos
- [ ] Ordem dos itens lógica e consistente
- [ ] Ícones corretos para cada módulo
- [ ] Agrupamento por categoria correto
- [ ] Labels claros e descritivos
- [ ] Badges/notifications configurados

### 5. Navegação Funcional
- [ ] Todos os itens do menu navegam corretamente
- [ ] Breadcrumbs exibem path correto
- [ ] Navegação direta via URL funciona
- [ ] Deep links operacionais
- [ ] Back/forward do browser funcionam
- [ ] Active state do menu correto

### 6. Arquivos Físicos Alinhados
- [ ] Pastas de módulos correspondem ao registry
- [ ] Nenhuma pasta órfã em `src/modules/`
- [ ] Estrutura de pastas consistente
- [ ] Componentes principais presentes (index.tsx)
- [ ] Types definidos onde necessário
- [ ] Hooks e utils organizados

## 📊 Critérios de Sucesso
- ✅ 100% das rotas têm módulo correspondente
- ✅ 0 rotas órfãs no router
- ✅ Registry reflete estrutura real de pastas
- ✅ Menu e router sincronizados
- ✅ Nenhuma navegação quebrada
- ✅ Redirecionamentos funcionam

## 🔍 Testes Recomendados

### Teste 1: Validação de Registry
```bash
# Verificar estrutura do registry
cat modules-registry.json | jq '.modules[] | {id, status, route}'

# Contar módulos por status
cat modules-registry.json | jq '.statistics'

# Validar rotas duplicadas
cat modules-registry.json | jq '.routes[].path' | sort | uniq -d
```

### Teste 2: Auditoria de Rotas
1. Listar todas as rotas em `router.tsx`
2. Para cada rota, verificar:
   - Componente existe fisicamente
   - Path correto no import
   - Lazy loading funciona
   - Está no registry
3. Testar navegação direta para cada rota
4. Validar redirects de rotas deprecated

### Teste 3: Menu vs Registry
1. Abrir `menu-config.json`
2. Para cada item no menu:
   - Verificar existe no registry
   - Status é "active"
   - Rota está no router
   - Navegar via interface
3. Verificar módulos ativos sem item no menu

### Teste 4: Pastas Físicas
```bash
# Listar todos os módulos físicos
ls -1 src/modules/

# Comparar com registry
# Verificar se há pastas não mapeadas
# Identificar deprecated folders
```

### Teste 5: Navegação End-to-End
1. Clicar em cada item do menu principal
2. Verificar página carrega sem erro
3. Testar subrotas se existirem
4. Validar breadcrumbs corretos
5. Testar navegação entre módulos
6. Confirmar active state do menu

## 🚨 Cenários de Erro

### Rota Órfã
- [ ] Rota definida mas módulo não existe
- [ ] Import path incorreto
- [ ] Componente deletado
- [ ] Lazy load falha
- **Fix**: Remover rota ou criar módulo

### Módulo Sem Rota
- [ ] Módulo ativo mas sem rota no router
- [ ] Entry no registry mas não no router
- [ ] Menu aponta para rota inexistente
- **Fix**: Adicionar rota ou marcar como deprecated

### Inconsistência de Path
- [ ] Path no registry diferente do router
- [ ] Path no menu diferente do registry
- [ ] Import path não resolve
- **Fix**: Alinhar paths em todos os arquivos

### Pasta Órfã
- [ ] Pasta em `src/modules/` sem entry no registry
- [ ] Código antigo não removido
- [ ] Duplicação de módulos
- **Fix**: Mapear no registry ou arquivar pasta

## 📁 Arquivos a Verificar
- [ ] `modules-registry.json`
- [ ] `src/config/router.tsx`
- [ ] `src/config/menu-config.json`
- [ ] `src/lib/registry/modules-status.ts`
- [ ] `src/lib/registry/modules-definition.ts`
- [ ] `src/modules/*/index.tsx`

## 📊 Inventário de Sincronização

### Antes da Sincronização
- [ ] Rotas no router: _____
- [ ] Módulos no registry: _____
- [ ] Itens no menu: _____
- [ ] Pastas físicas: _____
- [ ] Rotas órfãs: _____
- [ ] Módulos não mapeados: _____

### Após Sincronização
- [ ] Rotas no router: _____
- [ ] Módulos ativos: _____
- [ ] Itens no menu: _____
- [ ] Pastas mapeadas: _____
- [ ] Rotas órfãs: 0
- [ ] Módulos não mapeados: 0

## 📊 Matriz de Validação

| Módulo ID | Registry | Router | Menu | Pasta Física | Status |
|-----------|----------|--------|------|--------------|--------|
| fleet     | ✅       | ✅     | ✅   | ✅           | ✅     |
| finance-hub | ✅     | ✅     | ✅   | ✅           | ✅     |
| performance | ✅     | ✅     | ✅   | ✅           | ✅     |
| crew      | ✅       | ✅     | ✅   | ✅           | ✅     |
| documents | ✅       | ✅     | ✅   | ✅           | ✅     |
| maritime  | ✅ (deprecated) | ✅ (redirect) | ❌ | ❌ | ✅ |
| ...       | ...      | ...    | ...  | ...          | ...    |

## 🧪 Validação Automatizada
```bash
# Script de validação de sync
npm run validate:sync

# Verificar rotas
npm run test:routes

# Validar registry
npm run validate:registry

# Lint de imports
npm run lint:imports

# Build e verificar
npm run build
```

## 🛠️ Script de Validação Sugerido
```typescript
// scripts/validate-sync.ts
import registry from '../modules-registry.json';
import fs from 'fs';
import path from 'path';

// 1. Verificar rotas no router batem com registry
// 2. Verificar pastas físicas existem para módulos ativos
// 3. Verificar menu só referencia módulos ativos
// 4. Gerar relatório de inconsistências
// 5. Sugerir correções
```

## 📝 Notas de Validação
- **Data**: _____________
- **Validador**: _____________
- **Rotas validadas**: _____
- **Módulos sincronizados**: _____
- **Inconsistências encontradas**: _____
- **Inconsistências corrigidas**: _____
- **Ambiente**: [ ] Dev [ ] Staging [ ] Production
- **Status**: [ ] ✅ Aprovado [ ] ❌ Reprovado [ ] 🔄 Em Revisão

## 🎯 Checklist de Go-Live
- [ ] Registry 100% sincronizado
- [ ] Zero rotas órfãs
- [ ] Menu funcional e consistente
- [ ] Navegação fluida
- [ ] Redirecionamentos funcionam
- [ ] Build sem warnings de rotas
- [ ] Script de validação passa
- [ ] Documentação atualizada

## ⚠️ Ações Corretivas

### Se Rota Órfã Detectada
1. Identificar módulo correspondente
2. Verificar se deve ser removida ou corrigida
3. Se remover: deletar do router
4. Se corrigir: ajustar path e import

### Se Módulo Sem Rota
1. Decidir se deve ser ativado
2. Se sim: adicionar rota no router
3. Se não: marcar como deprecated no registry
4. Atualizar menu config

### Se Inconsistência de Path
1. Definir path canônico
2. Atualizar registry
3. Atualizar router
4. Atualizar menu
5. Verificar imports no código

## 📋 Observações Adicionais
_____________________________________________
_____________________________________________
_____________________________________________
