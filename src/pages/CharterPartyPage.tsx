import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { CharterPartyManager } from "@/components/operations/CharterPartyManager";
import { ClauseLibraryTab } from "@/components/operations/ClauseLibraryTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BookOpen } from "lucide-react";

export default function CharterPartyPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-4">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold">Charter Party Management</h1>
        <p className="text-muted-foreground">NYPE, SHELLTIME, BIMCO — Contracts & Clause Library</p>
      </motion.div>
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="contracts">
          <TabsList>
            <TabsTrigger value="contracts"><FileText className="h-4 w-4 mr-1" />Contracts</TabsTrigger>
            <TabsTrigger value="clause-library"><BookOpen className="h-4 w-4 mr-1" />Clause Library</TabsTrigger>
          </TabsList>
          <TabsContent value="contracts"><CharterPartyManager /></TabsContent>
          <TabsContent value="clause-library"><ClauseLibraryTab /></TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
