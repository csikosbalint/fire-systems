import { vi } from 'vitest'
import type { IEventBus } from '../../src/shared/IEventBus.js'

/**
 * Creates a mock Logger for testing
 */
export function createMockLogger() {
  return {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }
}

/**
 * Creates a mock EventBus for testing
 */
export function createMockEventBus(): IEventBus {
  return {
    publish: vi.fn(),
    subscribe: vi.fn(),
  }
}

/**
 * Creates a spy EventBus that tracks calls but executes real logic
 */
export function createSpyEventBus(): IEventBus {
  const events = new Map<string, Array<(data: unknown) => void>>()

  return {
    publish: vi.fn((event: string, data: unknown) => {
      const callbacks = events.get(event) || []
      callbacks.forEach(callback => callback(data))
    }),
    subscribe: vi.fn((event: string, callback: (data: unknown) => void) => {
      if (!events.has(event)) {
        events.set(event, [])
      }
      events.get(event)?.push(callback)
    }),
  }
}