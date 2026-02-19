/**
 * Procurement Hub - vs ShipServ
 * Complete procurement suite: RFQ workflow, supplier analytics, comparison matrix, smart catalog
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { ProcurementWorkflow } from "@/components/operations/ProcurementWorkflow";
import { RFQComparisonMatrix } from "@/components/procurement/RFQComparisonMatrix";
import { SupplierPerformanceDashboard } from "@/components/procurement/SupplierPerformanceDashboard";
import { SmartSupplierCatalog } from "@/components/procurement/SmartSupplierCatalog";
import { ShoppingCart, Scale, TrendingUp, Package } from "lucide-react";

export default function ProcurementPage() {
  const [activeTab, setActiveTab] = useState("workflow");

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          Procurement Center
        </h1>
        <p className="text-muted-foreground">RFQ Workflow, Supplier Analytics, Smart Catalog & Quotation Comparison — surpassing ShipServ</p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="workflow" className="gap-1.5">
              <ShoppingCart className="h-4 w-4" /> Workflow
            </TabsTrigger>
            <TabsTrigger value="rfq-matrix" className="gap-1.5">
              <Scale className="h-4 w-4" /> RFQ Matrix
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="gap-1.5">
              <TrendingUp className="h-4 w-4" /> Suppliers
            </TabsTrigger>
            <TabsTrigger value="catalog" className="gap-1.5">
              <Package className="h-4 w-4" /> Catalog
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="mt-4">
            <ProcurementWorkflow />
          </TabsContent>

          <TabsContent value="rfq-matrix" className="mt-4">
            <RFQComparisonMatrix />
          </TabsContent>

          <TabsContent value="suppliers" className="mt-4">
            <SupplierPerformanceDashboard />
          </TabsContent>

          <TabsContent value="catalog" className="mt-4">
            <SmartSupplierCatalog />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
