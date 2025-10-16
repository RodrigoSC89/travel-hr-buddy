/**
 * IMCA Audit Page
 * Page wrapper for IMCA DP Technical Audit Generator
 */

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import IMCAAuditGenerator from '@/components/imca-audit/imca-audit-generator';

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
      <p className="text-muted-foreground">Carregando Auditoria IMCA...</p>
    </div>
  </div>
);

const IMCAAudit: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <IMCAAuditGenerator />
    </Suspense>
  );
};

export default IMCAAudit;
