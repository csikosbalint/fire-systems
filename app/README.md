# Fire App - Core Application

A TypeScript-based core application using **Hexagonal Architecture (Ports & Adapters)** pattern for building scalable, testable, and maintainable business logic.

## Architecture Overview

This application follows the **Hexagonal Architecture** (also known as Ports & Adapters) pattern, which ensures:
- ✅ **Clean separation** between business logic and infrastructure
- ✅ **Dependency Injection** for testability
- ✅ **DRY principle** through shared contracts
- ✅ **Plugin extensibility** for external adapters (UI, databases, APIs)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    External Adapters                        │
│  (Plugins: UI, Databases, APIs, Message Queues)             │
│              ↓ consumes                                      │
│         ┌─────────────────┐                                  │
│         │  Ports (API)    │  ← Incoming port interfaces     │
│         └─────────────────┘                                  │
│              ↓                                                │
│         ┌─────────────────┐                                  │
│         │  Interactors    │  ← Business logic                │
│         └─────────────────┘                                  │
│              ↓ uses                                           │
│         ┌─────────────────┐                                  │
│         │  Shared/Infra   │  ← EventBus, Storage, etc.       │
│         └─────────────────┘                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
src/
├── ports/                    # Incoming port interfaces (contracts)
│   ├── ICounter.ts          # Counter port interface
│   ├── ISharpe.ts           # Sharpe port interface
│   └── index.ts             # Bootstrap & exports
│
├── interactors/              # Business logic (use cases)
│   ├── Counter.ts           # Counter implementation
│   └── Sharpe.ts            # Sharpe implementation
│
├── shared/                   # Infrastructure adapters
│   ├── IEventBus.ts         # EventBus interface
│   ├── EventBus.ts          # EventBus implementation
│   └── ...
│
├── entities/                 # Domain entities (data structures)
│   └── ...
│
└── index.ts                  # Public API exports
```

---

## Core Concepts

### 1. **Ports** (Interfaces)

Ports define **how the core exposes its functionality** to external adapters.

```typescript
// src/ports/ICounter.ts
export interface ICounter {
  increment(): void;
  reset(): void;
  getCount(): number;
  subscribe(event: CounterEvent, callback: (data: unknown) => void): void;
}
```

**Key principles:**
- Port interfaces are the **contract** between core and external world
- Define incoming operations (commands/queries)
- Type-safe event subscriptions
- No implementation details leak out

### 2. **Interactors** (Business Logic)

Interactors implement the ports and contain all business rules.

```typescript
// src/interactors/Counter.ts
export class Counter implements ICounter {
  private namespace = 'Counter'
  private count: number = 0
  
  constructor(private eventBus: IEventBus) {}
  
  increment(): void {
    this.count += 1
    this.eventBus.publish(`${this.namespace}::${CounterEvent.UPDATE}`, this.count)
  }
  
  // ... rest of implementation
}
```

**Key principles:**
- Receive dependencies via **constructor injection**
- Contain all domain logic and business rules
- Publish events for state changes
- Event namespace stays **internal** (not exposed to consumers)

### 3. **Shared Infrastructure**

Shared adapters provide infrastructure capabilities (event bus, storage, etc.)

```typescript
// src/shared/EventBus.ts
export class EventBus implements IEventBus {
  private events: { [key: string]: ((payload: unknown) => void)[] } = {}
  
  subscribe(event: string, callback: (data: unknown) => void): void {
    if (!this.events[event]) this.events[event] = []
    this.events[event].push(callback)
  }
  
  publish(event: string, data: unknown): void {
    this.events[event]?.forEach(callback => callback(data))
  }
}
```

**Key principles:**
- **Single shared instance** of EventBus across all interactors
- Implements interface for testability
- Not directly exposed to external consumers

### 4. **Event-Driven Communication**

Events enable loose coupling between interactors and external adapters.

```typescript
// Interactor publishes events
this.eventBus.publish('Counter::update', this.count)

// External adapter subscribes via port
counter.subscribe(CounterEvent.UPDATE, (count) => {
  // React to updates
})
```

**Key principles:**
- Event names use **namespace prefixing** (`Counter::update`)
- Event enums provide type safety
- Internal event names never leak to consumers
- One EventBus instance shared across all interactors

---

## Dependency Injection Pattern

### Constructor Injection

All dependencies are injected via constructors:

```typescript
export class Counter implements ICounter {
  constructor(
    private eventBus: IEventBus,      // Required
    private logger?: ILogger           // Optional
  ) {}
}
```

### Bootstrap (Assembly)

Dependencies are wired together in `ports/index.ts`:

```typescript
// src/ports/index.ts
import { Counter } from '../interactors/Counter.js'
import { EventBus } from '../shared/EventBus.js'

// Single shared EventBus instance
const eventBus = new EventBus()

// Create interactor instances
export const counter = new Counter(eventBus)
export const sharpe = new Sharpe(eventBus)

// Export types and enums
export type { ICounter }
export { CounterEvent }
```

**Benefits:**
- Easy to mock dependencies in tests
- Clear dependency graph
- Single responsibility for composition

---

## Event Naming Convention

### Internal Event Namespace

```typescript
// Inside interactor
private namespace = 'Counter'
this.eventBus.publish(`${this.namespace}::${CounterEvent.UPDATE}`, data)
// Actual event: "Counter::update"
```

### External Event Enum

```typescript
// src/ports/ICounter.ts
export enum CounterEvent {
  UPDATE = 'update',
  RESET = 'reset',
}

