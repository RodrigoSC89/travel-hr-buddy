/**
 * DiagnosticDocumentsPage - Problema #4: Documentos Desorganizados
 */
import { CentralizedDocumentRepository } from '@/components/compliance/diagnostic';

export default function DiagnosticDocumentsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📁 Repositório Centralizado de Documentos</h1>
        <p className="text-muted-foreground">
          Busca em 30 segundos - controle de versão e OCR automático
        </p>
      </div>
      <CentralizedDocumentRepository />
    </div>
  );
}
