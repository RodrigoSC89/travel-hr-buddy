# 🚀 Deploy Nautilus One no Vercel

## ✅ Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- Repositório GitHub conectado ao Lovable
- Variáveis de ambiente Supabase

---

## 📋 Passo a Passo (5 minutos)

### 1️⃣ Conectar ao Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **"Import Git Repository"**
3. Selecione seu repositório GitHub (travel-hr-buddy)
4. Clique em **"Import"**

### 2️⃣ Configurar Projeto

Na página de configuração:

- **Framework Preset**: `Vite` (detectado automaticamente)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm ci`

### 3️⃣ Adicionar Variáveis de Ambiente

Clique em **"Environment Variables"** e adicione:

```bash
VITE_SUPABASE_URL=https://vnbptmixvwropvanyhdb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE
VITE_SUPABASE_PROJECT_ID=vnbptmixvwropvanyhdb
VITE_MQTT_URL=wss://broker.hivemq.com:8884/mqtt
VITE_ENABLE_CLIENT_METRICS=false
```

**IMPORTANTE**: Marque todas como disponíveis para **Production**, **Preview** e **Development**

### 4️⃣ Deploy

1. Clique em **"Deploy"**
2. Aguarde ~2-3 minutos
3. Pronto! 🎉

---

## 🌐 Após o Deploy

### Sua URL será algo como:
```
https://travel-hr-buddy.vercel.app
```

### Configurar Domínio Customizado (opcional)
1. Vá em **Settings → Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções

---

## 🔄 Deploy Automático

Agora, cada push no GitHub fará deploy automático:
- Push na `main` → Deploy em **Production**
- Push em outras branches → Deploy de **Preview**

---

## 🐛 Troubleshooting

### Build falhou?
```bash
# Teste localmente primeiro
npm ci
npm run build
```

### Variáveis não funcionam?
- Certifique-se que começam com `VITE_`
- Faça redeploy após adicionar variáveis
- Limpe cache do navegador

### Preview congelado?
- Acesse com `?full=1` na URL para modo completo
- Exemplo: `https://seu-app.vercel.app?full=1`

---

## 📊 Monitoramento

No Vercel Dashboard:
- **Analytics**: métricas de performance
- **Logs**: logs de runtime
- **Deployments**: histórico de deploys

---

## 🎯 Checklist Final

- [ ] Build local passou (`npm run build`)
- [ ] Variáveis de ambiente adicionadas
- [ ] Deploy concluído com sucesso
- [ ] App acessível na URL Vercel
- [ ] Dashboard carrega corretamente
- [ ] Autenticação Supabase funciona

---

**Tempo total**: ~5 minutos  
**Custo**: Grátis (Hobby Plan)  
**Uptime**: 99.99%

🎉 **Sistema Nautilus One em produção!**
