import { test, expect } from "@playwright/test";

test.describe("MLC Inspection Module E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the MLC inspection page
    await page.goto("/mlc-inspection");
  });

  test("should display MLC Inspection Dashboard", async ({ page }) => {
    // Check for main heading
    await expect(page.getByRole("heading", { name: /MLC Inspection Dashboard/i })).toBeVisible();
    
    // Check for dashboard description
    await expect(page.getByText(/Maritime Labour Convention 2006/i)).toBeVisible();
    
    // Check for statistics cards
    await expect(page.getByText(/Total Inspections/i)).toBeVisible();
    await expect(page.getByText(/Avg. Compliance/i)).toBeVisible();
    await expect(page.getByText(/Critical Findings/i)).toBeVisible();
  });

  test("should show New Inspection button", async ({ page }) => {
    const newInspectionButton = page.getByRole("button", { name: /New Inspection/i });
    await expect(newInspectionButton).toBeVisible();
  });

  test("should show AI Assistant button", async ({ page }) => {
    const aiAssistantButton = page.getByRole("button", { name: /AI Assistant/i });
    await expect(aiAssistantButton).toBeVisible();
  });

  test("should display tabs for different sections", async ({ page }) => {
    // Check for all main tabs
    await expect(page.getByRole("tab", { name: /Overview/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Checklist/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Evidence/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /AI Assistant/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Reports/i })).toBeVisible();
  });

  test("should open Create Inspection dialog when clicking New Inspection", async ({ page }) => {
    const newInspectionButton = page.getByRole("button", { name: /New Inspection/i });
    await newInspectionButton.click();
    
    // Wait for dialog to appear
    await page.waitForTimeout(500);
    
    // Check for dialog title
    await expect(page.getByText(/Create New MLC Inspection/i)).toBeVisible();
    
    // Check for required form fields
    await expect(page.getByLabel(/Vessel ID/i)).toBeVisible();
    await expect(page.getByLabel(/Inspector Name/i)).toBeVisible();
    await expect(page.getByLabel(/Inspection Type/i)).toBeVisible();
  });

  test("should switch to AI Assistant tab", async ({ page }) => {
    const aiTab = page.getByRole("tab", { name: /AI Assistant/i });
    await aiTab.click();
    
    // Wait for content to load
    await page.waitForTimeout(500);
    
    // Check for chatbot interface
    await expect(page.getByText(/MLC Compliance AI Assistant/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Ask about MLC regulations/i)).toBeVisible();
  });

  test("should display empty state when no inspection is selected for checklist", async ({ page }) => {
    const checklistTab = page.getByRole("tab", { name: /Checklist/i });
    await checklistTab.click();
    
    // Wait for content to load
    await page.waitForTimeout(500);
    
    // Should show empty state message
    await expect(page.getByText(/Select an inspection to view the checklist/i)).toBeVisible();
  });

  test("should display empty state when no inspection is selected for evidence", async ({ page }) => {
    const evidenceTab = page.getByRole("tab", { name: /Evidence/i });
    await evidenceTab.click();
    
    // Wait for content to load
    await page.waitForTimeout(500);
    
    // Should show empty state message
    await expect(page.getByText(/Select an inspection to upload evidence/i)).toBeVisible();
  });

  test("should display reports section", async ({ page }) => {
    const reportsTab = page.getByRole("tab", { name: /Reports/i });
    await reportsTab.click();
    
    // Wait for content to load
    await page.waitForTimeout(500);
    
    // Check for reports content
    await expect(page.getByText(/Inspection Reports/i)).toBeVisible();
    await expect(page.getByText(/Generate and export MLC inspection reports/i)).toBeVisible();
  });

  test("should validate form fields in Create Inspection dialog", async ({ page }) => {
    const newInspectionButton = page.getByRole("button", { name: /New Inspection/i });
    await newInspectionButton.click();
    
    // Wait for dialog
    await page.waitForTimeout(500);
    
    // Try to submit without filling required fields
    const createButton = page.getByRole("button", { name: /Create Inspection/i });
    await createButton.click();
    
    // Should show validation (browser native or custom)
    // The form should not close if validation fails
    await page.waitForTimeout(500);
    await expect(page.getByText(/Create New MLC Inspection/i)).toBeVisible();
  });

  test("should be able to cancel Create Inspection dialog", async ({ page }) => {
    const newInspectionButton = page.getByRole("button", { name: /New Inspection/i });
    await newInspectionButton.click();
    
    // Wait for dialog
    await page.waitForTimeout(500);
    
    const cancelButton = page.getByRole("button", { name: /Cancel/i });
    await cancelButton.click();
    
    // Dialog should close
    await page.waitForTimeout(500);
    await expect(page.getByText(/Create New MLC Inspection/i)).not.toBeVisible();
  });

  test("should display overview tab content", async ({ page }) => {
    // Overview tab should be active by default
    const overviewTab = page.getByRole("tab", { name: /Overview/i });
    await expect(overviewTab).toHaveAttribute("data-state", "active");
  });
});

test.describe("MLC Inspection AI Chatbot", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/mlc-inspection");
    
    // Switch to AI Assistant tab
    const aiTab = page.getByRole("tab", { name: /AI Assistant/i });
    await aiTab.click();
    await page.waitForTimeout(500);
  });

  test("should display AI chatbot interface", async ({ page }) => {
    await expect(page.getByText(/MLC Compliance AI Assistant/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Ask about MLC regulations/i)).toBeVisible();
  });

  test("should have send button for messages", async ({ page }) => {
    const sendButton = page.getByRole("button").filter({ has: page.locator("svg") }).last();
    await expect(sendButton).toBeVisible();
  });

  test("should show welcome message", async ({ page }) => {
    // Check for initial AI greeting
    await expect(page.getByText(/Ask me anything about Maritime Labour Convention/i)).toBeVisible();
  });
});
