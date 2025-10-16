"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

const navios = ["DP Vessels Alpha", "DP Vessels Beta", "DP Vessels Gamma"]
const normasIMCA = [
  "IMCA M103",
  "IMCA M117",
  "IMCA M140",
  "IMCA M190",
  "IMCA M166",
  "IMCA MSF182",
  "IMCA M206",
  "IMCA M216",
  "IMCA M220",
]

export function AuditoriaIMCAForm() {
  const { user } = useAuth()
  const [navio, setNavio] = useState("")
  const [data, setData] = useState("")
  const [norma, setNorma] = useState(normasIMCA[0])
  const [itemAuditado, setItemAuditado] = useState("")
  const [resultado, setResultado] = useState("")
  const [comentarios, setComentarios] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    // Validate required fields
    if (!navio || !data || !norma || !itemAuditado || !resultado) {
      toast.error("Por favor, preencha todos os campos obrigatórios")
      return
    }

    if (!user) {
      toast.error("Você precisa estar autenticado para criar uma auditoria")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        navio,
        data,
        norma,
        itemAuditado,
        resultado,
        comentarios,
        userId: user.id,
      }
      
      const res = await fetch("/api/auditorias/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      
      const responseData = await res.json()
      
      if (res.ok) {
        toast.success("Auditoria registrada com sucesso!")
        // Reset form
        setNavio("")
        setData("")
        setNorma(normasIMCA[0])
        setItemAuditado("")
        setResultado("")
        setComentarios("")
      } else {
        toast.error(responseData.error || "Erro ao registrar auditoria")
      }
    } catch (error) {
      console.error("Erro ao salvar auditoria:", error)
      toast.error("Erro ao registrar auditoria. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardContent className="space-y-4 p-6">
        <h2 className="text-xl font-semibold">📋 Nova Auditoria Técnica IMCA</h2>

        <div>
          <Label>Navio *</Label>
          <select 
            className="w-full border rounded p-2" 
            value={navio} 
            onChange={(e) => setNavio(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">Selecione</option>
            {navios.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div>
          <Label>Data *</Label>
          <Input 
            type="date" 
            value={data} 
            onChange={(e) => setData(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label>Norma IMCA *</Label>
          <select 
            className="w-full border rounded p-2" 
            value={norma} 
            onChange={(e) => setNorma(e.target.value)}
            disabled={isSubmitting}
          >
            {normasIMCA.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div>
          <Label>Item Auditado *</Label>
          <Input 
            value={itemAuditado} 
            onChange={(e) => setItemAuditado(e.target.value)}
            disabled={isSubmitting}
            placeholder="Descreva o item auditado"
          />
        </div>

        <div>
          <Label>Resultado *</Label>
          <select 
            className="w-full border rounded p-2" 
            value={resultado} 
            onChange={(e) => setResultado(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">Selecione</option>
            <option value="Conforme">✅ Conforme</option>
            <option value="Não Conforme">❌ Não Conforme</option>
            <option value="Observação">⚠️ Observação</option>
          </select>
        </div>

        <div>
          <Label>Comentários / Ações Corretivas</Label>
          <Textarea 
            rows={3} 
            value={comentarios} 
            onChange={(e) => setComentarios(e.target.value)}
            disabled={isSubmitting}
            placeholder="Adicione comentários ou ações corretivas necessárias"
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          className="bg-green-600 hover:bg-green-700 text-white w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar Auditoria"}
        </Button>
      </CardContent>
    </Card>
  )
}
