import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { explainRequirementSGSO } from '@/lib/sgso/explainRequirement'

const requisitosSGSO = [
  { num: 1, titulo: 'Política de SMS', desc: 'Estabelecimento e divulgação de política de segurança e meio ambiente.' },
  { num: 2, titulo: 'Planejamento Operacional', desc: 'Planejamento com metas e indicadores de SMS.' },
  { num: 3, titulo: 'Treinamento e Capacitação', desc: 'Capacitação adequada e documentada da tripulação.' },
  { num: 4, titulo: 'Comunicação e Acesso à Informação', desc: 'Documentação e procedimentos acessíveis e atualizados.' },
  { num: 5, titulo: 'Gestão de Riscos', desc: 'Identificação e controle de riscos operacionais.' },
  { num: 6, titulo: 'Equipamentos Críticos', desc: 'Manutenção e inspeção de equipamentos essenciais.' },
  { num: 7, titulo: 'Procedimentos de Emergência', desc: 'Procedimentos treinados e simulados regularmente.' },
  { num: 8, titulo: 'Manutenção Preventiva', desc: 'Planos documentados para sistemas críticos.' },
  { num: 9, titulo: 'Inspeções e Verificações', desc: 'Rotinas formais com registros e responsáveis.' },
  { num: 10, titulo: 'Auditorias Internas', desc: 'Verificação periódica da eficácia do SGSO.' },
  { num: 11, titulo: 'Gestão de Mudanças', desc: 'Avaliação de impactos operacionais em mudanças.' },
  { num: 12, titulo: 'Registro de Incidentes', desc: 'Registro e tratamento formal de incidentes.' },
  { num: 13, titulo: 'Análise de Causa Raiz', desc: 'Metodologia apropriada e documentação.' },
  { num: 14, titulo: 'Ações Corretivas e Preventivas', desc: 'Implementação e verificação da eficácia.' },
  { num: 15, titulo: 'Monitoramento de Indicadores', desc: 'Definição e análise de indicadores de SMS.' },
  { num: 16, titulo: 'Conformidade Legal', desc: 'Atendimento à legislação ambiental e de segurança.' },
  { num: 17, titulo: 'Melhoria Contínua', desc: 'Revisões periódicas e aprendizado contínuo.' },
]

export default function SGSOAuditPage() {
  const [auditData, setAuditData] = useState(() =>
    requisitosSGSO.map(req => ({
      ...req,
      compliance: 'compliant',
      evidence: '',
      comment: ''
    }))
  )
  const [loadingExplanation, setLoadingExplanation] = useState<number | null>(null)

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...auditData]
    updated[index][field] = value
    setAuditData(updated)
  }

  const handleSubmit = () => {
    console.log('📤 Enviando auditoria SGSO:', auditData)
    // TODO: enviar para Supabase ou API
  }

  const handleExplainWithAI = async (idx: number) => {
    const item = auditData[idx]
    setLoadingExplanation(idx)
    
    try {
      const explanation = await explainRequirementSGSO(item.titulo, item.compliance)
      
      if (explanation) {
        toast.info(explanation, { duration: 12000 })
      } else {
        toast.error('Não foi possível gerar explicação. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao explicar requisito:', error)
      toast.error('Erro ao gerar explicação com IA')
    } finally {
      setLoadingExplanation(null)
    }
  }

  return (
    <div className="container max-w-5xl py-8 mx-auto space-y-6">
      <h1 className="text-3xl font-bold">🛡️ Auditoria SGSO - IBAMA</h1>

      {auditData.map((item, idx) => (
        <Card key={item.num}>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">
              {item.num}. {item.titulo}
            </h3>
            <p className="text-muted-foreground text-sm">{item.desc}</p>

            <RadioGroup
              defaultValue="compliant"
              className="flex gap-4 mt-2"
              onValueChange={val => handleChange(idx, 'compliance', val)}
            >
              <div className="flex items-center gap-1">
                <RadioGroupItem value="compliant" id={`c-${idx}`} />
                <Label htmlFor={`c-${idx}`}>✅ Conforme</Label>
              </div>
              <div className="flex items-center gap-1">
                <RadioGroupItem value="partial" id={`p-${idx}`} />
                <Label htmlFor={`p-${idx}`}>⚠️ Parcial</Label>
              </div>
              <div className="flex items-center gap-1">
                <RadioGroupItem value="non-compliant" id={`n-${idx}`} />
                <Label htmlFor={`n-${idx}`}>❌ Não conforme</Label>
              </div>
            </RadioGroup>

            <Textarea
              placeholder="📄 Descreva a evidência observada"
              value={item.evidence}
              onChange={e => handleChange(idx, 'evidence', e.target.value)}
            />
            <Textarea
              placeholder="💬 Comentário adicional ou observação"
              value={item.comment}
              onChange={e => handleChange(idx, 'comment', e.target.value)}
            />

            <Button
              variant="outline"
              onClick={() => handleExplainWithAI(idx)}
              disabled={loadingExplanation === idx}
              className="mt-2"
            >
              {loadingExplanation === idx ? '⏳ Carregando...' : '🤖 Explicar com IA'}
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button className="mt-6" onClick={handleSubmit}>
        📤 Enviar Auditoria SGSO
      </Button>
    </div>
  )
}
