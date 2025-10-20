/**
 * Tests for safeLazyImport utility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { safeLazyImport } from '@/utils/safeLazyImport';
import React from 'react';

describe('safeLazyImport', () => {
  it('should show loading state initially', () => {
    const TestComponent = () => <div>Test Component</div>;
    const LazyComponent = safeLazyImport(
      () => Promise.resolve({ default: TestComponent }),
      'TestComponent'
    );

    render(<LazyComponent />);
    
    expect(screen.getByText(/Carregando TestComponent/i)).toBeInTheDocument();
  });

  it('should render component after loading', async () => {
    const TestComponent = () => <div>Test Component Loaded</div>;
    const LazyComponent = safeLazyImport(
      () => Promise.resolve({ default: TestComponent }),
      'TestComponent'
    );

    render(<LazyComponent />);
    
    await waitFor(() => {
      expect(screen.getByText(/Test Component Loaded/i)).toBeInTheDocument();
    });
  });

  it('should show error message on load failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const LazyComponent = safeLazyImport(
      () => Promise.reject(new Error('Module not found')),
      'FailingComponent'
    );

    render(<LazyComponent />);
    
    await waitFor(() => {
      expect(screen.getByText(/Falha ao carregar o módulo/i)).toBeInTheDocument();
      expect(screen.getByText(/FailingComponent/i)).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });

  it('should provide reload button on error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const LazyComponent = safeLazyImport(
      () => Promise.reject(new Error('Load failed')),
      'FailingComponent'
    );

    render(<LazyComponent />);
    
    await waitFor(() => {
      const reloadButton = screen.getByRole('button', { name: /Atualizar página/i });
      expect(reloadButton).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });

  it('should pass props to loaded component', async () => {
    const TestComponent = ({ message }: { message: string }) => <div>{message}</div>;
    const LazyComponent = safeLazyImport(
      () => Promise.resolve({ default: TestComponent }),
      'TestComponent'
    );

    render(<LazyComponent message="Hello World" />);
    
    await waitFor(() => {
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });

  it('should have accessible loading state', () => {
    const TestComponent = () => <div>Test</div>;
    const LazyComponent = safeLazyImport(
      () => new Promise(() => {}), // Never resolves
      'TestComponent'
    );

    render(<LazyComponent />);
    
    const loadingElement = screen.getByRole('status');
    expect(loadingElement).toHaveAttribute('aria-live', 'polite');
  });

  it('should have accessible error state', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const LazyComponent = safeLazyImport(
      () => Promise.reject(new Error('Failed')),
      'TestComponent'
    );

    render(<LazyComponent />);
    
    await waitFor(() => {
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveAttribute('aria-live', 'assertive');
    });
    
    consoleSpy.mockRestore();
  });
});
