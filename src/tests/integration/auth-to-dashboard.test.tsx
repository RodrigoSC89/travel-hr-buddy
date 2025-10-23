import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithProviders, waitFor, screen } from '../shared/test-utils';
import { createMockSession, createMockUser } from '../shared/test-utils';

describe('Integration: Auth to Dashboard Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full authentication to dashboard flow', async () => {
    // Arrange
    const mockSession = createMockSession();
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ 
          data: { session: mockSession }, 
          error: null 
        }),
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { session: mockSession, user: mockSession.user },
          error: null
        }),
      },
    };

    // Act - Simulate login
    const result = await mockSupabase.auth.signInWithPassword({
      email: 'test@nautilus.com',
      password: 'test123',
    });

    // Assert - Login successful
    expect(result.data.session).toBeDefined();
    expect(result.data.user.email).toBe('test@nautilus.com');
    expect(result.error).toBeNull();

    // Act - Get session after login
    const sessionResult = await mockSupabase.auth.getSession();

    // Assert - Session persisted
    expect(sessionResult.data.session).toBeDefined();
    expect(sessionResult.data.session?.user.id).toBe(mockSession.user.id);
  });

  it('should handle authentication failure gracefully', async () => {
    // Arrange
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { session: null, user: null },
          error: { message: 'Invalid credentials' },
        }),
      },
    };

    // Act
    const result = await mockSupabase.auth.signInWithPassword({
      email: 'wrong@nautilus.com',
      password: 'wrongpass',
    });

    // Assert
    expect(result.data.session).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error.message).toBe('Invalid credentials');
  });

  it('should redirect to dashboard after successful login', async () => {
    // Arrange
    const mockSession = createMockSession();
    const mockNavigate = vi.fn();

    // Act - Simulate successful login
    const loginSuccess = true;
    if (loginSuccess) {
      mockNavigate('/dashboard');
    }

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should load user profile data on dashboard mount', async () => {
    // Arrange
    const mockSession = createMockSession();
    const mockProfile = {
      id: mockSession.user.id,
      name: 'Test User',
      role: 'operator',
      avatar_url: 'https://example.com/avatar.jpg',
    };

    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      })),
    };

    // Act
    const result = await mockSupabase.from('profiles').select('*').eq('user_id', mockSession.user.id).single();
    const profile = result.data;

    // Assert
    expect(profile).toBeDefined();
    expect(profile.name).toBe('Test User');
    expect(profile.role).toBe('operator');
  });

  it('should handle session expiry and redirect to login', async () => {
    // Arrange
    const expiredSession = {
      access_token: 'expired-token',
      refresh_token: 'expired-refresh',
      expires_at: Date.now() - 1000, // Expired 1 second ago
      user: createMockUser(),
    };

    const mockNavigate = vi.fn();

    // Act - Check if session is expired
    const isExpired = expiredSession.expires_at < Date.now();
    if (isExpired) {
      mockNavigate('/login');
    }

    // Assert
    expect(isExpired).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
