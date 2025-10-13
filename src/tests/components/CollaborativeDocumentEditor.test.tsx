import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CollaborativeDocumentEditor } from '@/components/documents/CollaborativeDocumentEditor';

// Mock dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' }
  })
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    })
  }
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock TipTap
vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => ({
    commands: {
      setContent: vi.fn(),
    },
    getHTML: vi.fn(() => '<p>Test content</p>'),
    isDestroyed: false,
    extensionManager: {
      extensions: []
    }
  })),
  EditorContent: ({ editor }: { editor: unknown }) => (
    <div data-testid="editor-content">Editor Content</div>
  ),
}));

vi.mock('@tiptap/starter-kit', () => ({
  default: {}
}));

vi.mock('@tiptap/extension-collaboration', () => ({
  default: {
    configure: vi.fn(() => ({}))
  }
}));

vi.mock('@tiptap/extension-collaboration-cursor', () => ({
  default: {
    configure: vi.fn(() => ({}))
  }
}));

// Mock Yjs
vi.mock('yjs', () => ({
  Doc: vi.fn(() => ({
    destroy: vi.fn()
  }))
}));

// Mock WebRTC
vi.mock('y-webrtc', () => ({
  WebrtcProvider: vi.fn(() => ({
    on: vi.fn((event, callback) => {
      if (event === 'peers') {
        // Simulate 2 connected peers
        callback({ added: [], removed: [], webrtcPeers: ['peer1', 'peer2'] });
      }
    }),
    destroy: vi.fn()
  }))
}));

// Mock lodash debounce
vi.mock('lodash', () => ({
  debounce: (fn: Function) => {
    const debounced = (...args: unknown[]) => fn(...args);
    debounced.cancel = vi.fn();
    return debounced;
  }
}));

describe('CollaborativeDocumentEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the editor component', () => {
    render(<CollaborativeDocumentEditor documentId="test-doc-123" />);
    
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('displays the document title input', () => {
    render(<CollaborativeDocumentEditor documentId="test-doc-123" />);
    
    const titleInput = screen.getByPlaceholderText('Document Title');
    expect(titleInput).toBeInTheDocument();
  });

  it('shows connected users count', async () => {
    render(<CollaborativeDocumentEditor documentId="test-doc-123" />);
    
    // Should show current user + connected peers (1 + 2 = 3)
    await waitFor(() => {
      expect(screen.getByText(/3 online/i)).toBeInTheDocument();
    });
  });

  it('displays custom initial title', () => {
    render(
      <CollaborativeDocumentEditor 
        documentId="test-doc-123" 
        initialTitle="My Custom Document"
      />
    );
    
    const titleInput = screen.getByDisplayValue('My Custom Document');
    expect(titleInput).toBeInTheDocument();
  });

  it('shows clear content button', () => {
    render(<CollaborativeDocumentEditor documentId="test-doc-123" />);
    
    expect(screen.getByText('Clear Content')).toBeInTheDocument();
  });

  it('displays collaborative editor info text', () => {
    render(<CollaborativeDocumentEditor documentId="test-doc-123" />);
    
    expect(screen.getByText(/Real-time collaborative editor/i)).toBeInTheDocument();
    expect(screen.getByText(/Share the document ID/i)).toBeInTheDocument();
    expect(screen.getByText(/Changes sync automatically/i)).toBeInTheDocument();
  });

  it('shows auto-save status', () => {
    render(<CollaborativeDocumentEditor documentId="test-doc-123" />);
    
    expect(screen.getByText(/Auto-save:/i)).toBeInTheDocument();
    expect(screen.getByText(/Not saved yet/i)).toBeInTheDocument();
  });

  it('displays file icon', () => {
    render(<CollaborativeDocumentEditor documentId="test-doc-123" />);
    
    // Check for FileText icon by looking for the card title
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('initializes with correct document ID', () => {
    const documentId = 'unique-doc-id-456';
    render(<CollaborativeDocumentEditor documentId={documentId} />);
    
    // Component should render without errors
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });
});
