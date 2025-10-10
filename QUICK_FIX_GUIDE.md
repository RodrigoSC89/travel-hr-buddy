# 🚨 QUICK FIX GUIDE - Issues Críticos

**Use este guia para correções rápidas dos problemas mais críticos.**

---

## 🔴 CRÍTICO #1: Empty Catch Blocks (100 restantes)

### Localizar
```bash
npm run lint 2>&1 | grep "Empty block statement"
```

### Corrigir
```typescript
// ❌ ERRADO
try {
  await operation();
} catch (error) {
  // vazio
}

// ✅ CORRETO - Opção 1: Com Toast
try {
  await operation();
} catch (error) {
  console.error('Operation failed', error);
  toast({
    title: "Erro",
    description: "Não foi possível completar a operação",
    variant: "destructive"
  });
}

// ✅ CORRETO - Opção 2: Silent mas logado
try {
  await operation();
} catch (error) {
  // Intentionally silent - non-critical operation
  console.error('Non-critical operation failed', error);
}

// ✅ CORRETO - Opção 3: Re-throw se crítico
try {
  await criticalOperation();
} catch (error) {
  console.error('Critical operation failed', error);
  toast({
    title: "Erro Crítico",
    description: "Operação falhou. Por favor, tente novamente.",
    variant: "destructive"
  });
  throw error; // Re-throw para error boundary capturar
}
```

### Importar Toast
```typescript
import { useToast } from "@/hooks/use-toast";

// No componente
const { toast } = useToast();
```

---

## 🔴 CRÍTICO #2: Tipos `any` (361 ocorrências)

### Localizar
```bash
npm run lint 2>&1 | grep "Unexpected any"
```

### Corrigir

#### Caso 1: Objetos Desconhecidos
```typescript
// ❌ ERRADO
function processData(data: any) {
  return data.value;
}

// ✅ CORRETO
function processData(data: Record<string, unknown>) {
  // Verificar antes de usar
  if (typeof data.value === 'string') {
    return data.value;
  }
  return '';
}
```

#### Caso 2: Arrays de Objetos
```typescript
// ❌ ERRADO
const items: any[] = [];

// ✅ CORRETO
interface Item {
  id: string;
  name: string;
}
const items: Item[] = [];
```

#### Caso 3: Respostas de API
```typescript
// ❌ ERRADO
interface ApiResponse {
  data: any;
}

// ✅ CORRETO
interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  error?: string;
}

// Uso
const response: ApiResponse<User[]> = await api.get('/users');
```

#### Caso 4: Props de Componente
```typescript
// ❌ ERRADO
interface StepProps {
  data: any;
  onChange: (data: any) => void;
}

// ✅ CORRETO
interface StepData {
  field1: string;
  field2: number;
}

interface StepProps {
  data: StepData;
  onChange: (data: StepData) => void;
}
```

---

## 🟡 IMPORTANTE: Console.logs (43)

### Localizar
```bash
grep -rn "console.log\|console.error" src --include="*.ts*"
```

### Corrigir
```typescript
// ❌ ERRADO
console.log("User:", user);
console.error("Error:", error);

// ✅ CORRETO - Importar logger
import { logger } from '@/utils/logger';

// Usar logger apropriado
logger.info("User loaded", { userId: user.id, role: user.role });
logger.error("Operation failed", { error, context: 'user-management' });
logger.debug("Debug info", debugData); // Só em dev
```

### Ou remover automaticamente
```bash
npm run clean:logs
```

---

## 🟡 IMPORTANTE: Imports Não Utilizados

### Localizar
Executar lint - aparecerá automaticamente:
```bash
npm run lint
```

### Corrigir Automaticamente
```bash
npm run lint:fix
```

### Corrigir Manualmente
```typescript
// ❌ Imports não usados
import { Button } from '@/components/ui/button';     // Não usado
import { Card } from '@/components/ui/card';         // Não usado
import { User, Settings, Bell } from 'lucide-react'; // Bell não usado

// ✅ Remover não usados
import { User, Settings } from 'lucide-react';
```

---

## 🔧 Ferramentas Rápidas

### Verificar Saúde do Código
```bash
# Ver todos erros
npm run lint

# Ver apenas erros críticos
npm run lint 2>&1 | grep "error"

# Contar erros por tipo
npm run lint 2>&1 | grep "error" | awk '{print $NF}' | sort | uniq -c | sort -rn
```

### Auto-fix Quando Possível
```bash
# Corrigir automaticamente
npm run lint:fix

# Formatar código
npm run format

# Limpar console.logs
npm run clean:logs
```

### Validar Build
```bash
# Build de produção
npm run build

# Se falhar, verificar mensagens de erro
npm run build 2>&1 | grep "error"
```

---

## 📋 Checklist Antes de Commit

Sempre executar antes de fazer commit:

```bash
# 1. Lint
npm run lint

# 2. Format
npm run format

# 3. Build
npm run build

# 4. Test (se aplicável)
npm run test
```

Se todos passarem: ✅ Pode commitar!

---

## 🎯 Padrões de Qualidade

### Error Handling
✅ **SEMPRE** logar erros  
✅ **SEMPRE** dar feedback ao usuário (toast/alert)  
✅ **NUNCA** deixar catch vazio  
✅ **CONSIDERAR** re-throw se crítico

### Type Safety
✅ **EVITAR** `any` - usar tipos específicos  
✅ **USAR** `unknown` se tipo realmente desconhecido  
✅ **CRIAR** interfaces para objetos complexos  
✅ **VALIDAR** dados de APIs/user input

### Logging
✅ **USAR** logger em vez de console  
✅ **NÃO** logar dados sensíveis  
✅ **INCLUIR** contexto nos logs  
✅ **USAR** níveis apropriados (info/debug/error)

### Imports
✅ **REMOVER** imports não usados  
✅ **ORGANIZAR** alfabeticamente  
✅ **PREFERIR** imports específicos  
✅ **AGRUPAR** por tipo (libs, components, utils)

---

## 🚀 Scripts Úteis

```bash
# Análise rápida
npm run lint 2>&1 | head -100                    # Ver primeiros 100 erros
npm run lint 2>&1 | grep "error" | wc -l        # Contar erros
npm run lint 2>&1 | grep "@typescript-eslint/no-explicit-any" | wc -l  # Contar any's

# Busca no código
grep -r "console.log" src --include="*.ts*"      # Encontrar console.logs
grep -r "TODO\|FIXME" src --include="*.ts*"      # Encontrar TODOs
grep -r "} catch.*{}" src --include="*.ts*"      # Encontrar catch vazios

# Estatísticas
find src -name "*.ts*" | wc -l                   # Contar arquivos
wc -l src/**/*.{ts,tsx} 2>/dev/null | tail -1   # Contar linhas
```

---

## 📞 Ajuda

Se encontrar algum problema:

1. **Verificar documentação completa:** `TECHNICAL_CODE_REVIEW_REPORT.md`
2. **Ver plano de ação:** `CODE_REVIEW_ACTION_PLAN.md`
3. **Consultar este guia:** `QUICK_FIX_GUIDE.md`

---

**Lembre-se:** Pequenas correções consistentes > Grande refactor de uma vez!
