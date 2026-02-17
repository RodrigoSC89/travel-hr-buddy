import { motion } from 'framer-motion';
import { SparePartsCatalog } from "@/components/maintenance/SparePartsCatalog";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";

const SparePartsPage = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
    <motion.div variants={fadeUp}>
      <h1 className="text-2xl font-bold">Spare Parts Catalog</h1>
      <p className="text-muted-foreground">Equipment spare parts inventory with cross-referencing and reorder automation</p>
    </motion.div>
    <motion.div variants={fadeUp}>
      <SparePartsCatalog />
    </motion.div>
  </motion.div>
);
export default SparePartsPage;
