import { motion } from 'framer-motion';
import { CrewCompetencyMatrix } from "@/components/crew/CrewCompetencyMatrix";
import { CompetencyGapTab } from "@/components/crew/CompetencyGapTab";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Target } from "lucide-react";

const CrewCompetencyPage = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
    <motion.div variants={fadeUp}>
      <h1 className="text-2xl font-bold">Crew Competency Matrix</h1>
      <p className="text-muted-foreground">STCW skills mapping, gap analysis, and training needs assessment</p>
    </motion.div>
    <motion.div variants={fadeUp}>
      <Tabs defaultValue="matrix">
        <TabsList>
          <TabsTrigger value="matrix"><GraduationCap className="h-4 w-4 mr-1" />Matrix</TabsTrigger>
          <TabsTrigger value="gap-analysis"><Target className="h-4 w-4 mr-1" />Gap Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="matrix"><CrewCompetencyMatrix /></TabsContent>
        <TabsContent value="gap-analysis"><CompetencyGapTab /></TabsContent>
      </Tabs>
    </motion.div>
  </motion.div>
);
export default CrewCompetencyPage;
