/**
 * Accessibility Analysis Script
 * Analyzes a11y test results and generates report
 */

const fs = require('fs');
const path = require('path');

const WCAG_LEVELS = {
  A: 'Basic',
  AA: 'Standard (Required)',
  AAA: 'Enhanced'
};

function analyzeResults() {
  const resultsPath = path.join(process.cwd(), 'a11y-results.json');
  
  if (!fs.existsSync(resultsPath)) {
    console.log('No a11y results found. Skipping analysis.');
    return;
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  
  const summary = {
    total: 0,
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
    contrastIssues: 0,
    passed: true
  };

  results.forEach(page => {
    if (page.issues) {
      page.issues.forEach(issue => {
        summary.total++;
        
        if (issue.type === 'error') {
          summary.critical++;
          summary.passed = false;
        } else if (issue.type === 'warning') {
          summary.serious++;
        } else {
          summary.minor++;
        }
        
        if (issue.code && issue.code.includes('contrast')) {
          summary.contrastIssues++;
        }
      });
    }
  });

  // Generate HTML report
  const htmlReport = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Acessibilidade - Nautilus One</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .header { background: linear-gradient(135deg, #0EA5E9, #0369A1); color: white; padding: 2rem; border-radius: 1rem; margin-bottom: 2rem; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .card { background: #f8fafc; border-radius: 0.5rem; padding: 1.5rem; border: 1px solid #e2e8f0; }
    .card.critical { border-color: #ef4444; background: #fef2f2; }
    .card.success { border-color: #22c55e; background: #f0fdf4; }
    .metric { font-size: 2rem; font-weight: bold; }
    .label { color: #64748b; font-size: 0.875rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 2rem; }
    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; }
    .badge { padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; }
    .badge.error { background: #fee2e2; color: #dc2626; }
    .badge.warning { background: #fef3c7; color: #d97706; }
    .badge.info { background: #dbeafe; color: #2563eb; }
  </style>
</head>
<body>
  <div class="header">
    <h1>♿ Relatório de Acessibilidade</h1>
    <p>Nautilus One - WCAG 2.1 AA Compliance</p>
    <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
  </div>

  <div class="summary">
    <div class="card ${summary.passed ? 'success' : 'critical'}">
      <div class="metric">${summary.passed ? '✅' : '❌'}</div>
      <div class="label">Status Geral</div>
    </div>
    <div class="card ${summary.critical > 0 ? 'critical' : ''}">
      <div class="metric">${summary.critical}</div>
      <div class="label">Críticos</div>
    </div>
    <div class="card">
      <div class="metric">${summary.serious}</div>
      <div class="label">Sérios</div>
    </div>
    <div class="card">
      <div class="metric">${summary.contrastIssues}</div>
      <div class="label">Problemas de Contraste</div>
    </div>
  </div>

  <h2>Detalhes por Página</h2>
  <table>
    <thead>
      <tr>
        <th>Página</th>
        <th>Problemas</th>
        <th>Severidade</th>
      </tr>
    </thead>
    <tbody>
      ${results.map(page => `
        <tr>
          <td>${page.url || page.pageUrl || 'N/A'}</td>
          <td>${page.issues ? page.issues.length : 0}</td>
          <td>
            ${page.issues && page.issues.some(i => i.type === 'error') 
              ? '<span class="badge error">Crítico</span>' 
              : page.issues && page.issues.some(i => i.type === 'warning')
                ? '<span class="badge warning">Aviso</span>'
                : '<span class="badge info">OK</span>'
            }
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Recomendações WCAG 2.1</h2>
  <ul>
    <li><strong>Contraste:</strong> Mínimo de 4.5:1 para texto normal</li>
    <li><strong>Foco:</strong> Indicador visível em todos os elementos interativos</li>
    <li><strong>Navegação:</strong> Skip links e landmarks ARIA</li>
    <li><strong>Imagens:</strong> Alt text descritivo</li>
    <li><strong>Formulários:</strong> Labels associados corretamente</li>
  </ul>
</body>
</html>
  `;

  fs.writeFileSync('a11y-report.html', htmlReport);
  
  console.log('\n📊 Accessibility Analysis Summary');
  console.log('================================');
  console.log(`Total Issues: ${summary.total}`);
  console.log(`Critical: ${summary.critical}`);
  console.log(`Serious: ${summary.serious}`);
  console.log(`Contrast Issues: ${summary.contrastIssues}`);
  console.log(`Status: ${summary.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('\nReport saved to: a11y-report.html');

  if (!summary.passed) {
    process.exit(1);
  }
}

analyzeResults();
