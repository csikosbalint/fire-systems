import { asClass, createContainer, InjectionMode, Lifetime } from 'awilix'
import { Counter } from '../interactors/Counter.js'
import { EventBus } from '../shared/EventBus.js'
import { Validator } from '../entities/Validator.js'
import { Logger } from '../shared/Logger.js'
import { CounterEventNames, HistoricalDataEventNames, MySharpeEventNames, SearchEventNames } from './events.js'
import MySharpeFactory from '../interactors/MySharpeFactory.js'
import type { HistoricalData } from './types.js'
import { HistoricalDataRetriever } from '@entities/HistoricalDataRetriever.js'
import { TickerSearch } from '@interactors/TickerSearch.js'

export {
    CounterEventNames,
    MySharpeEventNames,
    HistoricalDataEventNames,
    SearchEventNames,
}

const container = createContainer({
    injectionMode: InjectionMode.PROXY,
    strict: true,
})
container.register({
    // shared
    eventBus: asClass(EventBus, { lifetime: Lifetime.SINGLETON }),
    logger: asClass(Logger, { lifetime: Lifetime.SINGLETON }),
    // entities
    validator: asClass(Validator, { lifetime: Lifetime.SINGLETON }),
    // interactors
    counter: asClass(Counter, { lifetime: Lifetime.SINGLETON }),
    mySharpeFactory: asClass(MySharpeFactory, { lifetime: Lifetime.SINGLETON }),
    historicalDataRetriever: asClass(HistoricalDataRetriever, { lifetime: Lifetime.SINGLETON }),
    tickerSearch: asClass(TickerSearch, { lifetime: Lifetime.SINGLETON }),
})
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
const useMySharpePort = ({ ticker, data, lookback }: { ticker: string, data: HistoricalData[], lookback: number }) => {
    // using interactor(s)
    const mySharpeFactory = container.resolve('mySharpeFactory') as MySharpeFactory
    let mySharpe
    let mySharpeError
    try {
        mySharpe = mySharpeFactory.create({ ticker, data: data, lookback })
    } catch (error) {
        mySharpeError = error
    }
    return {
        mySharpe,
        mySharpeError
    }
}

const useHistoricalDataRetrieverPort = (): { retriever?: HistoricalDataRetriever, retrieverError?: unknown } => {
    const historicalDataRetriever = container.resolve('historicalDataRetriever') as HistoricalDataRetriever
    let retriever: HistoricalDataRetriever | undefined = historicalDataRetriever
    return {
        retriever,
    }
}

const useTickerSearchPort = () => {
    const tickerSearch = container.resolve('tickerSearch') as TickerSearch
    return {
        searchTicker: tickerSearch.search.bind(tickerSearch),
        subscribe: tickerSearch.subscribe.bind(tickerSearch),
    }
}

export {
    useCounterPort,
    useMySharpePort,
    useHistoricalDataRetrieverPort,
    useTickerSearchPort,
}