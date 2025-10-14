# Guia de Testes - Correção do Preview do Lovable

## Objetivo
Validar que a correção do erro de preview funciona corretamente em todos os cenários de uso.

## Pré-requisitos
- Aplicação deployada no Lovable ou ambiente de staging
- Acesso aos DevTools do navegador
- Diferentes navegadores para testes (Chrome, Firefox, Safari, Edge)

## 1. Testes de Navegação Normal ✅

### Teste 1.1: Acesso à Home Page
**Passos:**
1. Acessar `https://[projeto].lovableproject.com/`
2. Verificar que a página inicial carrega corretamente
3. Abrir DevTools → Console
4. Verificar que não há erros no console

**Resultado Esperado:**
- ✅ Página carrega sem erros
- ✅ Console limpo (sem erros críticos)
- ✅ Nenhum redirecionamento desnecessário

### Teste 1.2: Navegação via Menu
**Passos:**
1. Na home page, clicar no menu
2. Navegar para "Dashboard"
3. Navegar para "Settings"
4. Navegar para "Admin"

**Resultado Esperado:**
- ✅ Todas as rotas carregam corretamente
- ✅ URL atualiza conforme navegação
- ✅ Nenhum erro no console

## 2. Testes de Acesso Direto a URLs 🎯

### Teste 2.1: Acesso Direto ao Dashboard
**Passos:**
1. Abrir nova aba
2. Digitar diretamente: `https://[projeto].lovableproject.com/dashboard`
3. Pressionar Enter
4. Observar o comportamento

**Resultado Esperado:**
- ✅ Breve tela de "Redirecionando..." (< 1 segundo)
- ✅ Dashboard carrega corretamente
- ✅ URL permanece como `/dashboard`
- ✅ Console mostra sessionStorage sendo usado

### Teste 2.2: Acesso Direto ao Settings
**Passos:**
1. Acessar diretamente: `https://[projeto].lovableproject.com/settings`

**Resultado Esperado:**
- ✅ Página Settings carrega corretamente
- ✅ Sem loops de redirecionamento

### Teste 2.3: Acesso Direto a Rota Admin
**Passos:**
1. Acessar diretamente: `https://[projeto].lovableproject.com/admin/analytics`

**Resultado Esperado:**
- ✅ Página admin/analytics carrega
- ✅ URL preservada corretamente

## 3. Testes de Refresh de Página 🔄

### Teste 3.1: Refresh no Dashboard
**Passos:**
1. Navegar normalmente para `/dashboard`
2. Pressionar F5 ou Ctrl+R
3. Observar comportamento

**Resultado Esperado:**
- ✅ Página mantém-se no Dashboard
- ✅ Dados são recarregados
- ✅ URL não muda

### Teste 3.2: Refresh em Rotas Aninhadas
**Passos:**
1. Navegar para `/admin/documents/view/123`
2. Fazer refresh
3. Verificar que a rota é preservada

**Resultado Esperado:**
- ✅ Rota preservada após refresh
- ✅ Página carrega corretamente

## 4. Testes com Query Params e Hash 🔗

### Teste 4.1: URL com Query Parameters
**Passos:**
1. Acessar: `https://[projeto].lovableproject.com/dashboard?filter=active&sort=date`
2. Verificar que filtros são aplicados

**Resultado Esperado:**
- ✅ Query params preservados
- ✅ Filtros aplicados corretamente
- ✅ URL completa mantida

### Teste 4.2: URL com Hash Fragment
**Passos:**
1. Acessar: `https://[projeto].lovableproject.com/settings#security`
2. Verificar que a página rola para a seção

**Resultado Esperado:**
- ✅ Hash preservado
- ✅ Scroll automático para seção
- ✅ URL completa: `/settings#security`

### Teste 4.3: URL Complexa
**Passos:**
1. Acessar: `https://[projeto].lovableproject.com/reports?year=2024&type=summary#results`
2. Fazer refresh na página

**Resultado Esperado:**
- ✅ Toda a URL preservada
- ✅ Query params e hash funcionam

## 5. Testes de Links Compartilhados 📤

### Teste 5.1: Compartilhar Link
**Passos:**
1. Navegar para uma página específica
2. Copiar URL do navegador
3. Abrir em nova aba anônima
4. Colar e acessar o link

**Resultado Esperado:**
- ✅ Link funciona em nova sessão
- ✅ Página correta é carregada
- ✅ Sem erro 404

### Teste 5.2: Link em Email/Mensagem
**Passos:**
1. Enviar link para si mesmo via email
2. Clicar no link do email
3. Verificar que abre corretamente

**Resultado Esperado:**
- ✅ Link clicável funciona
- ✅ Página carrega sem erros

## 6. Testes de Edge Cases 🔧

### Teste 6.1: Modo Privado/Incógnito
**Passos:**
1. Abrir navegador em modo privado
2. Acessar diretamente uma rota
3. Observar comportamento

**Resultado Esperado:**
- ✅ Funciona normalmente, ou
- ✅ Redireciona para home graciosamente
- ✅ Sem crashes ou erros críticos

### Teste 6.2: JavaScript Desabilitado
**Passos:**
1. Desabilitar JavaScript no navegador:
   - Chrome: DevTools → Settings → Debugger → Disable JavaScript
   - Firefox: about:config → javascript.enabled = false
