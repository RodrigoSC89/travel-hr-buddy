# Forecast Global Module - Quick Reference

## 🚀 Quick Start

### Using the Module
Navigate to `/forecast` to access the Forecast Global page with AI-powered predictions.

### File Locations
```
src/pages/Forecast.tsx                      # Main page (entry point)
src/components/forecast/ForecastAI.tsx      # AI inference engine
src/components/forecast/ForecastMetrics.tsx # Performance metrics
src/components/forecast/ForecastMap.tsx     # Map visualization
src/lib/mqtt/publisher.ts                   # MQTT utilities
```

## 📋 Environment Variables

```bash
# Required for MQTT functionality
VITE_MQTT_URL=wss://your-mqtt-broker.com:8083/mqtt

# Optional - MQTT authentication
VITE_MQTT_USERNAME=your_username
VITE_MQTT_PASSWORD=your_password
```

## 🧠 ONNX Model Setup

Place your trained model at:
```
public/models/nautilus_forecast.onnx
```

**Input Format**: Float32Array with 4 features: `[feature1, feature2, feature3, feature4]`  
**Output Format**: Single float value representing the forecast

## 📡 MQTT API

### Publishing Events
```typescript
import { publishEvent } from "@/lib/mqtt/publisher";

// Publish forecast update with QoS level 1
publishEvent("nautilus/forecast/update", { 
  forecast: 0.85,
  timestamp: Date.now()
}, 1);
```

### Subscribing to Updates
```typescript
import { subscribeForecast } from "@/lib/mqtt/publisher";

// Subscribe to forecast updates
const unsubscribe = subscribeForecast((data) => {
  console.log("Forecast update:", data);
});

// Later, unsubscribe
unsubscribe();
```

## 🎨 Component Props

### ForecastAI
No props required. Component manages its own state.

**States:**
- Loading: "Inicializando..."
- Success: "Previsão atualizada: X.XX unidades"
- Offline: "Modo offline. Previsões locais desativadas."

### ForecastMetrics
No props required. Displays three pre-configured metrics:
- Model Reliability: 93%
- Real-time Accuracy: 88%
- Global Coverage: 97%

### ForecastMap
No props required. Embeds maritime traffic map with:
- 1.5s loading delay
- Smooth fade-in animation
- Lazy-loaded iframe

## 🔧 Customization

### Changing Metrics
Edit `src/components/forecast/ForecastMetrics.tsx`:
```typescript
const metrics = [
  { label: "Your Custom Metric", value: 95 },
  // Add more metrics...
];
```

### Adjusting Model Input
Edit `src/components/forecast/ForecastAI.tsx`:
```typescript
// Modify input features
const input = new ort.Tensor(
  "float32", 
  new Float32Array([value1, value2, value3, value4]), 
  [1, 4]
);
```

### Changing Map Source
Edit `src/components/forecast/ForecastMap.tsx`:
```typescript
<iframe
  src="https://your-custom-map-url.com"
  // ...
/>
```

## 🐛 Troubleshooting

### ONNX Model Not Loading
**Symptom**: Component shows "Modo offline"  
**Solution**: Verify model exists at `public/models/nautilus_forecast.onnx`

### MQTT Not Connecting
**Symptom**: No publish logs in console  
**Solution**: Check `VITE_MQTT_URL` is set and broker is accessible

### Component Load Failures
**Symptom**: Error fallback displayed  
**Solution**: Check browser console for detailed error. Try hard refresh (Ctrl+F5)

### Progress Bars Not Showing
**Symptom**: Metrics component looks broken  
**Solution**: Verify `@radix-ui/react-progress` is installed

## 📊 Monitoring

### Console Logs
- `✅ Secure MQTT client connected` - MQTT connection successful
- `✅ Published to nautilus/forecast/update` - Event published
- `⚠️ Falha ao carregar modelo ONNX` - Model load failed (offline mode)

### Performance Metrics
Check browser DevTools → Performance tab for:
- Component render times
- ONNX inference latency
- Animation smoothness (should be 60fps)

## 🧪 Testing

### Unit Tests
```bash
npm run test -- src/components/forecast
```

### Lint Check
```bash
npm run lint -- src/pages/Forecast.tsx src/components/forecast/*.tsx
```

### Build Verification
```bash
npm run build
```

## ♿ Accessibility

### Screen Reader Testing
- Navigate to Forecast page
- Tab through all interactive elements
- Verify status announcements are read aloud

### Keyboard Navigation
- Use Tab to navigate between cards
- Use Arrow keys in progress bars
- Press Enter to refresh on error fallback

## 📦 Dependencies

All required packages are already installed:
- `onnxruntime-web@1.23.0` - AI inference
- `mqtt@5.14.1` - Real-time messaging
- `framer-motion@11.15.0` - Animations
- `@radix-ui/react-progress@1.1.7` - Progress bars

## 🔄 Updates

### Adding New Components
1. Create component in `src/components/forecast/`
2. Use `safeLazyImport` in `Forecast.tsx`:
   ```typescript
   const NewComponent = safeLazyImport(
     () => import("@/components/forecast/NewComponent"),
     "NewComponent"
   );
   ```
3. Add to page render

### Modifying MQTT Topics
Edit `src/lib/mqtt/publisher.ts`:
```typescript
const topic = "your/custom/topic";
```

## 📚 Additional Resources

- [ONNX Runtime Web Documentation](https://onnxruntime.ai/docs/get-started/with-javascript.html)
- [MQTT.js Documentation](https://github.com/mqttjs/MQTT.js)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 💡 Pro Tips

1. **Model Performance**: Use quantized INT8 models for faster inference
2. **MQTT Security**: Always use WSS (secure WebSocket) in production
3. **Error Monitoring**: Integrate Sentry or similar for production errors
4. **Caching**: Consider caching forecast results in localStorage
5. **Internationalization**: Use i18n library for multi-language support

## 🆘 Support

For issues or questions:
1. Check console for error messages
2. Review component props and state
3. Verify environment variables
4. Check network tab for failed requests
5. Consult main documentation: `FORECAST_GLOBAL_PATCH_10_SUMMARY.md`
