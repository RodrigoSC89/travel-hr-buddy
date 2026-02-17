/**
 * Crew Wellness Page - Optimized with Framer Motion
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { CrewWellnessDashboard } from '@/components/crew/CrewWellnessDashboard';
import { staggerContainer, fadeUp } from '@/lib/animations/motion-variants';

export default function CrewWellnessPage() {
  return (
    <>
      <Helmet>
        <title>Bem-Estar da Tripulação | Nauti One</title>
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="container mx-auto py-6 space-y-6">
        <motion.div variants={fadeUp}>
          <h1 className="text-3xl font-bold">Bem-Estar da Tripulação</h1>
          <p className="text-muted-foreground">IA para monitoramento de saúde mental e prevenção de burnout</p>
        </motion.div>
        <motion.div variants={fadeUp}>
          <CrewWellnessDashboard />
        </motion.div>
      </motion.div>
    </>
  );
}