// External adapter usage
counter.subscribe(CounterEvent.UPDATE, callback)
// ✅ Type-safe, no magic strings
```

**Benefits:**
- ✅ Internal namespace (`Counter::`) stays private
- ✅ External consumers use type-safe enums
- ✅ Can refactor internal event names without breaking consumers

---

## Testing Strategy

### Unit Testing (Interactors)

```typescript
// Mock dependencies
const mockEventBus: IEventBus = {
  publish: vi.fn(),
  subscribe: vi.fn(),
}

const counter = new Counter(mockEventBus)

// Test business logic
counter.increment()
expect(counter.getCount()).toBe(1)
expect(mockEventBus.publish).toHaveBeenCalledWith('Counter::update', 1)
```

### Integration Testing (Agent Communication)

```typescript
const eventBus = new EventBus()
const counter = new Counter(eventBus)
const sharpe = new Sharpe(eventBus)

// Setup listeners
sharpe.listenToCounter()

// Trigger action
counter.increment()

// Verify cross-agent communication
expect(sharpe.lastCalculation).toBeDefined()
```

---

## Usage in External Adapters

### React Plugin Example

```tsx
// plugins/ui/sharpe/app/adapters/Counter.tsx
import { counter, CounterEvent } from 'fire-app/ports'

export function useCounterAdapter() {
  const [counterValue, setCounterValue] = useState(0)
  
  useEffect(() => {
    counter.subscribe(CounterEvent.UPDATE, (data) => {
      setCounterValue(data as number)
    })
  }, [])
  
  return {
    useController: () => ({
      increment: () => counter.increment()
    }),
    usePresenter: () => ({
      counter: counterValue,
      tooBig: counterValue > 5
    })
  }
}
```

**Key principles:**
- Import only from `fire-app/ports` (public API)
- Never import from `interactors/` or `shared/` directly
- Use TypeScript types from ports

---

## Package Exports

```json
// package.json
{
  "exports": {
    ".": {
      "default": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./ports": {
      "default": "./dist/ports/index.js",
      "types": "./dist/ports/index.d.ts"
    }
  }
}
```

External consumers use:
```typescript
import { add } from 'fire-app'               // Core utilities
import { counter } from 'fire-app/ports'     // Ports & interactors
```

---

## Design Principles Applied

### ✅ DRY (Don't Repeat Yourself)
- Single EventBus instance
- Event enums defined once
- Shared infrastructure adapters
- Port interfaces as single source of truth

### ✅ SOLID Principles
- **S**ingle Responsibility: Each interactor has one purpose
- **O**pen/Closed: Add new interactors without modifying existing ones
- **L**iskov Substitution: Mock implementations can replace real ones
- **I**nterface Segregation: Ports define minimal required contracts
- **D**ependency Inversion: Depend on abstractions (IEventBus), not concretions

### ✅ Hexagonal Architecture
- Core business logic isolated from infrastructure
- Ports define boundaries
- External adapters consume ports
- Easy to swap implementations (EventBus → Kafka, etc.)

### ✅ Testability
- Constructor injection enables mocking
- No global state
- Clear dependency boundaries
- Easy to write unit and integration tests

---

## Adding New Features

### 1. Define the Port

```typescript
// src/ports/INewFeature.ts
export interface INewFeature {
  doSomething(): void;
  subscribe(event: NewFeatureEvent, callback: (data: unknown) => void): void;
}

export enum NewFeatureEvent {
  DONE = 'done',
}
```

### 2. Implement the Interactor

```typescript
// src/interactors/NewFeature.ts
export class NewFeature implements INewFeature {
  private namespace = 'NewFeature'
  
  constructor(private eventBus: IEventBus) {}
  
  doSomething(): void {
    // Business logic here
    this.eventBus.publish(`${this.namespace}::${NewFeatureEvent.DONE}`, data)
  }
  
  subscribe(event: NewFeatureEvent, callback: (data: unknown) => void): void {
    this.eventBus.subscribe(`${this.namespace}::${event}`, callback)
  }
}
```

### 3. Bootstrap & Export

```typescript
// src/ports/index.ts
export const newFeature = new NewFeature(eventBus)
export type { INewFeature }
export { NewFeatureEvent }
```

### 4. Test

```typescript
// test/NewFeature.test.ts
const mockEventBus = { publish: vi.fn(), subscribe: vi.fn() }
const feature = new NewFeature(mockEventBus)

feature.doSomething()
expect(mockEventBus.publish).toHaveBeenCalled()
```

---

## Commands

```bash
# Build
npm run build

# Lint
npm run lint

# Test (when configured)
npm run test
```

---

## Contributing

When adding new features:
1. ✅ Define port interface first
2. ✅ Implement interactor with business logic
3. ✅ Use dependency injection for all dependencies
4. ✅ Use event enums (no magic strings)
5. ✅ Keep event namespaces internal
6. ✅ Write unit tests with mocked dependencies
7. ✅ Export through `ports/index.ts`
8. ✅ Update this README

---

## Architecture Benefits

| Benefit | How It's Achieved |
|---------|-------------------|
| **Testability** | Constructor injection + interface abstractions |
| **Maintainability** | Clear separation of concerns, single responsibility |
| **Scalability** | Add new interactors without modifying existing code |
| **Flexibility** | Swap infrastructure (EventBus → Kafka) without touching core |
| **Plugin Architecture** | External adapters consume clean port interfaces |
| **DRY Compliance** | Shared EventBus, centralized event definitions |
| **Type Safety** | TypeScript interfaces + enums throughout |

---

## License

ISC

## Author

Balint Csikos
