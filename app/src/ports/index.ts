import type { MySharpe } from '@entities/MySharpe.js'
import { Counter } from '../interactors/Counter.js'
import getContainer from '@shared/Container.js'

//export event names
export {
    CounterEventNames,
    MySharpeEventNames,
    HistoricalDataEventNames,
    SearchEventNames,
    EnrichmentNames,
    EnrichmentEventNames,
} from './events.js'
// export types
export type {
    HistoricalData,
    Enrichments
} from './types.js'

const container = getContainer()
// export ports
const useCounterPort = () => {
    // using interactor(s)
    const counter = container.resolve('counter') as Counter
    return {
        counter: counter.getCount(),
        increment: counter.increment.bind(counter),
        subscribe: counter.subscribe.bind(counter),

    }
}
const mySharpePort = () => {
    const mySharpe = container.resolve('mySharpe') as MySharpe
    return {
        augment: mySharpe.augment.bind(mySharpe),
        subscribe: mySharpe.subscribe.bind(mySharpe),
    }
}

export {
    useCounterPort,
    mySharpePort,
}