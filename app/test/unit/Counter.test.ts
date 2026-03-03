import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Counter } from '../../src/interactors/Counter.js'
import { CounterEventNames } from '../../src/ports/events.js'
import type { IEventBus } from '../../src/shared/IEventBus.js'
import { createMockEventBus } from '../helpers/mocks.js'

describe('Counter Interactor', () => {
  let counter: Counter
  let mockEventBus: IEventBus
  let mockLogger: { info: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    mockEventBus = createMockEventBus()
    mockLogger = { info: vi.fn() }
    counter = new Counter({ eventBus: mockEventBus, logger: mockLogger as never })
  })

  it('should initialize with count of 0', () => {
    expect(counter.getCount()).toBe(0)
  })

  it('should increment count and publish UPDATE event with correct namespace', () => {
    counter.increment()
    counter.increment()
    counter.increment()

    expect(counter.getCount()).toBe(3)
    expect(mockEventBus.publish).toHaveBeenCalledTimes(3)
    expect(mockEventBus.publish).toHaveBeenLastCalledWith('Counter::update', 3)
  })

  it('should register subscriptions with correct namespace', () => {
    const callback = vi.fn()
    counter.subscribe(CounterEventNames.UPDATE, callback)

    expect(mockEventBus.subscribe).toHaveBeenCalledWith('Counter::update', callback)
  })

  it('should use injected EventBus via dependency injection', () => {
    const customEventBus = createMockEventBus()

    const customCounter = new Counter({ eventBus: customEventBus, logger: mockLogger as never })
    customCounter.increment()

    expect(customEventBus.publish).toHaveBeenCalled()
    expect(mockEventBus.publish).not.toHaveBeenCalled()
  })

  it('should maintain separate state for different instances', () => {
    const mockEventBus2 = createMockEventBus()
    const counter2 = new Counter({ eventBus: mockEventBus2, logger: mockLogger as never })

    counter.increment()
    counter.increment()
    counter2.increment()

    expect(counter.getCount()).toBe(2)
    expect(counter2.getCount()).toBe(1)
  })

  it('should return current count without modifying state', () => {
    counter.increment()
    const count1 = counter.getCount()
    const count2 = counter.getCount()

    expect(count1).toBe(1)
    expect(count1).toBe(count2)
  })
})
