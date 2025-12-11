/**
 * Authentication Test Fixtures - FASE 3
 * Dados de teste para fluxos de autenticação
 */

export const testUsers = {
  valid: {
    email: process.env.TEST_USER_EMAIL || 'test@nautilus.com',
    password: process.env.TEST_USER_PASSWORD || 'Test@123456',
    name: 'Test User',
    role: 'user'
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@nautilus.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'Admin@123456',
    name: 'Admin User',
    role: 'admin'
  },
  invalid: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
    name: 'Invalid User',
    role: 'user'
  },
  emptyEmail: {
    email: '',
    password: 'Test@123456',
    name: 'Empty Email',
    role: 'user'
  },
  emptyPassword: {
    email: 'test@nautilus.com',
    password: '',
    name: 'Empty Password',
    role: 'user'
  },
  invalidEmailFormat: {
    email: 'not-an-email',
    password: 'Test@123456',
    name: 'Invalid Format',
    role: 'user'
  },
  weakPassword: {
    email: 'test@nautilus.com',
    password: '123',
    name: 'Weak Password',
    role: 'user'
  }
};

export const authEndpoints = {
  login: '/auth/login',
  signup: '/auth/signup',
  logout: '/auth/logout',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  profile: '/profile'
};

export const authMessages = {
  loginSuccess: /sucesso|success|bem-vindo|welcome/i,
  loginFailed: /erro|error|credenciais|credentials|inválid/i,
  logoutSuccess: /logout|desconectado|signed out/i,
  emailRequired: /email.*obrigatório|email.*required/i,
  passwordRequired: /senha.*obrigatório|password.*required/i,
  invalidEmail: /email.*inválido|invalid.*email/i,
  weakPassword: /senha.*fraca|weak.*password|senha.*curta/i,
  passwordResetSent: /email.*enviado|email.*sent|recuperação|reset/i
};

export const sessionTokens = {
  validToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  expiredToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxNjAwMDAwMDAwfQ.expired',
  invalidToken: 'invalid.token.here'
};
