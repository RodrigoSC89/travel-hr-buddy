// __tests__/templates.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TemplatesPage from '@/pages/admin/templates'

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user' } },
        error: null 
      })
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null
        }))
      }))
    })),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { content: 'Conteúdo gerado' }, error: null })
    }
  }
}))

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
  useToast: () => ({ toast: vi.fn() })
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}))

describe('TemplatesPage', () => {
  it('deve renderizar o título', () => {
    render(<TemplatesPage />)
    expect(screen.getByText(/Templates com IA/i)).toBeInTheDocument()
  })
})
