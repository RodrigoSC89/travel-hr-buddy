import React from 'react';
import { AdvancedDocumentCenter } from '@/components/documents/advanced-document-center';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';

const DocumentsPage = () => {
  return (
    <ModulePageWrapper gradient="purple">
      <AdvancedDocumentCenter />
    </ModulePageWrapper>
  );
};

export default DocumentsPage;