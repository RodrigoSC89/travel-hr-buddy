/**
 * PEOTRAM Lessons Learned Module
 * Captures, categorizes and shares lessons learned from audits, incidents and operations
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Lightbulb, BookOpen, AlertTriangle, CheckCircle, TrendingUp,
  Ship, Calendar, Tag, Users, ArrowRight
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  source: 'audit' | 'incident' | 'near_miss' | 'operation' | 'drill';
  element: string;
  elementName: string;
  severity: 'info' | 'warning' | 'critical';
  dateIdentified: string;
  vessel: string;
  actionTaken: string;
  benefit: string;
  sharedWith: string[];
  status: 'new' | 'implemented' | 'shared';
}

const LESSONS: Lesson[] = [
  {
    id: '1', title: 'Falha na comunicação durante operação de guincho',
    description: 'Durante operação de içamento, houve falha na comunicação entre convés e ponte. O sinaleiro utilizou canal incorreto do rádio, causando atraso de 15 minutos e quase-incidente.',
    source: 'near_miss', element: 'E4-OP', elementName: 'Operações', severity: 'critical',
    dateIdentified: '2026-01-18', vessel: 'AHTS Netuno I',
    actionTaken: 'Implementado canal dedicado para operações de guincho. Adicionado ao checklist pré-operação a verificação de canal de rádio.',
    benefit: 'Eliminação de interferência de comunicação. Redução de 40% no tempo de setup de operações.',
    sharedWith: ['PSV Poseidon II', 'PLSV Tritão III'], status: 'shared',
  },
  {
    id: '2', title: 'Procedimento de LOTO insuficiente para válvulas de lastro',
    description: 'Auditoria E6-MN identificou que procedimento LOTO não cobria todas as válvulas do sistema de lastro, criando risco de operação acidental durante manutenção.',
    source: 'audit', element: 'E6-MN', elementName: 'Manutenção', severity: 'critical',
    dateIdentified: '2026-01-25', vessel: 'PSV Poseidon II',
    actionTaken: 'Revisado procedimento LOTO completo. Mapeadas 100% das válvulas. Treinamento para toda equipe de manutenção.',
    benefit: 'Cobertura LOTO de 65% para 100%. NC grave fechada antes da auditoria externa.',
    sharedWith: ['AHTS Netuno I'], status: 'shared',
  },
  {
    id: '3', title: 'Melhoria no armazenamento de produtos químicos',
    description: 'Inspeção no E5-ST revelou que produtos incompatíveis estavam armazenados no mesmo armário, contrariando MSDS.',
    source: 'audit', element: 'E5-ST', elementName: 'Segurança do Trabalho', severity: 'warning',
    dateIdentified: '2026-02-01', vessel: 'PLSV Tritão III',
    actionTaken: 'Instalados armários segregados com identificação por cor (ácidos/bases/solventes). Criada matriz de compatibilidade visual.',
    benefit: 'Compliance 100% com NR-26 e IMDG Code. Zero NCs em armazenamento químico.',
    sharedWith: [], status: 'implemented',
  },
  {
    id: '4', title: 'Otimização de tempo de muster drill',
    description: 'Exercício de abandono revelou que tripulantes do turno de descanso demoram em média 2 min a mais que o turno de serviço para chegar ao ponto de encontro.',
    source: 'drill', element: 'E11-PE', elementName: 'Preparação p/ Emergência', severity: 'info',
    dateIdentified: '2026-02-08', vessel: 'AHTS Netuno I',
    actionTaken: 'Instalados alarmes adicionais nas áreas de acomodação. Implementado exercício específico para turno de descanso.',
    benefit: 'Redução do muster time de 6:30 para 4:12 (meta: 5:00).',
    sharedWith: [], status: 'new',
  },
  {
    id: '5', title: 'Gap em registro de horas de trabalho/descanso',
    description: 'Identificado que registros de W/R de equipe de manutenção não incluíam horas de chamada de emergência noturna.',
    source: 'operation', element: 'E9-RH', elementName: 'Recursos Humanos', severity: 'warning',
    dateIdentified: '2026-02-10', vessel: 'RSV Oceano IV',
    actionTaken: 'Atualizado sistema de registro para capturar automaticamente chamadas fora do turno. Integrado com sistema de alarmes.',
    benefit: 'Conformidade MLC 2006 Reg. 2.3 garantida. Evidência automática para auditorias.',
    sharedWith: [], status: 'implemented',
  },
];

const sourceLabels: Record<string, string> = {
  audit: 'Auditoria', incident: 'Incidente', near_miss: 'Quase-Acidente', operation: 'Operação', drill: 'Exercício',
};

const sourceColors: Record<string, string> = {
  audit: 'bg-primary/10 text-primary border-primary/30',
  incident: 'bg-destructive/10 text-destructive border-destructive/30',
  near_miss: 'bg-warning/10 text-warning border-warning/30',
  operation: 'bg-muted text-foreground border-border',
  drill: 'bg-success/10 text-success border-success/30',
};

const severityBorders: Record<string, string> = {
  info: '', warning: 'border-l-4 border-l-warning', critical: 'border-l-4 border-l-destructive',
};

const statusBadge: Record<string, string> = {
  new: 'bg-primary/10 text-primary border-primary/30',
  implemented: 'bg-success/10 text-success border-success/30',
  shared: 'bg-primary/10 text-primary border-primary/30',
};

export function PeotramLessonsLearned() {
  const [filter, setFilter] = useState<string>('all');
  const filtered = filter === 'all' ? LESSONS : LESSONS.filter(l => l.source === filter);

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-warning" />
            Lições Aprendidas PEOTRAM
          </CardTitle>
          <CardDescription>Captura e compartilhamento de aprendizados de auditorias, incidentes e operações</CardDescription>
        </CardHeader>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Total de Lições</p>
            <p className="text-2xl font-bold">{LESSONS.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Implementadas</p>
            <p className="text-2xl font-bold text-success">{LESSONS.filter(l => l.status !== 'new').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Compartilhadas</p>
            <p className="text-2xl font-bold text-primary">{LESSONS.filter(l => l.status === 'shared').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Críticas</p>
            <p className="text-2xl font-bold text-destructive">{LESSONS.filter(l => l.severity === 'critical').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>Todos</Button>
        {Object.entries(sourceLabels).map(([key, label]) => (
          <Button key={key} variant={filter === key ? 'default' : 'outline'} size="sm" onClick={() => setFilter(key)}>{label}</Button>
        ))}
      </div>

      {/* Lessons */}
      <div className="space-y-3">
        {filtered.map(lesson => (
          <Card key={lesson.id} className={`hover:shadow-md transition-shadow ${severityBorders[lesson.severity]}`}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Lightbulb className={`h-5 w-5 mt-0.5 shrink-0 ${lesson.severity === 'critical' ? 'text-destructive' : lesson.severity === 'warning' ? 'text-warning' : 'text-primary'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-sm">{lesson.title}</p>
                    <Badge variant="outline" className={sourceColors[lesson.source]}>{sourceLabels[lesson.source]}</Badge>
                    <Badge variant="outline" className="text-[10px]">{lesson.elementName}</Badge>
                    <Badge variant="outline" className={statusBadge[lesson.status]}>
                      {lesson.status === 'new' ? 'Nova' : lesson.status === 'implemented' ? 'Implementada' : 'Compartilhada'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{lesson.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-muted/30 rounded-lg p-2.5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Ação Tomada</p>
                      <p className="text-xs">{lesson.actionTaken}</p>
                    </div>
                    <div className="bg-success/5 rounded-lg p-2.5 border border-success/10">
                      <p className="text-[10px] font-semibold text-success uppercase mb-1">Benefício</p>
                      <p className="text-xs">{lesson.benefit}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Ship className="h-3 w-3" />{lesson.vessel}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(lesson.dateIdentified).toLocaleDateString('pt-BR')}</span>
                    {lesson.sharedWith.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Compartilhada com {lesson.sharedWith.length} embarcação(ões)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
