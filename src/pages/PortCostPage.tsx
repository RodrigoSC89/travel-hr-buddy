import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { PortCostManager } from "@/components/operations/PortCostManager";
import { PortCallTimeline } from "@/components/operations/PortCallTimeline";

export default function PortCostPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold">Port Operations Center</h1>
        <p className="text-muted-foreground">Port Call Timeline, Disbursement Accounts (PDA) — proforma vs final cost analysis</p>
      </motion.div>
      <motion.div variants={fadeUp}><PortCallTimeline /></motion.div>
      <motion.div variants={fadeUp}><PortCostManager /></motion.div>
    </motion.div>
  );
}
