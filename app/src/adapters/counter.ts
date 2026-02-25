import Registry from './registry.js'

export default class Counter extends Registry {
    private count: number
    constructor() {
        super()
        this.count = 0
    }
    increment() {
        this.count += 1
        super.publish({ event: 'Counter::counterUpdated', data: this.count })
    }
    getCount() {
        return this.count
    }
}