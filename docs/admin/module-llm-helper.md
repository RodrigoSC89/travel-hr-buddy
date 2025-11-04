# Module LLM Helper - Admin Guide

## Overview
The Module LLM Helper is an AI-powered tool that generates contextual prompts for each module in the Nautilus One system, enabling efficient interaction with Large Language Models (LLMs).

## Access
- **URL:** `/admin/module-llm-helper`
- **Required Role:** `admin`, `auditor`, `ia`
- **Permission:** AI tools access

## Features

### 1. Prompt Generation
Automatically generates comprehensive AI prompts including:
- Module name and description
- Status and category
- AI capabilities
- Role requirements
- Contextual actions
- Usage examples

### 2. Smart Filtering

#### Search
- Search modules by name
- Search by description
- Real-time filtering

#### Category Filter
Filter by module category:
- Maritime Operations
- Compliance & Audit
- AI & Intelligence
- Communication
- Documents
- Analytics
- And more...

#### Status Filter
Filter by module status:
- Production (stable)
- Development (in progress)
- Experimental (beta)

### 3. Prompt Actions

#### Copy to Clipboard
- One-click copy
- Preserves formatting
- Ready to paste

#### Send to AI
- Direct API integration (ready for implementation)
- Sends prompt to configured LLM
- Receives AI response

#### Export
- **Markdown Format:** Human-readable documentation
- **JSON Format:** Structured data for APIs
- Batch export all filtered modules

## Generated Prompt Structure

### Header Section
```
🔧 Módulo: [Module Name]
✅ Status: [PRODUCTION/DEVELOPMENT/EXPERIMENTAL]
📂 Categoria: [Category Description]
🧠 IA: [Enabled/Disabled]
🔐 Roles: [Required roles]
```

### Description
Brief overview of module functionality

### AI Prompt
Contextual instruction for AI:
```
"Ative o modo de [operation mode] para o módulo [name]. 
[Specific actions]. [Role considerations]."
```

### Available Actions
List of module-specific operations

### Context
Technical metadata and system information

## Usage Examples

### Basic Usage
1. **Navigate** to `/admin/module-llm-helper`
2. **Search or browse** available modules
3. **Click** on a module to generate prompt
4. **Copy** prompt to clipboard
5. **Paste** into your AI tool

### Crew Management Example
```
🔧 Módulo: Crew Management
✅ Status: PRODUCTION
📂 Categoria: Operações Marítimas
🧠 IA: Habilitado
🔐 Roles: admin, auditor, operador

📋 Descrição:
Unified crew management with personnel, certifications, 
rotations, and performance tracking

🎯 Prompt para IA:
"Ative o modo de monitoramento marítimo para o módulo 
Crew Management. Liste os perfis da tripulação pendentes 
e inicie o fluxo de integração com RH. Considere os 
níveis de acesso: admin, auditor, operador."

⚙️ Ações Disponíveis:
- Navegar: Acessar /crew-management
- Listar: Exibir dados do módulo
- Filtrar: Aplicar filtros específicos
- Exportar: Gerar relatórios
- IA Análise: Executar análise inteligente
- IA Previsão: Gerar previsões baseadas em dados

🔍 Contexto:
- Sistema: Nautilus One
- Caminho: /crew-management
- Status: production
- AI-Enabled: Sim
```

### Usage Examples Provided
Each module includes 3-5 example prompts:
- "IA, ative o módulo [name] e mostre os dados mais recentes."
- Category-specific examples
- Role-based examples

## Export Functionality

### Markdown Export
Creates a comprehensive documentation file:
- Header with metadata
- All module prompts
- Usage examples
- Formatted for readability
- Filename: `nautilus-prompts-[timestamp].md`

### JSON Export
Structured data format:
```json
{
  "generated": "2025-11-04T23:00:00.000Z",
  "system": "Nautilus One",
  "totalPrompts": 45,
  "prompts": [
    {
      "moduleId": "crew-management",
      "moduleName": "Crew Management",
      "category": "maritime",
      "status": "production",
      "roles": ["admin", "auditor"],
      "prompt": "...",
      "examples": ["..."]
    }
  ]
}
```

## Best Practices

### Prompt Selection
1. **Match Category:** Choose prompts relevant to your task
2. **Check Status:** Prefer production modules
3. **Verify Roles:** Ensure you have required permissions
4. **Review Context:** Understand module capabilities

### Using with AI
1. **Copy Complete Prompt:** Include all sections
2. **Provide Context:** Add specific details
3. **Iterate:** Refine based on AI response
4. **Save Useful Prompts:** Document successful prompts

### Batch Operations
1. **Filter Appropriately:** Select relevant modules
2. **Export:** Generate batch file
3. **Review:** Check generated prompts
4. **Store:** Keep for reference

## Integration with AI Systems

### Supported AI Platforms
- OpenAI GPT-4
- Claude (Anthropic)
- Custom LLM endpoints
- Nautilus LLM Core

### API Integration (Future)
```typescript
POST /api/llm/prompt
Headers: {
  "Authorization": "Bearer [token]",
  "Content-Type": "application/json"
}
Body: {
  "prompt": "[generated prompt]",
  "moduleId": "crew-management",
  "context": {
    "userId": "user-id",
    "tenantId": "tenant-id"
  }
}
```

## Customization

### Prompt Templates
Prompts are generated based on:
- Module category
- Status level
- AI capabilities
- Role requirements

### Language Support
- Primary: Portuguese (BR)
- Technical terms: English
- Easily extensible for other languages

## Troubleshooting

### No Modules Showing
- Clear filters
- Check status filter
- Verify data source

### Copy Not Working
- Check browser permissions
- Use manual copy (Ctrl+C)
- Try different browser

### Export Fails
- Check browser download settings
- Verify file permissions
- Try smaller dataset

## Security Considerations

### Access Control
- Role-based access
- Audit logging (future)
- Secure API integration

### Prompt Safety
- No sensitive data in prompts
- Sanitized inputs
- Role validation

### Data Privacy
- No PII in generated prompts
- Module metadata only
- Configurable sensitivity

## Performance

### Load Time
- Instant module loading
- Client-side filtering
- No API calls for generation

### Export Performance
- Fast Markdown generation
- Efficient JSON serialization
- Handles 100+ modules

## Future Enhancements
- [ ] Multi-language support
- [ ] Prompt history
- [ ] Favorite prompts
- [ ] Custom templates
- [ ] AI response integration
- [ ] Prompt analytics
- [ ] Collaboration features

## Support
For technical issues:
1. Check browser console
2. Review module data
3. Contact system administrator
4. File support ticket

## Related Documentation
- [PATCH 655 Implementation](../patches/655-navigation-dynamic.md)
- [Module Control Guide](./module-control.md)
- [Prompt Generator Source](../../src/lib/utils/modulePromptGenerator.ts)
