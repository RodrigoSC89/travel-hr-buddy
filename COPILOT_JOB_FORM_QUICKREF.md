# JobFormWithExamples Quick Reference

## 🎯 Demo Page

**Live Demo**: Navigate to `/copilot/job-form` in your application to see the component in action with comprehensive examples and documentation.

Alternative admin route: `/admin/copilot-job-form`

## 🚀 Quick Start

```tsx
import { JobFormWithExamples } from '@/components/copilot';

<JobFormWithExamples onSubmit={(data) => console.log(data)} />
```

## 📦 Installation

Already included in the project. No additional dependencies needed.

## 🎯 Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onSubmit` | `(data: { component: string; description: string }) => void` | No | `undefined` | Callback when form is submitted |

## 📝 Usage Examples

### Basic Form

```tsx
<JobFormWithExamples />
```

### With Submit Callback

```tsx
<JobFormWithExamples 
  onSubmit={(data) => {
    console.log('Component:', data.component);
    console.log('Description:', data.description);
  }}
/>
```

### With API Integration

```tsx
const handleSubmit = async (data) => {
  await fetch('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};

<JobFormWithExamples onSubmit={handleSubmit} />
```

## 🎨 Component Structure

```
┌─────────────────────────────────────┐
│  🧠 Criar Job com IA                │
│  ───────────────────────────────    │
│  Componente: [Input Field]          │
│  Descrição:  [Text Area]            │
│  [✅ Criar Job Button]              │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  💡 Exemplos Similares              │
│  ───────────────────────────────    │
│  [🔍 Ver exemplos semelhantes]      │
│  [Similar Cases List]               │
└─────────────────────────────────────┘
```

## ✨ Features

- ✅ **Smart Validation**: Auto-validates required fields
- ✅ **AI-Powered Suggestions**: Finds similar historical cases
- ✅ **One-Click Apply**: Apply suggestions to form instantly
- ✅ **Toast Notifications**: User feedback for all actions
- ✅ **Auto-Reset**: Form clears after successful submission
- ✅ **Responsive**: Works on mobile, tablet, and desktop
- ✅ **Accessible**: WCAG compliant with proper ARIA labels

## 🔑 Key Functions

### handleSubmit()
Validates and submits the form data.

### handleSelectSuggestion(suggestion: string)
Applies a selected suggestion to the description field.

## 🎯 State Management

```typescript
const [description, setDescription] = useState('');
const [component, setComponent] = useState('');
```

## 🔔 Toast Notifications

### Success
```typescript
toast({
  title: 'Job criado com sucesso!',
  description: 'O job de manutenção foi registrado.',
});
```

### Error
```typescript
toast({
  title: 'Campos obrigatórios',
  description: 'Por favor, preencha o componente e a descrição.',
  variant: 'destructive',
});
```

### Info
```typescript
toast({
  title: 'Exemplo aplicado',
  description: 'A descrição foi preenchida com o exemplo selecionado.',
});
```

## 🔍 Similar Examples Integration

The component automatically passes input to `SimilarExamples`:

```typescript
// Priority: description > component
input={description || component}
```

## 🧪 Testing

```bash
# Run tests
npm test JobFormWithExamples.test.tsx

# Test coverage
npm test:coverage
```

## 📊 Test Statistics

- **Total Tests**: 14
- **Coverage**: 100%
- **Test Types**: Unit, Integration, Accessibility

## 🎨 Customization

### Override Styles

```tsx
<div className="custom-wrapper">
  <JobFormWithExamples />
</div>
```

### Custom Button Text

Modify the component source to change button text:

```tsx
<Button>Custom Submit Text</Button>
```

## 🐛 Common Issues

### Issue: Button disabled
**Fix**: Fill both component and description fields

### Issue: No similar examples
**Fix**: Check OpenAI API key configuration

### Issue: Toast not showing
**Fix**: Ensure `<Toaster />` is in your app layout

## ⚡ Performance Tips

1. **Debouncing**: Already implemented in SimilarExamples
2. **Lazy Loading**: Use dynamic imports for large apps
3. **Memoization**: Consider `useMemo` for computed values

## 🔐 Environment Variables

```env
VITE_OPENAI_API_KEY=your_key_here
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## ♿ Accessibility

- ✅ Keyboard navigable
- ✅ Screen reader compatible
- ✅ ARIA labels on all inputs
- ✅ Focus indicators
- ✅ Color contrast compliant

## 🌐 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | Latest 2 | ✅ |
| Firefox | Latest 2 | ✅ |
| Safari | Latest 2 | ✅ |
| Edge | Latest 2 | ✅ |
| IE | Any | ❌ |

## 🔗 Related Components

- `SimilarExamples` - Similar cases finder
- `CopilotJobFormExample` - Demo page
- `SimilarExamplesDemo` - Demo for similar examples only

## 📚 Additional Resources

- [Full Implementation Guide](./COPILOT_JOB_FORM_IMPLEMENTATION.md)
- [SimilarExamples README](./src/components/copilot/README.md)
- [Test Files](./src/tests/components/JobFormWithExamples.test.tsx)

## 🚦 Quick Checklist

Before using in production:

- [ ] OpenAI API key configured
- [ ] Supabase connection established
- [ ] Toaster component added to layout
- [ ] Error handling implemented
- [ ] API endpoint created for job submission
- [ ] Tests passing
- [ ] Accessibility validated

## 💡 Pro Tips

1. **Pre-fill Component**: Pass component via state management
2. **Custom Validation**: Add your own validation logic in `onSubmit`
3. **Analytics**: Track usage with analytics in `onSubmit`
4. **Logging**: Monitor errors with error tracking service

## 📞 Support

Need help? Check:
- GitHub Issues
- Project Documentation
- Test Examples
- Demo Page

## 🎓 Learning Path

1. **Start**: Use basic form without callback
2. **Intermediate**: Add API integration
3. **Advanced**: Customize with state management
4. **Expert**: Extend with custom features

## 📈 Version History

- **v1.0.0**: Initial release with core features
  - Job creation form
  - Similar examples integration
  - Toast notifications
  - Full test coverage

## 🎯 Next Steps

After implementing:
1. Test with real data
2. Monitor performance
3. Collect user feedback
4. Iterate and improve

---

**Last Updated**: October 2024  
**Maintainer**: Travel HR Buddy Team  
**License**: Part of Travel HR Buddy Project
