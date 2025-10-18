import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTrainingModules } from '@/hooks/use-training-modules'
import { BookOpen, Clock, Ship, FileText, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TrainingModulesListProps {
  vesselId?: string
  onModuleClick?: (moduleId: string) => void
}

/**
 * Component to display list of active training modules
 */
export function TrainingModulesList({ vesselId, onModuleClick }: TrainingModulesListProps) {
  const { modules, isLoading, error } = useTrainingModules(vesselId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">
            Erro ao carregar módulos de treinamento
          </p>
        </CardContent>
      </Card>
    )
  }

  if (modules.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhum módulo de treinamento disponível
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {modules.map((module) => (
        <Card key={module.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {module.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {module.norm_reference}
                  </span>
                  {module.vessel_id && (
                    <span className="flex items-center gap-1">
                      <Ship className="h-3 w-3" />
                      Embarcação específica
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(module.created_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </span>
                </CardDescription>
              </div>
              <Badge variant="secondary">{module.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">Falha Detectada:</p>
                <p className="text-sm text-muted-foreground">{module.gap_detected}</p>
              </div>

              {module.quiz && Array.isArray(module.quiz) && module.quiz.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{module.quiz.length} questões no questionário</span>
                </div>
              )}

              {onModuleClick && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => onModuleClick(module.id)}
                >
                  Ver Treinamento Completo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
