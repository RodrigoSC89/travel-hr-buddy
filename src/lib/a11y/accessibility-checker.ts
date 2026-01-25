/**
 * Accessibility Checker
 * NAUTI ONE v4.0 - WCAG 2.1 AA Compliance
 * 
 * Automated accessibility testing and reporting
 */

export interface A11yIssue {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  element: string;
  description: string;
  wcagCriteria: string[];
  helpUrl?: string;
  fix?: string;
}

export interface A11yReport {
  score: number;
  timestamp: string;
  pageUrl: string;
  issues: A11yIssue[];
  passed: number;
  failed: number;
  warnings: number;
}

// WCAG 2.1 AA Criteria
const WCAG_CRITERIA = {
  '1.1.1': 'Non-text Content',
  '1.3.1': 'Info and Relationships',
  '1.4.1': 'Use of Color',
  '1.4.3': 'Contrast (Minimum)',
  '1.4.4': 'Resize Text',
  '2.1.1': 'Keyboard',
  '2.1.2': 'No Keyboard Trap',
  '2.4.1': 'Bypass Blocks',
  '2.4.2': 'Page Titled',
  '2.4.3': 'Focus Order',
  '2.4.4': 'Link Purpose',
  '2.4.6': 'Headings and Labels',
  '3.1.1': 'Language of Page',
  '3.2.1': 'On Focus',
  '3.2.2': 'On Input',
  '3.3.1': 'Error Identification',
  '3.3.2': 'Labels or Instructions',
  '4.1.1': 'Parsing',
  '4.1.2': 'Name, Role, Value'
};

/**
 * Check if images have alt text
 */
function checkImageAltText(): A11yIssue[] {
  const issues: A11yIssue[] = [];
  const images = document.querySelectorAll('img');
  
  images.forEach((img, index) => {
    if (!img.hasAttribute('alt')) {
      issues.push({
        id: `img-alt-${index}`,
        impact: 'critical',
        element: img.outerHTML.substring(0, 100),
        description: 'Image is missing alt attribute',
        wcagCriteria: ['1.1.1'],
        fix: 'Add descriptive alt text or alt="" for decorative images'
      });
    } else if (img.alt === '' && !img.getAttribute('role')?.includes('presentation')) {
      // Empty alt without presentation role might be an issue
    }
  });
  
  return issues;
}

/**
 * Check form labels
 */
function checkFormLabels(): A11yIssue[] {
  const issues: A11yIssue[] = [];
  const inputs = document.querySelectorAll('input, select, textarea');
  
  inputs.forEach((input, index) => {
    const id = input.getAttribute('id');
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');
    const hasLabel = id ? document.querySelector(`label[for="${id}"]`) : null;
    
    if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
      const type = input.getAttribute('type');
      if (type !== 'hidden' && type !== 'submit' && type !== 'button') {
        issues.push({
          id: `form-label-${index}`,
          impact: 'serious',
          element: input.outerHTML.substring(0, 100),
          description: 'Form control is missing a label',
          wcagCriteria: ['3.3.2', '1.3.1'],
          fix: 'Add a label element or aria-label attribute'
        });
      }
    }
  });
  
  return issues;
}

/**
 * Check heading hierarchy
 */
function checkHeadingHierarchy(): A11yIssue[] {
  const issues: A11yIssue[] = [];
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastLevel = 0;
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName[1]);
    
    if (index === 0 && level !== 1) {
      issues.push({
        id: `heading-first-${index}`,
        impact: 'moderate',
        element: heading.outerHTML.substring(0, 100),
        description: 'First heading should be h1',
        wcagCriteria: ['1.3.1', '2.4.6'],
        fix: 'Start page with an h1 heading'
      });
    }
    
    if (level - lastLevel > 1 && lastLevel !== 0) {
      issues.push({
        id: `heading-skip-${index}`,
        impact: 'moderate',
        element: heading.outerHTML.substring(0, 100),
        description: `Heading level skipped from h${lastLevel} to h${level}`,
        wcagCriteria: ['1.3.1', '2.4.6'],
        fix: 'Maintain sequential heading hierarchy'
      });
    }
    
    lastLevel = level;
  });
  
  return issues;
}

