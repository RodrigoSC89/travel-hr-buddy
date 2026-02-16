/**
 * MLC 2006 Work/Rest Violations Checker
 * Validates compliance with Maritime Labour Convention Regulation 2.3
 */

interface WorkRestRecord {
  date: string;
  work_hours: number;
  rest_hours: number;
}

interface MLCViolation {
  date: string;
  type: 'MAX_DAILY_WORK' | 'MIN_DAILY_REST' | 'MAX_WEEKLY_WORK' | 'MIN_WEEKLY_REST';
  description: string;
  regulation: string;
  severity: 'critical' | 'major' | 'minor';
  actual_value: number;
  limit_value: number;
}

interface MLCCheckResult {
  isCompliant: boolean;
  violations: MLCViolation[];
  totalWorkHours: number;
  totalRestHours: number;
  averageWorkPerDay: number;
}

/**
 * MLC 2006 Regulation 2.3 limits:
 * - Max 14h work in any 24h period
 * - Min 10h rest in any 24h period
 * - Max 72h work in any 7-day period
 * - Min 77h rest in any 7-day period
 */
export function checkMLCViolations(records: WorkRestRecord[]): MLCCheckResult {
  const violations: MLCViolation[] = [];
  let totalWork = 0;
  let totalRest = 0;

  // Daily checks
  records.forEach((r) => {
    totalWork += r.work_hours;
    totalRest += r.rest_hours;

    if (r.work_hours > 14) {
      violations.push({
        date: r.date,
        type: 'MAX_DAILY_WORK',
        description: `${r.work_hours}h excede máximo de 14h/dia`,
        regulation: 'MLC Reg. 2.3 A2.3(5a)',
        severity: r.work_hours > 16 ? 'critical' : 'major',
        actual_value: r.work_hours,
        limit_value: 14,
      });
    }

    if (r.rest_hours < 10) {
      violations.push({
        date: r.date,
        type: 'MIN_DAILY_REST',
        description: `${r.rest_hours}h abaixo do mínimo de 10h/dia`,
        regulation: 'MLC Reg. 2.3 A2.3(5b)',
        severity: r.rest_hours < 8 ? 'critical' : 'major',
        actual_value: r.rest_hours,
        limit_value: 10,
      });
    }
  });

  // Weekly checks (7-day rolling window)
  if (records.length >= 7) {
    const last7 = records.slice(-7);
    const weekWork = last7.reduce((s, r) => s + r.work_hours, 0);
    const weekRest = last7.reduce((s, r) => s + r.rest_hours, 0);

    if (weekWork > 72) {
      violations.push({
        date: last7[last7.length - 1].date,
        type: 'MAX_WEEKLY_WORK',
        description: `${weekWork}h/semana excede máximo de 72h`,
        regulation: 'MLC Reg. 2.3 A2.3(5a)',
        severity: 'major',
        actual_value: weekWork,
        limit_value: 72,
      });
    }

    if (weekRest < 77) {
      violations.push({
        date: last7[last7.length - 1].date,
        type: 'MIN_WEEKLY_REST',
        description: `${weekRest}h/semana abaixo do mínimo de 77h`,
        regulation: 'MLC Reg. 2.3 A2.3(5b)',
        severity: 'major',
        actual_value: weekRest,
        limit_value: 77,
      });
    }
  }

  return {
    isCompliant: violations.length === 0,
    violations,
    totalWorkHours: totalWork,
    totalRestHours: totalRest,
    averageWorkPerDay: records.length > 0 ? totalWork / records.length : 0,
  };
}
