# 🚀 GUIA RÁPIDO - INICIAR PREVIEW DO NAUTILUS ONE

## ✅ Node.js Instalado!

Agora você precisa **recarregar o terminal** para usar os comandos do Node.js.

---

## 📋 PASSOS PARA INICIAR O PREVIEW

### Opção 1: Reiniciar VS Code (RECOMENDADO)

1. **Feche o VS Code completamente**
2. **Abra novamente o VS Code**
3. **Abra o terminal integrado** (Ctrl + `)
4. Execute:
   ```powershell
   cd "c:\Users\Rodrigo e Lais\Downloads\travel-hr-buddy"
   npm install
   ```

### Opção 2: Novo Terminal

1. **Feche o terminal atual** no VS Code
2. **Abra um novo terminal** (Terminal → New Terminal)
3. Execute:
   ```powershell
   cd "c:\Users\Rodrigo e Lais\Downloads\travel-hr-buddy"
   npm install
   ```

### Opção 3: CMD ao invés de PowerShell

1. Abra um **novo terminal CMD** (não PowerShell)
2. Execute:
   ```cmd
   cd "c:\Users\Rodrigo e Lais\Downloads\travel-hr-buddy"
   npm install
   ```

---

## 🎯 APÓS npm install COMPLETAR

```powershell
# Iniciar servidor de desenvolvimento
npm run dev
```

Isso vai:
- ✅ Compilar o código TypeScript
- ✅ Iniciar o Vite dev server
- ✅ Abrir automaticamente no navegador (http://localhost:5173)

---

## 🌐 ACESSAR O SISTEMA

Após `npm run dev`, o sistema estará disponível em:

```
http://localhost:5173
```

---

## 🔍 VERIFICAR SE NODE.JS ESTÁ INSTALADO

Execute estes comandos para verificar:

```powershell
# Versão do Node.js
node --version

# Versão do npm
npm --version
```

**Resultado esperado:**
```
node --version
v20.x.x  (ou superior)

npm --version
10.x.x  (ou superior)
```

---

## ⚠️ SE AINDA NÃO FUNCIONAR

### Verificar instalação do Node.js:

1. **Abrir PowerShell NOVO** (fechar e abrir de novo)
2. Executar:
   ```powershell
   $env:Path
   ```
3. Verificar se contém algo como:
   ```
   C:\Program Files\nodejs\
   ```

### Adicionar manualmente ao PATH (se necessário):

1. Pressione `Win + R`
2. Digite: `sysdm.cpl`
3. Aba "Avançado" → "Variáveis de Ambiente"
4. Em "Variáveis do Sistema", encontre "Path"
5. Clique "Editar"
6. Verifique se existe:
   ```
   C:\Program Files\nodejs\
   ```
7. Se não existir, clique "Novo" e adicione
8. Clique OK em tudo
9. **Reinicie o VS Code**

---

## 🎉 QUANDO FUNCIONAR

Após `npm run dev`, você verá algo assim:

```
  VITE v5.x.x  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
  ➜  press h + enter to show help
```

**Abra o navegador em:** http://localhost:5173

---

## 🔑 LOGIN DE TESTE

Para acessar o sistema, você precisará:

1. **Criar uma conta** na tela de login
2. Ou **usar credenciais existentes** (se já tiver conta no Supabase)

---

## 📱 O QUE VOCÊ VERÁ

### Tela Inicial (Dashboard):
- 📊 Métricas em tempo real
- 🚨 Alertas críticos
- 📈 Gráficos de tendências
- 📋 Atividades recentes

### Módulos Disponíveis:
- 👥 **Crew Management** - Gestão de tripulação
- 🎓 **Training & Drills** - Treinamentos e simulados (com IA!)
- 🔍 **Audits** - Auditorias e inspeções
- 🔧 **Maintenance** - Manutenção preditiva
- 📄 **Reports** - Relatórios automatizados
- ⚙️ **Settings** - Configurações

### Novos AI Features para Testar:
- ✨ **Generate Drill Scenario** - Gerar cenários de simulado
- ✨ **Generate Quiz** - Criar questionários
- ✨ **Generate Report** - Relatórios com IA

---

## 🛠️ COMANDOS ÚTEIS

```powershell
# Instalar dependências
npm install

# Iniciar desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Rodar testes
npm run test

# Validar correções de segurança
.\scripts\validate-fixes.ps1
```

---

## 📊 PERFORMANCE ESPERADA

- **Build inicial:** ~1-2 minutos (primeira vez)
- **Hot reload:** < 1 segundo (após mudanças)
- **Servidor local:** Muito rápido (localhost)

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Reiniciar VS Code
2. ✅ Executar `npm install`
3. ✅ Executar `npm run dev`
4. ✅ Abrir http://localhost:5173
5. ✅ Explorar o sistema!

---

## 🆘 TROUBLESHOOTING

### Erro: "Cannot find module"
```powershell
# Limpar e reinstalar
rm -rf node_modules
npm install
```

### Erro: Port 5173 já em uso
```powershell
# Usar outra porta
npm run dev -- --port 3000
```

### Erro: Build muito lento
```powershell
# Build com mais memória
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

---

**IMPORTANTE:** Após instalar Node.js, sempre reinicie o terminal/VS Code para que os comandos funcionem!

**Status:** ✅ Node.js instalado, aguardando reinício do terminal
