# Fire App — Core Business Logic

A TypeScript library that fetches historical stock price data and computes **Sharpe Ratios** for financial tickers. It is consumed by the `sharpe` Next.js UI plugin in the same monorepo.

## Architecture

The project follows **Clean Architecture** (Ports & Adapters / Hexagonal Architecture):

```
src/
├── entities/       — Pure domain computation (no I/O)
├── interactors/    — Use-case orchestrators
├── ports/          — Public API surface (IoC container factories)
│   └── server/     — Server-only ports (network I/O)
└── shared/         — Infrastructure: DI container, EventBus, Logger
```

**Dependency rule:** `entities` → `ports/types` only. `interactors` → `entities` + `shared`. `ports` → everything.

**IoC:** [Awilix](https://github.com/jeffijoe/awilix) manages singletons (`eventBus`, `logger`, `validator`, `counter`, `mySharpe`). Server ports additionally register `quoteRetriever` and `tickerSearch`.

**Events:** An in-memory `EventBus` (pub/sub) is injected into every class. Events are namespaced as `ClassName::eventName` (e.g. `MySharpe::completed`, `Counter::update`).

## Key classes

### Entities

| Class | Responsibility |
|---|---|
| `Transformer` | Static methods that mutate `HistoricalData[]` in-place: `addProfits`, `addDeviationOfProfits`, `calculateDeviation` (sample std-dev, ÷ n−1), `addSharpeRatio` |
| `Validator` | `hasEnoughData({ what, data, lookback })` — guards the pipeline (e.g. `data.length >= 2 * lookback` for `'sharpe'`) |
| `MySharpe` | Orchestrates the full enrichment pipeline: validates → addProfits → addDeviationOfProfits → addSharpeRatio → publishes `MySharpe::completed` |
| `QuoteRetriever` | Fetches OHLCV data from Yahoo Finance, maps to `HistoricalData[]`, publishes `QuoteRetriever::completed` |

### Interactors

| Class | Responsibility |
|---|---|
| `Counter` | Simple increment counter; publishes `Counter::update` (reference/scaffold) |
| `TickerSearch` | Searches Yahoo Finance by keyword; publishes `TickerSearch::found` |

### Ports (public API)

```typescript
// Client-safe (src/ports/index.ts)
useCounterPort()  → { counter, increment(), subscribe() }
mySharpePort()    → { augment(), subscribe() }

// Server-only (src/ports/server/index.ts)
historicalDataPort() → { retrieve(), subscribe() }
tickerSearchPort()   → { search(), subscribe() }
```

### Data types (`src/ports/types.ts`)

```typescript
type HistoricalData = {
  date: string;
  close: number;
  profit?: number;
  deviationOfProfit?: number;
  sharpeRatio?: number;
};
```

## Development

```bash
npm run dev     # watch mode
npm run build   # compile to dist/
npm run test    # unit + integration tests (Vitest)
npm run lint    # ESLint
```

## Tests

| File | Covers |
|---|---|
| `test/unit/Counter.test.ts` | `Counter` — init, increment, events |
| `test/unit/entities/Transformer.test.ts` | `addProfits`, `calculateDeviation` (vs known values), `addSharpeRatio` |
| `test/unit/entities/Validator.test.ts` | `Validator.hasEnoughData` boundary conditions |
| `test/unit/interactors/MySharpe.test.ts` | `MySharpe.augment` — Sharpe values verified for lookback=250 and lookback=125 against fixture data |
| `test/integration/ports.test.ts` | `useCounterPort`, `mySharpePort`, `historicalDataPort` (live Yahoo Finance) |

Test helpers in `test/helpers/mocks.ts` provide `createMockLogger()`, `createMockEventBus()`, and `createSpyEventBus()`.
Fixtures in `test/fixtures/` supply reference historical data for verified Sharpe calculations.
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
