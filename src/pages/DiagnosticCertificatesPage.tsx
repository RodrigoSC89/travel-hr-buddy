/**
 * DiagnosticCertificatesPage - Problema #1: Certificados Vencendo Sem Aviso
 */
import { CertificateExpirationAlerts } from '@/components/compliance/diagnostic';

export default function DiagnosticCertificatesPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🔔 Alertas de Certificados</h1>
        <p className="text-muted-foreground">
          Sistema automático de alertas 60/30/7/3/1 dias - ZERO certificados vencendo sem aviso
        </p>
      </div>
      <CertificateExpirationAlerts />
    </div>
  );
}