2. Acessar qualquer rota
3. Verificar mensagem de fallback

**Resultado Esperado:**
- ✅ Mostra mensagem: "JavaScript é necessário..."
- ✅ Link para home page visível e funcionando
- ✅ Design consistente com tema da aplicação

### Teste 6.3: Bloqueio de Cookies/Storage
**Passos:**
1. Configurar navegador para bloquear todos os cookies
2. Acessar rota diretamente
3. Verificar fallback

**Resultado Esperado:**
- ✅ Redireciona para home sem erros, ou
- ✅ Tenta funcionamento normal
- ✅ Console mostra warning apropriado

## 7. Testes de Performance ⚡

### Teste 7.1: Tempo de Redirecionamento
**Passos:**
1. Abrir DevTools → Network
2. Acessar rota direta
3. Medir tempo até página carregar

**Resultado Esperado:**
- ✅ Redirecionamento < 500ms
- ✅ Sem delay perceptível ao usuário
- ✅ Loading spinner aparece brevemente

### Teste 7.2: Sem Loops Infinitos
**Passos:**
1. Acessar várias rotas rapidamente
2. Fazer refresh múltiplas vezes
3. Verificar que não há loops

**Resultado Esperado:**
- ✅ Nenhum loop de redirecionamento
- ✅ sessionStorage limpo após uso
- ✅ Comportamento estável

## 8. Testes Cross-Browser 🌐

### Teste 8.1: Chrome/Edge (Chromium)
**Passos:**
1. Executar todos os testes básicos
2. Verificar DevTools para warnings

**Resultado Esperado:**
- ✅ Funciona perfeitamente
- ✅ Sem warnings específicos do Chrome

### Teste 8.2: Firefox
**Passos:**
1. Executar todos os testes básicos
2. Verificar console do Firefox

**Resultado Esperado:**
- ✅ Funciona perfeitamente
- ✅ Sem avisos específicos do Firefox

### Teste 8.3: Safari
**Passos:**
1. Executar todos os testes básicos
2. Testar especialmente em modo privado

**Resultado Esperado:**
- ✅ Funciona corretamente
- ✅ sessionStorage funciona ou fallback ativa

## 9. Testes Mobile 📱

### Teste 9.1: Chrome Mobile
**Passos:**
1. Acessar site no mobile
2. Testar acesso direto a rotas
3. Testar compartilhamento de links

**Resultado Esperado:**
- ✅ Funciona como no desktop
- ✅ Layout responsivo OK

### Teste 9.2: Safari iOS
**Passos:**
1. Acessar no iPhone/iPad
2. Testar rotas diretas
3. Adicionar à tela inicial (PWA)

**Resultado Esperado:**
- ✅ Funciona normalmente
- ✅ PWA mantém funcionalidade

## 10. Verificação DevTools 🔍

### Teste 10.1: Console Logs
**Passos:**
1. Abrir DevTools → Console
2. Acessar rota direta
3. Verificar logs

**Logs Esperados:**
```
(No caso de redirect)
- Nenhum erro crítico
- Possível info: sessionStorage sendo usado
```

### Teste 10.2: Network Tab
**Passos:**
1. Abrir DevTools → Network
2. Acessar rota direta
3. Verificar requisições

**Resultado Esperado:**
- ✅ 404.html carregado (se aplicável)
- ✅ index.html carregado
- ✅ Assets carregados corretamente
- ✅ Sem requisições falhando

### Teste 10.3: Application Storage
**Passos:**
1. DevTools → Application → Session Storage
2. Acessar rota direta
3. Observar sessionStorage

**Resultado Esperado:**
- ✅ `redirectPath` criado temporariamente
- ✅ `redirectPath` removido após redirect
- ✅ Storage limpo após uso

## Checklist de Validação Final ✅

### Funcionalidade Core
- [ ] Acesso direto a URLs funciona
- [ ] Refresh de página preserva rota
- [ ] Query params preservados
- [ ] Hash fragments preservados
- [ ] Links compartilhados funcionam

### Robustez
- [ ] Modo privado funciona ou fallback ativa
- [ ] JavaScript desabilitado tem fallback
- [ ] Bloqueio de storage tratado
- [ ] Sem loops de redirecionamento
- [ ] Sem crashes ou erros críticos

### Performance
- [ ] Redirecionamento rápido (< 500ms)
- [ ] Sem impacto no bundle size significativo
- [ ] PWA continua funcionando
- [ ] Cache não afetado negativamente

### Compatibilidade
- [ ] Chrome/Edge funcionando
- [ ] Firefox funcionando
- [ ] Safari funcionando
- [ ] Mobile Chrome funcionando
- [ ] Mobile Safari funcionando

### Documentação
- [ ] README atualizado
- [ ] Guia técnico completo
- [ ] Comentários no código
- [ ] Logs apropriados

## Resultado Final

**Status**: ___ APROVADO / REPROVADO

**Data do Teste**: _______________

**Testador**: _______________

**Notas Adicionais**:
_______________________________________________
_______________________________________________
_______________________________________________

## Problemas Encontrados

| # | Descrição | Severidade | Status |
|---|-----------|------------|--------|
| 1 |           |            |        |
| 2 |           |            |        |
| 3 |           |            |        |

## Assinatura

Testador: _______________ Data: _______________

Aprovador: _______________ Data: _______________
