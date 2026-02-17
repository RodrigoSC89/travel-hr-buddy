import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { PoolDistributionManager } from "@/components/operations/PoolDistributionManager";

export default function PoolDistributionPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold">Pool Distribution Manager</h1>
        <p className="text-muted-foreground">Revenue pooling, pool point calculation, and vessel earnings distribution</p>
      </motion.div>
      <motion.div variants={fadeUp}><PoolDistributionManager /></motion.div>
    </motion.div>
  );
}
