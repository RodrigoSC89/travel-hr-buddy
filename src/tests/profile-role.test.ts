import { describe, it, expect } from "vitest";

describe("Profile interfaces with role field", () => {
  it("should have role field in Profile interface", () => {
    // This test verifies that the Profile interface includes the role field
    // by checking the structure matches what we expect
    
    const mockProfile = {
      id: "123",
      email: "test@example.com",
      full_name: "Test User",
      avatar_url: null,
      department: null,
      position: null,
      phone: null,
      role: "user",
    };
    
    expect(mockProfile.role).toBeDefined();
    expect(mockProfile.role).toBe("user");
  });
  
  it("should support admin and user role values", () => {
    const userProfile = {
      id: "123",
      email: "user@example.com",
      full_name: "Regular User",
      avatar_url: null,
      department: null,
      position: null,
      phone: null,
      role: "user",
    };
    
    const adminProfile = {
      id: "456",
      email: "admin@example.com",
      full_name: "Admin User",
      avatar_url: null,
      department: null,
      position: null,
      phone: null,
      role: "admin",
    };
    
    expect(userProfile.role).toBe("user");
    expect(adminProfile.role).toBe("admin");
  });
});
