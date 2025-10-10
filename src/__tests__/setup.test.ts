import { describe, it, expect } from 'vitest';

describe('Vitest Setup', () => {
  it('should run a basic test', () => {
    expect(true).toBe(true);
  });

  it('should have access to globals', () => {
    expect(describe).toBeDefined();
    expect(it).toBeDefined();
    expect(expect).toBeDefined();
  });
});
