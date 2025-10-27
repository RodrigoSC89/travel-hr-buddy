import React from 'react';
import { VaultVectorSearch } from '../components/VaultVectorSearch';

export default function VaultAIVectorPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vault AI - Knowledge Repository</h1>
        <p className="text-muted-foreground mt-1">
          Intelligent document search powered by AI semantic matching
        </p>
      </div>

      <VaultVectorSearch />
    </div>
  );
}
