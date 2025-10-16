import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"


interface Auditoria {
  id: string
  nome_navio: string
  contexto: string
  relatorio: string
  created_at: string
}


export default function HistoricoAuditorias() {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([])
  const [filtro, setFiltro] = useState("")


  useEffect(() => {
    fetch("/api/auditoria/listar")
      .then((res) => res.json())
      .then((data) => setAuditorias(data))
  }, [])


  const auditoriasFiltradas = auditorias.filter((a) =>
    a.nome_navio.toLowerCase().includes(filtro.toLowerCase())
  )


  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Histórico de Auditorias IMCA</h1>


      <div>
        <Label>Filtrar por navio</Label>
        <Input
          placeholder="Nome do navio..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>


      {auditoriasFiltradas.map((auditoria) => (
        <Card key={auditoria.id} className="mt-4">
          <CardContent className="space-y-2">
            <h2 className="text-lg font-semibold">{auditoria.nome_navio}</h2>
            <p className="text-sm text-gray-500">{new Date(auditoria.created_at).toLocaleString()}</p>
            <Textarea readOnly value={auditoria.relatorio} className="w-full h-[300px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
