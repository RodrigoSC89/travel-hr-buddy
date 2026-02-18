/**
 * OperationalRadar - NASA-grade fleet health radial visualization
 * SVG animated radar showing real-time system dimensions
 */
import React, { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Radar, Shield, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Dimension {
  label: string;
  value: number; // 0-100
  color: string;
}

const RadarChart = memo(({ dimensions }: { dimensions: Dimension[] }) => {
  const cx = 120, cy = 120, maxR = 90;
  const n = dimensions.length;
  const angleStep = (2 * Math.PI) / n;

  // Concentric rings
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Points for the polygon
  const points = dimensions.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (d.value / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[280px] mx-auto">
      {/* Concentric rings */}
      {rings.map((r, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={maxR * r}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={0.5}
          opacity={0.4}
        />
      ))}

      {/* Axis lines */}
      {dimensions.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={cx + maxR * Math.cos(angle)}
            y2={cy + maxR * Math.sin(angle)}
            stroke="hsl(var(--border))"
            strokeWidth={0.5}
            opacity={0.3}
          />
        );
      })}

      {/* Filled area */}
      <motion.path
        d={polygonPath}
        fill="hsl(var(--primary) / 0.15)"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Data points */}
      {points.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x} cy={p.y} r={4}
          fill="hsl(var(--primary))"
          stroke="hsl(var(--background))"
          strokeWidth={2}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 + i * 0.08 }}
        />
      ))}

      {/* Labels */}
      {dimensions.map((d, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const labelR = maxR + 22;
        const x = cx + labelR * Math.cos(angle);
        const y = cy + labelR * Math.sin(angle);
        return (
          <text
            key={i}
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground"
            fontSize={9}
            fontWeight={500}
          >
            {d.label}
          </text>
        );
      })}

      {/* Center score */}
      <motion.text
        x={cx} y={cy - 6}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={22}
        fontWeight={700}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {Math.round(dimensions.reduce((s, d) => s + d.value, 0) / dimensions.length)}%
      </motion.text>
      <text
        x={cx} y={cy + 12}
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={8}
        fontWeight={500}
      >
        READINESS
      </text>

      {/* Animated sweep line */}
      <motion.line
        x1={cx} y1={cy}
        x2={cx} y2={cy - maxR}
        stroke="hsl(var(--primary))"
        strokeWidth={1}
        opacity={0.4}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
    </svg>
  );
});
RadarChart.displayName = 'RadarChart';

export const OperationalRadar = memo(() => {
  const { data } = useQuery({
    queryKey: ['operational-radar'],
    queryFn: async () => {
      const [vessels, crew, maintenance, certs, ncs, compliance] = await Promise.all([
        supabase.from('vessels').select('id, status').limit(500),
        supabase.from('crew_members').select('id, status').limit(500),
        supabase.from('mmi_maintenance_jobs').select('id, status').limit(500),
        supabase.from('certificates').select('id, expiry_date').limit(500),
        supabase.from('non_conformities').select('id, status').limit(500),
        supabase.from('compliance_items').select('id, status').limit(500),
      ]);

      const totalVessels = vessels.data?.length || 1;
      const activeVessels = vessels.data?.filter(v => v.status === 'active').length || 0;
      const fleetScore = Math.round((activeVessels / totalVessels) * 100);

      const totalCrew = crew.data?.length || 1;
      const activeCrew = crew.data?.filter(c => c.status === 'active' || c.status === 'onboard').length || 0;
      const crewScore = Math.round((activeCrew / totalCrew) * 100);

      const totalMaint = maintenance.data?.length || 1;
      const completedMaint = maintenance.data?.filter(m => m.status === 'completed' || m.status === 'closed').length || 0;
      const maintScore = Math.round((completedMaint / totalMaint) * 100);

      const totalCerts = certs.data?.length || 1;
      const validCerts = certs.data?.filter(c => {
        if (!c.expiry_date) return true;
        return new Date(c.expiry_date) > new Date();
      }).length || 0;
      const certScore = Math.round((validCerts / totalCerts) * 100);

      const totalNCs = ncs.data?.length || 0;
      const openNCs = ncs.data?.filter(n => n.status === 'open' || n.status === 'in_progress').length || 0;
      const ncScore = totalNCs === 0 ? 100 : Math.round(((totalNCs - openNCs) / totalNCs) * 100);

      const totalComp = compliance.data?.length || 1;
      const compliant = compliance.data?.filter(c => c.status === 'compliant' || c.status === 'completed').length || 0;
      const compScore = Math.round((compliant / totalComp) * 100);

      return { fleetScore, crewScore, maintScore, certScore, ncScore, compScore };
    },
    staleTime: 60000,
    refetchInterval: 120000,
  });

  const dimensions = useMemo<Dimension[]>(() => [
    { label: 'Frota', value: data?.fleetScore ?? 85, color: 'text-primary' },
    { label: 'Tripulação', value: data?.crewScore ?? 90, color: 'text-success' },
    { label: 'Manutenção', value: data?.maintScore ?? 75, color: 'text-warning' },
    { label: 'Certificados', value: data?.certScore ?? 92, color: 'text-info' },
    { label: 'NCs', value: data?.ncScore ?? 88, color: 'text-destructive' },
    { label: 'Compliance', value: data?.compScore ?? 95, color: 'text-accent-foreground' },
  ], [data]);

  const avgScore = Math.round(dimensions.reduce((s, d) => s + d.value, 0) / dimensions.length);

  return (
    <Card className="border-border/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Radar className="h-4 w-4 text-primary" />
          Radar Operacional
          <Badge
            variant="outline"
            className={cn(
              "ml-auto text-[10px]",
              avgScore >= 90 ? "bg-success/10 text-success border-success/20" :
              avgScore >= 70 ? "bg-warning/10 text-warning border-warning/20" :
              "bg-destructive/10 text-destructive border-destructive/20"
            )}
          >
            {avgScore >= 90 ? '🟢 Excelente' : avgScore >= 70 ? '🟡 Atenção' : '🔴 Crítico'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <RadarChart dimensions={dimensions} />

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {dimensions.map((d) => (
            <div key={d.label} className="flex items-center gap-1.5 text-[10px]">
              <div className={cn("h-2 w-2 rounded-full", 
                d.value >= 90 ? "bg-success" : d.value >= 70 ? "bg-warning" : "bg-destructive"
              )} />
              <span className="text-muted-foreground">{d.label}</span>
              <span className="ml-auto font-bold tabular-nums">{d.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
OperationalRadar.displayName = 'OperationalRadar';

export default OperationalRadar;
