import { Counter } from '../interactors/Counter.js'
import { EventBus } from '../shared/EventBus.js'
import type { ICounter } from './ICounter.js'
import { CounterEvent } from './ICounter.js'

const eventBus = new EventBus()
export type{
    ICounter,
}

export {
    CounterEvent,
}

export const counter = new Counter(eventBus)