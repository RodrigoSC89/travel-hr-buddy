/**
 * Port Operations Center - vs Portchain
 * Port Call Timeline (Gantt), Disbursement Accounts (PDA), proforma vs final
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { PortCostManager } from "@/components/operations/PortCostManager";
import { PortCallTimeline } from "@/components/operations/PortCallTimeline";
import { Anchor, Calendar, DollarSign } from "lucide-react";

export default function PortCostPage() {
  const [activeTab, setActiveTab] = useState("timeline");

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Anchor className="h-6 w-6 text-primary" />
          Port Operations Center
        </h1>
        <p className="text-muted-foreground">Port Call Timeline, Disbursement Accounts (PDA) — proforma vs final cost analysis</p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="timeline" className="gap-1.5">
              <Calendar className="h-4 w-4" /> Port Call Timeline
            </TabsTrigger>
            <TabsTrigger value="costs" className="gap-1.5">
              <DollarSign className="h-4 w-4" /> DA & Costs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-4">
            <PortCallTimeline />
          </TabsContent>

          <TabsContent value="costs" className="mt-4">
            <PortCostManager />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
