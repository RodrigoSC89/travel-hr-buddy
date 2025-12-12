import React from "react";
import ProductionDeployCenter from "@/components/deploy/production-deploy-center";
import { Rocket } from "lucide-react";

const ProductionDeployPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-lg bg-primary/10">
          <Rocket className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Deploy de Produção</h1>
          <p className="text-muted-foreground">
            Centro de controle para deploy e monitoramento em produção
          </p>
        </div>
      </div>
      <ProductionDeployCenter />
    </div>
  );
});

export default ProductionDeployPage;