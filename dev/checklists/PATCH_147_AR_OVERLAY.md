# ✅ PATCH 147.0 — AR Overlay

**Status:** 🟡 Pendente de Validação  
**Data:** 2025-10-25  
**Responsável:** Sistema de Validação Automática

---

## 📋 Resumo do PATCH

Implementação de overlay de Realidade Aumentada (AR) para visualização de informações contextuais sobre equipamentos, sensores e pontos de interesse a bordo.

---

## 🎯 Objetivos do PATCH

- [x] Ativação da câmera com permissões adequadas
- [x] Overlay AR com marcadores virtuais
- [x] Detecção de equipamentos via QR Code ou GPS
- [x] Informações contextuais em tempo real
- [x] Suporte a múltiplos marcadores simultâneos

---

## 🔍 Checklist de Validação

### ◼️ Ativação e Permissões

- [ ] **Acesso à Câmera**
  - [ ] Solicitação de permissão clara e informativa
  - [ ] Fallback adequado se permissão negada
  - [ ] Câmera traseira selecionada por padrão
  - [ ] Opção de trocar entre câmeras (frontal/traseira)

- [ ] **Compatibilidade**
  - [ ] Funciona em iOS Safari
  - [ ] Funciona em Android Chrome
  - [ ] Detecção de dispositivos sem suporte AR
  - [ ] Mensagem clara em dispositivos incompatíveis

### ◼️ Overlay e Marcadores

- [ ] **Renderização do Overlay**
  - [ ] Vídeo da câmera em tempo real
  - [ ] Marcadores virtuais sobrepostos corretamente
  - [ ] Ajuste automático de posição conforme movimento
  - [ ] FPS estável (> 24fps)

- [ ] **Tipos de Marcadores**
  - [ ] Marcador de equipamento (motor, bomba, etc.)
  - [ ] Marcador de sensor (temperatura, pressão)
  - [ ] Marcador de ponto de interesse (saída emergência)
  - [ ] Marcador de alerta/manutenção

- [ ] **Informações Contextuais**
  - [ ] Nome do equipamento/sensor
  - [ ] Status operacional (OK, Warning, Error)
  - [ ] Dados em tempo real (temperatura, RPM, etc.)
  - [ ] Última manutenção realizada
  - [ ] Botão para detalhes completos

### ◼️ Detecção e Rastreamento

- [ ] **QR Code Scanning**
  - [ ] Detecção automática de QR codes
  - [ ] Leitura e parsing corretos
  - [ ] Carregamento de dados do equipamento
  - [ ] Feedback visual ao detectar código

- [ ] **Posicionamento GPS**
  - [ ] Localização do usuário obtida
  - [ ] Cálculo de distância até marcadores
  - [ ] Filtro de marcadores por proximidade (< 50m)
  - [ ] Atualização contínua de posição

- [ ] **Rastreamento de Marcadores**
  - [ ] Marcador permanece fixo no equipamento
  - [ ] Ajuste de escala conforme distância
  - [ ] Fade out quando equipamento sai do campo de visão
  - [ ] Limite de 10 marcadores simultâneos

### ◼️ Performance

- [ ] **Otimizações**
  - [ ] Throttling de atualizações (30fps)
  - [ ] Lazy loading de dados de equipamentos
  - [ ] Compressão de texturas/ícones
  - [ ] Desativação de marcadores fora de vista

- [ ] **Métricas**
  - [ ] Latência de detecção < 500ms
  - [ ] FPS médio > 24fps
  - [ ] Uso de bateria aceitável (< 20%/hora)
  - [ ] Uso de CPU < 50%

---

## 🧪 Cenários de Teste

### Teste 1: Ativação do AR
```
1. Abrir módulo AR no app
2. Conceder permissão de câmera
3. Verificar inicialização do overlay
4. Observar vídeo em tempo real
5. Confirmar FPS estável
```

**Resultado Esperado:**
- Permissão solicitada uma única vez
- Câmera ativa em < 2s
- Overlay renderizado corretamente
- FPS > 24fps

### Teste 2: Escaneamento de QR Code
```
1. Ativar AR overlay
2. Apontar câmera para QR code de equipamento
3. Aguardar detecção automática
4. Verificar carregamento de dados
5. Observar marcador sobreposto
```

**Resultado Esperado:**
- QR code detectado em < 1s
- Dados carregados e exibidos
- Marcador posicionado corretamente
- Informações atualizadas em tempo real

### Teste 3: Múltiplos Marcadores
```
1. Ativar AR em área com 5+ equipamentos
2. Escanear QR codes de 3 equipamentos diferentes
3. Movimentar câmera para visualizar todos
4. Verificar persistência e posicionamento
5. Observar performance
```

