/**
 * Unit Tests for Button Component
 * Tests all button variants, states, and interactions
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should render with correct tag', () => {
      render(<Button>Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render as a different element with asChild', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      expect(screen.getByRole('link')).toHaveAttribute('href', '/test');
    });
  });

  describe('Variants', () => {
    it('should apply default variant classes', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });

    it('should apply destructive variant classes', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive');
    });

    it('should apply outline variant classes', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border');
    });

    it('should apply ghost variant classes', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('should apply link variant classes', () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-primary');
    });
  });

  describe('Sizes', () => {
    it('should apply default size classes', () => {
      render(<Button>Default Size</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'px-4');
    });

    it('should apply small size classes', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9');
    });

    it('should apply large size classes', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11');
    });

    it('should apply icon size classes', () => {
      render(<Button size="icon">🔥</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'w-10');
    });
  });

  describe('Interactions', () => {
    it('should call onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      
      fireEvent.click(screen.getByText('Click'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      
      fireEvent.click(screen.getByText('Disabled'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should handle multiple clicks', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Multi Click</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should apply disabled styles', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    it('should accept custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('should merge custom className with default classes', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('inline-flex'); // Base class
    });
  });

  describe('Accessibility', () => {
    it('should have correct role', () => {
      render(<Button>Accessible</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<Button aria-label="Close dialog">X</Button>);
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });

    it('should support aria-disabled', () => {
      render(<Button aria-disabled="true">Aria Disabled</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('should be focusable', () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should not be focusable when disabled', () => {
      render(<Button disabled>Not Focusable</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Form Integration', () => {
    it('should default to type button', () => {
      render(<Button>Default Type</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('should allow type submit', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('should allow type reset', () => {
      render(<Button type="reset">Reset</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });
  });
});
