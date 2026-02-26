# Test Suite

This directory contains comprehensive tests for the Counter interactor following hexagonal architecture principles.

## Test Structure

```
test/
├── unit/              # Unit tests for interactors
│   └── Counter.test.ts
├── integration/       # Integration tests (future)
├── e2e/              # End-to-end tests (future)
└── helpers/          # Test utilities and mocks
    └── mocks.ts
```

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Generate coverage report
npm run test:coverage

# Run with UI
npm run test:ui
```

## Test Coverage

Current coverage for Counter interactor:
- **Statements**: 100%
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%
- **Test Cases**: 6 focused tests covering all essential functionality

## Test Cases

The Counter interactor has 6 essential test cases:

1. **Initialization** - Verifies counter starts at 0
2. **Increment with Events** - Tests increment functionality and event publishing with correct namespace
3. **Subscriptions** - Validates event subscription with namespace encapsulation
4. **Dependency Injection** - Ensures injected EventBus is properly used
5. **State Isolation** - Confirms separate instances maintain independent state
6. **Query Behavior** - Verifies getCount() doesn't modify state

## Mocking Strategy

We use Vitest's built-in mocking capabilities:

```typescript
const mockEventBus: IEventBus = {
  publish: vi.fn(),
  subscribe: vi.fn(),
}
```

Helper functions are available in `test/helpers/mocks.ts`:
- `createMockEventBus()` - Creates a simple mock
- `createSpyEventBus()` - Creates a spy that executes real logic

## Writing New Tests

When adding tests for a new interactor:

1. Create a new test file: `test/unit/YourInteractor.test.ts`
2. Focus on **6 or fewer** essential test cases
3. Use the mock helpers from `test/helpers/mocks.ts`
4. Aim for 80%+ code coverage
5. Cover: initialization, actions, events, subscriptions, DI, and state

Example template:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { YourInteractor } from '../../src/interactors/YourInteractor.js'
import { createMockEventBus } from '../helpers/mocks.js'

describe('YourInteractor', () => {
  let interactor: YourInteractor
  let mockEventBus: IEventBus

  beforeEach(() => {
    mockEventBus = createMockEventBus()
    interactor = new YourInteractor(mockEventBus)
  })

  it('should initialize with correct state', () => {
    expect(interactor.getState()).toBeDefined()
  })

  it('should perform action and publish event', () => {
    interactor.doSomething()
    expect(mockEventBus.publish).toHaveBeenCalled()
  })

  // Add 4 more focused tests covering essential behavior
})
```

## Best Practices

- ✅ Keep tests focused—aim for **6 or fewer** major test cases per interactor
- ✅ Use descriptive test names that explain behavior
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ Test one thing per test
- ✅ Mock external dependencies via DI
- ✅ Use beforeEach for common setup
- ✅ Test critical paths: initialization, actions, events, subscriptions, DI
- ✅ Aim for high coverage (80%+) with minimal tests
- ✅ Keep tests isolated and independent
- ✅ Combine related assertions in single tests for efficiency

## CI/CD Integration

Tests run automatically in CI/CD pipeline. Ensure all tests pass before merging.

Coverage reports are generated and can be viewed in the `coverage/` directory after running `npm run test:coverage`.
