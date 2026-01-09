import React from 'react';
import { SupplierPortal } from '@/components/suppliers/SupplierPortal';

const SupplierPortalPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Supplier Portal</h1>
          <p className="text-muted-foreground">Manage suppliers, purchase orders and quotations</p>
        </div>
        <SupplierPortal />
      </div>
    </div>
  );
};

export default SupplierPortalPage;
