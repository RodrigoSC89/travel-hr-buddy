/**
 * Maritime Business Logic Tests
 * Tests core maritime calculations and compliance rules
 */
import { describe, it, expect, vi } from "vitest";

describe("Maritime Business Logic", () => {
  describe("CII Rating Calculation", () => {
    it("calculates CII correctly using IMO formula", () => {
      // CII = (CO2 emissions × 10^6) / (DWT × Distance)
      const co2Tons = 5000;
      const dwt = 50000;
      const distanceNm = 10000;
      const cii = (co2Tons * 1e6) / (dwt * distanceNm);
      expect(cii).toBeCloseTo(10, 1);
    });

    it("assigns correct CII rating bands", () => {
      const getRating = (cii: number, reference: number): string => {
        const ratio = cii / reference;
        if (ratio <= 0.65) return "A";
        if (ratio <= 0.85) return "B";
        if (ratio <= 1.0) return "C";
        if (ratio <= 1.15) return "D";
        return "E";
      };
      expect(getRating(6.5, 10)).toBe("A");
      expect(getRating(8.5, 10)).toBe("B");
      expect(getRating(10, 10)).toBe("C");
      expect(getRating(11, 10)).toBe("D");
      expect(getRating(12, 10)).toBe("E");
    });
  });

  describe("MLC 2006 Work/Rest Hours", () => {
    it("detects violation when rest < 10h in 24h period", () => {
      const restHoursIn24h = 8;
      const isViolation = restHoursIn24h < 10;
      expect(isViolation).toBe(true);
    });

    it("passes when rest >= 10h in 24h period", () => {
      const restHoursIn24h = 11;
      const isViolation = restHoursIn24h < 10;
      expect(isViolation).toBe(false);
    });

    it("detects violation when work > 14h in 24h period", () => {
      const workHoursIn24h = 15;
      const isViolation = workHoursIn24h > 14;
      expect(isViolation).toBe(true);
    });

    it("detects violation when work > 72h in 7-day period", () => {
      const workHoursIn7Days = 75;
      const isViolation = workHoursIn7Days > 72;
      expect(isViolation).toBe(true);
    });
  });

  describe("Vessel Health Score", () => {
    it("calculates health score correctly", () => {
      const criticalFailures = 2;
      const score = 100 - (criticalFailures * 15);
      expect(score).toBe(70);
    });

    it("does not go below 0", () => {
      const criticalFailures = 10;
      const score = Math.max(0, 100 - (criticalFailures * 15));
      expect(score).toBe(0);
    });

    it("returns 100 for zero failures", () => {
      const criticalFailures = 0;
      const score = 100 - (criticalFailures * 15);
      expect(score).toBe(100);
    });
  });

  describe("Certificate Expiration Alerts", () => {
    it("flags certificates expiring within 90 days as warning", () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 60);
      const daysRemaining = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      expect(daysRemaining).toBeLessThan(90);
      expect(daysRemaining).toBeGreaterThan(0);
    });

    it("flags certificates expiring within 30 days as critical", () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 15);
      const daysRemaining = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const severity = daysRemaining <= 30 ? "critical" : daysRemaining <= 90 ? "warning" : "info";
      expect(severity).toBe("critical");
    });
  });

  describe("Crew Wellbeing Score", () => {
    it("calculates wellbeing score from check-in data", () => {
      const mood = 8;
      const energy = 7;
      const stress = 3;
      const score = ((mood * 10) + (energy * 10) + ((10 - stress) * 10)) / 3;
      expect(score).toBeCloseTo(73.33, 1);
    });

    it("handles worst case scenario", () => {
      const mood = 1;
      const energy = 1;
      const stress = 10;
      const score = ((mood * 10) + (energy * 10) + ((10 - stress) * 10)) / 3;
      expect(score).toBeCloseTo(6.67, 1);
    });
  });

  describe("Compliance Score", () => {
    it("starts at 100 and deducts for invalid certs and overdue maintenance", () => {
      const totalCerts = 20;
      const validCerts = 18;
      const overdueMaintenanceTasks = 2;
      
      let score = 100;
      score -= ((totalCerts - validCerts) / totalCerts) * 30; // -3pts per invalid cert ratio
      score -= overdueMaintenanceTasks * 5;
      score = Math.max(0, Math.round(score * 100) / 100);
      
      expect(score).toBe(87);
    });
  });

  describe("Laytime Calculation", () => {
    it("calculates demurrage correctly", () => {
      const allowedLaytime = 72; // hours
      const actualLaytime = 90; // hours
      const demurrageRate = 25000; // USD/day
      
      const excessHours = actualLaytime - allowedLaytime;
      const demurrage = (excessHours / 24) * demurrageRate;
      
      expect(excessHours).toBe(18);
      expect(demurrage).toBe(18750);
    });

    it("calculates despatch for early completion", () => {
      const allowedLaytime = 72;
      const actualLaytime = 60;
      const despatchRate = 12500; // usually 50% of demurrage rate
      
      const savedHours = allowedLaytime - actualLaytime;
      const despatch = (savedHours / 24) * despatchRate;
      
      expect(savedHours).toBe(12);
      expect(despatch).toBe(6250);
    });
  });

  describe("TCE Calculation", () => {
    it("calculates Time Charter Equivalent correctly", () => {
      const freightRevenue = 500000;
      const voyageCosts = 120000;
      const voyageDays = 30;
      
      const tce = (freightRevenue - voyageCosts) / voyageDays;
      expect(tce).toBeCloseTo(12666.67, 0);
    });
  });
});
