/**
 * Professional KPI Card
 * Card de KPI profissional com animações e gradientes
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProfessionalKPICardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: string;
  icon: LucideIcon;
  prefix?: string;
  suffix?: string;
  color?: "blue" | "green" | "purple" | "orange" | "red";
  delay?: number;
}

const colorVariants = {
  blue: {
    gradient: "from-info/10 to-transparent",
    icon: "bg-info/10 text-info",
    badge: "bg-info/10 text-info border-info/20",
  },
  green: {
    gradient: "from-success/10 to-transparent",
    icon: "bg-success/10 text-success",
    badge: "bg-success/10 text-success border-success/20",
  },
  purple: {
    gradient: "from-accent/10 to-transparent",
    icon: "bg-accent/10 text-accent-foreground",
    badge: "bg-accent/10 text-accent-foreground border-accent/20",
  },
  orange: {
    gradient: "from-warning/10 to-transparent",
    icon: "bg-warning/10 text-warning",
    badge: "bg-warning/10 text-warning border-warning/20",
  },
  red: {
    gradient: "from-destructive/10 to-transparent",
    icon: "bg-destructive/10 text-destructive",
    badge: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export function ProfessionalKPICard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  prefix = "",
  suffix = "",
  color = "blue",
  delay = 0,
}: ProfessionalKPICardProps) {
  const isPositive = change ? change >= 0 : true;
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  const colors = colorVariants[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <Card className="relative overflow-hidden border-primary/10 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
        {/* Decorative gradient */}
        <div className={cn(
          "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-full -mr-16 -mt-16 blur-2xl",
          colors.gradient
        )} />
        
        <CardContent className="pt-6 relative">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {title}
              </p>
              <p className="text-4xl font-bold font-playfair bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                {prefix}{value}{suffix}
              </p>
              
              {change !== undefined && (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn("gap-1 border", colors.badge)}
                  >
                    <TrendIcon className="h-3 w-3" />
                    {Math.abs(change)}%
                  </Badge>
                  {trend && (
                    <span className="text-xs text-muted-foreground">{trend}</span>
                  )}
                </div>
              )}
            </div>
            
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: delay + 0.2, type: "spring" }}
              className={cn("p-3 rounded-xl shadow-lg", colors.icon)}
            >
              <Icon className="h-6 w-6" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