/**
 * Check color contrast (simplified check)
 */
function checkColorContrast(): A11yIssue[] {
  const issues: A11yIssue[] = [];
  
  // Check for text with potential contrast issues
  const textElements = document.querySelectorAll('p, span, a, button, label, h1, h2, h3, h4, h5, h6');
  
  textElements.forEach((element, index) => {
    const styles = window.getComputedStyle(element);
    const color = styles.color;
    const bgColor = styles.backgroundColor;
    
    // Very simplified check - in production use a proper contrast calculator
    if (color === bgColor) {
      issues.push({
        id: `contrast-${index}`,
        impact: 'serious',
        element: element.outerHTML.substring(0, 100),
        description: 'Text may have insufficient color contrast',
        wcagCriteria: ['1.4.3'],
        fix: 'Ensure contrast ratio of at least 4.5:1 for normal text'
      });
    }
  });
  
  return issues;
}

/**
 * Check keyboard accessibility
 */
function checkKeyboardAccessibility(): A11yIssue[] {
  const issues: A11yIssue[] = [];
  
  // Check for clickable elements without keyboard access
  const clickables = document.querySelectorAll('[onclick], [role="button"]');
  
  clickables.forEach((element, index) => {
    const tabindex = element.getAttribute('tabindex');
    const isNativeButton = element.tagName === 'BUTTON' || element.tagName === 'A';
    
    if (!isNativeButton && tabindex !== '0') {
      issues.push({
        id: `keyboard-${index}`,
        impact: 'serious',
        element: element.outerHTML.substring(0, 100),
        description: 'Interactive element is not keyboard accessible',
        wcagCriteria: ['2.1.1'],
        fix: 'Add tabindex="0" and keyboard event handlers'
      });
    }
  });
  
  return issues;
}

/**
 * Check for skip links
 */
function checkSkipLinks(): A11yIssue[] {
  const issues: A11yIssue[] = [];
  const skipLink = document.querySelector('a[href="#main"], a[href="#content"], .skip-link');
  
  if (!skipLink) {
    issues.push({
      id: 'skip-link-missing',
      impact: 'moderate',
      element: 'body',
      description: 'Page is missing a skip navigation link',
      wcagCriteria: ['2.4.1'],
      fix: 'Add a skip link at the beginning of the page'
    });
  }
  
  return issues;
}

/**
 * Check page language
 */
function checkPageLanguage(): A11yIssue[] {
  const issues: A11yIssue[] = [];
  const htmlLang = document.documentElement.getAttribute('lang');
  
  if (!htmlLang) {
    issues.push({
      id: 'page-lang-missing',
      impact: 'serious',
      element: '<html>',
      description: 'Page is missing lang attribute',
      wcagCriteria: ['3.1.1'],
      fix: 'Add lang attribute to html element (e.g., lang="en")'
    });
  }
  
  return issues;
}

/**
 * Check page title
 */
function checkPageTitle(): A11yIssue[] {
  const issues: A11yIssue[] = [];
  const title = document.title;
  
  if (!title || title.trim() === '') {
    issues.push({
      id: 'page-title-missing',
      impact: 'serious',
      element: '<title>',
      description: 'Page is missing a title',
      wcagCriteria: ['2.4.2'],
      fix: 'Add a descriptive title to the page'
    });
  }
  
  return issues;
}

/**
 * Check ARIA usage
 */
