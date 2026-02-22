import { describe, expect, it, vi } from 'vitest'
import Registry from './../src/plugin-adapters/registry'

describe('Registry', () => {
    it('publishes data to subscribers', () => {
        const registry = new Registry()
        const handler = vi.fn()

        registry.subscribe({ event: 'price:update', callback: handler })
        registry.publish({ event: 'price:update', data: { symbol: 'ABC', price: 42 } })

        expect(handler).toHaveBeenCalledTimes(1)
        expect(handler).toHaveBeenCalledWith({ symbol: 'ABC', price: 42 })
    })

    it('supports multiple subscribers for the same event', () => {
        const registry = new Registry()
        const first = vi.fn()
        const second = vi.fn()

        registry.subscribe({ event: 'alert', callback: first })
        registry.subscribe({ event: 'alert', callback: second })
        registry.publish({ event: 'alert', data: 'fire' })

        expect(first).toHaveBeenCalledTimes(1)
        expect(second).toHaveBeenCalledTimes(1)
    })
})
