/**
 * PATCH_25.5 Usage Examples
 * 
 * This file demonstrates how to use ErrorGuard and SchemaHarmonizer
 * in real-world scenarios.
 */

// ============================================
// Example 1: Basic ErrorGuard Usage
// ============================================

import React from "react";
import { ErrorGuard } from "@/lib/core/ErrorGuard";

// Wrap any component that might throw errors
export const SafeComponent = () => {
  return (
    <ErrorGuard>
      <RiskyComponent />
    </ErrorGuard>
  );
};

// ============================================
// Example 2: SchemaHarmonizer with Supabase
// ============================================

import { harmonizeSchema } from "@/lib/ai/SchemaHarmonizer";
import { supabase } from "@/lib/supabase";

interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
}

export const fetchUsersExample = async () => {
  // Fetch data from Supabase
  const { data, error } = await supabase
    .from("users")
    .select("*");

  if (error) throw error;

  // Harmonize schema to convert null/undefined to safe values
  const safeUsers = harmonizeSchema<User>(data || []);
  
  // Now safeUsers will have empty strings instead of null
  // email: null -> email: ""
  // phone: undefined -> phone: ""
  
  return safeUsers;
};

// ============================================
// Example 3: Nested ErrorGuards
// ============================================

export const DashboardExample = () => {
  return (
    <ErrorGuard>
      <div className="dashboard">
        <Header />
        
        {/* Each section can have its own error boundary */}
        <ErrorGuard>
          <DataVisualization />
        </ErrorGuard>
        
        <ErrorGuard>
          <UserList />
        </ErrorGuard>
        
        <ErrorGuard>
          <Statistics />
        </ErrorGuard>
      </div>
    </ErrorGuard>
  );
};

// ============================================
// Example 4: Complex Nested Objects
// ============================================

interface ComplexData {
  id: number;
  user: {
    name: string;
    profile: {
      bio: string | null;
      avatar: string | null;
    } | null;
  };
  metadata: {
    created_at: string;
    tags: string[];
  };
}

export const fetchComplexDataExample = async () => {
  const { data } = await supabase
    .from("complex_table")
    .select("*");

  // SchemaHarmonizer handles nested objects recursively
  const safeData = harmonizeSchema<ComplexData>(data || []);
  
  // All nested null/undefined values are converted to ""
  // user.profile.bio: null -> user.profile.bio: ""
  // user.profile.avatar: null -> user.profile.avatar: ""
  
  return safeData;
};

// ============================================
// Example 5: React Component with Both
// ============================================

import { useState, useEffect } from "react";

export const UserListComponent = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*");

        if (error) throw error;

        // Harmonize data before setting state
        const safeUsers = harmonizeSchema<User>(data || []);
        setUsers(safeUsers);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ErrorGuard>
      <div className="user-list">
        {users.map((user) => (
          <div key={user.id}>
            <h3>{user.name}</h3>
            {/* Safe to use - never null/undefined */}
            <p>Email: {user.email}</p>
            <p>Phone: {user.phone}</p>
          </div>
        ))}
      </div>
    </ErrorGuard>
  );
};

// ============================================
// Example 6: Form Data Normalization
// ============================================

export const normalizeFormDataExample = (formData: any[]) => {
  // Ensure all form data has safe default values
  const safeFormData = harmonizeSchema(formData);
  
  // No more null/undefined errors in form handling
  return safeFormData.map((field) => ({
    ...field,
    value: field.value || "", // Already harmonized
    error: field.error || "",
    placeholder: field.placeholder || "Enter value",
  }));
};

// ============================================
// Example 7: API Response Handling
// ============================================

export const handleApiResponseExample = async (endpoint: string) => {
  const { data, error } = await supabase
    .from(endpoint)
    .select("*");

  if (error) throw error;

  // Always harmonize API responses before using
  return harmonizeSchema(data || []);
};

// ============================================
// Example 8: Custom Error Recovery
// ============================================

interface CustomErrorGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class CustomErrorGuard extends React.Component<CustomErrorGuardProps> {
  state = { hasError: false, error: null as any };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error("Error caught:", error, info);
    // You can also send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Usage:
// <CustomErrorGuard fallback={<MyCustomErrorUI />}>
//   <App />
// </CustomErrorGuard>

// ============================================
// Example 9: Type-Safe Array Harmonization
// ============================================

interface Product {
  id: number;
  name: string;
  price: number | null;
  description: string | null;
  tags: string[];
}

export const fetchProductsExample = async () => {
  const { data } = await supabase
    .from("products")
    .select("*");

  const safeProducts = harmonizeSchema<Product>(data || []);
  
  // Arrays are preserved as-is
  // Null/undefined scalar values become ""
  return safeProducts.map((product) => ({
    ...product,
    // price: null -> price: "" (need to handle separately for numbers)
    // description: null -> description: ""
    // tags: [...] -> tags: [...] (preserved)
  }));
};

// ============================================
// Example 10: Testing ErrorGuard
// ============================================

import { render, screen } from "@testing-library/react";

const BrokenComponent = () => {
  throw new Error("This component is broken!");
};

export const testErrorGuardExample = () => {
  const { container } = render(
    <ErrorGuard>
      <BrokenComponent />
    </ErrorGuard>
  );

  // ErrorGuard should catch the error and show fallback UI
  expect(container.textContent).toContain("Falha de módulo detectada");
};

// ============================================
// Best Practices
// ============================================

/**
 * 1. Always wrap your app root with ErrorGuard
 * 2. Use SchemaHarmonizer immediately after fetching from Supabase
 * 3. Consider nested ErrorGuards for independent sections
 * 4. Test components with intentional errors
 * 5. Monitor error logs for patterns
 * 6. Don't rely on harmonized data for critical business logic validation
 * 7. Use TypeScript to catch type errors at compile time
 * 8. Combine with proper error handling (try/catch)
 */
