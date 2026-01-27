/**
 * Security Audit Center Page - Security Monitoring and Compliance
 */

import { Helmet } from "react-helmet-async";
import { SecurityAuditCenter } from "@/components/security/SecurityAuditCenter";

export default function SecurityAuditCenterPage() {
  return (
    <>
      <Helmet>
        <title>Centro de Auditoria de Segurança | Nautilus One</title>
        <meta 
          name="description" 
          content="Centro de auditoria de segurança com logs, compliance, detecção de ameaças e relatórios de conformidade" 
        />
        <meta name="keywords" content="segurança, auditoria, compliance, GDPR, MLC 2006, ISO 27001" />
        <link rel="canonical" href="/backup-audit" />
      </Helmet>
      <SecurityAuditCenter />
    </>
  );
}
