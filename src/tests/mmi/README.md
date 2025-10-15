# MMI Test Suite

## Overview

This directory contains comprehensive unit tests for the MMI (Módulo de Manutenção Inteligente / Intelligent Maintenance Module). The test suite validates core business logic, data validation, and integration points.

## Test Files

### 1. create-job.test.ts (19 tests)
Tests for job creation functionality including:
- Field validation (title, description, status, priority)
- Enum validation for status and priority fields
- Date handling and validation
- Component relationships
- Error scenarios
- Edge cases

### 2. postpone-analysis.test.ts (23 tests)
Tests for AI-powered postponement analysis including:
- Risk assessment logic
- Impact analysis
- Confidence scoring
- Priority-based decision making
- Maritime compliance considerations
- Edge cases and validation
- Historical data analysis

### 3. create-os.test.ts (31 tests)
Tests for work order (OS) creation including:
- OS number generation (OS-YYYYNNNN format)
- Status lifecycle management
- Parts tracking and inventory
- Cost calculation
- Assignment and authorization
- Documentation requirements
- Completion workflows

## Running Tests

### Run all MMI tests:
```bash
npm test src/tests/mmi
```

### Run specific test file:
```bash
npm test src/tests/mmi/create-job.test.ts
```

### Run with coverage:
```bash
npm run test:coverage -- src/tests/mmi
```

### Watch mode:
```bash
npm run test:watch src/tests/mmi
```

## Test Structure

Each test file follows a consistent structure:

```typescript
describe('Feature Name', () => {
  describe('Specific Functionality', () => {
    it('should do something specific', () => {
      // Arrange
      const input = {...};
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toEqual(expectedOutput);
    });
  });
});
```

## Test Coverage Goals

- **Unit Tests**: 100% coverage of business logic functions
- **Integration Tests**: Key workflows and data flows
- **E2E Tests**: Critical user journeys (planned for Phase 2)

## Test Data

Test files use mock data that represents realistic scenarios:
- Various priority levels (critical, high, medium, low)
- Different component states (operational, maintenance, failed)
- Multiple vessel types and configurations
- Historical job data for similarity testing
- Edge cases and boundary conditions

## Mocking Strategy

Tests use Vitest's built-in mocking capabilities:
- Database calls are mocked to avoid external dependencies
- API responses are simulated for predictable testing
- Time-dependent functions use fixed dates for consistency

## Best Practices

1. **Arrange-Act-Assert**: Follow AAA pattern for clarity
2. **Single Responsibility**: Each test validates one thing
3. **Descriptive Names**: Test names clearly state what is being tested
4. **Independent Tests**: No dependencies between tests
5. **Fast Execution**: Tests should run quickly (<1s each)
6. **Maintainable**: Easy to update when requirements change

## Continuous Integration

These tests are automatically run on:
- Every commit to the repository
- Pull request creation and updates
- Before deployment to production

## Future Enhancements

Planned test additions:
- Integration tests for hourometer edge function (24 tests)
- E2E tests for copilot chat interactions (26 tests)
- E2E tests for critical job alert system (34 tests)
- Performance tests for vector similarity search
- Load tests for concurrent user scenarios

## Support

For questions or issues with the test suite, contact the development team or refer to the main MMI documentation in `mmi_readme.md`.

---

**Last Updated**: 2025-10-15  
**Test Framework**: Vitest  
**Coverage Target**: 95%+
