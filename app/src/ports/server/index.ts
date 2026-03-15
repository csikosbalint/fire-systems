import getContainer from '@shared/Container.js'
import { asClass, Lifetime } from 'awilix'
import { QuoteRetriever } from '@entities/QuoteRetriever.js'
import { TickerSearch } from '@interactors/TickerSearch.js'


const container = getContainer()
container.register({
    quoteRetriever: asClass(QuoteRetriever, { lifetime: Lifetime.SINGLETON }),
    tickerSearch: asClass(TickerSearch, { lifetime: Lifetime.SINGLETON }),
})
// export ports
const historicalDataPort = () => {
    const quoteRetriever = container.resolve('quoteRetriever') as QuoteRetriever
    return {
        retrieve: quoteRetriever.retrieve.bind(quoteRetriever),
        subscribe: quoteRetriever.subscribe.bind(quoteRetriever),
    }
}

const tickerSearchPort = () => {
    const tickerSearch = container.resolve('tickerSearch') as TickerSearch
    return {
        search: tickerSearch.search.bind(tickerSearch),
        subscribe: tickerSearch.subscribe.bind(tickerSearch),
    }
}

export {
    historicalDataPort,
    tickerSearchPort,
}