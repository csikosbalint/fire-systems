import { HistoricalDataEventNames } from '@ports/events.js'
import type { HistoricalData, HistoricalDataEvent } from '@ports/types.js'
import type { IEventBus } from '@shared/IEventBus.js'
import type { Logger } from '@shared/Logger.js'
import YahooFinance from 'yahoo-finance2'

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

    subscribe(event: HistoricalDataEvent, callback: (data: unknown) => void): void {
        this.eventBus.subscribe(`${this.namespace}::${event}`, callback as (data: unknown) => void)
    }

}