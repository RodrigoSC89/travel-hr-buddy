# Integration Guide: MMI Report with Maintenance Management

## Quick Integration Example

This guide shows how to add the "Exportar Relatório" button to the existing `maintenance-management.tsx` component.

### Step 1: Import the MMI Report Function

At the top of `src/components/fleet/maintenance-management.tsx`, add:

```typescript
import { generateMaintenanceReport, MaintenanceJob } from '@/components/mmi';
```

### Step 2: Create the Export Handler Function

Add this function inside the `MaintenanceManagement` component:

```typescript
const handleExportReport = () => {
  // Transform MaintenanceRecord[] to MaintenanceJob[]
  const jobs: MaintenanceJob[] = maintenanceRecords
    .filter(record => statusFilter === 'all' || record.status === statusFilter)
    .filter(record => priorityFilter === 'all' || record.priority === priorityFilter)
    .filter(record => 
      searchTerm === '' || 
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vessel_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(record => ({
      id: record.id,
      title: record.title,
      component_id: `${record.vessel_name} - ${record.location}`,
      status: record.status,
      due_date: record.scheduled_date,
      priority: record.priority,
      ai_suggestion: generateAISuggestion(record) // Optional: Add AI logic
    }));
  
  try {
    generateMaintenanceReport(jobs);
    
    toast({
      title: '📄 Relatório PDF Gerado',
      description: `Relatório com ${jobs.length} jobs exportado com sucesso.`,
    });
  } catch (error) {
    toast({
      title: 'Erro ao exportar',
      description: 'Não foi possível gerar o relatório. Tente novamente.',
      variant: 'destructive',
    });
  }
};

// Optional: Function to generate AI suggestions based on record data
const generateAISuggestion = (record: MaintenanceRecord): string => {
  if (record.status === 'overdue') {
    return `⚠️ Manutenção atrasada! Ação urgente necessária para ${record.title}.`;
  }
  if (record.priority === 'critical') {
    return `🚨 Prioridade crítica. Recomenda-se atenção imediata.`;
  }
  if (record.status === 'in_progress') {
    const hoursElapsed = Math.round(
      (new Date().getTime() - new Date(record.scheduled_date).getTime()) / (1000 * 60 * 60)
    );
    return `Trabalho em progresso há ${hoursElapsed} horas. Estimativa de conclusão: ${record.estimated_duration - hoursElapsed} horas restantes.`;
  }
  if (record.status === 'completed') {
    return `✅ Manutenção concluída com sucesso. Próxima revisão programada para ${record.next_maintenance || 'indefinido'}.`;
  }
  return `Acompanhamento regular recomendado. Status: ${record.status}.`;
};
```

### Step 3: Add the Export Button

Find the section in the component where action buttons are displayed (typically near the "Add" button), and add:

```typescript
<Button 
  onClick={handleExportReport}
  variant="outline"
  className="flex items-center gap-2"
  disabled={filteredRecords.length === 0}
>
  <FileText className="h-4 w-4" />
  Exportar Relatório PDF
</Button>
```

### Complete Example

Here's a complete example of how the button might be integrated:

```typescript
<div className="flex justify-between items-center mb-6">
  <div className="flex gap-2">
    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Manutenção
        </Button>
      </DialogTrigger>
      {/* ... existing dialog content ... */}
    </Dialog>
    
    {/* NEW: Export Report Button */}
    <Button 
      onClick={handleExportReport}
      variant="outline"
      disabled={filteredRecords.length === 0}
    >
      <FileText className="h-4 w-4 mr-2" />
      Exportar Relatório ({filteredRecords.length} jobs)
    </Button>
  </div>
  
  {/* ... existing filters and search ... */}
</div>
```

### Advanced: Custom AI Suggestions

For more sophisticated AI suggestions, you could integrate with your existing AI systems:

```typescript
const generateAdvancedAISuggestion = async (record: MaintenanceRecord): Promise<string> => {
  // Example: Call to AI service or use local ML model
  const analysis = await analyzeMaintenancePattern(record);
  
  if (analysis.riskLevel === 'high') {
    return `🔍 Análise de IA: Alto risco detectado. ${analysis.recommendation}`;
  }
  
  if (analysis.costOptimization) {
    return `💰 Oportunidade de otimização: ${analysis.costOptimization}`;
  }
  
  return analysis.suggestion || 'Manutenção dentro do esperado.';
};
```

### Result

After integration, users will be able to:
1. Filter and search maintenance records
2. Click "Exportar Relatório PDF"
3. Receive a professionally formatted PDF with:
   - All filtered maintenance jobs
   - Color-coded status and priority badges
   - Due dates and component information
   - AI-generated suggestions for each job
   - Professional header and footer

### Testing

To test the integration:

```bash
# 1. Ensure dependencies are installed
npm install

# 2. Build the project
npm run build

# 3. Run the development server
npm run dev

# 4. Navigate to the maintenance management page
# 5. Click the "Exportar Relatório PDF" button
# 6. Check that the PDF downloads with the correct data
```

## Benefits

- ✅ **No extra dependencies**: Uses existing html2pdf.js library
- ✅ **Minimal code changes**: Just add import, handler, and button
- ✅ **Respects filters**: Exports only filtered/searched records
- ✅ **Professional output**: Matches existing design system
- ✅ **AI-enhanced**: Shows intelligent suggestions for each job
- ✅ **User-friendly**: One-click export with visual feedback

## Support

For issues or questions about the MMI Report integration, refer to:
- `/src/components/mmi/README.md` - Full component documentation
- `/src/components/mmi/MMIReportDemo.tsx` - Working example
- `/src/pages/MMIReport.tsx` - Demo page
