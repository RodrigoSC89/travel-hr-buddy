import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WelcomeCard } from '../welcome-card';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/use-permissions';
import { BrowserRouter } from 'react-router-dom';

// Mock the hooks and contexts
jest.mock('@/contexts/AuthContext');
jest.mock('@/hooks/use-permissions');
jest.mock('@/components/auth/user-profile-badge', () => ({
  UserProfileBadge: () => <div data-testid="user-profile-badge">User Badge</div>,
}));
jest.mock('@/components/auth/role-based-access', () => ({
  RoleBasedAccess: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUsePermissions = usePermissions as jest.MockedFunction<typeof usePermissions>;

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('WelcomeCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    mockUseAuth.mockReturnValue({
      user: {
        id: '123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
      } as any,
      session: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn(),
      resetPassword: jest.fn(),
      isLoading: false,
    });
    
    mockUsePermissions.mockReturnValue({
      userRole: 'employee' as any,
      permissions: [],
      isLoading: false,
      getRoleDisplayName: jest.fn(() => 'Usuário'),
      hasPermission: jest.fn(),
      canAccessModule: jest.fn(),
    });
  });

  it('renders without crashing', () => {
    renderWithRouter(<WelcomeCard />);
    expect(screen.getByText(/Test User/)).toBeInTheDocument();
  });

  it('displays correct greeting based on user name', () => {
    renderWithRouter(<WelcomeCard />);
    const greeting = screen.getByText(/Bom dia|Boa tarde|Boa noite/);
    expect(greeting).toBeInTheDocument();
    expect(greeting.textContent).toContain('Test User');
  });

  it('displays user role information', () => {
    mockUsePermissions.mockReturnValue({
      userRole: 'admin' as any,
      permissions: [],
      isLoading: false,
      getRoleDisplayName: jest.fn(() => 'Administrador'),
      hasPermission: jest.fn(),
      canAccessModule: jest.fn(),
    });

    renderWithRouter(<WelcomeCard />);
    expect(screen.getByText(/Você está logado como Administrador/)).toBeInTheDocument();
  });

  it('shows admin actions for admin users', () => {
    mockUsePermissions.mockReturnValue({
      userRole: 'admin' as any,
      permissions: [],
      isLoading: false,
      getRoleDisplayName: jest.fn(() => 'Administrador'),
      hasPermission: jest.fn(),
      canAccessModule: jest.fn(),
    });

    renderWithRouter(<WelcomeCard />);
    expect(screen.getByText('Gerenciar Usuários')).toBeInTheDocument();
  });

  it('shows HR actions for hr_manager users', () => {
    mockUsePermissions.mockReturnValue({
      userRole: 'hr_manager' as any,
      permissions: [],
      isLoading: false,
      getRoleDisplayName: jest.fn(() => 'Gerente de RH'),
      hasPermission: jest.fn(),
      canAccessModule: jest.fn(),
    });

    renderWithRouter(<WelcomeCard />);
    expect(screen.getByText('Relatórios de RH')).toBeInTheDocument();
  });

  it('displays UserProfileBadge component', () => {
    renderWithRouter(<WelcomeCard />);
    expect(screen.getByTestId('user-profile-badge')).toBeInTheDocument();
  });

  it('renders analytics action for all users', () => {
    renderWithRouter(<WelcomeCard />);
    expect(screen.getByText('Ver Analytics')).toBeInTheDocument();
  });

  it('renders settings action for all users', () => {
    renderWithRouter(<WelcomeCard />);
    expect(screen.getByText('Configurações')).toBeInTheDocument();
  });

  it('uses email username when full_name is not available', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '123',
        email: 'john.doe@example.com',
        user_metadata: {},
      } as any,
      session: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn(),
      resetPassword: jest.fn(),
      isLoading: false,
    });

    renderWithRouter(<WelcomeCard />);
    expect(screen.getByText(/john.doe/)).toBeInTheDocument();
  });
});
