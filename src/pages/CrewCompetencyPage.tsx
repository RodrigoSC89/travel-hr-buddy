import { motion } from 'framer-motion';
import { CrewCompetencyMatrix } from "@/components/crew/CrewCompetencyMatrix";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";

const CrewCompetencyPage = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
    <motion.div variants={fadeUp}>
      <h1 className="text-2xl font-bold">Crew Competency Matrix</h1>
      <p className="text-muted-foreground">STCW skills mapping, gap analysis, and training needs assessment</p>
    </motion.div>
    <motion.div variants={fadeUp}>
      <CrewCompetencyMatrix />
    </motion.div>
  </motion.div>
);
export default CrewCompetencyPage;
