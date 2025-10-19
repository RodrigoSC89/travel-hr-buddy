import html2pdf from 'html2pdf.js'

export function generateOrderPDF(order: {
  id: string
  vessel_name: string
  system_name: string
  status: string
  priority: string
  description: string
  executed_at?: string
  technician_comment?: string
  created_at: string
}) {
  const content = `
    <div style="font-family: sans-serif; padding: 2rem;">
      <h1 style="text-align: center;">🚢 Ordem de Serviço - MMI</h1>
      <hr />
      <p><strong>ID:</strong> ${order.id}</p>
      <p><strong>Data de criação:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
      <p><strong>Embarcação:</strong> ${order.vessel_name}</p>
      <p><strong>Sistema:</strong> ${order.system_name}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      <p><strong>Prioridade:</strong> ${order.priority}</p>
      <p><strong>Descrição:</strong><br/>${order.description}</p>
      <p><strong>Data de Execução:</strong> ${order.executed_at || 'N/A'}</p>
      <p><strong>Comentário Técnico:</strong><br/>${order.technician_comment || 'N/A'}</p>
      <br/><br/>
      <p>_____________________________________<br/><strong>Responsável Técnico</strong></p>
    </div>
  `

  html2pdf()
    .set({
      margin: 1,
      filename: `os-${order.id}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    })
    .from(content)
    .save()
}
