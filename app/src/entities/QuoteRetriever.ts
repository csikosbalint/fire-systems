import { HistoricalDataEventNames } from '@ports/events.js'
import type { HistoricalData, HistoricalDataEvent } from '@ports/types.js'
import type { IEventBus } from '@shared/IEventBus.js'
import type { Logger } from '@shared/Logger.js'
import YahooFinance from 'yahoo-finance2'

export class QuoteRetriever {
    private namespace = 'QuoteRetriever'
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

    async retrieve({startDate, endDate, ticker }: { startDate: Date, endDate: Date, ticker: string }): Promise<HistoricalData[]> {
        const result =  this.yahooFinance.chart(ticker, {
            period1: startDate,
            period2: endDate,
            interval: '1d',
        })
        return result.then((data) => {
            this.logger.info(`${this.namespace} - Successfully retrieved historical data for ticker ${ticker} from Yahoo Finance`)
            const historicalData = data.quotes
                .filter((item) => item.close !== null && item.date !== null)
            this.eventBus.publish(`${this.namespace}::${HistoricalDataEventNames.COMPLETED}`, {data: historicalData})
            return historicalData as unknown as HistoricalData[]
        })
        .catch((error) => {
            this.eventBus.publish(`${this.namespace}::${HistoricalDataEventNames.ERROR}`, { error: error.message })
            this.logger.error(`${this.namespace} - Error retrieving historical data for ticker ${ticker}: ${error.message}`)
            throw error
        })
    }

    subscribe(event: HistoricalDataEvent, callback: (data: unknown) => void): void {
        this.eventBus.subscribe(`${this.namespace}::${event}`, callback as (data: unknown) => void)
    }

}