**Resultado Esperado:**
- Até 10 marcadores simultâneos
- Cada marcador rastreia seu equipamento
- Escala ajusta conforme distância
- FPS mantém-se > 20fps

### Teste 4: Detecção de Alertas
```
1. Escanear equipamento com status "Warning"
2. Verificar marcador em cor de alerta (amarelo)
3. Tocar no marcador para ver detalhes
4. Confirmar descrição do problema
5. Verificar sugestão de ação corretiva
```

**Resultado Esperado:**
- Marcador em cor de alerta visível
- Detalhes carregam ao tocar
- Informações claras sobre o problema
- Opção de registrar ação tomada

### Teste 5: Performance em Movimento
```
1. Ativar AR overlay
2. Escanear 3 equipamentos
3. Caminhar pela embarcação
4. Observar comportamento dos marcadores
5. Verificar estabilidade visual
```

**Resultado Esperado:**
- Marcadores permanecem fixos nos equipamentos
- Transições suaves ao mover câmera
- Sem jitter ou tremor perceptível
- Marcadores distantes fazem fade out

---

## 🔧 Arquivos Relacionados

```
src/components/ar/
├── AROverlay.tsx                # Componente principal AR
├── ARMarker.tsx                 # Marcador virtual individual
├── ARCamera.tsx                 # Controle de câmera
└── QRScanner.tsx                # Scanner de QR codes

src/hooks/
├── useARSession.ts              # Hook para sessão AR
├── useQRDetection.ts            # Detecção de QR codes
├── useARMarkers.ts              # Gestão de marcadores
└── useDeviceOrientation.ts      # Giroscópio/acelerômetro

src/lib/
├── arEngine.ts                  # Motor AR principal
├── markerPositioning.ts         # Cálculo de posições 3D
└── equipmentRegistry.ts         # Registro de equipamentos
```

---

## 📊 Métricas de Sucesso

| Métrica | Meta | Atual | Status |
|---------|------|-------|--------|
| FPS Médio | > 24fps | - | 🟡 |
| Latência Detecção | < 500ms | - | 🟡 |
| Precisão Posicionamento | > 90% | - | 🟡 |
| Taxa Detecção QR | > 95% | - | 🟡 |
| Uso CPU | < 50% | - | 🟡 |
| Uso Bateria | < 20%/h | - | 🟡 |

---

## 🐛 Problemas Conhecidos

- [ ] **P1:** Safari iOS pode ter delay ao ativar câmera
- [ ] **P2:** Marcadores podem tremer em dispositivos com giroscópio instável
- [ ] **P3:** QR codes com baixo contraste são difíceis de detectar
- [ ] **P4:** Performance degrada com > 10 marcadores simultâneos

---

## ✅ Critérios de Aprovação

- [x] Código implementado e sem erros TypeScript
- [ ] Overlay AR funcional em iOS e Android
- [ ] QR code scanning operacional
- [ ] Marcadores renderizam corretamente
- [ ] Performance dentro das metas
- [ ] Testes em dispositivos reais aprovados
- [ ] Documentação completa

---

## 📝 Notas Técnicas

### Tecnologias Utilizadas
- **WebRTC** para acesso à câmera
- **jsQR** para detecção de QR codes
- **Device Orientation API** para giroscópio
- **Geolocation API** para GPS

### Estrutura de Marcador
```typescript
interface ARMarker {
  id: string;
  type: 'equipment' | 'sensor' | 'poi' | 'alert';
  position: { x: number; y: number; z: number };
  equipmentId: string;
  label: string;
  status: 'ok' | 'warning' | 'error';
  data: Record<string, any>;
  distance: number;
  icon: string;
}
```

### Coordenadas AR
- Sistema de coordenadas baseado na posição do dispositivo
- Unidades em metros
- Origem (0,0,0) = posição do usuário
- Y+ = para cima, Z- = direção da câmera

---

## 🚀 Próximos Passos

1. **Calibração:** Implementar calibração de sensores para melhor precisão
2. **Marcadores Dinâmicos:** Adicionar animações e efeitos visuais
3. **Persistência:** Salvar marcadores escaneados para acesso rápido
4. **Integração:** Conectar com sistema de manutenção preventiva
5. **Treinamento:** Criar tutoriais interativos usando AR

---

## 📖 Referências

- [WebRTC Camera Access](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [jsQR Library](https://github.com/cozmo/jsqr)
- [Device Orientation API](https://developer.mozilla.org/en-US/docs/Web/API/Device_orientation_events)
- [AR on the Web](https://web.dev/ar/)

---

**Última Atualização:** 2025-10-25  
**Próxima Revisão:** Após testes em dispositivos reais
