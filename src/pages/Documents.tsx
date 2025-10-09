import React from 'react';
import { AdvancedDocumentCenter } from '@/components/documents/advanced-document-center';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';
import { ModuleHeader } from '@/components/ui/module-header';
import { FileText, Upload, Search, Shield } from 'lucide-react';

const DocumentsPage = () => {
  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={FileText}
        title="Centro de Documentos"
        description="Upload, scan, organização e busca inteligente de documentos"
        gradient="purple"
        badges={[
          { icon: Upload, label: 'Upload Rápido' },
          { icon: Search, label: 'Busca IA' },
          { icon: Shield, label: 'Seguro' }
        ]}
      />
      <AdvancedDocumentCenter />
    </ModulePageWrapper>
  );
};

export default DocumentsPage;