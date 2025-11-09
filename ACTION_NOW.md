# ⚡ AÇÃO IMEDIATA - Nautilus One TypeScript Fix

## 🎯 SITUAÇÃO ATUAL

✅ **COMPLETO:** Infraestrutura + 1 edge function corrigida  
⏳ **PENDENTE:** 5 edge functions + 7 serviços  
📊 **PROGRESSO:** 14%

---

## 🚀 O QUE FAZER AGORA (PASSO A PASSO)

### 1️⃣ Abrir os arquivos de referência

```powershell
# Abra estes 3 arquivos no VSCode:

# 1. Tipos compartilhados (sua biblioteca)
code supabase\functions\_shared\types.ts

# 2. Exemplo corrigido (seu template)
code supabase\functions\generate-drill-evaluation\index.ts

# 3. Guia completo (suas instruções)
code TYPE_SAFETY_FIX_GUIDE.md
```

### 2️⃣ Escolha a próxima edge function para corrigir

```powershell
# Comece com a mais simples:
code supabase\functions\generate-drill-scenario\index.ts
```

### 3️⃣ Use o AI Assistant com este prompt

Copie e cole no **GitHub Copilot Chat** ou **Cursor**:

```
Corrija o arquivo generate-drill-scenario/index.ts seguindo EXATAMENTE o padrão do arquivo generate-drill-evaluation/index.ts já corrigido.

MUDANÇAS NECESSÁRIAS:

1. LINHA 1: Remover @ts-nocheck e substituir por:
// PATCH 599: Generate Drill Scenario Edge Function  
// TYPE SAFETY FIX: Removed @ts-nocheck, added proper TypeScript types

2. IMPORTS: Adicionar no topo (após o import do serve):
import { 
  createResponse, 
  EdgeFunctionError, 
  validateRequestBody, 
  corsHeaders,
  handleCORS,
  getEnvVar,
  safeJSONParse,
  log
} from '../_shared/types.ts'

3. INTERFACES: Criar antes do serve():
interface DrillScenarioRequest {
  drill_type: string
  vessel_id?: string
  context?: string
  difficulty?: 'basic' | 'intermediate' | 'advanced' | 'expert'
}

interface DrillScenarioResponse {
  title: string
  description: string
  scenario: string
  objectives: string[]
  duration_minutes: number
  roles_involved: string[]
  equipment_needed: string[]
  success_criteria: string[]
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

4. HANDLER: Modificar o serve() para:
serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCORS()
  }

  const requestId = crypto.randomUUID()
  log('info', 'Drill scenario request received', { requestId })

  try {
    // Parse and validate request body
    const body = await req.json() as DrillScenarioRequest
    validateRequestBody(body as Record<string, unknown>, ['drill_type'])
    
    const { drill_type, vessel_id, context, difficulty } = body

    // Get OpenAI API key with validation
    const openaiApiKey = getEnvVar('OPENAI_API_KEY')

    // ... resto da lógica existente de chamada à OpenAI ...

    // No final, ao invés do return new Response(), usar:
    const result = safeJSONParse<DrillScenarioResponse>(content)
    return createResponse<DrillScenarioResponse>(result, undefined, requestId)

  } catch (error) {
    log('error', 'Error in drill scenario generation', { 
      error: error instanceof Error ? error.message : String(error),
      requestId
    })

    if (error instanceof EdgeFunctionError) {
      return createResponse(undefined, error, requestId)
    }

    return createResponse(
      undefined,
      new EdgeFunctionError(
        'INTERNAL_ERROR',
        error instanceof Error ? error.message : 'An unexpected error occurred',
        500,
        { originalError: String(error) }
      ),
      requestId
    )
  }
})

5. ERROR HANDLING: Substituir throw new Error() por:
throw new EdgeFunctionError('CODIGO_ERRO', 'mensagem', statusCode)

6. LOGGING: Substituir console.error/log por:
log('info|warn|error', 'mensagem', { dados })

IMPORTANTE: 
- Mantenha TODA a lógica existente
- Mantenha o prompt do OpenAI exatamente igual
- Apenas adicione type safety
- NÃO mude a funcionalidade
```

### 4️⃣ Validar a correção

```powershell
# Navegar para a função
cd supabase\functions\generate-drill-scenario

# Verificar erros TypeScript
deno check index.ts

# Se houver erros, corrigir e repetir
# Se não houver erros, sucesso! ✅
```

### 5️⃣ Repetir para as outras 4 edge functions

Mesma sequência para:
- `generate-report/index.ts` (use interfaces do guia)
- `generate-scheduled-tasks/index.ts` (use interfaces do guia)
- `generate-training-explanation/index.ts` (use interfaces do guia)
- `generate-training-quiz/index.ts` (use interfaces do guia)

**DICA:** As interfaces específicas de cada uma estão em `TYPE_SAFETY_FIX_GUIDE.md`

---

## ✅ CHECKLIST DE CONCLUSÃO

Após corrigir TODAS as 6 edge functions:

```powershell
# 1. Verificar que não há mais @ts-nocheck em edge functions
grep -r "@ts-nocheck" supabase\functions\*\index.ts
# Resultado esperado: Nenhum match ou apenas comentários

# 2. Verificar compilação TypeScript
npx tsc --noEmit
# Resultado esperado: Zero erros

# 3. Build do projeto
npm run build
# Resultado esperado: Build successful
```

---

## 📊 APÓS COMPLETAR AS EDGE FUNCTIONS

Você terá:
- ✅ 6/6 Edge Functions com type safety completo
- ✅ Zero @ts-nocheck em código crítico
- ✅ Padrão estabelecido para futuras functions
- ✅ **BLOCKER DE PRODUÇÃO REMOVIDO** 🎉

Próximo passo: Corrigir os 7 serviços frontend seguindo padrão similar

---

## 🆘 SE ENCONTRAR PROBLEMAS

### Erro: "Cannot find module '../_shared/types.ts'"
**Solução:** Verifique se o arquivo `supabase/functions/_shared/types.ts` existe. Ele deve ter sido criado no passo inicial.

### Erro: "EdgeFunctionError is not defined"
**Solução:** Verifique se importou corretamente os tipos:
```typescript
import { EdgeFunctionError, ... } from '../_shared/types.ts'
```

### Erro: Deno check falha
**Solução:** Copie EXATAMENTE o padrão do `generate-drill-evaluation/index.ts` corrigido.

---

## 💡 ATALHO RÁPIDO

Se quiser acelerar, faça assim:

1. Abra 2 janelas VSCode lado a lado
2. Esquerda: `generate-drill-evaluation/index.ts` (exemplo)
3. Direita: arquivo que você está corrigindo
4. Copie a estrutura do exemplo
5. Adapte as interfaces específicas
6. Valide com `deno check`

---

## 🎯 META

**HOJE:** Completar as 6 edge functions  
**TEMPO ESTIMADO:** 1.5-2 horas  
**RESULTADO:** Deploy de produção desbloqueado ✨

---

**Comece agora! 🚀**

```powershell
code supabase\functions\generate-drill-scenario\index.ts
```
