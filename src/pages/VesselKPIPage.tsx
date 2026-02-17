import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { VesselKPIDashboard } from "@/components/fleet/VesselKPIDashboard";

export default function VesselKPIPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}><VesselKPIDashboard /></motion.div>
    </motion.div>
  );
}
