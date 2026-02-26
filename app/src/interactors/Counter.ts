import { CounterEvent, type ICounter } from '../ports/ICounter.js'
import type { IEventBus } from '../shared/IEventBus.js'

export class Counter implements ICounter {
  private namespace = 'Counter'
  private count: number = 0
  
  constructor(private eventBus: IEventBus) {}
  
  increment(): void {
    this.count += 1
    this.eventBus.publish(`${this.namespace}::${CounterEvent.UPDATE}`, this.count)
  }
  
  getCount(): number {
    return this.count
  }
  
  subscribe(event: CounterEvent, callback: (data: unknown) => void): void {
    this.eventBus.subscribe(`${this.namespace}::${event}`, callback)
  }
}