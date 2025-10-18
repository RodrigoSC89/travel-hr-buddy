import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTrainingModules } from '@/hooks/use-training-modules'
import { Loader2, BookOpen, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface GenerateTrainingModuleFormProps {
  auditId?: string
  vesselId?: string
  onSuccess?: () => void
}

/**
 * Form component for generating training modules from audit gaps
 * Example usage in audit details pages
 */
export function GenerateTrainingModuleForm({
  auditId,
  vesselId,
  onSuccess
}: GenerateTrainingModuleFormProps) {
  const { generateModule, isGenerating } = useTrainingModules(vesselId)
  const [gapDetected, setGapDetected] = useState('')
  const [normReference, setNormReference] = useState('')
  const [vesselName, setVesselName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!gapDetected || !normReference) {
      return
    }

    try {
      await generateModule({
        auditId,
        gapDetected,
        normReference,
        vessel: vesselName || undefined
      })

      // Reset form
      setGapDetected('')
      setNormReference('')
      setVesselName('')

      onSuccess?.()
    } catch (error) {
      console.error('Error generating training module:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Gerar Módulo de Treinamento
        </CardTitle>
        <CardDescription>
          Crie um micro treinamento baseado em falhas detectadas na auditoria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gap">Falha/Gap Detectada *</Label>
            <Textarea
              id="gap"
              placeholder="Ex: Falha na verificação de alarme de falha de sistema DP durante simulações mensais"
              value={gapDetected}
              onChange={(e) => setGapDetected(e.target.value)}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="norm">Norma de Referência *</Label>
            <Input
              id="norm"
              placeholder="Ex: IMCA M220 4.3.1 / M117 6.2.4"
              value={normReference}
              onChange={(e) => setNormReference(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vessel">Embarcação (Opcional)</Label>
            <Input
              id="vessel"
              placeholder="Ex: Navio ABC-123"
              value={vesselName}
              onChange={(e) => setVesselName(e.target.value)}
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              O sistema irá gerar automaticamente:
              <ul className="mt-2 list-disc list-inside text-sm">
                <li>Conteúdo de treinamento técnico</li>
                <li>Questionário de validação (3 perguntas)</li>
                <li>Ações práticas recomendadas</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Button 
            type="submit" 
            disabled={isGenerating || !gapDetected || !normReference}
            className="w-full"
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGenerating ? 'Gerando...' : 'Gerar Módulo de Treinamento'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
