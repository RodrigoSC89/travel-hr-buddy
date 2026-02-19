import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { BunkerManager } from "@/components/operations/BunkerManager";
import { FuelQualityTrackerTab } from "@/components/operations/FuelQualityTrackerTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fuel, FlaskConical } from "lucide-react";

export default function BunkerOperationsPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-4">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold">Bunker Operations</h1>
        <p className="text-muted-foreground">Fuel management, quality tracking & MARPOL Annex VI compliance</p>
      </motion.div>
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="operations">
          <TabsList>
            <TabsTrigger value="operations"><Fuel className="h-4 w-4 mr-1" />Operations</TabsTrigger>
            <TabsTrigger value="fuel-quality"><FlaskConical className="h-4 w-4 mr-1" />Fuel Quality</TabsTrigger>
          </TabsList>
          <TabsContent value="operations"><BunkerManager /></TabsContent>
          <TabsContent value="fuel-quality"><FuelQualityTrackerTab /></TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
