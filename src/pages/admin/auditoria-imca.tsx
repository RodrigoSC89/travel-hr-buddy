import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/integrations/supabase/client"

export default function AuditoriaIMCA() {
  const [nomeNavio, setNomeNavio] = useState("")
  const [contexto, setContexto] = useState("")
  const [relatorio, setRelatorio] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke("auditoria-generate", {
        body: { nomeNavio, contexto },
      })

      if (error) {
        console.error("Error generating audit:", error)
        setRelatorio("Erro ao gerar auditoria. Verifique o backend.")
        return
      }

      setRelatorio(data.output)
    } catch (error) {
      console.error("Error:", error)
      setRelatorio("Erro ao gerar auditoria. Verifique o backend.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Auditoria Técnica IMCA</h1>

      <Card>
        <CardContent className="space-y-4">
          <div>
            <Label>Nome do Navio</Label>
            <Input
              placeholder="Ex: Aurora Explorer"
              value={nomeNavio}
              onChange={(e) => setNomeNavio(e.target.value)}
            />
          </div>

          <div>
            <Label>Contexto da Operação</Label>
            <Textarea
              placeholder="Descreva falhas, operação DP, sensores, eventos..."
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
              rows={6}
            />
          </div>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Gerando relatório..." : "Gerar Auditoria IMCA"}
          </Button>
        </CardContent>
      </Card>

      {relatorio && (
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">Relatório Gerado</h2>
            <Textarea
              value={relatorio}
              readOnly
              className="w-full h-[500px] whitespace-pre-wrap"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
