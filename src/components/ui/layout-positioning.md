/\*
POSICIONAMENTO DOS ELEMENTOS FLUTUANTES - EVITAR SOBREPOSIÇÕES

HIERARQUIA Z-INDEX:

- z-50: Modais, dialogs, dropdowns (mais alto)
- z-45: ScrollToTop
- z-40: QuickActionsBar, StatusWidget
- z-35: InteractiveOverlay (FloatingMenu)
- z-30: VoiceInterface

LAYOUT GRID:
┌─────────────────────────────────────┐
│ StatusWidget [TR] │ top-8 right-8 z-40
│ │
│ │
│ │
│ │
│ │
│ │
│ │
│ │
│ │
│ │
│ │
│ │
│ │
│ [BL] [BC] [BR] │
│VoiceInterface FloatingMenu Quick │
│bottom-8 bottom-8 Actio │ bottom-20 right-4 z-40
│left-8 right-96 ns │
│z-30 z-35 Bar │
│ [SR] │ ScrollToTop
│ Scrol │ bottom-36 right-6 z-45
│ lTop │
└─────────────────────────────────────┘

LEGENDA:
[TL] = Top Left [TC] = Top Center [TR] = Top Right
[ML] = Middle Left [MC] = Middle Center [MR] = Middle Right  
[BL] = Bottom Left [BC] = Bottom Center [BR] = Bottom Right
[SR] = Scroll Right (botão scroll)

COMPONENTES:
✅ VoiceInterface: bottom-8 left-8 z-30 (não conflita)
✅ QuickActionsBar: bottom-20 right-4 z-40 (elevado para não conflitar com mobile nav)
✅ StatusWidget: top-8 right-8 z-40 (canto superior direito)
✅ InteractiveOverlay: bottom-8 right-96 z-35 (centro-direita, longe dos outros)
✅ ScrollToTop: bottom-36 right-6 z-45 (meio direita, acima do Quick Actions)
✅ MobileNavigation: bottom-0 left-0 right-0 z-50 (barra inferior em mobile)

PONTOS DE ATENÇÃO:

- Mobile navigation ocupa toda a parte inferior em telas pequenas
- QuickActionsBar fica acima da mobile nav (bottom-20 vs bottom-0)
- VoiceInterface no canto inferior esquerdo para não conflitar
- StatusWidget no topo direito longe de todos os outros
- InteractiveOverlay bem afastado no centro-direita
  \*/
