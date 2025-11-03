/**
 * PATCH 609: ISM Audits E2E Tests
 * Tests for ISM audit upload and analysis
 */

describe('ISM Audit Module', () => {
  beforeEach(() => {
    cy.visit('/ism-audits');
  });

  it('should display the ISM Audits page', () => {
    cy.contains('ISM Audits').should('exist');
    cy.contains('PATCH 609').should('exist');
  });

  it('should upload and process an ISM audit PDF', () => {
    cy.contains('Upload Audit').click();
    
    // Use current date
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Fill in audit details
    cy.get('#vesselName').type('MV Oceanic');
    cy.get('#auditDate').type(currentDate);
    
    // Select audit type
    cy.get('#auditType').parent().click();
    cy.contains('Internal Audit').click();
    
    // Upload a test file (mock)
    const fileName = 'test-audit.pdf';
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('test content'),
      fileName: fileName,
      mimeType: 'application/pdf',
      lastModified: Date.now(),
    });
    
    // Verify file is selected
    cy.contains(fileName).should('exist');
    
    // Process document
    cy.contains('button', 'Process Document').click();
    
    // Wait for processing
    cy.contains('Processing...', { timeout: 10000 }).should('not.exist');
    
    // Verify checklist is loaded
    cy.contains('Analysis Results').should('exist');
  });

  it('should show audit checklist after processing', () => {
    cy.contains('Upload Audit').click();
    
    const currentDate = new Date().toISOString().split('T')[0];
    
    cy.get('#vesselName').type('MV Test Vessel');
    cy.get('#auditDate').type(currentDate);
    cy.get('#auditType').parent().click();
    cy.contains('External Audit').click();
    
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('test content'),
      fileName: 'audit.pdf',
      mimeType: 'application/pdf',
      lastModified: Date.now(),
    });
    
    cy.contains('button', 'Process Document').click();
    
    // Verify non-conformities are displayed
    cy.contains('Analysis Results', { timeout: 10000 }).should('exist');
    cy.contains('Safety Management').should('exist');
  });

  it('should display list of audits', () => {
    cy.contains('Audits').click();
    
    cy.contains('MV Oceanic').should('exist');
    cy.contains('MV Atlantic').should('exist');
  });

  it('should display vessel history', () => {
    cy.contains('Vessel History').click();
    
    cy.contains('MV Oceanic').should('exist');
    cy.contains('audits').should('exist');
  });

  it('should display audit reports and statistics', () => {
    cy.contains('Reports').click();
    
    cy.contains('Audit Statistics').should('exist');
    cy.contains('Total Audits').should('exist');
    cy.contains('Non-Conformities').should('exist');
    cy.contains('Compliance Rate').should('exist');
  });

  it('should export audit report', () => {
    cy.contains('Reports').click();
    cy.contains('Export Full Report').should('exist');
  });
});
