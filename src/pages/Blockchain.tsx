import React, { Suspense } from 'react';
import { Shield } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy loading do sistema blockchain
const BlockchainDocuments = React.lazy(() => 
  import('@/components/innovation/blockchain-documents').then(module => ({
    default: module.BlockchainDocuments
  }))
);

const Blockchain: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Blockchain Documents</h1>
              <p className="text-muted-foreground">
                Certificação e validação segura de documentos
              </p>
            </div>
          </div>
          
      <Suspense fallback={
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-muted-foreground">Carregando sistema blockchain...</p>
          </div>
        </div>
      }>
        <BlockchainDocuments />
      </Suspense>
    </div>
  );
};

export default Blockchain;