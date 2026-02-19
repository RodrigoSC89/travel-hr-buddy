import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { CrewPayrollCalculator } from "@/components/crew/CrewPayrollCalculator";
import { AllotmentManagementTab } from "@/components/crew/AllotmentManagementTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, BanknoteIcon } from "lucide-react";

export default function CrewPayrollPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="min-h-screen bg-background p-6">
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="payroll" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payroll" className="gap-2"><Calculator className="h-4 w-4" />Folha de Pagamento</TabsTrigger>
            <TabsTrigger value="allotments" className="gap-2"><BanknoteIcon className="h-4 w-4" />Allotments</TabsTrigger>
          </TabsList>
          <TabsContent value="payroll">
            <CrewPayrollCalculator />
          </TabsContent>
          <TabsContent value="allotments">
            <AllotmentManagementTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
