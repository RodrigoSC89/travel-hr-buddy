import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { CrewChangeManager } from "@/components/operations/CrewChangeManager";
import { CrewVisaTracker } from "@/components/crew/CrewVisaTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Stamp } from "lucide-react";

export default function CrewChangePage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="p-6 space-y-6">
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="crew-change" className="space-y-4">
          <TabsList>
            <TabsTrigger value="crew-change" className="gap-2"><Users className="h-4 w-4" />Crew Change</TabsTrigger>
            <TabsTrigger value="visa-tracker" className="gap-2"><Stamp className="h-4 w-4" />Vistos & Imigração</TabsTrigger>
          </TabsList>
          <TabsContent value="crew-change"><CrewChangeManager /></TabsContent>
          <TabsContent value="visa-tracker"><CrewVisaTracker /></TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
