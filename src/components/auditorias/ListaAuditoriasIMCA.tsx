"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface Auditoria {
  id: string
  navio: string
  data: string
  norma: string
  resultado: 'Conforme' | 'Não Conforme' | 'Observação'
  item_auditado: string
  comentarios: string
}

export function ListaAuditoriasIMCA() {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auditorias/list")
      .then((res) => res.json())
      .then((data) => {
        setAuditorias(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error loading auditorias:", error)
        setLoading(false)
      })
  }, [])

  const corResultado: Record<string, string> = {
    "Conforme": "bg-green-100 text-green-800",
    "Não Conforme": "bg-red-100 text-red-800",
    "Observação": "bg-yellow-100 text-yellow-800",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Carregando auditorias...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📋 Auditorias Técnicas Registradas</h2>
      
      {auditorias.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <p>Nenhuma auditoria registrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {auditorias.map((a) => (
            <Card key={a.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold">🚢 {a.navio}</h3>
                  <Badge className={corResultado[a.resultado] || "bg-gray-100 text-gray-800"}>
                    {a.resultado}
                  </Badge>
                </div>
                
                <p className="text-gray-600 mb-2">
                  {a.data && format(new Date(a.data), 'dd/MM/yyyy')} - Norma: {a.norma}
                </p>
                
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Item auditado:</span> {a.item_auditado}
                  </p>
                  
                  {a.comentarios && (
                    <p className="text-sm">
                      <span className="font-medium">Comentários:</span> {a.comentarios}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
