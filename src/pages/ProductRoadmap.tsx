import React from "react";
import ProductRoadmap from "@/components/strategic/ProductRoadmap";
import { Map } from "lucide-react";

const ProductRoadmapPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-lg bg-primary/10">
          <Map className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Product Roadmap</h1>
          <p className="text-muted-foreground">
            Trilha estratégica de evolução do Nautilus One
          </p>
        </div>
      </div>
      <ProductRoadmap />
    </div>
  );
};

export default ProductRoadmapPage;