function checkAriaUsage(): A11yIssue[] {
  const issues: A11yIssue[] = [];
  
  // Check for invalid ARIA roles
  const elementsWithRoles = document.querySelectorAll('[role]');
  const validRoles = [
    'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
    'cell', 'checkbox', 'columnheader', 'combobox', 'complementary', 'contentinfo',
    'definition', 'dialog', 'directory', 'document', 'feed', 'figure', 'form',
    'grid', 'gridcell', 'group', 'heading', 'img', 'link', 'list', 'listbox',
    'listitem', 'log', 'main', 'marquee', 'math', 'menu', 'menubar', 'menuitem',
    'menuitemcheckbox', 'menuitemradio', 'navigation', 'none', 'note', 'option',
    'presentation', 'progressbar', 'radio', 'radiogroup', 'region', 'row',
    'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox', 'separator',
    'slider', 'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist',
    'tabpanel', 'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree',
    'treegrid', 'treeitem'
  ];
  
  elementsWithRoles.forEach((element, index) => {
    const role = element.getAttribute('role');
    if (role && !validRoles.includes(role)) {
      issues.push({
        id: `aria-role-${index}`,
        impact: 'serious',
        element: element.outerHTML.substring(0, 100),
        description: `Invalid ARIA role: ${role}`,
        wcagCriteria: ['4.1.2'],
        fix: 'Use a valid ARIA role or remove the role attribute'
      });
    }
  });
  
  return issues;
}

/**
 * Run full accessibility audit
 */
export function runAccessibilityAudit(): A11yReport {
  const allIssues: A11yIssue[] = [
    ...checkImageAltText(),
    ...checkFormLabels(),
    ...checkHeadingHierarchy(),
    ...checkColorContrast(),
    ...checkKeyboardAccessibility(),
    ...checkSkipLinks(),
    ...checkPageLanguage(),
    ...checkPageTitle(),
    ...checkAriaUsage()
  ];
  
  // Calculate score
  const criticalCount = allIssues.filter(i => i.impact === 'critical').length;
  const seriousCount = allIssues.filter(i => i.impact === 'serious').length;
  const moderateCount = allIssues.filter(i => i.impact === 'moderate').length;
  const minorCount = allIssues.filter(i => i.impact === 'minor').length;
  
  // Weighted score calculation
  const penalty = (criticalCount * 20) + (seriousCount * 10) + (moderateCount * 5) + (minorCount * 2);
  const score = Math.max(0, 100 - penalty);
  
  return {
    score,
    timestamp: new Date().toISOString(),
    pageUrl: window.location.href,
    issues: allIssues,
    passed: 50 - allIssues.length, // Approximate
    failed: criticalCount + seriousCount,
    warnings: moderateCount + minorCount
  };
}

/**
 * Get accessibility score badge
 */
export function getA11yScoreBadge(score: number): {
  grade: string;
  color: string;
  label: string;
} {
  if (score >= 95) return { grade: 'A+', color: 'green', label: 'Excelente' };
  if (score >= 90) return { grade: 'A', color: 'green', label: 'Ótimo' };
  if (score >= 80) return { grade: 'B', color: 'yellow', label: 'Bom' };
  if (score >= 70) return { grade: 'C', color: 'orange', label: 'Regular' };
  if (score >= 60) return { grade: 'D', color: 'red', label: 'Precisa Melhorar' };
  return { grade: 'F', color: 'red', label: 'Crítico' };
}

/**
 * Log accessibility report to console
 */
export function logA11yReport(report: A11yReport): void {
  const badge = getA11yScoreBadge(report.score);
  
  console.group(`♿ Accessibility Report - Score: ${report.score}% (${badge.grade})`);
  console.log(`Page: ${report.pageUrl}`);
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Passed: ${report.passed} | Failed: ${report.failed} | Warnings: ${report.warnings}`);
  
  if (report.issues.length > 0) {
    console.group('Issues:');
    report.issues.forEach(issue => {
      const icon = issue.impact === 'critical' ? '🔴' : 
                   issue.impact === 'serious' ? '🟠' :
                   issue.impact === 'moderate' ? '🟡' : '🟢';
      console.log(`${icon} [${issue.impact.toUpperCase()}] ${issue.description}`);
      console.log(`   WCAG: ${issue.wcagCriteria.join(', ')}`);
      if (issue.fix) console.log(`   Fix: ${issue.fix}`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
}

export default {
  runAccessibilityAudit,
  getA11yScoreBadge,
  logA11yReport,
  WCAG_CRITERIA
};
