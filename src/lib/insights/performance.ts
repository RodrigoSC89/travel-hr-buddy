/**
 * PATCH 95.0 - Performance Insights Helper
 * Evaluates performance metrics and determines operational status
 */

interface PerformanceMetrics {
  fuelEfficiency: number;
  navigationHours: number;
  productivity: number;
  downtime: number;
  totalMissions: number;
}

/**
 * Performance thresholds for status evaluation
 */
const THRESHOLDS = {
  optimal: {
    fuelEfficiency: 90,
    productivity: 85,
    downtime: 5,
  },
  average: {
    fuelEfficiency: 75,
    productivity: 70,
    downtime: 10,
  },
  critical: {
    fuelEfficiency: 60,
    productivity: 60,
    downtime: 20,
  },
};

/**
 * Evaluates performance metrics and returns status classification
 * 
 * @param metrics - Performance metrics object
 * @returns Status classification: "optimal", "average", or "critical"
 */
export const getPerformanceStatus = (metrics: PerformanceMetrics): string => {
  let score = 0;
  let maxScore = 0;

  // Evaluate fuel efficiency
  if (metrics.fuelEfficiency >= THRESHOLDS.optimal.fuelEfficiency) {
    score += 3;
  } else if (metrics.fuelEfficiency >= THRESHOLDS.average.fuelEfficiency) {
    score += 2;
  } else if (metrics.fuelEfficiency >= THRESHOLDS.critical.fuelEfficiency) {
    score += 1;
  }
  maxScore += 3;

  // Evaluate productivity
  if (metrics.productivity >= THRESHOLDS.optimal.productivity) {
    score += 3;
  } else if (metrics.productivity >= THRESHOLDS.average.productivity) {
    score += 2;
  } else if (metrics.productivity >= THRESHOLDS.critical.productivity) {
    score += 1;
  }
  maxScore += 3;

  // Evaluate downtime (lower is better)
  if (metrics.downtime <= THRESHOLDS.optimal.downtime) {
    score += 3;
  } else if (metrics.downtime <= THRESHOLDS.average.downtime) {
    score += 2;
  } else if (metrics.downtime <= THRESHOLDS.critical.downtime) {
    score += 1;
  }
  maxScore += 3;

  // Calculate percentage
  const percentage = (score / maxScore) * 100;

  // Classify status
  if (percentage >= 85) {
    return 'optimal';
  } else if (percentage >= 60) {
    return 'average';
  } else {
    return 'critical';
  }
};

/**
 * Get detailed performance analysis with recommendations
 * 
 * @param metrics - Performance metrics object
 * @returns Detailed analysis with recommendations
 */
export const getPerformanceAnalysis = (metrics: PerformanceMetrics) => {
  const status = getPerformanceStatus(metrics);
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Analyze fuel efficiency
  if (metrics.fuelEfficiency < THRESHOLDS.average.fuelEfficiency) {
    issues.push('Eficiência de combustível abaixo do esperado');
    recommendations.push('Revisar rotas e velocidade de cruzeiro');
    recommendations.push('Verificar manutenção dos motores');
  }

  // Analyze productivity
  if (metrics.productivity < THRESHOLDS.average.productivity) {
    issues.push('Produtividade abaixo da meta');
    recommendations.push('Otimizar distribuição de tarefas');
    recommendations.push('Revisar cronogramas de missões');
  }

  // Analyze downtime
  if (metrics.downtime > THRESHOLDS.average.downtime) {
    issues.push('Downtime acima do aceitável');
    recommendations.push('Implementar manutenção preventiva');
    recommendations.push('Revisar causas de paradas não programadas');
  }

  return {
    status,
    issues,
    recommendations,
    metrics,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Compare current metrics with historical data
 * 
 * @param currentMetrics - Current performance metrics
 * @param historicalMetrics - Historical performance metrics for comparison
 * @returns Comparison analysis with trends
 */
export const comparePerformance = (
  currentMetrics: PerformanceMetrics,
  historicalMetrics: PerformanceMetrics
) => {
  const getTrend = (current: number, previous: number, lowerIsBetter = false) => {
    if (current === previous) return 'stable';
    if (lowerIsBetter) {
      return current < previous ? 'improving' : 'declining';
    }
    return current > previous ? 'improving' : 'declining';
  };

  const trends = {
    fuelEfficiency: {
      current: currentMetrics.fuelEfficiency,
      previous: historicalMetrics.fuelEfficiency,
      change: currentMetrics.fuelEfficiency - historicalMetrics.fuelEfficiency,
      trend: getTrend(currentMetrics.fuelEfficiency, historicalMetrics.fuelEfficiency),
    },
    productivity: {
      current: currentMetrics.productivity,
      previous: historicalMetrics.productivity,
      change: currentMetrics.productivity - historicalMetrics.productivity,
      trend: getTrend(currentMetrics.productivity, historicalMetrics.productivity),
    },
    downtime: {
      current: currentMetrics.downtime,
      previous: historicalMetrics.downtime,
      change: currentMetrics.downtime - historicalMetrics.downtime,
      trend: getTrend(currentMetrics.downtime, historicalMetrics.downtime, true),
    },
  };

  return trends;
};

/**
 * Calculate KPI score based on metrics
 * 
 * @param metrics - Performance metrics object
 * @returns KPI score (0-100)
 */
export const calculateKPIScore = (metrics: PerformanceMetrics): number => {
  const weights = {
    fuelEfficiency: 0.3,
    productivity: 0.4,
    downtime: 0.3,
  };

  // Normalize fuel efficiency (0-100)
  const fuelScore = Math.min(100, metrics.fuelEfficiency);

  // Normalize productivity (0-100)
  const productivityScore = Math.min(100, metrics.productivity);

  // Normalize downtime (inverse, so lower is better)
  // Downtime multiplier of 5 converts percentage to score impact
  // e.g., 20% downtime = 100 - (20 * 5) = 0 score
  // e.g., 10% downtime = 100 - (10 * 5) = 50 score
  // e.g., 5% downtime = 100 - (5 * 5) = 75 score
  const DOWNTIME_SCORE_MULTIPLIER = 5;
  const downtimeScore = Math.max(0, 100 - (metrics.downtime * DOWNTIME_SCORE_MULTIPLIER));

  // Calculate weighted score
  const score = 
    (fuelScore * weights.fuelEfficiency) +
    (productivityScore * weights.productivity) +
    (downtimeScore * weights.downtime);

  return Math.round(score * 10) / 10;
};
