import { CounterEventNames } from '../ports/events.js'
import type { CounterEvent } from '../ports/types.js'
import type { IEventBus } from '../shared/IEventBus.js'
import type { Logger } from '../shared/Logger.js'

export class Counter {
  private namespace = 'Counter'
  private eventBus: IEventBus
  private count: number = 0
  private logger: Logger
  
  constructor({ eventBus, logger }: { eventBus: IEventBus, logger: Logger }) {
    this.eventBus = eventBus
    this.logger = logger

    this.logger.info('Counter initialized')
  }
  
  increment(): void {
    this.count += 1
    this.eventBus.publish(`${this.namespace}::${CounterEventNames.UPDATE}`, this.count)
  }
  
  getCount(): number {
    return this.count
  }
  
  subscribe(event: CounterEvent, callback: (data: unknown) => void): void {
    this.eventBus.subscribe(`${this.namespace}::${event}`, callback)
  }
}