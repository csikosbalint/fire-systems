import { HistoricalDataEventNames } from '@ports/events.js'
import type { HistoricalData, HistoricalDataEvent } from '@ports/types.js'
import type { IEventBus } from '@shared/IEventBus.js'
import type { Logger } from '@shared/Logger.js'
import YahooFinance from 'yahoo-finance2'
import type { SearchResult } from 'yahoo-finance2/modules/search'

export class HistoricalDataRetriever {
    private namespace = 'HistoricalDataRetriever'
    private eventBus: IEventBus
    private logger: Logger
    private yahooFinance: InstanceType<typeof YahooFinance>

    constructor(
        { eventBus, logger}: { eventBus: IEventBus, logger: Logger}
    ) {
        this.eventBus = eventBus
        this.logger = logger
        this.yahooFinance = new YahooFinance()
    }

    async retrieve({startDate, endDate, ticker }: { startDate: Date, endDate: Date, ticker: string }): Promise<HistoricalData[] | void> {
        const result =  this.yahooFinance.chart(ticker, {
            period1: startDate,
            period2: endDate,
            interval: '1d',
        })
        return result.then((data) => {
            const historicalData: HistoricalData[] = data.quotes.map((quote) => ({
            date: quote.date.toISOString().split('T')[0],
            close: quote.close,
        } as HistoricalData))
            this.eventBus.publish(`${this.namespace}::${HistoricalDataEventNames.COMPLETED}`, { data: historicalData })
            return historicalData as HistoricalData[]
        })
        .catch((error) => {
            this.eventBus.publish(`${this.namespace}::${HistoricalDataEventNames.ERROR}`, { error: error.message })
            this.logger.error(`${this.namespace} - Error retrieving historical data for ticker ${ticker}: ${error.message}`)
        })
    }

    async search( keyword: string ): Promise<HistoricalData[] | void> {
        return this.yahooFinance.search(keyword).then((result: SearchResult) => {
            if (result.quotes.length === 0) {
                this.logger.warn(`${this.namespace} - No ticker found for keyword ${keyword}`)
                this.eventBus.publish(`${this.namespace}::${HistoricalDataEventNames.NOT_FOUND}`, { keyword })
            } else if (result.quotes[0]) {
                this.logger.info(`${this.namespace} - Found ticker ${result.quotes[0].symbol} for keyword ${keyword}`)
                this.eventBus.publish(`${this.namespace}::${HistoricalDataEventNames.FOUND}`, { ticker: result.quotes[0].symbol })
            }
         })
        .catch((error) => {
            this.logger.error(`${this.namespace} - Error searching ticker by keyword ${keyword}: ${error.message}`)
        })
    }

    subscribe(event: HistoricalDataEvent, callback: (data: unknown) => void): void {
        this.eventBus.subscribe(`${this.namespace}::${event}`, callback as (data: unknown) => void)
    }

}