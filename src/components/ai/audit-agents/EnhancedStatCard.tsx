/**
 * Enhanced Stat Card for Audit Agents Hub
 */
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: string;
  loading?: boolean;
}

export const EnhancedStatCard: React.FC<StatCardProps> = ({ icon: Icon, value, label, color, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, y: -2 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="relative overflow-hidden group cursor-pointer">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            {loading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);
