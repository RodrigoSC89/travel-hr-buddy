/// <reference types="cypress" />

/**
 * PATCH 608: Travel Intelligence E2E Tests
 * Tests for flight/hotel search and AI recommendations
 */

describe("Travel Intelligence Module", () => {
  beforeEach(() => {
    cy.visit("/travel-intelligence");
  });

  it("should display the Travel Intelligence page", () => {
    cy.contains("Travel Intelligence").should("exist");
    cy.contains("PATCH 608").should("exist");
  });

  it("should search for flights", () => {
    // Click on Flights tab
    cy.contains("Flights").click();
    
    // Use future date for testing
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateString = futureDate.toISOString().split("T")[0];
    
    // Fill in search form
    cy.get("#origin").type("GRU");
    cy.get("#destination").type("GIG");
    cy.get("#departureDate").type(dateString);
    cy.get("#passengers").clear().type("2");
    
    // Submit search
    cy.contains("button", "Search Flights").click();
    
    // Wait for results
    cy.contains("Searching...", { timeout: 3000 }).should("not.exist");
    cy.contains("Search Results").should("exist");
    
    // Verify flight results appear
    cy.contains("LATAM").should("exist");
  });

  it("should search for hotels", () => {
    // Click on Hotels tab
    cy.contains("Hotels").click();
    
    // Use future dates for testing
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 30);
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 35);
    
    // Fill in hotel search
    cy.get("#hotelDestination").type("Rio de Janeiro");
    cy.get("#checkIn").type(checkInDate.toISOString().split("T")[0]);
    cy.get("#checkOut").type(checkOutDate.toISOString().split("T")[0]);
    
    // Submit search
    cy.contains("button", "Search Hotels").click();
    
    // Verify results
    cy.contains("Searching...", { timeout: 3000 }).should("not.exist");
  });

  it("should generate AI recommendations", () => {
    // Click on AI Recommendations tab
    cy.contains("AI Recommendations").click();
    
    // Enter preferences
    cy.get("textarea").type("I want a beach destination with diving in Brazil");
    
    // Generate recommendations
    cy.contains("button", "Generate AI Recommendations").click();
    
    // Wait for AI processing
    cy.contains("Generating Recommendations...", { timeout: 5000 }).should("not.exist");
    cy.contains("Your Personalized Recommendations").should("exist");
  });

  it("should display booking history", () => {
    // Click on History tab
    cy.contains("History").click();
    
    cy.contains("Booking History").should("exist");
  });

  it("should display favorites", () => {
    // Click on Favorites tab
    cy.contains("Favorites").click();
    
    cy.contains("Your Favorites").should("exist");
  });

  it("should add flight to favorites", () => {
    cy.contains("Flights").click();
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateString = futureDate.toISOString().split("T")[0];
    
    cy.get("#origin").type("GRU");
    cy.get("#destination").type("GIG");
    cy.get("#departureDate").type(dateString);
    cy.contains("button", "Search Flights").click();
    
    // Wait for results and add to favorites
    cy.contains("Search Results", { timeout: 3000 }).should("exist");
    cy.get("button").contains("Star").first().click();
    
    // Verify toast notification
    cy.contains("Added to Favorites").should("exist");
  });

  it("should open airline deep link", () => {
    cy.contains("Flights").click();
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateString = futureDate.toISOString().split("T")[0];
    
    cy.get("#origin").type("GRU");
    cy.get("#destination").type("GIG");
    cy.get("#departureDate").type(dateString);
    cy.contains("button", "Search Flights").click();
    
    cy.contains("Search Results", { timeout: 3000 }).should("exist");
    
    // Stub window.open to prevent actual navigation in test
    cy.window().then((win) => {
      cy.stub(win, "open").as("windowOpen");
    });
    
    cy.contains("button", "Book Now").first().click();
    cy.get("@windowOpen").should("be.called");
  });
});
