import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TrainingModuleService } from '../services/training-module'

// Mock Supabase
vi.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => 
        Promise.resolve({ 
          data: { 
            session: { 
              access_token: 'test-token',
              user: { id: 'test-user-id' }
            } 
          } 
        })
      ),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null
          })),
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      }))
    }))
  }
}))

describe('TrainingModuleService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateTrainingModule', () => {
    it('should require authentication', async () => {
      // Mock no session
      vi.mocked((await import('../services/supabase')).supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null
      } as any)

      await expect(
        TrainingModuleService.generateTrainingModule({
          gapDetected: 'Test gap',
          normReference: 'IMCA M220'
        })
      ).rejects.toThrow('Usuário não autenticado')
    })
  })

  describe('getActiveModules', () => {
    it('should be defined', () => {
      expect(TrainingModuleService.getActiveModules).toBeDefined()
    })
  })

  describe('recordCompletion', () => {
    it('should require authentication', async () => {
      // Mock no session
      vi.mocked((await import('../services/supabase')).supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null
      } as any)

      await expect(
        TrainingModuleService.recordCompletion('module-id', [0, 1, 2])
      ).rejects.toThrow('Usuário não autenticado')
    })
  })

  describe('exportAuditBundle', () => {
    it('should require authentication', async () => {
      // Mock no session
      vi.mocked((await import('../services/supabase')).supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null
      } as any)

      await expect(
        TrainingModuleService.exportAuditBundle({
          vesselName: 'Test Vessel',
          norms: ['IMCA M220']
        })
      ).rejects.toThrow('Usuário não autenticado')
    })
  })
})
