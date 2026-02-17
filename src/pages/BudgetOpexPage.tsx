import React from "react";
import { motion } from "framer-motion";
import { BudgetOpexTracker } from "@/components/operations/BudgetOpexTracker";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";

const BudgetOpexPage = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="min-h-screen bg-background p-6">
    <motion.div variants={fadeUp}>
      <BudgetOpexTracker />
    </motion.div>
  </motion.div>
);

export default BudgetOpexPage;
