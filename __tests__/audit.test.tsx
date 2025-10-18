// __tests__/audit.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DashboardAuditorias from '@/pages/admin/dashboard-auditorias'

// Mock dependencies
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}))

describe('Página de Auditoria Técnica', () => {
  it('exibe o título principal', () => {
    render(<DashboardAuditorias />)
    expect(screen.getByText(/Resumo de Auditorias/i)).toBeInTheDocument()
  })
})
