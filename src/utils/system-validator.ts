/**
 * System Validation Utility
 * Provides comprehensive checks for Nautilus One system health and performance
 */

export interface ValidationResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: unknown;
}

export interface SystemHealthReport {
  timestamp: string;
  overall_status: 'healthy' | 'degraded' | 'critical';
  checks: {
    functional: ValidationResult[];
    performance: ValidationResult[];
    ai: ValidationResult[];
    connectivity: ValidationResult[];
  };
  recommendations: Recommendation[];
  metrics: PerformanceMetrics;
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'performance' | 'security' | 'reliability' | 'code-quality';
  issue: string;
  suggestion: string;
  impact: string;
  files?: string[];
}

export interface PerformanceMetrics {
  api_response_times: Record<string, number>;
  heavy_operations: string[];
  optimization_opportunities: string[];
  code_quality_issues: {
    console_logs: number;
    any_types: number;
    empty_catches: number;
    missing_error_handling: number;
  };
}

/**
 * Check if Supabase connection is healthy
 */
export async function checkSupabaseConnection(): Promise<ValidationResult> {
  try {
    const { supabase } = await import('../integrations/supabase/client');
    
    // Test basic connectivity
    const { data, error } = await supabase.from('profiles').select('count').limit(1).single();
    
    if (error) {
      return {
        status: 'error',
        message: 'Supabase connection failed',
        details: error.message
      };
    }
    
    return {
      status: 'success',
      message: 'Supabase connection healthy'
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to initialize Supabase client',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check authentication and RLS
 */
export async function checkAuthentication(): Promise<ValidationResult> {
  try {
    const { supabase } = await import('../integrations/supabase/client');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        status: 'warning',
        message: 'Auth check encountered error',
        details: error.message
      };
    }
    
    if (!session) {
      return {
        status: 'warning',
        message: 'No active session - user not authenticated',
        details: 'This is normal for unauthenticated contexts'
      };
    }
    
    return {
      status: 'success',
      message: 'Authentication working correctly',
      details: { user_id: session.user.id }
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Authentication check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if AI services are accessible
 */
export async function checkAIServices(): Promise<ValidationResult> {
  try {
    // Check if OpenAI key is configured
    const openaiConfigured = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!openaiConfigured) {
      return {
        status: 'warning',
        message: 'OpenAI API key not configured',
        details: 'AI features may not work properly'
      };
    }
    
    return {
      status: 'success',
      message: 'AI services configuration detected'
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'AI services check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test a sample edge function
 */
export async function checkEdgeFunctions(): Promise<ValidationResult> {
  try {
    const { supabase } = await import('../integrations/supabase/client');
    
    // Try to invoke a lightweight edge function
    const { data, error } = await supabase.functions.invoke('cron-status', {
      method: 'GET'
    });
    
    if (error) {
      return {
        status: 'warning',
        message: 'Edge function invocation failed',
        details: error.message
      };
    }
    
    return {
      status: 'success',
      message: 'Edge functions accessible',
      details: data
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Edge functions check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Analyze code for performance issues
 */
export async function analyzeCodeQuality(): Promise<PerformanceMetrics> {
  // This would typically run on the server or as part of CI/CD
  // For now, return mock data that should be replaced with actual analysis
  return {
    api_response_times: {
      '/dashboard': 150,
      '/workflows': 200,
      '/documents': 180
    },
    heavy_operations: [
      'PDF generation (client-side)',
      'Large dataset rendering without virtualization',
      'Unoptimized image loading'
    ],
    optimization_opportunities: [
      'Add React.memo to heavy components',
      'Implement code splitting for modules',
      'Add SWR/React Query for data fetching',
      'Move PDF generation to Edge Functions',
      'Add image optimization and lazy loading'
    ],
    code_quality_issues: {
      console_logs: 45,
      any_types: 23,
      empty_catches: 8,
      missing_error_handling: 12
    }
  };
}

/**
 * Generate performance recommendations
 */
export function generateRecommendations(metrics: PerformanceMetrics): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Check console.logs
  if (metrics.code_quality_issues.console_logs > 10) {
    recommendations.push({
      priority: 'medium',
      category: 'code-quality',
      issue: `Found ${metrics.code_quality_issues.console_logs} console.log statements`,
      suggestion: 'Remove console.log statements or replace with proper logging service',
      impact: 'Performance degradation in production, potential data leaks'
    });
  }
  
  // Check any types
  if (metrics.code_quality_issues.any_types > 5) {
    recommendations.push({
      priority: 'medium',
      category: 'code-quality',
      issue: `Found ${metrics.code_quality_issues.any_types} any type usages`,
      suggestion: 'Replace any types with proper TypeScript types',
      impact: 'Type safety issues, harder to maintain and debug'
    });
  }
  
  // Check empty catches
  if (metrics.code_quality_issues.empty_catches > 0) {
    recommendations.push({
      priority: 'high',
      category: 'reliability',
      issue: `Found ${metrics.code_quality_issues.empty_catches} empty catch blocks`,
      suggestion: 'Add proper error handling in catch blocks',
      impact: 'Silent failures, difficult to debug production issues'
    });
  }
  
  // Performance optimizations
  if (metrics.heavy_operations.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'performance',
      issue: 'Heavy client-side operations detected',
      suggestion: 'Move heavy operations to Edge Functions or use Web Workers',
      impact: 'Slow page loads, poor user experience, high memory usage',
      files: metrics.heavy_operations
    });
  }
  
  // Check API response times
  const slowAPIs = Object.entries(metrics.api_response_times)
    .filter(([, time]) => time > 200)
    .map(([path]) => path);
    
  if (slowAPIs.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'performance',
      issue: 'Slow API response times detected',
      suggestion: 'Add caching, optimize database queries, implement pagination',
      impact: 'Poor user experience, increased server load',
      files: slowAPIs
    });
  }
  
  return recommendations;
}

/**
 * Run comprehensive system validation
 */
export async function runSystemValidation(): Promise<SystemHealthReport> {
  const timestamp = new Date().toISOString();
  
  // Run all checks
  const [
    supabaseCheck,
    authCheck,
    aiCheck,
    edgeFunctionsCheck
  ] = await Promise.all([
    checkSupabaseConnection(),
    checkAuthentication(),
    checkAIServices(),
    checkEdgeFunctions()
  ]);
  
  const metrics = await analyzeCodeQuality();
  const recommendations = generateRecommendations(metrics);
  
  // Determine overall status
  const allChecks = [supabaseCheck, authCheck, aiCheck, edgeFunctionsCheck];
  const hasError = allChecks.some(check => check.status === 'error');
  const hasWarning = allChecks.some(check => check.status === 'warning');
  
  const overall_status = hasError ? 'critical' : hasWarning ? 'degraded' : 'healthy';
  
  return {
    timestamp,
    overall_status,
    checks: {
      functional: [supabaseCheck, authCheck],
      performance: [],
      ai: [aiCheck],
      connectivity: [edgeFunctionsCheck]
    },
    recommendations,
    metrics
  };
}
