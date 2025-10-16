import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ComentariosAuditoria } from "@/components/auditoria";

/**
 * Demo page for ComentariosAuditoria component
 * This demonstrates the integrated PDF export functionality for audit comments
 */
const ComentariosAuditoriaDemo: React.FC = () => {
  // Example auditoria ID - in a real application, this would come from route params
  const auditoriaId = "demo-audit-001";

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">💬 Comentários da Auditoria - Demo</h1>
        <p className="text-muted-foreground">
          Sistema de comentários com exportação em PDF integrada
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades</CardTitle>
          <CardDescription>
            Esta demonstração inclui:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2">
            <li>💬 Visualização de comentários com histórico completo</li>
            <li>✍️ Adicionar novos comentários à auditoria</li>
            <li>📄 Exportar todos os comentários como relatório em PDF</li>
            <li>👤 Identificação de usuário e timestamp para cada comentário</li>
            <li>🔄 Atualização automática após adicionar comentário</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exemplo de Uso</CardTitle>
          <CardDescription>
            Interface de comentários integrada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ComentariosAuditoria auditoriaId={auditoriaId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como Integrar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Importar o componente:</h3>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                {"import { ComentariosAuditoria } from \"@/components/auditoria\";"}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">2. Usar no seu componente:</h3>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                {"<ComentariosAuditoria auditoriaId={auditoriaId} />"}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. API Endpoints:</h3>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                {`GET  /api/auditoria/[auditoriaId]/comentarios
POST /api/auditoria/[auditoriaId]/comentarios`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComentariosAuditoriaDemo;
