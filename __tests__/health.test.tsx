// __tests__/health.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SystemHealthCheck } from '@/components/testing/system-health-check'

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ 
        data: { session: { user: { id: 'test-user' } } },
        error: null 
      }))
    }
  }
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}))

describe('Health Check', () => {
  it('carrega a tela de validação do sistema', () => {
    render(<SystemHealthCheck />)
    expect(screen.getByText(/Verificação de Saúde do Sistema/i)).toBeInTheDocument()
  })
})
