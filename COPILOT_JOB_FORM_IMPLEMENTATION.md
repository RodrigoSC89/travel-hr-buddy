# JobFormWithExamples Implementation Guide

## Overview

This document provides a comprehensive guide for implementing and using the `JobFormWithExamples` component, which combines a maintenance job creation form with AI-powered similar examples.

## Architecture

### Component Structure

```
src/
├── components/
│   └── copilot/
│       ├── JobFormWithExamples.tsx      # Main form component
│       ├── SimilarExamples.tsx          # Similar cases finder
│       ├── SimilarExamplesDemo.tsx      # Demo page for SimilarExamples
│       ├── CopilotJobFormExample.tsx    # Demo page for JobFormWithExamples
│       ├── index.ts                     # Exports all copilot components
│       └── README.md                    # Component documentation
├── lib/
│   └── ai/
│       └── copilot/
│           └── querySimilarJobs.ts      # Query service for similar jobs
└── tests/
    └── components/
        └── JobFormWithExamples.test.tsx # Unit tests
```

## Features

### 1. **Smart Job Creation Form**

The component provides a comprehensive form for creating maintenance jobs with:

- Component/Asset input field
- Description textarea with validation
- Real-time input validation
- Submit button with disabled state management
- Toast notifications for user feedback

### 2. **AI-Powered Similar Examples**

Integrated `SimilarExamples` component that:

- Searches historical jobs using vector embeddings
- Displays similarity scores
- Allows one-click application of suggestions
- Shows relevant metadata (component, date, description)

### 3. **User Experience Enhancements**

- Visual feedback with toast notifications
- Form validation with error messages
- Auto-reset after successful submission
- Responsive design for all screen sizes
- Accessibility compliant (WCAG guidelines)

## Implementation Details

### Component Props

```typescript
interface JobFormWithExamplesProps {
  onSubmit?: (data: { component: string; description: string }) => void;
}
```

### State Management

The component uses React hooks for state management:

```typescript
const [description, setDescription] = useState('');
const [component, setComponent] = useState('');
const { toast } = useToast();
```

### Form Submission Flow

1. **Validation**: Checks if both component and description are filled
2. **Toast Notification**: Shows error if validation fails
3. **Callback Execution**: Calls `onSubmit` prop if provided
4. **Success Feedback**: Shows success toast
5. **Form Reset**: Clears all input fields

### Integration with SimilarExamples

The component passes the current form input to `SimilarExamples`:

```typescript
<SimilarExamples
  input={description || component}
  onSelect={handleSelectSuggestion}
/>
```

When a suggestion is selected:
1. Description field is populated
2. User receives confirmation toast
3. User can modify before submitting

## Usage Examples

### Basic Usage

```tsx
import { JobFormWithExamples } from '@/components/copilot';

function MaintenancePage() {
  return <JobFormWithExamples />;
}
```

### With API Integration

```tsx
import { JobFormWithExamples } from '@/components/copilot';
import { createJob } from '@/api/jobs';

function MaintenancePage() {
  const handleSubmit = async (data) => {
    try {
      await createJob(data);
      console.log('Job created successfully');
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  return <JobFormWithExamples onSubmit={handleSubmit} />;
}
```

### With State Management

```tsx
import { JobFormWithExamples } from '@/components/copilot';
import { useJobStore } from '@/stores/jobStore';

function MaintenancePage() {
  const addJob = useJobStore(state => state.addJob);

  const handleSubmit = (data) => {
    addJob(data);
    // Additional logic
  };

  return <JobFormWithExamples onSubmit={handleSubmit} />;
}
```

## Styling

The component uses Shadcn/ui components with Tailwind CSS:

- `Card` for container sections
- `Input` for single-line text fields
- `Textarea` for multi-line descriptions
- `Button` for actions
- `Label` for form labels

### Customization

To customize the appearance, modify the Tailwind classes in the component or use CSS modules.

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test JobFormWithExamples.test.tsx

# Run tests in watch mode
npm test:watch
```

### Test Coverage

The component has 14 comprehensive tests covering:

- ✅ Component rendering
- ✅ Form validation
- ✅ Submit button state management
- ✅ Form submission with callback
- ✅ Toast notifications
- ✅ Form reset after submission
- ✅ Suggestion selection
- ✅ Input propagation to SimilarExamples
- ✅ Accessibility (ARIA labels)
- ✅ Placeholder text

## Performance Considerations

### Optimization Strategies

1. **Debounced Search**: SimilarExamples uses 500ms debounce for API calls
2. **Lazy Loading**: Examples only fetched when user clicks the button
3. **Memoization**: Consider using `useMemo` for expensive calculations
4. **Code Splitting**: Import component dynamically if needed

### Best Practices

```tsx
// Dynamic import for code splitting
const JobFormWithExamples = lazy(() => import('@/components/copilot/JobFormWithExamples'));

function MaintenancePage() {
  return (
    <Suspense fallback={<Loading />}>
      <JobFormWithExamples />
    </Suspense>
  );
}
```

## API Integration

### Backend Requirements

The component expects the following backend setup:

1. **Job Creation Endpoint**
   - Method: POST
   - URL: `/api/jobs`
   - Body: `{ component: string, description: string }`

2. **Similar Jobs Query**
   - Uses `querySimilarJobs` function
   - Requires OpenAI API key for embeddings
   - Requires Supabase with pgvector extension

### Environment Variables

```env
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Error Handling

### Form Validation Errors

```typescript
if (!component || !description) {
  toast({
    title: 'Campos obrigatórios',
    description: 'Por favor, preencha o componente e a descrição.',
    variant: 'destructive',
  });
  return;
}
```

### API Errors

Handled by the `querySimilarJobs` function, which falls back to mock data on error.

## Accessibility

### ARIA Labels

- All form fields have proper `Label` components
- Submit button includes disabled state
- Toast notifications are announced to screen readers

### Keyboard Navigation

- Tab navigation between form fields
- Enter key submits form (when enabled)
- Escape key closes toast notifications

## Browser Support

- ✅ Chrome/Edge (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ⚠️ Internet Explorer: Not supported

## Troubleshooting

### Common Issues

**Issue**: Submit button stays disabled
- **Solution**: Ensure both component and description fields are filled

**Issue**: Similar examples not loading
- **Solution**: Check OpenAI API key and Supabase connection

**Issue**: Toast notifications not showing
- **Solution**: Ensure `Toaster` component is included in your app layout

### Debug Mode

Enable console logging to debug:

```typescript
console.log('Criar job:', { component, description });
```

## Future Enhancements

Planned improvements:

- [ ] Add support for job priority selection
- [ ] Include attachment upload functionality
- [ ] Add job template selection
- [ ] Implement draft saving
- [ ] Add multi-language support
- [ ] Include job history view
- [ ] Add batch job creation

## Migration Guide

### From SimilarExamplesDemo to JobFormWithExamples

If migrating from the older demo component:

```tsx
// Before
<SimilarExamplesDemo />

// After
<JobFormWithExamples onSubmit={handleSubmit} />
```

## Contributing

When contributing to this component:

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure accessibility compliance
5. Test in all supported browsers

## License

This component is part of the Travel HR Buddy project.

## Support

For issues or questions:
- Create an issue in the repository
- Check existing documentation
- Review test files for usage examples
