import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  suffix?: string;
  icon: React.ElementType;
  color: string;
  change?: number;
  trend?: string;
  delay?: number;
}

export const KPICard = ({ title, value, suffix = "", icon: Icon, change, trend, delay = 0 }: KPICardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold font-mono">{value}</span>
          {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
        </div>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className={`h-3 w-3 ${change >= 0 ? "text-success" : "text-destructive rotate-180"}`} />
            <span className={`text-xs ${change >= 0 ? "text-success" : "text-destructive"}`}>
              {change >= 0 ? "+" : ""}{change}%
            </span>
            {trend && <span className="text-xs text-muted-foreground ml-1">{trend}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);
