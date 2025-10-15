/**
 * Code Performance Analyzer
 * Scans codebase for performance issues and optimization opportunities
 */

export interface CodeIssue {
  file: string;
  line: number;
  type: 'console.log' | 'any-type' | 'empty-catch' | 'missing-memo' | 'missing-error-handling' | 'large-bundle' | 'unoptimized-render';
  severity: 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
}

export interface PerformanceAnalysis {
  issues: CodeIssue[];
  summary: {
    total_issues: number;
    by_severity: Record<string, number>;
    by_type: Record<string, number>;
  };
  hot_spots: string[];
  recommendations: string[];
}

/**
 * Common performance anti-patterns to detect
 */
const PERFORMANCE_PATTERNS = {
  // Console statements that should be removed in production
  CONSOLE_LOG: /console\.(log|debug|info|warn|error)/g,
  
  // Any type usage - indicates lack of type safety
  ANY_TYPE: /:\s*any\b/g,
  
  // Empty catch blocks
  EMPTY_CATCH: /catch\s*\([^)]*\)\s*\{\s*\}/g,
  
  // Missing React.memo on potentially expensive components
  MISSING_MEMO: /^export\s+(const|function)\s+\w+Component/gm,
  
  // Large inline objects/arrays that should be memoized
  LARGE_INLINE_OBJECT: /={[^}]{200,}}/g,
  
  // Unnecessary re-renders
  INLINE_FUNCTION: /onClick=\{.*=>/g,
  
  // Non-optimized loops
  NESTED_LOOPS: /for\s*\([^)]+\)\s*\{[^}]*for\s*\(/g,
  
  // Synchronous blocking operations
  SYNC_FS: /fs\.readFileSync|fs\.writeFileSync/g,
};

/**
 * Detect common performance issues in code
 */
export function analyzeCodeString(code: string, filename: string): CodeIssue[] {
  const issues: CodeIssue[] = [];
  const lines = code.split('\n');
  
  // Check for console.log statements
  lines.forEach((line, idx) => {
    if (PERFORMANCE_PATTERNS.CONSOLE_LOG.test(line)) {
      issues.push({
        file: filename,
        line: idx + 1,
        type: 'console.log',
        severity: 'medium',
        message: 'Console statement found',
        suggestion: 'Remove console.log or replace with proper logging service (Sentry)'
      });
    }
  });
  
  // Check for any types
  lines.forEach((line, idx) => {
    if (PERFORMANCE_PATTERNS.ANY_TYPE.test(line)) {
      issues.push({
        file: filename,
        line: idx + 1,
        type: 'any-type',
        severity: 'medium',
        message: 'Type "any" used',
        suggestion: 'Replace with specific TypeScript type for better type safety'
      });
    }
  });
  
  // Check for empty catch blocks
  const emptyCatchMatches = code.match(PERFORMANCE_PATTERNS.EMPTY_CATCH);
  if (emptyCatchMatches) {
    emptyCatchMatches.forEach(() => {
      issues.push({
        file: filename,
        line: 0, // Would need more sophisticated parsing to get exact line
        type: 'empty-catch',
        severity: 'high',
        message: 'Empty catch block found',
        suggestion: 'Add proper error handling - log errors, show user feedback, or rethrow'
      });
    });
  }
  
  // Check for inline functions in JSX (React performance issue)
  lines.forEach((line, idx) => {
    if (PERFORMANCE_PATTERNS.INLINE_FUNCTION.test(line) && filename.endsWith('.tsx')) {
      issues.push({
        file: filename,
        line: idx + 1,
        type: 'unoptimized-render',
        severity: 'low',
        message: 'Inline function in JSX',
        suggestion: 'Use useCallback to memoize event handlers and prevent unnecessary re-renders'
      });
    }
  });
  
  return issues;
}

/**
 * Get optimization suggestions based on file type and patterns
 */
