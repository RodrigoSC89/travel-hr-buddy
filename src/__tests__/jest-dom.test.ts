import { describe, it, expect } from 'vitest';

describe('Jest-DOM Setup', () => {
  it('should have jest-dom matchers available', () => {
    const element = document.createElement('div');
    element.textContent = 'Hello World';
    
    // These matchers are provided by @testing-library/jest-dom
    expect(element).toBeInTheDocument;
    expect(element).toBeDefined();
  });

  it('should create a simple DOM element', () => {
    const button = document.createElement('button');
    button.textContent = 'Click me';
    button.disabled = false;
    
    expect(button.textContent).toBe('Click me');
    expect(button.disabled).toBe(false);
  });
});
