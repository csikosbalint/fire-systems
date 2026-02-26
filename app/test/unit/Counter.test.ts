import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Counter } from '../../src/interactors/Counter.js'
import { CounterEvent } from '../../src/ports/ICounter.js'
import type { IEventBus } from '../../src/shared/IEventBus.js'
import { createMockEventBus } from '../helpers/mocks.js'

describe('Counter Interactor', () => {
  let counter: Counter
  let mockEventBus: IEventBus

  beforeEach(() => {
    mockEventBus = createMockEventBus()
    counter = new Counter(mockEventBus)
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
    counter.subscribe(CounterEvent.UPDATE, callback)

    expect(mockEventBus.subscribe).toHaveBeenCalledWith('Counter::update', callback)
  })

  it('should use injected EventBus via dependency injection', () => {
    const customEventBus = createMockEventBus()

    const customCounter = new Counter(customEventBus)
    customCounter.increment()

    expect(customEventBus.publish).toHaveBeenCalled()
    expect(mockEventBus.publish).not.toHaveBeenCalled()
  })

  it('should maintain separate state for different instances', () => {
    const mockEventBus2 = createMockEventBus()
    const counter2 = new Counter(mockEventBus2)

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