export function getOptimizationSuggestions(filename: string, code: string): string[] {
  const suggestions: string[] = [];
  
  // React component optimization
  if (filename.endsWith('.tsx') || filename.endsWith('.jsx')) {
    if (code.includes('export const') || code.includes('export function')) {
      if (!code.includes('React.memo') && !code.includes('memo(')) {
        suggestions.push('Consider wrapping component with React.memo() to prevent unnecessary re-renders');
      }
      
      if (!code.includes('useMemo') && code.includes('map(')) {
        suggestions.push('Consider using useMemo for expensive computations or large list transformations');
      }
      
      if (!code.includes('useCallback') && code.includes('onClick')) {
        suggestions.push('Consider using useCallback for event handlers to prevent re-creating functions');
      }
    }
    
    // Check for large list rendering without virtualization
    if (code.includes('.map(') && !code.includes('virtualized') && !code.includes('react-window')) {
      suggestions.push('For large lists, consider using react-window or react-virtualized for better performance');
    }
  }
  
  // API/Service files
  if (filename.includes('service') || filename.includes('api')) {
    if (!code.includes('cache') && !code.includes('swr') && !code.includes('useQuery')) {
      suggestions.push('Add caching strategy (SWR/React Query) to reduce API calls');
    }
    
    if (code.includes('await') && code.includes('map(')) {
      suggestions.push('Use Promise.all() for parallel async operations instead of sequential awaits in loops');
    }
  }
  
  // Supabase queries
  if (code.includes('supabase.from(')) {
    if (!code.includes('.select(') || code.includes('.select(\'*\')')) {
      suggestions.push('Select only needed columns in Supabase queries to reduce data transfer');
    }
    
    if (!code.includes('.limit(') && !code.includes('.range(')) {
      suggestions.push('Add pagination (.limit() or .range()) to Supabase queries for large datasets');
    }
  }
  
  // PDF generation
  if (code.includes('html2pdf') || code.includes('jspdf')) {
    suggestions.push('Move PDF generation to Edge Function for better performance and reduced client load');
  }
  
  return suggestions;
}

/**
 * Identify performance hot spots in the codebase
 */
export function identifyHotSpots(files: Array<{ path: string; size: number }>): string[] {
  const hotSpots: string[] = [];
  
  // Large bundle files
  const largeBundles = files.filter(f => f.size > 100000); // > 100KB
  if (largeBundles.length > 0) {
    hotSpots.push(
      `Large files detected that may slow down initial load: ${largeBundles.map(f => f.path).join(', ')}`
    );
  }
  
  return hotSpots;
}

/**
 * Generate comprehensive performance analysis
 */
export function generatePerformanceReport(issues: CodeIssue[]): PerformanceAnalysis {
  const summary = {
    total_issues: issues.length,
    by_severity: {
      high: issues.filter(i => i.severity === 'high').length,
      medium: issues.filter(i => i.severity === 'medium').length,
      low: issues.filter(i => i.severity === 'low').length
    },
    by_type: issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
  
  const hot_spots: string[] = [];
  
  // Group issues by file to find hot spots
  const fileIssues = issues.reduce((acc, issue) => {
    acc[issue.file] = (acc[issue.file] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Find files with most issues
  Object.entries(fileIssues)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([file, count]) => {
      if (count > 5) {
        hot_spots.push(`${file} has ${count} performance issues`);
      }
    });
  
  const recommendations = [
    'Run `npm run clean:logs` to remove console.log statements',
    'Enable TypeScript strict mode to catch more type issues',
    'Add proper error handling in all catch blocks',
    'Consider implementing code splitting for large modules',
    'Use React DevTools Profiler to identify slow components',
    'Implement caching strategy with SWR or React Query',
    'Move heavy operations to Edge Functions or Web Workers',
    'Add performance monitoring with Sentry',
    'Implement lazy loading for images and heavy components',
    'Use React.memo, useMemo, and useCallback strategically'
  ];
  
  return {
    issues,
    summary,
    hot_spots,
    recommendations
  };
}

/**
 * Batch analyze multiple files
 */
export async function analyzeFiles(files: string[]): Promise<PerformanceAnalysis> {
  const allIssues: CodeIssue[] = [];
  
  for (const file of files) {
    try {
      // In a real implementation, this would read the file
      // For now, we'll skip actual file reading
      // const code = await readFile(file, 'utf-8');
      // const issues = analyzeCodeString(code, file);
      // allIssues.push(...issues);
    } catch (error) {
      console.error(`Error analyzing file ${file}:`, error);
    }
  }
  
  return generatePerformanceReport(allIssues);
}
