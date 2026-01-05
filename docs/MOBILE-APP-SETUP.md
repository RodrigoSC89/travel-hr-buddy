# 📱 Mobile App Setup - Nautilus One v3.3.0

## Capacitor Configuration

O projeto está configurado com Capacitor para suporte a iOS e Android.

### Pré-requisitos

- Node.js 18+
- Para iOS: macOS com Xcode 14+
- Para Android: Android Studio com SDK 33+

### Dependências Instaladas

```json
{
  "@capacitor/android": "^7.4.3",
  "@capacitor/camera": "^7.0.2",
  "@capacitor/cli": "^7.4.3",
  "@capacitor/core": "^7.4.3",
  "@capacitor/haptics": "^7.0.2",
  "@capacitor/ios": "^7.4.3",
  "@capacitor/local-notifications": "^7.0.3",
  "@capacitor/push-notifications": "^7.0.3"
}
```

### Configuração Inicial

1. **Exportar para GitHub**
   - Clique em "Export to GitHub" no Lovable
   - Clone o repositório localmente

2. **Instalar dependências**
   ```bash
   npm install
   ```

3. **Adicionar plataformas**
   ```bash
   # Para iOS (requer macOS)
   npx cap add ios
   
   # Para Android
   npx cap add android
   ```

4. **Build do projeto**
   ```bash
   npm run build
   ```

5. **Sincronizar com plataformas nativas**
   ```bash
   npx cap sync
   ```

6. **Executar no emulador ou dispositivo**
   ```bash
   # iOS (requer Xcode)
   npx cap run ios
   
   # Android (requer Android Studio)
   npx cap run android
   ```

### Desenvolvimento com Hot Reload

O `capacitor.config.ts` está configurado para hot reload do sandbox:

```typescript
server: {
  url: 'https://ead06aad-a7d4-45d3-bdf7-e23796c6ac50.lovableproject.com?forceHideBadge=true',
  cleartext: true,
}
```

Para produção, remova ou comente a seção `server` e use `npm run build` + `npx cap sync`.

### Funcionalidades Nativas

| Feature | Plugin | Status |
|---------|--------|--------|
| Push Notifications | @capacitor/push-notifications | ✅ Configurado |
| Local Notifications | @capacitor/local-notifications | ✅ Configurado |
| Camera | @capacitor/camera | ✅ Configurado |
| Haptics | @capacitor/haptics | ✅ Configurado |

### Internacionalização (i18n)

O sistema suporta 4 idiomas:
- 🇺🇸 English (en)
- 🇧🇷 Português (pt)
- 🇪🇸 Español (es)
- 🇨🇳 中文 (zh)

Arquivos de tradução em: `src/i18n/locales/*.json`

### Instalação PWA

Acesse `/install` para guia de instalação do app via navegador.

### Integrações Enterprise

SAP e Oracle integrations configuradas em: `src/lib/integrations/enterprise-erp.ts`

### Próximos Passos

1. [ ] Configurar Firebase Cloud Messaging para push notifications
2. [ ] Criar ícones e splash screens nativos
3. [ ] Configurar App Store Connect (iOS)
4. [ ] Configurar Google Play Console (Android)
5. [ ] Testar em dispositivos físicos
6. [ ] Submeter para aprovação nas stores

### Recursos

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Lovable Mobile Guide](https://docs.lovable.dev/tips-tricks/mobile-development)
- [iOS Development Guide](https://capacitorjs.com/docs/ios)
- [Android Development Guide](https://capacitorjs.com/docs/android)

---

*Nautilus One v3.2.0 - Mobile & Multilingual Ready 📱🌍*
