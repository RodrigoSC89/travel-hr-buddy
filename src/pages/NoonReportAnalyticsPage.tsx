import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import NoonReportManager from "@/components/operations/NoonReportManager";
import { NoonReportAIValidation } from "@/components/operations/NoonReportAIValidation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Brain } from "lucide-react";

export default function NoonReportAnalyticsPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="p-6 space-y-6">
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="manager" className="space-y-4">
          <TabsList>
            <TabsTrigger value="manager" className="gap-2"><ClipboardList className="h-4 w-4" />Noon Reports</TabsTrigger>
            <TabsTrigger value="ai-validation" className="gap-2"><Brain className="h-4 w-4" />Validação IA</TabsTrigger>
          </TabsList>
          <TabsContent value="manager"><NoonReportManager /></TabsContent>
          <TabsContent value="ai-validation"><NoonReportAIValidation /></TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
